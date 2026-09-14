'use client';

import { AnimatePresence } from 'framer-motion';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { CheckMiniIcon, TrianglesMiniIcon } from './icons';
import { MenuPanel } from './Menu';
import styles from './Select.module.css';

/* Select — pole z listą opcji.
 * Design System, strona „Select” (node 81:993): „Single / Multi Select” Large,
 * kolor bg-field-component + „Select Menu” z „Select Menu Items” Medium, typ Check.
 * Animacja menu: components/Menu.tsx.
 *
 * Dostępność: wzorzec „select-only combobox” — fokus zostaje na polu, a aktywną
 * opcję wskazuje aria-activedescendant. */

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  label: string;
  /** Obok etykiety, ale poza nią — np. ikona informacji z tooltipem (nie wchodzi do nazwy pola). */
  labelAddon?: ReactNode;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Otwarcie sterowane z zewnątrz. Bez tego Select pilnuje stanu sam. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/** Po tylu ms bez klawisza wpisywana fraza (np. „201”) zaczyna się od nowa. */
const TYPEAHEAD_RESET = 500;

export default function Select({
  label,
  labelAddon,
  options,
  value,
  onChange,
  placeholder = 'Wybierz',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: SelectProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const [activeIndex, setActiveIndex] = useState(-1);
  /** Aktywna opcja do odczytu w handlerach — dwa klawisze w jednej klatce nie widzą jeszcze nowego stanu. */
  const activeRef = useRef(-1);

  const controlRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: '', timer: 0 });

  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const scrollToOption = (index: number, center = false) => {
    const list = listRef.current;
    const option = list?.children[index] as HTMLElement | undefined;
    if (!list || !option) return;

    if (center) {
      list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
    } else if (option.offsetTop < list.scrollTop) {
      list.scrollTop = option.offsetTop;
    } else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  };

  const setActive = (index: number) => {
    activeRef.current = index;
    setActiveIndex(index);
  };

  const moveTo = (index: number) => {
    setActive(index);
    scrollToOption(index);
  };

  const choose = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
  };

  // Tylko w chwili otwarcia: aktywna = wybrana (albo pierwsza), przewinięta na środek — przed pierwszą klatką.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const index = Math.max(selectedIndex, 0);
    setActive(index);
    scrollToOption(index, true);
  }, [isOpen]);

  // Klik poza polem i menu zamyka.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  });

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveTo(Math.min(activeRef.current + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(Math.max(activeRef.current - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (options[activeRef.current]) choose(activeRef.current);
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          const state = typeahead.current;
          window.clearTimeout(state.timer);
          state.query += event.key.toLowerCase();
          state.timer = window.setTimeout(() => (state.query = ''), TYPEAHEAD_RESET);
          const match = options.findIndex((option) => option.label.toLowerCase().startsWith(state.query));
          if (match !== -1) moveTo(match);
        }
    }
  };

  // Klik w opcję nie zabiera fokusu z pola, więc klawiatura dalej działa (pasek przewijania — bez zmian).
  const keepFocusOnField = (event: MouseEvent<HTMLUListElement>) => {
    if ((event.target as HTMLElement).closest('[role="option"]')) event.preventDefault();
  };

  return (
    <div className={className ? `${styles.select} ${className}` : styles.select}>
      <div className={styles.labelRow}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {labelAddon}
      </div>

      <div ref={controlRef} className={styles.control}>
        <button
          type="button"
          role="combobox"
          className={styles.field}
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          onClick={() => setOpen(!isOpen)}
          onKeyDown={onKeyDown}
          onKeyUp={(event) => {
            // Spacja obsłużona w keydown nie może jeszcze „kliknąć” przy puszczeniu (Firefox)
            if (event.key === ' ') event.preventDefault();
          }}
        >
          <span className={styles.value} data-placeholder={!selected}>
            {selected ? selected.label : placeholder}
          </span>
          <span className={styles.inputButton} aria-hidden="true">
            <TrianglesMiniIcon className={styles.inputIcon} focusable="false" />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <MenuPanel key="menu" placement="select">
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                aria-labelledby={labelId}
                className={styles.list}
                onMouseDown={keepFocusOnField}
              >
                {options.map((option, index) => (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    data-active={index === activeIndex}
                    className={styles.option}
                    onClick={() => choose(index)}
                    onMouseMove={() => setActive(index)}
                  >
                    <CheckMiniIcon className={styles.check} aria-hidden="true" focusable="false" />
                    <span className={styles.optionLabel}>{option.label}</span>
                  </li>
                ))}
              </ul>
            </MenuPanel>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
