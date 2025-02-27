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
): Promise<{ message: string; id: string; delegatedSignerAlreadyActive?: boolean }> {
    try {
        const signer = `${walletSignerType}:${agentKeyAddress}`;

        console.log("API request to get delegated signer");
        console.log(`${CROSSMINT_BASE_URL}/wallets/${smartWalletAddress}/signers/${signer}`);
        // 1. Check if the delegated signer already exists
        const getResponse = await fetch(`${CROSSMINT_BASE_URL}/wallets/${smartWalletAddress}/signers/${signer}`, {
            method: "GET",
            headers,
        });

        // Only try to parse the response if it was successful
        if (getResponse.ok) {
            const existingDelegatedSigner = await getResponse.json();
            const {
                message: existingMessage,
                id: existingId,
                status: existingStatus,
            } = parseDelegatedSignerMessageAndId(existingDelegatedSigner);

            if (existingStatus != null) {
                // If the delegated signer exists and is awaiting approval, return it
                if (existingStatus === "awaiting-approval") {
                    return { message: existingMessage, id: existingId };
                }

                // If the delegated signer exists and is already approved, return it
                if (existingStatus === "active") {
                    return { message: "", id: "", delegatedSignerAlreadyActive: true };
                }
            } else {
                console.log("No existing delegated signer found, creating new one");
            }
        }

        // 2. Create a new delegated signer
        const requestBody: { signer: string; chain?: string } = {
            signer,
            chain,
        };
        if (walletSignerType.includes("solana")) {
            // Solana doesn't need chain specified
            delete requestBody.chain;
        }
        const response = await fetch(`${CROSSMINT_BASE_URL}/wallets/${smartWalletAddress}/signers`, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
        });

        const { message, id } = parseDelegatedSignerMessageAndId(await response.json());
        return { message, id };
    } catch (error) {
        console.error("Error in getOrCreateDelegatedSigner:", error);
        throw error;
    }
}

function parseDelegatedSignerMessageAndId(delegatedSignerResponse: any) {
    const existingChain = Object.values(delegatedSignerResponse?.chains || {})[0] as any;
    if (!existingChain) {
        return {
            message: null,
            id: null,
            status: null,
        };
    }

    return {
        message: existingChain?.approvals?.pending[0]?.message,
        id: existingChain?.id,
        status: existingChain?.status,
    };
}
