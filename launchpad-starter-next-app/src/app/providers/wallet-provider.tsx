"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuth } from "@crossmint/client-sdk-react-ui";
import { WebAuthnP256 } from "ox";
import { getBaseUrlFromApiKey } from "@/lib/utils";
import type { WalletType, Wallet } from "../types/wallet";

const SOLANA_PUBLIC_KEY_SIGNER = process.env.NEXT_PUBLIC_SOLANA_SIGNER_PUBLIC_KEY as string;
const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY as string;
if (!CLIENT_API_KEY) {
    throw new Error("NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY is not set");
}

const CROSSMINT_BASE_URL = getBaseUrlFromApiKey(CLIENT_API_KEY);

interface WalletContextType {
    wallet: Wallet | null;
    isLoading: boolean;
    getOrCreateWallet: () => Promise<void>;
    walletType: WalletType;
    setWalletType: (walletType: WalletType) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({
    children,
    walletType,
    setWalletType,
}: { children: ReactNode; walletType: WalletType; setWalletType: (walletType: WalletType) => void }) {
    const { jwt, logout } = useAuth();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getOrCreateWallet = async () => {
        if (!jwt) {
            console.error("No JWT available");
            return;
        }

        setIsLoading(true);
        try {
            // First, try to get existing wallet
            const getResponse = await fetch(`${CROSSMINT_BASE_URL}/wallets/me:${walletType}`, {
                method: "GET",
                headers: {
                    "X-API-KEY": CLIENT_API_KEY,
                    authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            const existingWallet = await getResponse.json();

            if (existingWallet != null && existingWallet.address != null) {
                console.log("Existing wallet found:", existingWallet);
                // Use the first wallet found
                setWallet({
                    address: existingWallet?.address,
                    credentialId: existingWallet?.config.adminSigner.id,
                    type: existingWallet?.type,
                });
                return;
            }

            // Assemble the config for the wallet
            let config;
            if (walletType.includes("solana")) {
                if (!SOLANA_PUBLIC_KEY_SIGNER) {
                    throw new Error("NEXT_PUBLIC_SOLANA_SIGNER_PUBLIC_KEY is not set");
                }
                // Optional: Can replace the adminSigner with EOA wallet from say Phantom.
                config = {
                    adminSigner: {
                        type: "solana-keypair",
                        address: SOLANA_PUBLIC_KEY_SIGNER,
                    },
                };
            } else {
                // EVM
                const name = `Agent launchpad starter ${new Date().toISOString()}`;
                const credential = await WebAuthnP256.createCredential({ name });
                config = {
                    adminSigner: {
                        type: "evm-keypair",
                        id: credential.id,
                        publicKey: {
                            x: credential.publicKey.x.toString(),
                            y: credential.publicKey.y.toString(),
                        },
                        name,
                    },
                    creationSeed: "0",
                };
            }

            // If no wallet exists, create a new one
            const createResponse = await fetch(`${CROSSMINT_BASE_URL}/wallets/me`, {
                method: "POST",
                body: JSON.stringify({
                    type: walletType,
                    config,
                }),
                headers: {
                    "X-API-KEY": CLIENT_API_KEY,
                    authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await createResponse.json();

            setWallet({
                address: data.address,
                credentialId: data.config.adminSigner.id,
                type: data.type,
            });
        } catch (error) {
            console.error("Error with wallet operation:", error);
            logout();
            setWallet(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <WalletContext.Provider
            value={{
                wallet,
                isLoading,
                getOrCreateWallet,
                walletType,
                setWalletType,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
