import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Arandu ERP',
  description: 'Sistema de gestión empresarial',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
