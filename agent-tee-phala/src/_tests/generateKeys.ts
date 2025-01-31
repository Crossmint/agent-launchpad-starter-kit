import { TeeClient } from "../services/teeClient";

async function testKeyGeneration() {
    try {
        const teeClient = new TeeClient();

        // Generate keys multiple times to ensure uniqueness
        for (let i = 0; i < 3; i++) {
            console.log(`\nTest ${i + 1}:`);
            const result = await teeClient.generateAgentKeys();
            console.log("Generated Public Key:", result.agentPublicKey);
        }
    } catch (error) {
        console.error("Error during key generation test:", error);
    }
}

testKeyGeneration();
