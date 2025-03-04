import startVercelAiAgent from "./vercel-ai";

const openAiApiKey = process.env.OPENAI_API_KEY as string;

if (!openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
}

export default async function startAgent() {
    console.log("Starting agent...");
    await startVercelAiAgent();
    console.log("Agent started");
}

startAgent();
