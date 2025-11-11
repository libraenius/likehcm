export interface BreadcrumbItem {
  label: string;
  href: string;
}

// Маппинг путей к названиям для breadcrumbs
const pathLabels: Record<string, string> = {
  "/": "Главная",
  "/profile": "Мой профиль",
  "/team": "Моя команда",
  "/reference": "Справочники",
  "/reference/competences": "Компетенции",
  "/reference/profiles": "Профили",
  "/reference/career-tracks": "Карьерные треки",
};

/**
 * Генерирует breadcrumbs на основе текущего пути
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Всегда добавляем главную страницу
  breadcrumbs.push({
    label: "Главная",
    href: "/",
  });

  // Если это главная страница, возвращаем только её
  if (pathname === "/") {
    return breadcrumbs;
  }

  // Разбиваем путь на сегменты
  const segments = pathname.split("/").filter(Boolean);
  
  // Строим путь постепенно
  let currentPath = "";
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    
    // Получаем название для текущего пути
    const label = pathLabels[currentPath] || segments[i];
    
    breadcrumbs.push({
      label: label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

