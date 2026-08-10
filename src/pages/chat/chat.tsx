import { useState } from "react";
import Sidebar from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";
import { askGemini } from "../../services/gemini";

export type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "👋 Hello! I'm Aura AI. How can I help you today?",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      sender: "user",
      text: text.trim(),
    };

    // Create conversation including the new user message
    const updatedMessages = [...messages, userMessage];

    // Show user message immediately
    setMessages(updatedMessages);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send complete conversation to Gemini
      const reply = await askGemini(updatedMessages);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Something went wrong while contacting Aura AI.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <div className="relative flex-1 overflow-hidden">
          <ChatWindow messages={messages} />

          {isTyping && (
            <div className="absolute bottom-6 left-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
                  🤖
                </div>

                <div className="rounded-3xl border border-slate-700 bg-slate-800 px-5 py-4">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />

                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                      style={{ animationDelay: "0.15s" }}
                    />

                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default Chat;