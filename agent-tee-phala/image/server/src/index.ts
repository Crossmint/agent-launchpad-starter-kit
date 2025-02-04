import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.get("/api/getPublicKey", async (req, res) => {
    try {
        const client = new TappdClient(process.env.DSTACK_SIMULATOR_ENDPOINT);
        // TODO: Update this path to be a deterministic one
        // TODO: Write key to confidential memory within TEE
        const uniquePath = `/keys/${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const randomDeriveKey = await client.deriveKey(uniquePath, "");
        const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());
        const account = privateKeyToAccount(keccakPrivateKey);

        console.log("Generated agent keys from TEE");
        console.log("Account address:", account.address);

        res.json({ publicKey: account.address });
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
