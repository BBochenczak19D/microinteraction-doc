'use client';

import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
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
 * Wyjście (exit): celowo BRAK — do doprojektowania.
 *
 * prefers-reduced-motion: bez ruchu, sam fade 150 ms.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Krzywa wyeksportowana z Figmy dla segmentu opacity (aproksymacja springa). */
const FIGMA_SPRING_EASE = (t: number) =>
  1 - Math.exp(-t * 11.1801) * (Math.cos(t * 0.1582) + 70.6911 * Math.sin(t * 0.1582));

/** Dystans, jaki toast pokonuje w pionie przy wejściu (px). */
const ENTER_OFFSET_Y = -51;

export const toastMotion: Variants = {
  hidden: {
    opacity: 0,
    y: ENTER_OFFSET_Y,
  },
  visible: {
    opacity: [0, 0, 1],
    y: 0,
    transition: {
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
    },
  },
};

/** Wariant bez ruchu — dla użytkowników z prefers-reduced-motion: reduce. */
export const toastMotionReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
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
 * import Toast from '@/components/Toast';
 *
 * {isOpen && <Toast message="Oznaczono Ducati HD883 jako sprzedany" onClose={close} />}
 *
 * Animacja wejścia odpala się przy zamontowaniu komponentu.
 * Wyjścia jeszcze nie ma — po dodaniu wariantu `exit` trzeba owinąć
 * całość w <AnimatePresence>.
 *
 * Pozycjonowanie (fixed / top / z-index) należy do kontenera toastów,
 * nie do samego komponentu.
 */
