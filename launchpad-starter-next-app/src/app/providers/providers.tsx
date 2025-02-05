"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CrossmintProvider, CrossmintAuthProvider } from "@crossmint/client-sdk-react-ui";
import type { ReactNode } from "react";

import { WalletProvider } from "./wallet-provider";

export function Providers({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY ?? ""}>
                <CrossmintAuthProvider
                    appearance={{
                        borderRadius: "16px",
                        colors: {
                            inputBackground: "#ECF5FA",
                            buttonBackground: "#D8E3E9",
                            border: "#115983",
                            background: "#ECF5FA",
                            textPrimary: "#304170",
                            textSecondary: "#115983",
                            danger: "#ff3333",
                            accent: "#1B2C60",
                        },
                    }}
                    loginMethods={["email", "google", "twitter"]}
                >
                    <WalletProvider>{children}</WalletProvider>
                </CrossmintAuthProvider>
            </CrossmintProvider>
        </QueryClientProvider>
    );
}
