import { useEffect, useState } from "react";
import Sidebar, {
  type ChatHistoryItem,
} from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";
import { askGemini } from "../../services/gemini";

export type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

const CHATS_STORAGE_KEY = "aura-ai-chats";
const ACTIVE_CHAT_STORAGE_KEY = "aura-ai-active-chat";

const defaultMessages: ChatMessage[] = [
  {
    sender: "ai",
    text: "👋 Hello! I'm Aura AI. How can I help you today?",
  },
];

const createChat = (): Chat => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [...defaultMessages],
});

function loadChats(): Chat[] {
  try {
    const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);

    if (!savedChats) {
      return [createChat()];
    }

    const parsedChats = JSON.parse(savedChats);

    if (!Array.isArray(parsedChats)) {
      return [createChat()];
    }

    if (parsedChats.length === 0) {
      return [createChat()];
    }

    return parsedChats;
  } catch (error) {
    console.error("Failed to load chats:", error);
    return [createChat()];
  }
}

function loadActiveChatId(): string {
  try {
    return (
      localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY) || ""
    );
  } catch {
    return "";
  }
}

function Chat() {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] =
    useState<string>(loadActiveChatId);

  const [isTyping, setIsTyping] = useState(false);

  /* -----------------------------------------
     Make sure an active chat exists
  ----------------------------------------- */

  useEffect(() => {
    if (chats.length === 0) {
      const newChat = createChat();

      setChats([newChat]);
      setActiveChatId(newChat.id);

      return;
    }

    const activeExists = chats.some(
      (chat) => chat.id === activeChatId
    );

    if (!activeExists) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  /* -----------------------------------------
     Save chats
  ----------------------------------------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        CHATS_STORAGE_KEY,
        JSON.stringify(chats)
      );
    } catch (error) {
      console.error(
        "Failed to save chats to localStorage:",
        error
      );
    }
  }, [chats]);

  /* -----------------------------------------
     Save active chat
  ----------------------------------------- */

  useEffect(() => {
    try {
      if (activeChatId) {
        localStorage.setItem(
          ACTIVE_CHAT_STORAGE_KEY,
          activeChatId
        );
      }
    } catch (error) {
      console.error(
        "Failed to save active chat:",
        error
      );
    }
  }, [activeChatId]);

  /* -----------------------------------------
     Active chat
  ----------------------------------------- */

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ||
    chats[0];

  const messages =
    activeChat?.messages || defaultMessages;

  /* -----------------------------------------
     NEW CHAT
     No artificial limit
  ----------------------------------------- */

  const handleNewChat = () => {
    const newChat = createChat();

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  /* -----------------------------------------
     SELECT CHAT
  ----------------------------------------- */

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  /* -----------------------------------------
     DELETE CHAT
  ----------------------------------------- */

  const handleDeleteChat = (chatId: string) => {
    const chatToDelete = chats.find(
      (chat) => chat.id === chatId
    );

    if (!chatToDelete) return;

    const confirmed = window.confirm(
      `Delete "${chatToDelete.title}"?`
    );

    if (!confirmed) return;

    const remainingChats = chats.filter(
      (chat) => chat.id !== chatId
    );

    if (remainingChats.length === 0) {
      const newChat = createChat();

      setChats([newChat]);
      setActiveChatId(newChat.id);

      return;
    }

    setChats(remainingChats);

    if (chatId === activeChatId) {
      setActiveChatId(remainingChats[0].id);
    }
  };

  /* -----------------------------------------
     RENAME CHAT
  ----------------------------------------- */

  const handleRenameChat = (
    chatId: string,
    title: string
  ) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: trimmedTitle,
            }
          : chat
      )
    );
  };

  /* -----------------------------------------
     SEND MESSAGE
  ----------------------------------------- */

  const handleSend = async (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText || isTyping || !activeChat) {
      return;
    }

    const currentChatId = activeChat.id;

    const userMessage: ChatMessage = {
      sender: "user",
      text: trimmedText,
    };

    const conversationForGemini: ChatMessage[] = [
      ...activeChat.messages,
      userMessage,
    ];

    /* ---------------------------------------
       Generate title automatically
    --------------------------------------- */

    let updatedTitle = activeChat.title;

    if (
      activeChat.title === "New Chat" ||
      activeChat.messages.length === 1
    ) {
      updatedTitle =
        trimmedText.length > 32
          ? `${trimmedText.slice(0, 32)}...`
          : trimmedText;
    }

    /* ---------------------------------------
       Immediately add user message
    --------------------------------------- */

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              title: updatedTitle,
              messages: conversationForGemini,
            }
          : chat
      )
    );

    setIsTyping(true);

    try {
      const reply = await askGemini(
        conversationForGemini
      );

      /* Add only AI response */
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    sender: "ai",
                    text: reply,
                  },
                ],
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "❌ Something went wrong while contacting Aura AI.";

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    sender: "ai",
                    text: errorMessage,
                  },
                ],
              }
            : chat
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  /* -----------------------------------------
     Sidebar data
  ----------------------------------------- */

  const sidebarChats: ChatHistoryItem[] = chats.map(
    (chat) => ({
      id: chat.id,
      title: chat.title,
    })
  );

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[#212121] text-white">
      {/* Sidebar */}
      <Sidebar
        chats={sidebarChats}
        activeChatId={activeChat?.id || ""}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      {/* Main area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Chat */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <ChatWindow messages={messages} />

          {/* Typing indicator */}
          {isTyping && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-[#292929]">
                  <span className="text-sm text-violet-400">
                    ✦
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-[#2f2f2f] px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />

                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
                      style={{
                        animationDelay: "0.15s",
                      }}
                    />

                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
                      style={{
                        animationDelay: "0.3s",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export default Chat;