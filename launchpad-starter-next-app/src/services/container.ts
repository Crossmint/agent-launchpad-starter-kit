import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const TEE_SERVER_PORT = process.env.TEE_SERVER_PORT || 8090;
const IS_DEV = process.env.NODE_ENV === "development";

export class ContainerManager {
    public containerId: string | null = null;

    async startContainer(): Promise<void> {
        try {
            const LOCAL_COMPOSE_FILE_PATH = path.join(process.cwd(), "..", ".tee-cloud/compose-files/tee-compose.yaml");
            if (IS_DEV) {
                // Development: Use docker-compose
                await execAsync(
                    `DSTACK_ENDPOINT=http://localhost:8090 docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} up -d`
                );
                const { stdout } = await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} up -d`);
                this.containerId = stdout.trim();
            } else {
                // Production: Use direct docker command
                const { stdout } = await execAsync(
                    `docker run -d --rm -p ${TEE_SERVER_PORT}:${TEE_SERVER_PORT} jonathanpaella/agentlaunchpadstarterkit:latest`
                );
                this.containerId = stdout.trim();
            }

            console.log(`TEE container started: ${this.containerId}`);

            // Wait for container to be ready
            await new Promise((resolve) => setTimeout(resolve, 2000));

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
}
