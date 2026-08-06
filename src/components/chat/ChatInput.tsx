import { Send } from "lucide-react";

function ChatInput() {
  return (
    <div className="border-t border-slate-800 bg-slate-900 p-4">
      <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3">
        <input
          type="text"
          placeholder="Ask Aura AI anything..."
          className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
        />

        <button className="rounded-xl bg-violet-600 p-3 transition hover:bg-violet-700">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;