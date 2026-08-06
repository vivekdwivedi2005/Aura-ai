import Navbar from "../../components/layout/Navbar";
import { motion } from "framer-motion";
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
        <Navbar />

      {/* Background Glow */}
        <motion.div
            animate={{
                x: [0, 80, 0],
                y: [0, 40, 0],
            }}
            transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            }}
            className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl"
        />

<motion.div
    animate={{
        x: [0, -80, 0],
        y: [0, -40, 0],
    }}
    transition={{
        duration: 12,
        repeat: Infinity,
    ease: "easeInOut",
    }}
    className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl"
/>

    <div className="relative flex min-h-screen items-center justify-center px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-6xl rounded-3xl border border-violet-500/20 bg-slate-900/70 p-14 shadow-2xl backdrop-blur-xl"
        >
          {/* Hero */}
            <Hero />

          {/* Features */}
            <div className="mt-28 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

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

        </motion.div>

    </div>

</div>
);
}

export default Home;