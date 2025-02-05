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

interface Cvm {
    hosted: Hosted;
    name: string;
    managed_user: any;
    node: any;
    listed: boolean;
    status: string;
    in_progress: boolean;
    dapp_dashboard_url: string;
    syslog_endpoint: string;
    allow_upgrade: boolean;
}

interface CvmNetwork {
    is_online: boolean;
    is_public: boolean;
    error?: string;
    internal_ip: string;
    latest_handshake: string;
    public_urls: PublicUrl[];
}

interface PublicUrl {
    app: string;
    instance: string;
}

interface Hosted {
    id: string;
    name: string;
    status: string;
    uptime: string;
    app_url: string;
    app_id: string;
    instance_id: string;
    exited_at: string;
    boot_progress: string;
    boot_error: string;
    shutdown_progress: string;
    image_version: string;
    configuration: Configuration;
}

interface Configuration {
    memory: number;
    disk_size: number;
    vcpu: number;
}

interface CreateCvmResponse {
    app_id: string;
    [key: string]: any;
}

interface GetPubkeyFromCvmResponse {
    app_env_encrypt_pubkey: string;
    app_id_salt: string;
}

export type { DeployOptions, Env, CvmConfig, Cvm, CreateCvmResponse, GetPubkeyFromCvmResponse, CvmNetwork };
