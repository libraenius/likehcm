/**
 * Утилиты для расчетов готовности преемников и рисков позиций
 */

import type { SkillLevel, UserSkill, ProfileCompetence } from "@/types";
import type { ReadinessCalculation, SkillGap, RiskLevel, PositionCriticality } from "@/types/succession";

/**
 * Рассчитывает готовность сотрудника на основе его навыков и требований позиции
 */
export function calculateReadiness(
  employeeSkills: UserSkill[],
  positionRequirements: ProfileCompetence[]
): ReadinessCalculation {
  if (positionRequirements.length === 0) {
    return {
      readinessLevel: 5,
      readinessPercentage: 100,
      gaps: [],
    };
  }

  const gaps: SkillGap[] = [];
  let totalMatch = 0;
  let totalWeight = 0;

  // Создаем Map для быстрого поиска навыков сотрудника
  const skillsMap = new Map<string, SkillLevel>();
  employeeSkills.forEach((skill) => {
    skillsMap.set(skill.competenceId, skill.selfAssessment);
  });

  // Для каждой требуемой компетенции вычисляем соответствие
  positionRequirements.forEach((requirement) => {
    const currentLevel = skillsMap.get(requirement.competenceId) || 1;
    const requiredLevel = requirement.requiredLevel;
    const gap = requiredLevel - currentLevel;

    gaps.push({
      competenceId: requirement.competenceId,
      currentLevel,
      requiredLevel,
      gap: gap > 0 ? gap : 0,
    });

    // Вычисляем процент соответствия для этой компетенции
    const matchPercentage = currentLevel >= requiredLevel 
      ? 100 
      : (currentLevel / requiredLevel) * 100;

    totalMatch += matchPercentage;
    totalWeight += 1;
  });

  // Общий процент готовности
  const readinessPercentage = totalWeight > 0 
    ? Math.round(totalMatch / totalWeight) 
    : 0;

  // Определяем уровень готовности на основе процента
  let readinessLevel: 1 | 2 | 3 | 4 | 5;
  if (readinessPercentage >= 90) {
    readinessLevel = 5;
  } else if (readinessPercentage >= 75) {
    readinessLevel = 4;
  } else if (readinessPercentage >= 60) {
    readinessLevel = 3;
  } else if (readinessPercentage >= 40) {
    readinessLevel = 2;
  } else {
    readinessLevel = 1;
  }

  return {
    readinessLevel,
    readinessPercentage,
    gaps,
  };
}

/**
 * Рассчитывает уровень риска позиции на основе критичности и готовности преемников
 */
export function calculatePositionRisk(
  criticality: PositionCriticality,
  successors: Array<{ readinessLevel: 1 | 2 | 3 | 4 | 5; status: string }>
): RiskLevel {
  // Если нет преемников - высокий риск
  if (successors.length === 0) {
    return "high";
  }

  // Находим лучшего преемника (с максимальным уровнем готовности)
  const bestSuccessor = successors.reduce((best, current) => {
    return current.readinessLevel > best.readinessLevel ? current : best;
  }, successors[0]);

  // Если есть готовый преемник (уровень 5 или статус "ready")
  const hasReadySuccessor = bestSuccessor.readinessLevel >= 5 || bestSuccessor.status === "ready";

  // Если критичность высокая или критическая
  const isHighCriticality = criticality === "high" || criticality === "critical";

  // Логика определения риска:
  if (hasReadySuccessor) {
    // Есть готовый преемник - низкий риск
    return "low";
  } else if (bestSuccessor.readinessLevel >= 3 && !isHighCriticality) {
    // Есть преемник в развитии и позиция не критична - средний риск
    return "medium";
  } else if (bestSuccessor.readinessLevel >= 3 && isHighCriticality) {
    // Есть преемник в развитии, но позиция критична - высокий риск
    return "high";
  } else {
    // Преемники не готовы - высокий риск
    return "high";
  }
}

/**
 * Получает цвет для уровня готовности
 */
export function getReadinessColor(readinessLevel: 1 | 2 | 3 | 4 | 5): string {
  switch (readinessLevel) {
    case 5:
      return "text-green-600 bg-green-50 border-green-200";
    case 4:
      return "text-blue-600 bg-blue-50 border-blue-200";
    case 3:
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case 2:
      return "text-orange-600 bg-orange-50 border-orange-200";
    case 1:
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Получает цвет для уровня риска
 */
export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Получает цвет для критичности позиции
 */
export function getCriticalityColor(criticality: PositionCriticality): string {
  switch (criticality) {
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Получает название уровня готовности
 */
export function getReadinessLabel(readinessLevel: 1 | 2 | 3 | 4 | 5): string {
  switch (readinessLevel) {
    case 5:
      return "Готов";
    case 4:
      return "Почти готов";
    case 3:
      return "В развитии";
    case 2:
      return "Требует развития";
    case 1:
      return "Не готов";
    default:
      return "Неизвестно";
  }
}

/**
 * Получает название уровня риска
 */
export function getRiskLabel(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case "low":
      return "Низкий";
    case "medium":
      return "Средний";
    case "high":
      return "Высокий";
    default:
      return "Неизвестно";
  }
}

/**
 * Получает название критичности
 */
export function getCriticalityLabel(criticality: PositionCriticality): string {
  switch (criticality) {
    case "critical":
      return "Критическая";
    case "high":
      return "Высокая";
    case "medium":
      return "Средняя";
    case "low":
      return "Низкая";
    default:
      return "Неизвестно";
  }
}






