'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'success', duration = 3000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (type !== 'loading' && duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
      <path d="M2.5 8.5l3.5 3.5 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
      <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Toast styles ─────────────────────────────────────────────────────────────
const styles: Record<ToastType, { container: string; icon: ReactNode }> = {
  success: {
    container: 'bg-slate-900 text-white',
    icon: <CheckIcon />,
  },
  error: {
    container: 'bg-red-600 text-white',
    icon: <ErrorIcon />,
  },
  info: {
    container: 'bg-white text-slate-900 border border-slate-200 shadow-md',
    icon: <InfoIcon />,
  },
  loading: {
    container: 'bg-white text-slate-900 border border-slate-200 shadow-md',
    icon: <Spinner />,
  },
};

// ─── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => {
        const { container, icon } = styles[t.type];
        return (
          <div
            key={t.id}
            className={`toast-enter flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${container}`}
          >
            {icon}
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="ms-1 opacity-50 hover:opacity-100 transition-opacity text-[16px] leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
