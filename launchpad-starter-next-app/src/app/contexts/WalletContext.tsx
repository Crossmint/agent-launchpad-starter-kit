"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { WebAuthnP256 } from "ox";
import { useAuth } from "@crossmint/client-sdk-react-ui";
import { APIKeyEnvironmentPrefix, getEnvironmentForKey } from "@crossmint/common-sdk-base";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY as string;
if (!CLIENT_API_KEY) {
    throw new Error("NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY is not set");
}

const environment = getEnvironmentForKey(CLIENT_API_KEY);
const BASE_URL = (() => {
    switch (environment) {
        case APIKeyEnvironmentPrefix.STAGING:
            return "https://staging.crossmint.com/api/2022-06-09";
        case APIKeyEnvironmentPrefix.PRODUCTION:
            return "https://www.crossmint.com/api/2022-06-09";
        default:
            return "http://localhost:3000/api/2022-06-09";
    }
})();



interface Wallet {
    address: string;
    credentialId: string;
}

interface WalletContextType {
    wallet: Wallet | null;
    isLoading: boolean;
    getOrCreateWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
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
            const getResponse = await fetch(`${BASE_URL}/wallets/me:evm-smart-wallet`, {
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
                });
                return;
            }

            // If no wallet exists, create a new one
            const name = `Agent launchpad starter ${new Date().toISOString()}`;
            const credential = await WebAuthnP256.createCredential({ name });

            const createResponse = await fetch(`${BASE_URL}/wallets/me`, {
                method: "POST",
                body: JSON.stringify({
                    type: "evm-smart-wallet",
                    config: {
                        adminSigner: {
                            type: "evm-passkey",
                            id: credential.id,
                            publicKey: {
                                x: credential.publicKey.x.toString(),
                                y: credential.publicKey.y.toString(),
                            },
                            name,
                        },
                        creationSeed: "0",
                    },
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
