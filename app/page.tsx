'use client';

import { Fragment, type ReactNode } from 'react';

import MotionEntry, { type MotionParam } from '@/components/motion-docs/MotionEntry';
import Sidebar, { type NavGroup } from '@/components/motion-docs/Sidebar';
import MenuButtonDemo from '@/components/motion-docs/demos/MenuButtonDemo';
import SelectDemo from '@/components/motion-docs/demos/SelectDemo';
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
  /** Pliki komponentu w repo. */
  files: string[];
  keywords?: string[];
  entries: DocEntry[];
};

const INTRO_LEAD =
  'Dokumentacja animacji komponentów: podgląd na żywo, parametry wyciągnięte z Figmy i gotowy snippet. Wartości w tabelach są wiążące — jeśli coś trzeba zmienić, zmieniamy najpierw w Figmie, potem tutaj.';

/* ── Toast ── */

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

/* ── Menu ── */

const DS_SELECT_FIGMA_URL =
  'https://www.figma.com/design/LorGLqilmfYrIQp72jTOHB/Design-System?node-id=81-993';

const MENU_SELECT_OPEN_CODE = `const MENU_OPEN = {
  opacity: { duration: 0.15, ease: 'easeOut' },
  default: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

// .menu { position: absolute; top: calc(100% + 8px); left: 0; right: 0; transform-origin: top; }
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="select-menu"
      className="menu"
      initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1, transition: MENU_OPEN }}
    >
      <ul role="listbox">…</ul>
    </motion.div>
  )}
</AnimatePresence>`;

const MENU_SELECT_CLOSE_CODE = `// MENU_OPEN — jak przy pojawieniu się
const MENU_CLOSE = { duration: 0.1, ease: [0.4, 0, 1, 1] };

<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="select-menu"
      className="menu" // transform-origin: top
      initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1, transition: MENU_OPEN }}
      exit={{ opacity: 0, y: -4, scaleY: 0.96, transition: MENU_CLOSE }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>

// wybór opcji: onChange(value) i setIsOpen(false) w jednym handlerze`;

const MENU_BUTTON_OPEN_CODE = `const MENU_OPEN = {
  opacity: { duration: 0.15, ease: 'easeOut' },
  default: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

// .menu { position: absolute; top: calc(100% + 6px); right: 0; transform-origin: top right; }
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="button-menu"
      role="menu"
      className="menu"
      initial={{ opacity: 0, y: -4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: MENU_OPEN }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>`;

const MENU_BUTTON_CLOSE_CODE = `// MENU_OPEN — jak przy pojawieniu się
const MENU_CLOSE = { duration: 0.1, ease: [0.4, 0, 1, 1] };

<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="button-menu"
      role="menu"
      className="menu" // transform-origin: top right
      initial={{ opacity: 0, y: -4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: MENU_OPEN }}
      exit={{ opacity: 0, y: -4, scale: 0.95, transition: MENU_CLOSE }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>

// wybór akcji albo Esc: setIsOpen(false) i fokus z powrotem na przycisk`;

const COMPONENTS: DocComponent[] = [
  {
    id: 'toast',
    name: 'Toast',
    summary: 'Krótkie potwierdzenie akcji, np. „Oznaczono Ducati HD883 jako sprzedany”.',
    files: ['components/Toast.tsx'],
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
  {
    id: 'menu',
    name: 'Menu',
    summary:
      'Rozwijana lista opcji (Select Menu z design systemu) w dwóch wariantach: pod polem Select i pod przyciskiem „⋯”.',
    files: ['components/Menu.tsx', 'components/Select.tsx', 'components/MenuButton.tsx'],
    keywords: ['dropdown', 'lista rozwijana', 'select menu', 'popover', 'flyout'],
    entries: [
      {
        id: 'menu-select-pojawienie-sie',
        title: 'Select — pojawienie się',
        description:
          'Menu wysuwa się spod pola: opada o 4 px i rozciąga w pionie od krawędzi przy polu. Otwiera się kliknięciem w pole albo klawiszem (Enter, Spacja, strzałki).',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '0 → 1 · 150 ms · ease-out', source: 'propozycja' },
          { property: 'y', value: '−4 px → 0', source: 'propozycja' },
          { property: 'scaleY', value: '0.96 → 1', source: 'propozycja' },
          { property: 'y, scaleY — timing', value: '200 ms · cubic-bezier(0.16, 1, 0.3, 1)', source: 'propozycja' },
          { property: 'transform-origin', value: 'top — krawędź przy polu', source: 'propozycja' },
          { property: 'trigger', value: 'klik w pole · Enter · Spacja · ↓ ↑', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.1 s', source: 'a11y' },
        ],
        code: MENU_SELECT_OPEN_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie menu nie ma animacji</strong> — ani w Design Systemie, ani w Platform for
              dealers (2130:17715). Wartości w tabeli to propozycja do potwierdzenia.
            </p>
            <p>
              Menu rośnie tylko w pionie (<code>scaleY</code>): ma szerokość pola, więc skalowanie w
              poziomie rozjechałoby krawędzie menu i pola.
            </p>
          </>
        ),
        keywords: ['otwarcie', 'wejście', 'rozwinięcie', 'open', 'listbox', 'rocznik'],
        preview: <SelectDemo mode="open" />,
      },
      {
        id: 'menu-select-zamkniecie',
        title: 'Select — zamknięcie',
        description:
          'Po wyborze opcji, kliknięciu poza menu albo Esc menu cofa się pod pole tą samą drogą — dwa razy szybciej, niż się otwierało.',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '1 → 0', source: 'propozycja' },
          { property: 'y', value: '0 → −4 px', source: 'propozycja' },
          { property: 'scaleY', value: '1 → 0.96', source: 'propozycja' },
          { property: 'timing', value: '100 ms · cubic-bezier(0.4, 0, 1, 1) — wszystkie właściwości', source: 'propozycja' },
          { property: 'transform-origin', value: 'top', source: 'propozycja' },
          { property: 'trigger', value: 'wybór opcji · klik poza menu · Esc · Tab', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.1 s', source: 'a11y' },
        ],
        code: MENU_SELECT_CLOSE_CODE,
        notes: (
          <>
            <p>
              Zamknięcie trwa połowę otwarcia i przyspiesza do końca (ease-in) — po wyborze opcji
              interfejs od razu wraca do użytkownika.
            </p>
            <p>
              Fokus przez cały czas zostaje na polu (combobox z <code>aria-activedescendant</code>), więc
              po zamknięciu nie trzeba go przywracać.
            </p>
          </>
        ),
        keywords: ['zamknięcie', 'wyjście', 'zwinięcie', 'close', 'exit'],
        preview: <SelectDemo mode="close" />,
      },
      {
        id: 'menu-button-pojawienie-sie',
        title: 'Button — pojawienie się',
        description:
          'Menu akcji wyrasta z prawego górnego rogu przycisku „⋯”: skaluje się z 95% i opada o 4 px. Otwarte klawiaturą ustawia fokus na pierwszej pozycji.',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '0 → 1 · 150 ms · ease-out', source: 'propozycja' },
          { property: 'y', value: '−4 px → 0', source: 'propozycja' },
          { property: 'scale', value: '0.95 → 1', source: 'propozycja' },
          { property: 'y, scale — timing', value: '200 ms · cubic-bezier(0.16, 1, 0.3, 1)', source: 'propozycja' },
          { property: 'transform-origin', value: 'top right — róg przycisku', source: 'propozycja' },
          { property: 'trigger', value: 'klik w przycisk · Enter · Spacja · ↓ ↑', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.1 s', source: 'a11y' },
        ],
        code: MENU_BUTTON_OPEN_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie menu nie ma animacji</strong> — wartości to propozycja do potwierdzenia.
            </p>
            <p>
              Figma pokazuje przycisk tylko przy otwartym menu (tło <code>rgba(24, 24, 27, 0.1)</code>);
              stan domyślny i hover są do potwierdzenia.
            </p>
          </>
        ),
        keywords: ['otwarcie', 'wejście', 'menu akcji', 'icon button', 'kebab', 'open'],
        preview: <MenuButtonDemo mode="open" />,
      },
      {
        id: 'menu-button-zamkniecie',
        title: 'Button — zamknięcie',
        description:
          'Po wyborze akcji, kliknięciu poza menu albo Esc menu kurczy się z powrotem do rogu przycisku i gaśnie.',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '1 → 0', source: 'propozycja' },
          { property: 'y', value: '0 → −4 px', source: 'propozycja' },
          { property: 'scale', value: '1 → 0.95', source: 'propozycja' },
          { property: 'timing', value: '100 ms · cubic-bezier(0.4, 0, 1, 1) — wszystkie właściwości', source: 'propozycja' },
          { property: 'transform-origin', value: 'top right', source: 'propozycja' },
          { property: 'trigger', value: 'wybór akcji · klik poza menu · Esc · Tab', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.1 s', source: 'a11y' },
        ],
        code: MENU_BUTTON_CLOSE_CODE,
        notes: (
          <p>
            Te same czasy co w Select, więc oba menu zamykają się jednakowo. Po wyborze akcji albo Esc
            fokus wraca na przycisk; po kliknięciu poza menu zostaje tam, gdzie kliknięto.
          </p>
        ),
        keywords: ['zamknięcie', 'wyjście', 'menu akcji', 'close', 'exit'],
        preview: <MenuButtonDemo mode="close" />,
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
        { label: 'Plik', text: component.files.join(', '), weight: 2 },
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
                {component.files.length > 1 ? 'Pliki: ' : 'Komponent: '}
                {component.files.map((file, index) => (
                  <Fragment key={file}>
                    {index > 0 ? ' · ' : null}
                    <code>{file}</code>
                  </Fragment>
                ))}
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
