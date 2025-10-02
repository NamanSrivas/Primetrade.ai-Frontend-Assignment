"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
};

interface ToastContextType {
  toasts: Toast[];
  show: (message: string, type?: Toast['type']) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onRateLimit = (e: Event) => {
      show('You are making requests too quickly. Please slow down.', 'error');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('rate-limit', onRateLimit);
      return () => window.removeEventListener('rate-limit', onRateLimit);
    }
  }, [show]);

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      {/* Container */}
      <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-3 shadow-lg border text-sm bg-white ${
              t.type === 'success'
                ? 'border-green-200 text-green-800'
                : t.type === 'error'
                ? 'border-red-200 text-red-800'
                : 'border-blue-200 text-blue-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
