import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";

type MessageProps = {
  sender: "user" | "ai";
  text: string;
};

function Message({ sender, text }: MessageProps) {
  const isUser = sender === "user";
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`group flex max-w-4xl items-end gap-3 ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
            isUser
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
              : "border border-slate-700 bg-slate-800"
          }`}
        >
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-violet-400" />
          )}
        </div>

        {/* Message */}
        <div className="relative">

          <div
            className={`rounded-3xl px-5 py-4 shadow-lg transition-all duration-300 ${
              isUser
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                : "border border-slate-700 bg-slate-800 text-gray-100"
            }`}
          >
            <p className="whitespace-pre-wrap leading-7">
              {text}
            </p>
          </div>

          {/* Bottom Row */}
          <div
            className={`mt-2 flex items-center gap-3 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <button
              onClick={copyMessage}
              className="opacity-0 transition group-hover:opacity-100"
            >
              {copied ? (
                <Check
                  size={16}
                  className="text-green-400"
                />
              ) : (
                <Copy
                  size={16}
                  className="text-gray-500 hover:text-white"
                />
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Message;