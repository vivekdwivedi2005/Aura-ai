import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

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

  /*
   * =========================================
   * SEND MESSAGE
   * =========================================
   */

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

  /*
   * =========================================
   * PDF SELECT
   * =========================================
   */

  const handleFileSelect = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const isPDF =
      file.type === "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      alert(
        "Please select a PDF file."
      );

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

  /*
   * =========================================
   * REMOVE PDF
   * =========================================
   */

  const removeFile = () => {
    setSelectedFile(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
   * =========================================
   * TEXTAREA
   * =========================================
   */

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement>
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

  /*
   * =========================================
   * KEYBOARD
   * =========================================
   */

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    /*
     * Enter = send
     * Shift + Enter = new line
     */

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

  /*
   * =========================================
   * UI
   * =========================================
   */

  return (
    <div className="aura-composer-area">
      <div className="aura-composer">

        {/* =================================
            PDF PREVIEW
        ================================= */}

        {selectedFile && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2.5 transition">
            {/* PDF Icon */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
              <FileText
                size={18}
                strokeWidth={1.8}
              />
            </div>

            {/* File information */}

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-medium text-slate-200"
                title={selectedFile.name}
              >
                {selectedFile.name}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                PDF •{" "}
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </div>

            {/* Remove */}

            <button
              type="button"
              onClick={removeFile}
              title="Remove PDF"
              aria-label="Remove selected PDF"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================
            MESSAGE INPUT
        ================================= */}

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Aura AI..."
          aria-label="Message Aura AI"
          spellCheck={true}
        />

        {/* =================================
            BOTTOM TOOLBAR
        ================================= */}

        <div className="aura-composer-bottom">

          {/* Left actions */}

          <div className="aura-composer-left">

            {/* Hidden PDF input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attach */}

            <button
              type="button"
              title="Upload PDF"
              aria-label="Upload PDF"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Paperclip
                size={18}
                strokeWidth={1.8}
              />
            </button>

            {/* AI Tools */}

            <button
              type="button"
              title="AI tools"
              aria-label="AI tools"
            >
              <Sparkles
                size={18}
                strokeWidth={1.8}
              />
            </button>
          </div>

          {/* Right actions */}

          <div className="aura-composer-right">

            {/* Voice */}

            <button
              type="button"
              title="Voice input"
              aria-label="Voice input"
            >
              <Mic
                size={18}
                strokeWidth={1.8}
              />
            </button>

            {/* Send */}

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="aura-send-button"
              title={
                canSend
                  ? "Send message"
                  : "Type a message"
              }
              aria-label="Send message"
            >
              <SendHorizontal
                size={17}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}

      <p className="aura-composer-disclaimer">
        Aura AI can make mistakes. Check
        important information.
      </p>
    </div>
  );
}

export default ChatInput;