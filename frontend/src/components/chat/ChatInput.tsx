import { useRef, useState } from "react";
import {
  Paperclip,
  Mic,
  SendHorizontal,
  Sparkles,
  FileText,
  X,
} from "lucide-react";

type ChatInputProps = {
  onSend: (
    text: string,
    file?: File
  ) => void;
};

function ChatInput({
  onSend,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<File | undefined>();

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const message = text.trim();

    if (!message && !selectedFile) {
      return;
    }

    onSend(message, selectedFile);

    setText("");
    setSelectedFile(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "24px";
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a PDF file.");
      e.target.value = "";
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "PDF size must be 10 MB or less."
      );
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend =
    Boolean(text.trim()) ||
    Boolean(selectedFile);

  return (
    <div className="aura-composer-area">
      <div className="aura-composer">

        {/* PDF Preview */}

        {selectedFile && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <FileText size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm text-white">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-slate-500">
                  PDF •{" "}
                  {(
                    selectedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              title="Remove PDF"
              className="shrink-0 text-slate-400 transition hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        )}

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

            {/* Hidden PDF input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attach PDF */}

            <button
              type="button"
              title="Upload PDF"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Paperclip size={18} />
            </button>

            <button
              type="button"
              title="AI tools"
            >
              <Sparkles size={18} />
            </button>
          </div>

          <div className="aura-composer-right">
            <button
              type="button"
              title="Voice input"
            >
              <Mic size={18} />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
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