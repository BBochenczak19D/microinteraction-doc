'use client';

import { MagnifyingGlassIcon, XMarkIcon as ClearIcon } from '@heroicons/react/16/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { createSearchIndex, search, type Range, type SearchDoc } from './search';
import styles from './Sidebar.module.css';

export type NavItem = {
  /** Id sekcji na stronie — link prowadzi do „#id”. */
  id: string;
  title: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

type SidebarProps = {
  groups: NavGroup[];
  searchDocs: SearchDoc[];
};

/** Poniżej tej szerokości sidebar jest wysuwaną szufladą (musi się zgadzać z CSS). */
const DRAWER_QUERY = '(max-width: 959px)';

/** Sekcja jest „bieżąca”, gdy jej góra minie ten próg od górnej krawędzi okna (px). */
const SPY_OFFSET = 120;

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= SPY_OFFSET) current = id;
      }
      // Krótka ostatnia sekcja nigdy nie dojedzie do progu — na dole strony wygrywa ona.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActive(atBottom ? ids[ids.length - 1] : current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ids]);

  return active;
}

function resultsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return '1 wynik';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} wyniki`;
  return `${count} wyników`;
}

function Highlight({ text, ranges }: { text: string; ranges: Range[] }) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className={styles.mark}>
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export default function Sidebar({ groups, searchDocs }: SidebarProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const focusSearchOnOpen = useRef(false);
  const listId = useId();

  const index = useMemo(() => createSearchIndex(searchDocs), [searchDocs]);
  const hits = useMemo(() => search(index, query), [index, query]);
  const sectionIds = useMemo(() => groups.flatMap((group) => group.items.map((item) => item.id)), [groups]);
  const activeSection = useActiveSection(sectionIds);
  const isSearching = query.trim() !== '';

  const closeDrawer = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  };
  const closeOnNavigate = () => setIsOpen(false);

  // „/” albo Ctrl/⌘ + K — skok do wyszukiwarki (na telefonie najpierw otwiera szufladę).
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
      const isShortcut =
        (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !isTyping);
      if (!isShortcut) return;

      event.preventDefault();
      const input = inputRef.current;
      input?.focus();
      if (input && document.activeElement === input) {
        input.select();
      } else {
        focusSearchOnOpen.current = true;
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Otwarta szuflada: fokus do środka, blokada przewijania strony, Escape zamyka.
  useEffect(() => {
    if (!isOpen) return;

    (focusSearchOnOpen.current ? inputRef.current : closeButtonRef.current)?.focus();
    focusSearchOnOpen.current = false;

    const root = document.documentElement;
    const drawerQuery = window.matchMedia(DRAWER_QUERY);
    root.style.overflow = 'hidden';

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onViewportChange = () => {
      if (!drawerQuery.matches) setIsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    drawerQuery.addEventListener('change', onViewportChange);
    return () => {
      root.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      drawerQuery.removeEventListener('change', onViewportChange);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isSearching) resultsRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isSearching]);

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && hits.length) {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (event.key === 'ArrowUp' && hits.length) {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && hits[activeIndex]) {
      event.preventDefault();
      resultsRef.current?.querySelectorAll('a')[activeIndex]?.click();
    } else if (event.key === 'Escape') {
      if (query) {
        event.stopPropagation(); // pierwsze Escape czyści frazę, dopiero drugie zamyka szufladę
        setQuery('');
      } else if (!isOpen) {
        event.currentTarget.blur();
      }
    }
  };

  return (
    <>
      <div className={styles.topbar}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.iconButton}
          onClick={() => setIsOpen(true)}
          aria-label="Otwórz menu"
          aria-expanded={isOpen}
          aria-controls="docs-sidebar"
        >
          <Bars3Icon className={styles.icon} aria-hidden="true" />
        </button>
        <a href="#wprowadzenie" className={styles.topbarTitle}>
          Mikrointerakcje
        </a>
      </div>

      <div className={styles.backdrop} data-open={isOpen} onClick={() => closeDrawer(true)} aria-hidden="true" />

      <aside id="docs-sidebar" className={styles.sidebar} data-open={isOpen} aria-label="Nawigacja dokumentacji">
        <div className={styles.brand}>
          <a href="#wprowadzenie" className={styles.brandLink} onClick={closeOnNavigate}>
            <span className={styles.kicker}>Estigroup · Dealer Panel</span>
            <span className={styles.brandTitle}>Mikrointerakcje</span>
          </a>
          <button
            ref={closeButtonRef}
            type="button"
            className={`${styles.iconButton} ${styles.closeButton}`}
            onClick={() => closeDrawer(true)}
            aria-label="Zamknij menu"
          >
            <XMarkIcon className={styles.icon} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.search} role="search">
          <MagnifyingGlassIcon className={styles.searchIcon} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            className={styles.searchInput}
            placeholder="Szukaj…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onSearchKeyDown}
            role="combobox"
            aria-label="Szukaj w dokumentacji"
            aria-expanded={isSearching && hits.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={isSearching && hits[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Wyczyść wyszukiwanie"
            >
              <ClearIcon aria-hidden="true" />
            </button>
          ) : (
            <kbd className={styles.kbd} aria-hidden="true">
              /
            </kbd>
          )}
        </div>

        <div className={styles.scroll}>
          {isSearching ? (
            <div>
              <p className={styles.resultsMeta} role="status">
                {hits.length ? resultsLabel(hits.length) : `Brak wyników dla „${query.trim()}”`}
              </p>
              {hits.length ? (
                <ul ref={resultsRef} id={listId} role="listbox" aria-label="Wyniki wyszukiwania" className={styles.list}>
                  {hits.map((hit, i) => (
                    <li
                      key={hit.doc.href}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      className={styles.result}
                      data-active={i === activeIndex}
                      onMouseMove={() => setActiveIndex(i)}
                    >
                      <a href={hit.doc.href} tabIndex={-1} className={styles.resultLink} onClick={closeOnNavigate}>
                        <span className={styles.resultTitle}>
                          {hit.doc.section ? (
                            <>
                              <span className={styles.resultSection}>
                                <Highlight text={hit.doc.section} ranges={hit.sectionRanges} />
                              </span>
                              <span className={styles.resultSeparator} aria-hidden="true">
                                ›
                              </span>
                            </>
                          ) : null}
                          <Highlight text={hit.doc.title} ranges={hit.titleRanges} />
                        </span>
                        {hit.snippet ? (
                          <span className={styles.resultSnippet}>
                            <span className={styles.resultLabel}>{hit.snippet.label}</span>{' '}
                            <span className={hit.snippet.code ? styles.resultCode : undefined}>
                              <Highlight text={hit.snippet.text} ranges={hit.snippet.ranges} />
                            </span>
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>Spróbuj nazwy właściwości (np. „opacity”, „spring”) albo komponentu.</p>
              )}
            </div>
          ) : (
            <nav aria-label="Spis treści">
              {groups.map((group) => (
                <div key={group.label} className={styles.group}>
                  <p className={styles.groupLabel}>{group.label}</p>
                  <ul className={styles.list}>
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={styles.link}
                          data-active={item.id === activeSection}
                          aria-current={item.id === activeSection ? 'location' : undefined}
                          onClick={closeOnNavigate}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}
