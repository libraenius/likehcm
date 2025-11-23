/**
 * Константы для системы управления компетенциями
 */

export const PROFILE_LEVEL_NAMES = {
  trainee: "Стажер",
  junior: "Младший",
  middle: "Средний",
  senior: "Старший",
  lead: "Ведущий",
} as const;

export const PROFILE_LEVEL_COLORS = {
  trainee: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  junior: "bg-slate-200 text-slate-700 border-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600",
  middle: "bg-slate-300 text-slate-800 border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500",
  senior: "bg-slate-400 text-slate-900 border-slate-600 dark:bg-slate-500 dark:text-slate-100 dark:border-slate-400",
  lead: "bg-slate-500 text-slate-950 border-slate-700 dark:bg-slate-400 dark:text-slate-50 dark:border-slate-300",
} as const;

export const PROFILE_LEVEL_GRADIENT_COLORS = {
  trainee: "bg-gradient-to-r from-slate-100 to-slate-200 text-black border-slate-300 dark:from-slate-700 dark:to-slate-800 dark:text-white",
  junior: "bg-gradient-to-r from-slate-200 to-slate-300 text-black border-slate-400 dark:from-slate-600 dark:to-slate-700 dark:text-white",
  middle: "bg-gradient-to-r from-slate-300 to-slate-400 text-black border-slate-500 dark:from-slate-500 dark:to-slate-600 dark:text-white",
  senior: "bg-gradient-to-r from-slate-400 to-slate-500 text-black border-slate-600 dark:from-slate-400 dark:to-slate-500 dark:text-white",
  lead: "bg-gradient-to-r from-slate-500 to-slate-600 text-black border-slate-700 dark:from-slate-300 dark:to-slate-400 dark:text-white",
} as const;

export const COMPETENCE_TYPE_COLORS = {
  "профессиональные компетенции": "bg-purple-50 text-purple-700 border-purple-300",
  "корпоративные компетенции": "bg-cyan-50 text-cyan-700 border-cyan-300",
} as const;

// Ключи для localStorage
export const STORAGE_KEYS = {
  COMPETENCES: "skillmap_competences",
  PROFILES: "skillmap_profiles",
  CAREER_TRACKS: "skillmap_career_tracks",
  USER_PROFILE: "userProfile",
  DATA_VERSION: "skillmap_data_version",
} as const;

// Версия схемы данных
export const DATA_SCHEMA_VERSION = 1;

// Лимиты
export const MAX_LOCALSTORAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Дефолтные значения профиля пользователя
export const DEFAULT_USER_PROFILE = {
  userId: "user-1",
  lastName: "Помыткин",
  firstName: "Сергей",
  middleName: "Олегович",
  grade: 12,
  position: "Руководитель экспертизы по тестированию",
  linearStructure: "ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем",
  agileRoles: [{ role: "Разработчик" }] as const,
  mainProfileId: "profile-1",
  email: "latarho@gmail.com",
  phone: "8-999-555-5555",
} as const;

