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

- `app/page.tsx` — cała treść w tablicy `COMPONENTS` (komponent → animacje). Z niej powstają
  sekcje strony, menu w sidebarze i indeks wyszukiwarki.
- `components/motion-docs/MotionEntry.tsx` — sekcja jednej animacji: podgląd, tabela, snippet, uwagi.
- `components/motion-docs/Sidebar.tsx` — menu, lista komponentów, wyszukiwarka; poniżej 960 px szuflada.
- `components/motion-docs/search.ts` — logika wyszukiwania.
- `components/motion-docs/demos/` — podglądy do sceny (toast, który naprawdę się zamyka; Select i menu akcji).
- `components/Toast.tsx` — komponent produkcyjny, specyfikacja animacji w komentarzu na górze.
- `components/Menu.tsx` — panel menu rozwijanego i specyfikacja jego animacji (warianty Select i Button).
- `components/Select.tsx`, `components/MenuButton.tsx` — komponenty, które otwierają to menu.
- `components/icons.tsx` — ikony Medusa UI wyeksportowane z Figmy (nie ma ich w heroicons).

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

| Komponent | Wejście | Wyjście | Uwagi |
| --- | --- | --- | --- |
| Toast | gotowe (Figma 2116:26967) | gotowe — wejście w odwrotnym kierunku, po kliknięciu „×” | kolor ikony statusu do potwierdzenia |
| Menu — Select | propozycja (w Figmie brak animacji) | propozycja | wygląd: Design System, strona Select (81:993) |
| Menu — Button | propozycja (w Figmie brak animacji) | propozycja | przycisk „⋯”: stan domyślny i hover do potwierdzenia |
