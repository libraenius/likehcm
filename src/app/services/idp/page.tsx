"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { NotebookPen, Users, Settings, FileText, Calendar, Plus, ChevronDown, ChevronRight, ChevronLeft, Pencil, Trash2, Search, X, CheckCircle2, Clock, Target, Eye, EyeOff, ClipboardCheck, BookOpen, AlertCircle, Info, Sparkles, Filter, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import {
  mockCompetencies,
  mockAssessments,
  mockManagers,
  mockEmployees,
  mockIDPs as initialMockIDPs,
  getIDPs,
  saveIDPs,
  getIDPTypeText,
  type IDP,
  type Competency,
  type Assessment,
  type IDPGoal,
  type IDPAction,
  type IDPType,
  type IDPScenario,
} from "@/lib/idp/mock-data";


// Шаги для пошагового создания ИПР
const IDP_STEPS = [
  { id: 1, title: "Основная информация", description: "Название, тип и период ИПР" },
  { id: 2, title: "Участники", description: "Сотрудник и руководитель" },
  { id: 3, title: "Компетенции и оценка", description: "Выберите компетенции и связь с оценкой" },
];

// Подсказки для полей ИПР
const fieldHelpContent: Record<string, { 
  title: string; 
  description: string; 
  examples?: string[]; 
  tips?: string[];
  commonMistakes?: string[];
  additionalInfo?: string;
}> = {
  title: {
    title: "Название ИПР",
    description: "Краткое и понятное название индивидуального плана развития. Должно отражать основную цель или направление развития. Это обязательное поле, которое будет отображаться в списке ИПР и использоваться для поиска.",
    examples: [
      "Развитие лидерских компетенций",
      "Повышение экспертизы в React и Next.js",
      "Развитие навыков управления проектами",
      "Подготовка к роли технического лида",
      "Улучшение навыков коммуникации"
    ],
    tips: [
      "Используйте конкретные формулировки, отражающие цель развития",
      "Избегайте слишком общих названий типа 'Развитие навыков'",
      "Максимальная длина - 100 символов",
      "Название должно быть понятным для сотрудника и руководителя"
    ],
    commonMistakes: [
      "Слишком длинное название (более 100 символов)",
      "Использование аббревиатур без расшифровки",
      "Слишком общие формулировки"
    ],
    additionalInfo: "Название ИПР является основным идентификатором и используется во всех разделах системы. Выберите название, которое точно отражает цель развития и будет понятно всем участникам процесса."
  },
  type: {
    title: "Тип ИПР",
    description: "Тип индивидуального плана развития определяет его основную направленность и контекст создания. Выбор типа помогает правильно структурировать план и определить приоритеты развития.",
    examples: [
      "По результатам оценки - создается на основе результатов оценки компетенций",
      "Карьерное развитие - фокус на подготовке к следующей должности",
      "Адаптация - план для новых сотрудников",
      "Развитие компетенций - работа над конкретными навыками",
      "Подготовка к новой роли - переход на новую позицию"
    ],
    tips: [
      "Выбирайте тип, который наиболее точно отражает цель ИПР",
      "Тип влияет на структуру и приоритеты плана",
      "Можно изменить тип при редактировании ИПР"
    ],
    commonMistakes: [
      "Выбор неподходящего типа",
      "Игнорирование связи типа с целью развития"
    ],
    additionalInfo: "Тип ИПР помогает систематизировать планы развития и анализировать направления развития сотрудников в организации."
  },
  description: {
    title: "Описание / обоснование",
    description: "Подробное описание целей и задач ИПР, обоснование необходимости развития. Помогает понять контекст создания плана и ожидаемые результаты. Это опциональное поле, но его заполнение рекомендуется для лучшего понимания целей.",
    examples: [
      "План развития лидерских навыков и управленческих компетенций на основе результатов оценки 360°. Фокус на развитии навыков управления командой и стратегического мышления.",
      "Углубление знаний современных фронтенд-технологий для повышения эффективности работы и подготовки к роли технического лида.",
      "План по методологиям и инструментам проектного управления для улучшения качества планирования и контроля проектов."
    ],
    tips: [
      "Опишите основные цели и задачи ИПР",
      "Укажите обоснование необходимости развития",
      "Упомяните ожидаемые результаты",
      "Максимальная длина - 500 символов"
    ],
    commonMistakes: [
      "Слишком краткое описание",
      "Копирование названия ИПР в описание",
      "Отсутствие обоснования необходимости развития"
    ],
    additionalInfo: "Хорошее описание помогает сотруднику и руководителю лучше понять цели ИПР и ожидаемые результаты развития."
  },
  startDate: {
    title: "Дата начала",
    description: "Дата начала действия индивидуального плана развития. С этой даты начинается отсчет периода выполнения плана. Это обязательное поле.",
    examples: [
      "01.01.2024 - начало нового года",
      "15.03.2024 - после завершения оценки",
      "01.09.2024 - начало нового квартала"
    ],
    tips: [
      "Выбирайте реалистичную дату начала",
      "Учитывайте текущую загрузку сотрудника",
      "Дата начала должна быть не позже даты окончания"
    ],
    commonMistakes: [
      "Установка даты начала в прошлом без необходимости",
      "Дата начала позже даты окончания",
      "Неучет загрузки сотрудника"
    ],
    additionalInfo: "Дата начала определяет период действия ИПР и используется для планирования и контроля выполнения плана."
  },
  endDate: {
    title: "Дата окончания",
    description: "Дата окончания действия индивидуального плана развития. К этой дате должны быть выполнены основные цели плана. Это обязательное поле.",
    examples: [
      "31.12.2024 - конец года",
      "30.06.2024 - конец полугодия",
      "31.03.2025 - через год после начала"
    ],
    tips: [
      "Устанавливайте реалистичные сроки",
      "Учитывайте сложность целей развития",
      "Дата окончания должна быть позже даты начала",
      "Рекомендуемый период - от 3 до 12 месяцев"
    ],
    commonMistakes: [
      "Слишком короткие сроки для сложных целей",
      "Слишком длинные сроки, снижающие мотивацию",
      "Дата окончания раньше даты начала"
    ],
    additionalInfo: "Дата окончания определяет дедлайн для выполнения целей ИПР и используется для планирования и контроля."
  },
  employee: {
    title: "Сотрудник",
    description: "Сотрудник, для которого создается индивидуальный план развития. Это обязательное поле. Сотрудник является основным участником ИПР и отвечает за выполнение целей плана.",
    examples: [
      "Иванов Иван Иванович - Руководитель отдела",
      "Петрова Мария Сергеевна - Ведущий разработчик",
      "Сидоров Алексей Дмитриевич - Старший менеджер"
    ],
    tips: [
      "Выбирайте сотрудника из списка доступных",
      "При создании для текущего пользователя поле заполняется автоматически",
      "Сотрудник должен быть активным в системе"
    ],
    commonMistakes: [
      "Выбор несуществующего сотрудника",
      "Создание ИПР для неактивного сотрудника"
    ],
    additionalInfo: "Сотрудник является основным участником ИПР и получает уведомления о создании и изменениях плана."
  },
  manager: {
    title: "Руководитель",
    description: "Руководитель, который согласует и контролирует выполнение индивидуального плана развития. Это обязательное поле. Руководитель отвечает за согласование целей и контроль выполнения плана.",
    examples: [
      "Козлов Андрей Викторович - Директор департамента",
      "Николаева Ольга Сергеевна - Руководитель направления",
      "Федоров Михаил Александрович - Технический директор"
    ],
    tips: [
      "Выбирайте непосредственного руководителя сотрудника",
      "Руководитель должен иметь право согласовывать ИПР",
      "Руководитель получает уведомления о создании и изменениях ИПР"
    ],
    commonMistakes: [
      "Выбор неправильного руководителя",
      "Создание ИПР без указания руководителя"
    ],
    additionalInfo: "Руководитель согласует цели ИПР, контролирует выполнение плана и может вносить изменения в план развития."
  },
  assessment: {
    title: "Связь с оценкой",
    description: "Оценка, по результатам которой создается индивидуальный план развития. Это опциональное поле. Связь с оценкой помогает понять контекст создания ИПР и приоритеты развития.",
    examples: [
      "Ежегодная оценка 2024 - создается на основе результатов ежегодной оценки",
      "Оценка 360° Q1 2024 - план на основе обратной связи от коллег",
      "Оценка компетенций Q2 2024 - фокус на развитии конкретных компетенций"
    ],
    tips: [
      "Выбирайте оценку, результаты которой используются для создания ИПР",
      "Связь с оценкой помогает отслеживать прогресс",
      "Можно создать ИПР без связи с оценкой"
    ],
    commonMistakes: [
      "Выбор несуществующей оценки",
      "Связь с оценкой, не имеющей отношения к ИПР"
    ],
    additionalInfo: "Связь с оценкой помогает понять контекст создания ИПР и отслеживать прогресс развития на основе результатов оценки."
  },
  competencies: {
    title: "Компетенции для развития",
    description: "Компетенции, которые планируется развивать в рамках индивидуального плана развития. Это опциональное поле, но рекомендуется выбрать хотя бы одну компетенцию для фокусировки развития.",
    examples: [
      "Лидерство, Стратегическое мышление, Управление командой",
      "JavaScript/TypeScript, React/Next.js, Архитектура ПО",
      "Коммуникация, Эмоциональный интеллект, Работа в команде"
    ],
    tips: [
      "Выбирайте компетенции, которые действительно нужно развивать",
      "Фокусируйтесь на 3-5 ключевых компетенциях",
      "Учитывайте результаты оценки при выборе компетенций",
      "Можно выбрать как профессиональные, так и корпоративные компетенции"
    ],
    commonMistakes: [
      "Выбор слишком большого количества компетенций",
      "Выбор компетенций, не связанных с целями ИПР",
      "Игнорирование результатов оценки"
    ],
    additionalInfo: "Выбранные компетенции определяют фокус развития и используются для создания целей и задач в ИПР."
  }
};


// Функция для получения цвета статуса
const getStatusColor = (status: IDP["status"]) => {
  return getStatusBadgeColor(status);
};

// Функция для получения текста статуса
const getStatusText = (status: IDP["status"]) => {
  switch (status) {
    case "draft":
      return "Черновик";
    case "in-progress":
      return "В процессе";
    case "completed":
      return "Завершено";
    case "cancelled":
      return "Отменено";
    case "pending-approval":
      return "На согласовании";
    default:
      return status;
  }
};

// Форматирование даты
const formatDate = (date: Date) => {
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Функция для получения инициалов из ФИО
const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "??";
};

export default function IDPPage() {
  const router = useRouter();
  
  // Начальное состояние всегда из моков (одинаково на сервере и клиенте) — избегаем hydration mismatch
  const [idps, setIDPs] = useState<IDP[]>(initialMockIDPs);

  // После гидрации подгружаем данные из localStorage (только на клиенте)
  useEffect(() => {
    const stored = getIDPs();
    setIDPs(stored);
  }, []);
  const [selectedIDP, setSelectedIDP] = useState<IDP | null>(null);
  const [expandedIDPs, setExpandedIDPs] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [editingIDP, setEditingIDP] = useState<IDP | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Состояние для поиска и фильтров на вкладке "ИПР сотрудников"
  const [employeesSearchQuery, setEmployeesSearchQuery] = useState("");
  const [employeesFilterDialogOpen, setEmployeesFilterDialogOpen] = useState(false);
  const [employeesFilters, setEmployeesFilters] = useState<{
    statuses: string[];
    types: string[];
    scenarios: string[];
  }>({
    statuses: [],
    types: [],
    scenarios: [],
  });
  const [employeesCurrentPage, setEmployeesCurrentPage] = useState(1);
  const [employeesItemsPerPage, setEmployeesItemsPerPage] = useState(10);
  const [isCreatingForCurrentUser, setIsCreatingForCurrentUser] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [idpErrors, setIdpErrors] = useState<Record<string, string>>({});
  const [createScenario, setCreateScenario] = useState<"classic" | "one-to-one" | null>(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [participantScenario, setParticipantScenario] = useState<"for-myself" | "for-subordinate" | null>(null);
  const [helpContent, setHelpContent] = useState<{ 
    title: string; 
    description: string; 
    examples?: string[]; 
    tips?: string[];
    commonMistakes?: string[];
    additionalInfo?: string;
  } | null>(null);

  // Состояние для формы создания ИПР
  const [idpFormData, setIDPFormData] = useState({
    title: "",
    description: "",
    type: "competency" as IDPType,
    employeeId: "",
    managerId: "",
    startDate: "",
    endDate: "",
    status: "draft" as "draft" | "in-progress" | "completed" | "cancelled",
    competencyIds: [] as string[],
    assessmentId: "",
    isVisible: true,
  });

  // Функция для открытия модального окна помощи
  const openHelp = (fieldKey: string) => {
    const content = fieldHelpContent[fieldKey];
    if (content) {
      setHelpContent(content);
      setHelpDialogOpen(true);
    }
  };

  // Переключение раскрытия ИПР
  const toggleIDP = (idpId: string) => {
    const newExpanded = new Set(expandedIDPs);
    if (newExpanded.has(idpId)) {
      newExpanded.delete(idpId);
    } else {
      newExpanded.add(idpId);
    }
    setExpandedIDPs(newExpanded);
  };

  // Открытие диалога выбора сценария создания
  const handleCreate = (forCurrentUser: boolean = false) => {
    setIsCreatingForCurrentUser(forCurrentUser);
    setIsScenarioDialogOpen(true);
  };

  // Открытие диалога создания ИПР по выбранному сценарию
  const handleOpenCreateDialog = (scenario: "classic" | "one-to-one") => {
    setIsScenarioDialogOpen(false);
    setCreateScenario(scenario);
    setEditingIDP(null);
    setCurrentStep(1);
    setIdpErrors({});
    setParticipantScenario(null);
    
    // Предзаполнение данных в зависимости от сценария
    if (scenario === "one-to-one") {
      // Для one-to-one можно предзаполнить некоторые поля
      setIDPFormData({
        title: "",
        description: "",
        type: "assessment", // По умолчанию для one-to-one
        employeeId: isCreatingForCurrentUser ? "emp-1" : "",
        managerId: "",
        startDate: "",
        endDate: "",
        status: "draft",
        competencyIds: [],
        assessmentId: "",
        isVisible: true,
      });
      setIsCreateDialogOpen(true);
    } else {
      // Классический сценарий - пошаговая модель, всегда создается в статусе черновик
      setIDPFormData({
        title: "",
        description: "",
        type: "competency",
        employeeId: isCreatingForCurrentUser ? "emp-1" : "",
        managerId: "",
        startDate: "",
        endDate: "",
        status: "draft", // Всегда черновик для классического ИПР
        competencyIds: [],
        assessmentId: "",
        isVisible: true,
      });
      setIsCreateDialogOpen(true);
    }
  };

  // Валидация шага
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Основная информация
        if (!idpFormData.title.trim()) {
          errors.title = "Название ИПР обязательно";
        }
        if (!idpFormData.startDate) {
          errors.startDate = "Дата начала обязательна";
        }
        if (!idpFormData.endDate) {
          errors.endDate = "Дата окончания обязательна";
        }
        if (idpFormData.startDate && idpFormData.endDate && new Date(idpFormData.startDate) > new Date(idpFormData.endDate)) {
          errors.endDate = "Дата окончания должна быть позже даты начала";
        }
        break;
      case 2: // Участники
        if (!participantScenario) {
          errors.employeeId = "Выберите сценарий создания ИПР";
        }
        if (!idpFormData.employeeId) {
          errors.employeeId = "Выберите сотрудника";
        }
        if (!idpFormData.managerId) {
          errors.managerId = "Выберите руководителя";
        }
        break;
      case 3: // Компетенции и оценка
        const MAX_COMPETENCIES = 8;
        if (idpFormData.competencyIds.length > MAX_COMPETENCIES) {
          errors.competencies = `Максимальное количество компетенций - ${MAX_COMPETENCIES}. Пожалуйста, удалите лишние компетенции.`;
        }
        break;
      case 4: // Дополнительно - опциональные поля
        break;
    }
    
    setIdpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Переход к следующему шагу
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < IDP_STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Переход к предыдущему шагу
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIdpErrors({});
    }
  };

  // Переход к конкретному шагу
  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === currentStep) return;
    
    if (stepNumber < currentStep) {
      // Переход назад - без валидации
      setCurrentStep(stepNumber);
      setIdpErrors({});
    } else {
      // Переход вперед - проверяем валидацию всех шагов до целевого
      let canProceed = true;
      for (let step = currentStep; step < stepNumber; step++) {
        if (!validateStep(step)) {
          canProceed = false;
          break;
        }
      }
      
      if (canProceed) {
        setCurrentStep(stepNumber);
        setIdpErrors({});
      }
    }
  };

  // Текущий пользователь (в реальном приложении будет из контекста/сессии)
  const currentUserId = "emp-1";
  
  // Подчиненные текущего пользователя (в реальном приложении будет из API)
  const subordinates = useMemo(() => {
    return mockEmployees.filter((emp) => emp.id !== currentUserId);
  }, []);

  // Моковые данные для оценок компетенций сотрудников
  // В реальном приложении это будет загружаться из API
  const employeeCompetencyAssessments = useMemo(() => {
    const assessments: Record<string, Record<string, number[]>> = {
      "emp-1": {
        "comp-1": [2, 3], // Лидерство: оценки 2 и 3, среднее = 2.5
        "comp-2": [3, 4], // Стратегическое мышление: среднее = 3.5
        "comp-3": [2], // Управление командой: среднее = 2
        "comp-5": [4, 4, 5], // Коммуникация: среднее = 4.33
        "comp-6": [3], // Эмоциональный интеллект: среднее = 3
        "comp-9": [5, 5], // JavaScript/TypeScript: среднее = 5
        "comp-10": [4, 5], // React/Next.js: среднее = 4.5
        "comp-11": [3, 3, 4], // Архитектура ПО: среднее = 3.33
      },
      "emp-2": {
        "comp-9": [4, 5],
        "comp-10": [5, 5],
        "comp-11": [4],
        "comp-12": [3, 4],
      },
      "emp-3": {
        "comp-1": [3],
        "comp-3": [2, 3],
        "comp-13": [4, 4],
        "comp-14": [3, 4, 4],
      },
      "emp-4": {
        "comp-5": [3, 3],
        "comp-8": [4],
        "comp-14": [3],
      },
      "emp-5": {
        "comp-1": [4, 5],
        "comp-3": [4, 4, 5],
        "comp-9": [4],
        "comp-11": [4, 5],
      },
    };
    return assessments;
  }, []);

  // Функция для получения среднего уровня оценки компетенции для сотрудника
  const getAverageAssessmentLevel = (employeeId: string, competencyId: string): number | null => {
    const employeeAssessments = employeeCompetencyAssessments[employeeId];
    if (!employeeAssessments || !employeeAssessments[competencyId]) {
      return null; // Нет оценок для этой компетенции
    }
    const levels = employeeAssessments[competencyId];
    if (levels.length === 0) return null;
    const sum = levels.reduce((acc, level) => acc + level, 0);
    return sum / levels.length;
  };

  // Получаем компетенции с оценками для выбранного сотрудника, отсортированные по среднему уровню
  const competenciesWithAssessments = useMemo(() => {
    const employeeId = idpFormData.employeeId || currentUserId;
    return mockCompetencies
      .map((comp) => {
        const avgLevel = getAverageAssessmentLevel(employeeId, comp.id);
        return {
          ...comp,
          averageLevel: avgLevel,
        };
      })
      .sort((a, b) => {
        // Сортировка: сначала без оценок (null), затем по возрастанию среднего уровня
        if (a.averageLevel === null && b.averageLevel === null) return 0;
        if (a.averageLevel === null) return 1; // Без оценок в конец
        if (b.averageLevel === null) return -1; // Без оценок в конец
        return a.averageLevel - b.averageLevel; // От низкого к высокому
      });
  }, [idpFormData.employeeId, currentUserId, employeeCompetencyAssessments]);

  // Обработка выбора сценария участников
  const handleParticipantScenarioChange = (scenario: "for-myself" | "for-subordinate") => {
    setParticipantScenario(scenario);
    if (scenario === "for-myself") {
      // Для себя: сотрудник = текущий пользователь, руководитель очищается
      setIDPFormData({
        ...idpFormData,
        employeeId: currentUserId,
        managerId: "",
      });
    } else {
      // Для подчиненного: сотрудник очищается, руководитель = текущий пользователь (если он руководитель)
      const currentUser = mockEmployees.find((e) => e.id === currentUserId);
      // Проверяем, является ли текущий пользователь менеджером в списке
      const currentUserAsManager = currentUser
        ? mockManagers.find((mgr) => mgr.fullName === currentUser.fullName)
        : null;
      
      // Если текущий пользователь не в списке менеджеров, но является руководителем по должности
      const managerId = currentUserAsManager
        ? currentUserAsManager.id
        : currentUser && currentUser.position.toLowerCase().includes("руководитель")
        ? `mgr-current-${currentUserId}`
        : "";
      
      setIDPFormData({
        ...idpFormData,
        employeeId: "",
        managerId: managerId,
      });
    }
    // Очищаем ошибки
    setIdpErrors({ ...idpErrors, employeeId: "", managerId: "" });
  };

  // Создание или обновление ИПР
  const handleSaveIDP = () => {
    if (!idpFormData.title.trim() || !idpFormData.employeeId || !idpFormData.managerId || !idpFormData.startDate || !idpFormData.endDate) {
      return;
    }

    const employee = mockEmployees.find((e) => e.id === idpFormData.employeeId);
    const manager = mockManagers.find((m) => m.id === idpFormData.managerId);
    if (!employee || !manager) return;

    if (editingIDP) {
      // Редактирование существующего ИПР
      const updatedIDP: IDP = {
        ...editingIDP,
        title: idpFormData.title.trim(),
        description: idpFormData.description.trim() || undefined,
        type: idpFormData.type,
        scenario: editingIDP.scenario, // Сохраняем существующий сценарий
        employeeId: idpFormData.employeeId,
        employeeName: employee.fullName,
        employeePosition: employee.position,
        employeeEmail: employee.email,
        managerId: idpFormData.managerId,
        managerName: manager.fullName,
        startDate: new Date(idpFormData.startDate),
        endDate: new Date(idpFormData.endDate),
        status: idpFormData.status,
        competencyIds: idpFormData.competencyIds,
        assessmentId: idpFormData.assessmentId || undefined,
        isVisible: idpFormData.isVisible,
        updatedAt: new Date(),
      };

      const updated = idps.map((idp) => (idp.id === editingIDP.id ? updatedIDP : idp));
      setIDPs(updated);
      saveIDPs(updated);
    } else {
      // Создание нового ИПР - всегда в статусе черновик для классического сценария
      const newIDP: IDP = {
        id: `idp-${Date.now()}`,
        title: idpFormData.title.trim(),
        description: idpFormData.description.trim() || undefined,
        type: idpFormData.type,
        scenario: createScenario || "classic", // Сохраняем сценарий создания
        employeeId: idpFormData.employeeId,
        employeeName: employee.fullName,
        employeePosition: employee.position,
        employeeEmail: employee.email,
        managerId: idpFormData.managerId,
        managerName: manager.fullName,
        startDate: new Date(idpFormData.startDate),
        endDate: new Date(idpFormData.endDate),
        status: createScenario === "classic" ? "draft" : idpFormData.status, // Классический ИПР всегда создается в статусе черновик
        competencyIds: idpFormData.competencyIds,
        assessmentId: idpFormData.assessmentId || undefined,
        isVisible: createScenario === "classic" ? true : idpFormData.isVisible, // Классический ИПР всегда видимый
        goals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = [...idps, newIDP];
      setIDPs(updated);
      saveIDPs(updated);
    }

    setIsCreateDialogOpen(false);
    setIsCreatingForCurrentUser(false);
    setEditingIDP(null);
    setIDPFormData({
      title: "",
      description: "",
      type: "competency",
      employeeId: "",
      managerId: "",
      startDate: "",
      endDate: "",
      status: "draft",
      competencyIds: [],
      assessmentId: "",
      isVisible: true,
    });
  };

  // Удаление ИПР
  const handleDeleteIDP = (idpId: string) => {
    const updated = idps.filter((idp) => idp.id !== idpId);
    setIDPs(updated);
    saveIDPs(updated);
    if (selectedIDP?.id === idpId) {
      setSelectedIDP(null);
    }
  };

  // Редактирование ИПР
  const handleEditIDP = (idp: IDP) => {
    setEditingIDP(idp);
    setIsCreatingForCurrentUser(false);
    setCreateScenario(null);
    setCurrentStep(1);
    setIdpErrors({});
    setIDPFormData({
      title: idp.title,
      description: idp.description || "",
      type: idp.type,
      employeeId: idp.employeeId,
      managerId: idp.managerId,
      startDate: idp.startDate.toISOString().split("T")[0],
      endDate: idp.endDate.toISOString().split("T")[0],
      status: idp.status,
      competencyIds: idp.competencyIds,
      assessmentId: idp.assessmentId || "",
      isVisible: idp.isVisible,
    });
    setIsCreateDialogOpen(true);
  };

  // Фильтрация ИПР
  const filteredIDPs = useMemo(() => {
    if (!searchQuery.trim()) return idps;

    const query = searchQuery.toLowerCase();
    return idps.filter(
      (idp) =>
        idp.title.toLowerCase().includes(query) ||
        idp.description?.toLowerCase().includes(query) ||
        idp.employeeName.toLowerCase().includes(query) ||
        idp.employeePosition.toLowerCase().includes(query)
    );
  }, [idps, searchQuery]);

  // Получение моих ИПР (для текущего пользователя)
  const myIDPs = useMemo(() => {
    // В реальном приложении здесь будет проверка текущего пользователя
    // Для примера возвращаем первый ИПР
    return idps.filter((idp) => idp.employeeId === "emp-1");
  }, [idps]);

  // Получение ИПР сотрудников (все кроме моих)
  const employeesIDPs = useMemo(() => {
    // В реальном приложении здесь будет проверка текущего пользователя
    return idps.filter((idp) => idp.employeeId !== "emp-1");
  }, [idps]);

  // Функция для получения статистики ИПР сотрудников
  const getIDPStatistics = useMemo(() => {
    const byType = {
      competency: employeesIDPs.filter((idp) => idp.type === "competency").length,
      career: employeesIDPs.filter((idp) => idp.type === "career").length,
      adaptation: employeesIDPs.filter((idp) => idp.type === "adaptation").length,
      assessment: employeesIDPs.filter((idp) => idp.type === "assessment").length,
    };

    const byStatus = {
      draft: employeesIDPs.filter((idp) => idp.status === "draft").length,
      "in-progress": employeesIDPs.filter((idp) => idp.status === "in-progress").length,
      "pending-approval": employeesIDPs.filter((idp) => idp.status === "pending-approval").length,
      completed: employeesIDPs.filter((idp) => idp.status === "completed").length,
      cancelled: employeesIDPs.filter((idp) => idp.status === "cancelled").length,
    };

    const byScenario = {
      classic: employeesIDPs.filter((idp) => idp.scenario === "classic").length,
      "one-to-one": employeesIDPs.filter((idp) => idp.scenario === "one-to-one").length,
    };

    return {
      byType,
      byStatus,
      byScenario,
    };
  }, [employeesIDPs]);

  // Фильтрация ИПР сотрудников
  const filteredEmployeesIDPs = useMemo(() => {
    let result = employeesIDPs;

    // Поиск
    if (employeesSearchQuery.trim()) {
      const query = employeesSearchQuery.toLowerCase();
      result = result.filter(
        (idp) =>
          idp.title.toLowerCase().includes(query) ||
          idp.description?.toLowerCase().includes(query) ||
          idp.employeeName.toLowerCase().includes(query) ||
          idp.employeePosition.toLowerCase().includes(query) ||
          idp.managerName?.toLowerCase().includes(query)
      );
    }

    // Фильтр по статусам
    if (employeesFilters.statuses.length > 0) {
      result = result.filter((idp) => employeesFilters.statuses.includes(idp.status));
    }

    // Фильтр по типам
    if (employeesFilters.types.length > 0) {
      result = result.filter((idp) => employeesFilters.types.includes(idp.type));
    }

    // Фильтр по сценариям
    if (employeesFilters.scenarios.length > 0) {
      result = result.filter((idp) => employeesFilters.scenarios.includes(idp.scenario));
    }

    return result;
  }, [employeesIDPs, employeesSearchQuery, employeesFilters]);

  return (
    <div className="idp-ritm space-y-6">
      <Tabs defaultValue="my-idp" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="my-idp">
            <NotebookPen className="h-4 w-4" />
            <span>Мои ИПР</span>
          </TabsTrigger>
          <TabsTrigger value="employees-idp">
            <Users className="h-4 w-4" />
            <span>ИПР сотрудников</span>
          </TabsTrigger>
          <TabsTrigger value="administration">
            <Settings className="h-4 w-4" />
            <span>Администрирование</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-idp" className="mt-4 space-y-6">
          <div className="idp-ritm-soft-panel p-4 mb-4">
            <p className="text-sm font-medium text-foreground">
              Здесь вы можете просматривать и управлять своими индивидуальными планами развития. Создавайте новые ИПР, отслеживайте прогресс по целям, редактируйте планы в статусе "Черновик" или "На согласовании".
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <Button
              onClick={() => handleCreate(true)}
              size="lg"
              className="w-full sm:w-auto rounded-full px-5 shadow-sm idp-ritm-create-btn"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </div>

          {myIDPs.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <NotebookPen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">У вас пока нет индивидуальных планов развития</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте свой первый ИПР, чтобы начать планировать развитие
                  </p>
                  <Button onClick={() => handleCreate(true)} size="lg" className="idp-ritm-create-btn">
                    <Plus className="mr-2 h-4 w-4" />
                    Создать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Активные ИПР */}
              {(() => {
                const activeIDPs = myIDPs.filter((idp) =>
                  ["draft", "in-progress", "pending-approval"].includes(idp.status)
                );
                if (activeIDPs.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Активные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeIDPs.map((idp) => (
                        <Card 
                          key={idp.id} 
                          className="border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => router.push(`/services/idp/${idp.id}`)}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-base">{idp.title}</h3>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      {getIDPTypeText(idp.scenario)}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs px-2 py-0.5", getStatusColor(idp.status))}
                                    >
                                      {getStatusText(idp.status)}
                                    </Badge>
                                  </div>
                                </div>
                                {idp.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {idp.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    {formatDate(idp.startDate)} - {formatDate(idp.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Target className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>Целей: {idp.goals.length}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Архивные ИПР */}
              {(() => {
                const archivedIDPs = myIDPs.filter(
                  (idp) => idp.status === "completed" || idp.status === "cancelled"
                );
                if (archivedIDPs.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Архивные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {archivedIDPs.map((idp) => (
                        <Card 
                          key={idp.id} 
                          className="border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => router.push(`/services/idp/${idp.id}`)}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-base">{idp.title}</h3>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      {getIDPTypeText(idp.scenario)}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs px-2 py-0.5", getStatusColor(idp.status))}
                                    >
                                      {getStatusText(idp.status)}
                                    </Badge>
                                  </div>
                                </div>
                                {idp.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {idp.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    {formatDate(idp.startDate)} - {formatDate(idp.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Target className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>Целей: {idp.goals.length}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="employees-idp" className="mt-4 space-y-4">
          <div className="idp-ritm-soft-panel p-4 mb-4">
            <p className="text-sm font-medium text-foreground">
              Здесь вы можете просматривать и управлять индивидуальными планами развития сотрудников. Используйте поиск и фильтры для быстрого нахождения нужных ИПР. Кликните на ФИО сотрудника для просмотра деталей ИПР.
            </p>
          </div>

          {/* Дешборд статистики ИПР */}
          <div className="flex items-center gap-4 w-full">
            <Card className="p-3 flex-1">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Тип ИПР</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-base">
                    <span className="text-muted-foreground">По компетенциям: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "idp-ritm-badge idp-ritm-badge--blue cursor-pointer",
                        employeesFilters.types.includes("competency") && "ring-2 ring-primary/30"
                      )}
                      onClick={() => {
                        if (employeesFilters.types.includes("competency")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            types: employeesFilters.types.filter((t) => t !== "competency"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            types: [...employeesFilters.types, "competency"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byType.competency}
                    </Badge>
                  </div>
                  <div className="text-base">
                    <span className="text-muted-foreground">Карьерное развитие: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "idp-ritm-badge idp-ritm-badge--violet cursor-pointer",
                        employeesFilters.types.includes("career") && "ring-2 ring-primary/30"
                      )}
                      onClick={() => {
                        if (employeesFilters.types.includes("career")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            types: employeesFilters.types.filter((t) => t !== "career"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            types: [...employeesFilters.types, "career"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byType.career}
                    </Badge>
                  </div>
                  <div className="text-base">
                    <span className="text-muted-foreground">Адаптация: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "idp-ritm-badge idp-ritm-badge--emerald cursor-pointer",
                        employeesFilters.types.includes("adaptation") && "ring-2 ring-primary/30"
                      )}
                      onClick={() => {
                        if (employeesFilters.types.includes("adaptation")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            types: employeesFilters.types.filter((t) => t !== "adaptation"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            types: [...employeesFilters.types, "adaptation"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byType.adaptation}
                    </Badge>
                  </div>
                  {getIDPStatistics.byType.assessment > 0 && (
                    <div className="text-base">
                      <span className="text-muted-foreground">По результатам оценки: </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "idp-ritm-badge idp-ritm-badge--amber cursor-pointer",
                          employeesFilters.types.includes("assessment") && "ring-2 ring-primary/30"
                        )}
                        onClick={() => {
                          if (employeesFilters.types.includes("assessment")) {
                            setEmployeesFilters({
                              ...employeesFilters,
                              types: employeesFilters.types.filter((t) => t !== "assessment"),
                            });
                          } else {
                            setEmployeesFilters({
                              ...employeesFilters,
                              types: [...employeesFilters.types, "assessment"],
                            });
                          }
                          setEmployeesCurrentPage(1);
                        }}
                      >
                        {getIDPStatistics.byType.assessment}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            <Card className="p-3 flex-1">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Статус</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-base">
                    <span className="text-muted-foreground">Черновик: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        getStatusColor("draft"),
                        employeesFilters.statuses.includes("draft") && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        if (employeesFilters.statuses.includes("draft")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: employeesFilters.statuses.filter((s) => s !== "draft"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: [...employeesFilters.statuses, "draft"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byStatus.draft}
                    </Badge>
                  </div>
                  <div className="text-base">
                    <span className="text-muted-foreground">В процессе: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        getStatusColor("in-progress"),
                        employeesFilters.statuses.includes("in-progress") && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        if (employeesFilters.statuses.includes("in-progress")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: employeesFilters.statuses.filter((s) => s !== "in-progress"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: [...employeesFilters.statuses, "in-progress"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byStatus["in-progress"]}
                    </Badge>
                  </div>
                  <div className="text-base">
                    <span className="text-muted-foreground">На согласовании: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        getStatusColor("pending-approval"),
                        employeesFilters.statuses.includes("pending-approval") && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        if (employeesFilters.statuses.includes("pending-approval")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: employeesFilters.statuses.filter((s) => s !== "pending-approval"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: [...employeesFilters.statuses, "pending-approval"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byStatus["pending-approval"]}
                    </Badge>
                  </div>
                  <div className="text-base">
                    <span className="text-muted-foreground">Завершено: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        getStatusColor("completed"),
                        employeesFilters.statuses.includes("completed") && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        if (employeesFilters.statuses.includes("completed")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: employeesFilters.statuses.filter((s) => s !== "completed"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: [...employeesFilters.statuses, "completed"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byStatus.completed}
                    </Badge>
                  </div>
                  <div className="text-base">
                    <span className="text-muted-foreground">Отменено: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer",
                        getStatusColor("cancelled"),
                        employeesFilters.statuses.includes("cancelled") && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        if (employeesFilters.statuses.includes("cancelled")) {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: employeesFilters.statuses.filter((s) => s !== "cancelled"),
                          });
                        } else {
                          setEmployeesFilters({
                            ...employeesFilters,
                            statuses: [...employeesFilters.statuses, "cancelled"],
                          });
                        }
                        setEmployeesCurrentPage(1);
                      }}
                    >
                      {getIDPStatistics.byStatus.cancelled}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Поиск, фильтры и кнопка создания */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ИПР сотрудников..."
                value={employeesSearchQuery}
                onChange={(e) => setEmployeesSearchQuery(e.target.value)}
                className="pl-10"
              />
              {employeesSearchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setEmployeesSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Dialog open={employeesFilterDialogOpen} onOpenChange={setEmployeesFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                  {(() => {
                    const activeFiltersCount = 
                      employeesFilters.statuses.length +
                      employeesFilters.types.length +
                      employeesFilters.scenarios.length;
                    return activeFiltersCount > 0 ? (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    ) : null;
                  })()}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-3">
                  <DialogTitle className="text-lg">Фильтры ИПР</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Фильтр по статусам */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Статус</Label>
                    <div className="space-y-1.5">
                      {(["draft", "in-progress", "pending-approval", "completed", "cancelled"] as const).map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-status-${status}`}
                            checked={employeesFilters.statuses.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEmployeesFilters({
                                  ...employeesFilters,
                                  statuses: [...employeesFilters.statuses, status],
                                });
                              } else {
                                setEmployeesFilters({
                                  ...employeesFilters,
                                  statuses: employeesFilters.statuses.filter((s) => s !== status),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`filter-status-${status}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {getStatusText(status)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Фильтр по типам */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Тип ИПР</Label>
                    <div className="space-y-1.5">
                      {(["competency", "career", "adaptation"] as const).map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-type-${type}`}
                            checked={employeesFilters.types.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEmployeesFilters({
                                  ...employeesFilters,
                                  types: [...employeesFilters.types, type],
                                });
                              } else {
                                setEmployeesFilters({
                                  ...employeesFilters,
                                  types: employeesFilters.types.filter((t) => t !== type),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`filter-type-${type}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {type === "competency" ? "По компетенциям" : type === "career" ? "Карьерное развитие" : "Адаптация"}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Фильтр по сценариям */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Сценарий</Label>
                    <div className="space-y-1.5">
                      {(["classic", "one-to-one"] as const).map((scenario) => (
                        <div key={scenario} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-scenario-${scenario}`}
                            checked={employeesFilters.scenarios.includes(scenario)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEmployeesFilters({
                                  ...employeesFilters,
                                  scenarios: [...employeesFilters.scenarios, scenario],
                                });
                              } else {
                                setEmployeesFilters({
                                  ...employeesFilters,
                                  scenarios: employeesFilters.scenarios.filter((s) => s !== scenario),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`filter-scenario-${scenario}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {getIDPTypeText(scenario)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmployeesFilters({
                        statuses: [],
                        types: [],
                        scenarios: [],
                      });
                      setEmployeesCurrentPage(1);
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button size="sm" onClick={() => {
                    setEmployeesFilterDialogOpen(false);
                    setEmployeesCurrentPage(1);
                  }}>
                    Применить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => handleCreate(false)} size="lg" className="idp-ritm-create-btn rounded-full px-5 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </div>

          {/* Активные фильтры */}
          {(() => {
            const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
            
            employeesFilters.statuses.forEach((status) => {
              activeFilters.push({
                label: `Статус: ${getStatusText(status)}`,
                onRemove: () => setEmployeesFilters({
                  ...employeesFilters,
                  statuses: employeesFilters.statuses.filter((s) => s !== status),
                }),
              });
            });
            
            employeesFilters.types.forEach((type) => {
              const typeLabel = type === "competency" ? "По компетенциям" : type === "career" ? "Карьерное развитие" : "Адаптация";
              activeFilters.push({
                label: `Тип: ${typeLabel}`,
                onRemove: () => setEmployeesFilters({
                  ...employeesFilters,
                  types: employeesFilters.types.filter((t) => t !== type),
                }),
              });
            });
            
            employeesFilters.scenarios.forEach((scenario) => {
              activeFilters.push({
                label: `Сценарий: ${getIDPTypeText(scenario)}`,
                onRemove: () => setEmployeesFilters({
                  ...employeesFilters,
                  scenarios: employeesFilters.scenarios.filter((s) => s !== scenario),
                }),
              });
            });
            
            if (activeFilters.length === 0) return null;
            
            return (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-sm">{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.onRemove}
                      className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Удалить фильтр"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            );
          })()}

          {/* Таблица ИПР сотрудников */}
          {filteredEmployeesIDPs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <NotebookPen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {employeesSearchQuery || employeesFilters.statuses.length > 0 || employeesFilters.types.length > 0 || employeesFilters.scenarios.length > 0
                      ? "ИПР не найдены"
                      : "У сотрудников пока нет ИПР"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {employeesSearchQuery || employeesFilters.statuses.length > 0 || employeesFilters.types.length > 0 || employeesFilters.scenarios.length > 0
                      ? "Попробуйте изменить поисковый запрос или фильтры"
                      : "Создайте первый ИПР для сотрудника"}
                  </p>
                  {!employeesSearchQuery && employeesFilters.statuses.length === 0 && employeesFilters.types.length === 0 && employeesFilters.scenarios.length === 0 && (
                    <Button onClick={() => handleCreate(false)} size="lg" className="idp-ritm-create-btn">
                      <Plus className="mr-2 h-4 w-4" />
                      Создать
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  Найдено: <span className="font-semibold text-foreground">{filteredEmployeesIDPs.length}</span> {filteredEmployeesIDPs.length === 1 ? 'ИПР' : filteredEmployeesIDPs.length > 1 && filteredEmployeesIDPs.length < 5 ? 'ИПР' : 'ИПР'}
                  {filteredEmployeesIDPs.length !== employeesIDPs.length && (
                    <span className="ml-1">из {employeesIDPs.length}</span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[240px]">ФИО</TableHead>
                      <TableHead className="w-[300px]">Название ИПР</TableHead>
                      <TableHead className="w-[80px]">Тип</TableHead>
                      <TableHead className="w-[100px]">Сценарий</TableHead>
                      <TableHead className="w-[180px]">Период</TableHead>
                      <TableHead className="w-[80px]">Статус</TableHead>
                      <TableHead className="w-[70px]">Целей</TableHead>
                      <TableHead className="w-[240px]">Руководитель</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const totalPages = Math.ceil(filteredEmployeesIDPs.length / employeesItemsPerPage);
                      const startIndex = (employeesCurrentPage - 1) * employeesItemsPerPage;
                      const endIndex = startIndex + employeesItemsPerPage;
                      const paginatedIDPs = filteredEmployeesIDPs.slice(startIndex, endIndex);
                      
                      return paginatedIDPs.map((idp) => (
                        <TableRow 
                          key={idp.id}
                        >
                          <TableCell 
                            className="px-4 whitespace-normal cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/services/idp/${idp.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                  {getInitials(idp.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium">{idp.employeeName}</span>
                                <span className="text-sm text-muted-foreground">{idp.employeePosition}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{idp.title}</span>
                              {idp.description && (
                                <span className="text-sm text-muted-foreground line-clamp-2">{idp.description}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <Badge variant="secondary" className="text-xs">
                              {idp.type === "competency" ? "По компетенциям" : idp.type === "career" ? "Карьерное развитие" : "Адаптация"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <Badge variant="outline" className="text-xs">
                              {getIDPTypeText(idp.scenario)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <span className="text-sm">{formatDate(idp.startDate)}-{formatDate(idp.endDate)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn("text-xs px-2 py-0.5", getStatusColor(idp.status))}
                            >
                              {getStatusText(idp.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal text-center">
                            {idp.goals.length}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {idp.managerName ? (
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                    {getInitials(idp.managerName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium">{idp.managerName}</span>
                                  {(() => {
                                    const manager = mockManagers.find(m => m.id === idp.managerId);
                                    return manager ? (
                                      <span className="text-sm text-muted-foreground">{manager.position}</span>
                                    ) : null;
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {(() => {
                const totalPages = Math.ceil(filteredEmployeesIDPs.length / employeesItemsPerPage);
                
                return (
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="employees-items-per-page" className="text-sm text-muted-foreground">
                        Показать:
                      </Label>
                      <Select
                        value={employeesItemsPerPage.toString()}
                        onValueChange={(value) => {
                          setEmployeesItemsPerPage(Number(value));
                          setEmployeesCurrentPage(1);
                        }}
                      >
                        <SelectTrigger id="employees-items-per-page" className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        из {filteredEmployeesIDPs.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Страница {employeesCurrentPage} из {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEmployeesCurrentPage(1)}
                          disabled={employeesCurrentPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEmployeesCurrentPage(employeesCurrentPage - 1)}
                          disabled={employeesCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEmployeesCurrentPage(employeesCurrentPage + 1)}
                          disabled={employeesCurrentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEmployeesCurrentPage(totalPages)}
                          disabled={employeesCurrentPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="administration" className="mt-4 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              В разделе администрирования вы можете управлять всеми индивидуальными планами развития в системе. Здесь доступен полный список ИПР с возможностью поиска, фильтрации и создания новых планов для любых сотрудников.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Администрирование</h2>
            </div>
            <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto rounded-full px-5 shadow-sm idp-ritm-create-btn">
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </div>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по ИПР..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Список ИПР: Активные / Архивные */}
          {filteredIDPs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <NotebookPen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "ИПР не найдены" : "Нет ИПР"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Создайте первый ИПР, чтобы начать работу"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreate} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Создать ИПР
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Активные */}
              {(() => {
                const activeFiltered = filteredIDPs.filter((idp) =>
                  ["draft", "in-progress", "pending-approval"].includes(idp.status)
                );
                if (activeFiltered.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Активные</h2>
                    <div className="space-y-3">
                      {activeFiltered.map((idp) => (
                        <Card
                          key={idp.id}
                          className="border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => router.push(`/services/idp/${idp.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-base mb-1">{idp.title}</h3>
                                    <div className="flex items-center gap-3 mb-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                          {getInitials(idp.employeeName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{idp.employeeName}</p>
                                        <p className="text-xs text-muted-foreground">{idp.employeePosition}</p>
                                      </div>
                                    </div>
                                    {idp.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{idp.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>
                                        <Calendar className="h-3.5 w-3.5 inline mr-1" />
                                        {formatDate(idp.startDate)} - {formatDate(idp.endDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                        {getIDPTypeText(idp.scenario)}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={cn("text-xs px-2 py-0.5", getStatusColor(idp.status))}
                                      >
                                        {getStatusText(idp.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="icon" onClick={() => handleEditIDP(idp)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleDeleteIDP(idp.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Архивные */}
              {(() => {
                const archivedFiltered = filteredIDPs.filter(
                  (idp) => idp.status === "completed" || idp.status === "cancelled"
                );
                if (archivedFiltered.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Архивные</h2>
                    <div className="space-y-3">
                      {archivedFiltered.map((idp) => (
                        <Card
                          key={idp.id}
                          className="border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => router.push(`/services/idp/${idp.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-base mb-1">{idp.title}</h3>
                                    <div className="flex items-center gap-3 mb-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                          {getInitials(idp.employeeName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{idp.employeeName}</p>
                                        <p className="text-xs text-muted-foreground">{idp.employeePosition}</p>
                                      </div>
                                    </div>
                                    {idp.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{idp.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>
                                        <Calendar className="h-3.5 w-3.5 inline mr-1" />
                                        {formatDate(idp.startDate)} - {formatDate(idp.endDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                        {getIDPTypeText(idp.scenario)}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={cn("text-xs px-2 py-0.5", getStatusColor(idp.status))}
                                      >
                                        {getStatusText(idp.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="icon" onClick={() => handleEditIDP(idp)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleDeleteIDP(idp.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог выбора сценария создания ИПР */}
      <Dialog 
        open={isScenarioDialogOpen} 
        onOpenChange={(open) => {
          setIsScenarioDialogOpen(open);
          if (!open) {
            setIsCreatingForCurrentUser(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Выберите сценарий создания ИПР</DialogTitle>
            <DialogDescription>
              Выберите подходящий способ создания индивидуального плана развития
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Классический ИПР */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleOpenCreateDialog("classic")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NotebookPen className="h-5 w-5 text-primary" />
                  Классический ИПР
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Создание индивидуального плана развития с полным набором полей и возможностью детальной настройки всех параметров.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80 mt-0.5 shrink-0" />
                    <span>Выбор типа ИПР, компетенций и связи с оценкой</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80 mt-0.5 shrink-0" />
                    <span>Настройка периода, руководителя и видимости</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80 mt-0.5 shrink-0" />
                    <span>Максимальная гибкость в настройке</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-primary mt-3">
                  Подходит для: планового развития, работы над компетенциями, карьерного роста
                </p>
              </CardContent>
            </Card>

            {/* Результат one to one */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleOpenCreateDialog("one-to-one")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Результат one to one
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Создание ИПР на основе результатов встречи один-на-один с руководителем. План формируется из обсужденных тем и договоренностей.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80 mt-0.5 shrink-0" />
                    <span>Автоматическое заполнение на основе встречи</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80 mt-0.5 shrink-0" />
                    <span>Связь с результатами оценки и обратной связи</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80 mt-0.5 shrink-0" />
                    <span>Быстрое создание после встречи</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-primary mt-3">
                  Подходит для: плановых встреч с руководителем, обсуждения развития, работы над обратной связью
                </p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScenarioDialogOpen(false)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог создания/редактирования ИПР */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setIsCreatingForCurrentUser(false);
            setEditingIDP(null);
            setCurrentStep(1);
            setCreateScenario(null);
            setParticipantScenario(null);
            setIdpErrors({});
            setIDPFormData({
              title: "",
              description: "",
              type: "competency",
              employeeId: "",
              managerId: "",
              startDate: "",
              endDate: "",
              status: "draft",
              competencyIds: [],
              assessmentId: "",
              isVisible: true,
            });
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIDP ? "Редактировать ИПР" : createScenario === "classic" ? "Создать классический ИПР" : "Создать ИПР"}
            </DialogTitle>
            <DialogDescription>
              {editingIDP
                ? "Внесите изменения в индивидуальный план развития"
                : createScenario === "classic"
                ? "Заполните форму пошагово для создания индивидуального плана развития"
                : "Заполните форму для создания нового индивидуального плана развития"}
            </DialogDescription>
          </DialogHeader>

          {/* Пошаговая модель для классического ИПР */}
          {createScenario === "classic" && !editingIDP ? (
            <div className="space-y-6 py-4">
              {/* Список шагов */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 w-full">
                {IDP_STEPS.map((step, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = stepNumber < currentStep;
                  const isCurrent = stepNumber === currentStep;
                  const isAccessible = stepNumber <= currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleStepClick(stepNumber)}
                        disabled={!isAccessible && stepNumber !== currentStep + 1}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full justify-center",
                          "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
                          isCurrent && "bg-primary/10 ring-2 ring-primary shadow-sm",
                          isCompleted && "bg-emerald-500/10 hover:bg-emerald-500/15 dark:bg-emerald-950/15 dark:hover:bg-emerald-950/25",
                          !isCurrent && !isCompleted && isAccessible && "hover:bg-muted"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors flex-shrink-0",
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            stepNumber
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div
                            className={cn(
                              "text-base font-medium truncate",
                              isCurrent && "text-primary font-semibold",
                              isCompleted && "text-emerald-700 dark:text-emerald-300",
                              !isCurrent && !isCompleted && "text-muted-foreground"
                            )}
                            title={step.title}
                          >
                            {step.title}
                          </div>
                        </div>
                      </button>
                      {index < IDP_STEPS.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Заголовок шага */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{IDP_STEPS[currentStep - 1].title}</h3>
                <p className="text-muted-foreground">{IDP_STEPS[currentStep - 1].description}</p>
              </div>

              {/* Содержимое шагов */}
              <div className="min-h-[400px]">
                {/* Шаг 1: Основная информация */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="title">
                          Название ИПР <span className="text-destructive">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => openHelp("title")}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id="title"
                        value={idpFormData.title}
                        onChange={(e) => {
                          setIDPFormData({ ...idpFormData, title: e.target.value });
                          if (idpErrors.title) setIdpErrors({ ...idpErrors, title: "" });
                        }}
                        placeholder="Например: Развитие лидерских компетенций"
                        className={cn("text-base", idpErrors.title && "border-destructive")}
                      />
                      {idpErrors.title && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {idpErrors.title}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="type">
                          Тип ИПР <span className="text-destructive">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => openHelp("type")}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select
                        value={idpFormData.type}
                        onValueChange={(value: IDPType) =>
                          setIDPFormData({ ...idpFormData, type: value })
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Выберите тип ИПР" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assessment">По результатам оценки</SelectItem>
                          <SelectItem value="career">Карьерное развитие</SelectItem>
                          <SelectItem value="adaptation">Адаптация</SelectItem>
                          <SelectItem value="competency">Развитие компетенций</SelectItem>
                          <SelectItem value="new-role">Подготовка к новой роли</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="description">Описание / обоснование</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => openHelp("description")}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        id="description"
                        value={idpFormData.description}
                        onChange={(e) =>
                          setIDPFormData({ ...idpFormData, description: e.target.value })
                        }
                        placeholder="Описание целей и задач ИПР, обоснование необходимости развития"
                        rows={3}
                        className="text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="startDate">
                            Дата начала <span className="text-destructive">*</span>
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => openHelp("startDate")}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          id="startDate"
                          type="date"
                          value={idpFormData.startDate}
                          onChange={(e) => {
                            setIDPFormData({ ...idpFormData, startDate: e.target.value });
                            if (idpErrors.startDate) setIdpErrors({ ...idpErrors, startDate: "" });
                          }}
                          className={cn(idpErrors.startDate && "border-destructive")}
                        />
                        {idpErrors.startDate && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {idpErrors.startDate}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="endDate">
                            Дата окончания <span className="text-destructive">*</span>
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => openHelp("endDate")}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          id="endDate"
                          type="date"
                          value={idpFormData.endDate}
                          onChange={(e) => {
                            setIDPFormData({ ...idpFormData, endDate: e.target.value });
                            if (idpErrors.endDate) setIdpErrors({ ...idpErrors, endDate: "" });
                          }}
                          className={cn(idpErrors.endDate && "border-destructive")}
                        />
                        {idpErrors.endDate && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {idpErrors.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Шаг 2: Участники */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Выбор сценария */}
                    <div className="space-y-3">
                      <Label>Выберите сценарий создания ИПР</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Card
                          className={cn(
                            "cursor-pointer border-2 transition-colors",
                            participantScenario === "for-myself"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => handleParticipantScenarioChange("for-myself")}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                  participantScenario === "for-myself"
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                )}
                              >
                                {participantScenario === "for-myself" && (
                                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Для себя</p>
                                <p className="text-xs text-muted-foreground">
                                  Создание ИПР для текущего пользователя
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className={cn(
                            "cursor-pointer border-2 transition-colors",
                            participantScenario === "for-subordinate"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => handleParticipantScenarioChange("for-subordinate")}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                  participantScenario === "for-subordinate"
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                )}
                              >
                                {participantScenario === "for-subordinate" && (
                                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Для подчиненного</p>
                                <p className="text-xs text-muted-foreground">
                                  Руководитель создает ИПР для своего подчиненного
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Поле сотрудника */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="employee">
                          Сотрудник <span className="text-destructive">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => openHelp("employee")}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      {participantScenario === "for-myself" ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {mockEmployees.find((e) => e.id === currentUserId)?.fullName || ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {mockEmployees.find((e) => e.id === currentUserId)?.position || ""}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Текущий пользователь
                          </Badge>
                        </div>
                      ) : participantScenario === "for-subordinate" ? (
                        <>
                          <Select
                            value={idpFormData.employeeId}
                            onValueChange={(value) => {
                              setIDPFormData({ ...idpFormData, employeeId: value });
                              if (idpErrors.employeeId) setIdpErrors({ ...idpErrors, employeeId: "" });
                            }}
                          >
                            <SelectTrigger id="employee" className={cn(idpErrors.employeeId && "border-destructive")}>
                              <SelectValue placeholder="Выберите подчиненного" />
                            </SelectTrigger>
                            <SelectContent>
                              {subordinates.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.fullName} - {employee.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {idpErrors.employeeId && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {idpErrors.employeeId}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="p-3 bg-muted/50 rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground text-center">
                            Выберите сценарий создания ИПР выше
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Поле руководителя */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="manager">
                          Руководитель <span className="text-destructive">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={() => openHelp("manager")}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      {participantScenario === "for-subordinate" ? (
                        <>
                          <Select
                            value={idpFormData.managerId}
                            onValueChange={(value) => {
                              setIDPFormData({ ...idpFormData, managerId: value });
                              if (idpErrors.managerId) setIdpErrors({ ...idpErrors, managerId: "" });
                            }}
                          >
                            <SelectTrigger id="manager" className={cn(idpErrors.managerId && "border-destructive")}>
                              <SelectValue placeholder="Выберите руководителя" />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                // Получаем текущего пользователя
                                const currentUser = mockEmployees.find((e) => e.id === currentUserId);
                                // Проверяем, есть ли он в списке менеджеров
                                const currentUserAsManager = currentUser
                                  ? mockManagers.find((mgr) => mgr.fullName === currentUser.fullName)
                                  : null;
                                
                                // Если текущий пользователь не в списке менеджеров, но является руководителем, добавляем его
                                const managersList = currentUserAsManager
                                  ? mockManagers
                                  : currentUser && currentUser.position.toLowerCase().includes("руководитель")
                                  ? [
                                      ...mockManagers,
                                      {
                                        id: `mgr-current-${currentUserId}`,
                                        fullName: currentUser.fullName,
                                        position: currentUser.position,
                                      },
                                    ]
                                  : mockManagers;
                                
                                return managersList.map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    {manager.fullName} - {manager.position}
                                  </SelectItem>
                                ));
                              })()}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Вы можете выбрать себя в качестве руководителя
                          </p>
                        </>
                      ) : participantScenario === "for-myself" ? (
                        <>
                          <Select
                            value={idpFormData.managerId}
                            onValueChange={(value) => {
                              setIDPFormData({ ...idpFormData, managerId: value });
                              if (idpErrors.managerId) setIdpErrors({ ...idpErrors, managerId: "" });
                            }}
                          >
                            <SelectTrigger id="manager" className={cn(idpErrors.managerId && "border-destructive")}>
                              <SelectValue placeholder="Выберите руководителя" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockManagers.map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.fullName} - {manager.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Руководитель согласует и контролирует выполнение ИПР
                          </p>
                        </>
                      ) : (
                        <div className="p-3 bg-muted/50 rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground text-center">
                            Выберите сценарий создания ИПР выше
                          </p>
                        </div>
                      )}
                      {idpErrors.managerId && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {idpErrors.managerId}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Шаг 3: Компетенции и оценка */}
                {currentStep === 3 && (() => {
                  // Проверяем наличие оценочных процедур для выбранного сотрудника
                  // В реальном приложении это будет проверка через API
                  // Для примера: если у сотрудника есть ИПР с оценкой, значит у него есть оценочные процедуры
                  const selectedEmployee = mockEmployees.find((e) => e.id === idpFormData.employeeId);
                  const hasAssessments = selectedEmployee 
                    ? mockAssessments.length > 0 // В реальном приложении будет проверка конкретных оценок сотрудника
                    : false;
                  
                  // Максимальное количество компетенций
                  const MAX_COMPETENCIES = 8;
                  
                  return (
                    <div className="space-y-6">
                      {/* Поле связи с оценкой - показываем только если есть оценочные процедуры */}
                      {hasAssessments ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="assessment" className="flex items-center gap-2">
                              <ClipboardCheck className="h-4 w-4" />
                              Связь с оценкой
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("assessment")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <Select
                            value={idpFormData.assessmentId || "none"}
                            onValueChange={(value) =>
                              setIDPFormData({ ...idpFormData, assessmentId: value === "none" ? "" : value })
                            }
                          >
                            <SelectTrigger id="assessment">
                              <SelectValue placeholder="Выберите оценку (опционально)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Не выбрано</SelectItem>
                              {mockAssessments.map((assessment) => (
                                <SelectItem key={assessment.id} value={assessment.id}>
                                  {assessment.name} ({assessment.type}, {formatDate(assessment.date)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Выберите оценку, по результатам которой создается ИПР
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-muted/50 rounded-md border border-dashed">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                У выбранного сотрудника нет оценочных процедур
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Вы можете выбрать компетенции для развития без связи с оценкой
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Компетенции для развития
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("competencies")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          {idpFormData.competencyIds.length > 0 && (
                            <span className={cn(
                              "text-xs",
                              idpFormData.competencyIds.length > MAX_COMPETENCIES
                                ? "text-destructive font-semibold"
                                : idpFormData.competencyIds.length === MAX_COMPETENCIES
                                ? "text-amber-600 font-medium"
                                : "text-muted-foreground"
                            )}>
                              {idpFormData.competencyIds.length}/{MAX_COMPETENCIES}
                            </span>
                          )}
                        </div>
                        <MultiSelect
                          options={competenciesWithAssessments.map((comp) => {
                            const avgLevel = comp.averageLevel;
                            return {
                              value: comp.id,
                              label: comp.name,
                              badge: avgLevel !== null 
                                ? avgLevel.toFixed(1)
                                : "не оценивались",
                              badgeClassName: avgLevel !== null
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-gray-50 text-gray-600 border-gray-300",
                            };
                          })}
                          selected={idpFormData.competencyIds}
                          onChange={(values) => {
                            // Ограничиваем количество компетенций
                            if (values.length <= MAX_COMPETENCIES) {
                              setIDPFormData({ ...idpFormData, competencyIds: values });
                              if (idpErrors.competencies) setIdpErrors({ ...idpErrors, competencies: "" });
                            }
                          }}
                          placeholder="Выберите компетенции (максимум 8)"
                        />
                        <div className="flex items-start justify-between">
                          <p className="text-xs text-muted-foreground">
                            Выберите компетенции, которые планируется развивать. Максимум {MAX_COMPETENCIES} компетенций.
                          </p>
                        </div>
                        {idpErrors.competencies && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {idpErrors.competencies}
                          </p>
                        )}
                        {!idpErrors.competencies && idpFormData.competencyIds.length > MAX_COMPETENCIES && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Превышено максимальное количество компетенций ({MAX_COMPETENCIES}). Пожалуйста, удалите лишние компетенции.
                          </p>
                        )}
                        {!idpErrors.competencies && idpFormData.competencyIds.length === MAX_COMPETENCIES && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Достигнуто максимальное количество компетенций ({MAX_COMPETENCIES}).
                          </p>
                        )}
                        {idpFormData.competencyIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {idpFormData.competencyIds.map((compId) => {
                              const comp = competenciesWithAssessments.find((c) => c.id === compId);
                              if (!comp) return null;
                              const avgLevel = comp.averageLevel;
                              return (
                                <div 
                                  key={compId} 
                                  className="inline-flex items-center gap-1"
                                >
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs"
                                  >
                                    {comp.name}
                                  </Badge>
                                  {avgLevel !== null ? (
                                    <Badge 
                                      variant="outline" 
                                      className="bg-primary/10 text-primary border-primary/20 text-xs"
                                    >
                                      {avgLevel.toFixed(1)}
                                    </Badge>
                                  ) : (
                                    <Badge 
                                      variant="outline" 
                                      className="bg-gray-50 text-gray-600 border-gray-300 text-xs"
                                    >
                                      не оценивались
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}


              </div>

              {/* Навигация */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePrevStep} size="sm">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Назад
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentStep < IDP_STEPS.length ? (
                    <Button onClick={handleNextStep} size="sm">
                      Далее
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={handleSaveIDP} size="sm" className="idp-ritm-create-btn">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Создать
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Обычная форма для редактирования и one-to-one */
            <div className="space-y-4 py-4">
            {/* Название ИПР */}
            <div className="space-y-2">
              <Label htmlFor="title">Название ИПР *</Label>
              <Input
                id="title"
                value={idpFormData.title}
                onChange={(e) =>
                  setIDPFormData({ ...idpFormData, title: e.target.value })
                }
                placeholder="Например: Развитие лидерских компетенций"
              />
            </div>

            {/* Тип ИПР */}
            <div className="space-y-2">
              <Label htmlFor="type">Тип ИПР *</Label>
              <Select
                value={idpFormData.type}
                onValueChange={(value: IDPType) =>
                  setIDPFormData({ ...idpFormData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Выберите тип ИПР" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assessment">По результатам оценки</SelectItem>
                  <SelectItem value="career">Карьерное развитие</SelectItem>
                  <SelectItem value="adaptation">Адаптация</SelectItem>
                  <SelectItem value="competency">Развитие компетенций</SelectItem>
                  <SelectItem value="new-role">Подготовка к новой роли</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание / обоснование</Label>
              <Textarea
                id="description"
                value={idpFormData.description}
                onChange={(e) =>
                  setIDPFormData({ ...idpFormData, description: e.target.value })
                }
                placeholder="Описание целей и задач ИПР, обоснование необходимости развития"
                rows={3}
              />
            </div>

            <Separator />

            {/* Сотрудник */}
            <div className="space-y-2">
              <Label htmlFor="employee">Сотрудник *</Label>
              {isCreatingForCurrentUser && !editingIDP ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {mockEmployees.find((e) => e.id === idpFormData.employeeId)?.fullName || ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mockEmployees.find((e) => e.id === idpFormData.employeeId)?.position || ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Текущий пользователь
                  </Badge>
                </div>
              ) : (
                <Select
                  value={idpFormData.employeeId}
                  onValueChange={(value) =>
                    setIDPFormData({ ...idpFormData, employeeId: value })
                  }
                  disabled={isCreatingForCurrentUser && !editingIDP}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.fullName} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Руководитель */}
            <div className="space-y-2">
              <Label htmlFor="manager">Руководитель *</Label>
              <Select
                value={idpFormData.managerId}
                onValueChange={(value) =>
                  setIDPFormData({ ...idpFormData, managerId: value })
                }
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Выберите руководителя" />
                </SelectTrigger>
                <SelectContent>
                  {mockManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.fullName} - {manager.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Руководитель согласует и контролирует выполнение ИПР
              </p>
            </div>

            {/* Период */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Дата начала *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={idpFormData.startDate}
                  onChange={(e) =>
                    setIDPFormData({ ...idpFormData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={idpFormData.endDate}
                  onChange={(e) =>
                    setIDPFormData({ ...idpFormData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Связь с оценкой */}
            <div className="space-y-2">
              <Label htmlFor="assessment" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Связь с оценкой
              </Label>
              <Select
                value={idpFormData.assessmentId || "none"}
                onValueChange={(value) =>
                  setIDPFormData({ ...idpFormData, assessmentId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger id="assessment">
                  <SelectValue placeholder="Выберите оценку (опционально)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не выбрано</SelectItem>
                  {mockAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.name} ({assessment.type}, {formatDate(assessment.date)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Выберите оценку, по результатам которой создается ИПР
              </p>
            </div>

            {/* Компетенции для развития */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Компетенции для развития
              </Label>
              <MultiSelect
                options={mockCompetencies.map((comp) => ({
                  value: comp.id,
                  label: comp.name,
                  badge: comp.category,
                }))}
                selected={idpFormData.competencyIds}
                onChange={(values) =>
                  setIDPFormData({ ...idpFormData, competencyIds: values })
                }
                placeholder="Выберите компетенции"
              />
              <p className="text-xs text-muted-foreground">
                Выберите компетенции, которые планируется развивать
              </p>
              {idpFormData.competencyIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {idpFormData.competencyIds.map((compId) => {
                    const comp = mockCompetencies.find((c) => c.id === compId);
                    return comp ? (
                      <Badge key={compId} variant="secondary" className="text-xs">
                        {comp.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            </div>
          )}

          {/* Footer для обычной формы (редактирование и one-to-one) */}
          {(!createScenario || createScenario !== "classic" || editingIDP) && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveIDP}>
                {editingIDP ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно с подсказками */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {helpContent?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {helpContent?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Примеры заполнения */}
            {helpContent?.examples && helpContent.examples.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Примеры заполнения:
                </Label>
                <div className="space-y-2">
                  {helpContent.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                      <p className="text-sm">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Советы */}
            {helpContent?.tips && helpContent.tips.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600/80" />
                  Советы по заполнению:
                </Label>
                <ul className="space-y-2">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-600/80 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Частые ошибки */}
            {helpContent?.commonMistakes && helpContent.commonMistakes.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-700/80" />
                  Частые ошибки:
                </Label>
                <ul className="space-y-2">
                  {helpContent.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-700/80 mt-1">⚠</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Дополнительная информация */}
            {helpContent?.additionalInfo && (
              <div className="idp-ritm-info-panel space-y-2 p-4">
                <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Info className="h-4 w-4" />
                  Дополнительная информация:
                </Label>
                <p className="text-sm text-muted-foreground">
                  {helpContent.additionalInfo}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
