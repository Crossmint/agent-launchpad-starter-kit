"use server";

import { getBaseUrlFromApiKey } from "@/lib/utils";

const API_KEY = process.env.CROSSMINT_SERVER_API_KEY as string;
const CROSSMINT_BASE_URL = getBaseUrlFromApiKey(API_KEY);

export async function submitSignatureApproval(
    metadata: any,
    signature: any,
    signer: string,
    walletAddress: string,
    signatureId: string
) {
    try {
        const response = await fetch(
            `${CROSSMINT_BASE_URL}/wallets/${walletAddress}/signatures/${signatureId}/approvals`,
            {
                method: "POST",
                headers: {
                    "X-API-KEY": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    approvals: [
                        {
                            signer,
                            metadata,
                            signature,
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to submit signature approval");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in submit-signature-approval:", error);
        throw new Error("Failed to submit signature approval");
    }
}
