import type { Transition, Variants } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────────────
 * WSPÓLNY STYL ANIMACJI
 *
 * Dla komponentów, które w Figmie nie mają animacji (menu, paginacja,
 * segmented control, date picker, tooltip, modal) — propozycja do potwierdzenia.
 * Subtelnie i spokojnie:
 *
 *   pojawienie się, ruch : 250 ms, cubic-bezier(0.22, 1, 0.36, 1) — ease-out
 *   fade przy pojawieniu : 200 ms, ta sama krzywa (element widać, zanim dojedzie)
 *   zniknięcie           : 150 ms, cubic-bezier(0.4, 0, 1, 1) — ease-in
 *   zmiana stanu         : 150 ms, ease-out (hover, fokus, wciśnięcie — w CSS)
 *   dystans              : 2 px
 *   skala                : 0.98 → 1
 *   panel zza krawędzi   : 350 ms wejście / 250 ms wyjście, te same krzywe (bottom sheet)
 *   loader               : pełny obrót w 1.2 s, liniowo
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
  /** Panel wjeżdżający zza krawędzi ekranu (bottom sheet) — dłuższa droga, więc dłuższy czas. */
  panelEnter: 0.35,
  panelExit: 0.25,
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

/** Przesunięcie elementu, który cały czas jest widoczny (tło aktywnej strony, segmentu, dnia). */
export const moveTransition: Transition = { duration: DURATION.enter, ease: EASE_OUT };

export const reducedEnterTransition: Transition = { duration: DURATION.fade, ease: EASE_OUT };
export const reducedExitTransition: Transition = { duration: DURATION.exit, ease: EASE_IN };

/* ── Gotowe przepisy ──────────────────────────────────────────────────────── */

/** Warstwa nad treścią (menu, kalendarz): pojawia się, opada 2 px i dorasta z 0.98. */
export const popoverMotion: Variants = {
  closed: { opacity: 0, y: -DISTANCE, scale: SCALE, transition: exitTransition },
  open: { opacity: 1, y: 0, scale: 1, transition: enterTransition },
};

export const popoverMotionReduced: Variants = {
  closed: { opacity: 0, transition: reducedExitTransition },
  open: { opacity: 1, transition: reducedEnterTransition },
};

/**
 * Zamiana treści w miejscu (numery paginacji, miesiąc w kalendarzu).
 * `custom` = kierunek: 1 dalej, −1 wstecz, 0 bez przesunięcia.
 * Znikająca treść nie łapie kliknięć.
 */
export const swapMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: DISTANCE * direction }),
  center: {
    opacity: 1,
    x: 0,
    pointerEvents: 'auto',
    transition: {
      opacity: { duration: DURATION.fade, ease: EASE_OUT },
      x: { duration: DURATION.enter, ease: EASE_OUT },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: -DISTANCE * direction,
    pointerEvents: 'none',
    transition: exitTransition,
  }),
};

export const swapMotionReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, pointerEvents: 'auto', transition: reducedEnterTransition },
  exit: { opacity: 0, pointerEvents: 'none', transition: reducedExitTransition },
};

/** Zmiana widoku w tym samym miejscu (dni → miesiące → lata): nowy dorasta z 0.98, stary gaśnie. */
export const viewMotion: Variants = {
  enter: { opacity: 0, scale: SCALE },
  center: { opacity: 1, scale: 1, pointerEvents: 'auto', transition: enterTransition },
  exit: { opacity: 0, pointerEvents: 'none', transition: exitTransition },
};

export const viewMotionReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, pointerEvents: 'auto', transition: reducedEnterTransition },
  exit: { opacity: 0, pointerEvents: 'none', transition: reducedExitTransition },
};

export type Side = 'top' | 'right' | 'bottom' | 'left';

/** Start 2 px bliżej elementu, przy którym warstwa się pojawia. */
const TOWARD_ANCHOR: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: DISTANCE },
  bottom: { x: 0, y: -DISTANCE },
  left: { x: DISTANCE, y: 0 },
  right: { x: -DISTANCE, y: 0 },
};

/**
 * Warstwa przy elemencie, z dowolnej strony (tooltip). `custom` = strona, po której leży warstwa.
 * popoverMotion to ten sam przepis dla strony „bottom”.
 */
export const anchoredMotion: Variants = {
  closed: (side: Side) => ({ opacity: 0, scale: SCALE, ...TOWARD_ANCHOR[side], transition: exitTransition }),
  open: { opacity: 1, scale: 1, x: 0, y: 0, transition: enterTransition },
};

export const anchoredMotionReduced: Variants = popoverMotionReduced;

export type OverlayPanel = 'sheet' | 'dialog';

/** Przyciemnienie pod modalem — gaśnie i pojawia się w czasie panelu. `custom` = rodzaj panelu. */
export const overlayMotion: Variants = {
  closed: (panel: OverlayPanel) => ({
    opacity: 0,
    transition: { duration: panel === 'sheet' ? DURATION.panelExit : DURATION.exit, ease: EASE_IN },
  }),
  open: (panel: OverlayPanel) => ({
    opacity: 1,
    transition: { duration: panel === 'sheet' ? DURATION.panelEnter : DURATION.fade, ease: EASE_OUT },
  }),
};

/** Panel z dolnej krawędzi (bottom sheet): wjeżdża o całą swoją wysokość i tą samą drogą wraca. */
export const sheetMotion: Variants = {
  closed: { y: '100%', transition: { duration: DURATION.panelExit, ease: EASE_IN } },
  open: { y: 0, transition: { duration: DURATION.panelEnter, ease: EASE_OUT } },
};

/** Okno na środku (modal na desktopie): pojawia się i dorasta z 0.98 od środka. */
export const dialogMotion: Variants = {
  closed: { opacity: 0, scale: SCALE, transition: exitTransition },
  open: { opacity: 1, scale: 1, transition: enterTransition },
};

/** Bottom sheet i okno bez ruchu — sam fade. */
export const panelMotionReduced: Variants = popoverMotionReduced;
