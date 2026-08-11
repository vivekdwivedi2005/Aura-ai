import { MessageSquarePlus, MessageSquare, Settings } from "lucide-react";

function Sidebar() {
  return (
    <div className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-900">

      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-violet-400">
          🤖 Aura AI
        </h1>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-700">
          <MessageSquarePlus size={20} />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 space-y-2 px-4">

        <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-slate-800">
          <MessageSquare size={18} />
          Chat 1
        </button>

        <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-slate-800">
          <MessageSquare size={18} />
          Chat 2
        </button>

        <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-slate-800">
          <MessageSquare size={18} />
          Chat 3
        </button>

      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-slate-800">
          <Settings size={18} />
          Settings
        </button>
      </div>

    </div>
  );
}

export default Sidebar;