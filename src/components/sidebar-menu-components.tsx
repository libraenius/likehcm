"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/sidebar-config";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

/**
 * Константы стилей для переиспользования
 */
const menuButtonStyles = {
  base: "group relative h-10 rounded-lg transition-all duration-200",
  active: "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
  inactive: "hover:bg-sidebar-accent/50",
};

const subMenuButtonStyles = {
  base: "ml-4 h-9 rounded-md transition-all duration-200",
  active: "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-medium",
  inactive: "hover:bg-sidebar-accent/50",
};

const iconStyles = {
  base: "h-4 w-4 transition-transform duration-200",
  active: "scale-110",
  sub: "h-3.5 w-3.5",
};

/**
 * Компонент для отображения простого пункта меню
 */
interface SimpleMenuItemProps {
  item: MenuItem;
  pathname: string;
}

export function SimpleMenuItem({ item, pathname }: SimpleMenuItemProps) {
  const isActive = pathname === item.href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          menuButtonStyles.base,
          isActive ? menuButtonStyles.active : menuButtonStyles.inactive
        )}
      >
        <Link href={item.href} className="flex items-center gap-3">
          <item.icon
            className={cn(iconStyles.base, isActive && iconStyles.active)}
          />
          <span className="font-medium">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Компонент для отображения раздела с подменю
 */
interface CollapsibleMenuSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  basePath: string;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function CollapsibleMenuSection({
  title,
  icon: Icon,
  items,
  basePath,
  pathname,
  isOpen,
  onToggle,
}: CollapsibleMenuSectionProps) {
  const isActive = pathname.startsWith(basePath);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // В свернутом виде показываем подменю только по клику
  const [isClicked, setIsClicked] = React.useState(false);
  const menuItemRef = React.useRef<HTMLLIElement>(null);
  const submenuRef = React.useRef<HTMLDivElement>(null);

  const shouldShowSubmenu = isCollapsed ? isClicked : isOpen;

  // В свернутом виде при клике открываем подменю как popover справа
  const handleClick = () => {
    if (isCollapsed) {
      setIsClicked(!isClicked);
    } else {
      onToggle();
    }
  };

  // Обновляем позицию подменю при прокрутке и изменении размера окна
  const [submenuPosition, setSubmenuPosition] = React.useState<{ left: number; top: number } | null>(null);

  React.useEffect(() => {
    if (!isCollapsed || !isClicked || !menuItemRef.current) return;

    const updatePosition = () => {
      if (menuItemRef.current) {
        const rect = menuItemRef.current.getBoundingClientRect();
        setSubmenuPosition({
          left: rect.right + 8,
          top: rect.top,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isCollapsed, isClicked]);

  // Закрываем подменю при клике вне его
  React.useEffect(() => {
    if (!isCollapsed || !isClicked) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuItemRef.current &&
        submenuRef.current &&
        !menuItemRef.current.contains(event.target as Node) &&
        !submenuRef.current.contains(event.target as Node)
      ) {
        setIsClicked(false);
        setSubmenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, isClicked]);

  return (
    <SidebarMenuItem
      ref={menuItemRef}
      className="relative"
    >
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive}
        className={cn(
          menuButtonStyles.base,
          isActive ? menuButtonStyles.active : menuButtonStyles.inactive,
          isCollapsed && isClicked && "bg-sidebar-accent"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon
            className={cn(iconStyles.base, isActive && iconStyles.active)}
          />
          <span className="font-medium">{title}</span>
        </div>
        {!isCollapsed && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200 ml-auto",
              isOpen && "rotate-90"
            )}
          />
        )}
        {isCollapsed && items.length > 0 && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200 ml-auto",
              isClicked && "rotate-90"
            )}
          />
        )}
      </SidebarMenuButton>
      
      {/* Стандартное подменю для развернутого состояния */}
      {!isCollapsed && (
        <SidebarMenuSub
          className={cn(
            "overflow-hidden transition-all duration-200",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {items.length > 0 ? (
            items.map((item) => {
              const isItemActive = pathname === item.href;
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isItemActive}
                    className={cn(
                      subMenuButtonStyles.base,
                      isItemActive
                        ? subMenuButtonStyles.active
                        : subMenuButtonStyles.inactive
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={iconStyles.sub} />
                      <span>{item.title}</span>
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
      )}

      {/* Popover подменю для свернутого состояния */}
      {isCollapsed && shouldShowSubmenu && submenuPosition && typeof window !== "undefined" && createPortal(
        <div
          ref={submenuRef}
          className="fixed z-[99999] min-w-[200px] bg-sidebar border border-sidebar-border rounded-md shadow-xl py-1 max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 pointer-events-auto"
          style={{
            left: `${submenuPosition.left}px`,
            top: `${submenuPosition.top}px`,
          }}
          onMouseDown={(e) => {
            // Предотвращаем закрытие при клике внутри подменю
            e.stopPropagation();
          }}
        >
          <ul className="flex flex-col gap-0.5">
            {items.length > 0 ? (
              items.map((item) => {
                const isItemActive = pathname === item.href;
                return (
                  <li key={item.href} className="list-none">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 h-9 px-3 mx-1 rounded-md transition-all duration-200 text-sm cursor-pointer relative z-10",
                        isItemActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                      )}
                      onClick={(e) => {
                        // Разрешаем навигацию - не останавливаем событие
                        // Закрываем подменю после небольшой задержки
                        setTimeout(() => {
                          setIsClicked(false);
                          setSubmenuPosition(null);
                        }, 100);
                      }}
                    >
                      <item.icon className="h-4 w-4 shrink-0 pointer-events-none" />
                      <span className="truncate pointer-events-none">{item.title}</span>
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className="list-none">
                <div className="h-9 flex items-center text-xs text-sidebar-foreground/50 px-3 mx-1">
                  Пункты меню будут добавлены позже
                </div>
              </li>
            )}
          </ul>
        </div>,
        document.body
      )}
    </SidebarMenuItem>
  );
}

/**
 * Компонент для отображения группы простых пунктов меню
 */
interface SimpleMenuGroupProps {
  items: MenuItem[];
  pathname: string;
}

export function SimpleMenuGroup({ items, pathname }: SimpleMenuGroupProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SimpleMenuItem key={item.href} item={item} pathname={pathname} />
      ))}
    </SidebarMenu>
  );
}

