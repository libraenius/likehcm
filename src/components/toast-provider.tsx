"use client";

import { useToast } from "@/contexts/toast-context";
import { ToastContainer } from "@/components/ui/toast";

/**
 * Компонент для отображения Toast уведомлений
 */
export function ToastDisplay() {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

