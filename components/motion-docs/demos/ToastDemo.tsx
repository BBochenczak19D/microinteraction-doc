'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import Toast from '@/components/Toast';

import styles from './ToastDemo.module.css';

type ToastDemoProps = {
  /** false = toast stoi od razu, bez animacji wejścia (podgląd samego wyjścia). */
  animateEnter?: boolean;
  /** Podpowiedź pod toastem, dopóki jest otwarty. */
  hint?: string;
};

/** Podgląd do dokumentacji: „×” naprawdę zamyka toast, więc widać animację wyjścia. */
export default function ToastDemo({ animateEnter = true, hint }: ToastDemoProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.demo}>
      <div className={styles.slot}>
        <AnimatePresence initial={animateEnter}>
          {isOpen ? (
            <Toast
              key="toast"
              message="Oznaczono Ducati HD883 jako sprzedany"
              onClose={() => setIsOpen(false)}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <p className={styles.hint} aria-live="polite">
        {isOpen ? hint : 'Toast zamknięty — „Odtwórz ponownie” go przywraca.'}
      </p>
    </div>
  );
}
