import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import express from "express";
import type { Request, Response } from "express";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

let privateKey: string;
let publicKey: string;

app.get("/api/getPublicKey", (req, res) => {
    res.json({ publicKey });
});

app.post("/api/initialize", async (req: Request, res: Response) => {
    // TODO: For now this is just the evm smart wallet address (TBD)
    const smartWalletAddress = req.header("x-secret-key");
    if (!smartWalletAddress) {
        res.status(400).json({ error: "missing 'x-secret-key' header in request for initialization" });
        return;
    }

    try {
        const client = new TappdClient(process.env.DSTACK_SIMULATOR_ENDPOINT);
        const randomDeriveKey = await client.deriveKey(smartWalletAddress, "");
        const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());
        const account = privateKeyToAccount(keccakPrivateKey);

        console.log("Generated agent keys from TEE");
        console.log("Account address:", account.address);

        privateKey = keccakPrivateKey;
        publicKey = account.address;

        await initializeAgent(privateKey);

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

async function initializeAgent(privateKey: string) {
    // TODO: Initialize AI agent with smart wallet configuration using privateKey as delegated signer
    /* For example:
     * run initialization script with private key passed as environment variable
     * e.g. PVT_KEY=${privateKey} python eliza.py
     */
}
