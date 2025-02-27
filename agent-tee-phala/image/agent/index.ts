import startVercelAiAgent from "./vercel-ai";

export default async function startAgent() {
    console.log("Starting agent...");
    await startVercelAiAgent();
    console.log("Agent started");
}

startAgent();
