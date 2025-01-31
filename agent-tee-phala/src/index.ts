import { TeeClient } from "./services/teeClient";

async function main() {
    const teeClient = new TeeClient();

    try {
        const publicKey = await teeClient.generateAgentKeys();
        console.log("Generated agent public key:", publicKey);
    } catch (error) {
        console.error("Error generating agent public key:", error);
    }

    process.stdin.resume();

    process.on("EXIT", () => {
        console.log("Received EXIT. Performing cleanup...");
        process.exit(0);
    });
}

main().catch(console.error);
