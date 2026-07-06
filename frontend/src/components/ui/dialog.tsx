import { type ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  handler: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export const Dialog = ({ open, handler, children, maxWidth = 'max-w-lg' }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open) {
      if (!dlg.open) dlg.showModal();
    } else {
      if (dlg.open) dlg.close();
    }
  }, [open]);

  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    handler();
  };

  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) handler();
  };

  return (
    <dialog
      ref={dialogRef}
      className="rounded-none border-0 bg-transparent p-0 shadow-none backdrop:bg-[#0B0F17]/80 backdrop:backdrop-blur-xl"
      onCancel={onCancel}
      onClick={onBackdropClick}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`w-[92vw] ${maxWidth} overflow-hidden rounded-2xl border border-white/[0.07] bg-[#151C28]/95 shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
};

export const DialogHeader = ({
  children,
  className = '',
  onClose,
}: {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}) => (
  <div className={`flex items-center justify-between gap-3 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent px-6 py-4 ${className}`}>
    <div className="text-sm font-semibold tracking-tight text-[#F8FAFC]">{children}</div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
        aria-label="Close dialog"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

export const DialogBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`px-6 py-5 text-[#CBD5E1] ${className}`}>{children}</div>
);

export const DialogFooter = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex items-center justify-end gap-2.5 border-t border-white/[0.05] bg-white/[0.01] px-6 py-4 ${className}`}>
    {children}
  </div>
);
