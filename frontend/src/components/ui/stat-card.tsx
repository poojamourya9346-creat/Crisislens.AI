import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  tone?: "default" | "emerald" | "amber" | "blue" | "red";
  delta?: number;
  unit?: string;
}

function useCountUp(target: number, duration = 900): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

const toneConfig = {
  default: {
    border: "border-white/[0.06]",
    bg: "bg-[#151C28]/80",
    hoverBorder: "hover:border-white/[0.1]",
    iconBg: "bg-white/[0.04]",
    iconText: "text-[#94A3B8]",
    iconBorder: "border-white/[0.06]",
    accentLine: "bg-gradient-to-r from-[#94A3B8]/20 to-transparent",
  },
  emerald: {
    border: "border-[#10B981]/[0.08]",
    bg: "bg-[#151C28]/80",
    hoverBorder: "hover:border-[#10B981]/20",
    iconBg: "bg-[#10B981]/[0.08]",
    iconText: "text-[#10B981]",
    iconBorder: "border-[#10B981]/15",
    accentLine: "bg-gradient-to-r from-[#10B981]/30 via-[#10B981]/10 to-transparent",
  },
  amber: {
    border: "border-[#F59E0B]/[0.08]",
    bg: "bg-[#151C28]/80",
    hoverBorder: "hover:border-[#F59E0B]/20",
    iconBg: "bg-[#F59E0B]/[0.08]",
    iconText: "text-[#F59E0B]",
    iconBorder: "border-[#F59E0B]/15",
    accentLine: "bg-gradient-to-r from-[#F59E0B]/30 via-[#F59E0B]/10 to-transparent",
  },
  blue: {
    border: "border-[#3B82F6]/[0.08]",
    bg: "bg-[#151C28]/80",
    hoverBorder: "hover:border-[#3B82F6]/20",
    iconBg: "bg-[#3B82F6]/[0.08]",
    iconText: "text-[#3B82F6]",
    iconBorder: "border-[#3B82F6]/15",
    accentLine: "bg-gradient-to-r from-[#3B82F6]/30 via-[#3B82F6]/10 to-transparent",
  },
  red: {
    border: "border-[#EF4444]/[0.08]",
    bg: "bg-[#151C28]/80",
    hoverBorder: "hover:border-[#EF4444]/20",
    iconBg: "bg-[#EF4444]/[0.08]",
    iconText: "text-[#EF4444]",
    iconBorder: "border-[#EF4444]/15",
    accentLine: "bg-gradient-to-r from-[#EF4444]/30 via-[#EF4444]/10 to-transparent",
  },
} as const;

export function StatCard({ label, value, subtitle, icon, tone = "default", delta, unit }: StatCardProps) {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? (value as number) : 0);
  const cfg = toneConfig[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "card-hover group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.03)_inset]",
        cfg.border,
        cfg.bg,
        cfg.hoverBorder,
      )}
    >
      {/* Accent top line */}
      <div className={cn("absolute top-0 left-0 right-0 h-[1.5px]", cfg.accentLine)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#94A3B8]/80">{label}</p>
          <p className="mt-2.5 text-3xl font-bold tracking-tight text-[#F8FAFC] tabular-nums animate-count-up">
            {isNumeric ? animated : value}
            {unit && <span className="text-sm font-medium text-[#94A3B8] ml-1">{unit}</span>}
          </p>
        </div>
        {icon && (
          <div className={cn("flex-shrink-0 rounded-xl p-2.5 border backdrop-blur-sm shadow-sm", cfg.iconBg, cfg.iconText, cfg.iconBorder)}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || delta !== undefined) && (
        <div className="mt-3.5 flex items-center gap-2">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                delta > 0  ? "bg-[#10B981]/10 text-[#34D399] border-[#10B981]/15" :
                delta < 0  ? "bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/15" :
                             "bg-[#1B2433] text-[#94A3B8] border-white/[0.06]",
              )}
            >
              {delta > 0  ? <TrendingUp  className="h-2.5 w-2.5" /> :
               delta < 0  ? <TrendingDown className="h-2.5 w-2.5" /> :
                             <Minus className="h-2.5 w-2.5" />}
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          {subtitle && <p className="text-[11px] text-[#94A3B8]/70 font-medium">{subtitle}</p>}
        </div>
      )}
    </motion.div>
  );
}
