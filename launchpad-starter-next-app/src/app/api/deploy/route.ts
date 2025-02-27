import { NextResponse } from "next/server";
import { ContainerManager } from "@/server/services/container";
import { getOrCreateDelegatedSigner } from "@/server/services/delegated-signer";

const containerManager = new ContainerManager();

export async function POST(request: Request) {
    try {
        const { smartWalletAddress } = await request.json();

        if (smartWalletAddress == null) {
            return NextResponse.json(
                { success: false, error: "body must contain smartWalletAddress" },
                { status: 400 }
            );
        }

        // 1. Start TEE container if not already running
        if (!containerManager.isRunning()) {
            console.log("Starting TEE container...");
            await containerManager.startContainer();
        }

        // 2. Get agent key from deployed TEE instance
        const { publicKey } = await fetch(`${containerManager.deploymentUrl}/api/initialize`, {
            method: "POST",
            headers: {
                "x-api-key": process.env.CROSSMINT_SERVER_API_KEY as string,
                "x-wallet-address": smartWalletAddress,
                "x-alchemy-api-key": process.env.ALCHEMY_API_KEY as string,
                "x-coingecko-api-key": process.env.COINGECKO_API_KEY as string,
                "x-openai-api-key": process.env.OPENAI_API_KEY as string,
            },
        }).then((res) => res.json());
        console.log(`Agent public key: ${publicKey}`);

        // 3. Get existing or create a new delegated signer request
        const delegatedSigner = await getOrCreateDelegatedSigner(smartWalletAddress, publicKey);

        return NextResponse.json({
            success: true,
            containerId: containerManager.containerId,
            delegatedSignerMessage: delegatedSigner?.message,
            delegatedSignerId: delegatedSigner?.id,
            delegatedSignerAlreadyActive: delegatedSigner?.delegatedSignerAlreadyActive ?? false,
        });
    } catch (error) {
        console.error("Deployment error:", error);
        // Ensure container is stopped on error
        await containerManager.stopContainer();

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
