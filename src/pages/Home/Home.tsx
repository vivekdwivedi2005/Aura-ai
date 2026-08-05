import Hero from "../../components/common/Hero";
import FeatureCard from "../../components/common/FeatureCard";

import {
  Brain,
  Heart,
  Mic,
  FileText,
} from "lucide-react";

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-5xl rounded-3xl border border-violet-500/20 bg-slate-900/70 p-10 shadow-2xl backdrop-blur-xl">

          {/* Hero */}
          <Hero />

          {/* Features */}
          <div className="mt-16 grid grid-cols-2 gap-5 md:grid-cols-4">

            <FeatureCard
              icon={<Heart size={30} />}
              title="Emotion Aware"
            />

            <FeatureCard
              icon={<Brain size={30} />}
              title="Long Memory"
            />

            <FeatureCard
              icon={<Mic size={30} />}
              title="Voice Chat"
            />

            <FeatureCard
              icon={<FileText size={30} />}
              title="PDF Chat"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;