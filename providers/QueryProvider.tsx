import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// A single QueryClient for the whole app.
// Defaults are tuned to minimise PostgREST egress:
//  - staleTime: data is considered fresh for 5 min, so navigating back to a
//    page (or remounting a component) reuses the cache instead of refetching.
//  - gcTime: keep unused data in cache for 30 min before garbage collection.
//  - refetchOnWindowFocus: disabled so simply alt-tabbing never triggers a refetch.
//  - retry: 1 to avoid hammering the API on transient failures.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client.
    return makeQueryClient();
  }
  // Browser: reuse the same client across renders.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
