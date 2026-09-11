'use client';

import Toast from '@/components/Toast';

import MotionEntry from '@/components/motion-docs/MotionEntry';
import styles from './page.module.css';

const TOAST_CODE = `const FIGMA_SPRING_EASE = (t: number) =>
  1 - Math.exp(-t * 11.1801) * (Math.cos(t * 0.1582) + 70.6911 * Math.sin(t * 0.1582));

<motion.div
  initial={{ opacity: 0, y: -51 }}
  animate={{
    opacity: [0, 0, 1],
    y: 0,
    transition: {
      opacity: { duration: 0.5, times: [0, 0.105, 1], ease: ['linear', FIGMA_SPRING_EASE] },
      y: { type: 'spring', duration: 0.5, bounce: 0.25 },
    },
  }}
/>`;

export default function AnimacjePage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.kicker}>Estigroup · Dealer Panel</p>
        <h1 className={styles.heading}>Mikrointerakcje</h1>
        <p className={styles.lead}>
          Dokumentacja animacji komponentów: podgląd na żywo, parametry wyciągnięte z Figmy i gotowy
          snippet. Wartości w tabelach są wiążące — jeśli coś trzeba zmienić, zmieniamy najpierw w
          Figmie, potem tutaj.
        </p>
        <p className={styles.meta}>
          Stack: Next.js · framer-motion · CSS Modules na tokenach design systemu.
        </p>
      </header>

      <MotionEntry
        title="Toast — pojawienie się"
        description="Krótkie potwierdzenie akcji. Wjeżdża z góry i wytraca ruch sprężyną; przez pierwsze ~50 ms jest jeszcze niewidoczny, więc ruch startuje zanim zobaczymy treść."
        figmaNode="2116:26967"
        figmaUrl="https://www.figma.com/design/UCzHnyMnTZ2AS0PnYsw6eR/Platform-for-dealers?node-id=2116-26967"
        params={[
          { property: 'opacity', value: '[0, 0, 1] · times [0, 0.105, 1]', source: 'Figma' },
          { property: 'opacity — easing', value: "['linear', spring ease z eksportu]", source: 'Figma' },
          { property: 'y', value: '−51 px → 0', source: 'Figma (−38 → 13 w ramce)' },
          { property: 'y — easing', value: 'spring, bounce 0.25', source: 'Figma' },
          { property: 'duration', value: '0.5 s (obie właściwości)', source: 'Figma' },
          { property: 'trigger', value: 'zamontowanie komponentu', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.15 s', source: 'a11y' },
        ]}
        code={TOAST_CODE}
        notes={
          <>
            <p>
              <strong>Wyjścia jeszcze nie ma</strong> — animacja zniknięcia zostanie doprojektowana
              osobno. Do tego czasu toast znika natychmiast po odmontowaniu.
            </p>
            <p>
              Kolor ikony statusu do potwierdzenia — w kodzie stoi fallback{' '}
              <code>#16a34a</code> na zmiennej <code>--foregrounds-fg-success</code>.
            </p>
          </>
        }
      >
        <Toast message="Oznaczono Ducati HD883 jako sprzedany" onClose={() => {}} />
      </MotionEntry>
    </main>
  );
}
