import type { Character } from "@elizaos/core";
import createElizaGoatPlugin from "./elizaos";
const openAiApiKey = process.env.OPENAI_API_KEY as string;

if (!openAiApiKey) {
    throw new Error("Missing openai api key");
}

export default async function startAgent() {
    const plugins = await createElizaGoatPlugin();
    // @ts-ignore TODO: Finish character and deploy the agent here...
    const character: Character = {
        name: "GOAT Agent",
        adjectives: ["smart", "helpful", "friendly"],
        lore: ["You are a helpful assistant that can help with a variety of tasks."],
        bio: "You are a helpful assistant that can help with a variety of tasks.",
        plugins: [plugins],
        clients: [],
        // services: [],
    };
}

startAgent();
