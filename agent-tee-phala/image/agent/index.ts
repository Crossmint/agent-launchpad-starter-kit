import { AgentRuntime, ModelProviderName, type Character } from "@elizaos/core";
import { SqlJsDatabaseAdapter } from "@elizaos/adapter-sqljs";
import initSqlJs from "sql.js";
import createElizaGoatPlugin from "./elizaos";

const openAiApiKey = process.env.OPENAI_API_KEY as string;

if (!openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
}

export default async function startAgent() {
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
        token: openAiApiKey,
        databaseAdapter: new SqlJsDatabaseAdapter(db),
        cacheManager: undefined as any,
    });
    await agent.initialize();
    console.log("Agent initialized...");
}

startAgent();
