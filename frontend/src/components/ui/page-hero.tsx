import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#151C28]/60 p-8 sm:p-10 text-white shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px]" />
      {/* Radial blue glow top-right */}
      <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#3B82F6]/[0.07] blur-[100px] pointer-events-none" />
      {/* Radial indigo glow bottom-left */}
      <div className="absolute -left-20 -bottom-20 -z-10 h-64 w-64 rounded-full bg-[#6366F1]/[0.04] blur-[80px] pointer-events-none" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/[0.08] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#60A5FA] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse" />
            {eyebrow}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text-white leading-[1.15]">
              {title}
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[#94A3B8] sm:text-sm">
              {description}
            </p>
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap gap-2.5 shrink-0 self-start lg:self-end">
            {actions}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
