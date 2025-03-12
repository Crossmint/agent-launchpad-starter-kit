"use server";

import bs58 from "bs58";
import nacl from "tweetnacl";

const secretKey = process.env.SOLANA_SIGNER_PRIVATE_KEY as string;

// biome-ignore lint/suspicious/useAwait: server action must be marked as async
export async function signSolanaMessage(message: string): Promise<string> {
    if (!secretKey) {
        throw new Error("SOLANA_SIGNER_PRIVATE_KEY is not set");
    }
    const messageBytes = bs58.decode(message);
    const secretKeyBytes = bs58.decode(secretKey);

    const signature = bs58.encode(nacl.sign.detached(messageBytes, secretKeyBytes));
    console.log("Signature:", signature);

    return signature;
}
