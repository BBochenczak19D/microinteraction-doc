'use client';

import { Fragment, type ReactNode } from 'react';

import MotionEntry, { type MotionParam } from '@/components/motion-docs/MotionEntry';
import Sidebar, { type NavGroup } from '@/components/motion-docs/Sidebar';
import DatePickerDemo from '@/components/motion-docs/demos/DatePickerDemo';
import MenuButtonDemo from '@/components/motion-docs/demos/MenuButtonDemo';
import ModalDemo from '@/components/motion-docs/demos/ModalDemo';
import PaginationDemo from '@/components/motion-docs/demos/PaginationDemo';
import SegmentedControlDemo from '@/components/motion-docs/demos/SegmentedControlDemo';
import SelectDemo from '@/components/motion-docs/demos/SelectDemo';
import ToastDemo from '@/components/motion-docs/demos/ToastDemo';
import TooltipDemo from '@/components/motion-docs/demos/TooltipDemo';
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
  { property: 'pojawienie się, ruch', value: '250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'menu, kalendarz, tooltip, okno modala, tło aktywnej strony, segmentu i dnia, wysokość stopki modala' },
  { property: 'fade przy pojawieniu', value: '200 ms · ta sama krzywa', source: 'menu, kalendarz, tooltip, okno modala, numery paginacji, miesiące, widoki kalendarza, loader w stopce' },
  { property: 'zniknięcie', value: '150 ms · cubic-bezier(0.4, 0, 1, 1)', source: 'menu, kalendarz, tooltip, okno modala, numery paginacji, miesiące, widoki kalendarza, przyciski w stopce' },
  { property: 'zmiana stanu', value: '150 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'hover, fokus, wciśnięcie, zaznaczenie radio' },
  { property: 'dystans', value: '2 px', source: 'menu i kalendarz (y), tooltip (od elementu), numery paginacji i miesiące (x)' },
  { property: 'skala', value: '0.98 → 1', source: 'menu, kalendarz, tooltip, okno modala, widoki miesięcy i lat, loader w stopce' },
  { property: 'panel zza krawędzi', value: '350 ms wejście · 250 ms wyjście · te same krzywe', source: 'bottom sheet (mobile) i tło pod nim' },
  { property: 'opóźnienia tooltipa', value: 'pokazanie 400 ms · ukrycie 100 ms · kolejny bez opóźnienia przez 300 ms', source: 'tooltip' },
  { property: 'loader', value: 'pełny obrót 1.2 s · liniowo', source: 'stopka modala (Type=Loader)' },
  { property: 'prefers-reduced-motion', value: 'bez ruchu, same fade’y w tych samych czasach; loader dalej się obraca', source: 'wszystkie' },
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

/* ── Segment control ── */

const DS_SEGMENT_FIGMA_URL =
  'https://www.figma.com/design/LorGLqilmfYrIQp72jTOHB/Design-System?node-id=349-757';

const SEGMENT_SWITCH_CODE = `// tło aktywnego segmentu: jeden element, który przejeżdża do wybranej opcji
<div role="radiogroup" className="control">
  {options.map((option) => (
    <button key={option.value} role="radio" aria-checked={option.value === value} className="item">
      {option.value === value && (
        <motion.span
          layoutId={indicatorId} // useId() — osobne dla każdej kontrolki na stronie
          className="indicator" // position: absolute; inset: 0; background: var(--backgrounds-bg-field-component)
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <option.icon className="icon" />
      <span className="label">{option.label}</span>
    </button>
  ))}
</div>

// .item { transition: color 250ms cubic-bezier(0.22, 1, 0.36, 1); }
// .icon, .label { position: relative; } — nad tłem`;

const SEGMENT_STATES_CODE = `.item:hover:not(:disabled) {
  color: var(--foregrounds-fg-base, #18181b);
  transition-duration: 150ms;
}

.indicator {
  transition: background-color 150ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Active Hover / Active Pressed — Uniwersal */
.item:hover .indicator {
  background: var(--backgrounds-bg-field-component-hover, #fafafa);
}

.item:active .indicator {
  background: var(--backgrounds-bg-base-pressed, #e4e4e7);
  transition-duration: 0s;
}

/* Estigroup */
.control[data-brand='estigroup'] .indicator {
  background: var(--backgrounds-bg-interactive, #3582ce);
}

.control[data-brand='estigroup'] .item:hover .indicator {
  background: var(--backgrounds-bg-interactive-hover, #0069a8);
}

.control[data-brand='estigroup'] .item:active .indicator {
  background: var(--backgrounds-bg-interactive-pressed, #00598a);
}`;

/* ── Date picker ── */

const DS_DATEPICKER_FIGMA_URL =
  'https://www.figma.com/design/LorGLqilmfYrIQp72jTOHB/Design-System?node-id=94-13340';

const DATEPICKER_OPEN_CODE = `// ten sam przepis co menu — popoverMotion w components/motion.ts
const EASE_OUT = [0.22, 1, 0.36, 1];

// .popover { position: absolute; top: calc(100% + 8px); left: 0; transform-origin: top left; }
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      key="calendar"
      role="dialog"
      className="popover"
      initial={{ opacity: 0, y: -2, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { opacity: { duration: 0.2, ease: EASE_OUT }, default: { duration: 0.25, ease: EASE_OUT } },
      }}
      exit={{ opacity: 0, y: -2, scale: 0.98, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
    >
      <Calendar … />
    </motion.div>
  )}
</AnimatePresence>`;

const DATEPICKER_MONTH_CODE = `// swapMotion w components/motion.ts; custom = kierunek: 1 następny miesiąc, −1 poprzedni
const swapMotion = {
  enter: (dir) => ({ opacity: 0, x: 2 * dir }),
  center: {
    opacity: 1,
    x: 0,
    pointerEvents: 'auto',
    transition: {
      opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      x: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
  },
  exit: (dir) => ({ opacity: 0, x: -2 * dir, pointerEvents: 'none', transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }),
};

// stary i nowy miesiąc w tej samej komórce grid — nakładają się, a wysokość stoi (zawsze 6 tygodni)
<div style={{ display: 'grid' }}>
  <AnimatePresence initial={false} custom={dir}>
    <motion.div key={monthKey} style={{ gridArea: '1 / 1' }} custom={dir} variants={swapMotion} initial="enter" animate="center" exit="exit">
      {weeks}
    </motion.div>
  </AnimatePresence>
</div>`;

const DATEPICKER_DAY_CODE = `// tło wybranego dnia: jeden element, który przejeżdża do nowego dnia
<button data-selected={isSelected} className="cell">
  {isSelected && (
    <motion.span
      layoutId={\`\${calendarId}-day-\${monthKey}\`} // miesiąc w id — tło nie przelatuje między miesiącami
      className="selected" // position: absolute; inset: 0; background: var(--backgrounds-bg-interactive)
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    />
  )}
  <span className="label">{day}</span>
</button>

// .label { transition: color 250ms cubic-bezier(0.22, 1, 0.36, 1); }
// .cell:hover:not([data-selected='true']) { background: var(--backgrounds-bg-base-hover); transition: background-color 150ms; }`;

const DATEPICKER_VIEW_CODE = `// viewMotion w components/motion.ts — nowy widok dorasta z 0.98, stary gaśnie
const EASE_OUT = [0.22, 1, 0.36, 1];
const viewMotion = {
  enter: { opacity: 0, scale: 0.98 },
  center: {
    opacity: 1,
    scale: 1,
    pointerEvents: 'auto',
    transition: { opacity: { duration: 0.2, ease: EASE_OUT }, default: { duration: 0.25, ease: EASE_OUT } },
  },
  exit: { opacity: 0, pointerEvents: 'none', transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
};

// dni, miesiące i lata mają tę samą wysokość (272 px) i leżą w jednej komórce grid
<AnimatePresence initial={false}>
  <motion.div key={view} style={{ gridArea: '1 / 1' }} variants={viewMotion} initial="enter" animate="center" exit="exit">
    {view === 'days' ? <Days /> : view === 'months' ? <Months /> : <Years />}
  </motion.div>
</AnimatePresence>`;

/* ── Tooltip ── */

const DS_TOOLTIP_FIGMA_URL =
  'https://www.figma.com/design/LorGLqilmfYrIQp72jTOHB/Design-System?node-id=671-207';

const TOOLTIP_HOVER_CODE = `// anchoredMotion w components/motion.ts — ten sam przepis co menu, z dowolnej strony
const EASE_OUT = [0.22, 1, 0.36, 1];
const TOWARD_ANCHOR = { top: { y: 2 }, bottom: { y: -2 }, left: { x: 2 }, right: { x: -2 } };

const tooltipMotion = {
  closed: (side) => ({
    opacity: 0,
    scale: 0.98,
    x: 0,
    y: 0,
    ...TOWARD_ANCHOR[side],
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  }),
  open: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { opacity: { duration: 0.2, ease: EASE_OUT }, default: { duration: 0.25, ease: EASE_OUT } },
  },
};

// najechanie: pokaż po 400 ms · zjechanie: ukryj po 100 ms · fokus z klawiatury: od razu
<AnimatePresence>
  {isOpen && (
    <motion.div
      key="tooltip"
      role="tooltip"
      id={tooltipId} // na elemencie: aria-describedby={tooltipId}
      data-side={side} // [data-side='top'] { transform-origin: bottom center; }
      custom={side}
      variants={tooltipMotion}
      initial="closed"
      animate="open"
      exit="closed"
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>`;

const TOOLTIP_PLACEMENT_CODE = `/* tooltip rośnie od krawędzi przy elemencie */
.tooltip[data-side='top'] { transform-origin: bottom center; }
.tooltip[data-side='bottom'] { transform-origin: top center; }
.tooltip[data-side='left'] { transform-origin: center right; }
.tooltip[data-side='right'] { transform-origin: center left; }

// położenie: portal do body, position: fixed, 8 px od elementu
const side = fits(preferred) || !fits(opposite(preferred)) ? preferred : opposite(preferred);
// top:    top = trigger.top - 8 - height;   left = środek elementu - width / 2 (w granicach okna)
// bottom: top = trigger.bottom + 8
// left:   left = trigger.left - 8 - width;  top = środek elementu - height / 2
// right:  left = trigger.right + 8`;

const TOOLTIP_TYPES_CODE = `import Tooltip, { Kbd, TooltipDivider, TooltipText } from '@/components/Tooltip';

// Type=Text — sam tekst
<Tooltip content="Oznacz jako sprzedany">
  <button type="button" aria-label="Oznacz jako sprzedany">…</button>
</Tooltip>

// Type=Shortcut
<Tooltip content={<TooltipText>Szukaj <Kbd>⌘</Kbd><Kbd>/</Kbd></TooltipText>}>…</Tooltip>

// Type=Items / Address — sekcje po 8 px rozdzielone kropkami
<Tooltip
  content={
    <>
      <div className="section">…</div>
      <TooltipDivider />
      <div className="section">…</div>
    </>
  }
>
  …
</Tooltip>`;

/* ── Modal ── */

const DS_MODAL_FIGMA_URL =
  'https://www.figma.com/design/LorGLqilmfYrIQp72jTOHB/Design-System?node-id=803-168';

const MODAL_MOBILE_CODE = `// sheetMotion i overlayMotion w components/motion.ts
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_IN = [0.4, 0, 1, 1];

// .sheet { position: absolute; left: 0; right: 0; bottom: 0; top: 56px; border-radius: 16px 16px 0 0; }
<AnimatePresence>
  {isOpen && (
    <div key="modal" className="layer">
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } }}
        exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE_IN } }}
        onClick={close}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { duration: 0.35, ease: EASE_OUT } }}
        exit={{ y: '100%', transition: { duration: 0.25, ease: EASE_IN } }}
      >
        …
      </motion.div>
    </div>
  )}
</AnimatePresence>`;

const MODAL_DESKTOP_CODE = `// dialogMotion w components/motion.ts — jak menu, ale od środka i bez przesunięcia
const EASE_OUT = [0.22, 1, 0.36, 1];
const EXIT = { duration: 0.15, ease: [0.4, 0, 1, 1] };

// .dialog { position: absolute; inset: 0; margin: auto; width: min(1469px, 100% - 48px); height: min(776px, 100% - 48px); }
<AnimatePresence>
  {isOpen && (
    <div key="modal" className="layer">
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
        exit={{ opacity: 0, transition: EXIT }}
        onClick={close}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="dialog"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { opacity: { duration: 0.2, ease: EASE_OUT }, default: { duration: 0.25, ease: EASE_OUT } },
        }}
        exit={{ opacity: 0, scale: 0.98, transition: EXIT }}
      >
        …
      </motion.div>
    </div>
  )}
</AnimatePresence>`;

const MODAL_SAVING_CODE = `// viewMotion w components/motion.ts — przyciski i loader w tym samym miejscu
// height = offsetHeight stanu, który się pojawia (69 ↔ 88 px na desktopie)
<div className="footer" style={{ height }}>
  <AnimatePresence initial={false}>
    {saving ? (
      <motion.div key="saving" className="saving" variants={viewMotion} initial="enter" animate="center" exit="exit">
        <LoaderIcon spinClassName="spin" />
        <span>Zapisywanie zmian</span>
      </motion.div>
    ) : (
      <motion.div key="actions" className="actions" variants={viewMotion} initial="enter" animate="center" exit="exit">
        <button type="button" className="secondary" onClick={close}>Anuluj</button>
        <button type="button" className="primary" onClick={save}>Zapisz</button>
      </motion.div>
    )}
  </AnimatePresence>
</div>

/* .actions, .saving { position: absolute; top: 0; left: 0; right: 0; } */
.footer { transition: height 250ms cubic-bezier(0.22, 1, 0.36, 1); }
.spin {
  transform-box: view-box;
  transform-origin: 21.83px 19.57px; /* środek okręgu łuków, nie ramki */
  animation: spin 1.2s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }`;

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
  {
    id: 'segment-control',
    name: 'Segment control',
    summary:
      'Przełącznik jednej z kilku opcji (Segmented control z design systemu, 2–4 opcje), np. widok listy, kafelków albo mapy.',
    files: ['components/SegmentedControl.tsx', 'components/motion.ts'],
    keywords: ['segmented control', 'przełącznik', 'zakładki', 'tabs', 'toggle'],
    entries: [
      {
        id: 'segment-przelaczenie',
        title: 'Przełączenie',
        description:
          'Po kliknięciu opcji tło aktywnego segmentu przejeżdża pod nią, a etykiety płynnie zamieniają kolory — tak samo jak tło aktywnej strony w paginacji.',
        figmaNode: '349:757',
        figmaUrl: DS_SEGMENT_FIGMA_URL,
        params: [
          { property: 'tło aktywnego segmentu', value: 'przesunięcie do wybranej opcji · 250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'kolor etykiety i ikony', value: '#71717a ↔ #18181b · 250 ms · ta sama krzywa', source: 'propozycja (kolory: Figma)' },
          { property: 'tło (Uniwersal)', value: '#ffffff + cień card-rest', source: 'Figma' },
          { property: 'trigger', value: 'klik · strzałki ← → ↑ ↓ · Home / End', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'tło przeskakuje bez ruchu', source: 'a11y' },
        ],
        code: SEGMENT_SWITCH_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie segment control nie ma animacji</strong> — wartości to propozycja we wspólnym
              stylu (sekcja „Styl animacji”), ten sam przepis co tło aktywnej strony w paginacji.
            </p>
            <p>
              Tło to jeden element z <code>layoutId</code>; każda kontrolka na stronie potrzebuje własnego id
              (<code>useId()</code>). Dostępność: <code>radiogroup</code> — Tab wchodzi na wybraną opcję,
              strzałki zmieniają wybór.
            </p>
          </>
        ),
        keywords: ['przełączenie', 'wybór', 'radiogroup', 'layoutId', 'wskaźnik'],
        preview: <SegmentedControlDemo mode="switch" />,
      },
      {
        id: 'segment-stany',
        title: 'Hover, wciśnięcie i marki',
        description:
          'Stany z Figmy z łagodnymi przejściami: ciemniejsza etykieta przy najechaniu, jaśniejsze albo ciemniejsze tło aktywnego segmentu przy najechaniu i wciśnięciu oraz trzy warianty marki.',
        figmaNode: '349:757',
        figmaUrl: DS_SEGMENT_FIGMA_URL,
        params: [
          { property: 'hover', value: 'etykieta #71717a → #18181b · 150 ms', source: 'Figma (kolor) · propozycja (czas)' },
          { property: 'hover aktywnego', value: 'tło #fafafa · Estigroup #0069a8 · Estimoto #fefce8 · 150 ms', source: 'Figma (Active Hover) · propozycja (czas)' },
          { property: 'wciśnięcie aktywnego', value: 'tło #e4e4e7 · Estigroup #00598a · Estimoto #fef9c2 · od razu, powrót 150 ms', source: 'Figma (Active Pressed) · propozycja (czas)' },
          { property: 'wyłączona opcja', value: 'etykieta #a1a1aa, bez hover', source: 'Figma (Disabled)' },
          { property: 'marki', value: 'Uniwersal — białe tło · Estigroup — #3582ce · Estimoto — ramka #f8af38', source: 'Figma' },
        ],
        code: SEGMENT_STATES_CODE,
        notes: (
          <p>
            Ramka kontenera jest rysowana cieniem w środku (<code>inset 0 0 0 1px</code>), żeby padding 4 px i
            wysokość 40 px zgadzały się z Figmą. Kolumny są równe i dopasowane do najdłuższej etykiety, minimum
            320 px.
          </p>
        ),
        keywords: ['hover', 'pressed', 'disabled', 'marka', 'estigroup', 'estimoto', 'uniwersal'],
        preview: <SegmentedControlDemo mode="states" />,
      },
    ],
  },
  {
    id: 'date-picker',
    name: 'Date picker',
    summary:
      'Pole z kalendarzem do wyboru jednej daty (Date Picker z design systemu): pole Large i kalendarz 296 × 336 z widokami miesięcy i lat.',
    files: ['components/DatePicker.tsx', 'components/motion.ts'],
    keywords: ['kalendarz', 'data', 'datepicker', 'calendar'],
    entries: [
      {
        id: 'date-picker-otwarcie',
        title: 'Otwarcie i zamknięcie',
        description:
          'Kalendarz wysuwa się spod pola tak samo jak menu: pojawia się, opada o 2 px i dorasta z 98% od lewego górnego rogu. Zamyka się po wyborze dnia, kliknięciu poza nim albo Esc.',
        figmaNode: '94:13340',
        figmaUrl: DS_DATEPICKER_FIGMA_URL,
        params: [
          { property: 'opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'y', value: '−2 px → 0', source: 'propozycja' },
          { property: 'scale', value: '0.98 → 1', source: 'propozycja' },
          { property: 'y, scale — timing', value: '250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'zamknięcie', value: '150 ms · cubic-bezier(0.4, 0, 1, 1) — do wartości startowych', source: 'propozycja' },
          { property: 'transform-origin', value: 'top left — róg przy polu', source: 'propozycja' },
          { property: 'trigger', value: 'klik w pole albo ikonę · zamykają: wybór dnia, klik poza, Esc', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu, fade 0.2 s / 0.15 s', source: 'a11y' },
        ],
        code: DATEPICKER_OPEN_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie date picker nie ma animacji</strong> — wartości to propozycja we wspólnym stylu,
              ten sam przepis co menu (<code>popoverMotion</code>).
            </p>
            <p>
              Kalendarz otwarty przez użytkownika ustawia fokus na wybranym dniu; po wyborze fokus wraca do
              pola. Otwarty z kodu fokusu nie zabiera.
            </p>
          </>
        ),
        keywords: ['popover', 'otwarcie', 'zamknięcie', 'dialog'],
        preview: <DatePickerDemo mode="popover" />,
      },
      {
        id: 'date-picker-zmiana-miesiaca',
        title: 'Zmiana miesiąca',
        description:
          'Strzałki w nagłówku (albo PageUp / PageDown) zmieniają miesiąc: nazwa i dni wjeżdżają o 2 px z kierunku zmiany, a poprzedni miesiąc odjeżdża i gaśnie.',
        figmaNode: '94:13340',
        figmaUrl: DS_DATEPICKER_FIGMA_URL,
        params: [
          { property: 'nowy miesiąc — opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'nowy miesiąc — x', value: '±2 px → 0 · 250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'stary miesiąc', value: 'opacity → 0, x → ∓2 px · 150 ms · cubic-bezier(0.4, 0, 1, 1)', source: 'propozycja' },
          { property: 'kierunek', value: 'następny: w lewo · poprzedni: w prawo', source: 'propozycja' },
          { property: 'wysokość', value: 'zawsze 6 tygodni (336 px) — nic nie skacze', source: 'Figma' },
          { property: 'trigger', value: 'strzałki w nagłówku · PageUp / PageDown · strzałkami poza miesiąc', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez przesunięcia, sam fade', source: 'a11y' },
        ],
        code: DATEPICKER_MONTH_CODE,
        notes: (
          <p>
            Ten sam przepis co numery w paginacji (<code>swapMotion</code>). Stary i nowy miesiąc leżą w jednej
            komórce siatki, a znikający nie łapie kliknięć.
          </p>
        ),
        keywords: ['miesiąc', 'nawigacja', 'strzałki', 'pageup', 'pagedown'],
        preview: <DatePickerDemo mode="month" />,
      },
      {
        id: 'date-picker-wybor-dnia',
        title: 'Wybór dnia',
        description:
          'Tło wybranego dnia przejeżdża do klikniętego dnia, a cyfry zamieniają kolory. Dzień pod kursorem dostaje jasne tło, a dzisiejszy ma kropkę.',
        figmaNode: '94:13340',
        figmaUrl: DS_DATEPICKER_FIGMA_URL,
        params: [
          { property: 'tło wybranego dnia', value: 'przesunięcie do nowego dnia · 250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'kolor cyfry', value: '#18181b ↔ #ffffff · 250 ms', source: 'propozycja (kolory: Figma)' },
          { property: 'kolor tła', value: 'backgrounds/bg-interactive #3582ce', source: 'Figma' },
          { property: 'hover', value: 'tło #f4f4f5 · 150 ms', source: 'Figma (kolor) · propozycja (czas)' },
          { property: 'fokus', value: 'ramka #3b82f6 + obwódka 3 px', source: 'Figma (Focus)' },
          { property: 'dzisiaj', value: 'kropka 3 px #3582ce (biała na wybranym dniu)', source: 'Figma' },
          { property: 'prefers-reduced-motion', value: 'tło przeskakuje bez ruchu', source: 'a11y' },
        ],
        code: DATEPICKER_DAY_CODE,
        notes: (
          <p>
            W <code>layoutId</code> jest numer miesiąca, więc przy zmianie miesiąca tło nie przelatuje ze starej
            siatki do nowej. Klawiatura: strzałki chodzą po dniach, Home / End skaczą na początek i koniec
            tygodnia.
          </p>
        ),
        keywords: ['dzień', 'wybór', 'zaznaczenie', 'dzisiaj', 'today', 'layoutId'],
        preview: <DatePickerDemo mode="day" />,
      },
      {
        id: 'date-picker-miesiace-lata',
        title: 'Miesiące i lata',
        description:
          'Klik w nazwę miesiąca albo rok w nagłówku przełącza kalendarz na siatkę miesięcy (3 × 4) albo lat (4 × 7): nowy widok dorasta z 98% i się pojawia, poprzedni gaśnie.',
        figmaNode: '94:13340',
        figmaUrl: DS_DATEPICKER_FIGMA_URL,
        params: [
          { property: 'nowy widok', value: 'opacity 0 → 1 (200 ms) · scale 0.98 → 1 (250 ms) · ease-out', source: 'propozycja' },
          { property: 'stary widok', value: 'opacity → 0 · 150 ms · ease-in', source: 'propozycja' },
          { property: 'nagłówek', value: 'nazwa gaśnie i się pojawia, bez przesunięcia', source: 'propozycja' },
          { property: 'strony lat', value: 'po 28 lat · jak zmiana miesiąca (±2 px)', source: 'propozycja' },
          { property: 'widoki', value: 'Month selected 3 × 4 · Year selected 4 × 7 · ta sama wysokość', source: 'Figma' },
          { property: 'kolejność', value: 'wybór roku wraca do miesięcy, wybór miesiąca — do dni', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez skali, sam fade', source: 'a11y' },
        ],
        code: DATEPICKER_VIEW_CODE,
        notes: (
          <p>
            Nagłówek w Figmie nie ma stanu hover — przy najechaniu nazwa miesiąca i rok dostają tło przycisku
            przezroczystego z design systemu (<code>button-transparent-hover</code>), żeby było widać, że są
            klikalne.
          </p>
        ),
        keywords: ['widok', 'miesiące', 'lata', 'rok', 'month selected', 'year selected'],
        preview: <DatePickerDemo mode="view" />,
      },
    ],
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    summary:
      'Krótka podpowiedź przy elemencie po najechaniu albo fokusie (Tooltip z design systemu) — siedem typów treści: Text, Shortcut, Return, Graph, Items, Address i Breadcrumbs.',
    files: ['components/Tooltip.tsx', 'components/motion.ts'],
    keywords: ['podpowiedź', 'hint', 'hover', 'najechanie', 'popover'],
    entries: [
      {
        id: 'tooltip-pojawienie-sie',
        title: 'Pojawienie się i zniknięcie',
        description:
          'Po najechaniu tooltip czeka 400 ms, potem pojawia się, odsuwa o 2 px od elementu i dorasta z 98%. Po zjechaniu kursorem gaśnie po 100 ms. Na sąsiednim elemencie kolejny tooltip pojawia się od razu.',
        figmaNode: '671:207',
        figmaUrl: DS_TOOLTIP_FIGMA_URL,
        params: [
          { property: 'opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'x / y', value: '2 px bliżej elementu → 0', source: 'propozycja' },
          { property: 'scale', value: '0.98 → 1', source: 'propozycja' },
          { property: 'x / y, scale — timing', value: '250 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'zniknięcie', value: '150 ms · cubic-bezier(0.4, 0, 1, 1) — do wartości startowych', source: 'propozycja' },
          { property: 'opóźnienie pokazania', value: '400 ms po najechaniu · fokus z klawiatury: od razu', source: 'propozycja' },
          { property: 'opóźnienie ukrycia', value: '100 ms — kursor zdąży przejść na tooltip', source: 'a11y (WCAG 1.4.13)' },
          { property: 'kolejny tooltip', value: 'bez opóźnienia, gdy poprzedni jest otwarty albo zamknął się < 300 ms temu', source: 'propozycja' },
          { property: 'trigger', value: 'najechanie · fokus z klawiatury · zamykają: zjechanie, blur, Esc, kliknięcie', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu i skali, fade 0.2 s / 0.15 s', source: 'a11y' },
        ],
        code: TOOLTIP_HOVER_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie tooltip nie ma animacji</strong> — wartości to propozycja we wspólnym stylu, ten sam
              przepis co menu (<code>anchoredMotion</code>; dla strony „bottom” to <code>popoverMotion</code>).
            </p>
            <p>
              Naraz otwarty jest jeden tooltip. Esc zamyka najpierw tooltip — modal pod nim zostaje otwarty. Na
              ekranach dotykowych tooltip się nie pojawia.
            </p>
          </>
        ),
        keywords: ['hover', 'opóźnienie', 'delay', 'fokus', 'escape', 'wejście', 'wyjście'],
        preview: <TooltipDemo mode="hover" />,
      },
      {
        id: 'tooltip-kierunki',
        title: 'Kierunki',
        description:
          'Tooltip może pojawić się nad, pod, z lewej albo z prawej strony elementu. Zawsze rośnie od krawędzi przy elemencie i odsuwa się od niego o 2 px.',
        figmaNode: '671:207',
        figmaUrl: DS_TOOLTIP_FIGMA_URL,
        params: [
          { property: 'odstęp od elementu', value: '8 px', source: 'propozycja (spacing-8)' },
          { property: 'transform-origin', value: 'top: bottom center · bottom: top center · left: center right · right: center left', source: 'propozycja' },
          { property: 'start ruchu', value: 'top: y +2 · bottom: y −2 · left: x +2 · right: x −2', source: 'propozycja' },
          { property: 'brak miejsca', value: 'przejście na przeciwną stronę; w poprzek — w granicach okna, 8 px od krawędzi', source: 'decyzja FE' },
          { property: 'położenie', value: 'portal do body, position: fixed, przeliczane przy przewijaniu', source: 'decyzja FE' },
        ],
        code: TOOLTIP_PLACEMENT_CODE,
        notes: (
          <p>
            Tooltip jest w portalu, więc nie obcina go <code>overflow: hidden</code> rodzica — działa też w przewijanej
            treści modala (ikony „i” w formularzu).
          </p>
        ),
        keywords: ['placement', 'strona', 'kierunek', 'transform-origin', 'portal', 'flip'],
        preview: <TooltipDemo mode="placement" />,
      },
      {
        id: 'tooltip-typy',
        title: 'Typy z Design Systemu',
        description:
          'Siedem typów z Figmy ma ten sam kontener i tę samą animację — zmienia się tylko treść: tekst, skrót klawiszowy, historia zwrotu, wykres, pozycje, adresy i ścieżka.',
        figmaNode: '671:1320',
        figmaUrl: DS_TOOLTIP_FIGMA_URL,
        params: [
          { property: 'kontener', value: 'bg #fafafa · radius 8 · cień Light/Elevation/tooltip', source: 'Figma' },
          { property: 'tekst', value: '12 / 20 px · Medium · #18181b, drugorzędny #52525b', source: 'Figma' },
          { property: 'Text, Shortcut, Breadcrumbs', value: 'padding 4 × 8 px · odstęp 6 px · Kbd 16 × 16', source: 'Figma' },
          { property: 'Return, Graph', value: 'padding 8 px · odstęp 4 px · Graph 160 px', source: 'Figma' },
          { property: 'Items, Address', value: 'sekcje po 8 px · separator z kropek 1 px co 3 px', source: 'Figma' },
          { property: 'animacja', value: 'wspólna dla wszystkich typów', source: 'propozycja' },
        ],
        code: TOOLTIP_TYPES_CODE,
        notes: (
          <p>
            Treść w Figmie to przykłady z Medusa UI (zwroty, SKU) — w podglądzie zamienione na przykłady z panelu
            dealera. Miniatura w typie Items to eksport z Figmy zmniejszony do 60 × 80 px.
          </p>
        ),
        keywords: ['text', 'shortcut', 'return', 'graph', 'items', 'address', 'breadcrumbs', 'kbd', 'skrót'],
        preview: <TooltipDemo mode="types" />,
      },
    ],
  },
  {
    id: 'modal',
    name: 'Modal',
    summary:
      'Okno do prostego wprowadzania danych (BottomSheet z design systemu): na mobile panel wysuwany z dołu, na desktopie okno na środku; w stopce przyciski albo loader podczas zapisu.',
    files: ['components/Modal.tsx', 'components/motion.ts'],
    keywords: ['bottom sheet', 'dialog', 'okno', 'popup', 'zapis', 'loader'],
    entries: [
      {
        id: 'modal-mobile',
        title: 'Mobile — otwarcie i zamknięcie',
        description:
          'Bottom sheet wjeżdża zza dolnej krawędzi ekranu o całą swoją wysokość, a tło pod nim ciemnieje w tym samym czasie. Zamyka się tą samą drogą — szybciej, niż się otwierał.',
        figmaNode: '803:689',
        figmaUrl: DS_MODAL_FIGMA_URL,
        params: [
          { property: 'panel — y', value: '100% → 0 · 350 ms · cubic-bezier(0.22, 1, 0.36, 1)', source: 'propozycja' },
          { property: 'tło — opacity', value: '0 → 1 · 350 ms · ta sama krzywa', source: 'propozycja' },
          { property: 'zamknięcie', value: 'y → 100%, tło → 0 · 250 ms · cubic-bezier(0.4, 0, 1, 1)', source: 'propozycja' },
          { property: 'panel', value: 'górne rogi 16 · obramowanie #e5e5e5 bez dołu · 56 px od góry ekranu', source: 'Figma (odstęp: decyzja FE)' },
          { property: 'tło', value: 'rgba(24, 24, 27, 0.4)', source: 'do potwierdzenia (w Figmie brak)' },
          { property: 'trigger', value: 'otwarcie z akcji · zamykają: ×, klik w tło, Esc, „Anuluj”', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez ruchu — panel i tło gasną i się pojawiają', source: 'a11y' },
        ],
        code: MODAL_MOBILE_CODE,
        notes: (
          <>
            <p>
              <strong>W Figmie modal nie ma animacji</strong> — wartości to propozycja we wspólnym stylu. Panel
              pokonuje całą wysokość ekranu, dlatego ma dłuższe czasy (350 / 250 ms) przy tych samych krzywych.
            </p>
            <p>
              Po otwarciu fokus przechodzi do modala, Tab zostaje w środku, a po zamknięciu fokus wraca do przycisku,
              który go otworzył.
            </p>
          </>
        ),
        keywords: ['bottom sheet', 'mobile', 'telefon', 'wysunięcie', 'overlay', 'tło'],
        preview: <ModalDemo mode="mobile" />,
      },
      {
        id: 'modal-web',
        title: 'Web — otwarcie i zamknięcie',
        description:
          'Na desktopie okno pojawia się na środku i dorasta z 98% — tak jak menu, ale od środka i bez przesunięcia. Tło pod nim ciemnieje razem z oknem.',
        figmaNode: '803:728',
        figmaUrl: DS_MODAL_FIGMA_URL,
        params: [
          { property: 'okno — opacity', value: '0 → 1 · 200 ms · ease-out', source: 'propozycja' },
          { property: 'okno — scale', value: '0.98 → 1 · 250 ms · cubic-bezier(0.22, 1, 0.36, 1) · od środka', source: 'propozycja' },
          { property: 'tło — opacity', value: '0 → 1 · 200 ms', source: 'propozycja' },
          { property: 'zamknięcie', value: 'okno i tło do wartości startowych · 150 ms · cubic-bezier(0.4, 0, 1, 1)', source: 'propozycja' },
          { property: 'okno', value: 'maks. 1469 × 776 px · rogi 16 · tytuł na środku · formularz maks. 720 px', source: 'Figma' },
          { property: 'trigger', value: 'otwarcie z akcji · zamykają: ×, klik w tło, Esc, „Anuluj”', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'bez skali, sam fade', source: 'a11y' },
        ],
        code: MODAL_DESKTOP_CODE,
        notes: (
          <p>
            Duże okno przy skali 0.98 „dojeżdża” o kilka pikseli z każdej strony — wystarczy, żeby było widać, skąd się
            wzięło. W wąskim oknie formularz przechodzi na jedną kolumnę (container query).
          </p>
        ),
        keywords: ['desktop', 'web', 'dialog', 'okno', 'overlay', 'skala'],
        preview: <ModalDemo mode="desktop" />,
      },
      {
        id: 'modal-zapisywanie',
        title: 'Zapisywanie — przyciski i loader',
        description:
          'Po „Zapisz” przyciski w stopce gasną, a na ich miejscu pojawia się loader z napisem „Zapisywanie zmian”. Gdy przyjdzie odpowiedź, modal zamyka się jak zwykle.',
        figmaNode: '809:4137',
        figmaUrl: DS_MODAL_FIGMA_URL,
        params: [
          { property: 'przyciski', value: 'opacity → 0 · 150 ms · ease-in', source: 'propozycja' },
          { property: 'loader', value: 'opacity 0 → 1 (200 ms) · scale 0.98 → 1 (250 ms) · ease-out', source: 'propozycja' },
          { property: 'wysokość stopki', value: 'desktop 69 → 88 px · 250 ms · ease-out · mobile bez zmiany (124 px)', source: 'Figma (wysokości) · propozycja (czas)' },
          { property: 'obrót loadera', value: '360° · 1.2 s · liniowo · wokół środka okręgu łuków', source: 'propozycja' },
          { property: 'w trakcie zapisu', value: 'formularz wyłączony (inert) · ×, tło i Esc nie zamykają', source: 'decyzja FE' },
          { property: 'po odpowiedzi', value: 'zamknięcie jak w wariancie urządzenia', source: 'decyzja FE' },
          { property: 'prefers-reduced-motion', value: 'zamiana bez skali, wysokość bez animacji; loader dalej się obraca', source: 'a11y' },
        ],
        code: MODAL_SAVING_CODE,
        notes: (
          <>
            <p>
              Figma: <code>BottomSheet / ActionButtons</code> — typ „buttons” i typ „loader”. Na mobile „Zapisz” jest
              nad „Anuluj”, na desktopie „Anuluj” z lewej; kolejność Tab jest taka jak na ekranie.
            </p>
            <p>
              Loader obraca się dalej przy <code>prefers-reduced-motion</code>, bo to informacja o stanie. Czytnik
              ekranu dostaje „Zapisywanie zmian” z regionu <code>role=&quot;status&quot;</code>.
            </p>
          </>
        ),
        keywords: ['loader', 'spinner', 'zapisywanie', 'ładowanie', 'odpowiedź', 'action buttons', 'stopka'],
        preview: <ModalDemo mode="saving" />,
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
    items: COMPONENTS.map((component) => ({ id: component.id, title: component.name })),
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
              Kod: <code>components/motion.ts</code> (gotowe przepisy: <code>popoverMotion</code>,{' '}
              <code>anchoredMotion</code>, <code>swapMotion</code>, <code>viewMotion</code>, <code>sheetMotion</code>,{' '}
              <code>dialogMotion</code>, <code>overlayMotion</code>, <code>moveTransition</code>) · zmienne CSS{' '}
              <code>--motion-*</code> w <code>app/globals.css</code> · Toast ma własne wartości z Figmy.
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
