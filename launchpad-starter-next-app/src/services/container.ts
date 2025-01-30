import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const TEE_SERVER_PORT = process.env.TEE_SERVER_PORT || 8090;
const TEE_SERVER_URL = process.env.TEE_SERVER_URL || "http://localhost:8090";

export class ContainerManager {
    public containerId: string | null = null;

    async startContainer(): Promise<void> {
        try {
            // Start the TEE simulator container
            const { stdout } = await execAsync(
                `docker run -d --rm -p ${TEE_SERVER_PORT}:${TEE_SERVER_PORT} phalanetwork/tappd-simulator:latest`
            );
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
        if (!this.isRunning()) {
            // wait up to 5 seconds for container to be running
            for (let i = 0; i < 5; i++) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if (this.isRunning()) {
                    break;
                }
            }
            if (!this.isRunning()) {
                throw new Error("Container not running");
            }
        }

        const client = new TappdClient(TEE_SERVER_URL);

        // Generate a unique path for key derivation
        const uniquePath = `/keys/${Date.now()}-${Math.random().toString(36).substring(2)}`;
        // Call the deriveKey function with a unique path
        const randomDeriveKey = await client.deriveKey(uniquePath, "");

        // Hash the derivedKey uint8Array value
        const keccakPrivateKey = keccak256(randomDeriveKey.asUint8Array());
        // Get the private key account from the derived key hash
        const account = privateKeyToAccount(keccakPrivateKey);

        console.log("keys generated in docker container ", this.containerId);
        console.log("account:", account.address);

        return { keyAddress: account.address, privateKeyAddress: keccakPrivateKey };
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
        const { stdout } = await execAsync(`lsof -t -i:${TEE_SERVER_PORT}`);
        if (stdout) {
            await execAsync(`kill -9 $(lsof -ti:${TEE_SERVER_PORT})`);
            console.log(`Process running on port ${TEE_SERVER_PORT} killed`);
            this.containerId = null;
        }
    }

    isRunning(): boolean {
        return this.containerId !== null;
    }
}
