/**
 * Сервисы для работы с данными преемников
 */

import type { KeyPosition, Successor, SuccessorDevelopmentPlan } from "@/types/succession";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "../storage";
import { mockKeyPositions, mockSuccessors } from "./mock-data";
import { calculatePositionRisk } from "./calculations";

/**
 * Генерирует уникальный ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// === КЛЮЧЕВЫЕ ПОЗИЦИИ ===

/**
 * Инициализировать данные по умолчанию, если их еще нет
 */
export function initializeSuccessionData(): void {
  const existingPositions = getFromStorage<KeyPosition[]>(STORAGE_KEYS.KEY_POSITIONS, []);
  const existingSuccessors = getFromStorage<Successor[]>(STORAGE_KEYS.SUCCESSORS, []);

  // Инициализируем позиции, если их нет
  if (existingPositions.length === 0) {
    const now = new Date().toISOString();
    const positions: KeyPosition[] = mockKeyPositions.map((pos) => {
      // Вычисляем риск на основе преемников
      const posSuccessors = mockSuccessors.filter((s) => s.positionId === pos.id);
      const riskLevel = calculatePositionRisk(pos.criticality, posSuccessors);

      return {
        ...pos,
        createdAt: now,
        updatedAt: now,
        riskLevel,
      };
    });
    saveToStorage(STORAGE_KEYS.KEY_POSITIONS, positions);
  }

  // Инициализируем преемников, если их нет
  if (existingSuccessors.length === 0) {
    const now = new Date().toISOString();
    const successors: Successor[] = mockSuccessors.map((suc) => ({
      ...suc,
      assignedAt: now,
    }));
    saveToStorage(STORAGE_KEYS.SUCCESSORS, successors);
  }
}

/**
 * Получить все ключевые позиции
 */
export function getKeyPositions(): KeyPosition[] {
  // Инициализируем данные при первом обращении, если их нет
  const positions = getFromStorage<KeyPosition[]>(STORAGE_KEYS.KEY_POSITIONS, []);
  if (positions.length === 0) {
    initializeSuccessionData();
    return getFromStorage<KeyPosition[]>(STORAGE_KEYS.KEY_POSITIONS, []);
  }
  return positions;
}

/**
 * Получить ключевую позицию по ID
 */
export function getKeyPositionById(id: string): KeyPosition | undefined {
  const positions = getKeyPositions();
  return positions.find((p) => p.id === id);
}

/**
 * Создать новую ключевую позицию
 */
export function createKeyPosition(
  position: Omit<KeyPosition, "id" | "createdAt" | "updatedAt">
): KeyPosition {
  const positions = getKeyPositions();
  const newPosition: KeyPosition = {
    ...position,
    id: generateId("position"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  positions.push(newPosition);
  saveToStorage(STORAGE_KEYS.KEY_POSITIONS, positions);
  return newPosition;
}

/**
 * Обновить ключевую позицию
 */
export function updateKeyPosition(
  id: string,
  updates: Partial<Omit<KeyPosition, "id" | "createdAt">>
): KeyPosition | null {
  const positions = getKeyPositions();
  const index = positions.findIndex((p) => p.id === id);
  if (index === -1) return null;

  // Пересчитываем риск, если изменилась критичность или преемники
  const updatedPosition = {
    ...positions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Если изменилась критичность, пересчитываем риск
  if (updates.criticality !== undefined) {
    const successors = getSuccessors();
    const posSuccessors = successors.filter((s) => s.positionId === id);
    updatedPosition.riskLevel = calculatePositionRisk(
      updates.criticality,
      posSuccessors
    );
  }

  positions[index] = updatedPosition;
  saveToStorage(STORAGE_KEYS.KEY_POSITIONS, positions);
  return positions[index];
}

/**
 * Удалить ключевую позицию
 */
export function deleteKeyPosition(id: string): boolean {
  const positions = getKeyPositions();
  const index = positions.findIndex((p) => p.id === id);
  if (index === -1) return false;

  positions.splice(index, 1);
  saveToStorage(STORAGE_KEYS.KEY_POSITIONS, positions);

  // Также удаляем всех преемников этой позиции
  const successors = getSuccessors();
  const filteredSuccessors = successors.filter((s) => s.positionId !== id);
  saveToStorage(STORAGE_KEYS.SUCCESSORS, filteredSuccessors);

  return true;
}

// === ПРЕЕМНИКИ ===

/**
 * Получить всех преемников
 */
export function getSuccessors(): Successor[] {
  // Инициализируем данные при первом обращении, если их нет
  const successors = getFromStorage<Successor[]>(STORAGE_KEYS.SUCCESSORS, []);
  if (successors.length === 0) {
    initializeSuccessionData();
    return getFromStorage<Successor[]>(STORAGE_KEYS.SUCCESSORS, []);
  }
  return successors;
}

/**
 * Получить преемников по ID позиции
 */
export function getSuccessorsByPositionId(positionId: string): Successor[] {
  const successors = getSuccessors();
  return successors.filter((s) => s.positionId === positionId);
}

/**
 * Получить преемника по ID
 */
export function getSuccessorById(id: string): Successor | undefined {
  const successors = getSuccessors();
  return successors.find((s) => s.id === id);
}

/**
 * Создать нового преемника
 */
export function createSuccessor(
  successor: Omit<Successor, "id" | "assignedAt">
): Successor {
  const successors = getSuccessors();
  const newSuccessor: Successor = {
    ...successor,
    id: generateId("successor"),
    assignedAt: new Date().toISOString(),
  };
  successors.push(newSuccessor);
  saveToStorage(STORAGE_KEYS.SUCCESSORS, successors);

  // Пересчитываем риск для позиции
  updatePositionRisk(successor.positionId);

  return newSuccessor;
}

/**
 * Обновить преемника
 */
export function updateSuccessor(
  id: string,
  updates: Partial<Omit<Successor, "id" | "assignedAt">>
): Successor | null {
  const successors = getSuccessors();
  const index = successors.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const positionId = successors[index].positionId;
  successors[index] = {
    ...successors[index],
    ...updates,
  };
  saveToStorage(STORAGE_KEYS.SUCCESSORS, successors);

  // Пересчитываем риск для позиции, если изменилась готовность или статус
  if (updates.readinessLevel !== undefined || updates.status !== undefined) {
    updatePositionRisk(positionId);
  }

  return successors[index];
}

/**
 * Удалить преемника
 */
export function deleteSuccessor(id: string): boolean {
  const successors = getSuccessors();
  const index = successors.findIndex((s) => s.id === id);
  if (index === -1) return false;

  const positionId = successors[index].positionId;
  successors.splice(index, 1);
  saveToStorage(STORAGE_KEYS.SUCCESSORS, successors);

  // Также удаляем план развития, если есть
  const plans = getDevelopmentPlans();
  const filteredPlans = plans.filter((p) => p.successorId !== id);
  saveToStorage(STORAGE_KEYS.DEVELOPMENT_PLANS, filteredPlans);

  // Пересчитываем риск для позиции
  updatePositionRisk(positionId);

  return true;
}

/**
 * Обновить риск позиции на основе преемников
 */
function updatePositionRisk(positionId: string): void {
  const positions = getKeyPositions();
  const position = positions.find((p) => p.id === positionId);
  if (!position) return;

  const successors = getSuccessors();
  const posSuccessors = successors.filter((s) => s.positionId === positionId);
  const riskLevel = calculatePositionRisk(position.criticality, posSuccessors);

  const index = positions.findIndex((p) => p.id === positionId);
  if (index !== -1) {
    positions[index] = {
      ...positions[index],
      riskLevel,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.KEY_POSITIONS, positions);
  }
}

// === ПЛАНЫ РАЗВИТИЯ ===

/**
 * Получить все планы развития
 */
export function getDevelopmentPlans(): SuccessorDevelopmentPlan[] {
  return getFromStorage<SuccessorDevelopmentPlan[]>(
    STORAGE_KEYS.DEVELOPMENT_PLANS,
    []
  );
}

/**
 * Получить план развития по ID преемника
 */
export function getDevelopmentPlanBySuccessorId(
  successorId: string
): SuccessorDevelopmentPlan | undefined {
  const plans = getDevelopmentPlans();
  return plans.find((p) => p.successorId === successorId);
}

/**
 * Создать план развития
 */
export function createDevelopmentPlan(
  plan: Omit<SuccessorDevelopmentPlan, "id">
): SuccessorDevelopmentPlan {
  const plans = getDevelopmentPlans();
  const newPlan: SuccessorDevelopmentPlan = {
    ...plan,
    id: generateId("plan"),
  };
  plans.push(newPlan);
  saveToStorage(STORAGE_KEYS.DEVELOPMENT_PLANS, plans);
  return newPlan;
}

/**
 * Обновить план развития
 */
export function updateDevelopmentPlan(
  id: string,
  updates: Partial<Omit<SuccessorDevelopmentPlan, "id">>
): SuccessorDevelopmentPlan | null {
  const plans = getDevelopmentPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return null;

  plans[index] = {
    ...plans[index],
    ...updates,
  };
  saveToStorage(STORAGE_KEYS.DEVELOPMENT_PLANS, plans);
  return plans[index];
}

/**
 * Удалить план развития
 */
export function deleteDevelopmentPlan(id: string): boolean {
  const plans = getDevelopmentPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return false;

  plans.splice(index, 1);
  saveToStorage(STORAGE_KEYS.DEVELOPMENT_PLANS, plans);
  return true;
}

