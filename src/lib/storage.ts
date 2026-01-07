/**
 * Абстракция для работы с localStorage с версионированием и обработкой ошибок
 */

import { STORAGE_KEYS, DATA_SCHEMA_VERSION, MAX_LOCALSTORAGE_SIZE } from "./constants";

// Реэкспортируем STORAGE_KEYS для удобства использования
export { STORAGE_KEYS, DATA_SCHEMA_VERSION, MAX_LOCALSTORAGE_SIZE };

/**
 * Типы ошибок хранилища
 */
export type StorageErrorCode = "QUOTA_EXCEEDED" | "PARSE_ERROR" | "UNKNOWN";

/**
 * Интерфейс ошибки хранилища
 */
export interface StorageError {
  code: StorageErrorCode;
  message: string;
  originalError?: unknown;
}

/**
 * Результат операции сохранения
 */
export interface SaveResult {
  success: boolean;
  error?: StorageError;
}

/**
 * Результат операции миграции
 */
export interface MigrationResult {
  success: boolean;
  migrated: boolean;
}

/**
 * Результат операции импорта
 */
export interface ImportResult {
  success: boolean;
  errors: string[];
}

/**
 * Информация о размере хранилища
 */
export interface StorageSize {
  used: number;
  total: number;
  percentage: number;
}

/**
 * Получить данные из localStorage с обработкой ошибок
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }

    const parsed = JSON.parse(item);
    return parsed as T;
  } catch (error) {
    console.error(`Failed to parse data from localStorage key "${key}":`, error);
    // Возвращаем значение по умолчанию при ошибке парсинга
    return defaultValue;
  }
}

/**
 * Сохранить данные в localStorage с обработкой ошибок
 */
export function saveToStorage<T>(key: string, value: T): SaveResult {
  if (typeof window === "undefined") {
    return { success: false, error: { code: "UNKNOWN", message: "localStorage недоступен" } };
  }

  try {
    const serialized = JSON.stringify(value);
    
    // Проверяем размер данных
    const size = new Blob([serialized]).size;
    if (size > MAX_LOCALSTORAGE_SIZE) {
      return {
        success: false,
        error: {
          code: "QUOTA_EXCEEDED",
          message: `Данные слишком большие (${(size / 1024 / 1024).toFixed(2)}MB). Максимальный размер: ${(MAX_LOCALSTORAGE_SIZE / 1024 / 1024).toFixed(2)}MB`,
        },
      };
    }

    localStorage.setItem(key, serialized);
    return { success: true };
  } catch (error) {
    // Проверяем, является ли ошибка DOMException с кодом QuotaExceededError
    const isQuotaExceeded = 
      error instanceof DOMException &&
      (error.code === 22 || error.name === "QuotaExceededError");
    
    if (isQuotaExceeded) {
      return {
        success: false,
        error: {
          code: "QUOTA_EXCEEDED",
          message: "Недостаточно места в localStorage. Попробуйте удалить ненужные данные.",
          originalError: error,
        },
      };
    }

    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: `Ошибка при сохранении данных: ${errorMessage}`,
        originalError: error,
      },
    };
  }
}

/**
 * Удалить данные из localStorage
 */
export function removeFromStorage(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove data from localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Очистить все данные приложения из localStorage
 */
export function clearAppStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to clear storage key "${key}":`, error);
    }
  });
}

/**
 * Получить версию схемы данных
 */
export function getDataVersion(): number {
  return getFromStorage<number>(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
}

/**
 * Установить версию схемы данных
 */
export function setDataVersion(version: number): boolean {
  const result = saveToStorage(STORAGE_KEYS.DATA_VERSION, version);
  return result.success;
}

/**
 * Проверить, нужна ли миграция данных
 */
export function needsMigration(): boolean {
  const currentVersion = getDataVersion();
  return currentVersion < DATA_SCHEMA_VERSION;
}

/**
 * Выполнить миграцию данных (базовая версия)
 */
export function migrateData(): MigrationResult {
  if (!needsMigration()) {
    return { success: true, migrated: false };
  }

  try {
    // Здесь можно добавить логику миграции при изменении схемы данных
    // Например, преобразование старых форматов в новые
    
    setDataVersion(DATA_SCHEMA_VERSION);
    return { success: true, migrated: true };
  } catch (error) {
    console.error("Data migration failed:", error);
    return { success: false, migrated: false };
  }
}

/**
 * Получить размер используемого localStorage
 */
export function getStorageSize(): StorageSize {
  if (typeof window === "undefined") {
    return { used: 0, total: MAX_LOCALSTORAGE_SIZE, percentage: 0 };
  }

  let total = 0;
  // Используем Object.keys для более безопасного итератора
  for (const key of Object.keys(localStorage)) {
    const item = localStorage.getItem(key);
    if (item) {
      total += new Blob([item]).size;
    }
  }

  return {
    used: total,
    total: MAX_LOCALSTORAGE_SIZE,
    percentage: (total / MAX_LOCALSTORAGE_SIZE) * 100,
  };
}

/**
 * Экспорт всех данных приложения
 */
export function exportAppData(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const data: Record<string, unknown> = {};
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const value = localStorage.getItem(storageKey);
      if (value) {
        data[key] = JSON.parse(value);
      }
    });

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Failed to export app data:", error);
    return null;
  }
}

/**
 * Импорт данных приложения
 */
export function importAppData(jsonData: string): ImportResult {
  if (typeof window === "undefined") {
    return { success: false, errors: ["localStorage недоступен"] };
  }

  const errors: string[] = [];

  try {
    const data = JSON.parse(jsonData);

    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key in data) {
        const result = saveToStorage(storageKey, data[key]);
        if (!result.success && result.error) {
          errors.push(`Ошибка при импорте ${key}: ${result.error.message}`);
        }
      }
    });

    // Обновляем версию данных
    setDataVersion(DATA_SCHEMA_VERSION);

    return {
      success: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Ошибка парсинга JSON: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`],
    };
  }
}

