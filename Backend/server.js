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

            // Allow Vercel preview/deployment URLs
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
        allowedHeaders: ["Content-Type"],
    })
);

/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.json({ limit: "1mb" }));

/* =========================================
   GEMINI CLIENT
========================================= */

const ai = new GoogleGenAI({
    apiKey: apiKey,
});

/* =========================================
   GEMINI RETRY FUNCTION
========================================= */

async function generateWithRetry(
    contents,
    maxRetries = 3
) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response =
                await ai.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents: contents,
                });

            return response;
        } catch (error) {
            lastError = error;

            const status = error && error.status;

            console.error(
                `Gemini attempt ${attempt + 1} failed with status:`,
                status
            );

            /*
             * Retry only temporary errors.
             *
             * 429 = rate limit / quota
             * 500 = server error
             * 502 = bad gateway
             * 503 = service temporarily unavailable
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
                1000 * Math.pow(2, attempt);

            console.log(
                `⏳ Retrying Gemini request in ${
          delay / 1000
        } seconds...`
            );

            await new Promise((resolve) =>
                setTimeout(resolve, delay)
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

app.post("/api/chat", async function(req, res) {
    try {
        const messages = req.body.messages;

        /* Validate request */

        if (!Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: "Messages must be an array.",
            });
        }

        if (messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Messages are required.",
            });
        }

        /* =======================================
           Convert Aura messages → Gemini format
        ======================================= */

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

        /* =======================================
           Gemini request with retry
        ======================================= */

        const response = await generateWithRetry(
            contents
        );

        const reply =
            response &&
            typeof response.text === "string" ?
            response.text.trim() :
            "";

        /* Empty response */

        if (!reply) {
            return res.status(502).json({
                success: false,
                error: "Gemini returned an empty response.",
            });
        }

        /* =======================================
           Success
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

        if (status === 500 || status === 502) {
            return res.status(502).json({
                success: false,
                error: "⚠️ Gemini is temporarily having a server problem. Please try again.",
            });
        }

        /* =======================================
           AUTHENTICATION
        ======================================= */

        if (status === 401 || status === 403) {
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
            error: "❌ Failed to get response from Gemini.",
        });
    }
});

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

app.listen(PORT, "0.0.0.0", function() {
    console.log(
        "🚀 Aura AI Backend running on port " +
        PORT
    );

    console.log(
        "🌐 Aura AI API ready at http://localhost:" +
        PORT
    );
});