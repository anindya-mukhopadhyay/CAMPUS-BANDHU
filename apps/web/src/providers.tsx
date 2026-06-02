"use client";

import { useEffect, useState, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { initAnalytics } from "@/lib/firebase/client";
import { subscribeAuth } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { ToastContainer } from "@/components/ui/toast";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false
        }
      }
    })
  );

  useEffect(() => {
    useAuthStore.getState().restoreMockLogin();
    void initAnalytics();

    // Fallback: Ensure loading state is cleared if Firebase hangs
    const loadingTimeout = setTimeout(() => {
      if (useAuthStore.getState().isLoading) {
        console.warn("Auth initialization fallback timeout reached. Setting isLoading to false.");
        useAuthStore.setState({ isLoading: false });
      }
    }, 2500);

    const unsubscribe = subscribeAuth(async (user) => {
      // Clear timeout as soon as auth responds
      clearTimeout(loadingTimeout);

      useAuthStore.getState().setUser(user);
      if (user) {
        try {
          // Only attempt profile initialization if we have a chance
          await useAuthStore.getState().initializeProfile(user);
        } catch (error) {
          console.error("Auth provider initialization error:", error);
          useAuthStore.setState({ isLoading: false });
        }
      } else {
        if (!useAuthStore.getState().restoreMockLogin()) {
          useAuthStore.getState().clearAuth();
        }
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
}
