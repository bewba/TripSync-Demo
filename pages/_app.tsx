import React from 'react';
import '@/styles/index.css';
import 'leaflet/dist/leaflet.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

import { QueryProvider } from '@/providers/QueryProvider';
import { Sidebar } from '@/components/ui/Sidebar/Sidebar';
import { NotificationProvider, NotificationBell } from '@/components/ui/Notifications';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth')
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Close sidebar on route change
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <div className="min-h-screen flex flex-col lg:flex-row bg-background">
          <Head>
            <title>Fleet Manager</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {isAuthPage ? (
            <NotificationProvider>
              {/* Mobile Top Bar */}
              <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200 sticky top-0 z-30">
                <span className="font-heading font-bold text-lg text-emerald-800">Fleet Manager</span>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              {/* Notification system — active on all auth pages */}
              <NotificationBell />

              <main className="flex-1 lg:ml-64 min-h-screen relative w-full">
                <Component {...pageProps} key={router.pathname} />
              </main>
            </NotificationProvider>
          ) : (
            <main className="flex-1 min-h-screen relative w-full">
              <Component {...pageProps} key={router.pathname} />
            </main>
          )}
        </div>
      </QueryProvider>
    </SessionProvider>
  );
}