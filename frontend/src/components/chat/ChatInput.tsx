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

  const [isListening, setIsListening] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const recognitionRef =
    useRef<any>(null);

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

    // Stop voice recognition before sending
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped
      }
    }

    setIsListening(false);

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
   * VOICE TO TEXT
   * =========================================
   */

  const handleVoiceInput = () => {
    // Browser support check
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    // If already listening → stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Already stopped
        }
      }

      setIsListening(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    // English + Hindi support
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (
      event: any
    ) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (
          event.results[i].isFinal
        ) {
          finalTranscript +=
            transcript;
        } else {
          interimTranscript +=
            transcript;
        }
      }

      if (finalTranscript) {
        setText((previousText) => {
          const separator =
            previousText.trim()
              ? " "
              : "";

          return (
            previousText +
            separator +
            finalTranscript.trim()
          );
        });
      }

      /*
       * Interim text is intentionally not
       * inserted into textarea permanently.
       */
    };

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech Recognition Error:",
        event.error
      );

      setIsListening(false);

      if (
        event.error ===
        "not-allowed"
      ) {
        alert(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setIsListening(false);
    }
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
          placeholder={
            isListening
              ? "Listening..."
              : "Message Aura AI..."
          }
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
              onClick={handleVoiceInput}
              title={
                isListening
                  ? "Stop voice input"
                  : "Voice input"
              }
              aria-label={
                isListening
                  ? "Stop voice input"
                  : "Voice input"
              }
              className={
                isListening
                  ? "aura-voice-listening"
                  : ""
              }
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