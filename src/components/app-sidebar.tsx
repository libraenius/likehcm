"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { menuSections } from "@/lib/sidebar-config";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  CollapsibleMenuSection,
} from "@/components/sidebar-menu-components";

/**
 * Хук для управления состоянием раскрытия разделов меню
 */
function useMenuSectionsState(pathname: string) {
  // Инициализируем состояние на основе текущего пути
  const initialState = React.useMemo(
    () => {
      if (!menuSections || menuSections.length === 0) {
        return {} as Record<string, boolean>;
      }
      return menuSections.reduce(
        (acc, section) => ({
          ...acc,
          [section.id]: pathname.startsWith(section.basePath),
        }),
        {} as Record<string, boolean>
      );
    },
    [pathname]
  );

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    initialState
  );

  // Обновляем состояние при изменении pathname
  // Автоматически открываем раздел, если текущий путь начинается с basePath
  React.useEffect(() => {
    if (!menuSections || menuSections.length === 0) {
      return;
    }
    setOpenSections((prev) => {
      const newState = { ...prev };
      menuSections.forEach((section) => {
        const shouldBeOpen = pathname.startsWith(section.basePath);
        // Открываем раздел, если путь соответствует, но сохраняем состояние, если пользователь вручную закрыл
        if (shouldBeOpen && !prev[section.id]) {
          newState[section.id] = true;
        }
      });
      return newState;
    });
  }, [pathname]);

  const toggleSection = React.useCallback((sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? false),
    }));
  }, []);

  return { openSections, toggleSection };
}

/**
 * Компонент боковой панели навигации приложения
 * 
 * @returns {JSX.Element} Боковая панель с навигационным меню
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { openSections, toggleSection } = useMenuSectionsState(pathname);
  
  const isCollapsed = React.useMemo(() => state === "collapsed", [state]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 px-2 py-0 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:h-12 relative flex items-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:h-full w-full">
          <div className="flex aspect-square h-10 w-10 group-data-[collapsible=icon]:size-9 items-center justify-center rounded-lg border-2 border-sidebar-border bg-sidebar-accent/50 overflow-hidden shrink-0">
            <img
              src="/Снимок экрана 2025-11-27 125418.png"
              alt="РИТМ Logo"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback если изображение не найдено
                const target = e.currentTarget;
                target.style.display = "none";
                console.error("Logo image not found");
              }}
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden flex-1 min-w-0">
            <span className="text-base font-bold text-sidebar-foreground">
              РИТМ
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Разделы с подменю */}
        {menuSections && menuSections.length > 0 && menuSections.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupContent>
              <SidebarMenu>
                <CollapsibleMenuSection
                  title={section.title}
                  icon={section.icon}
                  items={section.items}
                  basePath={section.basePath}
                  pathname={pathname}
                  isOpen={openSections[section.id] ?? false}
                  onToggle={() => toggleSection(section.id)}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Система активна</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
