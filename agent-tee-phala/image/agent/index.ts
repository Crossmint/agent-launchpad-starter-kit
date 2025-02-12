import type { Character } from "@elizaos/core";
import createElizaGoatPlugin from "./elizaos";

export default async function startAgent() {
    const plugins = await createElizaGoatPlugin();
    // @ts-ignore TODO: Finish character and deploy the agent here...
    const character: Character = {
        name: "Rufus Agent",
        adjectives: ["smart", "helpful", "friendly"],
        lore: ["You are a helpful assistant that can help with a variety of tasks."],
        bio: "You are a helpful assistant that can help with a variety of tasks.",
        plugins: [plugins],
        clients: [],
        // services: [],
    };
    console.log("Skipping agent deployment...");
}

startAgent();
