/**
 * Конфигурация приложения
 */

export const config = {
  app: {
    name: "SkillMap",
    version: "0.1.0",
    description: "Система управления компетенциями и карьерными треками",
  },
  storage: {
    maxSize: 5 * 1024 * 1024, // 5MB
    version: 1,
  },
  ui: {
    toastDuration: 5000,
    debounceDelay: 300,
    errorAlertTimeout: 5000,
  },
  features: {
    enableExport: true,
    enableImport: true,
    enableDataMigration: true,
  },
} as const;

