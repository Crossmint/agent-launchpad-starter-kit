import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const TEE_SERVER_PORT = process.env.TEE_SERVER_PORT || 8090;
const IS_DEV = process.env.NODE_ENV === "development";
const DEVELOPMENT_DEPLOYMENT_URL = "http://app.compose-files.orb.local:4000";
const LOCAL_COMPOSE_FILE_PATH = path.join(
    process.cwd(),
    "..",
    "agent-tee-phala",
    ".tee-cloud/compose-files/tee-compose.yaml"
);

export class ContainerManager {
    public containerId: string | null = null;
    public deploymentUrl: string | null = null;
    public simulatorId?: string | null = null;

    async startContainer(): Promise<void> {
        try {
            if (IS_DEV) {
                // Development: Use docker-compose
                // Start simulator on port 8090
                console.log("Starting simulator...");
                const { stdout: simulatorId } = await execAsync(
                    `docker run -d --rm -p 8090:8090 phalanetwork/tappd-simulator:latest`
                );
                console.log("Simulator started!");
                this.simulatorId = simulatorId.trim();
                // Start TEE container that will start the express server on port 4000
                const { stdout: teeCompose } = await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} up -d`);
                this.containerId = teeCompose.trim();
                this.deploymentUrl = DEVELOPMENT_DEPLOYMENT_URL;
            } else {
                // Production: Use direct docker command
                // TODO: extract image name from env var
                const { stdout } = await execAsync(
                    `docker run -d --rm -p ${TEE_SERVER_PORT}:${TEE_SERVER_PORT} jonathanpaella/agentlaunchpadstarterkit:latest`
                );
                this.containerId = stdout.trim();

                // TODO: get production url
            }

            await this.waitForContainerToBeReady();
            console.log(`TEE container started: ${this.containerId}`);
            console.log(`Deployment URL: ${this.deploymentUrl}`);

            // Show container logs
            const logCommand = IS_DEV
                ? `docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} logs app`
                : `docker logs ${this.containerId}`;
            const { stdout: logs } = await execAsync(logCommand);

            console.log("Container logs:", logs);
        } catch (error) {
            console.error("Failed to start container:", error);
            throw error;
        }
    }

    async stopContainer(): Promise<void> {
        if (this.isRunning()) {
            try {
                await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} down`);
                if (this.simulatorId) {
                    await execAsync(`docker stop ${this.simulatorId}`);
                    console.log("Simulator stopped!");
                }
                console.log("Container stopped:", this.containerId);
                this.containerId = null;
                this.deploymentUrl = null;
            } catch (error) {
                console.error("Failed to stop container:", error);
                throw error;
            }
        }
    }

    isRunning(): boolean {
        return this.containerId !== null;
    }

    async waitForContainerToBeReady(): Promise<void> {
        // Wait up to 60 seconds for container to be ready
        const startTime = Date.now();
        while (Date.now() - startTime < 60000) {
            try {
                // Just checking if container is running is not enough
                // We need to verify the application inside is ready to accept requests
                const response = await fetch(`${this.deploymentUrl}/health`).then((res) => res.ok);
                if (response) {
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between retries
            } catch (_error) {
                // Container not found or other error, keep waiting
            }
        }
    }
}
