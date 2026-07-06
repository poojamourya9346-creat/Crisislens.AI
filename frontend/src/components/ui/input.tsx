import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/[0.07] bg-[#111827]/80 px-4 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 shadow-[0_2px_8px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.03)_inset] outline-none transition-all duration-200 hover:border-white/[0.12] hover:bg-[#151C28]/80 focus-visible:border-[#3B82F6]/50 focus-visible:ring-[3px] focus-visible:ring-[#3B82F6]/10 focus-visible:bg-[#151C28] focus-visible:shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_16px_rgba(0,0,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}
