// Типы для системы управления компетенциями

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type AssessmentRole = "самооценка" | "руководитель" | "коллега" | "подчиненный";

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
  education?: string; // Требования к образованию
  bankExperience?: string; // Требования к стажу работы в банке
  externalExperience?: string; // Требования к стажу работы на внешнем рынке
  requiredSkills: Record<string, SkillLevel>; // competenceId -> requiredLevel
  taskExamples?: string[]; // Примеры задач уровня сложности (3 задачи)
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
  role?: AssessmentRole; // Роль в оценочной процедуре
}

export interface AgileRole {
  role: string; // Agile роль
  stream?: string; // Стрим
  team?: string; // Команда
  workload?: number; // Занятость в процентах (целое число)
}

export interface UserProfile {
  userId: string;
  lastName?: string; // Фамилия
  firstName?: string; // Имя
  middleName?: string; // Отчество
  grade?: number; // Грейд (от 1 до 17)
  position?: string; // Должность
  linearStructure?: string; // Линейная структура
  agileRoles?: AgileRole[]; // Agile роли со стримами/командами
  agileProject?: string; // Agile проект
  mainProfileId?: string;
  additionalProfileIds?: string[];
  skills: UserSkill[];
  careerTrackProgress?: CareerTrackProgress;
  avatar?: string; // URL или base64 data URL фотографии
  tags?: string[]; // Теги пользователя
  email?: string; // Email
  phone?: string; // Телефон
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

