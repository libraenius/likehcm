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
  "/services": "Сервисы",
  "/services/career": "Карьера",
  "/services/assessment": "Оценка",
  "/services/assessment-center": "Ассессмент",
  "/services/goals": "Целеполагание",
};

// Маппинг английских названий сегментов к русским (для случаев, когда путь не найден в pathLabels)
const segmentLabels: Record<string, string> = {
  "profile": "Мой профиль",
  "team": "Моя команда",
  "reference": "Справочники",
  "competences": "Компетенции",
  "profiles": "Профили",
  "career-tracks": "Карьерные треки",
  "services": "Сервисы",
  "career": "Карьера",
  "assessment": "Оценка",
  "assessment-center": "Ассессмент",
  "goals": "Целеполагание",
};

/**
 * Преобразует английское название сегмента пути в русское
 */
function translateSegment(segment: string): string {
  // Сначала проверяем точное совпадение
  if (segmentLabels[segment]) {
    return segmentLabels[segment];
  }
  
  // Если не найдено, пытаемся преобразовать через дефисы и заглавные буквы
  const normalized = segment.toLowerCase().replace(/-/g, " ");
  const words = normalized.split(" ");
  const capitalized = words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
  
  // Если это не помогло, возвращаем исходное значение с первой заглавной буквой
  return segment.charAt(0).toUpperCase() + segment.slice(1);
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

