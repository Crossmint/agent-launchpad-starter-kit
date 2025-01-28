import express from "express";
import cors from "cors";
import deployRouter from "./routes/deploy";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/deploy", deployRouter);

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});
