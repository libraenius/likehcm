"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/contexts/toast-context";
import { ToastDisplay } from "@/components/toast-provider";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { migrateData } from "@/lib/storage";

/**
 * Провайдеры приложения (ErrorBoundary, Toast, Theme, миграция данных)
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
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastProvider>
          {children}
          <ToastDisplay />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

