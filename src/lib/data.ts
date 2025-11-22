import type {
  UserProfile,
  UserSkill,
  SkillLevel,
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
 * Обновить профиль пользователя с тестовыми данными по оценке
 * Создает 3 оценочные процедуры с разными датами
 */
export function updateProfileWithAssessmentData(): { success: boolean; error?: string } {
  const currentProfile = getUserProfile();
  
  if (!currentProfile) {
    return { success: false, error: "Профиль пользователя не найден" };
  }

  const profile = getProfileById(currentProfile.mainProfileId || "profile-1");
  if (!profile) {
    return { success: false, error: "Профиль не найден" };
  }

  // Получаем компетенции профиля
  const profileCompetences = profile.requiredCompetences;
  
  if (profileCompetences.length === 0) {
    return { success: false, error: "У профиля нет компетенций" };
  }

  // Создаем 3 оценочные процедуры с разными датами
  const now = new Date();
  const procedure1Date = new Date(now);
  procedure1Date.setDate(now.getDate() - 5); // 5 дней назад
  
  const procedure2Date = new Date(now);
  procedure2Date.setDate(now.getDate() - 15); // 15 дней назад
  
  const procedure3Date = new Date(now);
  procedure3Date.setDate(now.getDate() - 30); // 30 дней назад

  // Первая процедура - оценены все компетенции
  const procedure1Skills: UserSkill[] = profileCompetences.map((comp, index) => ({
    competenceId: comp.competenceId,
    selfAssessment: Math.min(5, Math.max(1, comp.requiredLevel + Math.floor(Math.random() * 2) - 1)) as SkillLevel,
    lastUpdated: procedure1Date,
    comment: index % 3 === 0 ? "Хорошее понимание материала" : undefined,
  }));

  // Вторая процедура - оценены 80% компетенций
  const procedure2Skills: UserSkill[] = profileCompetences
    .slice(0, Math.floor(profileCompetences.length * 0.8))
    .map((comp, index) => ({
      competenceId: comp.competenceId,
      selfAssessment: Math.min(5, Math.max(1, comp.requiredLevel - 1 + Math.floor(Math.random() * 2))) as SkillLevel,
      lastUpdated: procedure2Date,
      comment: index % 4 === 0 ? "Требуется дополнительное изучение" : undefined,
    }));

  // Третья процедура - оценены 60% компетенций
  const procedure3Skills: UserSkill[] = profileCompetences
    .slice(0, Math.floor(profileCompetences.length * 0.6))
    .map((comp, index) => ({
      competenceId: comp.competenceId,
      selfAssessment: Math.min(5, Math.max(1, comp.requiredLevel - 1)) as SkillLevel,
      lastUpdated: procedure3Date,
    }));

  // Объединяем все навыки, оставляя только последние оценки для каждой компетенции
  const allSkills = [...procedure1Skills, ...procedure2Skills, ...procedure3Skills];
  const skillsMap = new Map<string, UserSkill>();
  
  // Сортируем по дате (новые первыми) и оставляем последнюю оценку для каждой компетенции
  allSkills.sort((a, b) => {
    const dateA = a.lastUpdated instanceof Date ? a.lastUpdated : new Date(a.lastUpdated);
    const dateB = b.lastUpdated instanceof Date ? b.lastUpdated : new Date(b.lastUpdated);
    return dateB.getTime() - dateA.getTime();
  });

  allSkills.forEach((skill) => {
    if (!skillsMap.has(skill.competenceId)) {
      skillsMap.set(skill.competenceId, skill);
    }
  });

  // Обновляем профиль
  const updatedProfile: UserProfile = {
    ...currentProfile,
    skills: Array.from(skillsMap.values()),
  };

  return saveUserProfile(updatedProfile);
}