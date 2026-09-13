'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import Select from '@/components/Select';

import styles from './MenuDemo.module.css';

const YEARS = Array.from({ length: 18 }, (_, index) => {
  const year = String(2025 - index);
  return { value: year, label: year };
});

/** Najpierw widać zamknięte pole, potem otwarcie — także po „Odtwórz ponownie”. */
const AUTO_OPEN_DELAY = 600;

type SelectDemoProps = {
  /** „open” — menu otwiera się samo, gdy scena wjedzie w ekran; „close” — startuje otwarte, bez animacji. */
  mode: 'open' | 'close';
};

/** Podgląd do dokumentacji: prawdziwy Select, rok można wybrać myszą albo klawiaturą. */
export default function SelectDemo({ mode }: SelectDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const userInteracted = useRef(false);
  const [isOpen, setIsOpen] = useState(mode === 'close');
  const [year, setYear] = useState<string | null>(mode === 'close' ? '2019' : null);

  useEffect(() => {
    if (mode !== 'open' || !isInView) return;
    const timer = window.setTimeout(() => {
      if (!userInteracted.current) setIsOpen(true);
    }, AUTO_OPEN_DELAY);
    return () => window.clearTimeout(timer);
  }, [mode, isInView]);

  let hint = 'Kliknij pole, żeby otworzyć menu.';
  if (isOpen) hint = 'Wybierz rok, kliknij poza menu albo naciśnij Esc.';
  else if (mode === 'close') hint = 'Menu zamknięte — „Odtwórz ponownie” otwiera je znowu.';

  return (
    <div ref={ref} className={styles.demo}>
      <div className={styles.selectSlot}>
        <Select
          label="Rocznik"
          placeholder="Wybierz rocznik"
          options={YEARS}
          value={year}
          onChange={setYear}
          open={isOpen}
          onOpenChange={(next) => {
            userInteracted.current = true;
            setIsOpen(next);
          }}
        />
      </div>
      <p className={styles.hint} aria-live="polite">
        {hint}
      </p>
    </div>
  );
}
