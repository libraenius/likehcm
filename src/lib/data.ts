import type {
  UserProfile,
  UserSkill,
} from "@/types";
import {
  getCompetences,
  getProfiles,
  getCareerTracks,
  getCompetenceById,
  getProfileById,
  getCareerTrackByProfileId,
} from "./reference-data";
import { getFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from "./storage";
import { userProfileSchema, safeValidate, getFirstError } from "./validation";
import { getUserCareerTrackProgress } from "./calculations";
import { DEFAULT_USER_PROFILE } from "./constants";

// Реэкспортируем функции из reference-data
export {
  getCompetenceById,
  getProfileById,
  getCareerTrackByProfileId,
  getCompetences,
  getProfiles,
  getCareerTracks,
};

/**
 * Получить профиль пользователя из localStorage
 * @returns Профиль пользователя или null если не найден
 */
export function getUserProfile(): UserProfile | null {
  const stored = getFromStorage<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
  
  if (!stored) return null;

  // Преобразуем строки дат обратно в объекты Date ДО валидации
  if (stored && typeof stored === 'object' && 'skills' in stored) {
    if (Array.isArray(stored.skills)) {
      stored.skills = stored.skills.map((skill: unknown): UserSkill => {
        if (skill && typeof skill === 'object' && 'lastUpdated' in skill) {
          const skillObj = skill as { lastUpdated: unknown; [key: string]: unknown };
          return {
            ...skillObj,
            // Преобразуем строку в Date, если это не уже Date объект
            lastUpdated: skillObj.lastUpdated instanceof Date 
              ? skillObj.lastUpdated 
              : typeof skillObj.lastUpdated === 'string'
              ? new Date(skillObj.lastUpdated)
              : skillObj.lastUpdated,
          } as UserSkill;
        }
        return skill as UserSkill;
      });
    }
  }

  // Валидация данных
  const validation = safeValidate(userProfileSchema, stored);
  if (!validation.success) {
    console.error("Invalid user profile data:", validation.errors);
    return null;
  }

  const profile = validation.data;

  // Убеждаемся, что skills всегда является массивом
  if (!profile.skills) {
    profile.skills = [];
  }

  return profile;
}

/**
 * Сохранить профиль пользователя в localStorage
 * @param profile - Профиль пользователя для сохранения
 * @returns Результат сохранения с информацией об ошибках
 */
export function saveUserProfile(profile: UserProfile): { success: boolean; error?: string } {
  // Валидация перед сохранением
  const validation = safeValidate(userProfileSchema, profile);
  if (!validation.success) {
    const firstError = getFirstError(validation.errors);
    return { success: false, error: firstError };
  }

  const result = saveToStorage(STORAGE_KEYS.USER_PROFILE, validation.data);
  
  if (!result.success && result.error) {
    return { success: false, error: result.error.message };
  }

  return { success: true };
}

/**
 * Сбросить профиль пользователя
 */
export function resetUserProfile(): boolean {
  return removeFromStorage(STORAGE_KEYS.USER_PROFILE);
}

/**
 * Создать профиль пользователя с дефолтными значениями
 * @param overrides - Переопределения для дефолтных значений
 * @returns Профиль пользователя с дефолтными значениями
 */
export function createDefaultUserProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    userId: DEFAULT_USER_PROFILE.userId,
    lastName: DEFAULT_USER_PROFILE.lastName,
    firstName: DEFAULT_USER_PROFILE.firstName,
    middleName: DEFAULT_USER_PROFILE.middleName,
    grade: DEFAULT_USER_PROFILE.grade,
    position: DEFAULT_USER_PROFILE.position,
    linearStructure: DEFAULT_USER_PROFILE.linearStructure,
    agileRoles: [...DEFAULT_USER_PROFILE.agileRoles],
    mainProfileId: DEFAULT_USER_PROFILE.mainProfileId,
    additionalProfileIds: [],
    skills: [],
    email: DEFAULT_USER_PROFILE.email,
    phone: DEFAULT_USER_PROFILE.phone,
    ...overrides,
  };
}

/**
 * Обновить профиль пользователя данными из оценки (assessment)
 * Пересчитывает прогресс карьерного трека на основе текущих навыков
 * @returns Результат обновления с информацией об ошибках
 */
export function updateProfileWithAssessmentData(): { success: boolean; error?: string } {
  const profile = getUserProfile();
  if (!profile) {
    return { success: false, error: "Профиль пользователя не найден" };
  }

  // Вычисляем прогресс карьерного трека на основе текущих навыков
  const careerTrackProgress = getUserCareerTrackProgress(profile);

  // Обновляем профиль с новым прогрессом
  const updatedProfile: UserProfile = {
    ...profile,
    careerTrackProgress: careerTrackProgress || undefined,
  };

  // Сохраняем обновленный профиль
  return saveUserProfile(updatedProfile);
}