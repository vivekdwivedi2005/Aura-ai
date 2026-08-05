import { motion } from "framer-motion";
import Button from "./Button";
import { Bot } from "lucide-react";

function Hero() {
    return (
    <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
    >
    <div className="flex justify-center">
        <div className="rounded-full bg-violet-600/20 p-6">
        <Bot size={60} className="text-violet-400" />
        </div>
    </div>

    <h1 className="mt-6 text-6xl font-extrabold tracking-tight">
        <span className="text-white">AURA</span>{" "}
        <span className="text-violet-400">AI</span>
    </h1>

    <p className="mt-5 text-xl text-gray-300">
        Your Personal AI Companion
    </p>

    <p className="mt-3 text-gray-400">
        AI that understands your emotions, remembers conversations,
        and grows with you.
    </p>

    <div className="mt-8 flex justify-center gap-4">
        <Button text="Start Chat" />
        <Button text="Learn More" variant="secondary" />
    </div>
    </motion.div>
);
}

export default Hero;