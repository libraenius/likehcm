// Моковые данные для ИПР

export type IDPType = "assessment" | "career" | "adaptation" | "competency" | "new-role";
export type IDPScenario = "classic" | "one-to-one";

export interface Competency {
  id: string;
  name: string;
  category: string;
}

export interface Assessment {
  id: string;
  name: string;
  date: Date;
  type: string;
}

export interface IDPGoal {
  id: string;
  competencyId: string;
  title: string;
  description?: string;
  status: "not-started" | "in-progress" | "completed" | "cancelled";
  targetDate?: Date;
  completedDate?: Date;
  actions: IDPAction[];
}

export interface IDPAction {
  id: string;
  title: string;
  description?: string;
  status: "not-started" | "in-progress" | "completed" | "cancelled";
  targetDate?: Date;
  completedDate?: Date;
}

export interface IDP {
  id: string;
  title: string;
  description?: string;
  type: IDPType;
  scenario: IDPScenario;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  employeeEmail: string;
  managerId: string;
  managerName: string;
  startDate: Date;
  endDate: Date;
  status: "draft" | "in-progress" | "completed" | "cancelled" | "pending-approval";
  competencyIds: string[];
  assessmentId?: string;
  isVisible: boolean;
  goals: IDPGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export const mockCompetencies: Competency[] = [
  { id: "comp-1", name: "Лидерство", category: "Управленческие" },
  { id: "comp-2", name: "Стратегическое мышление", category: "Управленческие" },
  { id: "comp-3", name: "Управление командой", category: "Управленческие" },
  { id: "comp-4", name: "Принятие решений", category: "Управленческие" },
  { id: "comp-5", name: "Коммуникация", category: "Личностные" },
  { id: "comp-6", name: "Эмоциональный интеллект", category: "Личностные" },
  { id: "comp-7", name: "Адаптивность", category: "Личностные" },
  { id: "comp-8", name: "Работа в команде", category: "Личностные" },
  { id: "comp-9", name: "JavaScript/TypeScript", category: "Технические" },
  { id: "comp-10", name: "React/Next.js", category: "Технические" },
  { id: "comp-11", name: "Архитектура ПО", category: "Технические" },
  { id: "comp-12", name: "DevOps практики", category: "Технические" },
  { id: "comp-13", name: "Управление проектами", category: "Профессиональные" },
  { id: "comp-14", name: "Аналитическое мышление", category: "Профессиональные" },
  { id: "comp-15", name: "Клиентоориентированность", category: "Профессиональные" },
];

export const mockAssessments: Assessment[] = [
  { id: "assess-1", name: "Ежегодная оценка 2024", date: new Date("2024-01-15"), type: "Ежегодная" },
  { id: "assess-2", name: "Оценка 360° Q1 2024", date: new Date("2024-03-20"), type: "360°" },
  { id: "assess-3", name: "Оценка компетенций Q2 2024", date: new Date("2024-06-10"), type: "Компетенции" },
];

export const mockManagers = [
  { id: "mgr-1", fullName: "Козлов Андрей Викторович", position: "Директор департамента" },
  { id: "mgr-2", fullName: "Николаева Ольга Сергеевна", position: "Руководитель направления" },
  { id: "mgr-3", fullName: "Федоров Михаил Александрович", position: "Технический директор" },
  { id: "mgr-4", fullName: "Белова Анна Дмитриевна", position: "HR-директор" },
];

export const mockEmployees = [
  { id: "emp-1", fullName: "Иванов Иван Иванович", position: "Руководитель отдела", email: "ivanov@example.com" },
  { id: "emp-2", fullName: "Петрова Мария Сергеевна", position: "Ведущий разработчик", email: "petrova@example.com" },
  { id: "emp-3", fullName: "Сидоров Алексей Дмитриевич", position: "Старший менеджер", email: "sidorov@example.com" },
  { id: "emp-4", fullName: "Смирнова Елена Викторовна", position: "QA инженер", email: "smirnova@example.com" },
  { id: "emp-5", fullName: "Помыткин Сергей Олегович", position: "Руководитель разработки", email: "s.pomytkin@example.com" },
];

// Моковые данные для ИПР
export const mockIDPs: IDP[] = [
  {
    id: "idp-1",
    title: "Развитие лидерских компетенций",
    description: "План развития лидерских навыков и управленческих компетенций",
    type: "assessment",
    scenario: "one-to-one",
    employeeId: "emp-1",
    employeeName: "Иванов Иван Иванович",
    employeePosition: "Руководитель отдела",
    employeeEmail: "ivanov@example.com",
    managerId: "mgr-1",
    managerName: "Козлов Андрей Викторович",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    status: "draft",
    competencyIds: ["comp-1", "comp-2", "comp-3"],
    assessmentId: "assess-1",
    isVisible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-02-15"),
    goals: [
      {
        id: "goal-1",
        competencyId: "comp-1",
        title: "Развитие навыков управления командой",
        description: "Повышение эффективности управления командой разработки",
        status: "in-progress",
        targetDate: new Date("2024-06-30"),
        actions: [
          {
            id: "action-1",
            title: "Пройти курс 'Управление IT-командой'",
            description: "Онлайн-курс на платформе Coursera",
            status: "completed",
            targetDate: new Date("2024-03-31"),
            completedDate: new Date("2024-03-15"),
          },
          {
            id: "action-2",
            title: "Провести серию 1-on-1 встреч с каждым членом команды",
            description: "Регулярные индивидуальные встречи для обратной связи",
            status: "in-progress",
            targetDate: new Date("2024-06-30"),
          },
        ],
      },
      {
        id: "goal-2",
        competencyId: "comp-2",
        title: "Улучшение навыков стратегического планирования",
        description: "Развитие способности к долгосрочному планированию",
        status: "not-started",
        targetDate: new Date("2024-09-30"),
        actions: [
          {
            id: "action-3",
            title: "Изучить методологию OKR",
            description: "Изучение и внедрение системы целей и ключевых результатов",
            status: "not-started",
            targetDate: new Date("2024-05-31"),
          },
        ],
      },
    ],
  },
  {
    id: "idp-2",
    title: "Развитие технических навыков",
    description: "План развития технических компетенций в области облачных технологий",
    type: "competency",
    scenario: "classic",
    employeeId: "emp-2",
    employeeName: "Петрова Мария Сергеевна",
    employeePosition: "Ведущий разработчик",
    employeeEmail: "petrova@example.com",
    managerId: "mgr-3",
    managerName: "Федоров Михаил Александрович",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-12-31"),
    status: "in-progress",
    competencyIds: ["comp-11", "comp-12"],
    isVisible: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-20"),
    goals: [
      {
        id: "goal-3",
        competencyId: "comp-11",
        title: "Освоение AWS сервисов",
        description: "Получение сертификации AWS Solutions Architect",
        status: "in-progress",
        targetDate: new Date("2024-08-31"),
        actions: [
          {
            id: "action-4",
            title: "Пройти подготовительный курс AWS",
            description: "Онлайн-курс подготовки к сертификации",
            status: "in-progress",
            targetDate: new Date("2024-06-30"),
          },
          {
            id: "action-5",
            title: "Сдать экзамен AWS Solutions Architect",
            description: "Прохождение сертификационного экзамена",
            status: "not-started",
            targetDate: new Date("2024-08-31"),
          },
        ],
      },
    ],
  },
  {
    id: "idp-3",
    title: "Развитие навыков коммуникации",
    description: "Улучшение навыков публичных выступлений и презентаций",
    type: "career",
    scenario: "one-to-one",
    employeeId: "emp-3",
    employeeName: "Сидоров Алексей Дмитриевич",
    employeePosition: "Старший менеджер",
    employeeEmail: "sidorov@example.com",
    managerId: "mgr-2",
    managerName: "Николаева Ольга Сергеевна",
    startDate: new Date("2023-12-01"),
    endDate: new Date("2024-11-30"),
    status: "completed",
    competencyIds: ["comp-5", "comp-6"],
    assessmentId: "assess-2",
    isVisible: false,
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2024-11-30"),
    goals: [
      {
        id: "goal-4",
        competencyId: "comp-5",
        title: "Улучшение навыков презентации",
        description: "Развитие навыков публичных выступлений",
        status: "completed",
        targetDate: new Date("2024-10-31"),
        completedDate: new Date("2024-10-15"),
        actions: [
          {
            id: "action-6",
            title: "Пройти курс 'Искусство презентации'",
            description: "Курс по созданию эффективных презентаций",
            status: "completed",
            targetDate: new Date("2024-08-31"),
            completedDate: new Date("2024-08-20"),
          },
        ],
      },
    ],
  },
];

// Функции для работы с ИПР (в реальном приложении будут API вызовы)
export function getIDPs(): IDP[] {
  // В реальном приложении здесь будет загрузка из localStorage или API
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("idps");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((idp: any) => ({
          ...idp,
          startDate: new Date(idp.startDate),
          endDate: new Date(idp.endDate),
          createdAt: new Date(idp.createdAt),
          updatedAt: new Date(idp.updatedAt),
          goals: idp.goals.map((goal: any) => ({
            ...goal,
            targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
            completedDate: goal.completedDate ? new Date(goal.completedDate) : undefined,
            actions: goal.actions.map((action: any) => ({
              ...action,
              targetDate: action.targetDate ? new Date(action.targetDate) : undefined,
              completedDate: action.completedDate ? new Date(action.completedDate) : undefined,
            })),
          })),
        }));
      } catch {
        return mockIDPs;
      }
    }
  }
  return mockIDPs;
}

export function saveIDPs(idps: IDP[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("idps", JSON.stringify(idps));
  }
}

export function getIDPById(id: string): IDP | undefined {
  const idps = getIDPs();
  return idps.find(idp => idp.id === id);
}

export function updateIDP(updatedIDP: IDP): void {
  const idps = getIDPs();
  const updated = idps.map(idp => idp.id === updatedIDP.id ? updatedIDP : idp);
  saveIDPs(updated);
}

// Функция для получения текста типа ИПР (сценария создания)
export function getIDPTypeText(scenario: IDPScenario): string {
  switch (scenario) {
    case "classic":
      return "Классический";
    case "one-to-one":
      return "Результат one to one";
    default:
      return scenario;
  }
}
