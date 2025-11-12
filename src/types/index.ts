// Типы для системы управления компетенциями

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
  tfr?: string; // Типовая функциональная роль
  requiredCompetences: ProfileCompetence[];
  levels?: ProfileLevel[];
  experts?: ProfileExpert[];
}

export interface ProfileExpert {
  avatar?: string;
  fullName: string;
  position: string;
}

export interface ProfileLevel {
  level: "trainee" | "junior" | "middle" | "senior" | "lead";
  name: string;
  description: string;
  responsibilities: string[]; // Типовые должностные обязанности
  requiredSkills: Record<string, SkillLevel>; // competenceId -> requiredLevel
}

export interface ProfileCompetence {
  competenceId: string;
  requiredLevel: SkillLevel;
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
  comment?: string;
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
  name: string; // Полное ФИО
  lastName: string;
  firstName: string;
  middleName?: string;
  position: string; // Должность
  email: string;
  mainProfileId: string;
  additionalProfileIds: string[];
  avatar?: string;
}

