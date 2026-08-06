
type MessageProps = {
  sender: "user" | "ai";
  text: string;
};

function Message({ sender, text }: MessageProps) {
  return (
    <div
      className={`flex ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xl rounded-2xl px-5 py-3 ${
          sender === "user"
            ? "bg-violet-600 text-white"
            : "bg-slate-800 text-gray-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default Message;