/**
 * Унифицированные цвета для тегов (Badge) в системе
 * Все цвета поддерживают светлую и темную темы
 * 
 * Принципы:
 * - Единая семантика: одинаковые статусы = одинаковые цвета
 * - Обязательная темная тема для всех тегов
 * - Единый формат: bg-{color}-100 text-{color}-700 border-{color}-300 dark:bg-{color}-900 dark:text-{color}-200 dark:border-{color}-700
 */

export const BADGE_COLORS = {
  // ========== Статусы жизненного цикла ==========
  /** Запланировано / Планируется - информационный статус ожидания */
  planned: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  
  /** Активно (работа в процессе) - требует внимания */
  active: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  
  /** В процессе выполнения - работа идет */
  inProgress: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
  
  /** Завершено / Готово - успешное завершение */
  completed: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Отменено - отказ, ошибка */
  cancelled: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  // ========== Статусы заявок и участия ==========
  /** На рассмотрении / Ожидает решения */
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
  
  /** Одобрено / Согласовано - успешное одобрение */
  approved: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Отклонено - отказ */
  rejected: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  /** Подтверждено - подтверждение участия */
  confirmed: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  
  /** Приглашен - приглашение отправлено */
  invited: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  
  /** Отозвано / Снято - нейтральное снятие */
  withdrawn: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
  
  /** Не начато - нейтральный статус паузы */
  notStarted: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
  
  // ========== Специальные статусы ==========
  /** Набор участников / Рекрутинг */
  recruiting: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Отправлено (уведомления) */
  sent: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Ошибка / Неудача */
  failed: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  // ========== Уровни готовности (Преемственность) ==========
  /** Готов (уровень 5) */
  ready: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Почти готов (уровень 4) */
  almostReady: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  
  /** В развитии (уровень 3) */
  developing: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
  
  /** Требует развития (уровень 2) */
  needsDevelopment: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  
  /** Не готов (уровень 1) */
  notReady: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  // ========== Уровни риска ==========
  /** Низкий риск */
  lowRisk: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Средний риск */
  mediumRisk: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
  
  /** Высокий риск */
  highRisk: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  // ========== Критичность позиций ==========
  /** Критическая критичность */
  critical: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  /** Высокая критичность */
  highCriticality: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  
  /** Средняя критичность */
  mediumCriticality: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
  
  /** Низкая критичность */
  lowCriticality: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  // ========== Типы компетенций ==========
  /** Профессиональные компетенции */
  professional: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  
  /** Корпоративные компетенции */
  corporate: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700",
  
  // ========== Согласование (Goals Kold) ==========
  /** Согласовано */
  agreed: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  
  /** Отклонено согласование */
  rejectedAgreement: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  
  /** На выставлении / В процессе согласования */
  inReview: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  
  // ========== Линии сотрудничества ==========
  /** ДРП - информационный синий */
  drp: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  
  /** БКО - активный фиолетовый */
  bko: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  
  /** ЦНТР - корпоративный циан */
  cntr: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700",
} as const;

/**
 * Получает цвет тега по статусу
 * Поддерживает различные форматы статусов из разных сервисов
 */
export function getStatusBadgeColor(status: string): string {
  const normalizedStatus = status.toLowerCase().trim();
  
  const statusMap: Record<string, keyof typeof BADGE_COLORS> = {
    // Статусы стажировок (план, набор, активна, завершена)
    'planned': 'planned',
    'recruiting': 'recruiting',
    'active': 'active',
    'completed': 'completed',
    
    // Статусы заявок
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'confirmed': 'confirmed',
    'withdrawn': 'withdrawn',
    'not-started': 'notStarted',
    'not_started': 'notStarted',
    'invited': 'invited',
    'in-progress': 'inProgress',
    'in_progress': 'inProgress',
    
    // Статусы партнерств
    'planned': 'planned',
    'active': 'active',
    'completed': 'completed',
    'cancelled': 'cancelled',
    
    // Статусы процедур оценки
    'planned': 'planned',
    'in-progress': 'inProgress',
    'in_progress': 'inProgress',
    'completed': 'completed',
    'cancelled': 'cancelled',
    
    // Статусы участников
    'not-started': 'notStarted',
    'not_started': 'notStarted',
    'invited': 'invited',
    'in-progress': 'inProgress',
    'in_progress': 'inProgress',
    'completed': 'completed',
    
    // Статусы уведомлений
    'sent': 'sent',
    'pending': 'pending',
    'failed': 'failed',
    
    // Статусы оценки компетенций
    'completed': 'completed',
    'in_progress': 'inProgress',
    'pending': 'pending',
    'cancelled': 'cancelled',
    
    // Статусы ИПР (Individual Development Plans)
    'draft': 'notStarted',
    'pending-approval': 'pending',
    'pending_approval': 'pending',
  };
  
  const key = statusMap[normalizedStatus];
  return key ? BADGE_COLORS[key] : BADGE_COLORS.notStarted;
}

/**
 * Получает цвет тега для уровня готовности преемника
 */
export function getReadinessBadgeColor(level: 1 | 2 | 3 | 4 | 5): string {
  const levelMap: Record<1 | 2 | 3 | 4 | 5, keyof typeof BADGE_COLORS> = {
    5: 'ready',
    4: 'almostReady',
    3: 'developing',
    2: 'needsDevelopment',
    1: 'notReady',
  };
  return BADGE_COLORS[levelMap[level]];
}

/**
 * Получает цвет тега для уровня риска
 */
export function getRiskBadgeColor(risk: 'low' | 'medium' | 'high'): string {
  const riskMap: Record<'low' | 'medium' | 'high', keyof typeof BADGE_COLORS> = {
    low: 'lowRisk',
    medium: 'mediumRisk',
    high: 'highRisk',
  };
  return BADGE_COLORS[riskMap[risk]];
}

/**
 * Получает цвет тега для критичности позиции
 */
export function getCriticalityBadgeColor(criticality: 'low' | 'medium' | 'high' | 'critical'): string {
  const criticalityMap: Record<'low' | 'medium' | 'high' | 'critical', keyof typeof BADGE_COLORS> = {
    low: 'lowCriticality',
    medium: 'mediumCriticality',
    high: 'highCriticality',
    critical: 'critical',
  };
  return BADGE_COLORS[criticalityMap[criticality]];
}

/**
 * Получает цвет тега для типа компетенции
 */
export function getCompetenceTypeBadgeColor(type: 'профессиональные компетенции' | 'корпоративные компетенции'): string {
  return type === 'профессиональные компетенции' 
    ? BADGE_COLORS.professional 
    : BADGE_COLORS.corporate;
}

/**
 * Получает цвет тега для статуса согласования (Goals Kold)
 */
export function getAgreementBadgeColor(status: string): string {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('согласован') || normalizedStatus.includes('согласовано')) {
    return BADGE_COLORS.agreed;
  }
  if (normalizedStatus.includes('отклонен') || normalizedStatus.includes('отклонено')) {
    return BADGE_COLORS.rejectedAgreement;
  }
  if (normalizedStatus.includes('выставление') || normalizedStatus.includes('выставлен')) {
    return BADGE_COLORS.inReview;
  }
  
  return BADGE_COLORS.notStarted;
}

/**
 * Получает цвет тега для линии сотрудничества
 */
export function getCooperationLineBadgeColor(line: "drp" | "bko" | "cntr"): string {
  return BADGE_COLORS[line];
}
