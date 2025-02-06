import elizaosPlugin from "./elizaos";
export async function startAgent() {
    await elizaosPlugin((key: string) => {
        switch (key) {
            case "EVM_PRIVATE_KEY":
                return process.env.EVM_PRIVATE_KEY;
            case "EVM_PROVIDER_URL":
                return process.env.EVM_PROVIDER_URL;
            default:
                return undefined;
        }
    });
}

startAgent();
