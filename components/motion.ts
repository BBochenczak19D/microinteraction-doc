import type { Transition } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────────
 * WSPÓLNY STYL ANIMACJI
 *
 * Dla komponentów, które w Figmie nie mają animacji (menu, paginacja) —
 * propozycja do potwierdzenia. Subtelnie i spokojnie:
 *
 *   pojawienie się, ruch : 250 ms, cubic-bezier(0.22, 1, 0.36, 1) — ease-out
 *   fade przy pojawieniu : 200 ms, ta sama krzywa (element widać, zanim dojedzie)
 *   zniknięcie           : 150 ms, cubic-bezier(0.4, 0, 1, 1) — ease-in
 *   zmiana stanu         : 150 ms, ease-out (hover, fokus, wciśnięcie — w CSS)
 *   dystans              : 2 px
 *   skala                : 0.98 → 1
 *
 * Zasady: bez sprężyn i odbić; zniknięcie krótsze od pojawienia się; element
 * rośnie albo wjeżdża od strony, z której przychodzi (transform-origin, kierunek).
 * prefers-reduced-motion: bez ruchu, same fade'y w tych samych czasach.
 *
 * Te same wartości w CSS: zmienne --motion-* w app/globals.css.
 * Toast ma własne wartości z eksportu Figmy — nie podlega tym tokenom.
 * ──────────────────────────────────────────────────────────────────────────── */

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;

/** Czasy w sekundach (framer-motion). */
export const DURATION = {
  enter: 0.25,
  fade: 0.2,
  exit: 0.15,
  state: 0.15,
} as const;

/** Dystans ruchu przy pojawieniu się i zniknięciu, px. */
export const DISTANCE = 2;

/** Skala startowa przy pojawieniu się. */
export const SCALE = 0.98;

/** Pojawienie się: fade krótszy od ruchu. */
export const enterTransition: Transition = {
  opacity: { duration: DURATION.fade, ease: EASE_OUT },
  default: { duration: DURATION.enter, ease: EASE_OUT },
};

export const exitTransition: Transition = { duration: DURATION.exit, ease: EASE_IN };

/** Przesunięcie elementu, który cały czas jest widoczny (np. tło aktywnej strony). */
export const moveTransition: Transition = { duration: DURATION.enter, ease: EASE_OUT };

export const reducedEnterTransition: Transition = { duration: DURATION.fade, ease: EASE_OUT };
export const reducedExitTransition: Transition = { duration: DURATION.exit, ease: EASE_IN };
