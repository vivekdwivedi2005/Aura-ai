import { Sparkles, Circle } from "lucide-react";

function Header() {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-8 py-5 backdrop-blur-md">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Sparkles className="text-violet-500" size={22} />
          Aura AI
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Your intelligent AI assistant
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2">
        <Circle
          size={10}
          className="fill-green-500 text-green-500"
        />

        <span className="text-sm text-gray-300">
          Online
        </span>
      </div>
    </div>
  );
}

export default Header;