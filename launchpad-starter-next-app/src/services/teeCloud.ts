import fs from "fs";
// import { x25519 } from "@noble/curves/ed25519";
// import { crypto } from "@noble/curves/abstract/noble-hashes";

interface DeployOptions {
    compose?: string;
    name: string;
    vcpu?: number;
    memory?: number;
    diskSize?: number;
    envs?: Record<string, string>;
    debug?: boolean;
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
    private apiKey?: string;

    constructor(cloudApiUrl: string, cloudUrl: string) {
        this.CLOUD_API_URL = cloudApiUrl;
        this.CLOUD_URL = cloudUrl;
        this.apiKey = "API_KEY"; // TODO: Add API key here
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
        console.log("App URL:", `${this.CLOUD_URL}/dashboard/cvms/app_${response.app_id}`);
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
                headers: {
                    "X-API-Key": this.apiKey,
                    "Content-Type": "application/json",
                },
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

    private async createCvm(vmConfig: CvmConfig): Promise<CreateCvmResponse | null> {
        try {
            const response = await fetch(`${this.CLOUD_API_URL}/api/v1/cvms/from_cvm_configuration`, {
                method: "POST",
                headers: {
                    "X-API-Key": this.apiKey,
                    "Content-Type": "application/json",
                },
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

    private async encryptSecrets(secrets: Record<string, string>, pubkey: string): Promise<string> {
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
