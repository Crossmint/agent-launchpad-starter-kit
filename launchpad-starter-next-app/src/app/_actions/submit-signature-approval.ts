"use server";

const API_KEY = process.env.CROSSMINT_SERVER_API_KEY as string;
const BASE_URL =
    process.env.USE_STAGING_DB === "1"
        ? "https://staging.crossmint.com/api/2022-06-09"
        : "http://localhost:3000/api/2022-06-09";

export async function submitSignatureApproval(
    metadata: any,
    signature: any,
    signer: string,
    walletAddress: string,
    signatureId: string
) {
    try {
        const response = await fetch(`${BASE_URL}/wallets/${walletAddress}/signatures/${signatureId}/approvals`, {
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
        });

        if (!response.ok) {
            throw new Error("Failed to submit signature approval");
        }

        return { success: true };
    } catch (error) {
        console.error("Error in submit-signature-approval:", error);
        throw new Error("Failed to submit signature approval");
    }
}
