import type { Plugin } from "@elizaos/core";
import { getWalletClient, getWalletProvider } from "./wallet";

export default async function createElizaGoatPlugin(): Promise<Plugin> {
    const { walletClient, actions } = await getWalletClient();
    return {
        name: "[GOAT] Onchain Actions",
        description: "Mode integration plugin",
        providers: [getWalletProvider(walletClient)],
        evaluators: [],
        services: [],
        actions,
    };
}
