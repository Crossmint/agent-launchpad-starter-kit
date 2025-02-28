import { crossmint } from "@goat-sdk/crossmint";
import type { SupportedSmartWalletChains } from "@goat-sdk/crossmint/dist/chains";
const apiKey = process.env.CROSSMINT_SERVER_API_KEY;
const walletSignerSecretKey = process.env.SIGNER_WALLET_SECRET_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY_BASE_SEPOLIA;
const smartWalletAddress = process.env.SMART_WALLET_ADDRESS;

if (!apiKey || !walletSignerSecretKey || !alchemyApiKey || !smartWalletAddress) {
    throw new Error("Missing environment variables");
}

const { smartwallet } = crossmint(apiKey);

export async function getWalletClient(chain: SupportedSmartWalletChains) {
    const walletClient = await smartwallet({
        address: smartWalletAddress,
        signer: {
            secretKey: walletSignerSecretKey as `0x${string}`,
        },
        chain,
        provider: alchemyApiKey as string,
    });

    return {
        walletClient,
    };
}
