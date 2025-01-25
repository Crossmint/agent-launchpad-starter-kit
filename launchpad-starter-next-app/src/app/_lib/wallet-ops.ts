"use client";

import { WebAuthnP256 } from "ox";
import { type Address, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_SERVER_API_KEY as string;
const MESSAGE = "Passkey signing!";
const BASE_URL = "http://localhost:3000/api/2022-06-09";
const CHAIN = "base-sepolia";

async function createSignature(walletAddress: string) {
    const response = await fetch(`${BASE_URL}/wallets/${walletAddress}/signatures`, {
        method: "POST",
        headers: {
            "X-API-KEY": API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: "evm-message",
            params: {
                message: MESSAGE,
                chain: CHAIN,
            },
        }),
    });

    return await response.json();
}

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

    const data = await response.json();
    console.log({ signatureApprovalResponse: data });

    return data;
}

export const handleSignMessage = async (walletAddress: string, credentialId: string) => {
    try {
        const creationResponse = await createSignature(walletAddress);
        const { metadata, signature } = await WebAuthnP256.sign({
            credentialId,
            challenge: creationResponse.approvals.pending[0].message,
        });

        const approvalResponse = await submitSignatureApproval(
            metadata,
            { r: signature.r.toString(), s: signature.s.toString() },
            `evm-passkey:${credentialId}`,
            walletAddress,
            creationResponse.id
        );

        // Add verification check
        const valid = await createPublicClient({
            transport: http("https://base-sepolia.g.alchemy.com/v2/4IBaeesGpVoEPGjbI0_lbVf-ja4woVlm"),
            chain: baseSepolia,
        }).verifyMessage({
            address: walletAddress as Address,
            message: MESSAGE,
            signature: approvalResponse.outputSignature,
        });

        if (!valid) {
            throw new Error("Signature verification failed");
        }

        console.log(approvalResponse);

        return approvalResponse.id;
    } catch (error) {
        throw error;
    }
};

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
