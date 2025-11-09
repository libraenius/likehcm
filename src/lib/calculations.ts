import type {
  UserProfile,
  CareerTrack,
  CareerTrackProgress,
  SkillGap,
  SkillLevel,
  ProfileCompetence,
} from "@/types";
import { getCompetenceById, getCareerTrackByProfileId } from "./reference-data";

/**
 * Вычисляет процент соответствия навыков пользователя профилю
 */
export function calculateProfileMatch(
  userSkills: Record<string, SkillLevel>,
  profileCompetences: ProfileCompetence[]
): number {
  if (profileCompetences.length === 0) return 0;

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const profileComp of profileCompetences) {
    const userLevel = userSkills[profileComp.competenceId] || 0;
    const requiredLevel = profileComp.requiredLevel;
    const weight = profileComp.weight;

    totalWeight += weight;

    // Вычисляем процент соответствия для этой компетенции
    const matchPercentage = Math.min(1, userLevel / requiredLevel);
    matchedWeight += matchPercentage * weight;
  }

  return totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
}

/**
 * Определяет текущий уровень в карьерном треке на основе навыков пользователя
 */
export function calculateCareerTrackProgress(
  userProfile: UserProfile,
  careerTrack: CareerTrack
): CareerTrackProgress {
  const userSkills: Record<string, SkillLevel> = {};
  userProfile.skills.forEach((skill) => {
    userSkills[skill.competenceId] = skill.selfAssessment;
  });

  // Находим максимальный достижимый уровень
  let currentLevel = 0;
  let maxMatchPercentage = 0;
  const skillGaps: SkillGap[] = [];

  for (const trackLevel of careerTrack.levels) {
    const levelGaps: SkillGap[] = [];
    let levelMatch = 0;
    let totalRequired = 0;

    // Вычисляем соответствие для каждого уровня
    for (const [competenceId, requiredLevel] of Object.entries(
      trackLevel.requiredSkills
    )) {
      const userLevel = userSkills[competenceId] || 0;
      const gap = Math.max(0, requiredLevel - userLevel);

      if (gap > 0) {
        levelGaps.push({
          competenceId,
          currentLevel: userLevel,
          requiredLevel,
          gap,
        });
      }

      levelMatch += Math.min(userLevel, requiredLevel);
      totalRequired += requiredLevel;
    }

    const matchPercentage =
      totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;

    // Проверяем, достижим ли этот уровень
    if (
      matchPercentage >= trackLevel.minMatchPercentage &&
      matchPercentage > maxMatchPercentage
    ) {
      currentLevel = trackLevel.level;
      maxMatchPercentage = matchPercentage;
      skillGaps.length = 0;
      skillGaps.push(...levelGaps);
    }
  }

  // Если не достигнут даже первый уровень, показываем прогресс к первому уровню
  if (currentLevel === 0 && careerTrack.levels.length > 0) {
    const firstLevel = careerTrack.levels[0];
    for (const [competenceId, requiredLevel] of Object.entries(
      firstLevel.requiredSkills
    )) {
      const userLevel = userSkills[competenceId] || 0;
      const gap = Math.max(0, requiredLevel - userLevel);

      if (gap > 0) {
        skillGaps.push({
          competenceId,
          currentLevel: userLevel,
          requiredLevel,
          gap,
        });
      }
    }

    let levelMatch = 0;
    let totalRequired = 0;
    for (const [competenceId, requiredLevel] of Object.entries(
      firstLevel.requiredSkills
    )) {
      const userLevel = userSkills[competenceId] || 0;
      levelMatch += Math.min(userLevel, requiredLevel);
      totalRequired += requiredLevel;
    }

    maxMatchPercentage =
      totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;
  }

  return {
    careerTrackId: careerTrack.id,
    currentLevel,
    matchPercentage: maxMatchPercentage,
    skillGaps,
  };
}

/**
 * Получает прогресс по карьерному треку для пользователя
 */
export function getUserCareerTrackProgress(
  userProfile: UserProfile
): CareerTrackProgress | null {
  if (!userProfile.mainProfileId) return null;

  const careerTrack = getCareerTrackByProfileId(userProfile.mainProfileId);
  if (!careerTrack) return null;

  return calculateCareerTrackProgress(userProfile, careerTrack);
}

