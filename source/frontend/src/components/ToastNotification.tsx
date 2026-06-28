import { create } from 'zustand';
import React, { useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const styleId = 'toast-animation-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 6000);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-400" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-amber-400" size={20} />;
      case 'error':
        return <X className="text-red-400 border border-red-500 rounded-full p-0.5" size={20} />;
      default:
        return <Bell className="text-blue-400" size={20} />;
    }
  };

  const getBgClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-950/90 border border-emerald-800/60 shadow-emerald-950/20';
      case 'warning':
        return 'bg-amber-950/90 border border-amber-800/60 shadow-amber-950/20';
      case 'error':
        return 'bg-red-950/90 border border-red-800/60 shadow-red-950/20';
      default:
        return 'bg-slate-900/90 border border-slate-800/65 shadow-slate-950/20';
    }
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md text-white animate-slide-in-right ${getBgClass()}`}>
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <h5 className="font-bold text-sm leading-tight mb-1">{toast.title}</h5>
        <p className="text-xs text-gray-200 leading-relaxed font-medium">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
};
