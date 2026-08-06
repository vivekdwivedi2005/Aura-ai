import Message from "./Message";

function ChatWindow() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950">

      {/* Header */}
      <div className="border-b border-slate-800 px-8 py-5">
        <h1 className="text-xl font-bold text-white">
          Aura AI
        </h1>
        <p className="text-sm text-gray-400">
          Your intelligent AI assistant
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">

        <Message
          sender="ai"
          text="👋 Hello Vivek! I'm Aura AI. How can I help you today?"
        />

        <Message
          sender="user"
          text="Hi Aura! Tell me about yourself."
        />

        <Message
          sender="ai"
          text="I'm your personal AI companion. I can chat, remember conversations, summarize PDFs, generate code and much more."
        />

      </div>

    </div>
  );
}

export default ChatWindow;