'use client';

import { Fragment, type ReactNode } from 'react';

import MotionEntry, { type MotionParam } from '@/components/motion-docs/MotionEntry';
import Sidebar, { type NavGroup } from '@/components/motion-docs/Sidebar';
import MenuButtonDemo from '@/components/motion-docs/demos/MenuButtonDemo';
import PaginationDemo from '@/components/motion-docs/demos/PaginationDemo';
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
  'Dokumentacja animacji komponentów: podgląd na żywo, parametry wyciągnięte z Figmy i gotowy snippet. Wartości w tabelach są wiążące — jeśli coś trzeba zmienić, zmieniamy najpierw w Figmie, potem tutaj. Tam, gdzie w Figmie nie ma animacji, wartości są propozycją we wspólnym stylu (w kolumnie „Źródło”: propozycja).';

/* ── Wspólny styl animacji (components/motion.ts) ── */

const MOTION_STYLE_SUMMARY =
  'Wspólne wartości dla komponentów, które w Figmie nie mają animacji: subtelnie, bez sprężyn, zniknięcie krótsze od pojawienia się. Element wjeżdża albo rośnie od strony, z której przychodzi.';

const MOTION_STYLE: MotionParam[] = [
  { property: 'pojawienie się, ruch', value: '250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'menu, tło aktywnej strony, numery paginacji' },
  { property: 'fade przy pojawieniu', value: '200 ms · ta sama krzywa', source: 'menu, numery paginacji' },
  { property: 'zniknięcie', value: '150 ms · cubic-bezier(0.4, 0, 1, 1)', source: 'menu, numery paginacji' },
  { property: 'zmiana stanu', value: '150 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'hover, fokus, wciśnięcie' },
  { property: 'dystans', value: '2 px', source: 'menu (y), numery paginacji (x)' },
  { property: 'skala', value: '0.98 → 1', source: 'menu' },
  { property: 'prefers-reduced-motion', value: 'bez ruchu, same fade’y w tych samych czasach', source: 'wszystkie' },
];

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

const MENU_SELECT_OPEN_CODE = `const EASE_OUT = [0.22, 1, 0.36, 1];
const MENU_OPEN = {
  opacity: { duration: 0.2, ease: EASE_OUT },
  default: { duration: 0.25, ease: EASE_OUT },
};

// .menu { position: absolute; top: calc(100% + 8px); left: 0; right: 0; transform-origin: top; }
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="select-menu"
      className="menu"
      initial={{ opacity: 0, y: -2, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: MENU_OPEN }}
    >
      <ul role="listbox">…</ul>
    </motion.div>
  )}
</AnimatePresence>`;

const MENU_SELECT_CLOSE_CODE = `// MENU_OPEN — jak przy pojawieniu się
const MENU_CLOSE = { duration: 0.15, ease: [0.4, 0, 1, 1] };

<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="select-menu"
      className="menu" // transform-origin: top
      initial={{ opacity: 0, y: -2, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: MENU_OPEN }}
      exit={{ opacity: 0, y: -2, scale: 0.98, transition: MENU_CLOSE }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>

// wybór opcji: onChange(value) i setIsOpen(false) w jednym handlerze`;

const MENU_BUTTON_OPEN_CODE = `const EASE_OUT = [0.22, 1, 0.36, 1];
const MENU_OPEN = {
  opacity: { duration: 0.2, ease: EASE_OUT },
  default: { duration: 0.25, ease: EASE_OUT },
};

// .menu { position: absolute; top: calc(100% + 6px); right: 0; transform-origin: top right; }
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="button-menu"
      role="menu"
      className="menu"
      initial={{ opacity: 0, y: -2, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: MENU_OPEN }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>`;

const MENU_BUTTON_CLOSE_CODE = `// MENU_OPEN — jak przy pojawieniu się
const MENU_CLOSE = { duration: 0.15, ease: [0.4, 0, 1, 1] };

<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="button-menu"
      role="menu"
      className="menu" // transform-origin: top right
      initial={{ opacity: 0, y: -2, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: MENU_OPEN }}
      exit={{ opacity: 0, y: -2, scale: 0.98, transition: MENU_CLOSE }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>

// wybór akcji albo Esc: setIsOpen(false) i fokus z powrotem na przycisk`;

/* ── Paginacja ── */

const DS_PAGINATION_FIGMA_URL =
  'https://www.figma.com/design/LorGLqilmfYrIQp72jTOHB/Design-System?node-id=903-635';

const PAGINATION_PAGE_CODE = `const EASE_OUT = [0.22, 1, 0.36, 1];

// tło aktywnej strony: jeden element, który przejeżdża do nowego numeru
<button aria-current={isCurrent ? 'page' : undefined} className="item">
  {isCurrent && (
    <motion.span
      layoutId={indicatorId} // useId() — osobne dla każdej paginacji na stronie
      className="indicator" // position: absolute; inset: 0; background: var(--estigroup-primary)
      transition={{ duration: 0.25, ease: EASE_OUT }}
    />
  )}
  <span className="label">{page}</span>
</button>

// .label { transition: color 250ms cubic-bezier(0.22, 1, 0.36, 1); }
// .item[aria-current='page'] .label { color: var(--buttons-text-primary); }`;

const PAGINATION_SHIFT_CODE = `// przyciski mają stałe pozycje (key = indeks) — zmieniają się tylko numery
const labelMotion = {
  enter: (dir) => ({ opacity: 0, x: 2 * dir }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      x: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
  },
  exit: (dir) => ({ opacity: 0, x: -2 * dir, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }),
};

// dir: 1 — przejście dalej, −1 — wstecz; stary i nowy numer w tej samej komórce grid
<span className="label">
  <AnimatePresence initial={false} custom={dir}>
    <motion.span key={label} custom={dir} variants={labelMotion} initial="enter" animate="center" exit="exit">
      {label}
    </motion.span>
  </AnimatePresence>
</span>`;

const PAGINATION_STATES_CODE = `.item,
.arrow {
  background: var(--buttons-button-transparent, transparent);
  transition:
    background-color 150ms cubic-bezier(0.22, 1, 0.36, 1),
    color 150ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 150ms cubic-bezier(0.22, 1, 0.36, 1);
}

.item:hover:not(:disabled):not([aria-current='page']),
.arrow:hover:not(:disabled) {
  background: var(--buttons-button-transparent-hover, rgba(24, 24, 27, 0.06));
}

/* wciśnięta strzałka — od razu; po puszczeniu wygasa w 150 ms */
.arrow:active:not(:disabled) {
  color: var(--buttons-text-primary, #fff);
  background: var(--estigroup-primary, #3582ce);
  transition-duration: 0s;
}

.item:focus-visible,
.arrow:focus-visible {
  box-shadow: inset 0 0 0 2px var(--estigroup-primary, #3582ce);
}

.arrow:disabled {
  color: var(--foregrounds-fg-subtle, #52525b);
  cursor: default;
}`;

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
    files: ['components/Menu.tsx', 'components/Select.tsx', 'components/MenuButton.tsx', 'components/motion.ts'],
    keywords: ['dropdown', 'lista rozwijana', 'select menu', 'popover', 'flyout'],
    entries: [
      {
        id: 'menu-select-pojawienie-sie',
        title: 'Select — pojawienie się',
        description:
          'Menu wysuwa się spod pola: pojawia się, opada o 2 px i dorasta do pełnej wielkości od krawędzi przy polu. Otwiera się kliknięciem w pole albo klawiszem (Enter, Spacja, strzałki).',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'y', value: '−2 px → 0', source: 'propozycja' },
          { property: 'scale', value: '0.98 → 1', source: 'propozycja' },
          { property: 'y, scale — timing', value: '250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'transform-origin', value: 'top — krawędź przy polu', source: 'propozycja' },
          { property: 'trigger', value: 'klik w pole · Enter · Spacja · ↓ ↑', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.2 s', source: 'a11y' },
        ],
        code: MENU_SELECT_OPEN_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie menu nie ma animacji</strong> — ani w Design Systemie, ani w Platform for
              dealers (2130:17715). Wartości to propozycja we wspólnym stylu (sekcja „Styl animacji”).
            </p>
            <p>
              Oba menu — pod polem i pod przyciskiem — animują się tak samo; różni je tylko punkt, z
              którego rosną (<code>transform-origin</code>).
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
          'Po wyborze opcji, kliknięciu poza menu albo Esc menu cofa się pod pole tą samą drogą — szybciej, niż się otwierało.',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '1 → 0', source: 'propozycja' },
          { property: 'y', value: '0 → −2 px', source: 'propozycja' },
          { property: 'scale', value: '1 → 0.98', source: 'propozycja' },
          { property: 'timing', value: '150 ms · cubic-bezier(0.4, 0, 1, 1) — wszystkie właściwości', source: 'propozycja' },
          { property: 'transform-origin', value: 'top', source: 'propozycja' },
          { property: 'trigger', value: 'wybór opcji · klik poza menu · Esc · Tab', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.15 s', source: 'a11y' },
        ],
        code: MENU_SELECT_CLOSE_CODE,
        notes: (
          <>
            <p>
              Zamknięcie jest krótsze od otwarcia i przyspiesza do końca (ease-in) — po wyborze opcji
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
          'Menu akcji wyrasta z prawego górnego rogu przycisku „⋯”: pojawia się, opada o 2 px i dorasta z 98%. Otwarte klawiaturą ustawia fokus na pierwszej pozycji.',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'y', value: '−2 px → 0', source: 'propozycja' },
          { property: 'scale', value: '0.98 → 1', source: 'propozycja' },
          { property: 'y, scale — timing', value: '250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'transform-origin', value: 'top right — róg przycisku', source: 'propozycja' },
          { property: 'trigger', value: 'klik w przycisk · Enter · Spacja · ↓ ↑', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.2 s', source: 'a11y' },
        ],
        code: MENU_BUTTON_OPEN_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie menu nie ma animacji</strong> — wartości to propozycja we wspólnym stylu,
              ten sam przepis co menu pod polem Select.
            </p>
            <p>
              Tło przycisku: domyślne i hover z tokenów design systemu (<code>buttons/button-transparent</code>,{' '}
              <code>-hover</code> — jak w paginacji), przy otwartym menu <code>rgba(24, 24, 27, 0.1)</code> z
              Figmy.
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
          'Po wyborze akcji, kliknięciu poza menu albo Esc menu cofa się do rogu przycisku i gaśnie.',
        figmaNode: '81:993',
        figmaUrl: DS_SELECT_FIGMA_URL,
        params: [
          { property: 'opacity', value: '1 → 0', source: 'propozycja' },
          { property: 'y', value: '0 → −2 px', source: 'propozycja' },
          { property: 'scale', value: '1 → 0.98', source: 'propozycja' },
          { property: 'timing', value: '150 ms · cubic-bezier(0.4, 0, 1, 1) — wszystkie właściwości', source: 'propozycja' },
          { property: 'transform-origin', value: 'top right', source: 'propozycja' },
          { property: 'trigger', value: 'wybór akcji · klik poza menu · Esc · Tab', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.15 s', source: 'a11y' },
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
  {
    id: 'paginacja',
    name: 'Paginacja',
    summary:
      'Nawigacja między stronami listy (Pagination z design systemu): Default z wielokropkiem, Compact z trzema stronami i Mini z samymi strzałkami.',
    files: ['components/Pagination.tsx', 'components/motion.ts'],
    keywords: ['pagination', 'strony', 'stronicowanie', 'nawigacja'],
    entries: [
      {
        id: 'paginacja-zmiana-strony',
        title: 'Zmiana strony',
        description:
          'Po kliknięciu numeru tło aktywnej strony przejeżdża do nowego numeru, a kolory cyfr płynnie się zamieniają. Tło to jeden element — nie gaśnie w starym miejscu i nie zapala się w nowym.',
        figmaNode: '903:635',
        figmaUrl: DS_PAGINATION_FIGMA_URL,
        params: [
          { property: 'tło aktywnej strony', value: 'przesunięcie do nowego numeru · 250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'kolor numeru', value: '#18181b ↔ #ffffff · 250 ms · ta sama krzywa', source: 'propozycja' },
          { property: 'kolor tła', value: 'Estigroup/primary #3582ce', source: 'Figma' },
          { property: 'trigger', value: 'klik w numer · strzałki, gdy zakres się nie zmienia', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'tło przeskakuje bez ruchu', source: 'a11y' },
        ],
        code: PAGINATION_PAGE_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie paginacja nie ma animacji</strong> — wartości to propozycja we wspólnym
              stylu (sekcja „Styl animacji”).
            </p>
            <p>
              Każda paginacja na stronie potrzebuje własnego <code>layoutId</code> (w komponencie:{' '}
              <code>useId()</code>), inaczej tło przeskoczy między dwiema paginacjami.
            </p>
          </>
        ),
        keywords: ['aktywna strona', 'wskaźnik', 'indicator', 'layoutId'],
        preview: <PaginationDemo mode="page" />,
      },
      {
        id: 'paginacja-przesuniecie-zakresu',
        title: 'Przesunięcie zakresu',
        description:
          'Gdy zmiana strony przesuwa widoczny zakres (1 … 4 5 6 … 20), przyciski zostają na miejscach, a numery zmieniają się z przesunięciem o 2 px w kierunku ruchu. Tło aktywnej strony stoi.',
        figmaNode: '903:635',
        figmaUrl: DS_PAGINATION_FIGMA_URL,
        params: [
          { property: 'nowy numer — opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'nowy numer — x', value: '±2 px → 0 · 250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'stary numer', value: 'opacity → 0, x → ∓2 px · 150 ms · cubic-bezier(0.4, 0, 1, 1)', source: 'propozycja' },
          { property: 'kierunek', value: 'dalej: numery płyną w lewo · wstecz: w prawo', source: 'propozycja' },
          { property: 'zakres (Default)', value: '1 … strona ±1 … ostatnia · 7 pozycji', source: 'Figma + decyzja FE' },
          { property: 'fokus', value: 'z numeru przechodzi na aktywną stronę', source: 'a11y' },
          { property: 'prefers-reduced-motion', value: 'bez przesunięcia, sam fade', source: 'a11y' },
        ],
        code: PAGINATION_SHIFT_CODE,
        notes: (
          <>
            <p>
              W Figmie „Page Mid” pokazuje <code>1 … 3 4 5 … 9</code> bez zaznaczonej strony. W kodzie zakres
              to strona ±1 (np. <code>1 … 4 5 6 … 9</code>), więc wielokropek nigdy nie zasłania pojedynczej
              strony.
            </p>
            <p>
              Przyciski mają stałe pozycje (<code>key</code> = indeks), dlatego kliknięty numer może
              przesunąć się na sąsiedni przycisk — fokus klawiatury idzie za aktywną stroną.
            </p>
          </>
        ),
        keywords: ['zakres', 'wielokropek', 'ellipsis', 'numery', 'kierunek'],
        preview: <PaginationDemo mode="shift" />,
      },
      {
        id: 'paginacja-stany',
        title: 'Hover, wciśnięcie i fokus',
        description:
          'Stany przycisków z Figmy z łagodnymi przejściami: tło przy najechaniu, niebieska strzałka przy wciśnięciu, obramowanie przy fokusie z klawiatury i wyłączona strzałka na pierwszej oraz ostatniej stronie.',
        figmaNode: '903:635',
        figmaUrl: DS_PAGINATION_FIGMA_URL,
        params: [
          { property: 'hover', value: 'tło rgba(24, 24, 27, 0.06) · 150 ms · ease-out', source: 'Figma (kolor) · propozycja (czas)' },
          { property: 'wciśnięta strzałka', value: 'tło #3582ce, biała strzałka · od razu, powrót 150 ms', source: 'Figma (Active) · propozycja (czas)' },
          { property: 'fokus', value: 'obramowanie 2 px #3582ce', source: 'Figma (Focus)' },
          { property: 'wyłączona strzałka', value: 'kolor #52525b, bez hover', source: 'Figma (Disabled)' },
          { property: 'Mini', value: 'same strzałki szerokości znaku; wciśnięta — niebieski znak zamiast tła', source: 'Figma · decyzja FE' },
        ],
        code: PAGINATION_STATES_CODE,
        notes: (
          <p>
            Warianty według notatek w Figmie: Default — dużo stron, z wielokropkiem; Compact — okno trzech
            stron; Mini — same strzałki do ciasnych miejsc.
          </p>
        ),
        keywords: ['hover', 'focus', 'disabled', 'compact', 'mini', 'strzałki'],
        preview: <PaginationDemo mode="states" />,
      },
    ],
  },
];

/* ── Menu i indeks wyszukiwarki (liczone z treści) ────────────────────────── */

const NAV: NavGroup[] = [
  {
    label: 'Ogólne',
    items: [
      { id: 'wprowadzenie', title: 'Wprowadzenie' },
      { id: 'styl-animacji', title: 'Styl animacji' },
    ],
  },
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

const paramFields = (params: MotionParam[]) =>
  params.map((param) => ({
    label: 'Parametr',
    text: [param.property, param.value, param.source].filter(Boolean).join(' · '),
    weight: 5,
  }));

const SEARCH_DOCS: SearchDoc[] = [
  { href: '#wprowadzenie', title: 'Wprowadzenie', fields: [{ label: 'Wstęp', text: INTRO_LEAD, weight: 3 }] },
  {
    href: '#styl-animacji',
    title: 'Styl animacji',
    fields: [
      { label: 'Opis', text: MOTION_STYLE_SUMMARY, weight: 3 },
      ...keywordsField(['tokeny', 'easing', 'czasy', 'duration', 'motion', 'wspólny styl']),
      ...paramFields(MOTION_STYLE),
    ],
  },
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
        ...paramFields(entry.params),
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

        <section id="styl-animacji" className={styles.component} aria-labelledby="styl-animacji-title">
          <header className={styles.componentHeader}>
            <h2 id="styl-animacji-title" className={styles.componentTitle}>
              Styl animacji
            </h2>
            <p className={styles.componentSummary}>{MOTION_STYLE_SUMMARY}</p>
            <p className={styles.meta}>
              Kod: <code>components/motion.ts</code> · zmienne CSS <code>--motion-*</code> w{' '}
              <code>app/globals.css</code> · Toast ma własne wartości z Figmy.
            </p>
          </header>

          <table className={styles.tokens}>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Wartość</th>
                <th scope="col">Gdzie</th>
              </tr>
            </thead>
            <tbody>
              {MOTION_STYLE.map((row) => (
                <tr key={row.property}>
                  <th scope="row">{row.property}</th>
                  <td>
                    <code>{row.value}</code>
                  </td>
                  <td>{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

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
