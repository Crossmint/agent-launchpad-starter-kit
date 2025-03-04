import { AgentRuntime, ModelProviderName, type Character, type Plugin } from "@elizaos/core";
import initSqlJs from "sql.js";
import { getWalletClient, getWalletProvider } from "./wallet";
import { SqlJsDatabaseAdapter } from "@elizaos/adapter-sqljs";

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
}

async function createElizaGoatPlugin(): Promise<Plugin> {
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

export default async function startElizaGoatPlugin() {
    const plugins = await createElizaGoatPlugin();
    const character: Character = {
        name: "Rufus Agent",
        adjectives: ["smart", "helpful", "friendly"],
        lore: ["You are a helpful assistant that can help with a variety of tasks."],
        bio: "You are a helpful assistant that can help with a variety of tasks.",
        plugins: [plugins],
        clients: [],
        messageExamples: [],
        modelProvider: ModelProviderName.OPENAI,
        postExamples: [],
        style: { all: [], chat: [], post: [] },
        topics: [],
    };

    // Initialize the database
    const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
    const db = new SQL.Database();

    // Initialize the agent
    const agent = new AgentRuntime({
        character,
        modelProvider: ModelProviderName.OPENAI,
        token: openaiApiKey as string,
        databaseAdapter: new SqlJsDatabaseAdapter(db),
        cacheManager: undefined as any,
    });
    await agent.initialize();
    console.log("Agent initialized...");
}
