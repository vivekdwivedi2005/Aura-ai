import { useRef, useState } from "react";
import {
  Paperclip,
  Mic,
  SendHorizontal,
  Sparkles,
} from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const message = text.trim();

    if (!message) return;

    onSend(message);
    setText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    const textarea = e.target;

    setText(value);

    textarea.style.height = "24px";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="aura-composer-area">
      <div className="aura-composer">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Aura AI..."
        />

        <div className="aura-composer-bottom">
          <div className="aura-composer-left">
            <button title="Attach file">
              <Paperclip size={18} />
            </button>

            <button title="AI tools">
              <Sparkles size={18} />
            </button>
          </div>

          <div className="aura-composer-right">
            <button title="Voice input">
              <Mic size={18} />
            </button>

            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="aura-send-button"
              title="Send"
            >
              <SendHorizontal size={17} />
            </button>
          </div>
        </div>
      </div>

      <p className="aura-composer-disclaimer">
        Aura AI can make mistakes. Check important
        information.
      </p>
    </div>
  );
}

export default ChatInput;