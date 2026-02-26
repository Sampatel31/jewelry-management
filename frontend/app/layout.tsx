import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Shrigar Jewellers — Management System',
  description: 'Complete jewelry management for Shrigar Jewellers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
