"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateBreadcrumbs } from "@/lib/breadcrumbs";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { Home } from "lucide-react";

/**
 * Компонент навигационных хлебных крошек
 * 
 * Отображает путь навигации на основе текущего URL.
 * Автоматически скрывается, если пользователь находится на главной странице.
 * 
 * @returns {JSX.Element | null} Компонент хлебных крошек или null, если на главной странице
 */
export function AppBreadcrumb() {
  const pathname = usePathname();
  const { customLabel } = useBreadcrumb();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Если только главная страница, не показываем breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null;
  }

  // Если есть кастомное название, заменяем последний элемент
  const finalBreadcrumbs = customLabel && breadcrumbs.length > 0
    ? breadcrumbs.map((item, index) => 
        index === breadcrumbs.length - 1 
          ? { ...item, label: customLabel }
          : item
      )
    : breadcrumbs;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {finalBreadcrumbs.map((item, index) => {
          const isLast = index === finalBreadcrumbs.length - 1;
          
          return (
            <React.Fragment key={item.href}>
              {index === 0 ? (
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="flex items-center gap-1.5">
                      <Home className="h-4 w-4" />
                      <span className="sr-only">Главная</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ) : isLast ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

