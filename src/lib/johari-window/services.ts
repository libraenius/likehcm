/**
 * Сервисы для работы с окном Джохари (Johari Window)
 * 
 * Окно Джохари - психологический инструмент для понимания самосознания через 4 квадранта:
 * 1. Arena (Открытая область) - высокая самооценка + высокая оценка других
 * 2. Blind Spot (Слепая зона) - низкая самооценка + высокая оценка других  
 * 3. Façade (Скрытая область) - высокая самооценка + низкая оценка других
 * 4. Unknown (Неизвестная область) - низкая самооценка + низкая оценка других
 */

import type { 
  MultiRoleAssessment, 
  AggregatedAssessment, 
  JohariQuadrant, 
  JohariWindowData,
  JohariWindowStats,
  SkillLevel,
  Competence
} from "@/types";
import { getCompetenceById } from "@/lib/data";

/**
 * Агрегирует оценки от разных ролей в единую структуру
 */
export function aggregateAssessments(
  multiRoleAssessment: MultiRoleAssessment
): AggregatedAssessment {
  const { competenceId, selfAssessment, managerAssessment, peerAssessments, subordinateAssessments } = multiRoleAssessment;

  // Вычисляем среднюю оценку коллег
  const avgPeerAssessment = peerAssessments.length > 0
    ? peerAssessments.reduce((sum, level) => sum + level, 0) / peerAssessments.length
    : undefined;

  // Вычисляем среднюю оценку подчиненных
  const avgSubordinateAssessment = subordinateAssessments.length > 0
    ? subordinateAssessments.reduce((sum, level) => sum + level, 0) / subordinateAssessments.length
    : undefined;

  return {
    competenceId,
    selfAssessment,
    managerAssessment,
    avgPeerAssessment,
    avgSubordinateAssessment,
    peerCount: peerAssessments.length,
    subordinateCount: subordinateAssessments.length,
  };
}

/**
 * Вычисляет общую среднюю оценку от других (руководитель, коллеги, подчиненные)
 * 
 * Веса:
 * - Руководитель: 40%
 * - Коллеги: 40%
 * - Подчиненные: 20%
 */
export function calculateOthersAverageAssessment(
  aggregated: AggregatedAssessment
): number | undefined {
  const assessments: { value: number; weight: number }[] = [];

  // Оценка руководителя (вес 40%)
  if (aggregated.managerAssessment !== undefined) {
    assessments.push({ value: aggregated.managerAssessment, weight: 0.4 });
  }

  // Средняя оценка коллег (вес 40%)
  if (aggregated.avgPeerAssessment !== undefined) {
    assessments.push({ value: aggregated.avgPeerAssessment, weight: 0.4 });
  }

  // Средняя оценка подчиненных (вес 20%)
  if (aggregated.avgSubordinateAssessment !== undefined) {
    assessments.push({ value: aggregated.avgSubordinateAssessment, weight: 0.2 });
  }

  if (assessments.length === 0) {
    return undefined;
  }

  // Нормализуем веса, если не все роли присутствуют
  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
  const weightedSum = assessments.reduce((sum, a) => sum + (a.value * a.weight), 0);

  return weightedSum / totalWeight;
}

/**
 * Определяет квадрант окна Джохари для компетенции
 * 
 * Логика:
 * - Высокая оценка: >= 3.5 (средний и выше)
 * - Низкая оценка: < 3.5 (ниже среднего)
 */
export function determineJohariQuadrant(
  selfAssessment: SkillLevel | undefined,
  othersAssessment: number | undefined
): JohariQuadrant {
  const threshold = 3.5; // Порог между высокой и низкой оценкой

  const selfHigh = (selfAssessment ?? 0) >= threshold;
  const othersHigh = (othersAssessment ?? 0) >= threshold;

  if (selfHigh && othersHigh) {
    return "arena"; // Открытая область - сильная сторона
  } else if (!selfHigh && othersHigh) {
    return "blind_spot"; // Слепая зона - недооценка своих способностей
  } else if (selfHigh && !othersHigh) {
    return "facade"; // Скрытая область - переоценка своих способностей
  } else {
    return "unknown"; // Неизвестная область - зона развития
  }
}

/**
 * Создает данные окна Джохари для компетенции
 */
export function createJohariWindowData(
  multiRoleAssessment: MultiRoleAssessment
): JohariWindowData | null {
  const aggregated = aggregateAssessments(multiRoleAssessment);
  const othersAssessment = calculateOthersAverageAssessment(aggregated);

  // Если нет ни самооценки, ни оценки других - пропускаем
  if (aggregated.selfAssessment === undefined && othersAssessment === undefined) {
    return null;
  }

  const competence = getCompetenceById(multiRoleAssessment.competenceId);
  if (!competence) {
    return null;
  }

  const selfAssessment = aggregated.selfAssessment ?? 0;
  const othersAvg = othersAssessment ?? 0;
  const quadrant = determineJohariQuadrant(aggregated.selfAssessment, othersAssessment);
  const gap = selfAssessment - othersAvg;

  return {
    competenceId: multiRoleAssessment.competenceId,
    competenceName: competence.name,
    quadrant,
    selfAssessment: selfAssessment as SkillLevel,
    othersAssessment: othersAvg,
    gap,
  };
}

/**
 * Создает данные окна Джохари для всех компетенций пользователя
 */
export function createJohariWindowDataset(
  multiRoleAssessments: MultiRoleAssessment[]
): JohariWindowData[] {
  return multiRoleAssessments
    .map(assessment => createJohariWindowData(assessment))
    .filter((data): data is JohariWindowData => data !== null);
}

/**
 * Вычисляет статистику по окну Джохари
 */
export function calculateJohariStats(
  johariData: JohariWindowData[]
): JohariWindowStats {
  const stats: JohariWindowStats = {
    arena: 0,
    blindSpot: 0,
    facade: 0,
    unknown: 0,
    total: johariData.length,
  };

  johariData.forEach(data => {
    switch (data.quadrant) {
      case "arena":
        stats.arena++;
        break;
      case "blind_spot":
        stats.blindSpot++;
        break;
      case "facade":
        stats.facade++;
        break;
      case "unknown":
        stats.unknown++;
        break;
    }
  });

  return stats;
}

/**
 * Получает рекомендации на основе квадранта окна Джохари
 */
export function getJohariRecommendation(quadrant: JohariQuadrant): {
  title: string;
  description: string;
  action: string;
} {
  switch (quadrant) {
    case "arena":
      return {
        title: "Открытая область (Сильная сторона)",
        description: "Вы и окружающие согласны, что это ваша сильная сторона. Продолжайте развивать и используйте эту компетенцию как основу для роста.",
        action: "Делитесь опытом с коллегами, станьте наставником в этой области.",
      };
    case "blind_spot":
      return {
        title: "Слепая зона (Недооценка)",
        description: "Окружающие видят в вас больший потенциал, чем вы сами. Возможно, вы слишком скромны или не замечаете своих достижений.",
        action: "Попросите обратную связь, проанализируйте свои успехи, повысьте уверенность.",
      };
    case "facade":
      return {
        title: "Скрытая область (Переоценка)",
        description: "Вы оцениваете себя выше, чем окружающие. Это может быть зоной для развития или области, где нужна дополнительная практика.",
        action: "Запросите конкретные примеры, где можно улучшиться. Найдите ментора или пройдите обучение.",
      };
    case "unknown":
      return {
        title: "Неизвестная область (Зона развития)",
        description: "И вы, и окружающие согласны, что это область для развития. Хорошая возможность для роста.",
        action: "Составьте план развития, пройдите обучение, практикуйтесь под руководством опытного специалиста.",
      };
  }
}

/**
 * Сортирует компетенции по приоритету развития
 * Приоритет: Façade > Blind Spot > Unknown > Arena
 */
export function sortByDevelopmentPriority(johariData: JohariWindowData[]): JohariWindowData[] {
  const priorityOrder: Record<JohariQuadrant, number> = {
    facade: 1,      // Переоценка - критично исправить
    blind_spot: 2,  // Недооценка - важно признать
    unknown: 3,     // Зона развития - планировать развитие
    arena: 4,       // Сильная сторона - поддерживать
  };

  return [...johariData].sort((a, b) => {
    const priorityDiff = priorityOrder[a.quadrant] - priorityOrder[b.quadrant];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Внутри квадранта сортируем по величине разрыва (абсолютное значение)
    return Math.abs(b.gap) - Math.abs(a.gap);
  });
}

/**
 * Проверяет, достаточно ли оценок для надежного анализа
 */
export function hasReliableData(
  multiRoleAssessment: MultiRoleAssessment,
  minPeerCount: number = 3
): boolean {
  const { selfAssessment, managerAssessment, peerAssessments, subordinateAssessments } = multiRoleAssessment;

  // Должна быть хотя бы самооценка
  if (selfAssessment === undefined) {
    return false;
  }

  // Должна быть хотя бы одна из оценок: руководитель ИЛИ достаточно коллег
  const hasManagerAssessment = managerAssessment !== undefined;
  const hasEnoughPeers = peerAssessments.length >= minPeerCount;
  const hasSubordinates = subordinateAssessments.length > 0;

  return hasManagerAssessment || hasEnoughPeers || hasSubordinates;
}
