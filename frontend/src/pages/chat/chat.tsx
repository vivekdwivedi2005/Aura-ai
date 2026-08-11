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

function Chat() {
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);

      if (savedChats) {
        return JSON.parse(savedChats);
      }

      return [createChat()];
    } catch (error) {
      console.error("Failed to load chats:", error);
      return [createChat()];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY) || ""
      );
    } catch {
      return "";
    }
  });

  const [isTyping, setIsTyping] = useState(false);

  // Make sure an active chat always exists
  useEffect(() => {
    if (chats.length === 0) {
      const newChat = createChat();

      setChats([newChat]);
      setActiveChatId(newChat.id);

      return;
    }

    const activeChatExists = chats.some(
      (chat) => chat.id === activeChatId
    );

    if (!activeChatExists) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  // Save all chats
  useEffect(() => {
    localStorage.setItem(
      CHATS_STORAGE_KEY,
      JSON.stringify(chats)
    );
  }, [chats]);

  // Save active chat
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(
        ACTIVE_CHAT_STORAGE_KEY,
        activeChatId
      );
    }
  }, [activeChatId]);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) ||
    chats[0];

  const messages = activeChat?.messages || defaultMessages;

  // New Chat
  const handleNewChat = () => {
    const newChat = createChat();

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  // Select Chat
  const handleSelectChat = (chatId: string) => {
    if (isTyping) return;

    setActiveChatId(chatId);
  };

  // Delete Chat
  const handleDeleteChat = (chatId: string) => {
    if (isTyping) return;

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

  // Rename Chat
  const handleRenameChat = (
    chatId: string,
    title: string
  ) => {
    if (!title.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: title.trim(),
            }
          : chat
      )
    );
  };

  // Send Message
  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping || !activeChat) {
      return;
    }

    const userMessage: ChatMessage = {
      sender: "user",
      text: text.trim(),
    };

    const updatedMessages = [
      ...activeChat.messages,
      userMessage,
    ];

    // Create title from first user message
    let updatedTitle = activeChat.title;

    if (
      activeChat.title === "New Chat" ||
      activeChat.messages.length === 1
    ) {
      updatedTitle =
        text.trim().length > 32
          ? `${text.trim().slice(0, 32)}...`
          : text.trim();
    }

    // Immediately show user message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              title: updatedTitle,
              messages: updatedMessages,
            }
          : chat
      )
    );

    setIsTyping(true);

    try {
      const reply = await askGemini(updatedMessages);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  userMessage,
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

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  userMessage,
                  {
                    sender: "ai",
                    text: "❌ Something went wrong while contacting Aura AI.",
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

  const sidebarChats: ChatHistoryItem[] = chats.map(
    (chat) => ({
      id: chat.id,
      title: chat.title,
    })
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-950 text-white">
      {/* Sidebar */}
      <Sidebar
        chats={sidebarChats}
        activeChatId={activeChat?.id || ""}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      {/* Main Chat */}
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="relative h-0 min-h-0 flex-1 overflow-hidden">
          <ChatWindow messages={messages} />

          {/* Typing Indicator */}
          {isTyping && (
            <div className="absolute bottom-6 left-10 z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
                  🤖
                </div>

                <div className="rounded-3xl border border-slate-700 bg-slate-800 px-5 py-4">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />

                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                      style={{
                        animationDelay: "0.15s",
                      }}
                    />

                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
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

        {/* Input */}
        <div className="shrink-0">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export default Chat;