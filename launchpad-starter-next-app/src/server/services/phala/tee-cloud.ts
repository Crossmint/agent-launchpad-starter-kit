import fs from "fs";
import { x25519 } from "@noble/curves/ed25519";
import * as crypto from "crypto";

export const CLOUD_API_URL = "https://cloud-api.phala.network";
export const CLOUD_URL = "https://cloud.phala.network";
export const CLI_VERSION = "0.1.0";
const headers = {
    "User-Agent": `tee-cli/${CLI_VERSION}`,
    "Content-Type": "application/json",
    "X-API-Key": process.env.PHALA_CLOUD_API_KEY as string,
};

interface DeployOptions {
    debug?: boolean;
    type?: string;
    mode?: string;
    name: string;
    vcpu?: number;
    memory?: number;
    diskSize?: number;
    compose?: string;
    env?: string[];
    envFile?: string;
    envs: Env[];
}

interface Env {
    key: string;
    value: string;
}

interface CvmConfig {
    teepod_id: number;
    name: string;
    image: string;
    vcpu: number;
    memory: number;
    disk_size: number;
    compose_manifest: {
        docker_compose_file: string;
        docker_config: {
            url: string;
            username: string;
            password: string;
        };
        features: string[];
        kms_enabled: boolean;
        manifest_version: number;
        name: string;
        public_logs: boolean;
        public_sysinfo: boolean;
        tproxy_enabled: boolean;
    };
    listed: boolean;
    encrypted_env?: string;
    app_env_encrypt_pubkey?: string;
    app_id_salt?: string;
}

interface CreateCvmResponse {
    app_id: string;
    [key: string]: any;
}

interface GetPubkeyFromCvmResponse {
    app_env_encrypt_pubkey: string;
    app_id_salt: string;
}

export class TeeCloud {
    private readonly CLOUD_API_URL: string;
    private readonly CLOUD_URL: string;
    private apiKey: string;

    constructor() {
        this.CLOUD_API_URL = CLOUD_API_URL;
        this.CLOUD_URL = CLOUD_URL;
        this.apiKey = process.env.PHALA_CLOUD_API_KEY as string;
        if (!this.apiKey) {
            throw new Error("PHALA_CLOUD_API_KEY is not set");
        }
    }

    async deploy(options: DeployOptions): Promise<void> {
        console.log("Deploying CVM ...");

        const vmConfig = this.createVmConfig(options);

        const pubkey = await this.getPubkeyFromCvm(vmConfig);
        if (!pubkey) {
            throw new Error("Failed to get pubkey from CVM.");
        }

        const encrypted_env = await this.encryptSecrets(options.envs || {}, pubkey.app_env_encrypt_pubkey);

        if (options.debug) {
            console.log("Pubkey:", pubkey.app_env_encrypt_pubkey);
            console.log("Encrypted Env:", encrypted_env);
            console.log("Env:", options.envs);
        }

        const response = await this.createCvm({
            ...vmConfig,
            encrypted_env,
            app_env_encrypt_pubkey: pubkey.app_env_encrypt_pubkey,
            app_id_salt: pubkey.app_id_salt,
        });

        if (!response) {
            throw new Error("Error during deployment");
        }

        console.log("Deployment successful");
        console.log("App Id:", response.app_id);
        console.log("Phala Dashboard URL:", `${this.CLOUD_URL}/dashboard/cvms/app_${response.app_id}`);
        return;
    }

    private createVmConfig(options: DeployOptions): CvmConfig {
        const composeString = options.compose ? fs.readFileSync(options.compose, "utf8") : "";

        return {
            teepod_id: 2, // TODO: get from /api/teepods
            name: options.name,
            image: "dstack-dev-0.3.4",
            vcpu: options.vcpu || 1,
            memory: options.memory || 2048,
            disk_size: options.diskSize || 20,
            compose_manifest: {
                docker_compose_file: composeString,
                docker_config: {
                    url: "",
                    username: "",
                    password: "",
                },
                features: ["kms", "tproxy-net"],
                kms_enabled: true,
                manifest_version: 2,
                name: options.name,
                public_logs: true,
                public_sysinfo: true,
                tproxy_enabled: true,
            },
            listed: false,
        };
    }

    private async getPubkeyFromCvm(vmConfig: CvmConfig): Promise<GetPubkeyFromCvmResponse | null> {
        try {
            const response = await fetch(`${this.CLOUD_API_URL}/api/v1/cvms/pubkey/from_cvm_configuration`, {
                method: "POST",
                headers,
                body: JSON.stringify(vmConfig),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return (await response.json()) as GetPubkeyFromCvmResponse;
        } catch (error: any) {
            console.error("Error during get pubkey from cvm:", error.message);
            return null;
        }
    }

    public async waitForDeployment(
        options = {
            initialDelay: 1000,
            maxDelay: 30000,
            maxRetries: 12,
            backoffFactor: 1.5,
        }
    ): Promise<string> {
        let retryCount = 0;
        let deploymentUrl: string | null = null;

        while (retryCount < options.maxRetries && !deploymentUrl) {
            // Calculate wait time with exponential backoff, capped at maxDelay
            const waitTime = Math.min(
                options.initialDelay * Math.pow(options.backoffFactor, retryCount),
                options.maxDelay
            );

            await new Promise((resolve) => setTimeout(resolve, waitTime));

            const cvmsResponse = (await this.queryCvmsByUserId()) as any;
            deploymentUrl = cvmsResponse?.[0]?.dapp_dashboard_url;

            if (!deploymentUrl) {
                console.log(`Waiting for deployment... (attempt ${retryCount + 1}/${options.maxRetries})`);
                retryCount++;
            }
        }

        if (!deploymentUrl) {
            throw new Error("Deployment timeout: Failed to get deployment URL after maximum retries");
        }

        return deploymentUrl;
    }

    public async queryCvmsByUserId(): Promise<unknown | null> {
        try {
            const userInfo = await this.getUserInfo();
            console.log("userInfo", userInfo);
            return await fetch(`${this.CLOUD_API_URL}/api/v1/cvms?user_id=${userInfo?.id}`, {
                headers,
            }).then((res) => res.json());
        } catch (error: any) {
            console.error("Error during get cvms by user id:", error.response?.data || error.message);
            return null;
        }
    }

    private async createCvm(vmConfig: CvmConfig): Promise<CreateCvmResponse | null> {
        try {
            const response = await fetch(`${this.CLOUD_API_URL}/api/v1/cvms/from_cvm_configuration`, {
                method: "POST",
                headers,
                body: JSON.stringify(vmConfig),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return (await response.json()) as CreateCvmResponse;
        } catch (error: any) {
            console.error("Error during create cvm:", error.message);
            return null;
        }
    }

    private async encryptSecrets(secrets: Env[], pubkey: string): Promise<string> {
        const envsJson = JSON.stringify({ env: secrets });

        // Generate private key and derive public key
        const privateKey = x25519.utils.randomPrivateKey();
        const publicKey = x25519.getPublicKey(privateKey);

        // Generate shared key
        const remotePubkey = this.hexToUint8Array(pubkey);
        const shared = x25519.getSharedSecret(privateKey, remotePubkey);

        // Import shared key for AES-GCM
        const importedShared = await crypto.subtle.importKey("raw", shared, { name: "AES-GCM", length: 256 }, true, [
            "encrypt",
        ]);

        // Encrypt the data
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            importedShared,
            new TextEncoder().encode(envsJson)
        );

        // Combine all components
        const result = new Uint8Array(publicKey.length + iv.length + encrypted.byteLength);

        result.set(publicKey);
        result.set(iv, publicKey.length);
        result.set(new Uint8Array(encrypted), publicKey.length + iv.length);

        return this.uint8ArrayToHex(result);
    }

    private async getUserInfo(): Promise<{ id: string; username: string } | null> {
        try {
            const getUserAuth = await fetch(`${this.CLOUD_API_URL}/api/v1/auth/me`, {
                headers,
            }).then((res) => res.json());
            const username = getUserAuth.username;
            const getUserId = await fetch(`${this.CLOUD_API_URL}/api/v1/users/search?q=${username}`, {
                headers,
            }).then((res) => res.json());
            const userId = getUserId.users[0].id;
            return { id: userId, username: username };
        } catch (error: any) {
            console.error("Error during get user info:", error.response?.data || error.message);
            return null;
        }
    }

    private hexToUint8Array(hex: string): Uint8Array {
        hex = hex.startsWith("0x") ? hex.slice(2) : hex;
        return new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
    }

    private uint8ArrayToHex(buffer: Uint8Array): string {
        return Array.from(buffer)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    }
}
