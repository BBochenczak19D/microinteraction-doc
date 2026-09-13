'use client';

import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import Pagination from '@/components/Pagination';

import styles from './PaginationDemo.module.css';

/** Najpierw widać stan startowy, potem zmianę — także po „Odtwórz ponownie”. */
const AUTO_PLAY_DELAY = 600;

const SETUP = {
  page: { pageCount: 9, start: 1, autoTo: 3 },
  shift: { pageCount: 20, start: 4, autoTo: 5 },
} as const;

type PaginationDemoProps = {
  /**
   * „page” — tło jedzie ze strony 1 na 3; „shift” — zakres przesuwa się ze strony 4 na 5
   * (obie zmiany startują same, gdy scena wjedzie w ekran); „states” — Compact i Mini do klikania.
   */
  mode: 'page' | 'shift' | 'states';
};

/** Podgląd do dokumentacji: prawdziwa paginacja, można klikać i przechodzić klawiaturą. */
export default function PaginationDemo({ mode }: PaginationDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const userInteracted = useRef(false);
  const setup = mode === 'states' ? null : SETUP[mode];
  const [page, setPage] = useState<number>(setup?.start ?? 1);
  const [compactPage, setCompactPage] = useState(1);
  const [miniPage, setMiniPage] = useState(1);

  useEffect(() => {
    if (!setup || !isInView) return;
    const timer = window.setTimeout(() => {
      if (!userInteracted.current) setPage(setup.autoTo);
    }, AUTO_PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [setup, isInView]);

  if (!setup) {
    return (
      <div ref={ref} className={styles.demo}>
        <div className={styles.variants}>
          <figure className={styles.variant}>
            <Pagination
              variant="compact"
              page={compactPage}
              pageCount={9}
              onPageChange={setCompactPage}
              label="Paginacja Compact"
            />
            <figcaption className={styles.caption}>Compact · strona {compactPage} z 9</figcaption>
          </figure>
          <figure className={styles.variant}>
            <Pagination variant="mini" page={miniPage} pageCount={9} onPageChange={setMiniPage} label="Paginacja Mini" />
            <figcaption className={styles.caption}>Mini · strona {miniPage} z 9</figcaption>
          </figure>
        </div>
        <p className={styles.hint}>Najedź i kliknij. Na pierwszej i ostatniej stronie strzałka jest wyłączona.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.demo}>
      <div className={styles.scroller}>
        <Pagination
          page={page}
          pageCount={setup.pageCount}
          onPageChange={(next) => {
            userInteracted.current = true;
            setPage(next);
          }}
        />
      </div>
      <p className={styles.hint} aria-live="polite">
        Strona {page} z {setup.pageCount} — {mode === 'shift' ? 'klikaj ›, żeby przesunąć zakres.' : 'kliknij inny numer.'}
      </p>
    </div>
  );
}
