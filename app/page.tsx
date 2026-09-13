'use client';

import type { ReactNode } from 'react';

import MotionEntry, { type MotionParam } from '@/components/motion-docs/MotionEntry';
import Sidebar, { type NavGroup } from '@/components/motion-docs/Sidebar';
import ToastDemo from '@/components/motion-docs/demos/ToastDemo';
import { nodeToText, type SearchDoc } from '@/components/motion-docs/search';
import styles from './page.module.css';

/* ── Treść ────────────────────────────────────────────────────────────────────
 * Jedno źródło dla sekcji strony, menu w sidebarze i wyszukiwarki.
 * Nowa animacja = nowy wpis w `entries`; nowy komponent = nowy obiekt w COMPONENTS. */

type DocEntry = {
  /** Kotwica sekcji: /#toast-znikniecie. */
  id: string;
  title: string;
  description: string;
  figmaNode?: string;
  figmaUrl?: string;
  params: MotionParam[];
  code: string;
  notes?: ReactNode;
  /** Dodatkowe hasła dla wyszukiwarki (synonimy, angielskie nazwy). */
  keywords?: string[];
  /** Podgląd na żywo w scenie. */
  preview: ReactNode;
};

type DocComponent = {
  id: string;
  name: string;
  summary: string;
  /** Plik komponentu w repo. */
  file: string;
  keywords?: string[];
  entries: DocEntry[];
};

const INTRO_LEAD =
  'Dokumentacja animacji komponentów: podgląd na żywo, parametry wyciągnięte z Figmy i gotowy snippet. Wartości w tabelach są wiążące — jeśli coś trzeba zmienić, zmieniamy najpierw w Figmie, potem tutaj.';

const TOAST_FIGMA_URL =
  'https://www.figma.com/design/UCzHnyMnTZ2AS0PnYsw6eR/Platform-for-dealers?node-id=2116-26967';

const TOAST_ENTER_CODE = `const FIGMA_SPRING_EASE = (t: number) =>
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

const TOAST_EXIT_CODE = `// FIGMA_SPRING_EASE — jak przy wejściu
const TOAST_TRANSITION = {
  opacity: { duration: 0.5, times: [0, 0.105, 1], ease: ['linear', FIGMA_SPRING_EASE] },
  y: { type: 'spring', duration: 0.5, bounce: 0.25 },
};

<AnimatePresence>
  {isOpen && (
    <motion.div
      key="toast"
      initial={{ opacity: 0, y: -51 }}
      animate={{ opacity: [0, 0, 1], y: 0, transition: TOAST_TRANSITION }}
      exit={{ opacity: [null, null, 0], y: -51, transition: TOAST_TRANSITION }}
    >
      …
      <button type="button" aria-label="Zamknij powiadomienie" onClick={() => setIsOpen(false)}>
        <XMarkIcon />
      </button>
    </motion.div>
  )}
</AnimatePresence>`;

const COMPONENTS: DocComponent[] = [
  {
    id: 'toast',
    name: 'Toast',
    summary: 'Krótkie potwierdzenie akcji, np. „Oznaczono Ducati HD883 jako sprzedany”.',
    file: 'components/Toast.tsx',
    keywords: ['powiadomienie', 'komunikat', 'notification', 'snackbar'],
    entries: [
      {
        id: 'toast-pojawienie-sie',
        title: 'Pojawienie się',
        description:
          'Wjeżdża z góry i wytraca ruch sprężyną; przez pierwsze ~50 ms jest jeszcze niewidoczny, więc ruch startuje, zanim zobaczymy treść.',
        figmaNode: '2116:26967',
        figmaUrl: TOAST_FIGMA_URL,
        params: [
          { property: 'opacity', value: '[0, 0, 1] · times [0, 0.105, 1]', source: 'Figma' },
          { property: 'opacity — easing', value: "['linear', spring ease z eksportu]", source: 'Figma' },
          { property: 'y', value: '−51 px → 0', source: 'Figma (−38 → 13 w ramce)' },
          { property: 'y — easing', value: 'spring, bounce 0.25', source: 'Figma' },
          { property: 'duration', value: '0.5 s (obie właściwości)', source: 'Figma' },
          { property: 'trigger', value: 'zamontowanie komponentu', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.15 s', source: 'a11y' },
        ],
        code: TOAST_ENTER_CODE,
        notes: (
          <p>
            Kolor ikony statusu do potwierdzenia — w kodzie stoi fallback <code>#16a34a</code> na
            zmiennej <code>--foregrounds-fg-success</code>.
          </p>
        ),
        keywords: ['wejście', 'appear', 'enter'],
        preview: <ToastDemo />,
      },
      {
        id: 'toast-znikniecie',
        title: 'Zniknięcie',
        description:
          'Po kliknięciu „×” toast wraca tą samą drogą w górę i gaśnie — te same krzywe i czasy co przy wejściu, w odwrotnym kierunku. Przez pierwsze ~50 ms jest jeszcze w pełni widoczny, więc widać, że rusza, zanim zniknie.',
        figmaNode: '2116:26967',
        figmaUrl: TOAST_FIGMA_URL,
        params: [
          { property: 'opacity', value: '[1, 1, 0] · times [0, 0.105, 1]', source: 'Figma — wejście odwrotnie' },
          { property: 'opacity — easing', value: "['linear', spring ease z eksportu]", source: 'Figma — jak wejście' },
          { property: 'y', value: '0 → −51 px', source: 'Figma — wejście odwrotnie' },
          { property: 'y — easing', value: 'spring, bounce 0.25', source: 'Figma — jak wejście' },
          { property: 'duration', value: '0.5 s (obie właściwości)', source: 'Figma — jak wejście' },
          { property: 'trigger', value: 'kliknięcie „×” → odmontowanie w <AnimatePresence>', source: 'decyzja projektowa' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.15 s', source: 'a11y' },
        ],
        code: TOAST_EXIT_CODE,
        notes: (
          <>
            <p>
              <strong>To nie jest wejście odtworzone od końca.</strong> Odwrócona w czasie sprężyna
              przez pierwsze ~350 ms prawie stoi, więc po kliknięciu „×” nic by się nie działo. Te
              same parametry w odwrotnym kierunku ruszają po ~30 ms, a po ~200 ms toasta praktycznie
              nie widać.
            </p>
            <p>
              W kodzie <code>opacity</code> to <code>[null, null, 0]</code> — <code>null</code> oznacza
              bieżącą wartość, więc zamknięcie w trakcie wejścia nie mignie pełną opacity.
            </p>
            <p>
              Toast musi być bezpośrednim dzieckiem <code>&lt;AnimatePresence&gt;</code> z{' '}
              <code>key</code> — inaczej zniknie natychmiast, bez animacji.
            </p>
          </>
        ),
        keywords: ['wyjście', 'zamknięcie', 'exit', 'close'],
        preview: <ToastDemo animateEnter={false} hint="Kliknij ×, żeby zobaczyć wyjście." />,
      },
    ],
  },
];

/* ── Menu i indeks wyszukiwarki (liczone z treści) ────────────────────────── */

const NAV: NavGroup[] = [
  { label: 'Ogólne', items: [{ id: 'wprowadzenie', title: 'Wprowadzenie' }] },
  {
    label: 'Komponenty',
    items: COMPONENTS.map((component) => ({
      id: component.id,
      title: component.name,
      children: component.entries.map((entry) => ({ id: entry.id, title: entry.title })),
    })),
  },
];

const keywordsField = (keywords?: string[]) =>
  keywords?.length ? [{ label: 'Hasła', text: keywords.join(', '), weight: 6 }] : [];

const SEARCH_DOCS: SearchDoc[] = [
  { href: '#wprowadzenie', title: 'Wprowadzenie', fields: [{ label: 'Wstęp', text: INTRO_LEAD, weight: 3 }] },
  ...COMPONENTS.flatMap((component) => [
    {
      href: `#${component.id}`,
      title: component.name,
      fields: [
        { label: 'Opis', text: component.summary, weight: 3 },
        ...keywordsField(component.keywords),
        { label: 'Plik', text: component.file, weight: 2 },
      ],
    },
    ...component.entries.map((entry) => ({
      href: `#${entry.id}`,
      title: entry.title,
      section: component.name,
      fields: [
        { label: 'Opis', text: entry.description, weight: 3 },
        ...keywordsField(entry.keywords),
        ...entry.params.map((param) => ({
          label: 'Parametr',
          text: [param.property, param.value, param.source].filter(Boolean).join(' · '),
          weight: 5,
        })),
        ...(entry.notes ? [{ label: 'Uwagi', text: nodeToText(entry.notes), weight: 2 }] : []),
        { label: 'Kod', text: entry.code, weight: 1, code: true },
      ],
    })),
  ]),
];

/* ── Strona ───────────────────────────────────────────────────────────────── */

export default function AnimacjePage() {
  return (
    <div className={styles.layout}>
      <Sidebar groups={NAV} searchDocs={SEARCH_DOCS} />

      <main className={styles.page}>
        <header id="wprowadzenie" className={styles.intro}>
          <p className={styles.kicker}>Estigroup · Dealer Panel</p>
          <h1 className={styles.heading}>Mikrointerakcje</h1>
          <p className={styles.lead}>{INTRO_LEAD}</p>
          <p className={styles.meta}>
            Stack: Next.js · framer-motion · CSS Modules na tokenach design systemu.
          </p>
        </header>

        {COMPONENTS.map((component) => (
          <section
            key={component.id}
            id={component.id}
            className={styles.component}
            aria-labelledby={`${component.id}-title`}
          >
            <header className={styles.componentHeader}>
              <h2 id={`${component.id}-title`} className={styles.componentTitle}>
                {component.name}
              </h2>
              <p className={styles.componentSummary}>{component.summary}</p>
              <p className={styles.meta}>
                Komponent: <code>{component.file}</code>
              </p>
            </header>

            {component.entries.map((entry) => (
              <MotionEntry
                key={entry.id}
                id={entry.id}
                title={entry.title}
                description={entry.description}
                figmaNode={entry.figmaNode}
                figmaUrl={entry.figmaUrl}
                params={entry.params}
                code={entry.code}
                notes={entry.notes}
              >
                {entry.preview}
              </MotionEntry>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
