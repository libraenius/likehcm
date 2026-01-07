// Типы для сервиса управления преемниками

import type { SkillLevel, ProfileCompetence, UserSkill } from "./index";

// Критичность позиции
export type PositionCriticality = "low" | "medium" | "high" | "critical";

// Уровень риска позиции
export type RiskLevel = "low" | "medium" | "high";

// Статус преемника
export type SuccessorStatus = "identified" | "developing" | "ready" | "not_ready";

// Ключевая позиция в организации
export interface KeyPosition {
  id: string;
  title: string; // Название должности
  departmentId: string; // ID подразделения
  departmentName?: string; // Название подразделения (для удобства)
  currentHolderId?: string; // ID текущего сотрудника
  currentHolderName?: string; // ФИО текущего сотрудника (для удобства)
  profileId: string; // Требуемый профиль
  profileName?: string; // Название профиля (для удобства)
  criticality: PositionCriticality; // Критичность позиции
  riskLevel: RiskLevel; // Уровень риска (на основе готовности преемников)
  description?: string;
  requiredCompetences: ProfileCompetence[]; // Требуемые компетенции
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Преемник на позицию
export interface Successor {
  id: string;
  positionId: string; // ID ключевой позиции
  employeeId: string; // ID сотрудника-преемника
  employeeName?: string; // ФИО сотрудника (для удобства)
  employeePosition?: string; // Должность сотрудника (для удобства)
  readinessLevel: 1 | 2 | 3 | 4 | 5; // Уровень готовности (1-5)
  readinessPercentage: number; // Процент готовности (0-100)
  status: SuccessorStatus; // Статус преемника
  developmentPlan?: string; // План развития
  estimatedReadinessDate?: string; // ISO date string - ожидаемая дата готовности
  notes?: string;
  assignedBy: string; // ID пользователя, назначившего преемника
  assignedAt: string; // ISO date string
  lastReviewedAt?: string; // ISO date string
  reviewedBy?: string;
  skillGaps?: SkillGap[]; // Разрывы в компетенциях
}

// Разрыв в компетенциях
export interface SkillGap {
  competenceId: string;
  competenceName?: string; // Название компетенции (для удобства)
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number; // Разница между требуемым и текущим уровнем
}

// Результат расчета готовности
export interface ReadinessCalculation {
  readinessLevel: 1 | 2 | 3 | 4 | 5;
  readinessPercentage: number;
  gaps: SkillGap[];
}

// План развития преемника
export interface SuccessorDevelopmentPlan {
  id: string;
  successorId: string;
  goals: DevelopmentGoal[];
  milestones: Milestone[];
  status: "draft" | "active" | "completed" | "cancelled";
  startDate: string; // ISO date string
  targetDate?: string; // ISO date string
  completedAt?: string; // ISO date string
}

// Цель развития
export interface DevelopmentGoal {
  id: string;
  competenceId: string; // Компетенция для развития
  competenceName?: string; // Название компетенции (для удобства)
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  activities: DevelopmentActivity[]; // Активности для развития
  status: "not_started" | "in_progress" | "completed";
}

// Активность развития
export interface DevelopmentActivity {
  id: string;
  type: "training" | "mentoring" | "project" | "rotation" | "certification";
  title: string;
  description?: string;
  status: "planned" | "in_progress" | "completed";
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  result?: string;
}

// Веха в плане развития
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string; // ISO date string
  status: "pending" | "completed";
  completedAt?: string; // ISO date string
}

// Статистика по преемникам
export interface SuccessionStatistics {
  totalPositions: number;
  positionsWithSuccessors: number;
  positionsWithoutSuccessors: number;
  totalSuccessors: number;
  readySuccessors: number;
  developingSuccessors: number;
  averageReadiness: number;
  highRiskPositions: number;
  mediumRiskPositions: number;
  lowRiskPositions: number;
}






