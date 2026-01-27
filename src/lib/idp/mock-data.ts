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

export interface OneOnOneMeeting {
  id: string;
  date: Date;
  managerId: string;
  managerName: string;
  summary: string; // Итоги встречи
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
  // Поля для 1-on-1 встреч
  meetingDate?: Date; // Дата последней встречи
  meetingSummary?: string; // Итоги последней встречи
  meetingHistory?: OneOnOneMeeting[]; // История встреч
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
  { id: "emp-6", fullName: "Кузнецов Дмитрий Петрович", position: "Разработчик", email: "kuznetsov@example.com" },
  { id: "emp-7", fullName: "Волкова Анна Игоревна", position: "Аналитик", email: "volkova@example.com" },
  { id: "emp-8", fullName: "Новиков Павел Александрович", position: "DevOps инженер", email: "novikov@example.com" },
  { id: "emp-9", fullName: "Морозова Татьяна Владимировна", position: "Дизайнер", email: "morozova@example.com" },
  { id: "emp-10", fullName: "Лебедев Игорь Сергеевич", position: "Тестировщик", email: "lebedev@example.com" },
  { id: "emp-11", fullName: "Соколова Ольга Николаевна", position: "Бизнес-аналитик", email: "sokolova@example.com" },
  { id: "emp-12", fullName: "Попов Максим Викторович", position: "Продуктовый менеджер", email: "popov@example.com" },
  { id: "emp-13", fullName: "Васильева Екатерина Дмитриевна", position: "Маркетолог", email: "vasilieva@example.com" },
  { id: "emp-14", fullName: "Петров Андрей Олегович", position: "Системный администратор", email: "petrov@example.com" },
  { id: "emp-15", fullName: "Семенова Наталья Игоревна", position: "Контент-менеджер", email: "semenova@example.com" },
];

// Моковые данные для ИПР: 3 активных, 3 архивных (для «Мои ИПР»)
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
    status: "in-progress",
    competencyIds: ["comp-1", "comp-2", "comp-3"],
    assessmentId: "assess-1",
    isVisible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-02-15"),
    meetingDate: new Date("2024-02-15"),
    meetingSummary: "Обсудили текущие задачи по развитию лидерских компетенций. Сотрудник показал хороший прогресс в управлении командой. Определили приоритетные направления для дальнейшего развития: работа над стратегическим мышлением и принятием решений. Договорились о регулярных встречах раз в месяц.",
    meetingHistory: [
      {
        id: "meeting-1-1",
        date: new Date("2024-01-15"),
        managerId: "mgr-1",
        managerName: "Козлов Андрей Викторович",
        summary: "Первая встреча по плану развития. Обсудили цели и ожидания. Определили ключевые компетенции для развития.",
      },
      {
        id: "meeting-1-2",
        date: new Date("2024-02-15"),
        managerId: "mgr-1",
        managerName: "Козлов Андрей Викторович",
        summary: "Обсудили текущие задачи по развитию лидерских компетенций. Сотрудник показал хороший прогресс в управлении командой. Определили приоритетные направления для дальнейшего развития.",
      },
    ],
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
    id: "idp-1b",
    title: "Повышение экспертизы в React и Next.js",
    description: "Углубление знаний современных фронтенд-технологий",
    type: "competency",
    scenario: "classic",
    employeeId: "emp-1",
    employeeName: "Иванов Иван Иванович",
    employeePosition: "Руководитель отдела",
    employeeEmail: "ivanov@example.com",
    managerId: "mgr-3",
    managerName: "Федоров Михаил Александрович",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-12-31"),
    status: "draft",
    competencyIds: ["comp-9", "comp-10"],
    isVisible: true,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    goals: [
      {
        id: "goal-1b",
        competencyId: "comp-10",
        title: "Изучить App Router и Server Components",
        description: "Освоить новую модель маршрутизации Next.js",
        status: "not-started",
        targetDate: new Date("2024-06-30"),
        actions: [],
      },
    ],
  },
  {
    id: "idp-1c",
    title: "Развитие навыков управления проектами",
    description: "План по методологиям и инструментам проектного управления",
    type: "competency",
    scenario: "one-to-one",
    employeeId: "emp-1",
    employeeName: "Иванов Иван Иванович",
    employeePosition: "Руководитель отдела",
    employeeEmail: "ivanov@example.com",
    managerId: "mgr-2",
    managerName: "Николаева Ольга Сергеевна",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-12-31"),
    status: "pending-approval",
    competencyIds: ["comp-13", "comp-14"],
    assessmentId: "assess-2",
    isVisible: true,
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-15"),
    meetingDate: new Date("2024-04-15"),
    meetingSummary: "Обсудили план развития навыков управления проектами. Сотрудник заинтересован в получении сертификации PMP. Определили этапы подготовки и сроки.",
    meetingHistory: [
      {
        id: "meeting-1c-1",
        date: new Date("2024-04-15"),
        managerId: "mgr-2",
        managerName: "Николаева Ольга Сергеевна",
        summary: "Обсудили план развития навыков управления проектами. Сотрудник заинтересован в получении сертификации PMP. Определили этапы подготовки и сроки.",
      },
    ],
    goals: [
      {
        id: "goal-1c",
        competencyId: "comp-13",
        title: "Пройти сертификацию PMP",
        description: "Подготовка и сдача экзамена PMP",
        status: "not-started",
        targetDate: new Date("2024-09-30"),
        actions: [],
      },
    ],
  },
  {
    id: "idp-2",
    title: "Развитие технических навыков",
    description: "План развития технических компетенций в области облачных технологий",
    type: "competency",
    scenario: "classic",
    employeeId: "emp-1",
    employeeName: "Иванов Иван Иванович",
    employeePosition: "Руководитель отдела",
    employeeEmail: "ivanov@example.com",
    managerId: "mgr-3",
    managerName: "Федоров Михаил Александрович",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-12-31"),
    status: "completed",
    competencyIds: ["comp-11", "comp-12"],
    isVisible: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-08-20"),
    goals: [
      {
        id: "goal-3",
        competencyId: "comp-11",
        title: "Освоение AWS сервисов",
        description: "Получение сертификации AWS Solutions Architect",
        status: "completed",
        targetDate: new Date("2024-08-31"),
        completedDate: new Date("2024-08-15"),
        actions: [
          {
            id: "action-4",
            title: "Пройти подготовительный курс AWS",
            description: "Онлайн-курс подготовки к сертификации",
            status: "completed",
            targetDate: new Date("2024-06-30"),
            completedDate: new Date("2024-06-25"),
          },
          {
            id: "action-5",
            title: "Сдать экзамен AWS Solutions Architect",
            description: "Прохождение сертификационного экзамена",
            status: "completed",
            targetDate: new Date("2024-08-31"),
            completedDate: new Date("2024-08-10"),
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
    employeeId: "emp-1",
    employeeName: "Иванов Иван Иванович",
    employeePosition: "Руководитель отдела",
    employeeEmail: "ivanov@example.com",
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
    meetingDate: new Date("2024-11-15"),
    meetingSummary: "Итоговая встреча по завершенному плану развития коммуникативных навыков. Обсудили достигнутые результаты и дальнейшие планы развития.",
    meetingHistory: [
      {
        id: "meeting-3-1",
        date: new Date("2023-12-10"),
        managerId: "mgr-2",
        managerName: "Николаева Ольга Сергеевна",
        summary: "Первичное обсуждение плана развития коммуникативных навыков. Определили основные направления работы.",
      },
      {
        id: "meeting-3-2",
        date: new Date("2024-06-15"),
        managerId: "mgr-2",
        managerName: "Николаева Ольга Сергеевна",
        summary: "Промежуточная встреча. Обсудили прогресс в развитии навыков презентации. Сотрудник показал значительные улучшения.",
      },
      {
        id: "meeting-3-3",
        date: new Date("2024-11-15"),
        managerId: "mgr-2",
        managerName: "Николаева Ольга Сергеевна",
        summary: "Итоговая встреча по завершенному плану развития коммуникативных навыков. Обсудили достигнутые результаты и дальнейшие планы развития.",
      },
    ],
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
  {
    id: "idp-4",
    title: "Адаптация на новой должности",
    description: "План вхождения в роль руководителя разработки",
    type: "new-role",
    scenario: "classic",
    employeeId: "emp-1",
    employeeName: "Иванов Иван Иванович",
    employeePosition: "Руководитель отдела",
    employeeEmail: "ivanov@example.com",
    managerId: "mgr-1",
    managerName: "Козлов Андрей Викторович",
    startDate: new Date("2023-09-01"),
    endDate: new Date("2024-06-30"),
    status: "cancelled",
    competencyIds: ["comp-1", "comp-3", "comp-13"],
    isVisible: true,
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2024-03-15"),
    goals: [
      {
        id: "goal-5",
        competencyId: "comp-3",
        title: "Управление командой разработки",
        description: "Формирование и ведение команды из 8 человек",
        status: "cancelled",
        targetDate: new Date("2024-04-30"),
        actions: [
          {
            id: "action-7",
            title: "Серия встреч 1-on-1 с подчинёнными",
            description: "Знакомство и постановка целей",
            status: "cancelled",
            targetDate: new Date("2024-02-28"),
          },
        ],
      },
    ],
  },
  // Генерация 45 ИПР для сотрудников (не emp-1)
  ...(() => {
    const additionalIDPs: IDP[] = [];
    const statuses: IDP["status"][] = ["draft", "in-progress", "pending-approval", "completed", "cancelled"];
    const types: IDPType[] = ["competency", "career", "adaptation", "assessment"];
    const scenarios: IDPScenario[] = ["classic", "one-to-one"];
    const employeeIds = ["emp-2", "emp-3", "emp-4", "emp-5", "emp-6", "emp-7", "emp-8", "emp-9", "emp-10", "emp-11", "emp-12", "emp-13", "emp-14", "emp-15"];
    const titles = [
      "Развитие технических навыков",
      "Повышение экспертизы в разработке",
      "Развитие лидерских компетенций",
      "Улучшение навыков коммуникации",
      "Развитие аналитического мышления",
      "Повышение квалификации в тестировании",
      "Развитие навыков управления проектами",
      "Улучшение навыков дизайна",
      "Развитие DevOps компетенций",
      "Повышение экспертизы в бизнес-анализе",
      "Развитие продуктового мышления",
      "Улучшение маркетинговых навыков",
      "Развитие системного администрирования",
      "Повышение навыков контент-менеджмента",
      "Развитие стратегического мышления",
      "Улучшение навыков работы в команде",
      "Развитие эмоционального интеллекта",
      "Повышение навыков клиентоориентированности",
      "Развитие навыков принятия решений",
      "Улучшение навыков адаптивности",
    ];
    
    for (let i = 0; i < 45; i++) {
      const empIndex = i % employeeIds.length;
      const employee = mockEmployees.find(e => e.id === employeeIds[empIndex]) || mockEmployees[1];
      const manager = mockManagers[i % mockManagers.length];
      const status = statuses[i % statuses.length];
      const type = types[i % types.length];
      const scenario = scenarios[i % scenarios.length];
      const titleIndex = i % titles.length;
      const startDate = new Date(2024, (i % 12), 1 + (i % 28));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6 + (i % 6));
      
      additionalIDPs.push({
        id: `idp-emp-${i + 1}`,
        title: titles[titleIndex],
        description: `План развития для ${employee.fullName}`,
        type,
        scenario,
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeePosition: employee.position,
        employeeEmail: employee.email,
        managerId: manager.id,
        managerName: manager.fullName,
        startDate,
        endDate,
        status,
        competencyIds: [`comp-${(i % 15) + 1}`, `comp-${((i + 1) % 15) + 1}`],
        assessmentId: status !== "draft" ? `assess-${(i % 3) + 1}` : undefined,
        isVisible: true,
        createdAt: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(startDate.getTime() + (i % 30) * 24 * 60 * 60 * 1000),
        goals: [
          {
            id: `goal-emp-${i + 1}-1`,
            competencyId: `comp-${(i % 15) + 1}`,
            title: `Цель развития ${i + 1}`,
            description: `Описание цели для ${employee.fullName}`,
            status: status === "completed" ? "completed" : status === "in-progress" ? "in-progress" : "not-started",
            targetDate: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            completedDate: status === "completed" ? new Date(endDate.getTime() - 15 * 24 * 60 * 60 * 1000) : undefined,
            actions: [],
          },
        ],
      });
    }
    return additionalIDPs;
  })(),
];

// Функции для работы с ИПР (в реальном приложении будут API вызовы)
export function getIDPs(): IDP[] {
  // В реальном приложении здесь будет загрузка из localStorage или API
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("idps");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const storedIDPs = parsed.map((idp: any) => ({
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
        
        // Объединяем сохраненные ИПР с моковыми, убирая дубликаты по ID
        // Приоритет у сохраненных данных (они могут быть изменены пользователем)
        const storedIds = new Set(storedIDPs.map((idp: IDP) => idp.id));
        const additionalMockIDPs = mockIDPs.filter((idp) => !storedIds.has(idp.id));
        return [...storedIDPs, ...additionalMockIDPs];
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
      return "ИПР";
    case "one-to-one":
      return "Результат 1-on-1";
    default:
      return scenario;
  }
}
