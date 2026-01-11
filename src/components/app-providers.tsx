"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/contexts/toast-context";
import { ToastDisplay } from "@/components/toast-provider";
import { ThemeProvider } from "next-themes";
import { useDataMigration } from "@/hooks/use-data-migration";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

/**
 * Провайдеры приложения (ErrorBoundary, Toast, Theme, миграция данных)
 * 
 * Объединяет все необходимые провайдеры для работы приложения:
 * - ErrorBoundary для перехвата ошибок React
 * - ThemeProvider для управления темой
 * - ToastProvider для уведомлений
 * - Автоматическая миграция данных при загрузке
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 * @returns {JSX.Element} Обёртка с провайдерами
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  // Выполняем миграцию данных при загрузке приложения
  useDataMigration();

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastProvider>
          <BreadcrumbProvider>
            {children}
            <ToastDisplay />
          </BreadcrumbProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

