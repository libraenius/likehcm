export interface BreadcrumbItem {
  label: string;
  href: string;
}

// Маппинг путей к названиям для breadcrumbs
const pathLabels: Record<string, string> = {
  "/": "Главная",
  "/profile": "Главная",
  "/reference": "Справочники",
  "/reference/competences": "Компетенции",
  "/reference/profiles": "Профили",
  "/reference/career-tracks": "Карьерные треки",
  "/services": "Сервисы",
  "/services/career": "Карьера",
  "/services/assessment": "Оценка",
  "/services/assessment-center": "Ассессмент",
  "/services/goals": "Целеполагание",
  "/services/goals-kold": "Целеполагание Стримы",
  "/services/external-providers": "Внешние поставщики",
  "/administration": "Администрирование",
  "/administration/goals-kold": "Целеполагание Стримы",
  "/team": "Команда",
};

// Маппинг английских названий сегментов к русским (для случаев, когда путь не найден в pathLabels)
const segmentLabels: Record<string, string> = {
  "profile": "Главная",
  "reference": "Справочники",
  "competences": "Компетенции",
  "profiles": "Профили",
  "career-tracks": "Карьерные треки",
  "services": "Сервисы",
  "career": "Карьера",
  "assessment": "Оценка",
  "assessment-center": "Ассессмент",
  "goals": "Целеполагание",
  "goals-kold": "Целеполагание Стримы",
  "external-providers": "Внешние поставщики",
  "administration": "Администрирование",
  "team": "Команда",
};

/**
 * Преобразует английское название сегмента пути в русское
 */
function translateSegment(segment: string): string {
  // Сначала проверяем точное совпадение
  if (segmentLabels[segment]) {
    return segmentLabels[segment];
  }
  
  // Если не найдено, пытаемся найти через дефисы
  const normalized = segment.toLowerCase();
  if (segmentLabels[normalized]) {
    return segmentLabels[normalized];
  }
  
  // Если все еще не найдено, возвращаем общее название на русском
  // чтобы избежать отображения английских текстов
  return "Страница";
}

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
    // Сначала проверяем полный путь, затем отдельный сегмент
    const label = pathLabels[currentPath] || translateSegment(segments[i]);
    
    breadcrumbs.push({
      label: label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

