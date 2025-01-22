"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { CrossmintAuthProvider, CrossmintProvider } from "@crossmint/client-sdk-react-ui";

export function Providers({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_AUTH_SMART_WALLET_API_KEY ?? ""}>
                <CrossmintAuthProvider
                    embeddedWallets={{
                        createOnLogin: "all-users",
                        type: "evm-smart-wallet",
                        defaultChain: "polygon-amoy",
                    }}
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
                    loginMethods={["google", "email", "farcaster", "twitter"]}
                >
                    {children}
                </CrossmintAuthProvider>
            </CrossmintProvider>
        </QueryClientProvider>
    );
}
