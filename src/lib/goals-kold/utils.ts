/**
 * Общие утилиты для модуля целеполагания (Goals KOLD)
 */

import type { Leader, KPI } from "@/types/goals-kold";

/**
 * Получение инициалов из ФИО или объекта Leader
 */
export const getInitials = (fullNameOrLeader: string | Leader): string => {
  const fullName = typeof fullNameOrLeader === "string" ? fullNameOrLeader : fullNameOrLeader.name;
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "??";
};

/**
 * Форматирование даты в формат дд.мм.гггг
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Расчет метрик КПЭ: completionPercent и evaluationPercent
 * @param plan - План
 * @param fact - Факт
 * @param weight - Вес КПЭ
 * @returns Объект с completionPercent и evaluationPercent
 */
export const calculateKPIMetrics = (
  plan: number,
  fact: number,
  weight: number
): { completionPercent: number; evaluationPercent: number } => {
  const completionPercent = plan !== 0 ? (fact / plan) * 100 : 0;
  const evaluationPercent = Math.min(completionPercent * (weight / 100), weight * 1.2); // Максимум 120% от веса
  return { completionPercent, evaluationPercent };
};

/**
 * Создание нового КПЭ с рассчитанными метриками
 */
export const createKPIWithMetrics = (
  baseKPI: Omit<KPI, "completionPercent" | "evaluationPercent">,
  plan: number,
  fact: number
): KPI => {
  const { completionPercent, evaluationPercent } = calculateKPIMetrics(plan, fact, baseKPI.weight);
  return {
    ...baseKPI,
    plan,
    fact,
    completionPercent,
    evaluationPercent,
  };
};

