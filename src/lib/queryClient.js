import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — product data doesn't change every second
      // Don't retry auth/permission failures (401 signed out, 403 not yours /
      // not an admin) — retrying can't fix them.
      retry: (failureCount, error) => ![401, 403].includes(error?.response?.status) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
});
