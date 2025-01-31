import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";

export class TeeClient {
    private client: TappdClient;

    constructor() {
        this.client = new TappdClient(process.env.DSTACK_ENDPOINT);
    }

    async generateAgentKeys(): Promise<{ agentPublicKey: string }> {
        // Generate a unique path for key derivation
        const uniquePath = `/keys/${Date.now()}-${Math.random().toString(36).substring(2)}`;

        // Call the deriveKey function with a unique path
        const randomDeriveKey = await this.client.deriveKey(uniquePath, "");

        // Hash the derivedKey uint8Array value
        const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());

        // Get the private key account from the derived key hash
        const account = privateKeyToAccount(keccakPrivateKey);

        console.log("Generated agent keys from TEE");
        console.log("Account address:", account.address);

        return {
            agentPublicKey: account.address,
        };
    }
}
