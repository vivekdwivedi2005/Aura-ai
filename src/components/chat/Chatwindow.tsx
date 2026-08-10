import Header from "./Header";
import Message from "./Message";
import type { ChatMessage } from "../../pages/chat/chat";

type ChatWindowProps = {
  messages: ChatMessage[];
};

function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex flex-1 flex-col bg-slate-950">
      {/* Header */}
      <Header />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {messages.map((msg, index) => (
            <Message
              key={index}
              sender={msg.sender}
              text={msg.text}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;