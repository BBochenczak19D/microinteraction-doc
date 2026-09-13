'use client';

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';

import { DISTANCE, DURATION, EASE_IN, EASE_OUT, moveTransition } from './motion';
import styles from './Pagination.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * Pagination — Design System, strona „Pagination” (node 903:635):
 * „Pagination Item” 32 × 32 (Number, Prev, Next, Ellipsis) i warianty
 * Default (z wielokropkiem), Compact (3 strony), Mini (same strzałki).
 *
 * SPECYFIKACJA ANIMACJI — w Figmie brak animacji; propozycja we wspólnym stylu
 * (components/motion.ts).
 *
 * Zmiana strony:
 *   tło aktywnej strony jedzie do nowej | 250 ms, cubic-bezier(0.22, 1, 0.36, 1)
 *   kolor numeru (ciemny ↔ biały)       | 250 ms, ta sama krzywa (CSS)
 *
 * Przesunięcie zakresu (gdy zmieniają się widoczne numery):
 *   przyciski stoją w miejscu (key = pozycja), zmieniają się tylko numery
 *   nowy numer  : opacity 0 → 1 (200 ms), x ±2 px → 0 (250 ms), ease-out
 *   stary numer : opacity → 0, x → ∓2 px, 150 ms, ease-in
 *   kierunek ruchu = kierunek zmiany strony; tło aktywnej strony zostaje
 *
 * Stany przycisków (CSS): hover 150 ms; wciśnięta strzałka od razu, powrót
 * 150 ms; fokus 2 px.
 *
 * prefers-reduced-motion: tło przeskakuje, numery tylko wygasają i się pojawiają.
 * ──────────────────────────────────────────────────────────────────────────── */

export type PaginationVariant = 'default' | 'compact' | 'mini';

type Slot = number | 'ellipsis';

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * Pozycje paginacji. Default: 7 pozycji — 1 … (strona ±1) … ostatnia, więc
 * wielokropek nigdy nie zasłania jednej strony. Compact: okno 3 stron. Mini: brak.
 */
export function getSlots(page: number, pageCount: number, variant: PaginationVariant): Slot[] {
  if (variant === 'mini') return [];

  if (variant === 'compact') {
    if (pageCount <= 3) return range(1, pageCount);
    const start = Math.min(Math.max(page - 1, 1), pageCount - 2);
    return range(start, start + 2);
  }

  if (pageCount <= 7) return range(1, pageCount);
  if (page <= 4) return [...range(1, 5), 'ellipsis', pageCount];
  if (page >= pageCount - 3) return [1, 'ellipsis', ...range(pageCount - 4, pageCount)];
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];
}

const labelMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: DISTANCE * direction }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: DURATION.fade, ease: EASE_OUT },
      x: { duration: DURATION.enter, ease: EASE_OUT },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: -DISTANCE * direction,
    transition: { duration: DURATION.exit, ease: EASE_IN },
  }),
};

const labelMotionReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: DURATION.fade, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: DURATION.exit, ease: EASE_IN } },
};

export type PaginationProps = {
  /** Bieżąca strona, od 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  variant?: PaginationVariant;
  /** Etykieta nawigacji dla czytników ekranu. */
  label?: string;
  className?: string;
};

export default function Pagination({
  page,
  pageCount,
  onPageChange,
  variant = 'default',
  label = 'Paginacja',
  className,
}: PaginationProps) {
  const prefersReducedMotion = useReducedMotion();
  const indicatorId = `${useId()}-indicator`;
  const listRef = useRef<HTMLUListElement>(null);

  // Kierunek ostatniej zmiany strony: dalej = 1, wstecz = −1.
  const [previousPage, setPreviousPage] = useState(page);
  const [direction, setDirection] = useState(1);
  if (page !== previousPage) {
    setPreviousPage(page);
    setDirection(page > previousPage ? 1 : -1);
  }

  // Przyciski stoją, a numery pod nimi się zmieniają — fokus z numeru idzie więc za aktywną stroną.
  useEffect(() => {
    const list = listRef.current;
    const focused = document.activeElement;
    if (!list || !(focused instanceof HTMLElement) || !list.contains(focused) || focused.dataset.arrow) return;
    list.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus();
  }, [page]);

  const goTo = (next: number) => {
    if (next >= 1 && next <= pageCount && next !== page) onPageChange(next);
  };

  const arrowClassName = variant === 'mini' ? `${styles.arrow} ${styles.miniArrow}` : styles.arrow;

  return (
    <nav aria-label={label} className={className ? `${styles.pagination} ${className}` : styles.pagination}>
      <ul ref={listRef} className={styles.list}>
        <li>
          <button
            type="button"
            className={arrowClassName}
            data-arrow="prev"
            aria-label="Poprzednia strona"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
        </li>

        {getSlots(page, pageCount, variant).map((slot, index) => {
          const pageNumber = typeof slot === 'number' ? slot : null;
          const isCurrent = pageNumber === page;

          return (
            <li key={index} aria-hidden={pageNumber === null || undefined}>
              <button
                type="button"
                className={styles.item}
                disabled={pageNumber === null}
                aria-label={pageNumber === null ? undefined : `Strona ${pageNumber}`}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={pageNumber === null ? undefined : () => goTo(pageNumber)}
              >
                {isCurrent ? (
                  <motion.span
                    layoutId={indicatorId}
                    className={styles.indicator}
                    transition={prefersReducedMotion ? { duration: 0 } : moveTransition}
                  />
                ) : null}
                <span className={styles.label} aria-hidden="true">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.span
                      key={pageNumber ?? 'ellipsis'}
                      className={styles.labelText}
                      custom={direction}
                      variants={prefersReducedMotion ? labelMotionReduced : labelMotion}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      {pageNumber ?? '…'}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            className={arrowClassName}
            data-arrow="next"
            aria-label="Następna strona"
            disabled={page >= pageCount}
            onClick={() => goTo(page + 1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
