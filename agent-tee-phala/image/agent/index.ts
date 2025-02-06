import elizaosPlugin from "./elizaos";

// Export the main function
export default function startAgent() {
    return elizaosPlugin((key: string) => {
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

// If running directly (not imported), execute the function
if (require.main === module) {
    startAgent();
}
