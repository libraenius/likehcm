/**
 * Моковые данные для сервиса преемников
 */

import type { KeyPosition, Successor } from "@/types/succession";

/**
 * Моковые данные ключевых позиций
 */
export const mockKeyPositions: Omit<KeyPosition, "createdAt" | "updatedAt" | "riskLevel">[] = [
  {
    id: "position-1",
    title: "Руководитель разработки",
    departmentId: "dept-1",
    departmentName: "Департамент автоматизации внутренних сервисов",
    currentHolderId: "member-5",
    currentHolderName: "Помыткин Сергей Олегович",
    profileId: "profile-1",
    profileName: "Разработчик Perl",
    criticality: "critical",
    description: "Ключевая позиция, отвечающая за техническое направление разработки",
    requiredCompetences: [
      { competenceId: "comp-17", requiredLevel: 5 }, // Perl
      { competenceId: "comp-6", requiredLevel: 5 }, // Архитектура
      { competenceId: "comp-11", requiredLevel: 5 }, // Лидерство
      { competenceId: "comp-9", requiredLevel: 5 }, // Коммуникация
    ],
  },
  {
    id: "position-2",
    title: "Главный инженер",
    departmentId: "dept-2",
    departmentName: "Управление развития общекорпоративных систем",
    currentHolderId: "member-1",
    currentHolderName: "Петров Иван Сергеевич",
    profileId: "profile-1",
    profileName: "Разработчик Perl",
    criticality: "high",
    description: "Руководство техническими решениями и архитектурой систем",
    requiredCompetences: [
      { competenceId: "comp-17", requiredLevel: 4 }, // Perl
      { competenceId: "comp-6", requiredLevel: 4 }, // Архитектура
      { competenceId: "comp-11", requiredLevel: 4 }, // Лидерство
    ],
  },
  {
    id: "position-3",
    title: "Ведущий разработчик",
    departmentId: "dept-2",
    departmentName: "Управление развития общекорпоративных систем",
    currentHolderId: "member-2",
    currentHolderName: "Сидорова Мария Александровна",
    profileId: "profile-2",
    profileName: "Инженер по автотестированию",
    criticality: "medium",
    description: "Экспертный уровень разработки и менторинг команды",
    requiredCompetences: [
      { competenceId: "comp-20", requiredLevel: 4 }, // Автотестирование
      { competenceId: "comp-7", requiredLevel: 4 }, // Тестирование
      { competenceId: "comp-11", requiredLevel: 3 }, // Лидерство
    ],
  },
  {
    id: "position-4",
    title: "Руководитель отдела качества",
    departmentId: "dept-5",
    departmentName: "Управление качества и тестирования",
    currentHolderId: undefined,
    currentHolderName: undefined,
    profileId: "profile-4",
    profileName: "QA инженер",
    criticality: "high",
    description: "Управление отделом тестирования и обеспечение качества",
    requiredCompetences: [
      { competenceId: "comp-21", requiredLevel: 5 }, // Ручное тестирование
      { competenceId: "comp-20", requiredLevel: 4 }, // Автотестирование
      { competenceId: "comp-11", requiredLevel: 5 }, // Лидерство
      { competenceId: "comp-9", requiredLevel: 4 }, // Коммуникация
    ],
  },
  {
    id: "position-5",
    title: "Старший бизнес-аналитик",
    departmentId: "dept-2",
    departmentName: "Управление развития общекорпоративных систем",
    currentHolderId: undefined,
    currentHolderName: undefined,
    profileId: "profile-7",
    profileName: "Бизнес-аналитик",
    criticality: "medium",
    description: "Анализ бизнес-процессов и управление требованиями",
    requiredCompetences: [
      { competenceId: "comp-47", requiredLevel: 4 }, // Работа с требованиями
      { competenceId: "comp-48", requiredLevel: 4 }, // UML и моделирование
      { competenceId: "comp-50", requiredLevel: 4 }, // Управление заинтересованными сторонами
      { competenceId: "comp-23", requiredLevel: 4 }, // Понимание бизнеса
    ],
  },
];

/**
 * Моковые данные преемников
 */
export const mockSuccessors: Omit<Successor, "assignedAt">[] = [
  {
    id: "successor-1",
    positionId: "position-1",
    employeeId: "member-1",
    employeeName: "Петров Иван Сергеевич",
    employeePosition: "Главный инженер",
    readinessLevel: 4,
    readinessPercentage: 85,
    status: "developing",
    notes: "Требуется развитие лидерских компетенций и стратегического мышления",
    estimatedReadinessDate: "2025-12-31",
    assignedBy: "system",
    skillGaps: [
      {
        competenceId: "comp-11",
        competenceName: "Лидерство",
        currentLevel: 4,
        requiredLevel: 5,
        gap: 1,
      },
    ],
  },
  {
    id: "successor-2",
    positionId: "position-1",
    employeeId: "member-2",
    employeeName: "Сидорова Мария Александровна",
    employeePosition: "Ведущий разработчик",
    readinessLevel: 3,
    readinessPercentage: 70,
    status: "developing",
    notes: "Хорошие технические навыки, требуется опыт управления командой",
    estimatedReadinessDate: "2026-06-30",
    assignedBy: "system",
    skillGaps: [
      {
        competenceId: "comp-17",
        competenceName: "Perl",
        currentLevel: 3,
        requiredLevel: 5,
        gap: 2,
      },
      {
        competenceId: "comp-11",
        competenceName: "Лидерство",
        currentLevel: 2,
        requiredLevel: 5,
        gap: 3,
      },
    ],
  },
  {
    id: "successor-3",
    positionId: "position-2",
    employeeId: "member-3",
    employeeName: "Иванов Алексей Дмитриевич",
    employeePosition: "Старший разработчик",
    readinessLevel: 4,
    readinessPercentage: 80,
    status: "ready",
    notes: "Готов к переходу на позицию главного инженера",
    estimatedReadinessDate: "2025-09-30",
    assignedBy: "system",
    skillGaps: [],
  },
  {
    id: "successor-4",
    positionId: "position-3",
    employeeId: "member-4",
    employeeName: "Смирнова Елена Викторовна",
    employeePosition: "QA инженер",
    readinessLevel: 3,
    readinessPercentage: 65,
    status: "developing",
    notes: "Развитие навыков автоматизации тестирования",
    estimatedReadinessDate: "2026-03-31",
    assignedBy: "system",
    skillGaps: [
      {
        competenceId: "comp-20",
        competenceName: "Автотестирование",
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
      },
    ],
  },
  {
    id: "successor-5",
    positionId: "position-4",
    employeeId: "member-2",
    employeeName: "Сидорова Мария Александровна",
    employeePosition: "Ведущий разработчик",
    readinessLevel: 5,
    readinessPercentage: 95,
    status: "ready",
    notes: "Полностью готова к руководству отделом качества",
    estimatedReadinessDate: "2025-08-31",
    assignedBy: "system",
    skillGaps: [],
  },
  {
    id: "successor-6",
    positionId: "position-5",
    employeeId: "member-1",
    employeeName: "Петров Иван Сергеевич",
    employeePosition: "Главный инженер",
    readinessLevel: 2,
    readinessPercentage: 45,
    status: "not_ready",
    notes: "Требуется значительное развитие бизнес-аналитических компетенций",
    estimatedReadinessDate: "2027-12-31",
    assignedBy: "system",
    skillGaps: [
      {
        competenceId: "comp-47",
        competenceName: "Работа с требованиями",
        currentLevel: 1,
        requiredLevel: 4,
        gap: 3,
      },
      {
        competenceId: "comp-48",
        competenceName: "UML и моделирование процессов",
        currentLevel: 1,
        requiredLevel: 4,
        gap: 3,
      },
      {
        competenceId: "comp-50",
        competenceName: "Управление заинтересованными сторонами",
        currentLevel: 2,
        requiredLevel: 4,
        gap: 2,
      },
    ],
  },
];








