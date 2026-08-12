const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;
const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

/* =========================================
   API KEY CHECK
========================================= */

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from Backend/.env");
    process.exit(1);
}

/* =========================================
   MIDDLEWARE
========================================= */

app.use(
    cors({
        origin: frontendUrl,
    })
);

app.use(express.json({ limit: "1mb" }));

/* =========================================
   GEMINI
========================================= */

const ai = new GoogleGenAI({
    apiKey: apiKey,
});

/* =========================================
   HEALTH CHECK
========================================= */

app.get("/", function(req, res) {
    res.status(200).json({
        success: true,
        message: "Aura AI Backend is running 🚀",
    });
});

/* =========================================
   CHAT API
========================================= */

app.post("/api/chat", async function(req, res) {
    try {
        const messages = req.body.messages;

        /* Validate messages */

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Messages are required.",
            });
        }

        /* Convert messages for Gemini */

        const contents = messages
            .filter(function(message) {
                return (
                    message &&
                    (message.sender === "user" ||
                        message.sender === "ai") &&
                    typeof message.text === "string" &&
                    message.text.trim().length > 0
                );
            })
            .map(function(message) {
                return {
                    role: message.sender === "user" ?
                        "user" :
                        "model",
                    parts: [{
                        text: message.text.trim(),
                    }, ],
                };
            });

        if (contents.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No valid messages were provided.",
            });
        }

        /* Gemini request */

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: contents,
        });

        const reply = response.text;

        if (!reply) {
            return res.status(502).json({
                success: false,
                error: "Gemini returned an empty response.",
            });
        }

        return res.status(200).json({
            success: true,
            reply: reply,
        });
    } catch (error) {
        console.error("Gemini API Error:", error);

        /* Quota / Rate limit */

        if (error && error.status === 429) {
            return res.status(429).json({
                success: false,
                error: "Aura AI has temporarily reached its Gemini API quota. Please try again later.",
            });
        }

        /* Authentication */

        if (
            error &&
            (error.status === 401 || error.status === 403)
        ) {
            return res.status(error.status).json({
                success: false,
                error: "Gemini API authentication failed. Please check the API key.",
            });
        }

        /* Model not found */

        if (error && error.status === 404) {
            return res.status(404).json({
                success: false,
                error: "The configured Gemini model is unavailable.",
            });
        }

        /* Generic error */

        return res.status(500).json({
            success: false,
            error: "Failed to get response from Gemini.",
        });
    }
});

/* =========================================
   404
========================================= */

app.use(function(req, res) {
    res.status(404).json({
        success: false,
        error: "Route not found.",
    });
});

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, function() {
    console.log(
        "🚀 Aura AI Backend running on port " + PORT
    );

    console.log(
        "🌐 Allowed frontend: " + frontendUrl
    );
});