import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Sidebar from '@/components/layout/sidebar';
import MainContent from '@/components/layout/main-content';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Claude Command Center',
  description: 'Local dashboard for Claude Code activity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-full text-[15px]" id="app-body">
        <Providers>
          <Sidebar />
          <MainContent>{children}</MainContent>
        </Providers>
      </body>
    </html>
  );
}
