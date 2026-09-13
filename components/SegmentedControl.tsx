'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId, useRef, type ComponentType, type KeyboardEvent, type SVGProps } from 'react';

import { moveTransition } from './motion';
import styles from './SegmentedControl.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * SegmentedControl — Design System, strona „Segment control” (node 349:757):
 * „Segmented control” (2–4 opcje, 320 × 40) z „Segmented control item” 32 px.
 * Marki aktywnego segmentu: Uniwersal (białe tło), Estigroup (#3582ce),
 * Estimoto (żółta ramka).
 *
 * SPECYFIKACJA ANIMACJI — w Figmie brak animacji; propozycja we wspólnym stylu
 * (components/motion.ts), tak jak tło aktywnej strony w paginacji:
 *
 *   tło aktywnego segmentu jedzie do wybranego | 250 ms, cubic-bezier(0.22, 1, 0.36, 1)
 *   kolor etykiety i ikony (muted ↔ base)      | 250 ms, ta sama krzywa (CSS)
 *   hover: kolor etykiety; na aktywnym — tło   | 150 ms (CSS)
 *   wciśnięty aktywny segment: tło od razu, powrót 150 ms
 *
 * prefers-reduced-motion: tło przeskakuje bez ruchu.
 *
 * Dostępność: radiogroup — Tab wchodzi na wybrany segment, strzałki zmieniają wybór.
 * ──────────────────────────────────────────────────────────────────────────── */

export type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

export type SegmentedControlBrand = 'uniwersal' | 'estigroup' | 'estimoto';

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  /** Etykieta grupy dla czytników ekranu. */
  label: string;
  brand?: SegmentedControlBrand;
  className?: string;
};

export default function SegmentedControl({
  options,
  value,
  onChange,
  label,
  brand = 'uniwersal',
  className,
}: SegmentedControlProps) {
  const prefersReducedMotion = useReducedMotion();
  const indicatorId = `${useId()}-indicator`;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const enabled = options.flatMap((option, index) => (option.disabled ? [] : [index]));
  const activeIndex = options.findIndex((option) => option.value === value);
  // Tab musi gdzieś wejść, nawet gdy żadna opcja nie jest wybrana.
  const tabStop = activeIndex !== -1 && !options[activeIndex].disabled ? activeIndex : enabled[0];

  const select = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== value) onChange(option.value);
    buttons.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const position = enabled.indexOf(index);
    let next: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = enabled[(position + 1) % enabled.length];
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = enabled[(position - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-brand={brand}
      className={className ? `${styles.control} ${className}` : styles.control}
    >
      {options.map((option, index) => {
        const isActive = index === activeIndex;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={index === tabStop ? 0 : -1}
            disabled={option.disabled}
            className={styles.item}
            onClick={() => select(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {isActive ? (
              <motion.span
                layoutId={indicatorId}
                className={styles.indicator}
                transition={prefersReducedMotion ? { duration: 0 } : moveTransition}
              />
            ) : null}
            {Icon ? <Icon className={styles.icon} aria-hidden="true" focusable="false" /> : null}
            <span className={styles.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
