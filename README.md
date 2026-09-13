# Mikrointerakcje — Estigroup Dealer Panel

Dokumentacja animacji komponentów: podgląd na żywo, parametry wyciągnięte z Figmy
i gotowy snippet dla frontendu.

Stack: Next.js (App Router) · TypeScript · framer-motion · CSS Modules.

## Odpalenie lokalnie

```bash
npm install
npm run dev
```

Strona: http://localhost:3000

## Publikacja (link dla developera)

1. Załóż repozytorium na GitHubie (może być prywatne).
2. W katalogu projektu:

   ```bash
   git init
   git add .
   git commit -m "Dokumentacja mikrointerakcji: Toast"
   git branch -M main
   git remote add origin git@github.com:<konto>/<repo>.git
   git push -u origin main
   ```

3. Wejdź na vercel.com → **Add New → Project** → wskaż to repozytorium → **Deploy**.
   Vercel sam wykryje Next.js, nic nie trzeba konfigurować.
4. Dostajesz stały adres typu `nazwa-repo.vercel.app`. Każdy push na `main`
   aktualizuje stronę, więc link wysyłasz raz.

## Struktura

- `app/page.tsx` — cała treść w tablicy `COMPONENTS` (komponent → animacje) i tabela stylu animacji.
  Z niej powstają sekcje strony, menu w sidebarze (same nazwy komponentów) i indeks wyszukiwarki.
- `components/motion-docs/MotionEntry.tsx` — sekcja jednej animacji: podgląd, tabela, snippet, uwagi.
- `components/motion-docs/Sidebar.tsx` — menu, lista komponentów, wyszukiwarka; poniżej 960 px szuflada.
- `components/motion-docs/search.ts` — logika wyszukiwania.
- `components/motion-docs/demos/` — podglądy do sceny (toast, Select, menu akcji, paginacja,
  segment control, date picker).
- `components/motion.ts` — wspólny styl animacji (czasy, krzywe, dystans, skala) i gotowe przepisy:
  `popoverMotion`, `swapMotion`, `viewMotion`, `moveTransition`; te same wartości jako zmienne CSS
  `--motion-*` w `app/globals.css`.
- `components/Toast.tsx` — komponent produkcyjny, specyfikacja animacji w komentarzu na górze.
- `components/Menu.tsx` — panel menu rozwijanego i specyfikacja jego animacji (warianty Select i Button).
- `components/Select.tsx`, `components/MenuButton.tsx` — komponenty, które otwierają to menu.
- `components/Pagination.tsx` — paginacja (Default, Compact, Mini) ze specyfikacją animacji.
- `components/SegmentedControl.tsx` — segment control (2–4 opcje, marki Uniwersal, Estigroup, Estimoto).
- `components/DatePicker.tsx` — pole z kalendarzem (dni, miesiące, lata); `Calendar` działa też osobno.
- `components/icons.tsx` — ikony Medusa UI wyeksportowane z Figmy (nie ma ich w heroicons).

## Styl animacji

Gdy w Figmie nie ma animacji, wartości są propozycją we wspólnym stylu — subtelnie, bez sprężyn,
zniknięcie krótsze od pojawienia się:

| Token | Wartość |
| --- | --- |
| pojawienie się, ruch | 250 ms · `cubic-bezier(0.22, 1, 0.36, 1)` |
| fade przy pojawieniu | 200 ms · ta sama krzywa |
| zniknięcie | 150 ms · `cubic-bezier(0.4, 0, 1, 1)` |
| zmiana stanu (hover, fokus) | 150 ms · ease-out |
| dystans / skala | 2 px / 0.98 → 1 |

Nowa animacja bez danych z Figmy bierze wartości i przepisy z `components/motion.ts`, nie wymyśla
własnych: warstwa nad treścią — `popoverMotion`, zamiana treści w miejscu — `swapMotion`, zmiana
widoku — `viewMotion`, przesuwane tło zaznaczenia — `moveTransition` z `layoutId`.
Toast ma wartości z eksportu Figmy i zostaje przy nich.

## Dodanie kolejnej animacji

Nowy obiekt w `entries` komponentu w `app/page.tsx` (albo nowy komponent w `COMPONENTS`):

```tsx
{
  id: 'toast-znikniecie',        // kotwica: /#toast-znikniecie
  title: 'Zniknięcie',
  description: 'Kiedy się pojawia i co komunikuje.',
  figmaNode: '0000:00000',
  figmaUrl: 'https://www.figma.com/design/...',
  params: [{ property: 'opacity', value: '1 → 0', source: 'Figma' }],
  code: SNIPPET,
  notes: <p>…</p>,
  keywords: ['wyjście', 'exit'], // synonimy dla wyszukiwarki
  preview: <Komponent />,
}
```

Menu i wyszukiwarka aktualizują się same. „Odtwórz ponownie” remontuje scenę, więc animacja
wejścia startuje od zera — podgląd nie musi nic o tym wiedzieć.

## Wyszukiwarka

Szuka od razu przy pisaniu: w tytułach, opisach, parametrach, uwagach, snippetach i hasłach.
Ignoruje wielkość liter i polskie znaki („znikniecie” = „Zniknięcie”, „-51” = „−51”).
`/` albo `Ctrl + K` przenosi do pola, strzałki wybierają wynik, Enter przechodzi, Esc czyści.

## Status

| Komponent | Animacje | Źródło | Uwagi |
| --- | --- | --- | --- |
| Toast | pojawienie się, zniknięcie po „×” | Figma (2116:26967) | kolor ikony statusu do potwierdzenia |
| Menu — Select | pojawienie się, zamknięcie | propozycja, wspólny styl | wygląd: Design System, strona Select (81:993) |
| Menu — Button | pojawienie się, zamknięcie | propozycja, wspólny styl | tło przycisku z tokenów DS; 10% przy otwartym menu z Figmy |
| Paginacja | zmiana strony, przesunięcie zakresu, stany | propozycja + stany z Figmy (903:635) | zakres Default: strona ±1 |
| Segment control | przełączenie, stany i marki | propozycja + stany z Figmy (349:757) | tło przejeżdża jak w paginacji |
| Date picker | otwarcie, zmiana miesiąca, wybór dnia, miesiące i lata | propozycja + stany z Figmy (94:13340) | hover nagłówka z tokenu DS (w Figmie brak) |
