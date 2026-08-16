import { useEffect, useState } from "react";
import Sidebar, {
  type ChatHistoryItem,
} from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";
import { askGemini } from "../../services/gemini";
import { supabase } from "../../lib/supabase";

export type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

type Chat = {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
};

type SupabaseUser = {
  id: string;
  email?: string;
};

const ACTIVE_CHAT_STORAGE_PREFIX =
  "aura-ai-active-chat-";

const defaultMessages: ChatMessage[] = [
  {
    sender: "ai",
    text: "👋 Hello! I'm Aura AI. How can I help you today?",
  },
];

function Chat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] =
    useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingChats, setIsLoadingChats] =
    useState(true);

  /*
   * =========================================
   * LOAD USER CHATS
   * =========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadChats = async () => {
      setIsLoadingChats(true);

      try {
        /*
         * Get currently authenticated user
         */
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(
            "Unable to get current user:",
            userError
          );

          if (mounted) {
            setChats([]);
            setActiveChatId("");
            setIsLoadingChats(false);
          }

          return;
        }

        const currentUser =
          user as SupabaseUser;

        /*
         * Remove old browser-only chat history.
         *
         * This prevents old localStorage chats
         * from appearing for different users.
         */
        localStorage.removeItem(
          "aura-ai-chats"
        );

        /*
         * Fetch this user's chats only.
         *
         * RLS on Supabase guarantees that
         * auth.uid() can only access rows
         * belonging to this user.
         */
        const {
          data,
          error,
        } = await supabase
          .from("chats")
          .select(
            "id,user_id,title,messages,created_at"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        let loadedChats: Chat[] =
          (data || []).map((chat) => ({
            id: chat.id,
            user_id: chat.user_id,
            title: chat.title,
            messages: Array.isArray(chat.messages)
              ? chat.messages
              : defaultMessages,
            created_at: chat.created_at,
          }));

        /*
         * If user has no chats, create first chat.
         */
        if (loadedChats.length === 0) {
          const {
            data: newChat,
            error: createError,
          } = await supabase
            .from("chats")
            .insert({
              user_id: currentUser.id,
              title: "New Chat",
              messages: defaultMessages,
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          loadedChats = [
            {
              id: newChat.id,
              user_id: newChat.user_id,
              title: newChat.title,
              messages: Array.isArray(
                newChat.messages
              )
                ? newChat.messages
                : defaultMessages,
              created_at: newChat.created_at,
            },
          ];
        }

        if (!mounted) return;

        setChats(loadedChats);

        /*
         * Restore previously active chat
         * for this specific user.
         */
        const activeStorageKey =
          `${ACTIVE_CHAT_STORAGE_PREFIX}${currentUser.id}`;

        const savedActiveChat =
          localStorage.getItem(
            activeStorageKey
          );

        const savedChatExists =
          loadedChats.some(
            (chat) =>
              chat.id === savedActiveChat
          );

        if (savedChatExists && savedActiveChat) {
          setActiveChatId(savedActiveChat);
        } else {
          setActiveChatId(
            loadedChats[0].id
          );
        }
      } catch (error) {
        console.error(
          "Failed to load chats:",
          error
        );

        if (mounted) {
          alert(
            "Unable to load your conversations right now."
          );
        }
      } finally {
        if (mounted) {
          setIsLoadingChats(false);
        }
      }
    };

    loadChats();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================
   * SAVE ACTIVE CHAT ID
   * =========================================
   */

  useEffect(() => {
    if (!activeChatId) return;

    const saveActiveChat = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      localStorage.setItem(
        `${ACTIVE_CHAT_STORAGE_PREFIX}${user.id}`,
        activeChatId
      );
    };

    saveActiveChat();
  }, [activeChatId]);

  /*
   * =========================================
   * ACTIVE CHAT
   * =========================================
   */

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId
    ) || chats[0];

  const messages =
    activeChat?.messages || defaultMessages;

  /*
   * =========================================
   * NEW CHAT
   * =========================================
   */

  const handleNewChat = async () => {
    if (isTyping) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigateToLogin();
        return;
      }

      const {
        data: newChat,
        error,
      } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Chat",
          messages: defaultMessages,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const formattedChat: Chat = {
        id: newChat.id,
        user_id: newChat.user_id,
        title: newChat.title,
        messages: Array.isArray(
          newChat.messages
        )
          ? newChat.messages
          : defaultMessages,
        created_at: newChat.created_at,
      };

      setChats((prev) => [
        formattedChat,
        ...prev,
      ]);

      setActiveChatId(formattedChat.id);
    } catch (error) {
      console.error(
        "Create chat error:",
        error
      );

      alert(
        "Unable to create a new chat right now."
      );
    }
  };

  /*
   * =========================================
   * SELECT CHAT
   * =========================================
   */

  const handleSelectChat = (
    chatId: string
  ) => {
    if (isTyping) return;

    setActiveChatId(chatId);
  };

  /*
   * =========================================
   * DELETE CHAT
   * =========================================
   */

  const handleDeleteChat = async (
    chatId: string
  ) => {
    if (isTyping) return;

    const chatToDelete = chats.find(
      (chat) => chat.id === chatId
    );

    if (!chatToDelete) return;

    const confirmed = window.confirm(
      `Delete "${chatToDelete.title}"?`
    );

    if (!confirmed) return;

    try {
      const {
        error,
      } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId);

      if (error) {
        throw error;
      }

      const remainingChats =
        chats.filter(
          (chat) => chat.id !== chatId
        );

      /*
       * Don't allow user to have zero chats.
       */
      if (remainingChats.length === 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigateToLogin();
          return;
        }

        const {
          data: newChat,
          error: createError,
        } = await supabase
          .from("chats")
          .insert({
            user_id: user.id,
            title: "New Chat",
            messages: defaultMessages,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        const formattedChat: Chat = {
          id: newChat.id,
          user_id: newChat.user_id,
          title: newChat.title,
          messages: Array.isArray(
            newChat.messages
          )
            ? newChat.messages
            : defaultMessages,
          created_at: newChat.created_at,
        };

        setChats([formattedChat]);
        setActiveChatId(
          formattedChat.id
        );

        return;
      }

      setChats(remainingChats);

      if (chatId === activeChatId) {
        setActiveChatId(
          remainingChats[0].id
        );
      }
    } catch (error) {
      console.error(
        "Delete chat error:",
        error
      );

      alert(
        "Unable to delete this chat right now."
      );
    }
  };

  /*
   * =========================================
   * RENAME CHAT
   * =========================================
   */

  const handleRenameChat = async (
    chatId: string,
    title: string
  ) => {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    try {
      const {
        error,
      } = await supabase
        .from("chats")
        .update({
          title: cleanTitle,
        })
        .eq("id", chatId);

      if (error) {
        throw error;
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title: cleanTitle,
              }
            : chat
        )
      );
    } catch (error) {
      console.error(
        "Rename chat error:",
        error
      );

      alert(
        "Unable to rename this chat right now."
      );
    }
  };

  /*
   * =========================================
   * SEND MESSAGE
   * =========================================
   */

  const handleSend = async (
    text: string
  ) => {
    if (
      !text.trim() ||
      isTyping ||
      !activeChat
    ) {
      return;
    }

    const cleanText = text.trim();

    const userMessage: ChatMessage = {
      sender: "user",
      text: cleanText,
    };

    const updatedMessages: ChatMessage[] = [
      ...activeChat.messages,
      userMessage,
    ];

    /*
     * Create title from first user message
     */
    let updatedTitle =
      activeChat.title;

    if (
      activeChat.title === "New Chat" ||
      activeChat.messages.length === 1
    ) {
      updatedTitle =
        cleanText.length > 32
          ? `${cleanText.slice(0, 32)}...`
          : cleanText;
    }

    /*
     * Immediately update UI
     */
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
      /*
       * Save user message to Supabase
       */
      const {
        error: saveUserMessageError,
      } = await supabase
        .from("chats")
        .update({
          title: updatedTitle,
          messages: updatedMessages,
        })
        .eq("id", activeChat.id);

      if (saveUserMessageError) {
        throw saveUserMessageError;
      }

      /*
       * Ask Gemini
       */
      const reply = await askGemini(
        updatedMessages
      );

      const aiMessage: ChatMessage = {
        sender: "ai",
        text: reply,
      };

      const finalMessages: ChatMessage[] = [
        ...updatedMessages,
        aiMessage,
      ];

      /*
       * Save AI response to Supabase
       */
      const {
        error: saveAIMessageError,
      } = await supabase
        .from("chats")
        .update({
          title: updatedTitle,
          messages: finalMessages,
        })
        .eq("id", activeChat.id);

      if (saveAIMessageError) {
        throw saveAIMessageError;
      }

      /*
       * Update UI
       */
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                title: updatedTitle,
                messages: finalMessages,
              }
            : chat
        )
      );
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      const errorMessage: ChatMessage = {
        sender: "ai",
        text: "❌ Something went wrong while contacting Aura AI.",
      };

      const errorMessages: ChatMessage[] = [
        ...updatedMessages,
        errorMessage,
      ];

      /*
       * Try to save the error message too.
       */
      await supabase
        .from("chats")
        .update({
          title: updatedTitle,
          messages: errorMessages,
        })
        .eq("id", activeChat.id)
        .then(({ error }) => {
          if (error) {
            console.error(
              "Failed to save error message:",
              error
            );
          }
        });

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                title: updatedTitle,
                messages: errorMessages,
              }
            : chat
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  /*
   * =========================================
   * SIDEBAR DATA
   * =========================================
   */

  const sidebarChats: ChatHistoryItem[] =
    chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
    }));

  /*
   * =========================================
   * LOGIN FALLBACK
   * =========================================
   */

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  /*
   * =========================================
   * LOADING UI
   * =========================================
   */

  if (isLoadingChats) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#212121] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#3d3d3d] border-t-violet-500" />

          <p className="text-sm text-slate-500">
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================
   * UI
   * =========================================
   */

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-950 text-white">
      {/* Sidebar */}
      <Sidebar
        chats={sidebarChats}
        activeChatId={
          activeChat?.id || ""
        }
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      {/* Main Chat */}
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="relative h-0 min-h-0 flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
          />

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
                        animationDelay:
                          "0.15s",
                      }}
                    />

                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                      style={{
                        animationDelay:
                          "0.3s",
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