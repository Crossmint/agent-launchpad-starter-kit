import { crossmint } from "@goat-sdk/crossmint";
import { USDC, erc20 } from "@goat-sdk/plugin-erc20";

import { sendETH } from "@goat-sdk/wallet-evm";
import { getOnChainActions } from "./actions";
import type { WalletClientBase } from "@goat-sdk/core";

require("dotenv").config();

const apiKey = process.env.CROSSMINT_SERVER_API_KEY;
const walletSignerSecretKey = process.env.SIGNER_WALLET_SECRET_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY_BASE_SEPOLIA;
const smartWalletAddress = process.env.SMART_WALLET_ADDRESS;

if (!apiKey || !walletSignerSecretKey || !alchemyApiKey || !smartWalletAddress) {
    throw new Error("Missing environment variables");
}

const { smartwallet, faucet } = crossmint(apiKey);

export async function getWalletClient() {
    const walletClient = await smartwallet({
        address: smartWalletAddress,
        signer: {
            secretKey: walletSignerSecretKey as `0x${string}`,
        },
        chain: "base-sepolia",
        provider: alchemyApiKey as string,
    });
    const plugins = [sendETH(), erc20({ tokens: [USDC] }), faucet()];
    const actions = await getOnChainActions(walletClient, plugins);

    return {
        walletClient,
        actions,
    };
}

export function getWalletProvider(walletClient: WalletClientBase) {
    return {
        async get(): Promise<string | null> {
            try {
                const address = walletClient.getAddress();
                const balance = await walletClient.balanceOf(address);
                return `EVM Wallet Address: ${address}\nBalance: ${balance} ETH`;
            } catch (error) {
                console.error("Error in EVM wallet provider:", error);
                return null;
            }
        },
    };
}
