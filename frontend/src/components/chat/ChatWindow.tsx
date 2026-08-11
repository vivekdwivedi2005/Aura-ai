import { useEffect, useRef } from "react";
import Message from "./Message";
import type { ChatMessage } from "../../pages/chat/chat";

type ChatWindowProps = {
  messages: ChatMessage[];
};

function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-slate-950">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 px-8 py-5">
        <h1 className="text-xl font-bold text-white">
          Aura AI
        </h1>

        <p className="text-sm text-gray-400">
          Your intelligent AI assistant
        </p>
      </div>

      {/* Scrollable Messages */}
      <div className="h-0 min-h-0 flex-1 overflow-y-scroll px-8 py-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {messages.map((msg, index) => (
            <Message
              key={index}
              sender={msg.sender}
              text={msg.text}
            />
          ))}

          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;