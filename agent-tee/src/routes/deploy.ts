import { Router } from "express";
import { ContainerManager } from "../services/container";

const router = Router();

const containerManager = new ContainerManager();

router.post("/", async (req, res) => {
    try {
        // 1. Spin up TEE simulator container if not already running
        if (!containerManager.isRunning()) {
            console.log("Starting TEE simulator container...");
            await containerManager.startContainer();
        }

        // 2. Generate agent keys in TEE
        const agentKeys = await containerManager.generateAgentKeys();
        const agentPublicKey = agentKeys.keyAddress;

        res.json({
            success: true,
            containerId: containerManager.containerId,
            agentPublicKey,
        });
    } catch (error) {
        console.error("Deployment error:", error);
        // Ensure container is stopped on error
        await containerManager.stopContainer();

        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

router.post("/stop", async (req, res) => {
    try {
        await containerManager.stopContainer();
        res.json({
            success: true,
            message: "Agent stopped successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
