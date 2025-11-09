// Типы для системы управления навыками

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Competence {
  id: string;
  name: string;
  description: string;
  type: "профессиональные компетенции" | "корпоративные компетенции";
  levels: {
    level1: string; // Начальный уровень
    level2: string; // Базовый уровень
    level3: string; // Средний уровень
    level4: string; // Продвинутый уровень
    level5: string; // Экспертный уровень
  };
  resources?: {
    literature: Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>; // Литература
    videos: Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>; // Видео
    courses: Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>; // Курсы
  };
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  requiredCompetences: ProfileCompetence[];
}

export interface ProfileCompetence {
  competenceId: string;
  requiredLevel: SkillLevel;
  weight: number; // Вес компетенции в профиле (1-10)
}

export interface CareerTrack {
  id: string;
  name: string;
  description: string;
  profileId: string;
  levels: CareerTrackLevel[];
}

export interface CareerTrackLevel {
  level: number;
  name: string;
  description: string;
  requiredSkills: Record<string, SkillLevel>; // competenceId -> requiredLevel
  minMatchPercentage: number; // Минимальный процент соответствия для достижения уровня
}

export interface UserSkill {
  competenceId: string;
  selfAssessment: SkillLevel;
  lastUpdated: Date;
}

export interface UserProfile {
  userId: string;
  mainProfileId: string;
  additionalProfileIds: string[];
  skills: UserSkill[];
  careerTrackProgress?: CareerTrackProgress;
}

export interface CareerTrackProgress {
  careerTrackId: string;
  currentLevel: number;
  matchPercentage: number;
  skillGaps: SkillGap[];
}

export interface SkillGap {
  competenceId: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  mainProfileId: string;
  additionalProfileIds: string[];
  avatar?: string;
}

