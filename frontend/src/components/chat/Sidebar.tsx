import {
  MessageSquarePlus,
  Settings,
  Pencil,
  Trash2,
  Check,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

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
  const navigate = useNavigate();

  const [editingChatId, setEditingChatId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  const startEditing = (
    chat: ChatHistoryItem
  ) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const saveEditing = () => {
    if (!editingChatId) {
      cancelEditing();
      return;
    }

    const title = editingTitle.trim();

    if (!title) {
      cancelEditing();
      return;
    }

    onRenameChat(editingChatId, title);
    cancelEditing();
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout failed:",
          error
        );

        alert(
          "Unable to logout right now. Please try again."
        );

        setLoggingOut(false);
        return;
      }

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        "Unable to logout right now. Please try again."
      );

      setLoggingOut(false);
    }
  };

  return (
    <aside className="aura-sidebar">
      {/* =====================================
          BRAND
      ====================================== */}

      <div className="aura-sidebar-header">
        <button
          type="button"
          onClick={onNewChat}
          className="aura-brand"
        >
          <span className="aura-brand-icon overflow-hidden">
            <img
              src="/aura-logo.png"
              alt="Aura AI"
              className="h-full w-full object-cover"
            />
          </span>

          <span className="aura-brand-text">
            <span className="aura-brand-name">
              Aura AI
            </span>

            <span className="aura-brand-subtitle">
              Personal AI assistant
            </span>
          </span>
        </button>
      </div>

      {/* =====================================
          NEW CHAT
      ====================================== */}

      <div className="aura-new-chat-wrapper">
        <button
          type="button"
          onClick={onNewChat}
          className="aura-new-chat"
        >
          <MessageSquarePlus size={18} />
          <span>New chat</span>
        </button>
      </div>

      {/* =====================================
          HISTORY
      ====================================== */}

      <div className="aura-history">
        <div className="aura-history-title">
          Recent
        </div>

        {chats.length === 0 ? (
          <div className="aura-empty-history">
            Your conversations will appear here
          </div>
        ) : (
          <div className="aura-chat-list">
            {chats.map((chat) => {
              const isActive =
                chat.id === activeChatId;

              const isEditing =
                editingChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={`aura-chat-item ${
                    isActive ? "active" : ""
                  }`}
                >
                  {isEditing ? (
                    <div className="aura-edit-row">
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEditing();
                          }

                          if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEditing();
                          }
                        }}
                        className="aura-edit-input"
                      />

                      <button
                        type="button"
                        onClick={saveEditing}
                        className="aura-edit-button save"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="aura-edit-button"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="aura-chat-row">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectChat(chat.id)
                        }
                        className="aura-chat-select"
                      >
                        <span className="aura-chat-title">
                          {chat.title}
                        </span>
                      </button>

                      <div className="aura-chat-actions">
                        <button
                          type="button"
                          onClick={() =>
                            startEditing(chat)
                          }
                          title="Rename chat"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDeleteChat(chat.id)
                          }
                          title="Delete chat"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================
          BOTTOM ACTIONS
      ====================================== */}

      <div className="aura-sidebar-bottom">
        <button
          type="button"
          className="aura-settings"
        >
          <Settings size={17} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={17} />

          <span>
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;