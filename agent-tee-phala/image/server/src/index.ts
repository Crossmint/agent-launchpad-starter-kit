import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import express from "express";

const app = express();
const port = process.env.PORT || 4000;
const dstackEndpoint = process.env.DSTACK_ENDPOINT || `http://localhost:${port}`;

app.get("/api/getPublicKey", async (req, res) => {
    try {
        console.log("Dstack endpoint:", dstackEndpoint);
        const client = new TappdClient(dstackEndpoint);
        // Generate a unique path for key derivation
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

// Add a health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
