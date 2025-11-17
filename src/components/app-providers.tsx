"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/contexts/toast-context";
import { ToastDisplay } from "@/components/toast-provider";
import { useEffect } from "react";
import { migrateData } from "@/lib/storage";

/**
 * Провайдеры приложения (ErrorBoundary, Toast, миграция данных)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Выполняем миграцию данных при загрузке приложения
    const migration = migrateData();
    if (migration.migrated) {
      console.log("Data migration completed successfully");
    }
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
        <ToastDisplay />
      </ToastProvider>
    </ErrorBoundary>
  );
}

