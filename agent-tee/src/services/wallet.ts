require("dotenv").config();

const API_KEY = process.env.CROSSMINT_SERVER_API_KEY as string;
const CHAIN = "base-sepolia";

export class CrossmintSmartWalletService {
    async getOrCreateDelegatedSigner(
        smartWalletAddress: string,
        agentKeyAddress: string,
        isStagingDb = false
    ): Promise<{ message: string; id: string; delegatedSignerAlreadyActive?: boolean }> {
        const BASE_URL = isStagingDb
            ? "https://staging.crossmint.com/api/2022-06-09"
            : "http://localhost:3000/api/2022-06-09";
        try {
            // 1. Check if the delegated signer already exists
            const getResponse = await fetch(
                `${BASE_URL}/wallets/${smartWalletAddress}/signers/${`evm-keypair:${agentKeyAddress}`}`,
                {
                    method: "GET",
                    headers: {
                        "X-API-KEY": API_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Only try to parse the response if it was successful
            if (getResponse.ok) {
                const existingDelegatedSigner = await getResponse.json();
                try {
                    const {
                        message: existingMessage,
                        id: existingId,
                        status: existingStatus,
                    } = this.parseDelegatedSignerMessageAndId(existingDelegatedSigner);

                    // If the delegated signer exists and is awaiting approval, return it
                    if (existingStatus === "awaiting-approval") {
                        return { message: existingMessage, id: existingId };
                    }

                    // If the delegated signer exists and is already approved, return it
                    if (existingStatus === "active") {
                        return { message: "", id: "", delegatedSignerAlreadyActive: true };
                    }
                } catch (error) {
                    // If parsing fails, continue to step 2
                    console.log("No existing delegated signer found, creating new one");
                }
            }

            // 2. Create a new delegated signer
            const response = await fetch(`${BASE_URL}/wallets/${smartWalletAddress}/signers`, {
                method: "POST",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    signer: `evm-keypair:${agentKeyAddress}`,
                    chain: CHAIN,
                }),
            });

            const { message, id } = this.parseDelegatedSignerMessageAndId(await response.json());
            return { message, id };
        } catch (error) {
            console.error("Error in getOrCreateDelegatedSigner:", error);
            throw error;
        }
    }

    private parseDelegatedSignerMessageAndId(delegatedSignerResponse: any) {
        const existingChain = Object.values(delegatedSignerResponse?.chains || {})[0] as any;
        if (!existingChain) {
            throw new Error("Delegated signer not found");
        }
        return {
            message: existingChain?.approvals?.pending[0]?.message,
            id: existingChain?.id,
            status: existingChain?.status,
        };
    }
}
