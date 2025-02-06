import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { PhalaCloud } from "./phala/phala-cloud";

const execAsync = promisify(exec);

const IS_DEV = !process.env.PHALA_CLOUD_API_KEY;
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

                // Build and start TEE container that will start the express server on port 4000
                console.log("Building TEE container...");
                await execAsync(`docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} build`);
                console.log("Build complete!");

                // Start TEE container that will start the express server on port 4000
                const DSTACK_SIMULATOR_ENDPOINT = "http://host.docker.internal:8090";
                const { stdout: teeCompose } = await execAsync(
                    `DSTACK_SIMULATOR_ENDPOINT=${DSTACK_SIMULATOR_ENDPOINT} docker-compose -f ${LOCAL_COMPOSE_FILE_PATH} up -d`
                );
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
                this.containerId = appId;
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

    // TODO: make re-usable function for both deploying and waiting for container readiness
    async waitForContainerReadiness(): Promise<void> {
        const options = {
            initialDelay: 1000,
            maxDelay: 30000,
            maxRetries: 30, // Increased from 12 to 30 to maintain ~60s total wait time
            backoffFactor: 1.5,
        };
        let retryCount = 0;

        while (retryCount < options.maxRetries) {
            // Calculate wait time with exponential backoff, capped at maxDelay
            const waitTime = Math.min(
                options.initialDelay * Math.pow(options.backoffFactor, retryCount),
                options.maxDelay
            );

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                const response = await fetch(`${this.deploymentUrl}/api/health`, {
                    signal: controller.signal,
                }).then((res) => res.json());

                clearTimeout(timeoutId);

                if (response.status === "ok") {
                    return; // Container is ready
                }
            } catch (_error) {
                console.log(`Waiting for container readiness... (attempt ${retryCount + 1}/${options.maxRetries})`);
            }

            await new Promise((resolve) => setTimeout(resolve, waitTime));
            retryCount++;
        }

        throw new Error("Container failed to become ready within timeout period");
    }
}
