"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { WalletProvider } from "../contexts/WalletContext";

export function Providers({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <WalletProvider>{children}</WalletProvider>
        </QueryClientProvider>
    );
}
