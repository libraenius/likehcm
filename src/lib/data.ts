import type {
  UserProfile,
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
import { userProfileSchema, safeValidate } from "./validation";

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
      stored.skills = stored.skills.map((skill: unknown) => {
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
          };
        }
        return skill;
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
    const firstError = validation.errors.errors[0]?.message || "Ошибка валидации";
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