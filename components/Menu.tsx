'use client';

import { motion, useReducedMotion, type HTMLMotionProps, type Transition, type Variants } from 'framer-motion';
import type { Ref } from 'react';

import styles from './Menu.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * SPECYFIKACJA ANIMACJI — Select Menu (menu rozwijane)
 *
 * Wygląd: Design System, strona „Select” (node 81:993). Użycie: Platform for
 * dealers, 2130:17715 — Select „Rocznik” i menu akcji pod przyciskiem „⋯”.
 *
 * W Figmie menu nie ma animacji — wartości poniżej to propozycja do
 * potwierdzenia. Oba warianty mają te same czasy i krzywe; różni je kierunek,
 * w którym menu rośnie.
 *
 * Pojawienie się (otwarcie):
 *   opacity : 0 → 1         | 150 ms, ease-out
 *   y       : −4 px → 0     | 200 ms, cubic-bezier(0.16, 1, 0.3, 1)
 *   Select  : scaleY 0.96 → 1, transform-origin: top
 *             — tylko w pionie: menu ma szerokość pola, więc jego krawędzie
 *               muszą się z nim zgadzać przez całą animację
 *   Button  : scale 0.95 → 1, transform-origin: top right
 *             — menu jest wyrównane do prawej krawędzi przycisku i z niej wyrasta
 *
 * Zamknięcie (wybór, klik poza menu, Esc, Tab):
 *   wszystkie właściwości wracają do wartości startowych
 *   100 ms, cubic-bezier(0.4, 0, 1, 1) — 2× szybciej niż otwarcie, żeby po
 *   wyborze interfejs od razu wrócił do użytkownika
 *
 * prefers-reduced-motion: bez ruchu, sam fade 100 ms w obie strony.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Szybki start i długie wyhamowanie — menu „dojeżdża” na miejsce. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Przyspiesza do końca — przy zamknięciu menu „odjeżdża”. */
const EASE_IN = [0.4, 0, 1, 1] as const;

const openTransition: Transition = {
  opacity: { duration: 0.15, ease: 'easeOut' },
  default: { duration: 0.2, ease: EASE_OUT_EXPO },
};

const closeTransition: Transition = { duration: 0.1, ease: EASE_IN };

/** Menu pod polem Select. */
export const selectMenuMotion: Variants = {
  closed: { opacity: 0, y: -4, scaleY: 0.96, transition: closeTransition },
  open: { opacity: 1, y: 0, scaleY: 1, transition: openTransition },
};

/** Menu pod przyciskiem. */
export const buttonMenuMotion: Variants = {
  closed: { opacity: 0, y: -4, scale: 0.95, transition: closeTransition },
  open: { opacity: 1, y: 0, scale: 1, transition: openTransition },
};

/** Wariant bez ruchu — dla użytkowników z prefers-reduced-motion: reduce. */
export const menuMotionReduced: Variants = {
  closed: { opacity: 0, transition: { duration: 0.1 } },
  open: { opacity: 1, transition: { duration: 0.1 } },
};

export type MenuPanelProps = HTMLMotionProps<'div'> & {
  /** Pod czym otwiera się menu — decyduje o pozycji i kierunku wzrostu. */
  placement: 'select' | 'button';
  ref?: Ref<HTMLDivElement>;
};

/**
 * Panel menu („Select Menu”). Musi być bezpośrednim dzieckiem <AnimatePresence>
 * z `key` — wtedy animuje otwarcie przy zamontowaniu i zamknięcie przy odmontowaniu.
 */
export function MenuPanel({ placement, className, ...props }: MenuPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? menuMotionReduced
    : placement === 'select'
      ? selectMenuMotion
      : buttonMenuMotion;

  return (
    <motion.div
      className={[styles.panel, styles[placement], className].filter(Boolean).join(' ')}
      variants={variants}
      initial="closed"
      animate="open"
      exit="closed"
      {...props}
    />
  );
}
