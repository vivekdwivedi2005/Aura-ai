import { useEffect, useRef, useState } from "react";
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
  id?: string;
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

type MessageQueueItem = {
  chatId: string;
  userMessage: ChatMessage;
};

const ACTIVE_CHAT_STORAGE_PREFIX =
  "aura-ai-active-chat-";

const defaultMessages: ChatMessage[] = [
  {
    id: "default-aura-message",
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
   * REFS
   * =========================================
   *
   * Refs keep the latest chat state available
   * even while Gemini requests are running.
   */

  const chatsRef = useRef<Chat[]>([]);

  const activeChatIdRef =
    useRef<string>("");

  const messageQueueRef =
    useRef<MessageQueueItem[]>([]);

  const isProcessingQueueRef =
    useRef(false);

  /*
   * AI context is maintained separately from
   * the UI messages.
   *
   * This allows:
   *
   * Message 1 → Gemini
   * Message 2 → wait
   * Message 3 → wait
   *
   * After Message 1 response:
   *
   * Message 1
   * AI response 1
   * Message 2 → Gemini
   */

  const aiContextRef = useRef<
    Record<string, ChatMessage[]>
  >({});

  /*
   * =========================================
   * KEEP REFS IN SYNC
   * =========================================
   */

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    activeChatIdRef.current =
      activeChatId;
  }, [activeChatId]);

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
         */

        localStorage.removeItem(
          "aura-ai-chats"
        );

        /*
         * Fetch this user's chats only.
         */

        const {
          data,
          error,
        } = await supabase
          .from("chats")
          .select(
            "id,user_id,title,messages,created_at"
          )
          .eq(
            "user_id",
            currentUser.id
          )
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
            messages:
              Array.isArray(chat.messages)
                ? chat.messages
                : defaultMessages,
            created_at:
              chat.created_at,
          }));

        /*
         * If user has no chats,
         * create first chat.
         */

        if (loadedChats.length === 0) {
          const {
            data: newChat,
            error: createError,
          } = await supabase
            .from("chats")
            .insert({
              user_id:
                currentUser.id,
              title: "New Chat",
              messages:
                defaultMessages,
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          loadedChats = [
            {
              id: newChat.id,
              user_id:
                newChat.user_id,
              title: newChat.title,
              messages:
                Array.isArray(
                  newChat.messages
                )
                  ? newChat.messages
                  : defaultMessages,
              created_at:
                newChat.created_at,
            },
          ];
        }

        if (!mounted) return;

        /*
         * Initialize AI context for every chat.
         */

        const initialContexts: Record<
          string,
          ChatMessage[]
        > = {};

        loadedChats.forEach((chat) => {
          initialContexts[chat.id] =
            [...chat.messages];
        });

        aiContextRef.current =
          initialContexts;

        chatsRef.current =
          loadedChats;

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
              chat.id ===
              savedActiveChat
          );

        if (
          savedChatExists &&
          savedActiveChat
        ) {
          setActiveChatId(
            savedActiveChat
          );
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

    const saveActiveChat =
      async () => {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

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
      (chat) =>
        chat.id === activeChatId
    ) || chats[0];

  const messages =
    activeChat?.messages ||
    defaultMessages;

  /*
   * =========================================
   * NEW CHAT
   * =========================================
   */

  const handleNewChat =
    async () => {
      /*
       * Don't switch chats while queued
       * messages are being processed.
       */

      if (isTyping) return;

      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

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
            messages:
              defaultMessages,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        const formattedChat: Chat =
          {
            id: newChat.id,
            user_id:
              newChat.user_id,
            title: newChat.title,
            messages:
              Array.isArray(
                newChat.messages
              )
                ? newChat.messages
                : defaultMessages,
            created_at:
              newChat.created_at,
          };

        aiContextRef.current[
          formattedChat.id
        ] = [
          ...formattedChat.messages,
        ];

        const updatedChats = [
          formattedChat,
          ...chatsRef.current,
        ];

        chatsRef.current =
          updatedChats;

        setChats(updatedChats);

        setActiveChatId(
          formattedChat.id
        );
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

    const chatToDelete =
      chatsRef.current.find(
        (chat) =>
          chat.id === chatId
      );

    if (!chatToDelete) return;

    const confirmed =
      window.confirm(
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
        chatsRef.current.filter(
          (chat) =>
            chat.id !== chatId
        );

      delete aiContextRef.current[
        chatId
      ];

      /*
       * Don't allow user to have zero chats.
       */

      if (
        remainingChats.length ===
        0
      ) {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

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
            messages:
              defaultMessages,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        const formattedChat: Chat =
          {
            id: newChat.id,
            user_id:
              newChat.user_id,
            title: newChat.title,
            messages:
              Array.isArray(
                newChat.messages
              )
                ? newChat.messages
                : defaultMessages,
            created_at:
              newChat.created_at,
          };

        aiContextRef.current[
          formattedChat.id
        ] = [
          ...formattedChat.messages,
        ];

        chatsRef.current = [
          formattedChat,
        ];

        setChats([
          formattedChat,
        ]);

        setActiveChatId(
          formattedChat.id
        );

        return;
      }

      chatsRef.current =
        remainingChats;

      setChats(
        remainingChats
      );

      if (
        chatId ===
        activeChatIdRef.current
      ) {
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

  const handleRenameChat =
    async (
      chatId: string,
      title: string
    ) => {
      const cleanTitle =
        title.trim();

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

        const updatedChats =
          chatsRef.current.map(
            (chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    title:
                      cleanTitle,
                  }
                : chat
          );

        chatsRef.current =
          updatedChats;

        setChats(
          updatedChats
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
   * INSERT MESSAGE INTO CHAT
   * =========================================
   */

  const updateChatMessages = (
    chatId: string,
    newMessages: ChatMessage[],
    newTitle?: string
  ) => {
    const updatedChats =
      chatsRef.current.map(
        (chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages:
                  newMessages,
                title:
                  newTitle ??
                  chat.title,
              }
            : chat
      );

    chatsRef.current =
      updatedChats;

    setChats(updatedChats);
  };

  /*
   * =========================================
   * INSERT AI RESPONSE AFTER USER MESSAGE
   * =========================================
   */

  const insertAIMessageAfterUser =
    (
      currentMessages: ChatMessage[],
      userMessageId: string,
      aiMessage: ChatMessage
    ): ChatMessage[] => {
      const userIndex =
        currentMessages.findIndex(
          (message) =>
            message.id ===
            userMessageId
        );

      if (userIndex === -1) {
        return [
          ...currentMessages,
          aiMessage,
        ];
      }

      return [
        ...currentMessages.slice(
          0,
          userIndex + 1
        ),
        aiMessage,
        ...currentMessages.slice(
          userIndex + 1
        ),
      ];
    };

  /*
   * =========================================
   * PROCESS MESSAGE QUEUE
   * =========================================
   */

  const processMessageQueue =
    async () => {
      if (
        isProcessingQueueRef.current
      ) {
        return;
      }

      isProcessingQueueRef.current =
        true;

      setIsTyping(true);

      try {
        while (
          messageQueueRef.current
            .length > 0
        ) {
          const queueItem =
            messageQueueRef.current.shift();

          if (!queueItem) {
            continue;
          }

          const {
            chatId,
            userMessage,
          } = queueItem;

          /*
           * Get AI context BEFORE adding
           * this queued user message.
           *
           * This prevents later queued
           * messages from being sent to
           * the previous Gemini request.
           */

          const currentAIContext =
            aiContextRef.current[
              chatId
            ] || defaultMessages;

          const geminiMessages: ChatMessage[] =
            [
              ...currentAIContext,
              userMessage,
            ];

          /*
           * Save current UI messages to
           * Supabase before asking Gemini.
           *
           * This guarantees the user's message
           * is persisted even if Gemini fails.
           */

          const currentChat =
            chatsRef.current.find(
              (chat) =>
                chat.id === chatId
            );

          if (!currentChat) {
            continue;
          }

          try {
            const {
              error:
                saveUserMessageError,
            } = await supabase
              .from("chats")
              .update({
                title:
                  currentChat.title,
                messages:
                  currentChat.messages,
              })
              .eq(
                "id",
                chatId
              );

            if (
              saveUserMessageError
            ) {
              throw saveUserMessageError;
            }

            /*
             * Ask Gemini.
             */

            const reply =
              await askGemini(
                geminiMessages
              );

            const aiMessage: ChatMessage =
              {
                id:
                  `ai-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`,
                sender: "ai",
                text: reply,
              };

            /*
             * Get latest messages because
             * user may have sent more messages
             * while Gemini was thinking.
             */

            const latestChat =
              chatsRef.current.find(
                (chat) =>
                  chat.id === chatId
              );

            if (!latestChat) {
              continue;
            }

            /*
             * Insert AI response immediately
             * after the corresponding user
             * message.
             */

            const finalMessages =
              insertAIMessageAfterUser(
                latestChat.messages,
                userMessage.id!,
                aiMessage
              );

            /*
             * Update AI context.
             *
             * Only this completed exchange
             * is added to Gemini's sequential
             * context.
             */

            aiContextRef.current[
              chatId
            ] = [
              ...currentAIContext,
              userMessage,
              aiMessage,
            ];

            /*
             * Save final messages.
             */

            const {
              error:
                saveAIMessageError,
            } = await supabase
              .from("chats")
              .update({
                title:
                  latestChat.title,
                messages:
                  finalMessages,
              })
              .eq(
                "id",
                chatId
              );

            if (
              saveAIMessageError
            ) {
              throw saveAIMessageError;
            }

            /*
             * Update UI.
             */

            updateChatMessages(
              chatId,
              finalMessages,
              latestChat.title
            );
          } catch (error) {
            console.error(
              "Chat queue item error:",
              error
            );

            const latestChat =
              chatsRef.current.find(
                (chat) =>
                  chat.id === chatId
              );

            if (!latestChat) {
              continue;
            }

            const errorMessage:
              ChatMessage = {
                id:
                  `error-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`,
                sender: "ai",
                text:
                  error instanceof
                  Error
                    ? `❌ ${error.message}`
                    : "❌ Something went wrong while contacting Aura AI.",
              };

            const errorMessages =
              insertAIMessageAfterUser(
                latestChat.messages,
                userMessage.id!,
                errorMessage
              );

            /*
             * Add the failed exchange to
             * context too, so queue processing
             * can continue naturally.
             */

            aiContextRef.current[
              chatId
            ] = [
              ...currentAIContext,
              userMessage,
              errorMessage,
            ];

            await supabase
              .from("chats")
              .update({
                title:
                  latestChat.title,
                messages:
                  errorMessages,
              })
              .eq(
                "id",
                chatId
              );

            updateChatMessages(
              chatId,
              errorMessages,
              latestChat.title
            );
          }
        }
      } finally {
        isProcessingQueueRef.current =
          false;

        setIsTyping(false);
      }
    };

  /*
   * =========================================
   * SEND MESSAGE
   * =========================================
   */

  const handleSend = (
    text: string
  ) => {
    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT check
     * isTyping here.
     *
     * User can send another message while
     * Aura AI is thinking.
     */

    if (
      !text.trim() ||
      !activeChat
    ) {
      return;
    }

    const cleanText =
      text.trim();

    const chatId =
      activeChat.id;

    const userMessage: ChatMessage =
      {
        id:
          `user-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
        sender: "user",
        text: cleanText,
      };

    const currentChat =
      chatsRef.current.find(
        (chat) =>
          chat.id === chatId
      );

    if (!currentChat) {
      return;
    }

    const updatedMessages: ChatMessage[] =
      [
        ...currentChat.messages,
        userMessage,
      ];

    /*
     * Create title from first user message.
     */

    let updatedTitle =
      currentChat.title;

    if (
      currentChat.title ===
        "New Chat" ||
      currentChat.messages.filter(
        (message) =>
          message.sender === "user"
      ).length === 0
    ) {
      updatedTitle =
        cleanText.length > 32
          ? `${cleanText.slice(
              0,
              32
            )}...`
          : cleanText;
    }

    /*
     * Immediately update UI.
     *
     * This is the key fix:
     * user's second/third message is
     * visible even while Gemini is thinking.
     */

    updateChatMessages(
      chatId,
      updatedMessages,
      updatedTitle
    );

    /*
     * Add message to FIFO queue.
     */

    messageQueueRef.current.push(
      {
        chatId,
        userMessage,
      }
    );

    /*
     * Start queue processor.
     *
     * If it is already running,
     * this does nothing because the
     * processor checks its lock.
     */

    void processMessageQueue();
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

  const navigateToLogin =
    () => {
      window.location.href =
        "/login";
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
        onNewChat={
          handleNewChat
        }
        onSelectChat={
          handleSelectChat
        }
        onDeleteChat={
          handleDeleteChat
        }
        onRenameChat={
          handleRenameChat
        }
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
          <ChatInput
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;