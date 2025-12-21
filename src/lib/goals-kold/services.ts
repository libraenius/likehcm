/**
 * Сервисы для работы с данными модуля целеполагания (Goals KOLD)
 */

import type { KPI } from "@/types/goals-kold";
import { calculateKPIMetrics } from "./utils";

/**
 * Инициализирует данные КПЭ для стрима
 * 
 * @param streamId - ID стрима
 * @param mockStreamKPIs - Моковые данные годовых КПЭ
 * @param mockQuarterlyKPIs - Моковые данные квартальных КПЭ
 * @param mockITLeaderKPIs - Моковые данные КПЭ ИТ лидера
 * @returns Объект с инициализированными данными КПЭ
 */
export function initializeKPIData(
  streamId: string,
  mockStreamKPIs: Record<string, KPI[]>,
  mockQuarterlyKPIs: Record<string, Record<string, KPI[]>>,
  mockITLeaderKPIs: Record<string, Record<string, KPI[]>>
) {
  const annualKPIs: Record<string, Record<string, KPI[]>> = {};
  const quarterlyKPIs: Record<string, Record<string, KPI[]>> = {};
  const itLeaderKPIs: Record<string, Record<string, KPI[]>> = {};

  // Инициализация годовых КПЭ
  if (mockStreamKPIs[streamId]) {
    annualKPIs[streamId] = {
      "2025": mockStreamKPIs[streamId].map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      })),
    };
  }

  // Инициализация квартальных КПЭ
  if (mockQuarterlyKPIs[streamId]) {
    quarterlyKPIs[streamId] = {};
    Object.keys(mockQuarterlyKPIs[streamId]).forEach(quarter => {
      quarterlyKPIs[streamId][quarter] = mockQuarterlyKPIs[streamId][quarter].map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      }));
    });
  }

  // Инициализация КПЭ ИТ лидера
  if (mockITLeaderKPIs[streamId]) {
    itLeaderKPIs[streamId] = {};
    Object.keys(mockITLeaderKPIs[streamId]).forEach(quarter => {
      itLeaderKPIs[streamId][quarter] = mockITLeaderKPIs[streamId][quarter].map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      }));
    });
  }

  return { annualKPIs, quarterlyKPIs, itLeaderKPIs };
}

/**
 * Вычисляет интегральный КПЭ (сумма evaluationPercent всех КПЭ)
 * 
 * @param kpis - Массив КПЭ
 * @returns Сумма evaluationPercent всех КПЭ
 */
export function calculateIntegralKPI(kpis: KPI[]): number {
  return kpis.reduce((sum, kpi) => sum + kpi.evaluationPercent, 0);
}

/**
 * Обновляет метрики КПЭ (completionPercent и evaluationPercent)
 * 
 * @param kpi - КПЭ для обновления
 * @returns Обновленный КПЭ с пересчитанными метриками
 */
export function updateKPIMetrics(kpi: KPI): KPI {
  const metrics = calculateKPIMetrics(kpi.plan, kpi.fact, kpi.weight);
  return { ...kpi, ...metrics };
}

/**
 * Перенумеровывает КПЭ, начиная с 1
 * 
 * @param kpis - Массив КПЭ для перенумерации
 * @returns Массив КПЭ с обновленными номерами
 */
export function renumberKPIs(kpis: KPI[]): KPI[] {
  return kpis.map((kpi, index) => ({ ...kpi, number: index + 1 }));
}

