import { useState } from "react";
import {
  SendHorizontal,
  Paperclip,
  Mic,
  Sparkles,
} from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  return (
    <div className="border-t border-slate-800 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent px-8 py-6">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center rounded-3xl border border-slate-700 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-violet-900/20 px-5 py-4 transition-all duration-300 hover:border-violet-500">

          {/* Attachment */}
          <button className="rounded-xl p-2 text-gray-400 transition hover:bg-slate-800 hover:text-violet-400">
            <Paperclip size={20} />
          </button>

          {/* Input */}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Message Aura AI..."
            className="flex-1 bg-transparent px-4 text-white placeholder:text-gray-500 outline-none"
          />

          {/* AI Mode */}
          <button className="mr-2 rounded-xl bg-violet-600/20 p-2 text-violet-400 transition hover:bg-violet-600/30">
            <Sparkles size={18} />
          </button>

          {/* Voice */}
          <button className="mr-2 rounded-xl p-2 text-gray-400 transition hover:bg-slate-800 hover:text-violet-400">
            <Mic size={20} />
          </button>

          {/* Send */}
          <button
            onClick={handleSend}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3 shadow-lg shadow-violet-700/40 transition-all duration-300 hover:scale-110"
          >
            <SendHorizontal size={20} className="text-white" />
          </button>

        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Aura AI can make mistakes. Verify important information.
        </p>

      </div>
    </div>
  );
}

export default ChatInput;