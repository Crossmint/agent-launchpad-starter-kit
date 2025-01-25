import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CHAIN = "base-sepolia";

const serverApiKey = process.env.NEXT_PUBLIC_CROSSMINT_SERVER_API_KEY as string;

const crossmintUrl = process.env.crossmintUrl || "http://localhost:3000";

export class ContainerManager {
    public containerId: string | null = null;

    async startContainer(): Promise<void> {
        try {
            // Start the TEE simulator container
            const { stdout } = await execAsync("docker run -d --rm -p 8090:8090 phalanetwork/tappd-simulator:latest");
            this.containerId = stdout.trim();

            console.log("TEE simulator container started:", this.containerId);

            // Wait for container to be ready
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Show container logs
            const { stdout: logs } = await execAsync(`docker logs ${this.containerId}`);
            console.log("Container logs:", logs);
        } catch (error) {
            console.error("Failed to start container:", error);
            throw error;
        }
    }

    async generateAgentKeys(): Promise<{ keyAddress: string; privateKeyAddress: string }> {
        const client = new TappdClient("http://localhost:8090");

        // Derive keys
        console.log("Generating key in TEE simulator...");
        const randomNumString = Math.random().toString();
        // Call the deriveKey function and pass in the root of trust to derive a key
        const randomDeriveKey = await client.deriveKey("/", randomNumString);
        // Hash the derivedKey uint8Array value
        const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());
        // Get the private key account from the derived key hash
        const account = privateKeyToAccount(keccakPrivateKey);

        console.log("keys generated in container ", this.containerId);
        console.log("account:", account.address);
        console.log("privateKey:", keccakPrivateKey);

        return { keyAddress: account.address, privateKeyAddress: keccakPrivateKey };
    }

    async createDelegatedSigner(
        smartWalletAddress: string,
        agentKeyAddress: string
    ): Promise<{ message: string; id: string }> {
        const client = new TappdClient("http://localhost:8090");

        await client.tdxQuote("inside the container and creating a delegated signer");

        // in TEE simulator, we need to now call signer endpoint and pass the admin account address
        const response = await fetch(`${crossmintUrl}/api/2022-06-09/wallets/${smartWalletAddress}/signers`, {
            method: "POST",
            headers: {
                "X-API-KEY": serverApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                signer: `evm-keypair:${agentKeyAddress}`,
                chain: CHAIN,
                expiresAt: 1835845180080, // expires in 2028
            }),
        });

        const data = await response.json();
        console.log({ data });

        // Extract the message to sign from the first chain's pending approval
        const firstChain = Object.values(data.chains)[0] as any;
        console.log({ firstChain });
        const pendingApproval = firstChain.approvals.pending[0];
        console.log({ pendingApproval });
        return { message: pendingApproval.message, id: firstChain.id };
    }

    async createAgentSmartWallet(adminAccount: string): Promise<{ address: string }> {
        const response = await fetch(`${crossmintUrl}/api/2022-06-09/wallets`, {
            method: "POST",
            headers: {
                "X-API-KEY": serverApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "evm-smart-wallet",
                config: {
                    adminSigner: {
                        type: "evm-keypair",
                        address: adminAccount,
                    },
                },
            }),
        });

        const data = await response.json();

        return { address: data.address };
    }

    async stopContainer(): Promise<void> {
        if (this.isRunning()) {
            try {
                await execAsync(`docker stop ${this.containerId}`);
                console.log("Container stopped:", this.containerId);
                this.containerId = null;
            } catch (error) {
                console.error("Failed to stop container:", error);
                throw error;
            }
        }
        // check if running port 8090
        const { stdout } = await execAsync(`lsof -t -i:8090`);
        if (stdout) {
            await execAsync(`kill -9 $(lsof -ti:8090)`);
            console.log("Process running on port 8090 killed");
            this.containerId = null;
        }
    }

    isRunning(): boolean {
        return this.containerId !== null;
    }
}
