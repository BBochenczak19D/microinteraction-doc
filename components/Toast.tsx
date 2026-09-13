'use client';

import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { motion, useReducedMotion, type Transition, type Variants } from 'framer-motion';
import type { ComponentType, SVGProps } from 'react';

import styles from './Toast.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * SPECYFIKACJA ANIMACJI — źródło: Figma, node 2116:26967 ("Toast")
 *
 * Wejście (appear):
 *   opacity : 0 → 0 → 1   | duration 500 ms, times [0, 0.105, 1]
 *                           (pierwsze ~52 ms toast jest niewidoczny — hold,
 *                            potem fade in z krzywą sprężystą)
 *   y       : -38 → 13    | delta = 51 px w dół, spring, duration 500 ms,
 *                           bounce 0.25
 *
 *   W Figmie y to pozycja bezwzględna w ramce. W kodzie pozycję spoczynkową
 *   ustala layout, więc animujemy offset: -51 px → 0.
 *
 * Wyjście (exit) — po kliknięciu „×”: wejście w odwrotnym kierunku,
 * te same krzywe i czasy:
 *   opacity : 1 → 1 → 0   | duration 500 ms, times [0, 0.105, 1]
 *                           (przez ~52 ms toast jest jeszcze w pełni widoczny
 *                            i już rusza, potem gaśnie tą samą krzywą)
 *   y       : 0 → -51     | spring, duration 500 ms, bounce 0.25
 *
 *   Celowo nie jest to wejście odtworzone od końca: odwrócona w czasie
 *   sprężyna przez pierwsze ~350 ms prawie stoi (jej wygaszanie zamienia się
 *   w opóźnienie po kliknięciu). Tu toast rusza po ~30 ms, a po ~200 ms
 *   praktycznie go nie widać.
 *
 * prefers-reduced-motion: bez ruchu, sam fade 150 ms (wejście i wyjście).
 * ──────────────────────────────────────────────────────────────────────────── */

/** Krzywa wyeksportowana z Figmy dla segmentu opacity (aproksymacja springa). */
const FIGMA_SPRING_EASE = (t: number) =>
  1 - Math.exp(-t * 11.1801) * (Math.cos(t * 0.1582) + 70.6911 * Math.sin(t * 0.1582));

/** Dystans, jaki toast pokonuje w pionie przy wejściu (i z powrotem przy wyjściu), px. */
const ENTER_OFFSET_Y = -51;

/** Wspólne dla wejścia i wyjścia — różni się tylko kierunek zmian. */
const toastTransition: Transition = {
  opacity: {
    duration: 0.5,
    times: [0, 0.105, 1],
    ease: ['linear', FIGMA_SPRING_EASE],
  },
  y: {
    type: 'spring',
    duration: 0.5,
    bounce: 0.25,
  },
};

export const toastMotion: Variants = {
  hidden: {
    opacity: 0,
    y: ENTER_OFFSET_Y,
  },
  visible: {
    opacity: [0, 0, 1],
    y: 0,
    transition: toastTransition,
  },
  exit: {
    // null = bieżąca wartość: zamknięcie w trakcie wejścia nie mignie pełną opacity
    opacity: [null, null, 0],
    y: ENTER_OFFSET_Y,
    transition: toastTransition,
  },
};

/** Wariant bez ruchu — dla użytkowników z prefers-reduced-motion: reduce. */
export const toastMotionReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export type ToastProps = {
  /** Treść komunikatu, np. „Oznaczono Ducati HD883 jako sprzedany”. */
  message: string;
  /** Ikona statusu. Domyślnie heroicons-mini/check-circle (20 × 20). */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Wywoływane po kliknięciu „×”. Gdy brak — przycisk się nie renderuje. */
  onClose?: () => void;
  /** Etykieta a11y przycisku zamknięcia. */
  closeLabel?: string;
  className?: string;
};

export default function Toast({
  message,
  icon: Icon = CheckCircleIcon,
  onClose,
  closeLabel = 'Zamknij powiadomienie',
  className,
}: ToastProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className={className ? `${styles.toast} ${className}` : styles.toast}
      variants={prefersReducedMotion ? toastMotionReduced : toastMotion}
      initial="hidden"
      animate="visible"
      exit="exit"
      data-node-id="2116:26967"
    >
      <span className={styles.iconSlot}>
        <Icon className={styles.icon} aria-hidden="true" focusable="false" />
      </span>

      <div className={styles.content}>
        <p className={styles.text}>{message}</p>
      </div>

      {onClose ? (
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label={closeLabel}>
          <XMarkIcon className={styles.closeIcon} aria-hidden="true" focusable="false" />
        </button>
      ) : null}
    </motion.div>
  );
}

/* Użycie:
 *
 * import { AnimatePresence } from 'framer-motion';
 * import Toast from '@/components/Toast';
 *
 * <AnimatePresence>
 *   {isOpen && (
 *     <Toast key="toast" message="Oznaczono Ducati HD883 jako sprzedany" onClose={() => setIsOpen(false)} />
 *   )}
 * </AnimatePresence>
 *
 * Wejście odpala się przy zamontowaniu, wyjście przy odmontowaniu. Toast musi
 * być bezpośrednim dzieckiem <AnimatePresence> (z `key`) — bez tego znika
 * natychmiast, bez animacji wyjścia.
 *
 * Pozycjonowanie (fixed / top / z-index) należy do kontenera toastów,
 * nie do samego komponentu.
 */
