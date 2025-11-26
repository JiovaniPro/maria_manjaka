"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastContextType = {
  showToast: (message: string, type: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
    
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100);

  useState(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (toast.duration / 50));
        if (newProgress <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  });

  const colors = {
    success: { bg: 'bg-white', text: 'text-emerald-700', icon: 'text-emerald-500', bar: 'bg-emerald-500' },
    error: { bg: 'bg-white', text: 'text-red-700', icon: 'text-red-500', bar: 'bg-red-500' },
    warning: { bg: 'bg-white', text: 'text-yellow-700', icon: 'text-yellow-500', bar: 'bg-yellow-500' },
    info: { bg: 'bg-white', text: 'text-blue-700', icon: 'text-blue-500', bar: 'bg-blue-500' }
  };

  const color = colors[toast.type];

  const icons = {
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`${color.bg} min-w-[320px] max-w-md overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-black/5`}>
      <div className="flex items-start gap-3 p-4">
        <div className={color.icon}>
          {icons[toast.type]}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${color.text}`}>
            {toast.type === 'success' && 'Succès'}
            {toast.type === 'error' && 'Erreur'}
            {toast.type === 'warning' && 'Attention'}
            {toast.type === 'info' && 'Information'}
          </p>
          <p className="mt-1 text-sm text-black/70">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-black/40 transition hover:text-black"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-1 bg-black/5">
        <div
          className={`h-full transition-all duration-50 ease-linear ${color.bar}`}
          style={{ width: `${progress}%` }}
        />
        
      </div>
    </div>
  );
}