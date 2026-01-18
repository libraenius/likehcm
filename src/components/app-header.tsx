"use client";

import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Компонент заголовка приложения
 * 
 * Отображает верхнюю панель навигации с:
 * - Триггером для открытия/закрытия боковой панели
 * - Навигационными хлебными крошками
 * - Переключателем темы
 * 
 * @returns {JSX.Element} Заголовок приложения
 */
export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-transparent sticky top-0 z-50">
      <SidebarTrigger />
      <AppBreadcrumb />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}


