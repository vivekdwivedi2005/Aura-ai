const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

/* =========================================
   CONFIGURATION
========================================= */

const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error(
        "❌ GEMINI_API_KEY is missing from Backend/.env"
    );

    process.exit(1);
}

/* =========================================
   CORS
========================================= */

const allowedExactOrigins = [
    "http://localhost:5173",
    "https://aura-ai-vivek.vercel.app",
];

app.use(
    cors({
        origin: function(origin, callback) {
            // Requests without an Origin header
            if (!origin) {
                return callback(null, true);
            }

            // Exact allowed origins
            if (allowedExactOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow Vercel preview URLs
            try {
                const url = new URL(origin);

                if (url.hostname.endsWith(".vercel.app")) {
                    return callback(null, true);
                }
            } catch (error) {
                return callback(
                    new Error("Invalid request origin.")
                );
            }

            return callback(
                new Error("Origin not allowed by CORS.")
            );
        },

        methods: ["GET", "POST", "OPTIONS"],

        allowedHeaders: [
            "Content-Type",
        ],
    })
);

/* =========================================
   MIDDLEWARE
========================================= */

app.use(
    express.json({
        limit: "1mb",
    })
);

/* =========================================
   GEMINI CLIENT
========================================= */

const ai = new GoogleGenAI({
    apiKey: apiKey,
});

/* =========================================
   AURA AI SYSTEM INSTRUCTION
========================================= */

const AURA_SYSTEM_INSTRUCTION = `
You are Aura AI, a helpful, intelligent, friendly, and professional personal AI assistant.

PERSONALITY:
- Be natural, warm, and conversational.
- Be helpful without being unnecessarily verbose.
- Speak clearly and confidently.
- Adapt your response length to the user's question.
- If the user asks for a simple answer, keep it simple.
- If the user asks for a detailed explanation, explain step by step.
- Do not sound robotic.
- Do not repeatedly introduce yourself unless it is relevant.

UNDERSTANDING:
- Understand the user's intent before answering.
- Use the conversation history provided in the request to maintain context.
- If the user refers to something discussed earlier in the conversation, use that context.
- If something is unclear, ask a concise clarification question instead of guessing.

ACCURACY:
- Never intentionally make up facts.
- If you are unsure about something, clearly say that you are unsure.
- Do not claim that you performed an action that you did not perform.
- Do not claim to have access to information that was not provided to you.

PROGRAMMING:
- When the user asks for code, provide clean and practical code.
- Prefer complete replaceable code when the user explicitly asks for it.
- Explain important changes briefly.
- Preserve the user's existing architecture when modifying their project.

CONVERSATION:
- Remember the context available in the current conversation.
- Answer follow-up questions naturally.
- Avoid repeating information unnecessarily.
- When helping with a project, focus on the user's current goal and avoid unnecessary changes.

IMPORTANT:
You are Aura AI.
Your job is to help the user solve problems, learn, build projects, and have useful conversations.
`;

/* =========================================
   MESSAGE PREPARATION
========================================= */

function prepareContents(messages) {
    if (!Array.isArray(messages)) {
        throw new Error(
            "Messages must be an array."
        );
    }

    if (messages.length === 0) {
        throw new Error(
            "Messages are required."
        );
    }

    const contents = messages
        .filter(function(message) {
            return (
                message &&
                (
                    message.sender === "user" ||
                    message.sender === "ai"
                ) &&
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
        throw new Error(
            "No valid messages were provided."
        );
    }

    return contents;
}

/* =========================================
   GEMINI RETRY FUNCTION
========================================= */

async function generateWithRetry(
    contents,
    maxRetries = 3
) {
    let lastError = null;

    for (
        let attempt = 0; attempt <= maxRetries; attempt++
    ) {
        try {
            const response =
                await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",

                    config: {
                        systemInstruction: AURA_SYSTEM_INSTRUCTION,

                        thinkingConfig: {
                            thinkingLevel: "minimal",
                        },
                    },

                    contents: contents,
                });

            return response;
        } catch (error) {
            lastError = error;

            const status =
                error && error.status;

            console.error(
                `Gemini attempt ${
                    attempt + 1
                } failed with status:`,
                status
            );

            /*
             * Retry only temporary errors.
             */

            const shouldRetry =
                status === 429 ||
                status === 500 ||
                status === 502 ||
                status === 503;

            if (!shouldRetry) {
                throw error;
            }

            /*
             * Don't retry after final attempt.
             */

            if (attempt === maxRetries) {
                break;
            }

            /*
             * Exponential backoff:
             *
             * Attempt 1 → 1 sec
             * Attempt 2 → 2 sec
             * Attempt 3 → 4 sec
             */

            const delay =
                1000 *
                Math.pow(2, attempt);

            console.log(
                `⏳ Retrying Gemini request in ${
                    delay / 1000
                } seconds...`
            );

            await new Promise(
                (resolve) =>
                setTimeout(
                    resolve,
                    delay
                )
            );
        }
    }

    throw lastError;
}

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

app.post(
    "/api/chat",
    async function(req, res) {
        try {
            const messages =
                req.body.messages;

            /* =======================================
               VALIDATE + PREPARE
            ======================================= */

            const contents =
                prepareContents(messages);

            /* =======================================
               GEMINI REQUEST
            ======================================= */

            const response =
                await generateWithRetry(
                    contents
                );

            /* =======================================
               GET RESPONSE TEXT
            ======================================= */

            const reply =
                response &&
                typeof response.text === "string" ?
                response.text.trim() :
                "";

            /* =======================================
               EMPTY RESPONSE
            ======================================= */

            if (!reply) {
                return res.status(502).json({
                    success: false,
                    error: "Gemini returned an empty response.",
                });
            }

            /* =======================================
               SUCCESS
            ======================================= */

            return res.status(200).json({
                success: true,
                reply: reply,
            });
        } catch (error) {
            console.error(
                "❌ Gemini API Error:",
                error
            );

            const status =
                error && error.status;

            /* =======================================
               QUOTA / RATE LIMIT
            ======================================= */

            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    error: "⚠️ Aura AI has reached the Gemini API quota or rate limit. Please try again later.",
                });
            }

            /* =======================================
               TEMPORARY UNAVAILABLE
            ======================================= */

            if (status === 503) {
                return res.status(503).json({
                    success: false,
                    error: "⚠️ Gemini is temporarily unavailable because of high demand. Please try again in a moment.",
                });
            }

            /* =======================================
               SERVER ERRORS
            ======================================= */

            if (
                status === 500 ||
                status === 502
            ) {
                return res.status(502).json({
                    success: false,
                    error: "⚠️ Gemini is temporarily having a server problem. Please try again.",
                });
            }

            /* =======================================
               AUTHENTICATION
            ======================================= */

            if (
                status === 401 ||
                status === 403
            ) {
                return res.status(status).json({
                    success: false,
                    error: "❌ Gemini API authentication failed. Please check the API key.",
                });
            }

            /* =======================================
               MODEL NOT FOUND
            ======================================= */

            if (status === 404) {
                return res.status(404).json({
                    success: false,
                    error: "❌ The configured Gemini model is unavailable.",
                });
            }

            /* =======================================
               GENERIC ERROR
            ======================================= */

            return res.status(500).json({
                success: false,
                error: error instanceof Error ?
                    error.message :
                    "❌ Failed to get response from Gemini.",
            });
        }
    }
);

/* =========================================
   404 ROUTE
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

app.listen(
    PORT,
    "0.0.0.0",
    function() {
        console.log(
            "🚀 Aura AI Backend running on port " +
            PORT
        );

        console.log(
            "🌐 Aura AI API ready at http://localhost:" +
            PORT
        );
    }
);