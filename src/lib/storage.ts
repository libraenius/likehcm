/**
 * Абстракция для работы с localStorage с версионированием и обработкой ошибок
 */

import { STORAGE_KEYS, DATA_SCHEMA_VERSION, MAX_LOCALSTORAGE_SIZE } from "./constants";

// Реэкспортируем STORAGE_KEYS для удобства использования
export { STORAGE_KEYS, DATA_SCHEMA_VERSION, MAX_LOCALSTORAGE_SIZE };

export interface StorageError {
  code: "QUOTA_EXCEEDED" | "PARSE_ERROR" | "UNKNOWN";
  message: string;
  originalError?: unknown;
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
export function saveToStorage<T>(key: string, value: T): { success: boolean; error?: StorageError } {
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
    const storageError = error as DOMException;
    
    if (storageError.code === 22 || storageError.name === "QuotaExceededError") {
      return {
        success: false,
        error: {
          code: "QUOTA_EXCEEDED",
          message: "Недостаточно места в localStorage. Попробуйте удалить ненужные данные.",
          originalError: error,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: `Ошибка при сохранении данных: ${storageError.message}`,
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
export function migrateData(): { success: boolean; migrated: boolean } {
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
export function getStorageSize(): { used: number; total: number; percentage: number } {
  if (typeof window === "undefined") {
    return { used: 0, total: MAX_LOCALSTORAGE_SIZE, percentage: 0 };
  }

  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const item = localStorage.getItem(key);
      if (item) {
        total += new Blob([item]).size;
      }
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
export function importAppData(jsonData: string): { success: boolean; errors: string[] } {
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

