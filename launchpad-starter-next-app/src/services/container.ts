import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const TEE_SERVER_PORT = process.env.TEE_SERVER_PORT || 8090;
const IS_DEV = process.env.NODE_ENV === "development";

export class ContainerManager {
    public containerId: string | null = null;
    public deploymentUrl: string | null = null;

    async startContainer(): Promise<void> {
        try {
            const LOCAL_COMPOSE_FILE_PATH = path.join(
                process.cwd(),
                "..",
                "agent-tee-phala",
                ".tee-cloud/compose-files/tee-compose.yaml"
            );
            if (IS_DEV) {
                // Development: Use docker-compose
                const { stdout } = await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} up -d`);
                this.containerId = stdout.trim();
                this.deploymentUrl = `http://host.docker.internal:${TEE_SERVER_PORT}`;
            } else {
                // Production: Use direct docker command
                // TODO: extract image name from env var
                const { stdout } = await execAsync(
                    `docker run -d --rm -p ${TEE_SERVER_PORT}:${TEE_SERVER_PORT} jonathanpaella/agentlaunchpadstarterkit:latest`
                );
                this.containerId = stdout.trim();
                // todo: get/set production url
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

    async waitForContainerToBeReady(): Promise<void> {
        // Wait up to 60 seconds for container to be ready
        const startTime = Date.now();
        while (Date.now() - startTime < 60000) {
            try {
                const { stdout } = await execAsync(`docker inspect -f '{{.State.Running}}' ${this.containerId}`);
                if (stdout.trim() === "true") {
                    break;
                }
            } catch (_error) {
                // Container not found or other error, keep waiting
            }
        }
    }
}
