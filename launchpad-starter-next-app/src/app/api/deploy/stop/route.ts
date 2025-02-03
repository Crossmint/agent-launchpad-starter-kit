import { NextResponse } from "next/server";
import { ContainerManager } from "@/server/services/container";

const containerManager = new ContainerManager();

export async function POST() {
    try {
        await containerManager.stopContainer();
        return NextResponse.json({
            success: true,
            message: "Agent stopped successfully",
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
