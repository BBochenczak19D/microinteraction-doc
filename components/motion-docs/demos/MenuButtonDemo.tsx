'use client';

import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import MenuButton, { type MenuButtonItem } from '@/components/MenuButton';

import styles from './MenuDemo.module.css';

/** Najpierw widać zamknięty przycisk, potem otwarcie — także po „Odtwórz ponownie”. */
const AUTO_OPEN_DELAY = 600;

type MenuButtonDemoProps = {
  /** „open” — menu otwiera się samo, gdy scena wjedzie w ekran; „close” — startuje otwarte, bez animacji. */
  mode: 'open' | 'close';
};

/** Podgląd do dokumentacji: menu akcji faktury z Platform for dealers (2130:17714). */
export default function MenuButtonDemo({ mode }: MenuButtonDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const userInteracted = useRef(false);
  const [isOpen, setIsOpen] = useState(mode === 'close');
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'open' || !isInView) return;
    const timer = window.setTimeout(() => {
      if (!userInteracted.current) setIsOpen(true);
    }, AUTO_OPEN_DELAY);
    return () => window.clearTimeout(timer);
  }, [mode, isInView]);

  const action = (label: string) => () => setLastAction(label);

  const items: MenuButtonItem[] = [
    { label: 'Podgląd faktury', icon: ArrowTopRightOnSquareIcon, onSelect: action('Podgląd faktury') },
    { label: 'Pobierz', icon: ArrowDownTrayIcon, onSelect: action('Pobierz') },
    { type: 'separator' },
    { label: 'Edytuj', icon: PencilIcon, onSelect: action('Edytuj') },
    { label: 'Usuń', icon: TrashIcon, onSelect: action('Usuń') },
  ];

  let hint = 'Kliknij „⋯”, żeby otworzyć menu.';
  if (isOpen) hint = 'Wybierz akcję, kliknij poza menu albo naciśnij Esc.';
  else if (lastAction) hint = `Wybrano „${lastAction}” — menu zamknięte.`;
  else if (mode === 'close') hint = 'Menu zamknięte — „Odtwórz ponownie” otwiera je znowu.';

  return (
    <div ref={ref} className={styles.demo}>
      <div className={styles.buttonSlot}>
        <MenuButton
          label="Akcje faktury"
          items={items}
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
