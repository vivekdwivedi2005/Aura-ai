import { useEffect, useState } from "react";
import Sidebar from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";
import { askGemini } from "../../services/gemini";

export type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

const STORAGE_KEY = "aura-ai-chat-history";

const defaultMessages: ChatMessage[] = [
  {
    sender: "ai",
    text: "👋 Hello! I'm Aura AI. How can I help you today?",
  },
];

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);

      if (savedMessages) {
        return JSON.parse(savedMessages);
      }

      return defaultMessages;
    } catch (error) {
      console.error("Failed to load chat history:", error);
      return defaultMessages;
    }
  });

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleNewChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages(defaultMessages);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      sender: "user",
      text: text.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const reply = await askGemini(updatedMessages);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

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
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-950 text-white">
      <Sidebar onNewChat={handleNewChat} />

      <div className="flex h-full min-h-0 flex-1 flex-col">
        {/* Chat */}
        <div className="relative h-0 min-h-0 flex-1 overflow-hidden">
          <ChatWindow messages={messages} />

          {/* Typing Indicator */}
          {isTyping && (
            <div className="absolute bottom-6 left-10 z-10">
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

        {/* Input */}
        <div className="shrink-0">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export default Chat;