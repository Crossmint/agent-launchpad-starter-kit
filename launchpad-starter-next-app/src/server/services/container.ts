import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { PhalaCloud } from "./phala/phala-cloud";

const execAsync = promisify(exec);

// TODO: Remove this
const IS_DEV = false;
// const IS_DEV = process.env.NODE_ENV === "development";
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
                /*
                 * DEVELOPMENT: Use docker-compose
                 * Start simulator on port 8090
                 */
                console.log("Starting simulator...");
                const { stdout: simulatorId } = await execAsync(
                    `docker run -d --rm -p 8090:8090 phalanetwork/tappd-simulator:latest`
                );
                console.log("Simulator started!");
                this.simulatorId = simulatorId.trim();
                // Start TEE container that will start the express server on port 4000
                const { stdout: teeCompose } = await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} up -d`);
                console.log("TEE container started!");
                this.containerId = teeCompose.trim();
                this.deploymentUrl = "http://app.compose-files.orb.local:4000";
            } else {
                /*
                 * PRODUCTION: Use Phala Production hardware (Phala Cloud)
                 * ASSUME WE HAVE ALREADY DEPLOYED TO DOCKER HUB
                 * AND WE JUST NEED TO DEPLOY TO PHALA CLOUD
                 *
                 * To add your own docker image:
                 * 1. Build your docker image and push it to docker hub
                 * 2. Update the name in the DockerImageObject below
                 * 3. Update the compose file path in the .tee-cloud folder
                 *   3a. Or replace the contents of the tee-compose.yaml file directly
                 */
                const phalaCloud = new PhalaCloud();
                const DockerImageObject = {
                    name: "agentlaunchpadstarterkit",
                    compose: path.join(process.cwd(), "../agent-tee-phala/.tee-cloud/compose-files/tee-compose.yaml"),
                    envs: [],
                };
                const { appId } = await phalaCloud.deploy(DockerImageObject);

                // Wait for deployment using the helper function
                this.deploymentUrl = await phalaCloud.waitForDeployment(appId);
                console.log("Deployment URL:", this.deploymentUrl);
            }

            await this.waitForContainerReadiness();

            console.log(`TEE container started: ${this.containerId}`);
            console.log(`Deployment URL: ${this.deploymentUrl}`);

            if (IS_DEV) {
                // Show container logs
                const { stdout: logs } = await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} logs app`);
                console.log("Container logs:", logs);
            }
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

    async waitForContainerReadiness(): Promise<void> {
        // Wait up to 60 seconds for container to be ready
        const startTime = Date.now();
        while (Date.now() - startTime < 60000) {
            try {
                // Just checking if container is running is not enough
                // We need to verify the application inside is ready to accept requests
                const response = await fetch(`${this.deploymentUrl}/api/health`).then((res) => res.json());
                if (response.ok) {
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between retries
            } catch (_error) {
                // Container not found or other error, keep waiting
            }
        }
    }
}
