import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
// This is just an example plugin (coingecko) - see all available GOAT plugins at:
// https://github.com/goat-sdk/goat/tree/main/typescript/packages/plugins
import { coingecko } from "@goat-sdk/plugin-coingecko";
import { getWalletClient } from "./wallet";

const coingeckoApiKey = process.env.COINGECKO_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!coingeckoApiKey || !openaiApiKey) {
    throw new Error("COINGECKO_API_KEY or OPENAI_API_KEY is not set");
}

export default async function startVercelAiAgent() {
    const { walletClient } = await getWalletClient();
    const tools = await getOnChainTools({
        wallet: walletClient,
        plugins: [coingecko({ apiKey: coingeckoApiKey as string })],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: "What are the trending cryptocurrencies right now and what's the price of Bonk?",
    });

    console.log(result.text);
}
