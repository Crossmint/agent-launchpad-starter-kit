import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import express from "express";
import type { Request, Response } from "express";

import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";
dotenv.config();

const execAsync = promisify(exec);

const app = express();
const port = process.env.PORT || 4000;

let privateKey: string;
let publicKey: string;

app.get("/api/getPublicKey", (req, res) => {
    res.json({ publicKey });
});

app.post("/api/initialize", async (req: Request, res: Response) => {
    const smartWalletAddress = req.header("x-wallet-address");
    const crossmintServerApiKey = req.header("x-api-key");
    const alchemyApiKey = req.header("x-alchemy-api-key");

    if (!smartWalletAddress || !crossmintServerApiKey || !alchemyApiKey) {
        res.status(400).json({
            error: "missing 'x-wallet-address' or 'x-api-key' or 'x-alchemy-api-key' header in request for initialization",
        });
        return;
    }

    try {
        const client = new TappdClient(process.env.DSTACK_SIMULATOR_ENDPOINT || undefined);
        const randomDeriveKey = await client.deriveKey(smartWalletAddress, "");
        const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());
        const account = privateKeyToAccount(keccakPrivateKey);

        console.log("Generated agent keys from TEE");
        console.log("Account address:", account.address);

        privateKey = keccakPrivateKey;
        publicKey = account.address;

        await initializeAgent(privateKey, crossmintServerApiKey, alchemyApiKey);

        res.json({ status: "success", publicKey: account.address });
    } catch (error) {
        console.error("Error generating agent public key:", error);
        res.status(500).json({ error: "Failed to generate public key" });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

async function initializeAgent(privateKey: string, crossmintServerApiKey: string, alchemyApiKey: string) {
    try {
        console.log("Initializing agent...");

        const environmentVariables = `SIGNER_WALLET_SECRET_KEY=${privateKey} CROSSMINT_SERVER_API_KEY=${crossmintServerApiKey} SMART_WALLET_ADDRESS=${publicKey} ALCHEMY_API_KEY_BASE_SEPOLIA=${alchemyApiKey}`;
        const { stdout } = await execAsync(`${environmentVariables} pnpm run start:agent`);
        console.log("Agent initialized successfully");
        console.log("stdout:", stdout);
    } catch (error) {
        console.error("Error executing agent:", error);
    }
}
