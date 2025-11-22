"use client";

import * as React from "react";
import {
  BookOpen,
  Users,
  User,
  TrendingUp,
  FolderOpen,
  ChevronRight,
  Settings,
  ClipboardCheck,
  FileText,
  Target,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Главная",
    icon: User,
    href: "/profile",
  },
  {
    title: "Моя команда",
    icon: Users,
    href: "/team",
  },
];

const referenceItems = [
  {
    title: "Компетенции",
    href: "/reference/competences",
    icon: BookOpen,
  },
  {
    title: "Профили",
    href: "/reference/profiles",
    icon: User,
  },
  {
    title: "Карьерные треки",
    href: "/reference/career-tracks",
    icon: TrendingUp,
  },
];

const serviceItems: Array<{
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    title: "Оценка",
    href: "/services/assessment",
    icon: ClipboardCheck,
  },
  {
    title: "Ассессмент",
    href: "/services/assessment-center",
    icon: FileText,
  },
  {
    title: "Целеполагание",
    href: "/services/goals",
    icon: Target,
  },
  {
    title: "Карьера",
    href: "/services/career",
    icon: Briefcase,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isReferenceOpen, setIsReferenceOpen] = React.useState(
    pathname.startsWith("/reference")
  );
  const [isServicesOpen, setIsServicesOpen] = React.useState(
    pathname.startsWith("/services")
  );

  React.useEffect(() => {
    setIsReferenceOpen(pathname.startsWith("/reference"));
    setIsServicesOpen(pathname.startsWith("/services"));
  }, [pathname]);

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-16 px-2 py-0 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:h-12 relative flex items-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:h-full w-full">
          <div className="flex aspect-square h-10 w-10 group-data-[collapsible=icon]:size-9 items-center justify-center rounded-lg border-2 border-sidebar-border bg-sidebar-accent/50 overflow-hidden shrink-0">
            <img
              src="/cheburashka.png"
              alt="Cheburashka Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback если изображение не найдено
                console.error('Logo image not found');
              }}
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden flex-1 min-w-0">
            <span className="text-base font-bold text-sidebar-foreground">
              SkillMap
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Управление компетенциями
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Основные разделы */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            Основное
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-10 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isActive && "scale-110"
                          )}
                        />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Сервисы */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            Сервисы
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  isActive={pathname.startsWith("/services")}
                  className={cn(
                    "group relative h-10 rounded-lg transition-all duration-200",
                    pathname.startsWith("/services")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Settings
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        pathname.startsWith("/services") && "scale-110"
                      )}
                    />
                    <span className="font-medium">Сервисы</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 ml-auto",
                      isServicesOpen && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isServicesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {serviceItems.length > 0 ? (
                    serviceItems.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <SidebarMenuSubItem key={child.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              "ml-4 h-9 rounded-md transition-all duration-200",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium"
                                : "hover:bg-sidebar-accent/50"
                            )}
                          >
                            <Link href={child.href} className="flex items-center gap-3">
                              <child.icon className="h-3.5 w-3.5" />
                              <span>{child.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })
                  ) : (
                    <SidebarMenuSubItem>
                      <div className="ml-4 h-9 flex items-center text-xs text-sidebar-foreground/50 px-3">
                        Пункты меню будут добавлены позже
                      </div>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Справочники */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-2">
            Справочники
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsReferenceOpen(!isReferenceOpen)}
                  isActive={pathname.startsWith("/reference")}
                  className={cn(
                    "group relative h-10 rounded-lg transition-all duration-200",
                    pathname.startsWith("/reference")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FolderOpen
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        pathname.startsWith("/reference") && "scale-110"
                      )}
                    />
                    <span className="font-medium">Справочники</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 ml-auto",
                      isReferenceOpen && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>
                <SidebarMenuSub
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isReferenceOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {referenceItems.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <SidebarMenuSubItem key={child.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "ml-4 h-9 rounded-md transition-all duration-200",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium"
                              : "hover:bg-sidebar-accent/50"
                          )}
                        >
                          <Link href={child.href} className="flex items-center gap-3">
                            <child.icon className="h-3.5 w-3.5" />
                            <span>{child.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Система активна</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
