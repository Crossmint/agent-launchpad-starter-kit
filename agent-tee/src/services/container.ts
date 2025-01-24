import { TappdClient } from "@phala/dstack-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256 } from "viem";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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

    async generateKeys(): Promise<{ account: string; privateKey: string }> {
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

        return { account: account.address, privateKey: keccakPrivateKey };
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
