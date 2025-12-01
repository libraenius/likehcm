/**
 * Элемент навигационной цепочки (хлебные крошки)
 */
export interface BreadcrumbItem {
  /** Отображаемое название элемента */
  label: string;
  /** URL-адрес для навигации */
  href: string;
}

/**
 * Маппинг путей к названиям для breadcrumbs
 */
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
  "/services/goals-kold": "Целеполагание КОЛД",
  "/services/external-providers": "Внешние поставщики",
  "/team": "Команда",
};

/**
 * Маппинг английских названий сегментов к русским
 * Используется для случаев, когда путь не найден в pathLabels
 */
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
  "goals-kold": "Целеполагание КОЛД",
  "external-providers": "Внешние поставщики",
  "team": "Команда",
};

/**
 * Преобразует английское название сегмента пути в русское
 * 
 * @param {string} segment - Сегмент пути (например, "profile", "career-tracks")
 * @returns {string} Русское название сегмента
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
 * 
 * Создаёт массив элементов навигационной цепочки на основе URL.
 * Всегда включает главную страницу в начало цепочки.
 * 
 * @param {string} pathname - Текущий путь URL (например, "/reference/profiles")
 * @returns {BreadcrumbItem[]} Массив элементов навигационной цепочки
 * 
 * @example
 * ```ts
 * generateBreadcrumbs("/reference/profiles")
 * // [
 * //   { label: "Главная", href: "/" },
 * //   { label: "Справочники", href: "/reference" },
 * //   { label: "Профили", href: "/reference/profiles" }
 * // ]
 * ```
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

