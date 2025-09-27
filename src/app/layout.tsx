import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { AppThemeProvider } from '@contexts/ThemeContext';
import AuthSessionProvider from '@core/providers/session-provider';
import { ToastProvider } from '@/hooks/useToast';
import { MovieStatusProvider } from '@/hooks/useMovieStatus';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CiniFob - Movie Tracking App',
  description: 'Track your watched movies and manage your watchlist',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1976d2',
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
            <MovieStatusProvider>
              <ToastProvider>
                <PWAInstallPrompt />
                {children}
              </ToastProvider>
            </MovieStatusProvider>
          </AppThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
