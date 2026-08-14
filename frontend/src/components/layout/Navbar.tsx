import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="relative z-50 px-4 pt-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex h-[68px] max-w-[1350px] items-center justify-between rounded-[22px] border border-violet-400/20 bg-[#0b0d25]/75 px-4 shadow-[0_0_40px_rgba(84,40,180,0.10)] backdrop-blur-2xl sm:px-6 lg:px-7">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <Sparkles size={18} />
          </span>

          <span className="text-[17px] font-bold tracking-tight text-white">
            AURA <span className="text-fuchsia-400">AI</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-full bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-white shadow-inner shadow-violet-400/10"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Features
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Pricing will be available soon.")
            }
            className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Pricing
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Documentation will be available soon.")
            }
            className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Docs
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hidden rounded-full border border-violet-400/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500/10 sm:block"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.28)] transition hover:brightness-110"
          >
            Get started

            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;