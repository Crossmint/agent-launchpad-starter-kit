import { TappdClient } from "@phala/dstack-sdk";
// @ts-expect-error issue with the types from source code
import { toKeypair } from "@phala/dstack-sdk/solana";
// @ts-expect-error issue with the types from source code
import { toViemAccount } from "@phala/dstack-sdk/viem";
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
let smartWalletAddress: string;

app.get("/api/getPublicKey", (req, res) => {
    res.json({ publicKey });
});

app.post("/api/initialize", async (req: Request, res: Response) => {
    const smartWalletAddressHeader = req.header("x-wallet-address");
    const crossmintServerApiKey = req.header("x-api-key");
    const alchemyApiKey = req.header("x-alchemy-api-key");

    if (!smartWalletAddressHeader || !crossmintServerApiKey || !alchemyApiKey) {
        res.status(400).json({
            error: "missing 'x-wallet-address' or 'x-api-key' or 'x-alchemy-api-key' header in request for initialization",
        });
        return;
    }

    try {
        const isEVMWallet = smartWalletAddressHeader.startsWith("0x");
        const client = new TappdClient(process.env.DSTACK_SIMULATOR_ENDPOINT || undefined);
        const randomDeriveKey = await client.deriveKey(smartWalletAddressHeader, "");

        if (isEVMWallet) {
            const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());
            const account = toViemAccount(randomDeriveKey);

            console.log("Generated agent keys from TEE");
            console.log("EVM Account address:", account.address);

            privateKey = keccakPrivateKey;
            publicKey = account.address;
        } else {
            const keypair = toKeypair(randomDeriveKey);
            publicKey = keypair.publicKey.toString();
            privateKey = keypair.secretKey.toString();

            console.log("Generated agent keys from TEE");
            console.log("Solana Account address:", publicKey);
        }

        smartWalletAddress = smartWalletAddressHeader;

        // await initializeAgent(privateKey, crossmintServerApiKey, alchemyApiKey);

        res.json({ status: "success", publicKey });
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
        const environmentVariables = `SIGNER_WALLET_SECRET_KEY=${privateKey} CROSSMINT_SERVER_API_KEY=${crossmintServerApiKey} SMART_WALLET_ADDRESS=${smartWalletAddress} ALCHEMY_API_KEY_BASE_SEPOLIA=${alchemyApiKey}`;
        const { stdout } = await execAsync(`${environmentVariables} pnpm run start:agent`);
        console.log("stdout:", stdout);
    } catch (error) {
        console.error("Error executing agent:", error);
    }
}
