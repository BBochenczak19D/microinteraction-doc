'use client';

import { ListBulletIcon, MapIcon, Squares2X2Icon } from '@heroicons/react/16/solid';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import SegmentedControl, {
  type SegmentedControlBrand,
  type SegmentedControlOption,
} from '@/components/SegmentedControl';

import styles from './SegmentedControlDemo.module.css';

/** Najpierw widać stan startowy, potem przejazd tła — także po „Odtwórz ponownie”. */
const AUTO_PLAY_DELAY = 600;

const VIEWS: SegmentedControlOption[] = [
  { value: 'lista', label: 'Lista', icon: ListBulletIcon },
  { value: 'kafelki', label: 'Kafelki', icon: Squares2X2Icon },
  { value: 'mapa', label: 'Mapa', icon: MapIcon },
];

const STATUSES: SegmentedControlOption[] = [
  { value: 'wszystkie', label: 'Wszystkie' },
  { value: 'aktywne', label: 'Aktywne' },
  { value: 'sprzedane', label: 'Sprzedane' },
  { value: 'archiwum', label: 'Archiwum', disabled: true },
];

const BRANDS: { brand: SegmentedControlBrand; name: string }[] = [
  { brand: 'uniwersal', name: 'Uniwersal' },
  { brand: 'estigroup', name: 'Estigroup' },
  { brand: 'estimoto', name: 'Estimoto' },
];

type SegmentedControlDemoProps = {
  /** „switch” — tło jedzie z pierwszej opcji na trzecią, gdy scena wjedzie w ekran; „states” — marki i stany do klikania. */
  mode: 'switch' | 'states';
};

/** Podgląd do dokumentacji: prawdziwy segmented control, działa myszą i strzałkami. */
export default function SegmentedControlDemo({ mode }: SegmentedControlDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const userInteracted = useRef(false);
  const [view, setView] = useState('lista');
  const [statuses, setStatuses] = useState<Record<SegmentedControlBrand, string>>({
    uniwersal: 'wszystkie',
    estigroup: 'aktywne',
    estimoto: 'sprzedane',
  });

  useEffect(() => {
    if (mode !== 'switch' || !isInView) return;
    const timer = window.setTimeout(() => {
      if (!userInteracted.current) setView('mapa');
    }, AUTO_PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [mode, isInView]);

  if (mode === 'states') {
    return (
      <div ref={ref} className={styles.demo}>
        {BRANDS.map(({ brand, name }) => (
          <figure key={brand} className={styles.variant}>
            <div className={styles.scroller}>
              <SegmentedControl
                label={`Status ogłoszeń — ${name}`}
                brand={brand}
                options={STATUSES}
                value={statuses[brand]}
                onChange={(value) => setStatuses((current) => ({ ...current, [brand]: value }))}
                className={styles.fullLabels}
              />
            </div>
            <figcaption className={styles.caption}>{name}</figcaption>
          </figure>
        ))}
        <p className={styles.hint}>Najedź, wciśnij wybrany segment i przełącz. „Archiwum” jest wyłączone.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.demo}>
      <SegmentedControl
        label="Widok ogłoszeń"
        options={VIEWS}
        value={view}
        onChange={(value) => {
          userInteracted.current = true;
          setView(value);
        }}
      />
      <p className={styles.hint} aria-live="polite">
        Widok: {VIEWS.find((option) => option.value === view)?.label} — kliknij albo użyj strzałek.
      </p>
    </div>
  );
}
