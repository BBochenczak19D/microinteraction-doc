import { isValidElement, type ReactNode } from 'react';

/* Wyszukiwarka dokumentacji — szuka od razu przy pisaniu, w całości po stronie przeglądarki.
 *
 * Porównanie ignoruje wielkość liter, polskie znaki (ą → a, ł → l…), typograficzne
 * myślniki i cudzysłowy oraz wielokrotne spacje, więc „-51”, „znikniecie” i „y - easing”
 * trafiają w „−51”, „Zniknięcie” i „y — easing”.
 *
 * Kolejność wyników: najpierw wpisy z całą frazą (tytuł > hasła > parametry > opis >
 * uwagi > kod), potem wpisy, w których są wszystkie słowa, ale nie obok siebie. */

export type SearchField = {
  /** Etykieta przy fragmencie wyniku, np. „Parametr”. */
  label: string;
  text: string;
  /** Waga w rankingu: hasła 6 … kod 1. Tytuł ma 10, sekcja 8. */
  weight: number;
  /** Kod: we fragmencie pokazujemy linię z trafieniem, pismem o stałej szerokości. */
  code?: boolean;
};

export type SearchDoc = {
  /** Kotwica na stronie, np. „#toast-znikniecie”. */
  href: string;
  title: string;
  /** Sekcja nadrzędna, np. nazwa komponentu. */
  section?: string;
  fields: SearchField[];
};

export type Range = [start: number, end: number];

export type Snippet = {
  label: string;
  text: string;
  ranges: Range[];
  code?: boolean;
};

export type SearchHit = {
  doc: SearchDoc;
  titleRanges: Range[];
  sectionRanges: Range[];
  snippet: Snippet | null;
};

/* ── Normalizacja ─────────────────────────────────────────────────────────── */

/** Tekst po normalizacji + indeks znaku w oryginale dla każdego znaku (do podświetlania). */
type Folded = { text: string; map: number[] };

const REPLACEMENTS: Record<string, string> = {
  ł: 'l',
  '‐': '-',
  '‑': '-',
  '‒': '-',
  '–': '-',
  '—': '-',
  '−': '-',
  '„': '"',
  '”': '"',
  '“': '"',
  '«': '"',
  '»': '"',
  '‘': "'",
  '’': "'",
};

function foldChar(char: string): string {
  const lower = char.toLowerCase();
  return REPLACEMENTS[lower] ?? lower.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function fold(input: string): Folded {
  let text = '';
  const map: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (/\s/.test(char)) {
      if (text !== '' && !text.endsWith(' ')) {
        text += ' ';
        map.push(i);
      }
      continue;
    }
    for (const part of foldChar(char)) {
      text += part;
      map.push(i);
    }
  }

  return { text, map };
}

const isWordChar = (char: string) => /[\p{L}\p{N}]/u.test(char);

/* ── Indeks ───────────────────────────────────────────────────────────────── */

type PreparedField = SearchField & { folded: Folded };

type PreparedDoc = {
  doc: SearchDoc;
  title: Folded;
  section: Folded | null;
  fields: PreparedField[];
};

export type SearchIndex = PreparedDoc[];

const TITLE_WEIGHT = 10;
const SECTION_WEIGHT = 8;

export function createSearchIndex(docs: SearchDoc[]): SearchIndex {
  return docs.map((doc) => ({
    doc,
    title: fold(doc.title),
    section: doc.section ? fold(doc.section) : null,
    fields: doc.fields.map((field) => ({ ...field, folded: fold(field.text) })),
  }));
}

/* ── Szukanie ─────────────────────────────────────────────────────────────── */

export function search(index: SearchIndex, query: string): SearchHit[] {
  const phrase = fold(query).text.trim();
  if (!phrase) return [];
  const terms = phrase.split(' ');

  const scored: { hit: SearchHit; score: number; order: number }[] = [];

  index.forEach((entry, order) => {
    const targets = [
      { folded: entry.title, weight: TITLE_WEIGHT },
      ...(entry.section ? [{ folded: entry.section, weight: SECTION_WEIGHT }] : []),
      ...entry.fields,
    ];
    const score = scorePhrase(targets, phrase) || scoreTerms(targets, terms);
    if (!score) return;

    scored.push({
      score,
      order,
      hit: {
        doc: entry.doc,
        titleRanges: findRanges(entry.title, phrase, terms),
        sectionRanges: entry.section ? findRanges(entry.section, phrase, terms) : [],
        snippet: pickSnippet(entry, phrase, terms),
      },
    });
  });

  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map(({ hit }) => hit);
}

type Target = { folded: Folded; weight: number };

/** Cała fraza w jednym polu. Bonus, gdy pole od niej się zaczyna albo trafia w początek słowa. */
function scorePhrase(targets: Target[], phrase: string): number {
  let best = 0;
  for (const { folded, weight } of targets) {
    const at = folded.text.indexOf(phrase);
    if (at === -1) continue;
    const bonus = at === 0 ? 5 : isWordChar(folded.text[at - 1]) ? 0 : 2;
    best = Math.max(best, weight * 10 + bonus);
  }
  return best ? 1000 + best : 0;
}

/** Wszystkie słowa gdziekolwiek we wpisie (dla zapytań z kilku słów). */
function scoreTerms(targets: Target[], terms: string[]): number {
  if (terms.length < 2) return 0;
  let total = 0;
  for (const term of terms) {
    let best = 0;
    for (const { folded, weight } of targets) {
      if (folded.text.includes(term)) best = Math.max(best, weight);
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}

/** Zakresy do podświetlenia: cała fraza, a jeśli jej nie ma — pojedyncze słowa (min. 2 znaki). */
function findRanges(folded: Folded, phrase: string, terms: string[]): Range[] {
  const needles = folded.text.includes(phrase) ? [phrase] : terms.filter((term) => term.length > 1);
  const ranges: Range[] = [];

  for (const needle of needles) {
    let from = 0;
    for (;;) {
      const at = folded.text.indexOf(needle, from);
      if (at === -1) break;
      ranges.push([folded.map[at], folded.map[at + needle.length - 1] + 1]);
      from = at + needle.length;
    }
  }

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Range[] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

/* ── Fragment wyniku ──────────────────────────────────────────────────────── */

const SNIPPET_LENGTH = 96;
const SNIPPET_LEAD = 32;

/** Pole, które najlepiej tłumaczy trafienie; gdy trafił tylko tytuł — początek pierwszego pola. */
function pickSnippet(entry: PreparedDoc, phrase: string, terms: string[]): Snippet | null {
  let best: PreparedField | null = null;
  let bestScore = 0;

  for (const field of entry.fields) {
    const text = field.folded.text;
    const matched = terms.filter((term) => text.includes(term)).length;
    if (!matched) continue;
    const score = (text.includes(phrase) ? 1000 : 0) + matched * 10 + field.weight;
    if (score > bestScore) {
      best = field;
      bestScore = score;
    }
  }

  if (best) return cutSnippet(best, findRanges(best.folded, phrase, terms));

  const first = entry.fields[0];
  return first ? cutSnippet(first, []) : null;
}

function cutSnippet(field: PreparedField, ranges: Range[]): Snippet {
  const { text, label, code } = field;
  const firstStart = ranges[0]?.[0] ?? 0;
  const firstEnd = ranges[0]?.[1] ?? 0;

  let start: number;
  let end: number;

  if (code) {
    start = text.lastIndexOf('\n', firstStart - 1) + 1;
    end = text.indexOf('\n', firstStart);
    if (end === -1) end = text.length;
    while (start < end && /\s/.test(text[start])) start++;
  } else if (text.length <= SNIPPET_LENGTH) {
    start = 0;
    end = text.length;
  } else {
    start = Math.max(0, firstStart - SNIPPET_LEAD);
    if (start > 0) {
      const space = text.indexOf(' ', start);
      if (space !== -1 && space < firstStart) start = space + 1;
    }
    end = Math.min(text.length, start + SNIPPET_LENGTH);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > firstEnd) end = space;
    }
  }

  const prefix = !code && start > 0 ? '…' : '';
  const suffix = !code && end < text.length ? '…' : '';
  const shift = prefix.length - start;

  return {
    label,
    code,
    text: prefix + text.slice(start, end) + suffix,
    ranges: ranges
      .filter(([s, e]) => e > start && s < end)
      .map(([s, e]) => [Math.max(s, start) + shift, Math.min(e, end) + shift]),
  };
}

/* ── JSX → tekst ──────────────────────────────────────────────────────────── */

const BLOCK_TAGS = new Set(['p', 'div', 'li', 'ul', 'ol', 'br', 'pre', 'table', 'tr', 'td', 'th']);

function collectText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const text = collectText(node.props.children);
    return typeof node.type === 'string' && BLOCK_TAGS.has(node.type) ? ` ${text} ` : text;
  }
  return '';
}

/** Czysty tekst z JSX (np. z uwag), żeby dało się go przeszukiwać. */
export function nodeToText(node: ReactNode): string {
  return collectText(node).replace(/\s+/g, ' ').trim();
}
