'use client';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AICopilot from '@/components/ai/AICopilot';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login');
  }, [router]);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          router.push('/billing');
          break;
        case 'F4':
          e.preventDefault();
          (document.querySelector('[data-search]') as HTMLInputElement)?.focus();
          break;
        case 'F5':
          e.preventDefault();
          router.refresh();
          break;
        case 'F6':
          e.preventDefault();
          router.push('/pos');
          break;
        case 'F11':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        default:
          break;
      }
    },
    [router],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <main className="flex-1 p-6 overflow-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <AICopilot />
    </div>
  );
}
