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

## Dodanie kolejnej animacji

Jeden komponent = jeden `<MotionEntry>` w `app/page.tsx`:

```tsx
<MotionEntry
  title="Nazwa — rodzaj animacji"
  description="Kiedy się pojawia i co komunikuje."
  figmaNode="0000:00000"
  figmaUrl="https://www.figma.com/design/..."
  params={[{ property: 'opacity', value: '0 → 1', source: 'Figma' }]}
  code={SNIPPET}
>
  {(runKey) => <Komponent key={runKey} />}
</MotionEntry>
```

`runKey` musi trafić na `key` animowanego elementu — dzięki temu przycisk
„Odtwórz ponownie” remontuje komponent i animacja startuje od zera.

## Status

| Komponent | Wejście | Wyjście | Uwagi |
| --- | --- | --- | --- |
| Toast | gotowe (Figma 2116:26967) | do zaprojektowania | kolor ikony statusu do potwierdzenia |
