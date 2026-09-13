'use client';

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion';
import type { Ref } from 'react';

import {
  DISTANCE,
  SCALE,
  enterTransition,
  exitTransition,
  reducedEnterTransition,
  reducedExitTransition,
} from './motion';
import styles from './Menu.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * SPECYFIKACJA ANIMACJI — Select Menu (menu rozwijane)
 *
 * Wygląd: Design System, strona „Select” (node 81:993). Użycie: Platform for
 * dealers, 2130:17715 — Select „Rocznik” i menu akcji pod przyciskiem „⋯”.
 *
 * W Figmie menu nie ma animacji — wartości to propozycja we wspólnym stylu
 * (components/motion.ts). Oba warianty animują się tak samo; różni je tylko
 * punkt, z którego menu rośnie.
 *
 * Pojawienie się (otwarcie):
 *   opacity : 0 → 1         | 200 ms, cubic-bezier(0.22, 1, 0.36, 1)
 *   y       : −2 px → 0     | 250 ms, ta sama krzywa
 *   scale   : 0.98 → 1      | 250 ms, ta sama krzywa
 *   transform-origin: top (Select) / top right (Button — róg przycisku)
 *
 * Zamknięcie (wybór, klik poza menu, Esc, Tab):
 *   wszystkie właściwości wracają do wartości startowych
 *   150 ms, cubic-bezier(0.4, 0, 1, 1) — krócej niż otwarcie
 *
 * prefers-reduced-motion: bez ruchu, sam fade (200 ms / 150 ms).
 * ──────────────────────────────────────────────────────────────────────────── */

export const menuMotion: Variants = {
  closed: { opacity: 0, y: -DISTANCE, scale: SCALE, transition: exitTransition },
  open: { opacity: 1, y: 0, scale: 1, transition: enterTransition },
};

/** Wariant bez ruchu — dla użytkowników z prefers-reduced-motion: reduce. */
export const menuMotionReduced: Variants = {
  closed: { opacity: 0, transition: reducedExitTransition },
  open: { opacity: 1, transition: reducedEnterTransition },
};

export type MenuPanelProps = HTMLMotionProps<'div'> & {
  /** Pod czym otwiera się menu — decyduje o pozycji i punkcie, z którego rośnie. */
  placement: 'select' | 'button';
  ref?: Ref<HTMLDivElement>;
};

/**
 * Panel menu („Select Menu”). Musi być bezpośrednim dzieckiem <AnimatePresence>
 * z `key` — wtedy animuje otwarcie przy zamontowaniu i zamknięcie przy odmontowaniu.
 */
export function MenuPanel({ placement, className, ...props }: MenuPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={[styles.panel, styles[placement], className].filter(Boolean).join(' ')}
      variants={prefersReducedMotion ? menuMotionReduced : menuMotion}
      initial="closed"
      animate="open"
      exit="closed"
      {...props}
    />
  );
}
