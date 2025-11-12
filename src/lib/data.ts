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

// Реэкспортируем функции из reference-data
export {
  getCompetenceById,
  getProfileById,
  getCareerTrackByProfileId,
  getCompetences,
  getProfiles,
  getCareerTracks,
};


// Функции для работы с данными пользователя
export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("userProfile");
    if (!stored) return null;
    const profile = JSON.parse(stored);
    // Убеждаемся, что skills всегда является массивом
    if (!profile.skills) {
      profile.skills = [];
    }
    // Преобразуем строки дат обратно в объекты Date
    if (profile.skills && Array.isArray(profile.skills)) {
      profile.skills = profile.skills.map((skill: any) => ({
        ...skill,
        lastUpdated: skill.lastUpdated ? new Date(skill.lastUpdated) : new Date(),
      }));
    }
    return profile;
  } catch (e) {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("userProfile", JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save user profile:", e);
  }
}

export function resetUserProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("userProfile");
  } catch (e) {
    console.error("Failed to reset user profile:", e);
  }
}