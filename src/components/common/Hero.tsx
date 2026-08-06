import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import Button from "./Button";

function Hero() {
  return (
    <motion.div
      className="grid items-center gap-12 md:grid-cols-2"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Left Side */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-violet-300 to-fuchsia-500 bg-clip-text text-transparent">
            AURA AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-2xl text-gray-300"
        >
          Your Personal AI Companion
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 max-w-lg text-gray-400"
        >
          AI that understands your emotions, remembers conversations,
          learns from your interactions and grows with you.
        </motion.p>

        <div className="mt-10 flex flex-wrap gap-5">
          <Button text="Start Chat" />
          <Button text="Learn More" variant="secondary" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex justify-center">
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="rounded-full bg-violet-600/20 p-12 shadow-[0_0_80px_rgba(139,92,246,0.35)]"
        >
          <Bot size={160} className="text-violet-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Hero;
