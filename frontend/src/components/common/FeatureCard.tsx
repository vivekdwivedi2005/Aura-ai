import type { ReactNode } from "react";
import { motion } from "framer-motion";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
};

function FeatureCard({ icon, title }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{ duration: 0.25 }}
      className="group rounded-2xl border border-slate-700 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400 transition group-hover:bg-violet-600/25">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        Experience intelligent AI features designed to make your
        conversations faster, smarter and more personal.
      </p>
    </motion.div>
  );
}

export default FeatureCard;