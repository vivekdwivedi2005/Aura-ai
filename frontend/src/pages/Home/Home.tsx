import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  FileText,
  Heart,
  Mic,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05071b] text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Purple glow - left */}
        <div className="absolute -left-44 top-10 h-[550px] w-[550px] rounded-full bg-violet-700/20 blur-[150px]" />

        {/* Blue glow - right */}
        <div className="absolute -right-40 top-[15%] h-[560px] w-[560px] rounded-full bg-blue-700/15 blur-[160px]" />

        {/* Pink glow - bottom */}
        <div className="absolute bottom-[-180px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-[28%] h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-indigo-600/[0.08] blur-[130px]" />

        {/* Dot field */}
        <div
          className="absolute right-[6%] top-[17%] h-32 w-32 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(139,92,246,0.55) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div
          className="absolute bottom-[20%] left-[5%] h-28 w-28 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(59,130,246,0.6) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative z-10">
        <div className="mx-auto max-w-[1350px] px-6 pb-14 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5">
            {/* =================================================
                LEFT CONTENT
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.75,
              }}
              className="relative z-20 max-w-[650px]"
            >
              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-violet-500/10 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-violet-300 shadow-[0_0_25px_rgba(139,92,246,0.10)]">
                <Sparkles size={14} />

                YOUR PERSONAL AI COMPANION
              </div>

              {/* Heading */}
              <h1 className="text-[58px] font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[72px] lg:text-[88px]">
                <span className="block text-white">
                  Meet
                </span>

                <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                  Aura AI
                </span>
              </h1>

              {/* Description */}
              <p className="mt-7 max-w-xl text-[16px] leading-7 text-slate-300/80 sm:text-[18px]">
                An intelligent AI companion that helps
                you learn, create, solve problems and have
                natural conversations — whenever you need
                it.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="group flex h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 px-7 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.30)] transition hover:scale-[1.02] hover:brightness-110"
                >
                  Start chatting

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="h-[52px] rounded-full border border-violet-300/40 bg-white/[0.015] px-7 text-sm font-medium text-white transition hover:bg-white/[0.06]"
                >
                  Explore features
                </button>
              </div>

              {/* Trust line */}
              <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" />

                <span>Fast responses</span>

                <span className="text-slate-700">•</span>

                <span>Clean conversations</span>

                <span className="text-slate-700">•</span>

                <span>Built for learning</span>
              </div>
            </motion.div>

            {/* =================================================
                RIGHT VISUAL
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1,
                delay: 0.15,
              }}
              className="relative flex min-h-[540px] items-center justify-center lg:min-h-[620px]"
            >
              {/* Outer glow */}
              <div className="absolute h-[380px] w-[380px] rounded-full bg-violet-600/25 blur-[120px] sm:h-[500px] sm:w-[500px]" />

              {/* Large orbital rings */}
              <div className="absolute h-[390px] w-[390px] rounded-full border border-violet-400/15 sm:h-[520px] sm:w-[520px]" />

              <div className="absolute h-[330px] w-[330px] rounded-full border border-blue-400/10 sm:h-[430px] sm:w-[430px]" />

              <div className="absolute h-[270px] w-[270px] rounded-full border border-fuchsia-400/10 sm:h-[350px] sm:w-[350px]" />

              {/* Orbiting dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-[390px] w-[390px] sm:h-[520px] sm:w-[520px]"
              >
                <div className="absolute right-[8%] top-[18%] h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />

                <div className="absolute bottom-[10%] left-[15%] h-3 w-3 rounded-full bg-fuchsia-400 shadow-[0_0_16px_rgba(232,121,249,0.9)]" />
              </motion.div>

              {/* Small stars */}
              <div className="absolute left-[18%] top-[20%] text-fuchsia-300">
                ✦
              </div>

              <div className="absolute right-[15%] top-[26%] text-cyan-300">
                ✦
              </div>

              <div className="absolute bottom-[18%] right-[20%] text-violet-300">
                ✦
              </div>

              {/* LOGO */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-[280px] w-[280px] rounded-full bg-violet-600/15 blur-[80px] sm:h-[360px] sm:w-[360px]" />

                  <img
                    src="/aura-logo.png"
                    alt="Aura AI"
                    className="relative h-[360px] w-[360px] object-contain mix-blend-screen sm:h-[500px] sm:w-[500px]"
                  />
                </div>
              </motion.div>

              {/* Bottom pedestal glow */}
              <div className="absolute bottom-[8%] h-6 w-[260px] rounded-full bg-violet-500/30 blur-2xl sm:w-[380px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="relative z-10 mx-auto max-w-[1350px] px-6 pb-20 sm:px-8 lg:px-10"
      >
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-fuchsia-400">
            WHY AURA AI
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built for real conversations.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            A simple foundation for learning, creating and
            getting things done with AI.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Heart size={22} />}
            title="Emotion Aware"
            text="Understands your tone and keeps conversations more natural."
            glow="fuchsia"
          />

          <Feature
            icon={<Brain size={22} />}
            title="Long Memory"
            text="Designed to remember useful context from your conversations."
            glow="violet"
          />

          <Feature
            icon={<Mic size={22} />}
            title="Voice Chat"
            text="Ready for natural voice-based interactions."
            glow="cyan"
          />

          <Feature
            icon={<FileText size={22} />}
            title="PDF Chat"
            text="Designed to grow into document-aware AI conversations."
            glow="fuchsia"
          />
        </div>
      </section>
    </main>
  );
}

type FeatureProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  glow: "fuchsia" | "violet" | "cyan";
};

function Feature({
  icon,
  title,
  text,
  glow,
}: FeatureProps) {
  const glowClasses = {
    fuchsia:
      "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-400/20",
    violet:
      "bg-violet-500/15 text-violet-300 ring-violet-400/20",
    cyan:
      "bg-cyan-500/15 text-cyan-300 ring-cyan-400/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-violet-300/15 bg-[#0c1027]/70 p-6 shadow-[0_0_25px_rgba(91,33,182,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-300/30">
      <div
        className={`mb-6 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${glowClasses[glow]}`}
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>

      <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/20" />
    </div>
  );
}

export default Home;