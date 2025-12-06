/**
 * Общие типы для модуля целеполагания (Goals KOLD)
 */

// Тип для лидера
export interface Leader {
  name: string;
  position: string;
}

// Тип для стрима
export interface Stream {
  id: string;
  name: string;
  description?: string;
  type?: "продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный";
  businessType?: "РБ" | "МСБ";
  startDate?: string; // Дата в формате YYYY-MM-DD
  endDate?: string; // Дата в формате YYYY-MM-DD
  leader?: Leader;
  itLeader?: Leader;
  teams: Team[];
}

// Тип для команды
export interface Team {
  id: string;
  name: string;
  description?: string;
  streamId: string;
  streamName: string;
  leader?: string;
  membersCount?: number;
}

// Тип для КПЭ (ключевого показателя эффективности)
export interface KPI {
  id: string;
  number: number;
  name: string;
  weight: number;
  type: string;
  unit: string;
  plan: number;
  fact: number;
  planStatus?: string;
  factStatus?: string;
  completionPercent: number;
  evaluationPercent: number;
}

// Тип для единицы измерения
export interface MeasurementUnit {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
}

// Тип для формулы
export interface Formula {
  id: string;
  name: string;
  formula: string;
  description?: string;
}

// Тип для сотрудника ДАТ
export interface DATEmployee {
  id: string;
  fullName: string;
  position: string;
  avatar?: string;
}

// Тип для фильтров стримов
export interface StreamFilters {
  types: string[];
  businessTypes: string[];
}

// Тип для справочника
export type ReferenceType = "units" | "formulas" | "streams";

