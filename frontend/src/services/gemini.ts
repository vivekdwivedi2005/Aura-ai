export type GeminiMessage = {
  sender: "user" | "ai";
  text: string;
};

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function askGemini(
  messages: GeminiMessage[]
): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend Error:", data);

      if (response.status === 429) {
        throw new Error(
          "⚠️ Aura AI has temporarily reached its Gemini API free-tier quota. Please try again later."
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "❌ Gemini authentication failed. Please check the API configuration."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "❌ The configured Gemini model is currently unavailable."
        );
      }

      throw new Error(
        data.error || `Backend error: ${response.status}`
      );
    }

    if (!data.reply || typeof data.reply !== "string") {
      throw new Error(
        "Aura AI returned an empty response."
      );
    }

    return data.reply;
  } catch (error) {
    console.error("Aura AI Error:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "❌ Unable to connect to Aura AI backend."
    );
  }
}