const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from Backend/.env");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey,
});

app.get("/", (req, res) => {
    res.json({
        message: "Aura AI Backend is running 🚀",
    });
});

app.post("/api/chat", async(req, res) => {
    try {
        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Messages are required.",
            });
        }

        const contents = messages.map((message) => ({
            role: message.sender === "user" ? "user" : "model",
            parts: [{
                text: message.text,
            }, ],
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
        });

        res.json({
            reply: response.text,
        });
    } catch (error) {
        console.error("Gemini API Error:", error);

        res.status(500).json({
            error: "Failed to get response from Gemini.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Aura AI Backend running on http://localhost:${PORT}`);
});