/**
 * Схемы валидации с использованием Zod
 */

import { z } from "zod";

// Валидация уровня навыка
export const skillLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

// Валидация типа компетенции
export const competenceTypeSchema = z.enum([
  "профессиональные компетенции",
  "корпоративные компетенции",
]);

// Валидация уровня профиля
export const profileLevelTypeSchema = z.enum([
  "trainee",
  "junior",
  "middle",
  "senior",
  "lead",
]);

// Валидация ресурса
export const resourceItemSchema = z.object({
  name: z.string().min(1, "Название не может быть пустым"),
  level: skillLevelSchema,
});

// Валидация ресурсов
export const resourcesSchema = z.object({
  literature: z.array(resourceItemSchema).optional(),
  videos: z.array(resourceItemSchema).optional(),
  courses: z.array(resourceItemSchema).optional(),
});

// Валидация уровней компетенции
export const competenceLevelsSchema = z.object({
  level1: z.string().min(1, "Уровень 1 обязателен"),
  level2: z.string().min(1, "Уровень 2 обязателен"),
  level3: z.string().min(1, "Уровень 3 обязателен"),
  level4: z.string().min(1, "Уровень 4 обязателен"),
  level5: z.string().min(1, "Уровень 5 обязателен"),
});

// Валидация компетенции
export const competenceSchema = z.object({
  id: z.string().min(1, "ID обязателен"),
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  type: competenceTypeSchema,
  levels: competenceLevelsSchema,
  resources: resourcesSchema.optional(),
});

// Валидация компетенции профиля
export const profileCompetenceSchema = z.object({
  competenceId: z.string().min(1, "ID компетенции обязателен"),
  requiredLevel: skillLevelSchema,
});

// Валидация эксперта профиля
export const profileExpertSchema = z.object({
  avatar: z.string().url().optional().or(z.literal("")),
  fullName: z.string().min(1, "ФИО обязательно"),
  position: z.string().min(1, "Должность обязательна"),
});

// Валидация уровня профиля
export const profileLevelSchema = z.object({
  level: profileLevelTypeSchema,
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  responsibilities: z.array(z.string().min(1)).min(1, "Добавьте хотя бы одну обязанность"),
  education: z.string().optional(),
  experience: z.string().optional(),
  requiredSkills: z.record(z.string(), skillLevelSchema),
});

// Валидация профиля
export const profileSchema = z.object({
  id: z.string().min(1, "ID обязателен"),
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  tfr: z.string().optional(),
  requiredCompetences: z
    .array(profileCompetenceSchema)
    .min(1, "Добавьте хотя бы одну компетенцию"),
  levels: z.array(profileLevelSchema).optional(),
  experts: z.array(profileExpertSchema).optional(),
});

// Валидация уровня карьерного трека
export const careerTrackLevelSchema = z.object({
  level: z.number().int().positive(),
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  requiredSkills: z.record(z.string(), skillLevelSchema),
  minMatchPercentage: z.number().min(0).max(100),
});

// Валидация карьерного трека
export const careerTrackSchema = z.object({
  id: z.string().min(1, "ID обязателен"),
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  profileId: z.string().min(1, "ID профиля обязателен"),
  levels: z.array(careerTrackLevelSchema).min(1, "Добавьте хотя бы один уровень"),
});

// Валидация навыка пользователя
export const userSkillSchema = z.object({
  competenceId: z.string().min(1, "ID компетенции обязателен"),
  selfAssessment: skillLevelSchema,
  lastUpdated: z.coerce.date(), // Автоматически преобразует строки в Date
  comment: z.string().optional(),
});

// Валидация прогресса карьерного трека
export const careerTrackProgressSchema = z.object({
  careerTrackId: z.string().min(1),
  currentLevel: z.number().int().nonnegative(),
  matchPercentage: z.number().min(0).max(100),
  skillGaps: z.array(
    z.object({
      competenceId: z.string(),
      currentLevel: skillLevelSchema,
      requiredLevel: skillLevelSchema,
      gap: z.number().nonnegative(),
    })
  ),
});

// Валидация профиля пользователя
export const userProfileSchema = z.object({
  userId: z.string().min(1, "ID пользователя обязателен"),
  mainProfileId: z.string().optional(),
  additionalProfileIds: z.array(z.string()).optional(),
  skills: z.array(userSkillSchema),
  careerTrackProgress: careerTrackProgressSchema.optional(),
});

// Валидация члена команды
export const teamMemberSchema = z.object({
  id: z.string().min(1, "ID обязателен"),
  name: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  middleName: z.string().optional(),
  position: z.string().min(1, "Должность обязательна"),
  email: z.string().email("Некорректный email"),
  mainProfileId: z.string().min(1, "Основной профиль обязателен"),
  additionalProfileIds: z.array(z.string()).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

// Функция для безопасной валидации с обработкой ошибок
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Функция для получения первой ошибки валидации
export function getFirstError(errors: z.ZodError): string {
  const firstError = errors.errors[0];
  return firstError?.message || "Ошибка валидации";
}

// Функция для получения всех ошибок валидации
export function getAllErrors(errors: z.ZodError): string[] {
  return errors.errors.map((err) => err.message);
}

