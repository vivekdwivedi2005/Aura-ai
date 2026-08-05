import type { ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
};

function FeatureCard({ icon, title }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5 text-center transition hover:-translate-y-1 hover:border-violet-500 hover:bg-slate-800">
      <div className="flex justify-center text-violet-400">
        {icon}
      </div>

      <p className="mt-3 font-medium">
        {title}
      </p>
    </div>
  );
}

export default FeatureCard;