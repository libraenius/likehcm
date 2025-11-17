"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Toast, ToastVariant } from "@/components/ui/toast";

const DEFAULT_DURATION = 5000;

interface ToastContextValue {
  toasts: Toast[];
  addToast: (
    description: string,
    variant?: ToastVariant,
    options?: { title?: string; duration?: number }
  ) => string;
  removeToast: (id: string) => void;
  success: (description: string, options?: { title?: string; duration?: number }) => string;
  error: (description: string, options?: { title?: string; duration?: number }) => string;
  warning: (description: string, options?: { title?: string; duration?: number }) => string;
  info: (description: string, options?: { title?: string; duration?: number }) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      description: string,
      variant: ToastVariant = "info",
      options?: { title?: string; duration?: number }
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = {
        id,
        description,
        variant,
        title: options?.title,
        duration: options?.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (description: string, options?: { title?: string; duration?: number }) => {
      return addToast(description, "success", options);
    },
    [addToast]
  );

  const error = useCallback(
    (description: string, options?: { title?: string; duration?: number }) => {
      return addToast(description, "error", options);
    },
    [addToast]
  );

  const warning = useCallback(
    (description: string, options?: { title?: string; duration?: number }) => {
      return addToast(description, "warning", options);
    },
    [addToast]
  );

  const info = useCallback(
    (description: string, options?: { title?: string; duration?: number }) => {
      return addToast(description, "info", options);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

