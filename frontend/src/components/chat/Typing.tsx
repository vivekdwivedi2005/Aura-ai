function Typing() {
  return (
    <div className="flex items-end gap-3">
      {/* Avatar */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
        🤖
      </div>

      {/* Bubble */}
      <div className="rounded-3xl border border-slate-700 bg-slate-800 px-5 py-4">
        <div className="flex gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400"></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
            style={{ animationDelay: "0.15s" }}
          ></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Typing;