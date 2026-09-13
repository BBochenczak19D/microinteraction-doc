'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import DatePicker, { Calendar, formatDate, type CalendarView } from '@/components/DatePicker';

import styles from './DatePickerDemo.module.css';

/** Jak w Figmie: październik 2023, dzisiaj 6, wybrany 11. */
const TODAY = new Date(2023, 9, 6);
const SELECTED = new Date(2023, 9, 11);
const OCTOBER = new Date(2023, 9, 1);

/** Najpierw widać stan startowy, potem zmianę — także po „Odtwórz ponownie”. */
const AUTO_PLAY_DELAY = 600;

type DatePickerDemoProps = {
  /**
   * Zmiana startuje sama, gdy scena wjedzie w ekran:
   * „popover” — kalendarz otwiera się pod polem; „month” — przechodzi na listopad;
   * „day” — wybór przechodzi z 11 na 18; „view” — kalendarz pokazuje miesiące.
   */
  mode: 'popover' | 'month' | 'day' | 'view';
};

/** Podgląd do dokumentacji: prawdziwy date picker, działa myszą i klawiaturą. */
export default function DatePickerDemo({ mode }: DatePickerDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const userInteracted = useRef(false);
  const [value, setValue] = useState<Date | null>(SELECTED);
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(OCTOBER);
  const [view, setView] = useState<CalendarView>('days');

  useEffect(() => {
    if (!isInView) return;
    const timer = window.setTimeout(() => {
      if (userInteracted.current) return;
      if (mode === 'popover') setIsOpen(true);
      if (mode === 'month') setMonth(new Date(2023, 10, 1));
      if (mode === 'day') setValue(new Date(2023, 9, 18));
      if (mode === 'view') setView('months');
    }, AUTO_PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [mode, isInView]);

  const byUser =
    <T,>(setter: (next: T) => void) =>
    (next: T) => {
      userInteracted.current = true;
      setter(next);
    };

  if (mode === 'popover') {
    let hint = 'Kliknij pole, żeby otworzyć kalendarz.';
    if (isOpen) hint = 'Wybierz dzień, kliknij poza kalendarzem albo naciśnij Esc.';
    else if (value) hint = `Data: ${formatDate(value)} — kliknij pole, żeby otworzyć kalendarz.`;

    return (
      <div ref={ref} className={styles.demo}>
        <div className={styles.popoverSlot}>
          <DatePicker
            label="Data sprzedaży"
            value={value}
            onChange={byUser(setValue)}
            open={isOpen}
            onOpenChange={byUser(setIsOpen)}
            today={TODAY}
          />
        </div>
        <p className={styles.hint} aria-live="polite">
          {hint}
        </p>
      </div>
    );
  }

  const hints: Record<Exclude<DatePickerDemoProps['mode'], 'popover'>, string> = {
    month: 'Strzałki w nagłówku albo PageUp / PageDown zmieniają miesiąc.',
    day: 'Kliknij inny dzień albo przejdź po dniach strzałkami.',
    view:
      view === 'days'
        ? 'Kliknij nazwę miesiąca albo rok w nagłówku.'
        : view === 'months'
          ? 'Wybierz miesiąc albo kliknij rok, żeby przejść do lat.'
          : 'Wybierz rok — kalendarz wróci do miesięcy.',
  };

  return (
    <div ref={ref} className={styles.demo}>
      <Calendar
        value={value}
        onChange={byUser(setValue)}
        month={month}
        onMonthChange={byUser(setMonth)}
        view={view}
        onViewChange={byUser(setView)}
        today={TODAY}
      />
      <p className={styles.hint} aria-live="polite">
        {hints[mode]}
      </p>
    </div>
  );
}
