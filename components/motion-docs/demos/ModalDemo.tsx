'use client';

import { ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/20/solid';
import { useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import Modal, { type ModalDevice } from '@/components/Modal';
import SegmentedControl, { type SegmentedControlOption } from '@/components/SegmentedControl';

import VehicleForm from './VehicleForm';
import styles from './ModalDemo.module.css';

/** Najpierw widać ekran, potem zmianę — także po „Odtwórz ponownie”. */
const AUTO_PLAY_DELAY = 600;
/** Symulowany czas odpowiedzi serwera po „Zapisz” (ms). */
const SAVE_DURATION = 2400;

const DEVICES: SegmentedControlOption[] = [
  { value: 'mobile', label: 'Mobile', icon: DevicePhoneMobileIcon },
  { value: 'desktop', label: 'Web', icon: ComputerDesktopIcon },
];

type ModalDemoProps = {
  /**
   * Autoplay startuje, gdy scena wjedzie w ekran:
   * „mobile” — bottom sheet wjeżdża z dołu; „desktop” — okno pojawia się na środku;
   * „saving” — modal jest już otwarty, „Zapisz” pokazuje loader, po odpowiedzi modal się zamyka.
   */
  mode: 'mobile' | 'desktop' | 'saving';
};

/** Podgląd do dokumentacji: prawdziwy modal w ramce telefonu albo przeglądarki. */
export default function ModalDemo({ mode }: ModalDemoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const userInteracted = useRef(false);
  const saveTimer = useRef(0);
  const [device, setDevice] = useState<ModalDevice>(mode === 'desktop' ? 'desktop' : 'mobile');
  const [isOpen, setIsOpen] = useState(mode === 'saving');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  /** Modal otwarty kliknięciem dostaje fokus; otwarty przez autoplay — nie. */
  const [openedByUser, setOpenedByUser] = useState(false);

  // Po odpowiedzi modal się zamyka, a loader zostaje do końca animacji zamknięcia.
  const save = () => {
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setIsOpen(false);
      setSaved(true);
    }, SAVE_DURATION);
  };

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  useEffect(() => {
    if (!isInView) return;
    const timer = window.setTimeout(() => {
      if (userInteracted.current) return;
      if (mode === 'saving') save();
      else setIsOpen(true);
    }, AUTO_PLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [mode, isInView]);

  const open = () => {
    userInteracted.current = true;
    window.clearTimeout(saveTimer.current);
    setSaving(false);
    setSaved(false);
    setOpenedByUser(true);
    setIsOpen(true);
  };

  const close = () => {
    userInteracted.current = true;
    setIsOpen(false);
  };

  let hint = 'Kliknij „Edytuj dane”, żeby otworzyć modal.';
  if (saving && isOpen) hint = 'Zapisywanie — w tym czasie modala nie da się zamknąć.';
  else if (isOpen && mode === 'saving') hint = 'Kliknij „Zapisz”: stopka pokaże loader, a po odpowiedzi modal się zamknie.';
  else if (isOpen) hint = 'Zamknij: ×, klik w tło, Esc albo „Anuluj”.';
  else if (saved) hint = 'Zapisano — „Edytuj dane” otwiera modal znowu.';

  return (
    <div ref={ref} className={styles.demo}>
      {mode === 'saving' ? (
        <SegmentedControl
          label="Urządzenie"
          options={DEVICES}
          value={device}
          onChange={(value) => {
            userInteracted.current = true;
            window.clearTimeout(saveTimer.current);
            setSaving(false);
            setDevice(value as ModalDevice);
          }}
        />
      ) : null}

      {/* key: zmiana urządzenia montuje ramkę od nowa — modal nie przeskakuje między wariantami */}
      <div key={device} className={styles.frame} data-device={device}>
        {device === 'desktop' ? (
          <div className={styles.browserBar} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : null}

        <div className={styles.screen}>
          <div className={styles.page}>
            <div className={styles.card}>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>Ducati HD883</span>
                <span className={styles.cardMeta}>2019 · 1000 km · 100 kW</span>
              </div>
              <button type="button" className={styles.openButton} onClick={open}>
                Edytuj dane
              </button>
            </div>
            <div className={styles.skeleton} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <Modal
            contained
            open={isOpen}
            device={device}
            onClose={close}
            title={
              <>
                Edytuj: <em>dane pojazdu</em>
              </>
            }
            onSave={() => {
              userInteracted.current = true;
              save();
            }}
            saving={saving}
            animateOnMount={mode !== 'saving'}
            manageFocus={openedByUser}
          >
            <VehicleForm device={device} />
          </Modal>
        </div>
      </div>

      <p className={styles.hint} aria-live="polite">
        {hint}
      </p>
    </div>
  );
}
