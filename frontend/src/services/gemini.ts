export type GeminiMessage = {
  sender: "user" | "ai";
  text: string;
};

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

/*
 * =========================================
 * NORMAL CHAT
 * =========================================
 */

export async function askGemini(
  messages: GeminiMessage[]
): Promise<string> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throwBackendError(
        response.status,
        data
      );
    }

    if (
      !data.reply ||
      typeof data.reply !== "string"
    ) {
      throw new Error(
        "Aura AI returned an empty response."
      );
    }

    return data.reply;
  } catch (error) {
    console.error(
      "Aura AI Error:",
      error
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "❌ Unable to connect to Aura AI backend."
    );
  }
}

/*
 * =========================================
 * PDF CHAT
 * =========================================
 */

export async function askGeminiWithPDF(
  messages: GeminiMessage[],
  file: File
): Promise<string> {
  try {
    const formData =
      new FormData();

    formData.append(
      "messages",
      JSON.stringify(messages)
    );

    formData.append(
      "pdf",
      file
    );

    const response = await fetch(
      `${BACKEND_URL}/api/chat/pdf`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throwBackendError(
        response.status,
        data
      );
    }

    if (
      !data.reply ||
      typeof data.reply !== "string"
    ) {
      throw new Error(
        "Aura AI returned an empty PDF response."
      );
    }

    return data.reply;
  } catch (error) {
    console.error(
      "Aura AI PDF Error:",
      error
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "❌ Unable to process the PDF."
    );
  }
}

/*
 * =========================================
 * BACKEND ERROR HANDLER
 * =========================================
 */

function throwBackendError(
  status: number,
  data: any
): never {
  if (status === 429) {
    throw new Error(
      "⚠️ Aura AI has temporarily reached its Gemini API free-tier quota. Please try again later."
    );
  }

  if (
    status === 401 ||
    status === 403
  ) {
    throw new Error(
      "❌ Gemini authentication failed. Please check the API configuration."
    );
  }

  if (status === 404) {
    throw new Error(
      "❌ The configured Gemini model is currently unavailable."
    );
  }

  if (status === 413) {
    throw new Error(
      "❌ PDF is too large. Please upload a PDF smaller than 10 MB."
    );
  }

  if (status === 503) {
    throw new Error(
      "⚠️ Gemini is temporarily unavailable. Please try again in a moment."
    );
  }

  throw new Error(
    data?.error ||
      `Backend error: ${status}`
  );
}