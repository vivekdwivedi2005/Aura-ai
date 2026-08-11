import {
  MessageSquarePlus,
  MessageSquare,
  Settings,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";

export type ChatHistoryItem = {
  id: string;
  title: string;
};

type SidebarProps = {
  chats: ChatHistoryItem[];
  activeChatId: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
};

function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(
    null
  );

  const [editingTitle, setEditingTitle] = useState("");

  const startEditing = (chat: ChatHistoryItem) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const saveEditing = () => {
    if (!editingChatId || !editingTitle.trim()) {
      cancelEditing();
      return;
    }

    onRenameChat(editingChatId, editingTitle.trim());
    cancelEditing();
  };

  return (
    <div className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-violet-400">
          🤖 Aura AI
        </h1>
      </div>

      {/* New Chat */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-900/20"
        >
          <MessageSquarePlus size={20} />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4">
        {chats.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            No conversations yet
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = editingChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={`group rounded-xl transition ${
                  isActive
                    ? "bg-slate-800"
                    : "hover:bg-slate-800"
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 p-2">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) =>
                        setEditingTitle(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveEditing();
                        }

                        if (e.key === "Escape") {
                          cancelEditing();
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-950 px-2 py-2 text-sm text-white outline-none focus:border-violet-500"
                    />

                    <button
                      onClick={saveEditing}
                      className="rounded-lg p-1.5 text-green-400 hover:bg-slate-700"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>

                    <button
                      onClick={cancelEditing}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-700"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left text-gray-300"
                    >
                      <MessageSquare
                        size={18}
                        className="shrink-0 text-violet-400"
                      />

                      <span className="truncate">
                        {chat.title}
                      </span>
                    </button>

                    <div className="mr-2 hidden items-center gap-1 group-hover:flex">
                      <button
                        onClick={() => startEditing(chat)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-700 hover:text-white"
                        title="Rename chat"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => onDeleteChat(chat.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                        title="Delete chat"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl p-3 text-gray-300 transition hover:bg-slate-800">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </div>
  );
}

export default Sidebar;