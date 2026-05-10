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
        await useAuthStore.getState().initializeProfile(user);
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
