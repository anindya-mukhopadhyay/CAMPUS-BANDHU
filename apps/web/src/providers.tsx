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
    void initAnalytics();

    const unsubscribe = subscribeAuth(async (user) => {
      useAuthStore.getState().setUser(user);
      if (user) {
        try {
          // Only attempt profile initialization if we have a chance
          await useAuthStore.getState().initializeProfile(user);
        } catch (error) {
          console.error("Auth provider initialization error:", error);
        }
      } else {
        useAuthStore.getState().setProfile(null);
        useAuthStore.setState({ isLoading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
}
