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
 * Вычисляет процент соответствия компетенций пользователя профилю
 */
export function calculateProfileMatch(
  userSkills: Record<string, SkillLevel>,
  profileCompetences: ProfileCompetence[]
): number {
  if (profileCompetences.length === 0) return 0;

  let totalMatch = 0;

  for (const profileComp of profileCompetences) {
    const userLevel = userSkills[profileComp.competenceId] || 0;
    const requiredLevel = profileComp.requiredLevel;

    // Вычисляем процент соответствия для этой компетенции
    const matchPercentage = Math.min(1, userLevel / requiredLevel);
    totalMatch += matchPercentage;
  }

  return Math.round((totalMatch / profileCompetences.length) * 100);
}

/**
 * Определяет текущий уровень в карьерном треке на основе компетенций пользователя
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
  // Сортируем уровни по убыванию (от высшего к низшему)
  const sortedLevels = [...careerTrack.levels].sort((a, b) => b.level - a.level);
  
  let currentLevel = 0;
  let maxMatchPercentage = 0;
  const skillGaps: SkillGap[] = [];

  // Ищем максимальный достижимый уровень (от высшего к низшему)
  for (const trackLevel of sortedLevels) {
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
    // Выбираем первый (самый высокий) уровень, который достигнут
    if (matchPercentage >= trackLevel.minMatchPercentage) {
      currentLevel = trackLevel.level;
      maxMatchPercentage = matchPercentage;
      skillGaps.length = 0;
      skillGaps.push(...levelGaps);
      break; // Нашли максимальный достижимый уровень, выходим
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

