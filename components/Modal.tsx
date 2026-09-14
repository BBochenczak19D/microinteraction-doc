'use client';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { LoaderIcon } from './icons';
import {
  dialogMotion,
  overlayMotion,
  panelMotionReduced,
  sheetMotion,
  viewMotion,
  viewMotionReduced,
} from './motion';
import styles from './Modal.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * Modal — Design System, strona „Bottom sheet” (node 803:168):
 * „BottomSheet” Device=Mobile (panel z dołu, górne rogi 16) i Device=Dekstop
 * (okno 1469 × 776, rogi 16) + „BottomSheet / ActionButtons” Type=Action buttons
 * i Type=Loader. Figma: „Use for simple data entry or simple feedback”.
 *
 * SPECYFIKACJA ANIMACJI — w Figmie brak animacji; propozycja we wspólnym stylu
 * (components/motion.ts):
 *
 * Mobile — otwarcie (przepis sheetMotion):
 *   panel : y 100% → 0     | 350 ms, cubic-bezier(0.22, 1, 0.36, 1) — wjeżdża zza dolnej krawędzi
 *   tło   : opacity 0 → 1  | 350 ms, ta sama krzywa
 * Mobile — zamknięcie: panel y → 100%, tło → 0 | 250 ms, cubic-bezier(0.4, 0, 1, 1)
 *
 * Web — otwarcie (przepis dialogMotion):
 *   okno  : opacity 0 → 1 (200 ms), scale 0.98 → 1 (250 ms), ease-out, od środka
 *   tło   : opacity 0 → 1 (200 ms)
 * Web — zamknięcie: okno i tło wracają do wartości startowych | 150 ms, ease-in
 *
 * Zapisywanie — Type=Action buttons → Type=Loader (przepis viewMotion):
 *   przyciski gasną (150 ms), loader dorasta z 0.98 i się pojawia (200 / 250 ms)
 *   wysokość stopki: 69 → 88 px na desktopie | 250 ms, ease-out (na mobile obie mają 124 px)
 *   loader: pełny obrót w 1.2 s, liniowo, do końca zapisu; po odpowiedzi modal się zamyka
 *
 * prefers-reduced-motion: panel, okno i tło tylko gasną i się pojawiają; stopka zmienia
 * wysokość bez animacji; loader dalej się obraca (to informacja o stanie, nie ozdoba).
 *
 * Zamykanie: ×, klik w tło, Esc (gdy fokus jest w modalu), „Anuluj”. W trakcie zapisu
 * modala nie da się zamknąć, a formularz jest wyłączony (inert).
 * ──────────────────────────────────────────────────────────────────────────── */

export type ModalDevice = 'mobile' | 'desktop';

export type ModalProps = {
  open: boolean;
  /** ×, klik w tło, Esc, „Anuluj”. W trakcie zapisu nie jest wywoływane. */
  onClose: () => void;
  /** Mobile — panel z dołu (bottom sheet); desktop — okno na środku. */
  device: ModalDevice;
  /** Tytuł w nagłówku; `<em>` dostaje kolor akcentu, np. <>Edytuj: <em>dane pojazdu</em></>. */
  title: ReactNode;
  children: ReactNode;
  /** „Zapisz”. Bez tego stopka z przyciskami się nie renderuje (Figma: showActionButtons). */
  onSave?: () => void;
  /** Trwa zapis — stopka pokazuje loader (Type=Loader). */
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  savingLabel?: string;
  closeLabel?: string;
  /** Wewnątrz najbliższego elementu z position: relative zamiast na całym oknie (podgląd w dokumentacji). */
  contained?: boolean;
  /** Animacja otwarcia, gdy modal jest otwarty już przy montowaniu. */
  animateOnMount?: boolean;
  /** Fokus do modala po otwarciu i z powrotem po zamknięciu. Modal otwarty z kodu (autoplay) — false. */
  manageFocus?: boolean;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, contained = false, animateOnMount = true, ...props }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const layer = <AnimatePresence initial={animateOnMount}>{open ? <ModalLayer key="modal" contained={contained} {...props} /> : null}</AnimatePresence>;

  if (contained) return layer;
  return mounted ? createPortal(layer, document.body) : null;
}

type ModalLayerProps = Omit<ModalProps, 'open' | 'animateOnMount'>;

function ModalLayer({
  onClose,
  device,
  title,
  children,
  onSave,
  saving = false,
  saveLabel = 'Zapisz',
  cancelLabel = 'Anuluj',
  savingLabel = 'Zapisywanie zmian',
  closeLabel = 'Zamknij',
  contained = false,
  manageFocus = true,
}: ModalLayerProps) {
  const prefersReducedMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const focusBefore = useRef<HTMLElement | null>(null);
  const focusManaged = useRef(manageFocus);

  const requestClose = () => {
    if (!saving) onClose();
  };

  // Po otwarciu: fokus do modala i blokada przewijania strony (poza podglądem w ramce).
  // Element sprzed otwarcia zapamiętany raz — powtórny przebieg efektu (StrictMode) widziałby już fokus w modalu.
  useEffect(() => {
    const active = document.activeElement;
    if (!focusBefore.current && active instanceof HTMLElement && active !== document.body && !dialogRef.current?.contains(active)) {
      focusBefore.current = active;
    }
    if (focusManaged.current) dialogRef.current?.focus({ preventScroll: true });

    const root = document.documentElement;
    if (!contained) root.style.overflow = 'hidden';
    return () => {
      if (!contained) root.style.overflow = '';
    };
  }, [contained]);

  // Zamknięcie zaczyna się od razu: fokus wraca, zanim panel skończy odjeżdżać.
  useEffect(() => {
    if (!isPresent && focusManaged.current && focusBefore.current?.isConnected) {
      focusBefore.current.focus({ preventScroll: true });
    }
  }, [isPresent]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (event.defaultPrevented) return; // pierwsze Esc zamknęło tooltip
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== 'Tab') return;

    // Tab zostaje w modalu.
    const focusables = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (element) => !element.closest('[inert]'),
    );
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const isMobile = device === 'mobile';

  return (
    <div className={styles.layer} data-contained={contained} inert={!isPresent}>
      <motion.div
        className={styles.overlay}
        custom={isMobile && !prefersReducedMotion ? 'sheet' : 'dialog'}
        variants={overlayMotion}
        initial="closed"
        animate="open"
        exit="closed"
        onClick={requestClose}
        aria-hidden="true"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={saving}
        tabIndex={-1}
        className={isMobile ? styles.sheet : styles.dialog}
        variants={prefersReducedMotion ? panelMotionReduced : isMobile ? sheetMotion : dialogMotion}
        initial="closed"
        animate="open"
        exit="closed"
        onKeyDown={onKeyDown}
      >
        <header className={styles.header}>
          {isMobile ? null : <span className={styles.headerSpacer} aria-hidden="true" />}
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label={closeLabel} disabled={saving} onClick={requestClose}>
            <XMarkIcon className={styles.closeIcon} aria-hidden="true" focusable="false" />
          </button>
        </header>

        <div className={styles.body} inert={saving}>
          <div className={styles.bodyContent}>{children}</div>
        </div>

        {onSave ? (
          <ModalFooter
            isMobile={isMobile}
            saving={saving}
            onSave={onSave}
            onCancel={requestClose}
            saveLabel={saveLabel}
            cancelLabel={cancelLabel}
            savingLabel={savingLabel}
            reducedMotion={!!prefersReducedMotion}
          />
        ) : null}
      </motion.div>
    </div>
  );
}

type ModalFooterProps = {
  isMobile: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  cancelLabel: string;
  savingLabel: string;
  reducedMotion: boolean;
};

/** „BottomSheet / ActionButtons”: przyciski albo loader w tym samym miejscu. */
function ModalFooter({ isMobile, saving, onSave, onCancel, saveLabel, cancelLabel, savingLabel, reducedMotion }: ModalFooterProps) {
  const actionsRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  // Stany leżą absolutnie, a wysokość stopki goni ten, który się pojawia (69 ↔ 88 px na desktopie).
  useLayoutEffect(() => {
    const node = saving ? loaderRef.current : actionsRef.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [saving, isMobile]);

  const variants = reducedMotion ? viewMotionReduced : viewMotion;
  const save = (
    <button type="button" className={`${styles.button} ${styles.primary}`} onClick={onSave}>
      {saveLabel}
    </button>
  );
  const cancel = (
    <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={onCancel}>
      {cancelLabel}
    </button>
  );

  return (
    <div className={styles.footer} style={{ height }}>
      <span className={styles.srOnly} role="status">
        {saving ? savingLabel : ''}
      </span>

      <AnimatePresence initial={false}>
        {saving ? (
          <motion.div
            key="saving"
            ref={loaderRef}
            className={styles.saving}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            aria-hidden="true"
          >
            <LoaderIcon className={styles.loader} spinClassName={styles.spin} focusable="false" />
            <span className={styles.savingLabel}>{savingLabel}</span>
          </motion.div>
        ) : (
          <motion.div key="actions" ref={actionsRef} className={styles.actions} variants={variants} initial="enter" animate="center" exit="exit">
            {/* Mobile: „Zapisz” nad „Anuluj”; desktop: „Anuluj” z lewej — kolejność Tab jak na ekranie */}
            {isMobile ? (
              <>
                {save}
                {cancel}
              </>
            ) : (
              <>
                {cancel}
                {save}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
