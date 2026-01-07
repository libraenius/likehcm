/**
 * Конфигурация меню боковой панели
 */

import {
  BookOpen,
  User,
  TrendingUp,
  ClipboardCheck,
  FileText,
  Target,
  Crosshair,
  Briefcase,
  Building2,
  Shield,
  FolderOpen,
  Settings,
  Users,
  GraduationCap,
} from "lucide-react";
import type { ComponentType } from "react";

export interface MenuItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface MenuSection {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  basePath: string;
  items: MenuItem[];
}

/**
 * Основные пункты меню
 */
export const menuItems: MenuItem[] = [
  {
    title: "Главная",
    icon: User,
    href: "/profile",
  },
];

/**
 * Конфигурация разделов с подменю
 */
export const menuSections: MenuSection[] = [
  {
    id: "services",
    title: "Сервисы",
    icon: Settings,
    basePath: "/services",
    items: [
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
      {
        title: "Целеполагание Стримы",
        href: "/services/goals-kold",
        icon: Crosshair,
      },
      {
        title: "Оценка внешние провайдеры",
        href: "/services/external-providers",
        icon: Building2,
      },
      {
        title: "Преемники",
        href: "/services/succession",
        icon: Users,
      },
      {
        title: "Единая платформа по работе с ВУЗами",
        href: "/services/universities",
        icon: GraduationCap,
      },
    ],
  },
  {
    id: "reference",
    title: "Справочники",
    icon: FolderOpen,
    basePath: "/reference",
    items: [
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
    ],
  },
  {
    id: "administration",
    title: "Администрирование",
    icon: Shield,
    basePath: "/administration",
    items: [
      {
        title: "Целеполагание Стримы",
        href: "/administration/goals-kold",
        icon: Crosshair,
      },
    ],
  },
];

