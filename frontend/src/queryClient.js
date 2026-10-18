import { QueryClient } from "@tanstack/react-query";

// One shared cache for the whole app.
// staleTime: how long data counts as "fresh" (no refetch when you revisit a page).
// gcTime: how long unused data stays in memory.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
