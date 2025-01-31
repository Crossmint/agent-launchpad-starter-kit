import { NextResponse } from "next/server";
import { ContainerManager } from "@/services/container";
// import { getOrCreateDelegatedSigner } from "@/services/delegatedSigner";

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

        // 2. TODO get agent key from deployed TEE instance

        // 3. Get existing or create a new delegated signer request
        // const delegatedSigner = await getOrCreateDelegatedSigner(smartWalletAddress, agentPublicKey);

        return NextResponse.json({
            success: false,
            message: "Not implemented todo later",
        });
        // return NextResponse.json({
        //     success: true,
        //     containerId: containerManager.containerId,
        //     delegatedSignerMessage: delegatedSigner?.message,
        //     delegatedSignerId: delegatedSigner?.id,
        //     delegatedSignerAlreadyActive: delegatedSigner?.delegatedSignerAlreadyActive ?? false,
        // });
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
