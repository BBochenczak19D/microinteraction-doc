'use client';

import { CalendarDaysIcon } from '@heroicons/react/16/solid';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { TriangleLeftMiniIcon, TriangleRightMiniIcon, XMarkFieldIcon } from './icons';
import {
  moveTransition,
  popoverMotion,
  popoverMotionReduced,
  swapMotion,
  swapMotionReduced,
  viewMotion,
  viewMotionReduced,
} from './motion';
import { useControllable } from './useControllable';
import styles from './DatePicker.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * DatePicker — Design System, strona „Date picker” (node 94:13340):
 * „Date Picker Input” Large (44 px) + „Date Picker” Single (296 × 336) z
 * „Date Picker Selector”, „Date Picker Day”, „Date Picker Cell” 32 px oraz
 * widokami „Month selected” i „Year selected”.
 *
 * SPECYFIKACJA ANIMACJI — w Figmie brak animacji; propozycja we wspólnym stylu
 * (components/motion.ts).
 *
 * Otwarcie i zamknięcie kalendarza — przepis popoverMotion, jak menu:
 *   opacity 0 → 1 (200 ms), y −2 px → 0 i scale 0.98 → 1 (250 ms), ease-out,
 *   transform-origin: top left; zamknięcie 150 ms, ease-in
 *
 * Zmiana miesiąca (strzałki, klawiatura) — przepis swapMotion:
 *   dni i nagłówek: nowe wjeżdżają 2 px z kierunku zmiany (opacity 200 ms,
 *   x 250 ms), stare odjeżdżają 2 px i gasną (150 ms)
 *
 * Wybór dnia:
 *   tło wybranego dnia przejeżdża do nowego | 250 ms, cubic-bezier(0.22, 1, 0.36, 1)
 *   kolor cyfry 250 ms; hover tła 150 ms (CSS)
 *
 * Miesiące i lata (klik w nazwę miesiąca albo rok) — przepis viewMotion:
 *   nowy widok: opacity 0 → 1 (200 ms), scale 0.98 → 1 (250 ms); stary gaśnie (150 ms)
 *
 * prefers-reduced-motion: bez ruchu — same fade'y, tło dnia przeskakuje.
 * ──────────────────────────────────────────────────────────────────────────── */

const MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

const MONTHS_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

/** Tydzień od poniedziałku. */
const WEEKDAYS = [
  { short: 'P', long: 'poniedziałek' },
  { short: 'W', long: 'wtorek' },
  { short: 'Ś', long: 'środa' },
  { short: 'C', long: 'czwartek' },
  { short: 'P', long: 'piątek' },
  { short: 'S', long: 'sobota' },
  { short: 'N', long: 'niedziela' },
];

/** Widok lat: 7 rzędów × 4. */
const YEARS_PER_PAGE = 28;

/** Miejsce bieżącego roku na stronie lat — jak w Figmie: 2012 … 2023 … 2039. */
const YEAR_OFFSET = 11;

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const addMonths = (date: Date, months: number) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + months + 1, 0).getDate();
  return new Date(date.getFullYear(), date.getMonth() + months, Math.min(date.getDate(), lastDay));
};

const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && isSameMonth(a, b) && a.getDate() === b.getDate();

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const weekdayIndex = (date: Date) => (date.getDay() + 6) % 7;

/** 6 tygodni od poniedziałku — kalendarz ma zawsze tę samą wysokość, jak w Figmie. */
function getWeeks(month: Date): Date[][] {
  const start = addDays(startOfMonth(month), -weekdayIndex(startOfMonth(month)));
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}

/** dd.mm.rrrr — format pola z Figmy. */
export function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

const dayLabel = (date: Date) => `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;

/* ── Kalendarz ────────────────────────────────────────────────────────────── */

export type CalendarView = 'days' | 'months' | 'years';

export type CalendarProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  /** Widoczny miesiąc sterowany z zewnątrz. Bez tego kalendarz pilnuje go sam. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Widok sterowany z zewnątrz: dni, miesiące albo lata. */
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** Dzisiejsza data (kropka pod dniem). Domyślnie data z urządzenia. */
  today?: Date;
  /** Fokus na wybranym dniu zaraz po zamontowaniu — przy otwarciu przez użytkownika. */
  autoFocus?: boolean;
  className?: string;
};

export function Calendar({
  value,
  onChange,
  month: monthProp,
  onMonthChange,
  view: viewProp,
  onViewChange,
  today,
  autoFocus = false,
  className,
}: CalendarProps) {
  const prefersReducedMotion = useReducedMotion();
  const id = useId();
  const [deviceToday] = useState(() => new Date());
  const todayDate = today ?? deviceToday;

  const [month, setMonth] = useControllable(monthProp, startOfMonth(value ?? todayDate), onMonthChange);
  const [view, setView] = useControllable<CalendarView>(viewProp, 'days', onViewChange);
  const [yearsStart, setYearsStart] = useState(() => month.getFullYear() - YEAR_OFFSET);
  const [focusedDate, setFocusedDate] = useState(() => value ?? todayDate);

  const viewsRef = useRef<HTMLDivElement>(null);
  /** Po zmianie dnia z klawiatury (albo przy otwarciu) — fokus na dzień. */
  const focusDay = useRef(autoFocus);
  /** Po przejściu do miesięcy albo lat — fokus na zaznaczoną pozycję. */
  const focusView = useRef(false);

  // Kierunek ostatniej zmiany: 1 dalej, −1 wstecz, 0 przy zmianie widoku (bez przesunięcia).
  const navKey = view === 'days' ? monthIndex(month) : view === 'months' ? month.getFullYear() : yearsStart;
  const [previous, setPrevious] = useState({ view, navKey });
  const [direction, setDirection] = useState(0);
  if (previous.view !== view || previous.navKey !== navKey) {
    setPrevious({ view, navKey });
    setDirection(previous.view === view ? Math.sign(navKey - previous.navKey) : 0);
  }

  useEffect(() => {
    const views = viewsRef.current;
    if (!views) return;
    if (focusDay.current && view === 'days') {
      focusDay.current = false;
      views
        .querySelector<HTMLButtonElement>(`[data-month="${monthIndex(month)}"] [data-date="${dateKey(focusedDate)}"]`)
        ?.focus({ preventScroll: true });
    } else if (focusView.current) {
      focusView.current = false;
      views.querySelector<HTMLButtonElement>(`[data-view="${view}"] [data-selected="true"]`)?.focus({ preventScroll: true });
    }
  });

  const turnPage = (step: 1 | -1) => {
    if (view === 'days') setMonth(startOfMonth(addMonths(month, step)));
    else if (view === 'months') setMonth(new Date(month.getFullYear() + step, month.getMonth(), 1));
    else setYearsStart(yearsStart + step * YEARS_PER_PAGE);
  };

  const changeView = (next: CalendarView) => {
    if (next === 'years') setYearsStart(month.getFullYear() - YEAR_OFFSET);
    focusView.current = true;
    setView(next);
  };

  const selectDay = (date: Date) => {
    if (!isSameMonth(date, month)) setMonth(startOfMonth(date));
    setFocusedDate(date);
    onChange(date);
  };

  const selectMonth = (monthNumber: number) => {
    const next = new Date(month.getFullYear(), monthNumber, 1);
    setMonth(next);
    setFocusedDate(value && isSameMonth(value, next) ? value : next);
    focusDay.current = true;
    setView('days');
  };

  const selectYear = (year: number) => {
    setMonth(new Date(year, month.getMonth(), 1));
    focusView.current = true;
    setView('months');
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, (date: Date) => Date> = {
      ArrowLeft: (date) => addDays(date, -1),
      ArrowRight: (date) => addDays(date, 1),
      ArrowUp: (date) => addDays(date, -7),
      ArrowDown: (date) => addDays(date, 7),
      PageUp: (date) => addMonths(date, -1),
      PageDown: (date) => addMonths(date, 1),
      Home: (date) => addDays(date, -weekdayIndex(date)),
      End: (date) => addDays(date, 6 - weekdayIndex(date)),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const next = move(focusedDate);
    if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
    setFocusedDate(next);
    focusDay.current = true;
  };

  const weeks = getWeeks(month);
  const monthName = MONTHS[month.getMonth()];
  const year = month.getFullYear();
  // Tab wchodzi na dzień z fokusem, a gdy go nie widać — na wybrany albo pierwszy dzień miesiąca.
  const tabDate = weeks.flat().some((date) => isSameDay(date, focusedDate))
    ? focusedDate
    : value && isSameMonth(value, month)
      ? value
      : month;

  const swap = prefersReducedMotion ? swapMotionReduced : swapMotion;
  const viewVariants = prefersReducedMotion ? viewMotionReduced : viewMotion;
  const pageLabel = {
    days: ['Poprzedni miesiąc', 'Następny miesiąc'],
    months: ['Poprzedni rok', 'Następny rok'],
    years: ['Wcześniejsze lata', 'Późniejsze lata'],
  }[view];

  return (
    <div className={className ? `${styles.calendar} ${className}` : styles.calendar}>
      <div className={styles.selector}>
        <button type="button" className={`${styles.navButton} ${styles.navPrevious}`} aria-label={pageLabel[0]} onClick={() => turnPage(-1)}>
          <TriangleLeftMiniIcon className={styles.navIcon} aria-hidden="true" focusable="false" />
        </button>

        <div className={styles.title}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={`${view}-${navKey}`}
              className={styles.titleContent}
              custom={direction}
              variants={swap}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {view === 'days' ? (
                <button type="button" className={styles.titleButton} aria-label={`${monthName} — wybierz miesiąc`} onClick={() => changeView('months')}>
                  {monthName}
                </button>
              ) : null}
              {view !== 'years' ? (
                <button type="button" className={styles.titleButton} aria-label={`${year} — wybierz rok`} onClick={() => changeView('years')}>
                  {year}
                </button>
              ) : (
                <span className={styles.titleText}>
                  {yearsStart}–{yearsStart + YEARS_PER_PAGE - 1}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button type="button" className={`${styles.navButton} ${styles.navNext}`} aria-label={pageLabel[1]} onClick={() => turnPage(1)}>
          <TriangleRightMiniIcon className={styles.navIcon} aria-hidden="true" focusable="false" />
        </button>
      </div>

      <div ref={viewsRef} className={styles.views}>
        <AnimatePresence initial={false}>
          {view === 'days' ? (
            <motion.div key="days" data-view="days" className={styles.view} variants={viewVariants} initial="enter" animate="center" exit="exit">
              <div role="grid" aria-label={`${monthName} ${year}`} className={styles.daysGrid} onKeyDown={onGridKeyDown}>
                <div role="row" className={styles.row}>
                  {WEEKDAYS.map((weekday) => (
                    <div key={weekday.long} role="columnheader" aria-label={weekday.long} className={styles.weekday}>
                      <span aria-hidden="true">{weekday.short}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.stack}>
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={monthIndex(month)}
                      role="rowgroup"
                      data-month={monthIndex(month)}
                      className={styles.weeks}
                      custom={direction}
                      variants={swap}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      {weeks.map((week) => (
                        <div key={dateKey(week[0])} role="row" className={styles.row}>
                          {week.map((date) => {
                            const isSelected = isSameDay(date, value);
                            const isToday = isSameDay(date, todayDate);

                            return (
                              <div key={dateKey(date)} role="gridcell" aria-selected={isSelected} className={styles.gridCell}>
                                <button
                                  type="button"
                                  className={styles.cell}
                                  data-date={dateKey(date)}
                                  data-outside={!isSameMonth(date, month)}
                                  data-selected={isSelected}
                                  aria-label={dayLabel(date)}
                                  aria-current={isToday ? 'date' : undefined}
                                  tabIndex={isSameDay(date, tabDate) ? 0 : -1}
                                  onClick={() => selectDay(date)}
                                >
                                  {isSelected ? (
                                    <motion.span
                                      layoutId={`${id}-day-${monthIndex(month)}`}
                                      className={styles.selected}
                                      transition={prefersReducedMotion ? { duration: 0 } : moveTransition}
                                    />
                                  ) : null}
                                  <span className={styles.cellLabel}>{date.getDate()}</span>
                                  {isToday ? <span className={styles.todayDot} aria-hidden="true" /> : null}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : view === 'months' ? (
            <motion.div
              key="months"
              data-view="months"
              className={`${styles.view} ${styles.monthsGrid}`}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {MONTHS.map((name, index) => {
                const isCurrent = index === month.getMonth();
                return (
                  <button
                    key={name}
                    type="button"
                    className={styles.cell}
                    data-selected={isCurrent}
                    aria-pressed={isCurrent}
                    onClick={() => selectMonth(index)}
                  >
                    {isCurrent ? <span className={styles.selected} /> : null}
                    <span className={styles.cellLabel}>{name}</span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="years" data-view="years" className={styles.view} variants={viewVariants} initial="enter" animate="center" exit="exit">
              <div className={styles.stack}>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={yearsStart}
                    className={styles.yearsGrid}
                    custom={direction}
                    variants={swap}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
                      const yearOption = yearsStart + index;
                      const isCurrent = yearOption === year;
                      // Pierwszy i ostatni rząd przygaszone, jak w Figmie.
                      const isEdge = index < 4 || index >= YEARS_PER_PAGE - 4;
                      return (
                        <button
                          key={yearOption}
                          type="button"
                          className={styles.cell}
                          data-selected={isCurrent}
                          data-outside={isEdge && !isCurrent}
                          aria-pressed={isCurrent}
                          onClick={() => selectYear(yearOption)}
                        >
                          {isCurrent ? <span className={styles.selected} /> : null}
                          <span className={styles.cellLabel}>{yearOption}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Pole z kalendarzem ───────────────────────────────────────────────────── */

export type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  /** Etykieta pola dla czytników ekranu, np. „Data sprzedaży”. */
  label: string;
  placeholder?: string;
  /** Otwarcie sterowane z zewnątrz. Bez tego pole pilnuje stanu samo. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  today?: Date;
  className?: string;
};

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'dd.mm.rrrr',
  open,
  defaultOpen = false,
  onOpenChange,
  today,
  className,
}: DatePickerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const valueButtonRef = useRef<HTMLButtonElement>(null);
  /** Kalendarz otwarty przez użytkownika dostaje fokus; otwarty z kodu — nie. */
  const openedByUser = useRef(false);
  const calendarId = `${useId()}-calendar`;

  const openCalendar = () => {
    openedByUser.current = true;
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    openedByUser.current = false;
    setOpen(false);
    if (returnFocus) valueButtonRef.current?.focus();
  };

  const toggle = () => (isOpen ? close(false) : openCalendar());

  // Klik poza polem i kalendarzem zamyka.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  });

  return (
    <div ref={rootRef} className={className ? `${styles.datePicker} ${className}` : styles.datePicker}>
      <div className={styles.field} data-open={isOpen}>
        <button
          type="button"
          className={styles.fieldButton}
          aria-label="Otwórz kalendarz"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? calendarId : undefined}
          onClick={toggle}
        >
          <CalendarDaysIcon className={styles.fieldIcon} aria-hidden="true" focusable="false" />
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button
          ref={valueButtonRef}
          type="button"
          className={styles.value}
          data-placeholder={!value}
          aria-label={`${label}: ${value ? formatDate(value) : 'brak daty'}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={toggle}
        >
          {value ? formatDate(value) : placeholder}
        </button>
        {value ? (
          <button type="button" className={styles.fieldButton} aria-label="Wyczyść datę" onClick={() => onChange(null)}>
            <XMarkFieldIcon className={styles.fieldIcon} aria-hidden="true" focusable="false" />
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="calendar"
            id={calendarId}
            role="dialog"
            aria-label={`${label} — kalendarz`}
            className={styles.popover}
            variants={prefersReducedMotion ? popoverMotionReduced : popoverMotion}
            initial="closed"
            animate="open"
            exit="closed"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                close(true);
              }
            }}
          >
            <Calendar
              value={value}
              today={today}
              autoFocus={openedByUser.current}
              onChange={(date) => {
                onChange(date);
                close(true);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
