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

