"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CrossmintProvider, CrossmintAuthProvider } from "@crossmint/client-sdk-react-ui";
import { WalletProvider } from "./wallet-provider";
import { WalletType } from "../types/wallet";

const DEFAULT_WALLET_TYPE = process.env.NEXT_PUBLIC_PREFERRED_CHAIN?.includes("solana")
    ? WalletType.Solana
    : WalletType.Ethereum;

export function Providers({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient();
    /* State needed lifting to the top level due to a re-render issue happening from CrossmintAuthProvider */
    const [walletType, setWalletType] = useState(DEFAULT_WALLET_TYPE);

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
                    <WalletProvider walletType={walletType} setWalletType={setWalletType}>
                        {children}
                    </WalletProvider>
                </CrossmintAuthProvider>
            </CrossmintProvider>
        </QueryClientProvider>
    );
}
