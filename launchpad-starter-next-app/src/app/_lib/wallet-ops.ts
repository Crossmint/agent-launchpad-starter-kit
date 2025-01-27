"use client";

import { WebAuthnP256 } from "ox";
const API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_SERVER_API_KEY as string;
const BASE_URL = "http://localhost:3000/api/2022-06-09";
const CHAIN = "base-sepolia";

export async function submitSignatureApproval(
    metadata: any,
    signature: any,
    signer: string,
    walletAddress: string,
    signatureId: string
) {
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

    return await response.json();
}

export async function createDelegatedSigner(
    smartWalletAddress: string,
    agentKeyAddress: string
): Promise<{ message: string; id: string }> {
    const response = await fetch(`${BASE_URL}/wallets/${smartWalletAddress}/signers`, {
        method: "POST",
        headers: {
            "X-API-KEY": API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            signer: `evm-keypair:${agentKeyAddress}`,
            chain: CHAIN,
            expiresAt: 1835845180080, // expires in 2028
        }),
    });

    const data = await response.json();

    // Extract the message to sign from the first chain's pending approval
    const firstChain = Object.values(data.chains)[0] as any;
    const pendingApproval = firstChain.approvals.pending[0];

    return { message: pendingApproval.message, id: firstChain.id };
}

export const handleRegisterAndApproveDelegate = async (
    walletAddress: string,
    credentialId: string,
    challengeMessage: string,
    signatureId: string
) => {
    try {
        // Sign using admin signer
        const { metadata, signature } = await WebAuthnP256.sign({
            credentialId,
            challenge: challengeMessage as `0x${string}`,
        });

        // Submit the signature
        return await submitSignatureApproval(
            metadata,
            { r: signature.r.toString(), s: signature.s.toString() },
            `evm-passkey:${credentialId}`,
            walletAddress,
            signatureId
        );
    } catch (error) {
        throw error;
    }
};
