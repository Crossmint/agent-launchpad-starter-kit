import { NextResponse } from "next/server";
import { ContainerManager } from "@/services/container";
import { getOrCreateDelegatedSigner } from "@/services/delegatedSigner";

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

        // 1. Spin up TEE simulator container if not already running
        if (!containerManager.isRunning()) {
            console.log("Starting TEE simulator container...");
            await containerManager.startContainer();
        }

        // 2. Generate agent keys in TEE
        const agentKeys = await containerManager.generateAgentKeys();
        const agentPublicKey = agentKeys.keyAddress;

        // 3. Get existing or create a new delegated signer request
        const delegatedSigner = await getOrCreateDelegatedSigner(smartWalletAddress, agentPublicKey);

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
