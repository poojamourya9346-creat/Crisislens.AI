import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  title: string;
  description: string;
  tone: "default" | "success" | "destructive";
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-[#10B981]",
      barClass: "bg-[#10B981]",
      borderClass: "border-[#10B981]/20",
      glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
      stripClass: "bg-[#10B981]",
    },
    destructive: {
      icon: XCircle,
      iconClass: "text-[#EF4444]",
      barClass: "bg-[#EF4444]",
      borderClass: "border-[#EF4444]/20",
      glowClass: "shadow-[0_0_20px_rgba(239,68,68,0.08)]",
      stripClass: "bg-[#EF4444]",
    },
    default: {
      icon: Info,
      iconClass: "text-[#3B82F6]",
      barClass: "bg-[#3B82F6]",
      borderClass: "border-white/[0.07]",
      glowClass: "shadow-[0_0_20px_rgba(59,130,246,0.06)]",
      stripClass: "bg-[#3B82F6]",
    },
  }[toast.tone];

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-[#151C28]/95 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.02)_inset] backdrop-blur-2xl",
        config.borderClass,
        config.glowClass,
      )}
    >
      {/* Top color strip */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px]", config.stripClass)} />

      <div className="flex items-start gap-3 p-4">
        <div className={cn("mt-0.5 shrink-0", config.iconClass)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#F8FAFC] leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-[11px] text-[#CBD5E1] leading-snug font-medium">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/[0.05] hover:text-[#F8FAFC] transition-all cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-white/[0.04]">
        <div
          className={cn("h-full transition-all duration-75 ease-linear", config.barClass)}
          style={{ width: `${progress}%`, opacity: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (toast: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  };

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
