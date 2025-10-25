import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Agentic Notion',
  description: 'A minimal Notion-like page connected to a database',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
