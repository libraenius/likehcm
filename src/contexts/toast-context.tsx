"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Toast, ToastVariant } from "@/components/ui/toast";

/** Продолжительность отображения уведомления по умолчанию (в миллисекундах) */
const DEFAULT_DURATION = 5000;

/**
 * Интерфейс контекста уведомлений
 */
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

/**
 * Провайдер контекста уведомлений
 * 
 * Предоставляет функциональность для отображения уведомлений (toast) в приложении.
 * Поддерживает различные типы уведомлений: success, error, warning, info.
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} Провайдер контекста уведомлений
 */
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

/**
 * Хук для использования контекста уведомлений
 * 
 * Позволяет компонентам получать доступ к функциям управления уведомлениями.
 * Должен использоваться только внутри компонента ToastProvider.
 * 
 * @returns {ToastContextValue} Контекст уведомлений с методами управления
 * @throws {Error} Если хук используется вне ToastProvider
 * 
 * @example
 * ```tsx
 * const { success, error } = useToast();
 * success("Операция выполнена успешно");
 * error("Произошла ошибка");
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

