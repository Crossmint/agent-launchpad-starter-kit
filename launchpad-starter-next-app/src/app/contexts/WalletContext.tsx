"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { WebAuthnP256 } from "ox";

const SERVER_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_SERVER_API_KEY as string;
const BASE_URL = "http://localhost:3000/api/2022-06-09";

interface Wallet {
    address: string;
    credentialId: string;
}

interface WalletContextType {
    wallet: Wallet | null;
    isLoading: boolean;
    createNewWallet: () => Promise<void>;
}
const WalletContext = createContext<WalletContextType | undefined>(undefined);

async function createWallet(credential: WebAuthnP256.P256Credential, name: string) {
    const randomNumString = Math.floor(Math.random() * 1000000).toString();
    const response = await fetch(`${BASE_URL}/wallets`, {
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
            // TODO: update this to a actual user input value
            linkedUser: `email:admin-launchpad.key+${randomNumString}@paella.dev`,
        }),
        headers: {
            "X-API-KEY": SERVER_API_KEY,
            "Content-Type": "application/json",
        },
    });

    return await response.json();
}

export function WalletProvider({ children }: { children: ReactNode }) {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const createNewWallet = async () => {
        setIsLoading(true);
        try {
            const name = `test passkey ${new Date().toISOString()}`;
            const credential = await WebAuthnP256.createCredential({ name });
            const response = await createWallet(credential, name);
            setWallet({
                address: response.address,
                credentialId: response.config.adminSigner.id,
            });
        } catch (error) {
            console.error("Error creating wallet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <WalletContext.Provider
            value={{
                wallet,
                isLoading,
                createNewWallet,
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
