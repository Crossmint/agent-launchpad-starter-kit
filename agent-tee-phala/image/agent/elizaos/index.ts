import type { Action, Plugin } from "@elizaos/core";
import { getWalletClient, getWalletProvider } from "./wallet";

function createGoatPlugin(getSetting: (key: string) => string | undefined): Plugin {
    const walletClient = getWalletClient(getSetting);
    if (!walletClient) {
        throw new Error("Wallet client not found");
    }

    // TODO: add on-chain actions
    const actions: Action[] = [];

    return {
        name: "[GOAT] Onchain Actions",
        description: "Mode integration plugin",
        providers: [getWalletProvider(walletClient)],
        evaluators: [],
        services: [],
        actions: actions,
    };
}

export default createGoatPlugin;
