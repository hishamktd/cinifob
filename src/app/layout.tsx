import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppThemeProvider } from '@contexts/ThemeContext';
import AuthSessionProvider from '@core/providers/session-provider';
import { ToastProvider } from '@/hooks/useToast';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CiniFob - Movie Tracking App',
  description: 'Track your watched movies and manage your watchlist',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthSessionProvider>
          <AppThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
