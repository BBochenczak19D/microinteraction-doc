'use client';

import { useState, type ReactNode } from 'react';

import styles from './MotionEntry.module.css';

export type MotionParam = {
  /** Animowana właściwość lub parametr, np. „opacity”, „y”, „duration”. */
  property: string;
  /** Wartość w zapisie, jaki wchodzi do kodu. */
  value: string;
  /** Skąd wartość pochodzi: „Figma”, „decyzja FE”, „a11y”… */
  source?: string;
};

export type MotionEntryProps = {
  /** Kotwica sekcji — cel linków z menu i wyszukiwarki, np. „toast-znikniecie”. */
  id?: string;
  title: string;
  /** Krótko: czym jest komponent i kiedy się pojawia. */
  description: string;
  /** Node ID z Figmy, np. „2116:26967”. */
  figmaNode?: string;
  figmaUrl?: string;
  params: MotionParam[];
  /** Snippet do skopiowania przez developera. */
  code: string;
  /** Uwagi, rzeczy do ustalenia, wyjątki. */
  notes?: ReactNode;
  /**
   * Podgląd komponentu. Przycisk „Odtwórz ponownie” remontuje całą scenę,
   * więc animacja wejścia startuje od zera — komponent nie musi nic o tym wiedzieć.
   */
  children: ReactNode;
};

export default function MotionEntry({
  id,
  title,
  description,
  figmaNode,
  figmaUrl,
  params,
  code,
  notes,
  children,
}: MotionEntryProps) {
  const [runKey, setRunKey] = useState(0);

  return (
    <section id={id} className={styles.entry}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {figmaNode ? (
          figmaUrl ? (
            <a className={styles.node} href={figmaUrl} target="_blank" rel="noreferrer">
              Figma · {figmaNode}
            </a>
          ) : (
            <span className={styles.node}>Figma · {figmaNode}</span>
          )
        ) : null}
      </header>

      <p className={styles.description}>{description}</p>

      <div className={styles.stage}>
        <div className={styles.stageInner} key={runKey}>
          {children}
        </div>
        <button type="button" className={styles.replay} onClick={() => setRunKey((k) => k + 1)}>
          Odtwórz ponownie
        </button>
      </div>

      <table className={styles.params}>
        <thead>
          <tr>
            <th scope="col">Właściwość</th>
            <th scope="col">Wartość</th>
            <th scope="col">Źródło</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.property}>
              <th scope="row">{param.property}</th>
              <td>
                <code>{param.value}</code>
              </td>
              <td>{param.source ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <pre className={styles.code}>
        <code>{code}</code>
      </pre>

      {notes ? <div className={styles.notes}>{notes}</div> : null}
    </section>
  );
}
