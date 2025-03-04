import { crossmint } from "@goat-sdk/crossmint";
import type { SupportedSmartWalletChains } from "@goat-sdk/crossmint/dist/chains";
import { Connection } from "@solana/web3.js";

const apiKey = process.env.CROSSMINT_SERVER_API_KEY;
const walletSignerSecretKey = process.env.SIGNER_WALLET_SECRET_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY_BASE_SEPOLIA;
const smartWalletAddress = process.env.SMART_WALLET_ADDRESS;
const solanaRpcUrl = process.env.SOLANA_RPC_URL;

if (!apiKey || !walletSignerSecretKey || !alchemyApiKey || !smartWalletAddress || !solanaRpcUrl) {
    throw new Error("Missing environment variables");
}

const { evmSmartWallet, solanaSmartWallet } = crossmint(apiKey);

export async function getWalletClient(chain: SupportedSmartWalletChains | "solana") {
    if (chain === "solana") {
        return {
            walletClient: await solanaSmartWallet({
                config: {
                    adminSigner: {
                        type: "solana-keypair",
                        secretKey: walletSignerSecretKey as string,
                    },
                },
                connection: new Connection(solanaRpcUrl as string),
                address: smartWalletAddress as string,
            }),
        };
    }

    return {
        walletClient: await evmSmartWallet({
            address: smartWalletAddress,
            signer: {
                secretKey: walletSignerSecretKey as `0x${string}`,
            },
            chain,
            provider: alchemyApiKey as string,
        }),
    };
}
