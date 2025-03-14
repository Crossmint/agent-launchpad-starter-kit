import startElizaGoatPlugin from "./elizaos";

(async function () {
    try {
        console.log("Starting agent...");
        await startElizaGoatPlugin();
        console.log("Agent started");
    } catch (error) {
        console.error("Error starting agent:", error);
    }
})();
