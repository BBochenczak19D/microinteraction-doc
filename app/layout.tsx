import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';

import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'], // 500 = Medium z design systemu (etykiety, tooltipy, opcje menu)
  variable: '--family-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mikrointerakcje — Estigroup Dealer Panel',
  description: 'Dokumentacja animacji komponentów: podgląd, parametry z Figmy, snippety.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
