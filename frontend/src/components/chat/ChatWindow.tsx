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
      block: "end",
    });
  }, [messages]);

  const isEmpty =
    messages.length === 1 &&
    messages[0].sender === "ai";

  return (
    <main className="aura-chat-window">
      {/* Header */}
      <header className="aura-chat-header">
        <div className="aura-chat-header-inner">
          <div className="aura-header-title">
            <span className="aura-header-dot" />
            <span>Aura AI</span>
          </div>
        </div>
      </header>

      {/* Scrollable Chat Area */}
      <div className="aura-messages-scroll">
        {isEmpty ? (
          <div className="aura-welcome">
            <div className="aura-welcome-icon">
              <SparklesIcon />
            </div>

            <h1>How can I help you today?</h1>

            <p>
              Ask Aura AI anything. Start a conversation,
              explore ideas, or get help with your work.
            </p>
          </div>
        ) : (
          <div className="aura-conversation">
            {messages.map((message, index) => (
              <Message
                key={`${index}-${message.sender}`}
                sender={message.sender}
                text={message.text}
              />
            ))}

            <div
              ref={messagesEndRef}
              className="h-px w-full"
            />
          </div>
        )}
      </div>
    </main>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="m12 3-1.2 4.2L7 8.5l3.8 1.3L12 14l1.2-4.2L17 8.5l-3.8-1.3L12 3Z" />
      <path d="m19 13-.7 2.3-2.3.7 2.3.7.7 2.3.7-2.3 2.3-.7-2.3-.7L19 13Z" />
    </svg>
  );
}

export default ChatWindow;