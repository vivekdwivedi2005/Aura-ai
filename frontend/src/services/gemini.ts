export type GeminiMessage = {
  sender: "user" | "ai";
  text: string;
};

export async function askGemini(
  messages: GeminiMessage[]
): Promise<string> {
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    return data.reply;
  } catch (error) {
    console.error("Aura AI Error:", error);

    return "❌ Sorry, I couldn't connect to Aura AI.";
  }
}