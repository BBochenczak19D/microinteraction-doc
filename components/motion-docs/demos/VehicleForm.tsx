'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useId, useState, type ReactNode } from 'react';

import Select, { type SelectOption } from '@/components/Select';
import Tooltip from '@/components/Tooltip';

import styles from './VehicleForm.module.css';

/* Treść modala z Figmy (BottomSheet → Wrapper, „Edytuj: dane pojazdu”) — tylko do podglądu.
 * Pola działają, ale nic nie zapisują. Ikony „i” pokazują tooltipy. */

const options = (values: string[]): SelectOption[] => values.map((value) => ({ value, label: value }));

const YEARS = options(Array.from({ length: 18 }, (_, index) => String(2025 - index)));
const OWNERS = options(['1', '2', '3', '4', '5+']);
const COUNTRIES = options(['Niemcy', 'Francja', 'Włochy', 'Belgia', 'Holandia']);
const INSPECTIONS = options(['12/2025', '06/2026', '12/2026', '06/2027']);

function Info({ text }: { text: string }) {
  return (
    <Tooltip content={text}>
      <button type="button" className={styles.info} aria-label="Informacja">
        <InformationCircleIcon className={styles.infoIcon} aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

function Field({ label, info, htmlFor, children }: { label: string; info?: ReactNode; htmlFor: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
        </label>
        {info}
      </div>
      {children}
    </div>
  );
}

function TextInput({ id, placeholder, suffix }: { id: string; placeholder: string; suffix?: string }) {
  return (
    <div className={styles.input}>
      <input id={id} className={styles.inputControl} placeholder={placeholder} autoComplete="off" />
      {suffix ? (
        <span className={styles.suffix} aria-hidden="true">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function RadioRow({ label, info, value, onChange }: { label: string; info?: ReactNode; value: string; onChange: (value: string) => void }) {
  const id = useId();

  return (
    <div className={styles.radioRow} role="radiogroup" aria-labelledby={`${id}-label`}>
      <div className={styles.labelRow}>
        <span id={`${id}-label`} className={styles.label}>
          {label}
        </span>
        {info}
      </div>
      <div className={styles.radioOptions}>
        {[
          { value: 'tak', label: 'Tak' },
          { value: 'nie', label: 'Nie' },
        ].map((option) => (
          <label key={option.value} className={styles.radioLabel}>
            <input
              type="radio"
              name={id}
              className={styles.radioInput}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.radio} aria-hidden="true" />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

type VehicleFormProps = {
  /** Mobile — jedna kolumna; desktop — pola po dwa w rzędzie (na wąskim oknie też jedna). */
  device: 'mobile' | 'desktop';
};

export default function VehicleForm({ device }: VehicleFormProps) {
  const id = useId();
  const [year, setYear] = useState<string | null>('2019');
  const [owners, setOwners] = useState<string | null>('2');
  const [abs, setAbs] = useState('tak');
  const [paint, setPaint] = useState('tak');
  // Jak w Figmie: na mobile „Tak” z krajem pochodzenia, na desktopie „Nie”.
  const [imported, setImported] = useState(device === 'mobile' ? 'tak' : 'nie');
  const [country, setCountry] = useState<string | null>('Niemcy');
  const [inspection, setInspection] = useState<string | null>('12/2026');

  return (
    <form className={styles.form} data-device={device} onSubmit={(event) => event.preventDefault()}>
      <div className={styles.grid}>
        <Select label="Rocznik" options={YEARS} value={year} onChange={setYear} />
        <Field label="Przebieg" htmlFor={`${id}-mileage`}>
          <TextInput id={`${id}-mileage`} placeholder="1000" suffix="km" />
        </Field>
        <Select
          label="Liczba właścicieli"
          labelAddon={<Info text="Łącznie z obecnym właścicielem" />}
          options={OWNERS}
          value={owners}
          onChange={setOwners}
        />
        <Field label="Moc" htmlFor={`${id}-power`}>
          <TextInput id={`${id}-power`} placeholder="100" suffix="kW" />
        </Field>
      </div>

      <div className={styles.radios}>
        <RadioRow label="ABS" value={abs} onChange={setAbs} />
        <RadioRow label="Lakier fabryczny" info={<Info text="Bez lakierowania poza fabryką" />} value={paint} onChange={setPaint} />
        <RadioRow
          label="Importowany pojazd"
          info={<Info text="Sprowadzony z zagranicy" />}
          value={imported}
          onChange={setImported}
        />
        {imported === 'tak' ? (
          <Select label="Kraj pochodzenia" options={COUNTRIES} value={country} onChange={setCountry} className={styles.country} />
        ) : null}
      </div>

      <Field label="Opis akcesoriów" info={<Info text="Kufry, owiewki, dodatkowe oświetlenie" />} htmlFor={`${id}-accessories`}>
        <textarea id={`${id}-accessories`} className={styles.textarea} placeholder="Opisz akcesoria" rows={4} />
      </Field>

      <div className={styles.pair}>
        <Field label="VIN" info={<Info text="17 znaków z dowodu rejestracyjnego" />} htmlFor={`${id}-vin`}>
          <TextInput id={`${id}-vin`} placeholder="2131DVKAM2123" />
        </Field>
        <Select
          label="Ważność przeglądu"
          labelAddon={<Info text="Miesiąc i rok z pieczątki w dowodzie" />}
          options={INSPECTIONS}
          value={inspection}
          onChange={setInspection}
        />
      </div>
    </form>
  );
}
