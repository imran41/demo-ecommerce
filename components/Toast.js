'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { id, message, type } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-100',
      text: 'text-rose-850',
      icon: <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50 border-sky-100',
      text: 'text-sky-800',
      icon: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-md ${config.bg} ${config.text}`}
    >
      {config.icon}
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
