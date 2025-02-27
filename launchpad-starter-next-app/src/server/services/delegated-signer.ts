import { getBaseUrlFromApiKey } from "@/lib/utils";

const API_KEY = process.env.CROSSMINT_SERVER_API_KEY as string;

const CROSSMINT_BASE_URL = getBaseUrlFromApiKey(API_KEY);

const headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
};

export async function getOrCreateDelegatedSigner(
    smartWalletAddress: string,
    agentKeyAddress: string,
    chain: string,
    walletSignerType: string
): Promise<{ message: string; id: string; targetSignerLocator: string; delegatedSignerAlreadyActive?: boolean }> {
    try {
        const isEVMWallet = walletSignerType.includes("evm");
        const signerLocator = `${walletSignerType}:${agentKeyAddress}`;

        // 1. Check if the delegated signer already exists
        const getResponse = await fetch(
            `${CROSSMINT_BASE_URL}/wallets/${smartWalletAddress}/signers/${signerLocator}`,
            {
                method: "GET",
                headers,
            }
        );

        // Only try to parse the response if it was successful
        if (getResponse.ok) {
            try {
                const existingDelegatedSigner = await getResponse.json();

                const {
                    message: existingMessage,
                    id: existingId,
                    status: existingStatus,
                    targetSignerLocator: existingSignerLocator,
                } = parseDelegatedSignerMessageAndId(existingDelegatedSigner, isEVMWallet);

                // If the delegated signer exists and is awaiting approval, return it
                if (existingStatus === "awaiting-approval") {
                    return { message: existingMessage, id: existingId, targetSignerLocator: existingSignerLocator };
                }

                // If the delegated signer exists and is already approved, return it
                if (existingStatus === "active" || existingStatus === "success") {
                    return {
                        message: "",
                        id: "",
                        targetSignerLocator: existingSignerLocator,
                        delegatedSignerAlreadyActive: true,
                    };
                }
            } catch (_error) {
                // If parsing fails, continue to step 2
                console.log(`No existing delegated signer found for ${signerLocator}, creating new one`);
            }
        }

        // 2. Create a new delegated signer
        const requestBody: { signer: string; chain?: string } = {
            signer: signerLocator,
            chain,
        };
        if (!isEVMWallet) {
            // Solana doesn't need chain specified
            delete requestBody.chain;
        }

        const response = await fetch(`${CROSSMINT_BASE_URL}/wallets/${smartWalletAddress}/signers`, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
        });

        const { message, id, targetSignerLocator } = parseDelegatedSignerMessageAndId(
            await response.json(),
            isEVMWallet
        );
        return { message, id, targetSignerLocator };
    } catch (error) {
        console.error("Error in getOrCreateDelegatedSigner:", error);
        throw error;
    }
}

function parseDelegatedSignerMessageAndId(delegatedSignerResponse: any, isEVMWallet: boolean) {
    const target = isEVMWallet
        ? Object.values(delegatedSignerResponse?.chains || {})[0]
        : delegatedSignerResponse?.transaction;

    if (!target) {
        throw new Error("Delegated signer not found");
    }

    return {
        message: target?.approvals?.pending[0]?.message,
        id: target?.id,
        status: target?.status,
        targetSignerLocator: target?.approvals?.pending[0]?.signer,
    };
}
