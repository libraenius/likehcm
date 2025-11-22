"use client";

import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <AppBreadcrumb />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

