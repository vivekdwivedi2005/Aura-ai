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

      window.setTimeout(() => {
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
      aria-label={
        isUser ? "Your message" : "Aura AI response"
      }
    >
      {/* Avatar */}
      <div
        className={`aura-message-avatar ${
          isUser ? "user-avatar" : "ai-avatar"
        }`}
        aria-hidden="true"
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

      {/* Message content */}
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

                em: ({ children }) => (
                  <em>{children}</em>
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

                hr: () => <hr />,

                code: ({
                  className,
                  children,
                  inline,
                }: {
                  className?: string;
                  children?: React.ReactNode;
                  inline?: boolean;
                }) => {
                  const match =
                    /language-(\w+)/.exec(
                      className || ""
                    );

                  const code = String(children).replace(
                    /\n$/,
                    ""
                  );

                  /*
                   * Inline code:
                   * Example: `npm install`
                   */
                  if (inline) {
                    return (
                      <code className="aura-inline-code">
                        {children}
                      </code>
                    );
                  }

                  /*
                   * Fenced code:
                   * ```python
                   * print("Hello")
                   * ```
                   *
                   * Also handles fenced code without
                   * a specified language.
                   */
                  return (
                    <CodeBlock
                      language={
                        match?.[1] || "code"
                      }
                      code={code}
                    />
                  );
                },

                pre: ({ children }) => (
                  <>{children}</>
                ),

                a: ({ href, children }) => {
                  const isSafeLink =
                    typeof href === "string" &&
                    /^https?:\/\//i.test(href);

                  if (!isSafeLink) {
                    return (
                      <span>{children}</span>
                    );
                  }

                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  );
                },

                table: ({ children }) => (
                  <div className="aura-table-wrapper">
                    <table>{children}</table>
                  </div>
                ),

                thead: ({ children }) => (
                  <thead>{children}</thead>
                ),

                tbody: ({ children }) => (
                  <tbody>{children}</tbody>
                ),

                tr: ({ children }) => (
                  <tr>{children}</tr>
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

        {/* Message actions */}
        <div
          className={`aura-message-actions ${
            isUser ? "user-actions" : ""
          }`}
        >
          <button
            type="button"
            onClick={copyMessage}
            title={
              copied
                ? "Copied"
                : "Copy message"
            }
            aria-label={
              copied
                ? "Message copied"
                : "Copy message"
            }
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

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Copy code failed:",
        error
      );
    }
  };

  return (
    <div className="aura-code-block">
      <div className="aura-code-header">
        <span className="aura-code-language">
          {language}
        </span>

        <button
          type="button"
          onClick={copyCode}
          title={
            copied
              ? "Code copied"
              : "Copy code"
          }
          aria-label={
            copied
              ? "Code copied"
              : "Copy code"
          }
        >
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