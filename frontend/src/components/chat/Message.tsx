import {
  Bot,
  User,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MessageProps = {
  sender: "user" | "ai";
  text: string;
};

function Message({ sender, text }: MessageProps) {
  const isUser = sender === "user";
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <article
      className={`aura-message ${
        isUser ? "user-message" : "ai-message"
      }`}
    >
      {/* Avatar */}
      <div
        className={`aura-message-avatar ${
          isUser ? "user-avatar" : "ai-avatar"
        }`}
      >
        {isUser ? (
          <User size={15} />
        ) : (
          <Bot
            size={16}
            className="text-violet-400"
          />
        )}
      </div>

      {/* Content */}
      <div className="aura-message-content">
        {isUser ? (
          <div className="aura-user-text">
            {text}
          </div>
        ) : (
          <div className="aura-ai-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1>{children}</h1>
                ),

                h2: ({ children }) => (
                  <h2>{children}</h2>
                ),

                h3: ({ children }) => (
                  <h3>{children}</h3>
                ),

                p: ({ children }) => (
                  <p>{children}</p>
                ),

                strong: ({ children }) => (
                  <strong>{children}</strong>
                ),

                ul: ({ children }) => (
                  <ul>{children}</ul>
                ),

                ol: ({ children }) => (
                  <ol>{children}</ol>
                ),

                li: ({ children }) => (
                  <li>{children}</li>
                ),

                blockquote: ({ children }) => (
                  <blockquote>{children}</blockquote>
                ),

                code: ({
                  className,
                  children,
                }) => {
                  const match =
                    /language-(\w+)/.exec(
                      className || ""
                    );

                  const code = String(children).replace(
                    /\n$/,
                    ""
                  );

                  if (!match) {
                    return (
                      <code className="aura-inline-code">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <CodeBlock
                      language={match[1]}
                      code={code}
                    />
                  );
                },

                pre: ({ children }) => (
                  <>{children}</>
                ),

                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),

                table: ({ children }) => (
                  <div className="aura-table-wrapper">
                    <table>{children}</table>
                  </div>
                ),

                th: ({ children }) => (
                  <th>{children}</th>
                ),

                td: ({ children }) => (
                  <td>{children}</td>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}

        {/* Message action */}
        <div
          className={`aura-message-actions ${
            isUser ? "user-actions" : ""
          }`}
        >
          <button
            onClick={copyMessage}
            title="Copy message"
          >
            {copied ? (
              <Check
                size={14}
                className="text-green-400"
              />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy code failed:", error);
    }
  };

  return (
    <div className="aura-code-block">
      <div className="aura-code-header">
        <span>{language}</span>

        <button onClick={copyCode}>
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>

      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default Message;