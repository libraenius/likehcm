"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, ClipboardCheck, Users, Settings, ExternalLink, FileText, Calendar, Link2, Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, X, ChevronLeft, ChevronsLeft, ChevronsRight, AlertCircle, Mail, Send, CheckCircle2, Clock, MapPin, Building2, Archive, ArchiveRestore, Filter, SortAsc, SortDesc, BarChart3, MessageSquare, History, FileText as FileTextIcon, Edit3, Copy, Tag, Eye, EyeOff, Star, UserCheck, User, ArrowRight, HelpCircle, Handshake, MessageCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EvaluationDialog } from "@/components/internships/evaluation-dialog";
import { getStatusBadgeColor, getCooperationLineBadgeColor } from "@/lib/badge-colors";
import type { 
  Internship, 
  InternshipApplication, 
  InternshipStatus, 
  ApplicationStatus,
  InternshipStudent,
  InternshipSettings,
  InternshipStatistics,
  InternshipEvaluation,
} from "@/types/internships";
import { 
  mockInternships, 
  mockApplications, 
  mockStudents, 
  mockMentors,
  defaultInternshipSettings 
} from "@/lib/internships/mock-data";
import {
  canChangeInternshipStatus,
  canChangeApplicationStatus,
  calculateMatchScore,
  canSubmitApplication,
  formParticipantList,
  shouldAutoCloseApplications,
  calculateConversionRate,
  canStartInternship,
  getNextReserveStudent,
} from "@/lib/internships/business-logic";

// Тип для куратора от филиала
interface BranchCurator {
  id: string;
  city: string;
  branch: string;
  image?: string;
  cooperationLines?: CooperationLineRecord[]; // Линии сотрудничества для филиала
  cooperationStartYear?: number; // Год начала сотрудничества
}

// Тип для договора
interface Contract {
  id: string;
  type: "cooperation" | "scholarship" | "internship" | "bankDepartment";
  hasContract: boolean;
  contractFile?: string; // URL или путь к файлу
  number?: string; // Номер договора
  date?: string; // Дата договора
  period?: { start: string; end: string }; // Период действия (начало - конец)
  asddLink?: string; // Ссылка на АСДД
  contractBranch?: string; // Головной офис или филиал (только одно значение)
}

// Тип для кафедры банка
interface BankDepartment {
  id: string;
  name: string; // Название кафедры
}

// Тип для мероприятия
interface Event {
  id: string;
  type: "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication"; // Тип мероприятия
  date: string; // Дата начала проведения
  endDate: string; // Дата окончания проведения
  status: "planned" | "in_progress" | "completed"; // Статус мероприятия
  comments?: string; // Комментарии
  responsiblePerson: string[]; // Ответственные лица Банк (массив ID)
  responsiblePersonImage?: string; // Фото ответтельного лица (устаревшее, для обратной совместимости)
}

// Тип для стажера
interface Intern {
  id: string;
  employeeName: string; // ФИО сотрудника
  age: number; // Возраст
  position: string; // Должность
  department: string; // Подразделение
  hireDate: string; // Дата приема на работу (формат YYYY-MM-DD)
  status: "active" | "dismissed"; // Статус: работает или уволен
  dismissalDate?: string; // Дата увольнения (формат YYYY-MM-DD)
  practiceInBank: boolean; // Практика в банке: да/нет
  internshipInBank: boolean; // Стажировка в банке: да/нет
  internshipStartDate?: string; // Дата начала стажировки в банке (формат YYYY-MM-DD)
  internshipEndDate?: string; // Дата окончания стажировки в банке (формат YYYY-MM-DD)
}

// Тип для практиканта (аналогичен стажеру)
interface Practitioner {
  id: string;
  employeeName: string; // ФИО сотрудника
  age: number; // Возраст
  position: string; // Должность
  department: string; // Подразделение
  hireDate: string; // Дата приема на работу (формат YYYY-MM-DD)
  status: "active" | "dismissed"; // Статус: работает или уволен
  dismissalDate?: string; // Дата увольнения (формат YYYY-MM-DD)
  internshipInBank: boolean; // Стажировка в банке: да/нет
  internshipStartDate?: string; // Дата начала стажировки в банке (формат YYYY-MM-DD)
  internshipEndDate?: string; // Дата окончания стажировки в банке (формат YYYY-MM-DD)
  practiceStartDate: string; // Дата начала практики (формат YYYY-MM-DD)
  practiceEndDate: string; // Дата окончания практики (формат YYYY-MM-DD)
  practiceSupervisor?: string; // Руководитель практики
  practiceStatus?: "not_meets" | "meets" | "exceeds"; // Статус: не соответствует / соответствует / превосходит ожидания
  addedBy: string; // Сотрудник, добавивший запись
  comment?: string; // Комментарий
}

// Тип для участника кейс-чемпионата
interface CaseChampionshipParticipant {
  id: string;
  employeeName: string; // ФИО участника
  eventId: string; // ID мероприятия (кейс-чемпионата)
  status: "registered" | "participated" | "winner" | "prize_winner"; // Статус: зарегистрирован, участвовал, победитель, призёр
  comments?: string; // Комментарии к участию
}

// Тип для целевого практиканта
interface TargetPractitioner {
  id: string;
  employeeName: string; // ФИО практиканта
  targetStartDate: string; // Дата начала целевой практики (формат YYYY-MM-DD)
  targetEndDate: string; // Дата окончания целевой практики (формат YYYY-MM-DD)
  department?: string; // Подразделение
  practiceSupervisor?: string; // Руководитель практики
  comments?: string; // Комментарии
}

// Тип для элемента инфраструктуры ЦНТР
interface CNTRInfrastructureItem {
  id: string;
  developmentType: "financing" | "endowment" | "endowment-fund"; // Вид развития
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента проекта ЦНТР
interface CNTRProjectItem {
  id: string;
  projectName: string; // Название проекта
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  fundingAmount?: number; // Размер финансирования (в рублях)
  supportFormat?: "grant-cofinancing" | "ordered-rd-center-lift" | "targeted-charity"; // Формат поддержки
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента акселератора ЦНТР
interface CNTRAcceleratorItem {
  id: string;
  developmentType?: "financing" | "endowment" | "endowment-fund"; // Вид развития (опционально, для обратной совместимости)
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента мероприятий ЦНТР
interface CNTREventItem {
  id: string;
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента образовательных проектов ЦНТР
interface CNTREducationalProjectItem {
  id: string;
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для элемента соглашений о сотрудничестве ЦНТР
interface CNTRAgreementItem {
  id: string;
  date: string; // Дата (формат YYYY-MM-DD)
  branch?: string; // Головной ВУЗ или филиал
  status?: "in-progress" | "signed"; // Статус: в процессе или подписано
  description?: string; // Описание
  document?: string; // Документ (URL или путь к PDF файлу)
}

// Тип для университета
type CooperationLine = "drp" | "bko" | "cntr";

// Интерфейс для записи линии сотрудничества
interface CooperationLineRecord {
  id: string;
  line: CooperationLine;
  year: number;
  responsible: string[]; // Массив ID ответственных лиц
}

interface University {
  id: string;
  name: string;
  shortName?: string;
  inn?: string; // ИНН
  city: string;
  branch?: string[]; // Филиалы в ГПБ
  cooperationStartYear?: number;
  cooperationLine?: CooperationLine | CooperationLine[]; // Линия сотрудничества (строка для обратной совместимости или массив) - старая версия
  cooperationLineYear?: number;
  cooperationLineResponsible?: string | string[]; // Ответственные лица (строка для обратной совместимости или массив) - старая версия
  cooperationLines?: CooperationLineRecord[]; // Новый формат: массив записей линий сотрудничества
  targetAudience?: string;
  initiatorBlock?: string; // Инициатор сотрудничества (блок/ССП)
  initiatorName?: string; // Инициатор сотрудничества (ФИО)
  initiatorPosition?: string; // Должность инициатора
  initiatorImage?: string; // Фото инициатора
  branchCurators?: BranchCurator[]; // Кураторы от филиалов
  contracts?: Contract[]; // Договоры
  bankDepartments?: BankDepartment[]; // Кафедры банка
  events?: Event[]; // Мероприятия
  careerDays?: boolean; // Дни карьеры
  expertParticipation?: boolean; // Экспертное участие
  caseChampionships?: boolean; // Кейс-чемпионаты
  allEmployees?: number; // Все сотрудники
  internHiring?: boolean; // Найм стажеров
  averageInternsPerYear?: number; // Среднее количество стажеров в год
  interns?: number; // Практиканты
  internList?: Intern[]; // Список стажеров
  practitionerList?: Practitioner[]; // Список практикантов
  caseChampionshipParticipants?: CaseChampionshipParticipant[]; // Участники кейс-чемпионатов
  targetPractitioners?: TargetPractitioner[]; // Целевые практиканты
  cntrInfrastructure?: CNTRInfrastructureItem[]; // Элементы инфраструктуры ЦНТР
  cntrProjects?: CNTRProjectItem[]; // Элементы проектов ЦНТР
  cntrAcceleratorEnabled?: boolean; // Участие в Акселераторе Газпромбанк.Тех: Наука
  cntrAcceleratorItems?: CNTRAcceleratorItem[]; // Элементы акселератора ЦНТР
  cntrEventsItems?: CNTREventItem[]; // Элементы мероприятий ЦНТР
  cntrEducationalProjectsItems?: CNTREducationalProjectItem[]; // Элементы образовательных проектов ЦНТР
  cntrAgreementEnabled?: boolean; // Соглашение о сотрудничестве
  cntrAgreementItems?: CNTRAgreementItem[]; // Элементы соглашений о сотрудничестве ЦНТР
  region?: string;
  description?: string;
  image?: string; // Фото/логотип ВУЗа
  bkoData?: {
    // Блок Зарплатный проект
    salaryProject?: {
      students?: boolean; // Студенты
      employees?: boolean; // Сотрудники
    };
    // Блок Транзакционные продукты
    transactionalProducts?: {
      ie?: boolean; // ИЭ
      te?: boolean; // ТЭ
      sbp?: boolean; // СБП
      adm?: boolean; // АДМ
    };
    // Блок Лимит
    limit?: boolean;
    // Блок УК ГПБ фондами ЦК
    ukGpbFundsCk?: boolean;
    // Комментарий
    comment?: string;
  };
}

// Тип для партнерства - удален

// Тип для студента
interface Student {
  id: string;
  fullName: string;
  position?: string;
  email: string;
  status: "invited" | "in-progress" | "completed" | "not-started";
  departmentId?: string;
  uniqueLink?: string;
}

// Структура подразделений
interface Department {
  id: string;
  name: string;
  parentId?: string;
}

// Моковые данные подразделений
const mockDepartments: Department[] = [
  { id: "dept-1", name: "Департамент автоматизации внутренних сервисов" },
  { id: "dept-2", name: "Управление развития общекорпоративных систем", parentId: "dept-1" },
  { id: "dept-3", name: "Управление разработки банковских продуктов", parentId: "dept-1" },
  { id: "dept-4", name: "Департамент информационной безопасности" },
  { id: "dept-5", name: "Управление качества и тестирования" },
];

// Интерфейс сотрудника из штатного расписания
interface Employee {
  id: string;
  fullName: string;
  position: string;
  email: string;
  departmentId?: string;
}

// Моковые данные сотрудников из штатного расписания
const mockEmployees: Employee[] = [
  { id: "emp-1", fullName: "Петров Иван Сергеевич", position: "Главный инженер", email: "ivan.petrov@example.com", departmentId: "dept-2" },
  { id: "emp-2", fullName: "Сидорова Мария Александровна", position: "Ведущий разработчик", email: "maria.sidorova@example.com", departmentId: "dept-2" },
  { id: "emp-3", fullName: "Иванов Алексей Дмитриевич", position: "Старший разработчик", email: "alexey.ivanov@example.com", departmentId: "dept-3" },
];

// Интерфейс для уведомления
interface Notification {
  id: string;
  subject: string;
  message: string;
  recipientIds: string[];
  recipientEmails: string[];
  sentAt: Date;
  status: "sent" | "pending" | "failed";
}

// Интерфейс для комментария
interface Comment {
  id: string;
  partnershipId: string;
  author: string;
  text: string;
  createdAt: Date;
}

// Интерфейс для истории изменений
interface ChangeHistory {
  id: string;
  partnershipId?: string;
  universityId?: string;
  action: "created" | "updated" | "deleted" | "status_changed" | "student_added" | "student_removed";
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: Date;
}

// Интерфейс для шаблона email
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// Расширенный интерфейс партнерства - удален

// Моковые данные для истории уведомлений
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    subject: "Приглашение на стажировку",
    message: "Уважаемые студенты, приглашаем вас принять участие в программе стажировки...",
    recipientIds: ["student-1", "student-2", "student-3"],
    recipientEmails: ["student1@university.edu", "student2@university.edu", "student3@university.edu"],
    sentAt: new Date("2024-01-15T10:30:00"),
    status: "sent",
  },
];

// Моковые данные университетов
const mockUniversities: University[] = [
  {
    id: "univ-1",
    name: "Московский государственный университет имени М.В. Ломоносова",
    shortName: "МГУ",
    inn: "7707083893",
    city: "Москва",
    branch: ["Московский филиал"],
    cooperationStartYear: 2020,
    cooperationLines: [
      {
        id: "clr-mgu-1",
        line: "drp",
        year: 2020,
        responsible: ["person-1", "person-2"],
      },
      {
        id: "clr-mgu-2",
        line: "bko",
        year: 2022,
        responsible: ["person-3"],
      },
    ],
    targetAudience: "Студенты IT-направлений",
    initiatorBlock: "Блок развития",
    initiatorName: "Иванов Иван Иванович",
    initiatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { 
        id: "cur-1", 
        city: "Москва", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-1-1", line: "drp", year: 2020, responsible: ["person-1"] },
          { id: "clr-cur-1-2", line: "bko", year: 2021, responsible: ["person-2"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-1", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-mgu-2020.pdf",
        number: "Д-2020-001",
        date: "2020-03-15",
        period: { start: "2020-03-15", end: "2025-03-14" },
        asddLink: "https://asdd.example.com/contract/2020-001",
        contractBranch: "Головной офис"
      },
      { 
        id: "cont-2", 
        type: "internship", 
        hasContract: true, 
        contractFile: "contract-mgu-internship.pdf",
        number: "Д-2021-045",
        date: "2021-06-10",
        period: { start: "2021-06-10", end: "2026-06-09" },
        asddLink: "https://asdd.example.com/contract/2021-045",
        contractBranch: "Московский филиал"
      },
    ],
    events: [
      {
        id: "event-mgu-1",
        type: "careerDays",
        date: "2024-02-10",
        endDate: "2024-02-12",
        status: "completed",
        responsiblePerson: ["person-1"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        comments: "Дни карьеры для студентов факультета вычислительной математики и кибернетики.",
      },
      {
        id: "event-mgu-2",
        type: "expertParticipation",
        date: "2024-06-15",
        endDate: "2024-06-15",
        status: "completed",
        responsiblePerson: ["person-2"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        comments: "Участие в качестве эксперта на защите магистерских диссертаций.",
      },
    ],
    careerDays: true,
    expertParticipation: true,
    caseChampionships: true,
    allEmployees: 150,
    internHiring: true,
    averageInternsPerYear: 25,
    interns: 10,
    internList: [
      {
        id: "intern-mgu-1",
        employeeName: "Иванов Иван Иванович",
        age: 23,
        position: "Стажер-разработчик",
        department: "Департамент автоматизации внутренних сервисов",
        hireDate: "2024-01-15",
        status: "active",
        practiceInBank: true,
        internshipInBank: true,
        internshipStartDate: "2023-06-01",
        internshipEndDate: "2023-08-31",
      },
      {
        id: "intern-mgu-2",
        employeeName: "Петрова Мария Сергеевна",
        age: 24,
        position: "Стажер-аналитик",
        department: "Управление развития общекорпоративных систем",
        hireDate: "2024-02-01",
        status: "active",
        practiceInBank: true,
        internshipInBank: true,
        internshipStartDate: "2023-07-15",
        internshipEndDate: "2023-09-30",
      },
      {
        id: "intern-mgu-3",
        employeeName: "Сидоров Алексей Дмитриевич",
        age: 22,
        position: "Стажер-тестировщик",
        department: "Управление качества и тестирования",
        hireDate: "2024-03-10",
        status: "dismissed",
        dismissalDate: "2024-06-15",
        practiceInBank: false,
        internshipInBank: false,
      },
    ],
    region: "Московская область",
    description: "Ведущий университет России",
    image: "https://via.placeholder.com/100?text=МГУ",
  },
  {
    id: "univ-2",
    name: "Санкт-Петербургский государственный университет",
    shortName: "СПбГУ",
    inn: "7801002016",
    city: "Санкт-Петербург",
    branch: ["Санкт-Петербургский филиал"],
    cooperationStartYear: 2019,
    cooperationLines: [
      {
        id: "clr-spbgu-1",
        line: "bko",
        year: 2019,
        responsible: ["person-4", "person-5"],
      },
      {
        id: "clr-spbgu-2",
        line: "cntr",
        year: 2021,
        responsible: ["person-6"],
      },
    ],
    targetAudience: "Студенты экономических направлений",
    initiatorBlock: "Блок управления",
    initiatorName: "Смирнова Анна Владимировна",
    initiatorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { 
        id: "cur-2", 
        city: "Санкт-Петербург", 
        branch: "Санкт-Петербургский филиал", 
        cooperationLines: [
          { id: "clr-cur-2-1", line: "bko", year: 2019, responsible: ["person-4"] },
        ],
        cooperationStartYear: 2019,
      },
      { 
        id: "cur-3", 
        city: "Санкт-Петербург", 
        branch: "Центральный офис", 
        cooperationLines: [
          { id: "clr-cur-3-1", line: "drp", year: 2020, responsible: ["person-5"] },
          { id: "clr-cur-3-2", line: "bko", year: 2020, responsible: ["person-6"] },
          { id: "clr-cur-3-3", line: "cntr", year: 2021, responsible: ["person-7"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-3", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2019-078",
        date: "2019-09-01",
        period: { start: "2019-09-01", end: "2024-08-31" },
        asddLink: "https://asdd.example.com/contract/2019-078",
        contractBranch: "Санкт-Петербургский филиал"
      },
      { 
        id: "cont-4", 
        type: "scholarship", 
        hasContract: true, 
        contractFile: "contract-spbgu-scholarship.pdf",
        number: "Д-2022-012",
        date: "2022-02-20",
        period: { start: "2022-02-20", end: "2027-02-19" },
        contractBranch: "Головной офис"
      },
    ],
    events: [
      {
        id: "event-spbgu-1",
        type: "careerDays",
        date: "2024-03-20",
        endDate: "2024-03-22",
        status: "completed",
        responsiblePerson: ["person-3"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        comments: "Дни карьеры для студентов экономического факультета СПбГУ.",
      },
      {
        id: "event-spbgu-2",
        type: "caseChampionships",
        date: "2024-05-25",
        endDate: "2024-05-27",
        status: "completed",
        responsiblePerson: ["person-4"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        comments: "Кейс-чемпионат по финансовому моделированию.",
      },
    ],
    careerDays: true,
    expertParticipation: false,
    caseChampionships: true,
    allEmployees: 120,
    internHiring: true,
    averageInternsPerYear: 18,
    interns: 8,
    region: "Ленинградская область",
    description: "Один из старейших университетов России",
    image: "https://via.placeholder.com/100?text=СПбГУ",
  },
  {
    id: "univ-3",
    name: "Московский физико-технический институт",
    shortName: "МФТИ",
    inn: "5001002222",
    city: "Долгопрудный",
    branch: ["Московский филиал"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-mfti-1",
        line: "drp",
        year: 2021,
        responsible: ["person-7"],
      },
      {
        id: "clr-mfti-2",
        line: "bko",
        year: 2021,
        responsible: ["person-8", "person-9"],
      },
      {
        id: "clr-mfti-3",
        line: "cntr",
        year: 2023,
        responsible: ["person-10"],
      },
    ],
    targetAudience: "Студенты технических направлений",
    initiatorBlock: "Блок технологий",
    initiatorName: "Соколов Алексей Николаевич",
    branchCurators: [
      { 
        id: "cur-4", 
        city: "Долгопрудный", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-4-1", line: "drp", year: 2021, responsible: ["person-7"] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-5", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2021-033",
        date: "2021-04-12",
        period: { start: "2021-04-12", end: "2026-04-11" },
        asddLink: "https://asdd.example.com/contract/2021-033",
        contractBranch: "Московский филиал"
      },
      { 
        id: "cont-6", 
        type: "internship", 
        hasContract: true, 
        contractFile: "contract-mfti-internship.pdf",
        number: "Д-2023-089",
        date: "2023-08-05",
        period: { start: "2023-08-05", end: "2028-08-04" },
        contractBranch: "Головной офис"
      },
    ],
    events: [
      {
        id: "event-mfti-1",
        type: "expertParticipation",
        date: "2024-04-05",
        endDate: "2024-04-05",
        status: "completed",
        responsiblePerson: ["person-5"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        comments: "Участие в качестве эксперта на конференции по машинному обучению.",
      },
      {
        id: "event-mfti-2",
        type: "caseChampionships",
        date: "2024-06-01",
        endDate: "2024-06-03",
        status: "completed",
        responsiblePerson: ["person-6"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
        comments: "Кейс-чемпионат по разработке финансовых алгоритмов.",
      },
      {
        id: "event-mfti-3",
        type: "expertParticipation",
        date: "2024-11-10",
        endDate: "2024-11-10",
        status: "planned",
        responsiblePerson: ["person-7"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        comments: "Планируется участие в качестве эксперта на защите дипломных проектов.",
      },
    ],
    careerDays: false,
    expertParticipation: true,
    caseChampionships: true,
    allEmployees: 95,
    internHiring: true,
    averageInternsPerYear: 30,
    interns: 15,
    region: "Московская область",
    description: "Ведущий технический университет",
    image: "https://via.placeholder.com/100?text=МФТИ",
  },
  {
    id: "univ-4",
    name: "Национальный исследовательский университет «Высшая школа экономики»",
    shortName: "НИУ ВШЭ",
    inn: "7707083893",
    city: "Москва",
    branch: ["Московский филиал", "Центральный офис"],
    cooperationStartYear: 2018,
    cooperationLines: [
      {
        id: "clr-hse-1",
        line: "drp",
        year: 2018,
        responsible: ["person-1", "person-3"],
      },
      {
        id: "clr-hse-2",
        line: "bko",
        year: 2019,
        responsible: ["person-2", "person-4"],
      },
      {
        id: "clr-hse-3",
        line: "cntr",
        year: 2020,
        responsible: ["person-5"],
      },
    ],
    targetAudience: "Студенты экономики, менеджмента и IT",
    initiatorBlock: "Блок стратегии",
    initiatorName: "Морозова Ольга Александровна",
    initiatorPosition: "Руководитель направления развития талантов",
    branchCurators: [
      { 
        id: "cur-5", 
        city: "Москва", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-5-1", line: "drp", year: 2018, responsible: ["person-1"] },
          { id: "clr-cur-5-2", line: "bko", year: 2019, responsible: ["person-3"] },
        ],
        cooperationStartYear: 2018,
      },
      { 
        id: "cur-6", 
        city: "Москва", 
        branch: "Центральный офис", 
        cooperationLines: [
          { id: "clr-cur-6-1", line: "drp", year: 2018, responsible: ["person-1", "person-3"] },
        ],
        cooperationStartYear: 2018,
      },
    ],
    contracts: [
      { 
        id: "cont-7", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-hse-2018.pdf",
        number: "Д-2018-056",
        date: "2018-11-20",
        period: { start: "2018-11-20", end: "2023-11-19" },
        asddLink: "https://asdd.example.com/contract/2018-056",
        contractBranch: "Головной офис"
      },
      { 
        id: "cont-8", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2020-102",
        date: "2020-05-18",
        period: { start: "2020-05-18", end: "2025-05-17" },
        contractBranch: "Московский филиал"
      },
      { 
        id: "cont-9", 
        type: "internship", 
        hasContract: true,
        number: "Д-2022-067",
        date: "2022-07-22",
        period: { start: "2022-07-22", end: "2027-07-21" },
        asddLink: "https://asdd.example.com/contract/2022-067",
        contractBranch: "Головной офис"
      },
      { 
        id: "cont-hse-1", 
        type: "bankDepartment", 
        hasContract: true,
        number: "Д-2023-145",
        date: "2023-03-10",
        period: { start: "2023-03-10", end: "2028-03-09" },
        asddLink: "https://asdd.example.com/contract/2023-145",
        contractBranch: "Московский филиал",
        contractFile: "contract-hse-bank-department-2023.pdf"
      },
      { 
        id: "cont-hse-2", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2024-089",
        date: "2024-01-15",
        period: { start: "2024-01-15", end: "2029-01-14" },
        asddLink: "https://asdd.example.com/contract/2024-089",
        contractBranch: "Центральный офис",
        contractFile: "contract-hse-cooperation-2024.pdf"
      },
      { 
        id: "cont-hse-3", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2023-278",
        date: "2023-09-05",
        period: { start: "2023-09-05", end: "2028-09-04" },
        contractBranch: "Головной офис"
      },
      { 
        id: "cont-hse-4", 
        type: "internship", 
        hasContract: true,
        number: "Д-2024-156",
        date: "2024-06-01",
        period: { start: "2024-06-01", end: "2029-05-31" },
        asddLink: "https://asdd.example.com/contract/2024-156",
        contractBranch: "Московский филиал",
        contractFile: "contract-hse-internship-2024.pdf"
      },
      { 
        id: "cont-hse-5", 
        type: "bankDepartment", 
        hasContract: true,
        number: "Д-2022-334",
        date: "2022-12-20",
        period: { start: "2022-12-20", end: "2027-12-19" },
        contractBranch: "Головной офис"
      },
    ],
    events: [
      {
        id: "event-hse-1",
        type: "careerDays",
        date: "2024-03-15",
        endDate: "2024-03-17",
        status: "completed",
        responsiblePerson: ["person-1"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        comments: "Проведены дни карьеры для студентов экономического факультета. Участвовало более 150 студентов.",
      },
      {
        id: "event-hse-2",
        type: "expertParticipation",
        date: "2024-04-20",
        endDate: "2024-04-20",
        status: "completed",
        responsiblePerson: ["person-2"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        comments: "Участие в качестве эксперта на защите дипломных работ по направлению 'Финансы и кредит'.",
      },
      {
        id: "event-hse-3",
        type: "caseChampionships",
        date: "2024-05-10",
        endDate: "2024-05-12",
        status: "completed",
        responsiblePerson: ["person-3"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        comments: "Кейс-чемпионат по банковскому делу. Победила команда студентов 3 курса.",
      },
      {
        id: "event-hse-4",
        type: "careerDays",
        date: "2024-09-25",
        endDate: "2024-09-27",
        status: "planned",
        responsiblePerson: ["person-4"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        comments: "Запланированы дни карьеры для студентов IT-направления. Ожидается участие 200+ студентов.",
      },
      {
        id: "event-hse-5",
        type: "expertParticipation",
        date: "2024-10-15",
        endDate: "2024-10-15",
        status: "planned",
        responsiblePerson: ["person-5"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        comments: "Планируется участие в качестве эксперта на конференции по финансовым технологиям.",
      },
      {
        id: "event-hse-6",
        type: "caseChampionships",
        date: "2024-11-20",
        endDate: "2024-11-22",
        status: "planned",
        responsiblePerson: ["person-6"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        comments: "Организация кейс-чемпионата по управлению рисками в банковской сфере.",
      },
      {
        id: "event-hse-7",
        type: "careerDays",
        date: "2024-12-05",
        endDate: "2024-12-07",
        status: "planned",
        responsiblePerson: ["person-7"],
        responsiblePersonImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
        comments: "Дни карьеры для выпускников магистратуры. Фокус на карьерные возможности в банковском секторе.",
      },
    ],
    careerDays: true,
    expertParticipation: true,
    caseChampionships: true,
    allEmployees: 200,
    internHiring: true,
    averageInternsPerYear: 35,
    interns: 100,
    internList: (() => {
      const departments = [
        "Департамент автоматизации внутренних сервисов",
        "Управление развития общекорпоративных систем",
        "Управление разработки банковских продуктов",
        "Департамент информационной безопасности",
        "Управление качества и тестирования",
      ];
      const positions = [
        "Стажер-экономист",
        "Стажер-финансист",
        "Стажер-разработчик",
        "Стажер-аналитик",
        "Стажер-тестировщик",
        "Стажер-менеджер",
        "Стажер-дизайнер",
        "Стажер-маркетолог",
      ];
      const firstNames = [
        "Александр", "Алексей", "Андрей", "Антон", "Артем", "Борис", "Вадим", "Василий",
        "Виктор", "Владимир", "Дмитрий", "Евгений", "Иван", "Игорь", "Константин", "Максим",
        "Михаил", "Николай", "Олег", "Павел", "Роман", "Сергей", "Станислав", "Юрий",
        "Анна", "Валентина", "Валерия", "Вера", "Галина", "Дарья", "Елена", "Ирина",
        "Ксения", "Лариса", "Мария", "Наталья", "Ольга", "Светлана", "Татьяна", "Юлия",
      ];
      const lastNames = [
        "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Соколов", "Лебедев",
        "Козлов", "Новиков", "Морозов", "Петров", "Волков", "Соловьев", "Васильев", "Зайцев",
        "Павлов", "Семенов", "Голубев", "Виноградов", "Богданов", "Воробьев", "Федоров", "Михайлов",
        "Белов", "Тарасов", "Беляев", "Комаров", "Орлов", "Киселев", "Макаров", "Андреев",
        "Ковалев", "Ильин", "Гусев", "Титов", "Кузьмин", "Кудрявцев", "Баранов", "Куликов",
      ];
      const middleNames = [
        "Александрович", "Алексеевич", "Андреевич", "Антонович", "Артемович", "Борисович",
        "Вадимович", "Васильевич", "Викторович", "Владимирович", "Дмитриевич", "Евгеньевич",
        "Иванович", "Игоревич", "Константинович", "Максимович", "Михайлович", "Николаевич",
        "Олегович", "Павлович", "Романович", "Сергеевич", "Станиславович", "Юрьевич",
        "Александровна", "Алексеевна", "Андреевна", "Антоновна", "Артемовна", "Борисовна",
        "Вадимовна", "Васильевна", "Викторовна", "Владимировна", "Дмитриевна", "Евгеньевна",
        "Ивановна", "Игоревна", "Константиновна", "Максимовна", "Михайловна", "Николаевна",
        "Олеговна", "Павловна", "Романовна", "Сергеевна", "Станиславовна", "Юрьевна",
      ];
      
      const interns: Intern[] = [];
      
      // Добавляем стажеров с именами практикантов/участников/целевых практикантов для отображения tooltip
      const practiceEmployees = [
        // Практиканты
        { name: "Соколова Анастасия Дмитриевна", age: 22, position: "Стажер-экономист", department: "Департамент информационной безопасности", hireDate: "2024-01-15" },
        { name: "Тихонов Артем Викторович", age: 23, position: "Стажер-разработчик", department: "Управление разработки банковских продуктов", hireDate: "2024-02-20" },
        { name: "Романова Екатерина Сергеевна", age: 21, position: "Стажер-аналитик", department: "Департамент автоматизации внутренних сервисов", hireDate: "2024-03-10" },
        { name: "Григорьев Максим Александрович", age: 24, position: "Стажер-финансист", department: "Управление развития общекорпоративных систем", hireDate: "2024-04-05" },
        { name: "Федорова Виктория Игоревна", age: 22, position: "Стажер-тестировщик", department: "Управление качества и тестирования", hireDate: "2024-05-12" },
        // Участники кейс-чемпионатов
        { name: "Белова Анастасия Игоревна", age: 22, position: "Стажер-экономист", department: "Департамент автоматизации внутренних сервисов", hireDate: "2024-01-20" },
        { name: "Громов Кирилл Александрович", age: 23, position: "Стажер-аналитик", department: "Управление разработки банковских продуктов", hireDate: "2024-02-15" },
        { name: "Денисова Полина Сергеевна", age: 21, position: "Стажер-экономист", department: "Департамент информационной безопасности", hireDate: "2024-03-01" },
        { name: "Егоров Станислав Дмитриевич", age: 24, position: "Стажер-разработчик", department: "Управление развития общекорпоративных систем", hireDate: "2024-03-15" },
        { name: "Жукова Виктория Андреевна", age: 22, position: "Стажер-тестировщик", department: "Управление качества и тестирования", hireDate: "2024-04-01" },
        // Целевые практиканты
        { name: "Соколов Дмитрий Петрович", age: 23, position: "Стажер-разработчик", department: "Департамент автоматизации внутренних сервисов", hireDate: "2025-01-15" },
        { name: "Морозова Анна Сергеевна", age: 22, position: "Стажер-разработчик", department: "Управление разработки банковских продуктов", hireDate: "2024-11-15" },
        { name: "Волков Павел Александрович", age: 24, position: "Стажер-аналитик", department: "Департамент информационной безопасности", hireDate: "2024-08-15" },
      ];
      
      practiceEmployees.forEach((emp, index) => {
        const hireDateObj = new Date(emp.hireDate);
        const status: "active" | "dismissed" = "active";
        const internshipInBank = Math.random() < 0.6;
        let internshipStartDate: string | undefined;
        let internshipEndDate: string | undefined;
        
        if (internshipInBank) {
          const internshipStart = new Date(hireDateObj);
          internshipStart.setMonth(internshipStart.getMonth() - Math.floor(Math.random() * 6) - 1);
          internshipStartDate = internshipStart.toISOString().split('T')[0];
          const internshipEnd = new Date(internshipStart);
          internshipEnd.setMonth(internshipEnd.getMonth() + Math.floor(Math.random() * 3) + 2);
          internshipEndDate = internshipEnd.toISOString().split('T')[0];
        }
        
        interns.push({
          id: `intern-hse-practice-${index + 1}`,
          employeeName: emp.name,
          age: emp.age,
          position: emp.position,
          department: emp.department,
          hireDate: emp.hireDate,
          status,
          practiceInBank: true, // Все эти стажеры имеют практику
          internshipInBank,
          internshipStartDate,
          internshipEndDate,
        });
      });
      
      const startDate = new Date("2022-01-01");
      const endDate = new Date("2024-12-31");
      
      for (let i = 1; i <= 87; i++) { // Уменьшил с 100 до 87, чтобы всего было 100 (13 + 87)
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
        const fullName = `${lastName} ${firstName} ${middleName}`;
        
        const age = 20 + Math.floor(Math.random() * 11); // 20-30 лет
        const position = positions[Math.floor(Math.random() * positions.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        
        // Случайная дата приема между 2022 и 2024
        const hireDateObj = new Date(
          startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
        );
        const hireDate = hireDateObj.toISOString().split('T')[0];
        
        // 85% активных, 15% уволенных
        const status: "active" | "dismissed" = Math.random() < 0.15 ? "dismissed" : "active";
        
        let dismissalDate: string | undefined;
        if (status === "dismissed") {
          const dismissalDateObj = new Date(hireDateObj);
          dismissalDateObj.setMonth(dismissalDateObj.getMonth() + Math.floor(Math.random() * 12) + 1);
          if (dismissalDateObj > new Date()) {
            dismissalDateObj.setMonth(dismissalDateObj.getMonth() - 6);
          }
          dismissalDate = dismissalDateObj.toISOString().split('T')[0];
        }
        
        // 60% имеют стажировку в банке
        const internshipInBank = Math.random() < 0.6;
        let internshipStartDate: string | undefined;
        let internshipEndDate: string | undefined;
        
        if (internshipInBank) {
          const internshipStart = new Date(hireDateObj);
          internshipStart.setMonth(internshipStart.getMonth() - Math.floor(Math.random() * 6) - 1);
          internshipStartDate = internshipStart.toISOString().split('T')[0];
          
          const internshipEnd = new Date(internshipStart);
          internshipEnd.setMonth(internshipEnd.getMonth() + Math.floor(Math.random() * 3) + 2);
          internshipEndDate = internshipEnd.toISOString().split('T')[0];
        }
        
        // 50% имеют практику в банке
        const practiceInBank = Math.random() < 0.5;
        
        interns.push({
          id: `intern-hse-${i}`,
          employeeName: fullName,
          age,
          position,
          department,
          hireDate,
          status,
          dismissalDate,
          practiceInBank,
          internshipInBank,
          internshipStartDate,
          internshipEndDate,
        });
      }
      
      return interns;
    })(),
    practitionerList: (() => {
      const departments = [
        "Департамент автоматизации внутренних сервисов",
        "Управление развития общекорпоративных систем",
        "Управление разработки банковских продуктов",
        "Департамент информационной безопасности",
        "Управление качества и тестирования",
      ];
      const positions = [
        "Практикант-экономист",
        "Практикант-финансист",
        "Практикант-разработчик",
        "Практикант-аналитик",
        "Практикант-тестировщик",
      ];
      const practitioners: Practitioner[] = [
        {
          id: "pract-hse-1",
          employeeName: "Соколова Анастасия Дмитриевна",
          age: 22,
          position: "Практикант-экономист",
          department: "Департамент информационной безопасности",
          hireDate: "2024-01-15",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2023-06-01",
          internshipEndDate: "2023-08-31",
          practiceStartDate: "2024-01-15",
          practiceEndDate: "2024-05-31",
          practiceSupervisor: "Иванов Иван Иванович",
          practiceStatus: "exceeds",
          addedBy: "Иванов Иван Иванович",
          comment: "Отличные результаты в работе с финансовыми данными",
        },
        {
          id: "pract-hse-2",
          employeeName: "Тихонов Артем Викторович",
          age: 23,
          position: "Практикант-разработчик",
          department: "Управление разработки банковских продуктов",
          hireDate: "2024-02-20",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2023-09-01",
          internshipEndDate: "2023-11-30",
          practiceStartDate: "2024-02-20",
          practiceEndDate: "2024-06-20",
          practiceSupervisor: "Петрова Мария Сергеевна",
          practiceStatus: "exceeds",
          addedBy: "Петрова Мария Сергеевна",
          comment: "Активно участвует в разработке новых функций",
        },
        {
          id: "pract-hse-3",
          employeeName: "Романова Екатерина Сергеевна",
          age: 21,
          position: "Практикант-аналитик",
          department: "Департамент автоматизации внутренних сервисов",
          hireDate: "2024-03-10",
          status: "active",
          internshipInBank: false,
          practiceStartDate: "2024-03-10",
          practiceEndDate: "2024-07-10",
          practiceSupervisor: "Сидоров Алексей Дмитриевич",
          practiceStatus: "meets",
          addedBy: "Сидоров Алексей Дмитриевич",
          comment: "Показывает хорошие аналитические способности",
        },
        {
          id: "pract-hse-4",
          employeeName: "Григорьев Максим Александрович",
          age: 24,
          position: "Практикант-финансист",
          department: "Управление развития общекорпоративных систем",
          hireDate: "2024-04-05",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2023-12-01",
          internshipEndDate: "2024-02-29",
          practiceStartDate: "2024-04-05",
          practiceEndDate: "2024-08-05",
          practiceSupervisor: "Козлова Елена Владимировна",
          practiceStatus: "meets",
          addedBy: "Козлова Елена Владимировна",
          comment: "Ответственный подход к работе",
        },
        {
          id: "pract-hse-5",
          employeeName: "Федорова Виктория Игоревна",
          age: 22,
          position: "Практикант-тестировщик",
          department: "Управление качества и тестирования",
          hireDate: "2024-05-12",
          status: "active",
          internshipInBank: false,
          practiceStartDate: "2024-05-12",
          practiceEndDate: "2024-09-12",
          practiceSupervisor: "Волков Дмитрий Николаевич",
          practiceStatus: "meets",
          addedBy: "Волков Дмитрий Николаевич",
          comment: "Внимательность к деталям при тестировании",
        },
        {
          id: "pract-hse-6",
          employeeName: "Кузнецов Денис Олегович",
          age: 25,
          position: "Практикант-экономист",
          department: "Департамент информационной безопасности",
          hireDate: "2023-11-20",
          status: "dismissed",
          dismissalDate: "2024-06-15",
          internshipInBank: true,
          internshipStartDate: "2023-05-01",
          internshipEndDate: "2023-07-31",
          practiceStartDate: "2023-11-20",
          practiceEndDate: "2024-03-20",
          practiceSupervisor: "Новикова Анна Петровна",
          practiceStatus: "not_meets",
          addedBy: "Новикова Анна Петровна",
          comment: "Практика завершена досрочно",
        },
        {
          id: "pract-hse-7",
          employeeName: "Орлова Мария Павловна",
          age: 23,
          position: "Практикант-разработчик",
          department: "Управление разработки банковских продуктов",
          hireDate: "2024-06-01",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2024-01-15",
          internshipEndDate: "2024-03-31",
          practiceStartDate: "2024-06-01",
          practiceEndDate: "2024-10-01",
          practiceSupervisor: "Морозов Сергей Александрович",
          practiceStatus: "exceeds",
          addedBy: "Морозов Сергей Александрович",
          comment: "Быстро осваивает новые технологии",
        },
        {
          id: "pract-hse-8",
          employeeName: "Семенов Игорь Борисович",
          age: 24,
          position: "Практикант-аналитик",
          department: "Департамент автоматизации внутренних сервисов",
          hireDate: "2024-07-10",
          status: "active",
          internshipInBank: false,
          practiceStartDate: "2024-07-10",
          practiceEndDate: "2024-11-10",
          practiceSupervisor: "Лебедев Сергей Викторович",
          practiceStatus: "meets",
          addedBy: "Лебедев Сергей Викторович",
          comment: "Хорошо работает с большими объемами данных",
        },
        {
          id: "pract-hse-9",
          employeeName: "Виноградова Ольга Николаевна",
          age: 22,
          position: "Практикант-финансист",
          department: "Управление развития общекорпоративных систем",
          hireDate: "2024-08-20",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2024-02-01",
          internshipEndDate: "2024-04-30",
          practiceStartDate: "2024-08-20",
          practiceEndDate: "2024-12-20",
          practiceSupervisor: "Федорова Мария Дмитриевна",
          practiceStatus: "exceeds",
          addedBy: "Федорова Мария Дмитриевна",
          comment: "Проявляет инициативу в решении задач",
        },
        {
          id: "pract-hse-10",
          employeeName: "Богданов Андрей Владимирович",
          age: 23,
          position: "Практикант-тестировщик",
          department: "Управление качества и тестирования",
          hireDate: "2024-09-05",
          status: "active",
          internshipInBank: true,
          internshipStartDate: "2024-03-01",
          internshipEndDate: "2024-05-31",
          practiceStartDate: "2024-09-05",
          practiceEndDate: "2025-01-05",
          practiceSupervisor: "Иванов Иван Иванович",
          practiceStatus: "meets",
          addedBy: "Иванов Иван Иванович",
          comment: "Качественное тестирование продуктов",
        },
      ];
      
      return practitioners;
    })(),
    caseChampionshipParticipants: [
      { id: "ccp-hse-1", employeeName: "Белова Анастасия Игоревна", eventId: "event-hse-3", status: "winner", comments: "Отличное выступление на финальном этапе. Демонстрировала глубокое понимание финансового моделирования." },
      { id: "ccp-hse-2", employeeName: "Громов Кирилл Александрович", eventId: "event-hse-3", status: "prize_winner", comments: "Показал хорошие аналитические навыки при решении кейса." },
      { id: "ccp-hse-3", employeeName: "Денисова Полина Сергеевна", eventId: "event-hse-3", status: "prize_winner" },
      { id: "ccp-hse-4", employeeName: "Егоров Станислав Дмитриевич", eventId: "event-hse-3", status: "participated" },
      { id: "ccp-hse-5", employeeName: "Жукова Виктория Андреевна", eventId: "event-hse-3", status: "participated", comments: "Активное участие в командной работе." },
      { id: "ccp-hse-6", employeeName: "Захаров Артём Олегович", eventId: "event-hse-3", status: "participated" },
      { id: "ccp-hse-7", employeeName: "Ильина Светлана Владимировна", eventId: "event-hse-6", status: "registered" },
      { id: "ccp-hse-8", employeeName: "Калинин Роман Петрович", eventId: "event-hse-6", status: "registered" },
    ],
    targetPractitioners: [
      { id: "tp-hse-1", employeeName: "Соколов Дмитрий Петрович", targetStartDate: "2025-02-01", targetEndDate: "2025-05-31", department: "Департамент автоматизации внутренних сервисов", practiceSupervisor: "Иванов Иван Иванович", comments: "Запланирована целевая практика для изучения банковских процессов." },
      { id: "tp-hse-2", employeeName: "Морозова Анна Сергеевна", targetStartDate: "2024-12-01", targetEndDate: "2025-03-31", department: "Управление разработки банковских продуктов", practiceSupervisor: "Петрова Мария Сергеевна", comments: "Активно проходит целевую практику. Показывает хорошие результаты в разработке." },
      { id: "tp-hse-3", employeeName: "Волков Павел Александрович", targetStartDate: "2024-09-01", targetEndDate: "2024-12-31", department: "Департамент информационной безопасности", practiceSupervisor: "Сидоров Алексей Дмитриевич", comments: "Успешно завершил целевую практику. Рекомендован к трудоустройству." },
      { id: "tp-hse-4", employeeName: "Козлова Мария Дмитриевна", targetStartDate: "2025-03-15", targetEndDate: "2025-07-15", department: "Управление качества и тестирования", practiceSupervisor: "Козлова Елена Владимировна" },
      { id: "tp-hse-5", employeeName: "Новиков Игорь Владимирович", targetStartDate: "2025-01-10", targetEndDate: "2025-04-10", department: "Управление развития общекорпоративных систем", practiceSupervisor: "Федоров Сергей Николаевич", comments: "Проходит целевую практику в области системной разработки." },
    ],
    cntrInfrastructure: [
      { 
        id: "cntr-infra-hse-1", 
        developmentType: "financing", 
        date: "2023-05-15", 
        branch: "Головной ВУЗ",
        description: "Финансирование направлено на развитие современных исследовательских лабораторий и приобретение высокотехнологичного оборудования для научных исследований. Проект включает создание центра обработки данных, модернизацию инфраструктуры связи и внедрение передовых технологий в образовательный процесс. Ожидается значительное повышение качества научных исследований и привлечение талантливых ученых.",
        document: "https://example.com/documents/infrastructure-financing-2023.pdf"
      },
      { 
        id: "cntr-infra-hse-2", 
        developmentType: "endowment", 
        date: "2023-09-20", 
        branch: "Московский филиал",
        description: "Эндаумент фонд создан для обеспечения долгосрочной финансовой стабильности научно-технологической инфраструктуры университета. Средства фонда используются для поддержки инновационных проектов, развития исследовательской базы и привлечения ведущих специалистов. Фонд управляется профессиональной командой с учетом международных стандартов инвестирования и прозрачности использования средств.",
        document: "https://example.com/documents/endowment-fund-2023.pdf"
      },
    ],
    cntrProjects: [
      {
        id: "cntr-project-hse-1",
        projectName: "Разработка платформы для анализа больших данных",
        date: "2023-03-10",
        branch: "Головной ВУЗ",
        fundingAmount: 15000000,
        supportFormat: "grant-cofinancing",
        description: "Проект направлен на создание инновационной платформы для обработки и анализа больших объемов данных в режиме реального времени. Платформа будет использоваться для научных исследований в области машинного обучения, искусственного интеллекта и анализа финансовых рынков. Проект предполагает тесное сотрудничество с ведущими исследовательскими центрами и промышленными партнерами.",
        document: "https://example.com/documents/big-data-platform-2023.pdf"
      },
      {
        id: "cntr-project-hse-2",
        projectName: "Центр квантовых вычислений и криптографии",
        date: "2024-01-20",
        branch: "Московский филиал",
        fundingAmount: 25000000,
        supportFormat: "ordered-rd-center-lift",
        description: "Проект по созданию центра квантовых вычислений и разработке новых методов криптографической защиты информации. Центр объединит исследователей в области квантовой физики, информатики и математики для решения задач создания безопасных коммуникационных систем нового поколения. Ожидается значительный вклад в развитие национальной технологической безопасности и создание инновационных продуктов для финансового сектора."
      },
    ],
    cntrAcceleratorEnabled: true,
    cntrAcceleratorItems: [
      {
        id: "cntr-accelerator-hse-1",
        developmentType: "financing",
        date: "2023-06-15",
        branch: "Головной ВУЗ",
        description: "Участие в акселераторе Газпромбанк.Тех: Наука направлено на поддержку инновационных стартапов в области финансовых технологий и искусственного интеллекта. Проект предусматривает менторскую поддержку, доступ к инфраструктуре банка и возможность тестирования решений в реальных условиях. Ожидается создание перспективных технологических решений для банковского сектора.",
        document: "https://example.com/documents/accelerator-hse-2023.pdf"
      },
      {
        id: "cntr-accelerator-hse-2",
        developmentType: "endowment",
        date: "2024-03-20",
        branch: "Московский филиал",
        description: "Второй проект в рамках акселератора связан с разработкой решений для анализа больших данных в финансовой сфере. Проект объединяет экспертизу университета в области data science с практическим опытом банка в обработке финансовой информации. Результатом станет создание платформы для интеллектуального анализа финансовых потоков и прогнозирования рыночных тенденций."
      },
    ],
    cntrEventsItems: [
      {
        id: "cntr-event-hse-1",
        date: "2023-09-15",
        branch: "Головной ВУЗ",
        description: "Международная конференция по финансовым технологиям и цифровой экономике. Мероприятие собрало ведущих экспертов в области финтех, представителей банковского сектора и академического сообщества. Обсуждены вопросы развития цифровых платежных систем, блокчейн-технологий и искусственного интеллекта в финансовой сфере.",
        document: "https://example.com/documents/fintech-conference-2023.pdf"
      },
      {
        id: "cntr-event-hse-2",
        date: "2023-11-20",
        branch: "Московский филиал",
        description: "День карьеры для студентов IT-направлений. Банк представил возможности стажировок и трудоустройства для студентов ВШЭ. Проведены мастер-классы по финансовому моделированию, разработке банковских систем и работе с большими данными. Более 200 студентов приняли участие в мероприятии.",
        document: "https://example.com/documents/career-day-hse-2023.pdf"
      },
      {
        id: "cntr-event-hse-3",
        date: "2024-02-10",
        branch: "Головной ВУЗ",
        description: "Семинар по применению машинного обучения в банковской аналитике. Эксперты банка поделились опытом использования алгоритмов машинного обучения для оценки кредитных рисков, выявления мошенничества и персонализации финансовых продуктов. Студенты и преподаватели ВШЭ представили результаты своих исследований.",
      },
      {
        id: "cntr-event-hse-4",
        date: "2024-04-25",
        branch: "Головной ВУЗ",
        description: "Кейс-чемпионат по финансовому моделированию и анализу данных. Студенты ВШЭ решали реальные бизнес-кейсы, предоставленные банком. Участники разрабатывали модели для прогнозирования оттока клиентов, оптимизации продуктовой линейки и оценки эффективности маркетинговых кампаний. Победители получили приглашение на стажировку в банке.",
        document: "https://example.com/documents/case-championship-2024.pdf"
      },
      {
        id: "cntr-event-hse-5",
        date: "2024-06-12",
        branch: "Московский филиал",
        description: "Выпускное мероприятие программы стажировок для студентов ВШЭ. Подведены итоги годовой программы сотрудничества, награждены лучшие стажеры. Выпускники программы поделились опытом работы в банке и возможностями карьерного роста. Заключены соглашения о дальнейшем сотрудничестве и развитии совместных образовательных программ.",
      },
    ],
    cntrEducationalProjectsItems: [
      {
        id: "cntr-educational-project-hse-1",
        date: "2023-10-05",
        branch: "Головной ВУЗ",
        description: "Разработка совместной магистерской программы по финансовым технологиям. Программа объединяет академическую подготовку ВШЭ в области IT и экономики с практическим опытом банка в разработке финансовых продуктов. Студенты получают возможность работать над реальными проектами банка, проходить стажировки и защищать дипломные работы на актуальных для банка темах.",
        document: "https://example.com/documents/master-program-fintech-2023.pdf"
      },
      {
        id: "cntr-educational-project-hse-2",
        date: "2024-01-15",
        branch: "Московский филиал",
        description: "Создание специализированного курса по анализу больших данных в финансовой сфере. Курс разработан для студентов бакалавриата и магистратуры IT-направлений. Преподаватели банка проводят практические занятия, студенты работают с реальными данными банка (обезличенными) и решают практические задачи по прогнозированию, кластеризации клиентов и выявлению мошенничества.",
      },
      {
        id: "cntr-educational-project-hse-3",
        date: "2024-05-20",
        branch: "Головной ВУЗ",
        description: "Организация программы профессиональной переподготовки для выпускников ВШЭ. Программа направлена на переквалификацию специалистов из смежных областей в банковскую сферу. Включает интенсивное обучение основам банковского дела, финансового анализа, риск-менеджмента и цифровых технологий. Выпускники программы получают возможность трудоустройства в банке на позиции младших и средних специалистов.",
        document: "https://example.com/documents/re-qualification-program-2024.pdf"
      },
    ],
    cntrAgreementEnabled: true,
    cntrAgreementItems: [
      {
        id: "cntr-agreement-hse-1",
        date: "2023-07-20",
        branch: "Головной ВУЗ",
        status: "signed",
        description: "Соглашение о долгосрочном сотрудничестве между Национальным исследовательским университетом «Высшая школа экономики» и Газпромбанком. Соглашение охватывает совместные образовательные программы, научно-исследовательские проекты, программы стажировок и трудоустройства выпускников. Предусмотрено создание совместных лабораторий и центров компетенций в области финансовых технологий и анализа данных.",
        document: "https://example.com/documents/agreement-hse-2023.pdf"
      },
    ],
    region: "Московская область",
    description: "Ведущий экономический и IT-университет",
    image: "https://www.hse.ru//images/main/main_logo_ru_full.svg",
  },
  {
    id: "univ-5",
    name: "Уральский федеральный университет имени первого Президента России Б.Н. Ельцина",
    shortName: "УрФУ",
    inn: "6663003127",
    city: "Екатеринбург",
    branch: ["Уральский филиал"],
    cooperationStartYear: 2022,
    cooperationLines: [
      {
        id: "clr-urfu-1",
        line: "drp",
        year: 2022,
        responsible: ["person-7", "person-8"],
      },
    ],
    targetAudience: "Студенты IT и инженерии",
    initiatorBlock: "Блок развития",
    initiatorName: "Тихонов Андрей Борисович",
    branchCurators: [
      { 
        id: "cur-7", 
        city: "Екатеринбург", 
        branch: "Уральский филиал", 
        cooperationLines: [
          { id: "clr-cur-7-1", line: "drp", year: 2022, responsible: ["person-7"] },
          { id: "clr-cur-7-2", line: "cntr", year: 2022, responsible: ["person-8"] },
        ],
        cooperationStartYear: 2022,
      },
    ],
    contracts: [
      { 
        id: "cont-10", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-urfu-2022.pdf",
        number: "Д-2022-134",
        date: "2022-10-08",
        period: { start: "2022-10-08", end: "2027-10-07" },
        asddLink: "https://asdd.example.com/contract/2022-134",
        contractBranch: "Уральский филиал"
      },
    ],
    careerDays: true,
    expertParticipation: false,
    caseChampionships: false,
    allEmployees: 80,
    internHiring: true,
    averageInternsPerYear: 15,
    interns: 5,
    region: "Свердловская область",
    description: "Крупнейший университет Урала",
    image: "https://via.placeholder.com/100?text=УрФУ",
  },
  {
    id: "univ-6",
    name: "Новосибирский государственный университет",
    shortName: "НГУ",
    inn: "5406000010",
    city: "Новосибирск",
    branch: ["Сибирский филиал"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-ngu-1",
        line: "cntr",
        year: 2021,
        responsible: ["person-9"],
      },
    ],
    targetAudience: "Студенты математики и IT",
    initiatorBlock: "Блок технологий",
    initiatorName: "Павлов Денис Олегович",
    branchCurators: [
      { 
        id: "cur-8", 
        city: "Новосибирск", 
        branch: "Сибирский филиал", 
        cooperationLines: [
          { id: "clr-cur-8-1", line: "drp", year: 2021, responsible: ["person-9"] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-11", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2021-091",
        date: "2021-12-14",
        period: { start: "2021-12-14", end: "2026-12-13" },
        contractBranch: "Сибирский филиал"
      },
      { 
        id: "cont-12", 
        type: "internship", 
        hasContract: true, 
        contractFile: "contract-ngu-internship.pdf",
        number: "Д-2023-156",
        date: "2023-03-28",
        period: { start: "2023-03-28", end: "2028-03-27" },
        asddLink: "https://asdd.example.com/contract/2023-156",
        contractBranch: "Головной офис"
      },
    ],
    careerDays: false,
    expertParticipation: true,
    caseChampionships: true,
    allEmployees: 70,
    internHiring: true,
    averageInternsPerYear: 12,
    interns: 6,
    region: "Новосибирская область",
    description: "Ведущий научный университет Сибири",
    image: "https://via.placeholder.com/100?text=НГУ",
  },
  {
    id: "univ-7",
    name: "Казанский (Приволжский) федеральный университет",
    shortName: "КФУ",
    inn: "1654001840",
    city: "Казань",
    branch: ["Приволжский филиал"],
    cooperationStartYear: 2020,
    cooperationLines: [
      {
        id: "clr-kfu-1",
        line: "drp",
        year: 2020,
        responsible: ["person-1", "person-5"],
      },
      {
        id: "clr-kfu-2",
        line: "bko",
        year: 2021,
        responsible: ["person-6"],
      },
    ],
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Гарифуллин Рамиль Фаритович",
    branchCurators: [
      { 
        id: "cur-9", 
        city: "Казань", 
        branch: "Приволжский филиал", 
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        cooperationLines: [
          { id: "clr-cur-9-1", line: "drp", year: 2020, responsible: ["person-1", "person-5"] },
          { id: "clr-cur-9-2", line: "bko", year: 2020, responsible: ["person-5"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-13", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-kfu-2020.pdf",
        number: "Д-2020-124",
        date: "2020-08-25",
        period: { start: "2020-08-25", end: "2025-08-24" },
        asddLink: "https://asdd.example.com/contract/2020-124",
        contractBranch: "Приволжский филиал"
      },
      { 
        id: "cont-14", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2021-198",
        date: "2021-09-11",
        period: { start: "2021-09-11", end: "2026-09-10" },
        contractBranch: "Головной офис"
      },
    ],
    careerDays: true,
    expertParticipation: true,
    caseChampionships: false,
    allEmployees: 110,
    internHiring: true,
    averageInternsPerYear: 20,
    interns: 9,
    region: "Республика Татарстан",
    description: "Крупнейший университет Приволжья",
    image: "https://via.placeholder.com/100?text=КФУ",
  },
  {
    id: "univ-8",
    name: "Томский государственный университет",
    shortName: "ТГУ",
    inn: "7017000010",
    city: "Томск",
    branch: ["Сибирский филиал"],
    cooperationStartYear: 2019,
    cooperationLines: [
      {
        id: "clr-tgu-1",
        line: "drp",
        year: 2019,
        responsible: ["person-2"],
      },
      {
        id: "clr-tgu-2",
        line: "cntr",
        year: 2020,
        responsible: ["person-10"],
      },
    ],
    targetAudience: "Студенты IT и математики",
    initiatorBlock: "Блок технологий",
    initiatorName: "Кузнецов Владимир Петрович",
    branchCurators: [
      { 
        id: "cur-10", 
        city: "Томск", 
        branch: "Сибирский филиал", 
        cooperationLines: [
          { id: "clr-cur-10-1", line: "drp", year: 2019, responsible: ["person-2"] },
        ],
        cooperationStartYear: 2019,
      },
    ],
    contracts: [
      { 
        id: "cont-15", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2022-203",
        date: "2022-11-30",
        period: { start: "2022-11-30", end: "2027-11-29" },
        asddLink: "https://asdd.example.com/contract/2022-203",
        contractBranch: "Дальневосточный филиал"
      },
    ],
    careerDays: true,
    expertParticipation: false,
    caseChampionships: true,
    allEmployees: 90,
    internHiring: true,
    averageInternsPerYear: 16,
    interns: 7,
    region: "Томская область",
    description: "Старейший университет Сибири",
    image: "https://via.placeholder.com/100?text=ТГУ",
  },
  {
    id: "univ-9",
    name: "Санкт-Петербургский политехнический университет Петра Великого",
    shortName: "СПбПУ",
    inn: "7802000001",
    city: "Санкт-Петербург",
    branch: ["Санкт-Петербургский филиал", "Центральный офис"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-spbpu-1",
        line: "bko",
        year: 2021,
        responsible: ["person-3", "person-7"],
      },
      {
        id: "clr-spbpu-2",
        line: "cntr",
        year: 2022,
        responsible: ["person-8"],
      },
    ],
    targetAudience: "Студенты инженерии и IT",
    initiatorBlock: "Блок технологий",
    initiatorName: "Романов Павел Андреевич",
    branchCurators: [
      { 
        id: "cur-11", 
        city: "Санкт-Петербург", 
        branch: "Санкт-Петербургский филиал", 
        cooperationLines: [
          { id: "clr-cur-11-1", line: "bko", year: 2021, responsible: [] },
        ],
        cooperationStartYear: 2021,
      },
      { 
        id: "cur-12", 
        city: "Санкт-Петербург", 
        branch: "Центральный офис", 
        cooperationLines: [
          { id: "clr-cur-12-1", line: "drp", year: 2021, responsible: [] },
          { id: "clr-cur-12-2", line: "bko", year: 2021, responsible: [] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-16", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-spbpu-2021.pdf",
        number: "Д-2021-167",
        date: "2021-07-19",
        period: { start: "2021-07-19", end: "2026-07-18" },
        asddLink: "https://asdd.example.com/contract/2021-167",
        contractBranch: "Санкт-Петербургский филиал"
      },
      { 
        id: "cont-17", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-234",
        date: "2023-05-14",
        period: { start: "2023-05-14", end: "2028-05-13" },
        contractBranch: "Головной офис"
      },
    ],
    careerDays: true,
    expertParticipation: true,
    caseChampionships: true,
    allEmployees: 130,
    internHiring: true,
    averageInternsPerYear: 28,
    interns: 12,
    region: "Ленинградская область",
    description: "Ведущий технический университет Северо-Запада",
    image: "https://via.placeholder.com/100?text=СПбПУ",
  },
  {
    id: "univ-10",
    name: "Российский университет дружбы народов",
    shortName: "РУДН",
    inn: "7728004767",
    city: "Москва",
    branch: ["Московский филиал"],
    cooperationStartYear: 2020,
    cooperationLines: [
      {
        id: "clr-rudn-1",
        line: "drp",
        year: 2020,
        responsible: ["person-4", "person-9"],
      },
      {
        id: "clr-rudn-2",
        line: "bko",
        year: 2020,
        responsible: ["person-1"],
      },
    ],
    targetAudience: "Студенты IT, экономики и менеджмента",
    initiatorBlock: "Блок стратегии",
    initiatorName: "Алиева Зарина Магомедовна",
    branchCurators: [
      { 
        id: "cur-13", 
        city: "Москва", 
        branch: "Московский филиал", 
        cooperationLines: [
          { id: "clr-cur-13-1", line: "drp", year: 2020, responsible: ["person-2", "person-7"] },
          { id: "clr-cur-13-2", line: "bko", year: 2020, responsible: ["person-4", "person-9"] },
          { id: "clr-cur-13-3", line: "cntr", year: 2021, responsible: ["person-10"] },
        ],
        cooperationStartYear: 2020,
      },
    ],
    contracts: [
      { 
        id: "cont-18", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-rudn-2020.pdf",
        number: "Д-2020-178",
        date: "2020-06-03",
        period: { start: "2020-06-03", end: "2025-06-02" },
        asddLink: "https://asdd.example.com/contract/2020-178",
        contractBranch: "Головной офис"
      },
      { 
        id: "cont-19", 
        type: "scholarship", 
        hasContract: true,
        number: "Д-2021-245",
        date: "2021-10-15",
        period: { start: "2021-10-15", end: "2026-10-14" },
        contractBranch: "Южный филиал"
      },
      { 
        id: "cont-20", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-112",
        date: "2023-01-27",
        period: { start: "2023-01-27", end: "2028-01-26" },
        asddLink: "https://asdd.example.com/contract/2023-112",
        contractBranch: "Головной офис"
      },
    ],
    careerDays: true,
    expertParticipation: true,
    caseChampionships: true,
    allEmployees: 140,
    internHiring: true,
    averageInternsPerYear: 22,
    interns: 11,
    region: "Московская область",
    description: "Международный университет с широкой сетью партнерств",
    image: "https://via.placeholder.com/100?text=МИФИ",
  },
  {
    id: "univ-11",
    name: "Южный федеральный университет",
    shortName: "ЮФУ",
    inn: "6163001840",
    city: "Ростов-на-Дону",
    branch: ["Южный филиал"],
    cooperationStartYear: 2022,
    cooperationLines: [
      {
        id: "clr-yufu-1",
        line: "drp",
        year: 2022,
        responsible: ["person-5"],
      },
    ],
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Петренко Виктор Иванович",
    branchCurators: [
      { 
        id: "cur-14", 
        city: "Ростов-на-Дону", 
        branch: "Южный филиал", 
        cooperationLines: [
          { id: "clr-cur-14-1", line: "drp", year: 2022, responsible: ["person-5"] },
        ],
        cooperationStartYear: 2022,
      },
    ],
    contracts: [
      { 
        id: "cont-21", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2022-278",
        date: "2022-12-09",
        period: { start: "2022-12-09", end: "2027-12-08" },
        contractBranch: "Южный филиал"
      },
    ],
    careerDays: true,
    expertParticipation: false,
    caseChampionships: false,
    allEmployees: 75,
    internHiring: true,
    averageInternsPerYear: 14,
    interns: 6,
    region: "Ростовская область",
    description: "Крупнейший университет Юга России",
    image: "https://via.placeholder.com/100?text=КубГУ",
  },
  {
    id: "univ-12",
    name: "Дальневосточный федеральный университет",
    shortName: "ДВФУ",
    inn: "2501000010",
    city: "Владивосток",
    branch: ["Дальневосточный филиал"],
    cooperationStartYear: 2023,
    cooperationLines: [
      {
        id: "clr-dvfu-1",
        line: "cntr",
        year: 2023,
        responsible: ["person-6"],
      },
    ],
    targetAudience: "Студенты IT и инженерии",
    initiatorBlock: "Блок технологий",
    initiatorName: "Ким Александр Сергеевич",
    branchCurators: [
      { 
        id: "cur-15", 
        city: "Владивосток", 
        branch: "Дальневосточный филиал", 
        cooperationLines: [
          { id: "clr-cur-15-1", line: "cntr", year: 2023, responsible: ["person-6"] },
        ],
        cooperationStartYear: 2023,
      },
    ],
    contracts: [
      { 
        id: "cont-22", 
        type: "cooperation", 
        hasContract: true, 
        contractFile: "contract-dvfu-2023.pdf",
        number: "Д-2023-189",
        date: "2023-04-16",
        period: { start: "2023-04-16", end: "2028-04-15" },
        asddLink: "https://asdd.example.com/contract/2023-189",
        contractBranch: "Дальневосточный филиал"
      },
    ],
    careerDays: false,
    expertParticipation: true,
    caseChampionships: false,
    allEmployees: 60,
    internHiring: false,
    averageInternsPerYear: 8,
    interns: 3,
    region: "Приморский край",
    description: "Ведущий университет Дальнего Востока",
    image: "https://via.placeholder.com/100?text=ДВФУ",
  },
  {
    id: "univ-13",
    name: "Белгородский государственный национальный исследовательский университет",
    shortName: "БелГУ",
    city: "Белгород",
    branch: ["Центральный филиал"],
    cooperationStartYear: 2021,
    cooperationLines: [
      {
        id: "clr-belgu-1",
        line: "drp",
        year: 2021,
        responsible: ["person-2", "person-7"],
      },
    ],
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Степанова Наталья Михайловна",
    initiatorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { 
        id: "cur-16", 
        city: "Белгород", 
        branch: "Центральный филиал", 
        cooperationLines: [
          { id: "clr-cur-16-1", line: "drp", year: 2021, responsible: ["person-2", "person-7"] },
        ],
        cooperationStartYear: 2021,
      },
    ],
    contracts: [
      { 
        id: "cont-23", 
        type: "cooperation", 
        hasContract: true,
        number: "Д-2021-267",
        date: "2021-11-22",
        period: { start: "2021-11-22", end: "2026-11-21" },
        contractBranch: "Центральный филиал"
      },
      { 
        id: "cont-24", 
        type: "internship", 
        hasContract: true,
        number: "Д-2023-298",
        date: "2023-09-07",
        period: { start: "2023-09-07", end: "2028-09-06" },
        asddLink: "https://asdd.example.com/contract/2023-298",
        contractBranch: "Головной офис"
      },
    ],
    careerDays: true,
    expertParticipation: false,
    caseChampionships: true,
    allEmployees: 85,
    internHiring: true,
    averageInternsPerYear: 17,
    interns: 8,
    region: "Белгородская область",
    description: "Крупный региональный университет",
    image: "https://via.placeholder.com/100?text=БелГУ",
  },
];

// Функции для партнерств - удалены

// Форматирование даты
const formatDate = (date: Date) => {
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Функция для получения цвета статуса студента (использует централизованные цвета)
const getStudentStatusColor = (status: Student["status"]) => {
  return getStatusBadgeColor(status);
};

// Функция для получения текста статуса студента
const getStudentStatusText = (status: Student["status"]) => {
  switch (status) {
    case "not-started":
      return "Не начато";
    case "invited":
      return "Приглашен";
    case "in-progress":
      return "В процессе";
    case "completed":
      return "Завершено";
    default:
      return status;
  }
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

// Функции валидации
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Функция для получения истории изменений университета
const getUniversityChangeHistory = (universityId: string): ChangeHistory[] => {
  const histories: ChangeHistory[] = [];
  
  // История создания
  histories.push({
    id: `history-${universityId}-1`,
    universityId,
    action: "created",
    user: "Иванов Иван Иванович",
    timestamp: new Date("2020-01-15T10:30:00"),
  });
  
  // История редактирования полей
  const fieldChanges = [
    { field: "name", oldValue: "МГУ", newValue: "Московский государственный университет имени М.В. Ломоносова", date: "2020-02-20T14:15:00", user: "Петрова Мария Сергеевна" },
    { field: "cooperationStartYear", oldValue: "2019", newValue: "2020", date: "2020-03-10T09:00:00", user: "Сидоров Алексей Дмитриевич" },
    { field: "city", oldValue: "Москва (старое)", newValue: "Москва", date: "2020-04-05T11:20:00", user: "Козлова Елена Владимировна" },
    { field: "targetAudience", oldValue: "Студенты", newValue: "Студенты IT-направлений", date: "2020-05-12T16:45:00", user: "Волков Дмитрий Николаевич" },
    { field: "description", oldValue: "", newValue: "Ведущий университет России", date: "2020-06-18T13:30:00", user: "Новикова Анна Петровна" },
  ];
  
  fieldChanges.forEach((change, index) => {
    histories.push({
      id: `history-${universityId}-${index + 2}`,
      universityId,
      action: "updated",
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      user: change.user,
      timestamp: new Date(change.date),
    });
  });
  
  // Сортировка по дате (от новых к старым)
  return histories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const validateDates = (startDate: string, endDate?: string): string | null => {
  if (!startDate) return "Дата начала обязательна";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "Некорректная дата начала";
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "Некорректная дата окончания";
    if (end < start) return "Дата окончания не может быть раньше даты начала";
  }
  return null;
};

// Функция дебаунс для поиска
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};


// Шаблоны email
const emailTemplates: EmailTemplate[] = [
  {
    id: "invitation",
    name: "Приглашение на партнерство",
    subject: "Приглашение участвовать в партнерстве: {{partnershipName}}",
    body: "Уважаемый(ая) {{studentName}}!\n\nПриглашаем вас принять участие в программе {{partnershipName}}.\n\nДата начала: {{startDate}}\n\nСсылка на партнерство: {{uniqueLink}}\n\nС уважением,\nКоманда университета",
    variables: ["studentName", "partnershipName", "startDate", "uniqueLink"],
  },
  {
    id: "reminder",
    name: "Напоминание о партнерстве",
    subject: "Напоминание: {{partnershipName}}",
    body: "Уважаемый(ая) {{studentName}}!\n\nНапоминаем вам о вашем участии в программе {{partnershipName}}.\n\nТекущий статус: {{status}}\n\nСсылка: {{uniqueLink}}\n\nС уважением,\nКоманда университета",
    variables: ["studentName", "partnershipName", "status", "uniqueLink"],
  },
];

// Замена переменных в шаблоне
const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
};

export default function UniversitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Состояние для администрирования
  const [universities, setUniversities] = useState<University[]>(mockUniversities);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universityDetailTab, setUniversityDetailTab] = useState<"general" | "contracts" | "events" | "staff" | "bko" | "cntr">("general");
  const [generalSubTab, setGeneralSubTab] = useState<"main" | "branches">("main");
  const [staffSubTab, setStaffSubTab] = useState<"interns" | "practitioners">("interns");
  const [cntrSubTab, setCntrSubTab] = useState<"infrastructure" | "projects" | "accelerator" | "events" | "agreements" | "educational">("infrastructure");
  
  // Состояние для добавления элемента инфраструктуры ЦНТР
  const [addInfrastructureDialogOpen, setAddInfrastructureDialogOpen] = useState(false);
  const [newInfrastructure, setNewInfrastructure] = useState({
    developmentType: "",
    date: "",
    branch: "",
    description: "",
    document: "",
  });
  
  // Состояние для редактирования элемента инфраструктуры ЦНТР
  const [editInfrastructureDialogOpen, setEditInfrastructureDialogOpen] = useState(false);
  const [editingInfrastructure, setEditingInfrastructure] = useState<{ universityId: string; itemId: string } | null>(null);
  
  // Состояние для добавления элемента проекта ЦНТР
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: "",
    date: "",
    branch: "",
    fundingAmount: "",
    supportFormat: "",
    description: "",
    document: "",
  });
  
  // Состояние для редактирования элемента проекта ЦНТР
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ universityId: string; itemId: string } | null>(null);
  
  // Состояние для добавления элемента акселератора ЦНТР
  const [addAcceleratorDialogOpen, setAddAcceleratorDialogOpen] = useState(false);
  const [newAccelerator, setNewAccelerator] = useState({
    developmentType: "",
    date: "",
    branch: "",
    description: "",
    document: "",
  });
  
  // Состояние для редактирования элемента акселератора ЦНТР
  const [editAcceleratorDialogOpen, setEditAcceleratorDialogOpen] = useState(false);
  const [editingAccelerator, setEditingAccelerator] = useState<{ universityId: string; itemId: string } | null>(null);
  
  // Состояние для добавления элемента мероприятий ЦНТР
  const [addCntrEventDialogOpen, setAddCntrEventDialogOpen] = useState(false);
  const [newCntrEvent, setNewCntrEvent] = useState({
    date: "",
    branch: "",
    description: "",
    document: "",
  });
  
  // Состояние для редактирования элемента мероприятий ЦНТР
  const [editCntrEventDialogOpen, setEditCntrEventDialogOpen] = useState(false);
  const [editingCntrEvent, setEditingCntrEvent] = useState<{ universityId: string; itemId: string } | null>(null);
  
  // Состояние для добавления элемента образовательных проектов ЦНТР
  const [addCntrEducationalProjectDialogOpen, setAddCntrEducationalProjectDialogOpen] = useState(false);
  const [newCntrEducationalProject, setNewCntrEducationalProject] = useState({
    date: "",
    branch: "",
    description: "",
    document: "",
  });
  
  // Состояние для редактирования элемента образовательных проектов ЦНТР
  const [editCntrEducationalProjectDialogOpen, setEditCntrEducationalProjectDialogOpen] = useState(false);
  const [editingCntrEducationalProject, setEditingCntrEducationalProject] = useState<{ universityId: string; itemId: string } | null>(null);
  
  // Состояние для добавления элемента соглашений о сотрудничестве ЦНТР
  const [addCntrAgreementDialogOpen, setAddCntrAgreementDialogOpen] = useState(false);
  const [newCntrAgreement, setNewCntrAgreement] = useState({
    date: "",
    branch: "",
    status: "",
    description: "",
    document: "",
  });
  
  // Состояние для редактирования элемента соглашений о сотрудничестве ЦНТР
  const [editCntrAgreementDialogOpen, setEditCntrAgreementDialogOpen] = useState(false);
  const [editingCntrAgreement, setEditingCntrAgreement] = useState<{ universityId: string; itemId: string } | null>(null);
  
  const [universitiesSortOrder, setUniversitiesSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedUniversities, setExpandedUniversities] = useState<Set<string>>(new Set());
  
  // Список доступных филиалов ГПБ
  const availableBranches = [
    { value: "Московский филиал", label: "Московский филиал" },
    { value: "Санкт-Петербургский филиал", label: "Санкт-Петербургский филиал" },
    { value: "Уральский филиал", label: "Уральский филиал" },
    { value: "Сибирский филиал", label: "Сибирский филиал" },
    { value: "Приволжский филиал", label: "Приволжский филиал" },
    { value: "Дальневосточный филиал", label: "Дальневосточный филиал" },
    { value: "Южный филиал", label: "Южный филиал" },
    { value: "Центральный филиал", label: "Центральный филиал" },
    { value: "Центральный офис", label: "Центральный офис" },
  ];
  
  // Список линий сотрудничества
  const cooperationLines = [
    { value: "drp", label: "ДРП" },
    { value: "bko", label: "БКО" },
    { value: "cntr", label: "ЦНТР" },
  ];
  
  // Список ответственных лиц по линиям сотрудничества
  const responsiblePersons = [
    { value: "person-1", label: "Иванов Иван Иванович", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", position: "Руководитель направления" },
    { value: "person-2", label: "Петрова Мария Сергеевна", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", position: "Старший специалист" },
    { value: "person-3", label: "Сидоров Алексей Дмитриевич", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", position: "Менеджер проектов" },
    { value: "person-4", label: "Козлова Анна Владимировна", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", position: "Специалист по работе с ВУЗами" },
    { value: "person-5", label: "Волков Дмитрий Петрович", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", position: "Руководитель отдела" },
    { value: "person-6", label: "Новикова Елена Александровна", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", position: "Координатор программ" },
    { value: "person-7", label: "Морозов Сергей Викторович", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face", position: "Ведущий специалист" },
    { value: "person-8", label: "Павлова Ольга Николаевна", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", position: "Менеджер по развитию" },
    { value: "person-9", label: "Семенов Андрей Борисович", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", position: "Руководитель проектов" },
    { value: "person-10", label: "Лебедева Татьяна Михайловна", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", position: "Специалист по партнерствам" },
  ];
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"university" | null>(null);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Состояние для пагинации таблицы студентов
  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1);
  const [studentsItemsPerPage, setStudentsItemsPerPage] = useState(10);
  
  // Состояние для пагинации стажеров
  const [internsCurrentPage, setInternsCurrentPage] = useState(1);
  const [internsItemsPerPage, setInternsItemsPerPage] = useState(10);
  
  // Состояние для фильтров стажеров
  const [internsFilterDialogOpen, setInternsFilterDialogOpen] = useState(false);
  const [internsFilters, setInternsFilters] = useState<{
    employeeName: string;
    ageMin: string;
    ageMax: string;
    positions: string[];
    departments: string[];
    hireDateFrom: string;
    hireDateTo: string;
    statuses: ("active" | "dismissed")[];
    practiceInBank: "yes" | "no" | "all";
    internshipInBank: "yes" | "no" | "all";
  }>({
    employeeName: "",
    ageMin: "",
    ageMax: "",
    positions: [],
    departments: [],
    hireDateFrom: "",
    hireDateTo: "",
    statuses: [],
    practiceInBank: "all",
    internshipInBank: "all",
  });
  
  // Состояние для пагинации практикантов
  const [practitionersCurrentPage, setPractitionersCurrentPage] = useState(1);
  const [practitionersItemsPerPage, setPractitionersItemsPerPage] = useState(10);
  
  // Состояние для переключения между практикантами, участниками кейс-чемпионатов и целевыми практикантами
  const [practitionersSubTab, setPractitionersSubTab] = useState<"practitioners" | "caseChampionships" | "targetPractitioners">("practitioners");
  
  // Состояние для добавления практиканта
  const [addPractitionerDialogOpen, setAddPractitionerDialogOpen] = useState(false);
  const [newPractitioner, setNewPractitioner] = useState({
    employeeName: "",
    department: "",
    practiceStartDate: "",
    practiceEndDate: "",
    practiceSupervisor: "",
    practiceStatus: "meets" as "not_meets" | "meets" | "exceeds",
    comment: "",
  });
  
  // Состояние для добавления участника кейс-чемпионата
  const [addParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    employeeName: "",
    eventId: "",
    status: "registered" as "registered" | "participated" | "winner" | "prize_winner",
    comments: "",
  });
  
  // Состояние для добавления целевого практиканта
  const [addTargetPractitionerDialogOpen, setAddTargetPractitionerDialogOpen] = useState(false);
  const [newTargetPractitioner, setNewTargetPractitioner] = useState({
    employeeName: "",
    targetStartDate: "",
    targetEndDate: "",
    department: "",
    practiceSupervisor: "",
    comments: "",
  });
  
  // Состояние для редактирования практиканта
  const [editPractitionerDialogOpen, setEditPractitionerDialogOpen] = useState(false);
  const [editingPractitioner, setEditingPractitioner] = useState<{
    id: string;
    universityId: string;
    employeeName: string;
    department: string;
    practiceStartDate: string;
    practiceEndDate: string;
    practiceSupervisor: string;
    practiceStatus: "not_meets" | "meets" | "exceeds";
    comment: string;
  } | null>(null);
  
  // Состояние для редактирования участника кейс-чемпионата
  const [editParticipantDialogOpen, setEditParticipantDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<{
    id: string;
    universityId: string;
    employeeName: string;
    eventId: string;
    status: "registered" | "participated" | "winner" | "prize_winner";
    comments?: string;
  } | null>(null);
  
  // Состояние для редактирования целевого практиканта
  const [editTargetPractitionerDialogOpen, setEditTargetPractitionerDialogOpen] = useState(false);
  const [editingTargetPractitioner, setEditingTargetPractitioner] = useState<{
    id: string;
    universityId: string;
    employeeName: string;
    targetStartDate: string;
    targetEndDate: string;
    department?: string;
    practiceSupervisor?: string;
    comments?: string;
  } | null>(null);
  
  // Состояние для фильтров практикантов
  const [practitionersFilterDialogOpen, setPractitionersFilterDialogOpen] = useState(false);
  const [practitionersFilters, setPractitionersFilters] = useState<{
    employeeName: string;
    departments: string[];
    practiceStartDate: string;
    practiceEndDate: string;
    addedBy: string[];
    practiceStatus: ("not_meets" | "meets" | "exceeds")[];
    comment: string;
  }>({
    employeeName: "",
    departments: [],
    practiceStartDate: "",
    practiceEndDate: "",
    addedBy: [],
    practiceStatus: [],
    comment: "",
  });
  
  // Состояние для фильтров участников кейс-чемпионатов
  const [participantsFilterDialogOpen, setParticipantsFilterDialogOpen] = useState(false);
  const [participantsFilters, setParticipantsFilters] = useState<{
    employeeName: string;
    eventIds: string[];
    statuses: ("registered" | "participated" | "winner" | "prize_winner")[];
    comments: string;
  }>({
    employeeName: "",
    eventIds: [],
    statuses: [],
    comments: "",
  });
  
  // Состояние для фильтров целевых практикантов
  const [targetPractitionersFilterDialogOpen, setTargetPractitionersFilterDialogOpen] = useState(false);
  const [targetPractitionersFilters, setTargetPractitionersFilters] = useState<{
    employeeName: string;
    departments: string[];
    targetStartDate: string;
    targetEndDate: string;
    comments: string;
  }>({
    employeeName: "",
    departments: [],
    targetStartDate: "",
    targetEndDate: "",
    comments: "",
  });
  
  // Состояние для модального окна комментария практиканта
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentDialogPractitioner, setCommentDialogPractitioner] = useState<{ universityId: string; practitionerId: string; comment: string } | null>(null);
  
  // Состояние для модального окна комментария участника кейс-чемпионата
  const [commentDialogParticipantOpen, setCommentDialogParticipantOpen] = useState(false);
  const [commentDialogParticipant, setCommentDialogParticipant] = useState<{ universityId: string; participantId: string; comment: string } | null>(null);
  
  // Состояние для модального окна комментария целевого практиканта
  const [commentDialogTargetPractitionerOpen, setCommentDialogTargetPractitionerOpen] = useState(false);
  const [commentDialogTargetPractitioner, setCommentDialogTargetPractitioner] = useState<{ universityId: string; targetPractitionerId: string; comment: string } | null>(null);
  
  // Состояние для формы создания университета
  const [universityFormData, setUniversityFormData] = useState({
    // Шаг 1: Общая информация
    name: "",
    shortName: "",
    inn: "",
    city: "",
    branch: [] as string[],
    cooperationStartYear: new Date().getFullYear(),
    cooperationLine: [] as CooperationLine[], // Старое поле для обратной совместимости
    cooperationLineYear: new Date().getFullYear(), // Старое поле
    cooperationLineResponsible: [] as string[], // Старое поле
    cooperationLines: [] as CooperationLineRecord[], // Новый формат: массив записей
    targetAudience: "",
    initiatorBlock: "",
    initiatorName: "",
    branchCurators: [] as BranchCurator[],
    // Шаг 2: Договорная база
    contracts: [] as Contract[],
    // Шаг 3: Кадровые показатели
    allEmployees: 0,
    internHiring: false,
    averageInternsPerYear: 0,
    interns: 0,
    // Дополнительные поля
    region: "",
    description: "",
  });
  
  // Состояние для добавления куратора в модальном окне (больше не используется)
  const [newCurator, setNewCurator] = useState({
    city: "",
    branch: "",
  });
  
  // Состояние для добавления куратора на вкладке "Общая информация"
  const [newCuratorForUniversity, setNewCuratorForUniversity] = useState({
    city: "",
    branch: "",
    cooperationLines: [] as CooperationLineRecord[],
  });
  
  // Состояние для редактирования куратора
  const [editingCuratorId, setEditingCuratorId] = useState<string | null>(null);
  const [editingCurator, setEditingCurator] = useState({
    city: "",
    branch: "",
    cooperationLines: [] as CooperationLineRecord[],
  });
  
  // Состояние для отслеживания свернутых филиалов
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());
  
  // Состояние для добавления договора
  const [newContract, setNewContract] = useState({
    type: "cooperation" as Contract["type"],
    hasContract: false,
    contractFile: "",
  });
  
  // Состояние для управления мероприятиями
  const [editingEvent, setEditingEvent] = useState<{ universityId: string; event: Event } | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [eventFilters, setEventFilters] = useState<{
    type: Event["type"] | null;
    status: Event["status"] | null;
  }>({
    type: null,
    status: null,
  });

  const [contractFilters, setContractFilters] = useState<{
    type: Contract["type"] | null;
    status: "active" | "expired" | null;
  }>({
    type: null,
    status: null,
  });

  // Состояния для работы с договорами в табе
  const [editingContract, setEditingContract] = useState<{ universityId: string; contract: Contract } | null>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  
  // Состояния для модальных окон филиалов
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [isCooperationLineDialogOpen, setIsCooperationLineDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [newCooperationLineForBranch, setNewCooperationLineForBranch] = useState<CooperationLineRecord>({
    id: `clr-${Date.now()}`,
    line: "drp",
    year: new Date().getFullYear(),
    responsible: [],
  });
  
  // Состояния для модального окна линии сотрудничества головного ВУЗа
  const [isMainCooperationLineDialogOpen, setIsMainCooperationLineDialogOpen] = useState(false);
  const [newCooperationLineForMain, setNewCooperationLineForMain] = useState<CooperationLineRecord>({
    id: `clr-${Date.now()}`,
    line: "drp",
    year: new Date().getFullYear(),
    responsible: [],
  });
  const [editingMainCooperationLine, setEditingMainCooperationLine] = useState<{ universityId: string; lineId: string } | null>(null);
  const [newContractForTab, setNewContractForTab] = useState<{
    type: Contract["type"];
    hasContract: boolean;
    contractFile: string;
    number: string;
    date: string;
    period: { start: string; end: string };
    asddLink: string;
    contractBranch: string;
  }>({
    type: "cooperation",
    hasContract: true,
    contractFile: "",
    number: "",
    date: "",
    period: { start: "", end: "" },
    asddLink: "",
    contractBranch: "",
  });
  const [newEvent, setNewEvent] = useState<{
    type: "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication" | "";
    date: string;
    endDate: string;
    status: "planned" | "in_progress" | "completed";
    comments: string;
    responsiblePerson: string[];
  }>({
    type: "",
    date: "",
    endDate: "",
    status: "planned",
    comments: "",
    responsiblePerson: [],
  });
  
  // Состояние для модального окна добавления студентов
  const [isAddStudentsDialogOpen, setIsAddStudentsDialogOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  
  // Состояние для модального окна управления нотификациями
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [notificationFormData, setNotificationFormData] = useState({
    subject: "",
    message: "",
    recipientIds: [] as string[],
  });
  const [notificationSearchQuery, setNotificationSearchQuery] = useState("");
  
  // Новое состояние для улучшений
  const [deleteUniversityId, setDeleteUniversityId] = useState<string | null>(null);
  const [universityHistoryDialogOpen, setUniversityHistoryDialogOpen] = useState(false);
  const [selectedUniversityForHistory, setSelectedUniversityForHistory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [cooperationLineFilter, setCooperationLineFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "city" | "region">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showArchived, setShowArchived] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ partnershipId: string; student: Student } | null>(null);
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>("all");
  const [comments, setComments] = useState<Comment[]>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  
  // Состояние для стажировок
  // Проверяем query параметр для определения активной вкладки
  const tabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"internships" | "universities" | "reporting" | "dashboard">("universities");
  
  // Обновляем активную вкладку при изменении query параметра
  useEffect(() => {
    if (tabFromQuery === "internships") {
      setActiveTab("internships");
    } else if (tabFromQuery === "universities") {
      setActiveTab("universities");
    }
  }, [tabFromQuery]);
  
  // Сброс фильтров мероприятий при смене университета
  useEffect(() => {
    setEventFilters({ type: null, status: null });
  }, [selectedUniversity]);
  const [internships, setInternships] = useState<Internship[]>(mockInternships);
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>(mockApplications);
  const [internshipStudents] = useState<InternshipStudent[]>(mockStudents);
  const [internshipSettings] = useState<InternshipSettings>(defaultInternshipSettings);
  const [evaluations, setEvaluations] = useState<InternshipEvaluation[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [selectedInternshipApplication, setSelectedInternshipApplication] = useState<InternshipApplication | null>(null);
  const [internshipSearchQuery, setInternshipSearchQuery] = useState("");
  const [internshipFilters, setInternshipFilters] = useState<{
    statuses: InternshipStatus[];
    universities: string[];
  }>({
    statuses: [],
    universities: [],
  });
  const [isInternshipFiltersDialogOpen, setIsInternshipFiltersDialogOpen] = useState(false);
  const [isInternshipCreateDialogOpen, setIsInternshipCreateDialogOpen] = useState(false);
  const [isInternshipApplicationDialogOpen, setIsInternshipApplicationDialogOpen] = useState(false);
  const [isInternshipDetailsDialogOpen, setIsInternshipDetailsDialogOpen] = useState(false);
  const [isInternshipStatisticsDialogOpen, setIsInternshipStatisticsDialogOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [evaluationApplicationId, setEvaluationApplicationId] = useState<string | null>(null);
  const [deleteInternshipId, setDeleteInternshipId] = useState<string | null>(null);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [internshipFormData, setInternshipFormData] = useState({
    title: "",
    description: "",
    partnershipId: "",
    universityId: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    maxParticipants: 10,
    status: "planned" as InternshipStatus,
    location: "hybrid" as "remote" | "office" | "hybrid",
    city: "",
    address: "",
    salary: "",
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    mentorId: "",
  });
  
  // Переключение раскрытия университета
  const toggleUniversity = (universityId: string) => {
    const newExpanded = new Set(expandedUniversities);
    if (newExpanded.has(universityId)) {
      newExpanded.delete(universityId);
    } else {
      newExpanded.add(universityId);
    }
    setExpandedUniversities(newExpanded);
  };
  
  // Выбор партнерства
  
  // Сбрасываем пагинацию при изменении количества элементов на странице
  useEffect(() => {
    setStudentsCurrentPage(1);
  }, [studentsItemsPerPage]);
  
  // Сброс страницы при изменении фильтров стажеров
  useEffect(() => {
    setInternsCurrentPage(1);
  }, [internsFilters]);
  
  // Состояние для пагинации участников кейс-чемпионатов
  const [participantsCurrentPage, setParticipantsCurrentPage] = useState(1);
  const [participantsItemsPerPage, setParticipantsItemsPerPage] = useState(10);
  
  // Состояние для пагинации целевых практикантов
  const [targetPractitionersCurrentPage, setTargetPractitionersCurrentPage] = useState(1);
  const [targetPractitionersItemsPerPage, setTargetPractitionersItemsPerPage] = useState(10);
  
  // Сброс страницы при изменении фильтров практикантов
  useEffect(() => {
    setPractitionersCurrentPage(1);
  }, [practitionersFilters]);
  
  // Сброс страницы при изменении фильтров участников кейс-чемпионатов
  useEffect(() => {
    setParticipantsCurrentPage(1);
  }, [participantsFilters]);
  
  // Сброс страницы при изменении фильтров целевых практикантов
  useEffect(() => {
    setTargetPractitionersCurrentPage(1);
  }, [targetPractitionersFilters]);
  
  // Открытие диалога создания ВУЗа
  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    setCreateType("university");
    setEditingUniversity(null);
    setUniversityFormData({
      name: "",
      shortName: "",
      inn: "",
      city: "",
      branch: [] as string[],
      cooperationStartYear: new Date().getFullYear(),
      cooperationLine: [] as CooperationLine[],
      cooperationLineYear: new Date().getFullYear(),
      cooperationLineResponsible: [] as string[],
      cooperationLines: [] as CooperationLineRecord[],
      targetAudience: "",
      initiatorBlock: "",
      initiatorName: "",
      branchCurators: [],
      contracts: [],
      allEmployees: 0,
      internHiring: false,
      averageInternsPerYear: 0,
      interns: 0,
      region: "",
      description: "",
    });
    setNewCurator({ city: "", branch: "" });
    setNewContract({ type: "cooperation", hasContract: false, contractFile: "" });
  };
  
  // Создание или обновление ВУЗа
  const handleCreateUniversity = () => {
    // Проверка обязательных полей
    if (!universityFormData.name.trim() || !universityFormData.city.trim()) {
      return;
    }
    
    if (editingUniversity) {
      // Редактирование существующего ВУЗа
      const updatedUniversity: University = {
        ...editingUniversity,
        name: universityFormData.name.trim(),
        shortName: universityFormData.shortName.trim() || undefined,
        inn: universityFormData.inn.trim() || undefined,
        city: universityFormData.city.trim(),
        branch: universityFormData.branch.length > 0 ? universityFormData.branch : undefined,
        cooperationStartYear: universityFormData.cooperationLines.length > 0 
          ? Math.min(...universityFormData.cooperationLines.map(cl => cl.year))
          : universityFormData.cooperationStartYear || undefined,
        cooperationLines: universityFormData.cooperationLines.length > 0 ? universityFormData.cooperationLines : undefined,
        // Старые поля для обратной совместимости (берем из первой записи, если есть)
        cooperationLine: universityFormData.cooperationLines.length > 0 ? universityFormData.cooperationLines[0].line : undefined,
        cooperationLineYear: universityFormData.cooperationLines.length > 0 ? universityFormData.cooperationLines[0].year : undefined,
        cooperationLineResponsible: universityFormData.cooperationLines.length > 0 && universityFormData.cooperationLines[0].responsible.length > 0
          ? (universityFormData.cooperationLines[0].responsible.length === 1 
              ? universityFormData.cooperationLines[0].responsible[0] 
              : universityFormData.cooperationLines[0].responsible)
          : undefined,
        targetAudience: universityFormData.targetAudience.trim() || undefined,
        initiatorBlock: universityFormData.initiatorBlock.trim() || undefined,
        initiatorName: universityFormData.initiatorName.trim() || undefined,
        branchCurators: universityFormData.branchCurators.length > 0 ? universityFormData.branchCurators : undefined,
        contracts: universityFormData.contracts.length > 0 ? universityFormData.contracts : undefined,
        allEmployees: universityFormData.allEmployees || undefined,
        internHiring: universityFormData.internHiring || undefined,
        averageInternsPerYear: universityFormData.averageInternsPerYear || undefined,
        interns: universityFormData.interns || undefined,
        region: universityFormData.region.trim() || undefined,
        description: universityFormData.description.trim() || undefined,
      };
      
      setUniversities(universities.map(u => u.id === editingUniversity.id ? updatedUniversity : u));
      if (selectedUniversity === editingUniversity.id) {
        setSelectedUniversity(editingUniversity.id);
      }
    } else {
      // Создание нового ВУЗа
    const newUniversity: University = {
      id: `univ-${Date.now()}`,
      name: universityFormData.name.trim(),
      shortName: universityFormData.shortName.trim() || undefined,
      inn: universityFormData.inn.trim() || undefined,
      city: universityFormData.city.trim(),
      branch: universityFormData.branch.length > 0 ? universityFormData.branch : undefined,
      cooperationStartYear: universityFormData.cooperationLineYear || universityFormData.cooperationStartYear || undefined,
      cooperationLine: universityFormData.cooperationLine || undefined,
      cooperationLineYear: universityFormData.cooperationLineYear || undefined,
      cooperationLineResponsible: universityFormData.cooperationLineResponsible.length > 0 ? universityFormData.cooperationLineResponsible : undefined,
      targetAudience: universityFormData.targetAudience.trim() || undefined,
      initiatorBlock: universityFormData.initiatorBlock.trim() || undefined,
      initiatorName: universityFormData.initiatorName.trim() || undefined,
      branchCurators: universityFormData.branchCurators.length > 0 ? universityFormData.branchCurators : undefined,
      contracts: universityFormData.contracts.length > 0 ? universityFormData.contracts : undefined,
      allEmployees: universityFormData.allEmployees || undefined,
      internHiring: universityFormData.internHiring || undefined,
      averageInternsPerYear: universityFormData.averageInternsPerYear || undefined,
      interns: universityFormData.interns || undefined,
      region: universityFormData.region.trim() || undefined,
      description: universityFormData.description.trim() || undefined,
    };
    
    setUniversities([...universities, newUniversity]);
      setSelectedUniversity(newUniversity.id);
    }
    
    setIsCreateDialogOpen(false);
    setCreateType(null);
    setEditingUniversity(null);
    setUniversityFormData({
      name: "",
      shortName: "",
      inn: "",
      city: "",
      branch: [] as string[],
      cooperationStartYear: new Date().getFullYear(),
      cooperationLine: [] as CooperationLine[],
      cooperationLineYear: new Date().getFullYear(),
      cooperationLineResponsible: [] as string[],
      cooperationLines: [] as CooperationLineRecord[],
      targetAudience: "",
      initiatorBlock: "",
      initiatorName: "",
      branchCurators: [],
      contracts: [],
      allEmployees: 0,
      internHiring: false,
      averageInternsPerYear: 0,
      interns: 0,
      region: "",
      description: "",
    });
    setNewCurator({ city: "", branch: "" });
    setNewContract({ type: "cooperation", hasContract: false, contractFile: "" });
  };
  
  // Добавление куратора
  const handleAddCurator = () => {
    if (!newCurator.city.trim() || !newCurator.branch.trim()) {
      return;
    }
    const curator: BranchCurator = {
      id: `curator-${Date.now()}`,
      city: newCurator.city.trim(),
      branch: newCurator.branch.trim(),
    };
    setUniversityFormData({
      ...universityFormData,
      branchCurators: [...universityFormData.branchCurators, curator],
    });
    setNewCurator({ city: "", branch: "" });
  };
  
  // Удаление куратора
  const handleRemoveCurator = (id: string) => {
    setUniversityFormData({
      ...universityFormData,
      branchCurators: universityFormData.branchCurators.filter(c => c.id !== id),
    });
  };
  
  // Добавление куратора для выбранного университета
  const handleAddCuratorForUniversity = (universityId: string) => {
    if (!newCuratorForUniversity.city.trim() || !newCuratorForUniversity.branch.trim()) {
      return;
    }
    const curator: BranchCurator = {
      id: `curator-${Date.now()}`,
      city: newCuratorForUniversity.city.trim(),
      branch: newCuratorForUniversity.branch.trim(),
      cooperationLines: newCuratorForUniversity.cooperationLines.length > 0 ? newCuratorForUniversity.cooperationLines : undefined,
      cooperationStartYear: newCuratorForUniversity.cooperationLines.length > 0 
        ? Math.min(...newCuratorForUniversity.cooperationLines.map(cl => cl.year))
        : undefined,
    };
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            branchCurators: [...(u.branchCurators || []), curator],
          }
        : u
    );
    setUniversities(updatedUniversities);
    setNewCuratorForUniversity({ city: "", branch: "", cooperationLines: [] });
  };
  
  // Удаление куратора для выбранного университета
  const handleRemoveCuratorForUniversity = (universityId: string, curatorId: string) => {
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            branchCurators: (u.branchCurators || []).filter(c => c.id !== curatorId),
          }
        : u
    );
    setUniversities(updatedUniversities);
  };
  
  // Обновление куратора для выбранного университета
  const handleUpdateCuratorForUniversity = (universityId: string, curatorId: string) => {
    if (!editingCurator.city.trim() || !editingCurator.branch.trim()) {
      return;
    }
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            branchCurators: (u.branchCurators || []).map(c =>
              c.id === curatorId
                ? {
                    ...c,
                    city: editingCurator.city.trim(),
                    branch: editingCurator.branch.trim(),
                    cooperationLines: editingCurator.cooperationLines.length > 0 ? editingCurator.cooperationLines : undefined,
                    cooperationStartYear: editingCurator.cooperationLines.length > 0
                      ? Math.min(...editingCurator.cooperationLines.map(cl => cl.year))
                      : undefined,
                  }
                : c
            ),
          }
        : u
    );
    setUniversities(updatedUniversities);
    setEditingCuratorId(null);
    setEditingCurator({ city: "", branch: "", cooperationLines: [] });
  };
  
  // Начало редактирования куратора
  const handleStartEditingCurator = (curator: BranchCurator) => {
    setEditingCuratorId(curator.id);
    setEditingCurator({
      city: curator.city,
      branch: curator.branch,
      cooperationLines: curator.cooperationLines || [],
    });
  };
  
  // Отмена редактирования куратора
  const handleCancelEditingCurator = () => {
    setEditingCuratorId(null);
    setEditingCurator({ city: "", branch: "", cooperationLines: [] });
  };
  
  // Добавление линии сотрудничества в филиал
  const handleAddCooperationLineToBranch = (universityId: string, branchId: string) => {
    if (!selectedBranchId) return;
    
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            branchCurators: (u.branchCurators || []).map((c) =>
              c.id === branchId
                ? {
                    ...c,
                    cooperationLines: [
                      ...(c.cooperationLines || []),
                      newCooperationLineForBranch,
                    ],
                  }
                : c
            ),
          }
        : u
    );
    setUniversities(updatedUniversities);
    setIsCooperationLineDialogOpen(false);
    setSelectedBranchId(null);
    setNewCooperationLineForBranch({
      id: `clr-${Date.now()}`,
      line: "drp",
      year: new Date().getFullYear(),
      responsible: [],
    });
  };
  
  // Удаление линии сотрудничества из филиала
  const handleRemoveCooperationLineFromBranch = (universityId: string, branchId: string, lineId: string) => {
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            branchCurators: (u.branchCurators || []).map((c) =>
              c.id === branchId
                ? {
                    ...c,
                    cooperationLines: (c.cooperationLines || []).filter((cl) => cl.id !== lineId),
                  }
                : c
            ),
          }
        : u
    );
    setUniversities(updatedUniversities);
  };
  
  // Редактирование линии сотрудничества в филиале
  const [editingCooperationLine, setEditingCooperationLine] = useState<{ universityId: string; branchId: string; lineId: string } | null>(null);
  const handleEditCooperationLineInBranch = (universityId: string, branchId: string, lineId: string) => {
    const university = universities.find(u => u.id === universityId);
    const branch = university?.branchCurators?.find(c => c.id === branchId);
    const line = branch?.cooperationLines?.find(cl => cl.id === lineId);
    
    if (line) {
      setEditingCooperationLine({ universityId, branchId, lineId });
      setNewCooperationLineForBranch({ ...line });
      setSelectedBranchId(branchId);
      setIsCooperationLineDialogOpen(true);
    }
  };
  
  // Сохранение изменений линии сотрудничества в филиале
  const handleSaveCooperationLineInBranch = () => {
    if (!editingCooperationLine || !selectedBranchId) return;
    
    const updatedUniversities = universities.map((u) =>
      u.id === editingCooperationLine.universityId
        ? {
            ...u,
            branchCurators: (u.branchCurators || []).map((c) =>
              c.id === editingCooperationLine.branchId
                ? {
                    ...c,
                    cooperationLines: (c.cooperationLines || []).map((cl) =>
                      cl.id === editingCooperationLine.lineId ? newCooperationLineForBranch : cl
                    ),
                  }
                : c
            ),
          }
        : u
    );
    setUniversities(updatedUniversities);
    setIsCooperationLineDialogOpen(false);
    setEditingCooperationLine(null);
    setSelectedBranchId(null);
    setNewCooperationLineForBranch({
      id: `clr-${Date.now()}`,
      line: "drp",
      year: new Date().getFullYear(),
      responsible: [],
    });
  };
  
  // Добавление линии сотрудничества для головного ВУЗа
  const handleAddCooperationLineToMain = (universityId: string) => {
    if (!selectedUniversity) return;
    
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            cooperationLines: [
              ...(u.cooperationLines || []),
              newCooperationLineForMain,
            ],
          }
        : u
    );
    setUniversities(updatedUniversities);
    setIsMainCooperationLineDialogOpen(false);
    setNewCooperationLineForMain({
      id: `clr-${Date.now()}`,
      line: "drp",
      year: new Date().getFullYear(),
      responsible: [],
    });
  };
  
  // Удаление линии сотрудничества из головного ВУЗа
  const handleRemoveCooperationLineFromMain = (universityId: string, lineId: string) => {
    const updatedUniversities = universities.map((u) =>
      u.id === universityId
        ? {
            ...u,
            cooperationLines: (u.cooperationLines || []).filter((cl) => cl.id !== lineId),
          }
        : u
    );
    setUniversities(updatedUniversities);
  };
  
  // Редактирование линии сотрудничества в головном ВУЗе
  const handleEditCooperationLineInMain = (universityId: string, lineId: string) => {
    const university = universities.find(u => u.id === universityId);
    const line = university?.cooperationLines?.find(cl => cl.id === lineId);
    
    if (line) {
      setEditingMainCooperationLine({ universityId, lineId });
      setNewCooperationLineForMain({ ...line });
      setIsMainCooperationLineDialogOpen(true);
    }
  };
  
  // Сохранение изменений линии сотрудничества в головном ВУЗе
  const handleSaveCooperationLineInMain = () => {
    if (!editingMainCooperationLine || !selectedUniversity) return;
    
    const updatedUniversities = universities.map((u) =>
      u.id === editingMainCooperationLine.universityId
        ? {
            ...u,
            cooperationLines: (u.cooperationLines || []).map((cl) =>
              cl.id === editingMainCooperationLine.lineId ? newCooperationLineForMain : cl
            ),
          }
        : u
    );
    setUniversities(updatedUniversities);
    setIsMainCooperationLineDialogOpen(false);
    setEditingMainCooperationLine(null);
    setNewCooperationLineForMain({
      id: `clr-${Date.now()}`,
      line: "drp",
      year: new Date().getFullYear(),
      responsible: [],
    });
  };
  
  // Добавление договора
  const handleAddContract = () => {
    if (!newContract.hasContract) {
      return;
    }
    const contract: Contract = {
      id: `contract-${Date.now()}`,
      type: newContract.type,
      hasContract: newContract.hasContract,
      contractFile: newContract.contractFile.trim() || undefined,
    };
    setUniversityFormData({
      ...universityFormData,
      contracts: [...universityFormData.contracts, contract],
    });
    setNewContract({ type: "cooperation", hasContract: false, contractFile: "" });
  };
  
  // Удаление договора
  const handleRemoveContract = (id: string) => {
    setUniversityFormData({
      ...universityFormData,
      contracts: universityFormData.contracts.filter(c => c.id !== id),
    });
  };
  
  // Добавление мероприятия
  const handleAddEvent = (universityId: string) => {
    if (!newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || newEvent.responsiblePerson.length === 0) {
      return;
    }
    const event: Event = {
      id: `event-${Date.now()}`,
      type: newEvent.type as "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication",
      date: newEvent.date,
      endDate: newEvent.endDate,
      status: newEvent.status,
      comments: newEvent.comments.trim() || undefined,
      responsiblePerson: newEvent.responsiblePerson,
    };
    const university = universities.find(u => u.id === universityId);
    if (university) {
      const updatedEvents = [...(university.events || []), event];
      setUniversities(universities.map(u => 
        u.id === universityId ? { ...u, events: updatedEvents } : u
      ));
      setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: [] });
      setIsEventDialogOpen(false);
    }
  };
  
  // Редактирование мероприятия
  const handleEditEvent = (universityId: string, eventId: string) => {
    const university = universities.find(u => u.id === universityId);
    const event = university?.events?.find(e => e.id === eventId);
    if (event) {
      setEditingEvent({ universityId, event });
      setNewEvent({
        type: event.type,
        date: event.date,
        endDate: event.endDate,
        status: event.status,
        comments: event.comments || "",
        responsiblePerson: event.responsiblePerson,
      });
      setIsEventDialogOpen(true);
    }
  };
  
  // Сохранение изменений мероприятия
  const handleSaveEvent = () => {
    if (!editingEvent || !newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || newEvent.responsiblePerson.length === 0) {
      return;
    }
    const updatedEvents = universities
      .find(u => u.id === editingEvent.universityId)
      ?.events?.map(e => 
        e.id === editingEvent.event.id 
          ? { ...e, type: newEvent.type as "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication", date: newEvent.date, endDate: newEvent.endDate, status: newEvent.status, comments: newEvent.comments.trim() || undefined, responsiblePerson: newEvent.responsiblePerson }
          : e
      ) || [];
    setUniversities(universities.map(u => 
      u.id === editingEvent.universityId ? { ...u, events: updatedEvents } : u
    ));
    setEditingEvent(null);
    setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: [] });
    setIsEventDialogOpen(false);
  };

  // Добавление договора в табе
  const handleAddContractForTab = (universityId: string) => {
    if (!newContractForTab.hasContract) {
      return;
    }
    const contract: Contract = {
      id: `contract-${Date.now()}`,
      type: newContractForTab.type,
      hasContract: true,
      contractFile: newContractForTab.contractFile.trim() || undefined,
      number: newContractForTab.number.trim() || undefined,
      date: newContractForTab.date || undefined,
      period: (newContractForTab.period.start || newContractForTab.period.end) ? {
        start: newContractForTab.period.start,
        end: newContractForTab.period.end,
      } : undefined,
      asddLink: newContractForTab.asddLink.trim() || undefined,
      contractBranch: newContractForTab.contractBranch || undefined,
    };
    const university = universities.find(u => u.id === universityId);
    if (university) {
      const updatedContracts = [...(university.contracts || []), contract];
      setUniversities(universities.map(u => 
        u.id === universityId ? { ...u, contracts: updatedContracts } : u
      ));
      setNewContractForTab({ type: "cooperation", hasContract: true, contractFile: "", number: "", date: "", period: { start: "", end: "" }, asddLink: "", contractBranch: "" });
      setIsContractDialogOpen(false);
    }
  };

  // Редактирование договора в табе
  const handleEditContractForTab = (universityId: string, contractId: string) => {
    const university = universities.find(u => u.id === universityId);
    const contract = university?.contracts?.find(c => c.id === contractId);
    if (contract) {
      setEditingContract({ universityId, contract });
      setNewContractForTab({
        type: contract.type,
        hasContract: contract.hasContract,
        contractFile: contract.contractFile || "",
        number: contract.number || "",
        date: contract.date || "",
        period: contract.period || { start: "", end: "" },
        asddLink: contract.asddLink || "",
        contractBranch: contract.contractBranch || "",
      });
      setIsContractDialogOpen(true);
    }
  };

  // Сохранение изменений договора в табе
  const handleSaveContractForTab = () => {
    if (!editingContract) {
      return;
    }
    const updatedContracts = universities
      .find(u => u.id === editingContract.universityId)
      ?.contracts?.map(c => 
        c.id === editingContract.contract.id 
          ? { 
              ...c, 
              type: newContractForTab.type, 
              hasContract: true,
              contractFile: newContractForTab.contractFile.trim() || undefined,
              number: newContractForTab.number.trim() || undefined,
              date: newContractForTab.date || undefined,
              period: (newContractForTab.period.start || newContractForTab.period.end) ? {
                start: newContractForTab.period.start,
                end: newContractForTab.period.end,
              } : undefined,
              asddLink: newContractForTab.asddLink.trim() || undefined,
              contractBranch: newContractForTab.contractBranch || undefined,
            }
          : c
      ) || [];
    setUniversities(universities.map(u => 
      u.id === editingContract.universityId ? { ...u, contracts: updatedContracts } : u
    ));
    setEditingContract(null);
    setNewContractForTab({ type: "cooperation", hasContract: true, contractFile: "", number: "", date: "", period: { start: "", end: "" }, asddLink: "", contractBranch: "" });
    setIsContractDialogOpen(false);
  };

  // Удаление договора в табе
  const handleRemoveContractForTab = (universityId: string, contractId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (university) {
      const updatedContracts = (university.contracts || []).filter(c => c.id !== contractId);
      setUniversities(universities.map(u => 
        u.id === universityId ? { ...u, contracts: updatedContracts } : u
      ));
    }
  };
  
  // Обновление комментария практиканта
  const handleUpdatePractitionerComment = (comment: string) => {
    if (!commentDialogPractitioner) return;
    
    setUniversities(universities.map(u => {
      if (u.id === commentDialogPractitioner.universityId && u.practitionerList) {
        return {
          ...u,
          practitionerList: u.practitionerList.map(p => 
            p.id === commentDialogPractitioner.practitionerId ? { ...p, comment: comment.trim() || undefined } : p
          )
        };
      }
      return u;
    }));
    setCommentDialogOpen(false);
    setCommentDialogPractitioner(null);
  };

  // Открытие модального окна комментария
  const handleOpenCommentDialog = (universityId: string, practitionerId: string, currentComment?: string) => {
    setCommentDialogPractitioner({ universityId, practitionerId, comment: currentComment || "" });
    setCommentDialogOpen(true);
  };
  
  // Добавление практиканта
  const handleAddPractitioner = (universityId: string) => {
    if (!newPractitioner.employeeName.trim() || !newPractitioner.department.trim() || 
        !newPractitioner.practiceStartDate || !newPractitioner.practiceEndDate) {
      return;
    }
    
    const practitioner: Practitioner = {
      id: `practitioner-${Date.now()}`,
      employeeName: newPractitioner.employeeName.trim(),
      age: 0,
      position: "",
      department: newPractitioner.department.trim(),
      hireDate: new Date().toISOString().split('T')[0],
      status: "active",
      internshipInBank: false,
      practiceStartDate: newPractitioner.practiceStartDate,
      practiceEndDate: newPractitioner.practiceEndDate,
      practiceSupervisor: newPractitioner.practiceSupervisor.trim() || undefined,
      practiceStatus: newPractitioner.practiceStatus,
      addedBy: "Текущий пользователь",
      comment: newPractitioner.comment.trim() || undefined,
    };
    
    setUniversities(universities.map(u => {
      if (u.id === universityId) {
        return {
          ...u,
          practitionerList: [...(u.practitionerList || []), practitioner],
        };
      }
      return u;
    }));
    
    setNewPractitioner({
      employeeName: "",
      department: "",
      practiceStartDate: "",
      practiceEndDate: "",
      practiceSupervisor: "",
      practiceStatus: "meets",
      comment: "",
    });
    setAddPractitionerDialogOpen(false);
  };
  
  // Добавление участника кейс-чемпионата
  const handleAddCaseChampionshipParticipant = (universityId: string) => {
    if (!newParticipant.employeeName.trim() || !newParticipant.eventId) {
      return;
    }
    
    const participant: CaseChampionshipParticipant = {
      id: `ccp-${Date.now()}`,
      employeeName: newParticipant.employeeName.trim(),
      eventId: newParticipant.eventId,
      status: newParticipant.status,
      comments: newParticipant.comments?.trim() || undefined,
    };
    
    setUniversities(universities.map(u => {
      if (u.id === universityId) {
        return {
          ...u,
          caseChampionshipParticipants: [...(u.caseChampionshipParticipants || []), participant],
        };
      }
      return u;
    }));
    
    setNewParticipant({
      employeeName: "",
      eventId: "",
      status: "registered",
      comments: "",
    });
    setAddParticipantDialogOpen(false);
  };
  
  // Начать редактирование практиканта
  const handleStartEditPractitioner = (universityId: string, practitioner: Practitioner) => {
    setEditingPractitioner({
      id: practitioner.id,
      universityId,
      employeeName: practitioner.employeeName,
      department: practitioner.department,
      practiceStartDate: practitioner.practiceStartDate,
      practiceEndDate: practitioner.practiceEndDate,
      practiceSupervisor: practitioner.practiceSupervisor || "",
      practiceStatus: practitioner.practiceStatus || "meets",
      comment: practitioner.comment || "",
    });
    setEditPractitionerDialogOpen(true);
  };
  
  // Сохранить редактирование практиканта
  const handleSaveEditPractitioner = () => {
    if (!editingPractitioner) return;
    
    setUniversities(universities.map(u => {
      if (u.id === editingPractitioner.universityId && u.practitionerList) {
        return {
          ...u,
          practitionerList: u.practitionerList.map(p => 
            p.id === editingPractitioner.id 
              ? {
                  ...p,
                  employeeName: editingPractitioner.employeeName.trim(),
                  department: editingPractitioner.department.trim(),
                  practiceStartDate: editingPractitioner.practiceStartDate,
                  practiceEndDate: editingPractitioner.practiceEndDate,
                  practiceSupervisor: editingPractitioner.practiceSupervisor.trim() || undefined,
                  practiceStatus: editingPractitioner.practiceStatus,
                  comment: editingPractitioner.comment.trim() || undefined,
                }
              : p
          ),
        };
      }
      return u;
    }));
    
    setEditingPractitioner(null);
    setEditPractitionerDialogOpen(false);
  };
  
  // Удалить практиканта
  const handleDeletePractitioner = (universityId: string, practitionerId: string) => {
    setUniversities(universities.map(u => {
      if (u.id === universityId && u.practitionerList) {
        return {
          ...u,
          practitionerList: u.practitionerList.filter(p => p.id !== practitionerId),
        };
      }
      return u;
    }));
    setEditingPractitioner(null);
    setEditPractitionerDialogOpen(false);
  };
  
  // Начать редактирование участника кейс-чемпионата
  const handleStartEditParticipant = (universityId: string, participant: CaseChampionshipParticipant) => {
    setEditingParticipant({
      id: participant.id,
      universityId,
      employeeName: participant.employeeName,
      eventId: participant.eventId,
      status: participant.status,
      comments: participant.comments || "",
    });
    setEditParticipantDialogOpen(true);
  };
  
  // Сохранить редактирование участника
  const handleSaveEditParticipant = () => {
    if (!editingParticipant) return;
    
    setUniversities(universities.map(u => {
      if (u.id === editingParticipant.universityId && u.caseChampionshipParticipants) {
        return {
          ...u,
          caseChampionshipParticipants: u.caseChampionshipParticipants.map(p => 
            p.id === editingParticipant.id 
              ? {
                  ...p,
                  employeeName: editingParticipant.employeeName.trim(),
                  eventId: editingParticipant.eventId,
                  status: editingParticipant.status,
                  comments: editingParticipant.comments?.trim() || undefined,
                }
              : p
          ),
        };
      }
      return u;
    }));
    
    setEditingParticipant(null);
    setEditParticipantDialogOpen(false);
  };
  
  // Обновление комментария участника кейс-чемпионата
  const handleUpdateParticipantComment = (comment: string) => {
    if (!commentDialogParticipant) return;
    
    setUniversities(universities.map(u => {
      if (u.id === commentDialogParticipant.universityId && u.caseChampionshipParticipants) {
        return {
          ...u,
          caseChampionshipParticipants: u.caseChampionshipParticipants.map(p => 
            p.id === commentDialogParticipant.participantId ? { ...p, comments: comment.trim() || undefined } : p
          )
        };
      }
      return u;
    }));
    setCommentDialogParticipantOpen(false);
    setCommentDialogParticipant(null);
  };

  // Открытие модального окна комментария участника кейс-чемпионата
  const handleOpenParticipantCommentDialog = (universityId: string, participantId: string, currentComment?: string) => {
    setCommentDialogParticipant({ universityId, participantId, comment: currentComment || "" });
    setCommentDialogParticipantOpen(true);
  };
  
  // Добавление целевого практиканта
  const handleAddTargetPractitioner = (universityId: string) => {
    if (!newTargetPractitioner.employeeName.trim() || !newTargetPractitioner.targetStartDate || !newTargetPractitioner.targetEndDate) {
      return;
    }
    
    const targetPractitioner: TargetPractitioner = {
      id: `tp-${Date.now()}`,
      employeeName: newTargetPractitioner.employeeName.trim(),
      targetStartDate: newTargetPractitioner.targetStartDate,
      targetEndDate: newTargetPractitioner.targetEndDate,
      department: newTargetPractitioner.department.trim() || undefined,
      practiceSupervisor: newTargetPractitioner.practiceSupervisor.trim() || undefined,
      comments: newTargetPractitioner.comments?.trim() || undefined,
    };
    
    setUniversities(universities.map(u => {
      if (u.id === universityId) {
        return {
          ...u,
          targetPractitioners: [...(u.targetPractitioners || []), targetPractitioner],
        };
      }
      return u;
    }));
    
    setNewTargetPractitioner({
      employeeName: "",
      targetStartDate: "",
      targetEndDate: "",
      department: "",
      practiceSupervisor: "",
      comments: "",
    });
    setAddTargetPractitionerDialogOpen(false);
  };
  
  // Начать редактирование целевого практиканта
  const handleStartEditTargetPractitioner = (universityId: string, targetPractitioner: TargetPractitioner) => {
    setEditingTargetPractitioner({
      id: targetPractitioner.id,
      universityId,
      employeeName: targetPractitioner.employeeName,
      targetStartDate: targetPractitioner.targetStartDate,
      targetEndDate: targetPractitioner.targetEndDate,
      department: targetPractitioner.department || "",
      practiceSupervisor: targetPractitioner.practiceSupervisor || "",
      comments: targetPractitioner.comments || "",
    });
    setEditTargetPractitionerDialogOpen(true);
  };
  
  // Сохранить редактирование целевого практиканта
  const handleSaveEditTargetPractitioner = () => {
    if (!editingTargetPractitioner) return;
    
    setUniversities(universities.map(u => {
      if (u.id === editingTargetPractitioner.universityId && u.targetPractitioners) {
        return {
          ...u,
          targetPractitioners: u.targetPractitioners.map(p => 
            p.id === editingTargetPractitioner.id 
              ? {
                  ...p,
                  employeeName: editingTargetPractitioner.employeeName.trim(),
                  targetStartDate: editingTargetPractitioner.targetStartDate,
                  targetEndDate: editingTargetPractitioner.targetEndDate,
                  department: editingTargetPractitioner.department?.trim() || undefined,
                  practiceSupervisor: editingTargetPractitioner.practiceSupervisor?.trim() || undefined,
                  comments: editingTargetPractitioner.comments?.trim() || undefined,
                }
              : p
          ),
        };
      }
      return u;
    }));
    
    setEditingTargetPractitioner(null);
    setEditTargetPractitionerDialogOpen(false);
  };
  
  // Удалить целевого практиканта
  const handleDeleteTargetPractitioner = (universityId: string, targetPractitionerId: string) => {
    setUniversities(universities.map(u => {
      if (u.id === universityId && u.targetPractitioners) {
        return {
          ...u,
          targetPractitioners: u.targetPractitioners.filter(p => p.id !== targetPractitionerId),
        };
      }
      return u;
    }));
  };
  
  // Обновление комментария целевого практиканта
  const handleUpdateTargetPractitionerComment = (comment: string) => {
    if (!commentDialogTargetPractitioner) return;
    
    setUniversities(universities.map(u => {
      if (u.id === commentDialogTargetPractitioner.universityId && u.targetPractitioners) {
        return {
          ...u,
          targetPractitioners: u.targetPractitioners.map(p => 
            p.id === commentDialogTargetPractitioner.targetPractitionerId ? { ...p, comments: comment.trim() || undefined } : p
          )
        };
      }
      return u;
    }));
    setCommentDialogTargetPractitionerOpen(false);
    setCommentDialogTargetPractitioner(null);
  };

  // Открытие модального окна комментария целевого практиканта
  const handleOpenTargetPractitionerCommentDialog = (universityId: string, targetPractitionerId: string, currentComment?: string) => {
    setCommentDialogTargetPractitioner({ universityId, targetPractitionerId, comment: currentComment || "" });
    setCommentDialogTargetPractitionerOpen(true);
  };
  
  // Удалить участника кейс-чемпионата
  const handleDeleteParticipant = (universityId: string, participantId: string) => {
    setUniversities(universities.map(u => {
      if (u.id === universityId && u.caseChampionshipParticipants) {
        return {
          ...u,
          caseChampionshipParticipants: u.caseChampionshipParticipants.filter(p => p.id !== participantId),
        };
      }
      return u;
    }));
    setEditingParticipant(null);
    setEditParticipantDialogOpen(false);
  };
  
  // Форматирование даты из YYYY-MM-DD в дд.мм.гггг
  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "T00:00:00");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  };

  // Получение цвета бейджа по типу договора
  const getContractTypeBadgeColor = (type: Contract["type"]): string => {
    const colorMap: Record<Contract["type"], string> = {
      cooperation: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
      scholarship: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
      internship: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
      bankDepartment: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
    };
    return colorMap[type] || "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
  };

  const getCooperationLineLabel = (line?: CooperationLine | CooperationLine[]): string => {
    if (!line) return "";
    if (Array.isArray(line)) {
      return line.map(l => {
        if (l === "drp") return "ДРП";
        if (l === "bko") return "БКО";
        if (l === "cntr") return "ЦНТР";
        return "";
      }).filter(Boolean).join(", ");
    }
    if (line === "drp") return "ДРП";
    if (line === "bko") return "БКО";
    if (line === "cntr") return "ЦНТР";
    return "";
  };

  // Подсчет статистики мероприятий
  const getEventStatistics = (universityId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (!university || !university.events) {
    return {
        byType: { careerDays: 0, expertParticipation: 0, caseChampionships: 0, meeting: 0, communication: 0 },
        byStatus: { planned: 0, in_progress: 0, completed: 0 },
        total: 0,
      };
    }
    const byType = {
      careerDays: university.events.filter(e => e.type === "careerDays").length,
      expertParticipation: university.events.filter(e => e.type === "expertParticipation").length,
      caseChampionships: university.events.filter(e => e.type === "caseChampionships").length,
      meeting: university.events.filter(e => e.type === "meeting").length,
      communication: university.events.filter(e => e.type === "communication").length,
    };
    const byStatus = {
      planned: university.events.filter(e => e.status === "planned").length,
      in_progress: university.events.filter(e => e.status === "in_progress").length,
      completed: university.events.filter(e => e.status === "completed").length,
    };
    return {
      byType,
      byStatus,
      total: university.events.length,
    };
  };

  const getContractStatistics = (universityId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (!university || !university.contracts) {
      return {
        byType: { cooperation: 0, scholarship: 0, internship: 0, bankDepartment: 0 },
        byStatus: { active: 0, expired: 0 },
        total: 0,
      };
    }
    const now = new Date();
    const byType = {
      cooperation: university.contracts.filter(c => c.type === "cooperation").length,
      scholarship: university.contracts.filter(c => c.type === "scholarship").length,
      internship: university.contracts.filter(c => c.type === "internship").length,
      bankDepartment: university.contracts.filter(c => c.type === "bankDepartment").length,
    };
    const byStatus = {
      active: university.contracts.filter(c => {
        if (!c.period?.end) return true; // Если нет конечной даты, считаем активным
        return new Date(c.period.end) >= now;
      }).length,
      expired: university.contracts.filter(c => {
        if (!c.period?.end) return false;
        return new Date(c.period.end) < now;
      }).length,
    };
    return {
      byType,
      byStatus,
      total: university.contracts.length,
    };
  };
  
  // Удаление мероприятия
  const handleRemoveEvent = (universityId: string, eventId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (university) {
      const updatedEvents = (university.events || []).filter(e => e.id !== eventId);
      setUniversities(universities.map(u => 
        u.id === universityId ? { ...u, events: updatedEvents } : u
      ));
    }
  };

  // Фильтрация и сортировка данных
  const filteredData = useMemo(() => {
    let result = universities.map(university => {
      const query = searchQuery.toLowerCase();
      const universityMatches = !searchQuery.trim() ||
        university.name.toLowerCase().includes(query) ||
        university.shortName?.toLowerCase().includes(query) ||
        university.city.toLowerCase().includes(query) ||
        university.region?.toLowerCase().includes(query) ||
        university.description?.toLowerCase().includes(query);
      
      return university;
    }).filter(u => {
      if (cityFilter !== "all" && u.city !== cityFilter) return false;
      
      // Фильтр по региону
      if (regionFilter !== "all" && u.region !== regionFilter) return false;
      
      // Фильтр по линиям сотрудничества
      if (cooperationLineFilter.length > 0) {
        const hasMatchingLine = cooperationLineFilter.some(filterLine => {
          // Проверяем новый формат (cooperationLines)
          if (u.cooperationLines && u.cooperationLines.length > 0) {
            return u.cooperationLines.some(cl => cl.line === filterLine);
          }
          // Проверяем старый формат (cooperationLine)
          if (u.cooperationLine) {
            if (Array.isArray(u.cooperationLine)) {
              return u.cooperationLine.includes(filterLine as CooperationLine);
            }
            return u.cooperationLine === filterLine;
          }
          return false;
        });
        if (!hasMatchingLine) return false;
      }
      
      return !searchQuery.trim();
    });

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "city":
          comparison = a.city.localeCompare(b.city);
          break;
        case "region":
          const regionA = a.region || "";
          const regionB = b.region || "";
          comparison = regionA.localeCompare(regionB);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [universities, searchQuery, statusFilter, typeFilter, cityFilter, regionFilter, cooperationLineFilter, sortBy, sortOrder, showArchived]);
  
  // Сортированный список ВУЗов для левой колонки
  const sortedUniversitiesList = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, 'ru');
      return universitiesSortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredData, universitiesSortOrder]);

  // Получение уникальных городов для фильтра
  const uniqueCities = useMemo(() => {
    const cities = new Set(universities.map(u => u.city));
    return Array.from(cities).sort();
  }, [universities]);
  
  const uniqueRegions = useMemo(() => {
    const regions = new Set(universities.map(u => u.region).filter((r): r is string => Boolean(r)));
    return Array.from(regions).sort();
  }, [universities]);

  // Функции удаления
  const handleDeleteUniversity = useCallback(() => {
    if (!deleteUniversityId) return;
    const university = universities.find(u => u.id === deleteUniversityId);
    setUniversities(universities.filter(u => u.id !== deleteUniversityId));
    if (selectedUniversity === deleteUniversityId) {
      setSelectedUniversity(null);
    }
    setDeleteUniversityId(null);
  }, [deleteUniversityId, universities]);






  // Фильтрация студентов (удалено - больше не используется)
  const filteredStudents = useMemo(() => {
    return [];
  }, []);


  // Дебаунсированный поиск
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Обработчики для стажировок
  const filteredInternshipsForTab = useMemo(() => {
    return internships.filter(internship => {
      const matchesSearch = internshipSearchQuery === "" || 
        internship.title.toLowerCase().includes(internshipSearchQuery.toLowerCase()) ||
        internship.universityName.toLowerCase().includes(internshipSearchQuery.toLowerCase());
      
      const matchesStatus = internshipFilters.statuses.length === 0 || internshipFilters.statuses.includes(internship.status);
      const matchesUniversity = internshipFilters.universities.length === 0 || internshipFilters.universities.includes(internship.universityId);
      
      return matchesSearch && matchesStatus && matchesUniversity;
    });
  }, [internships, internshipSearchQuery, internshipFilters]);

  // Группировка стажировок по статусам с сортировкой
  const groupedInternships = useMemo(() => {
    const groups: Record<string, typeof filteredInternshipsForTab> = {
      active: [],
      recruiting: [],
      planned: [],
      completed: [],
    };

    // Распределяем по группам
    filteredInternshipsForTab.forEach(internship => {
      if (groups[internship.status]) {
        groups[internship.status].push(internship);
      }
    });

    // Сортируем внутри каждой группы по дате начала (ближайшие сверху)
    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => {
        return a.startDate.getTime() - b.startDate.getTime();
      });
    });

    // Порядок отображения групп
    const order: Array<{ status: InternshipStatus; label: string; icon: React.ComponentType<{ className?: string }> }> = [
      { status: 'active', label: 'Активные стажировки', icon: Calendar },
      { status: 'recruiting', label: 'Набор участников', icon: Users },
      { status: 'planned', label: 'Запланированные', icon: Clock },
      { status: 'completed', label: 'Завершенные', icon: CheckCircle2 },
    ];

    return order.map(({ status, label, icon }) => ({
      status,
      label,
      icon,
      internships: groups[status],
    })).filter(group => group.internships.length > 0);
  }, [filteredInternshipsForTab]);

  const currentInternshipApplications = useMemo(() => {
    if (!selectedInternship) return [];
    return internshipApplications.filter(app => app.internshipId === selectedInternship.id);
  }, [internshipApplications, selectedInternship]);

  const internshipStatistics = useMemo((): InternshipStatistics | null => {
    if (!selectedInternship) return null;
    
    const apps = currentInternshipApplications;
    const total = apps.length;
    const pending = apps.filter(a => a.status === 'pending').length;
    const approved = apps.filter(a => ['approved', 'confirmed', 'active', 'completed'].includes(a.status)).length;
    const rejected = apps.filter(a => a.status === 'rejected').length;
    const confirmed = apps.filter(a => ['confirmed', 'active', 'completed'].includes(a.status)).length;
    const active = apps.filter(a => a.status === 'active').length;
    const completed = apps.filter(a => a.status === 'completed').length;
    
    const avgMatchScore = apps.length > 0
      ? apps.reduce((sum, a) => sum + (a.matchScore || 0), 0) / apps.length
      : 0;
    
    const universityMap = new Map<string, { universityName: string; applicationsCount: number; approvedCount: number }>();
    apps.forEach(app => {
      const existing = universityMap.get(app.universityId) || { universityName: app.universityName, applicationsCount: 0, approvedCount: 0 };
      existing.applicationsCount++;
      if (['approved', 'confirmed', 'active', 'completed'].includes(app.status)) {
        existing.approvedCount++;
      }
      universityMap.set(app.universityId, existing);
    });
    
    const topUniversities = Array.from(universityMap.entries())
      .map(([id, data]) => ({ universityId: id, ...data }))
      .sort((a, b) => b.applicationsCount - a.applicationsCount)
      .slice(0, 5);
    
    const conversion = calculateConversionRate(apps);
    
        return {
      internshipId: selectedInternship.id,
      totalApplications: total,
      pendingApplications: pending,
      approvedApplications: approved,
      rejectedApplications: rejected,
      confirmedApplications: confirmed,
      activeStudents: active,
      completedStudents: completed,
      averageMatchScore: Math.round(avgMatchScore),
      topUniversities,
      topSkills: [],
      conversionRate: conversion,
    };
  }, [selectedInternship, currentInternshipApplications]);

  const uniqueInternshipUniversities = useMemo(() => {
    const univs = new Map<string, string>();
    internships.forEach(i => {
      if (!univs.has(i.universityId)) {
        univs.set(i.universityId, i.universityName);
      }
    });
    return Array.from(univs.entries()).map(([id, name]) => ({ id, name }));
  }, [internships]);

  const handleCreateInternship = useCallback(() => {
    setEditingInternship(null);
    setInternshipFormData({
      title: "",
      description: "",
      partnershipId: "",
      universityId: "",
      startDate: "",
      endDate: "",
      applicationDeadline: "",
      maxParticipants: 10,
      status: "planned",
      location: "hybrid",
      city: "",
      address: "",
      salary: "",
      requiredSkills: [],
      preferredSkills: [],
      mentorId: "",
    });
    setIsInternshipCreateDialogOpen(true);
  }, []);

  const handleEditInternship = useCallback((internship: Internship) => {
    setEditingInternship(internship);
    setInternshipFormData({
      title: internship.title,
      description: internship.description,
      partnershipId: internship.partnershipId,
      universityId: internship.universityId,
      startDate: internship.startDate.toISOString().split('T')[0],
      endDate: internship.endDate.toISOString().split('T')[0],
      applicationDeadline: internship.applicationDeadline.toISOString().split('T')[0],
      maxParticipants: internship.maxParticipants,
      status: internship.status,
      location: internship.location,
      city: internship.city || "",
      address: internship.address || "",
      salary: internship.salary?.toString() || "",
      requiredSkills: internship.requiredSkills,
      preferredSkills: internship.preferredSkills,
      mentorId: internship.mentorId || "",
    });
    setIsInternshipCreateDialogOpen(true);
  }, []);

  const handleSaveInternship = useCallback(() => {
    if (editingInternship) {
      setInternships(prev => prev.map(i => 
        i.id === editingInternship.id 
          ? {
              ...i,
              ...internshipFormData,
              startDate: new Date(internshipFormData.startDate),
              endDate: new Date(internshipFormData.endDate),
              applicationDeadline: new Date(internshipFormData.applicationDeadline),
              salary: internshipFormData.salary ? parseFloat(internshipFormData.salary) : undefined,
              updatedAt: new Date(),
            }
          : i
      ));
    } else {
      const newInternship: Internship = {
        id: `internship-${Date.now()}`,
        partnershipId: internshipFormData.partnershipId,
        partnershipName: "Партнерство",
        universityId: internshipFormData.universityId,
        universityName: uniqueInternshipUniversities.find(u => u.id === internshipFormData.universityId)?.name || "",
        title: internshipFormData.title,
        description: internshipFormData.description,
        startDate: new Date(internshipFormData.startDate),
        endDate: new Date(internshipFormData.endDate),
        applicationDeadline: new Date(internshipFormData.applicationDeadline),
        status: internshipFormData.status,
        maxParticipants: internshipFormData.maxParticipants,
        currentParticipants: 0,
        requirements: [],
        requiredSkills: internshipFormData.requiredSkills,
        preferredSkills: internshipFormData.preferredSkills,
        mentorId: internshipFormData.mentorId || undefined,
        mentorName: mockMentors.find(m => m.id === internshipFormData.mentorId)?.fullName,
        location: internshipFormData.location,
        city: internshipFormData.city || undefined,
        address: internshipFormData.address || undefined,
        salary: internshipFormData.salary ? parseFloat(internshipFormData.salary) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "user-1",
      };
      setInternships(prev => [...prev, newInternship]);
    }
    setIsInternshipCreateDialogOpen(false);
  }, [editingInternship, internshipFormData, uniqueInternshipUniversities]);

  const handleDeleteInternshipConfirm = useCallback(() => {
    if (!deleteInternshipId) return;
    setInternships(prev => prev.filter(i => i.id !== deleteInternshipId));
    if (selectedInternship?.id === deleteInternshipId) {
      setSelectedInternship(null);
    }
    setDeleteInternshipId(null);
  }, [deleteInternshipId, selectedInternship]);

  const handleApproveInternshipApplication = useCallback((applicationId: string) => {
    const app = internshipApplications.find(a => a.id === applicationId);
    if (!app) return;
    
    const check = canChangeApplicationStatus(app.status, 'approved', app);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    
    setInternshipApplications(prev => prev.map(a => 
      a.id === applicationId
        ? { 
            ...a, 
            status: 'approved' as ApplicationStatus,
            reviewedAt: new Date(),
            reviewerId: 'user-1',
            reviewerName: 'HR Менеджер',
          }
        : a
    ));
  }, [internshipApplications]);

  const handleRejectInternshipApplication = useCallback((applicationId: string, reason: string) => {
    const app = internshipApplications.find(a => a.id === applicationId);
    if (!app) return;
    
    const check = canChangeApplicationStatus(app.status, 'rejected', app);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    
    setInternshipApplications(prev => prev.map(a => 
      a.id === applicationId
        ? { 
            ...a, 
            status: 'rejected' as ApplicationStatus,
            reviewedAt: new Date(),
            reviewerId: 'user-1',
            reviewerName: 'HR Менеджер',
            rejectionReason: reason,
          }
        : a
    ));
  }, [internshipApplications]);

  const handleConfirmInternshipApplication = useCallback((applicationId: string) => {
    const app = internshipApplications.find(a => a.id === applicationId);
    if (!app) return;
    
    const check = canChangeApplicationStatus(app.status, 'confirmed', app);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    
    setInternshipApplications(prev => prev.map(a => 
      a.id === applicationId
        ? { 
            ...a, 
            status: 'confirmed' as ApplicationStatus,
            confirmedAt: new Date(),
          }
        : a
    ));
    
    if (app.internshipId) {
      setInternships(prev => prev.map(i => 
        i.id === app.internshipId
          ? { ...i, currentParticipants: i.currentParticipants + 1 }
          : i
      ));
    }
  }, [internshipApplications]);

  const handleSaveInternshipEvaluation = useCallback((evaluationData: Omit<InternshipEvaluation, 'id' | 'evaluationDate'>) => {
    const newEvaluation: InternshipEvaluation = {
      ...evaluationData,
      id: `eval-${Date.now()}`,
      evaluationDate: new Date(),
      internshipId: selectedInternship?.id || '',
      studentId: internshipApplications.find(a => a.id === evaluationData.applicationId)?.studentId || '',
    };
    
    setEvaluations(prev => {
      const existing = prev.findIndex(e => 
        e.applicationId === evaluationData.applicationId && 
        e.period === evaluationData.period
      );
      if (existing >= 0) {
        return prev.map((e, idx) => idx === existing ? newEvaluation : e);
      }
      return [...prev, newEvaluation];
    });
    
    if (evaluationData.period === 'final') {
      setInternshipApplications(prev => prev.map(a => 
        a.id === evaluationData.applicationId
          ? { ...a, finalRating: evaluationData.overallRating }
          : a
      ));
    }
  }, [selectedInternship, internshipApplications]);

  const getInternshipStatusText = (status: InternshipStatus | ApplicationStatus) => {
    const statusMap: Record<string, string> = {
      planned: "План",
      recruiting: "Набор",
      active: "Активна",
      completed: "Завершена",
      pending: "На рассмотрении",
      approved: "Одобрено",
      rejected: "Отклонено",
      withdrawn: "Отозвано",
      confirmed: "Подтверждено",
    };
    return statusMap[status] || status;
  };

  // Использует централизованные цвета из badge-colors.ts
  const getInternshipStatusColor = (status: InternshipStatus | ApplicationStatus) => {
    return getStatusBadgeColor(status);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Единая платформа по работе с ВУЗами</h1>
          <p className="text-muted-foreground">
            Управление партнерствами с образовательными учреждениями
          </p>
      </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "universities" | "internships" | "reporting" | "dashboard")} className="w-full">
          <TabsList variant="grid4">
            <TabsTrigger value="universities">ВУЗы</TabsTrigger>
            <TabsTrigger value="internships">Стажировки</TabsTrigger>
            <TabsTrigger value="reporting">Отчетность</TabsTrigger>
            <TabsTrigger value="dashboard">Дэшборд</TabsTrigger>
        </TabsList>

          <TabsContent value="universities" className="mt-4 space-y-4">
            {/* Поиск и фильтры для ВУЗов */}
            <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ВУЗам..."
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersDialogOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {(statusFilter !== "all" || typeFilter !== "all" || cityFilter !== "all" || regionFilter !== "all" || cooperationLineFilter.length > 0 || showArchived) && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {[
                    statusFilter !== "all" ? 1 : 0,
                    typeFilter !== "all" ? 1 : 0,
                    cityFilter !== "all" ? 1 : 0,
                    regionFilter !== "all" ? 1 : 0,
                    cooperationLineFilter.length > 0 ? 1 : 0,
                    showArchived ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
              <Button onClick={handleCreate} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Добавить ВУЗ
                    </Button>
                  </div>
                  
                  {/* Выбранные фильтры */}
                  {(() => {
                    const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                    
                    // Фильтр по городу
                    if (cityFilter !== "all") {
                      activeFilters.push({
                        label: `Город: ${cityFilter}`,
                        onRemove: () => setCityFilter("all"),
                      });
                    }
                    
                    // Фильтр по региону
                    if (regionFilter !== "all") {
                      activeFilters.push({
                        label: `Регион: ${regionFilter}`,
                        onRemove: () => setRegionFilter("all"),
                      });
                    }
                    
                    // Фильтр по линиям сотрудничества
                    cooperationLineFilter.forEach((lineValue) => {
                      const line = cooperationLines.find(l => l.value === lineValue);
                      if (line) {
                        activeFilters.push({
                          label: `Линия: ${line.label}`,
                          onRemove: () => setCooperationLineFilter(cooperationLineFilter.filter(l => l !== lineValue)),
                        });
                      }
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
          {/* Двухколоночная структура */}
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "ВУЗы не найдены" : "Нет ВУЗов"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Создайте первый ВУЗ, чтобы начать работу"}
                  </p>
                  {!searchQuery && (
                      <Button onClick={handleCreate} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить ВУЗ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 min-h-[calc(100vh-280px)] w-full overflow-x-hidden">
              {/* Левая колонка - список ВУЗов */}
              <div className="w-[20rem] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
                <div className="p-2 border-b bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">ВУЗы</h3>
                      <Badge variant="secondary" className="text-xs">
                        {sortedUniversitiesList.length}
                      </Badge>
                    </div>
                            <Button
                              variant="ghost"
                              size="icon"
                      className="h-6 w-6"
                      onClick={() => setUniversitiesSortOrder(universitiesSortOrder === "asc" ? "desc" : "asc")}
                      title={universitiesSortOrder === "asc" ? "Сортировать по убыванию" : "Сортировать по возрастанию"}
                    >
                      {universitiesSortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                              )}
                            </Button>
                                </div>
                            </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {sortedUniversitiesList.map((university) => (
                      <div key={university.id} className="space-y-1">
                        {/* ВУЗ */}
                        <div
                                  className={cn(
                            "p-2 rounded-md cursor-pointer transition-colors",
                            selectedUniversity === university.id
                                      ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setSelectedUniversity(university.id)}
                        >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm break-words">{university.name}</div>
                              {university.shortName && (
                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                  <div className="text-xs text-muted-foreground">{university.shortName}</div>
                                  {/* Теги линий сотрудничества */}
                                  {university.cooperationLines && university.cooperationLines.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {university.cooperationLines.map((record, idx) => (
                                        <Badge 
                                          key={record.id || idx} 
                                          variant="outline" 
                                          className={`text-xs ${getCooperationLineBadgeColor(record.line)}`}
                                        >
                                          {getCooperationLineLabel(record.line)}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {/* Старый формат для обратной совместимости */}
                                  {(!university.cooperationLines || university.cooperationLines.length === 0) && university.cooperationLine && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {Array.isArray(university.cooperationLine) ? (
                                        university.cooperationLine.map((line, idx) => (
                                          <Badge 
                                            key={idx} 
                                            variant="outline" 
                                            className={`text-xs ${getCooperationLineBadgeColor(line)}`}
                                          >
                                            {getCooperationLineLabel(line)}
                                          </Badge>
                                        ))
                                      ) : (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getCooperationLineBadgeColor(university.cooperationLine)}`}
                                        >
                                          {getCooperationLineLabel(university.cooperationLine)}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {!university.shortName && (
                                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                  {/* Теги линий сотрудничества */}
                                  {university.cooperationLines && university.cooperationLines.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {university.cooperationLines.map((record, idx) => (
                                        <Badge 
                                          key={record.id || idx} 
                                          variant="outline" 
                                          className={`text-xs ${getCooperationLineBadgeColor(record.line)}`}
                                        >
                                          {getCooperationLineLabel(record.line)}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {/* Старый формат для обратной совместимости */}
                                  {(!university.cooperationLines || university.cooperationLines.length === 0) && university.cooperationLine && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {Array.isArray(university.cooperationLine) ? (
                                        university.cooperationLine.map((line, idx) => (
                                          <Badge 
                                            key={idx} 
                                            variant="outline" 
                                            className={`text-xs ${getCooperationLineBadgeColor(line)}`}
                                          >
                                            {getCooperationLineLabel(line)}
                                          </Badge>
                                        ))
                                      ) : (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getCooperationLineBadgeColor(university.cooperationLine)}`}
                                        >
                                          {getCooperationLineLabel(university.cooperationLine)}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                                </div>
                      </div>
                    ))}
                  </div>
                          </div>
                        </div>
                        
              {/* Правая колонка - детальная информация о ВУЗе */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-280px)]">
                {selectedUniversity ? (() => {
                  const university = universities.find(u => u.id === selectedUniversity);
                  if (!university) return null;
                              return (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {university.image && (
                            <Avatar className="h-20 w-20 flex-shrink-0">
                              <AvatarImage src={university.image} alt={university.name} />
                              <AvatarFallback>
                                {university.shortName?.slice(0, 2).toUpperCase() || university.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                                    <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl mb-1 break-words">{university.name}</CardTitle>
                            {university.shortName && (
                          <CardDescription className="text-base break-words">
                                {university.shortName}
                          </CardDescription>
                            )}
                            {university.inn && (
                              <CardDescription className="text-sm text-muted-foreground mt-0.5">
                                ИНН: {university.inn} {university.city && `• ${university.city}`}
                              </CardDescription>
                            )}
                            {university.targetAudience && (
                              <CardDescription className="text-sm text-muted-foreground mt-0.5">
                                Целевая аудитория: {university.targetAudience}
                              </CardDescription>
                            )}
                                    </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingUniversity(university);
                              setUniversityFormData({
                                name: university.name,
                                shortName: university.shortName || "",
                                inn: university.inn || "",
                                city: university.city,
                                branch: university.branch || [],
                                cooperationStartYear: university.cooperationStartYear || new Date().getFullYear(),
                                cooperationLine: Array.isArray(university.cooperationLine)
                                  ? university.cooperationLine
                                  : university.cooperationLine
                                    ? [university.cooperationLine]
                                    : [],
                                cooperationLineYear: university.cooperationLineYear || university.cooperationStartYear || new Date().getFullYear(),
                                cooperationLineResponsible: Array.isArray(university.cooperationLineResponsible) 
                                  ? university.cooperationLineResponsible 
                                  : university.cooperationLineResponsible 
                                    ? [university.cooperationLineResponsible] 
                                    : [],
                                // Преобразуем старые данные в новый формат, если есть старые данные и нет новых
                                cooperationLines: university.cooperationLines || (university.cooperationLine 
                                  ? [{
                                      id: `clr-${Date.now()}`,
                                      line: Array.isArray(university.cooperationLine) ? university.cooperationLine[0] : university.cooperationLine,
                                      year: university.cooperationLineYear || university.cooperationStartYear || new Date().getFullYear(),
                                      responsible: Array.isArray(university.cooperationLineResponsible)
                                        ? university.cooperationLineResponsible
                                        : university.cooperationLineResponsible
                                          ? [university.cooperationLineResponsible]
                                          : [],
                                    }]
                                  : []),
                                targetAudience: university.targetAudience || "",
                                initiatorBlock: university.initiatorBlock || "",
                                initiatorName: university.initiatorName || "",
                                branchCurators: university.branchCurators || [],
                                contracts: university.contracts || [],
                                allEmployees: university.allEmployees || 0,
                                internHiring: university.internHiring || false,
                                averageInternsPerYear: university.averageInternsPerYear || 0,
                                interns: university.interns || 0,
                                region: university.region || "",
                                description: university.description || "",
                              });
                              setCreateType("university");
                              setIsCreateDialogOpen(true);
                            }}
                            title="Редактировать"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedUniversityForHistory(university.id);
                              setUniversityHistoryDialogOpen(true);
                            }}
                            title="История изменений"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteUniversityId(university.id)}
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="overflow-x-hidden">
                      <Tabs value={universityDetailTab} onValueChange={(v) => setUniversityDetailTab(v as typeof universityDetailTab)} className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                          <TabsTrigger value="general">Общая информация</TabsTrigger>
                          <TabsTrigger value="contracts">Договорная база</TabsTrigger>
                          <TabsTrigger value="events">Мероприятия</TabsTrigger>
                          <TabsTrigger value="staff">Кадровые показатели</TabsTrigger>
                          <TabsTrigger value="bko">Договорная база БКО</TabsTrigger>
                          <TabsTrigger value="cntr">ЦНТР</TabsTrigger>
                        </TabsList>
                        
                        {/* Таб 1: Общая информация */}
                        <TabsContent value="general" className="space-y-4 mt-4">
                          <Tabs value={generalSubTab} onValueChange={(v) => setGeneralSubTab(v as typeof generalSubTab)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="main">Головной ВУЗ</TabsTrigger>
                              <TabsTrigger value="branches" className="flex items-center gap-2">
                                Филиалы ВУЗа
                                {university.branchCurators && university.branchCurators.length > 0 && (
                                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                    {university.branchCurators.length}
                                  </Badge>
                                )}
                              </TabsTrigger>
                            </TabsList>
                            
                            {/* Подтаб: Головной ВУЗ */}
                            <TabsContent value="main" className="space-y-4 mt-4">
                              {/* Линии сотрудничества */}
                              {((university.cooperationLines && university.cooperationLines.length > 0) || university.cooperationLine) ? (
                                <div className="space-y-4">
                                {/* Новый формат: список записей линий сотрудничества */}
                                {university.cooperationLines && university.cooperationLines.length > 0 ? (
                                  <div className="space-y-3">
                                    {university.cooperationLines.map((record, index) => (
                                      <Card key={record.id || index} className="p-3">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge variant="outline" className={`text-xs ${getCooperationLineBadgeColor(record.line)}`}>
                                                {getCooperationLineLabel(record.line)}
                                              </Badge>
                                              <div className="flex items-center gap-2">
                                                <Label className="text-sm text-muted-foreground">Год начала сотрудничества:</Label>
                                                <span className="text-base font-medium text-foreground">{record.year}</span>
                                              </div>
                                            </div>
                                            {record.responsible && record.responsible.length > 0 && (
                                              <div className="flex items-center gap-2">
                                                <Label className="text-sm font-semibold">Ответственное лицо:</Label>
                                                <div className="flex flex-wrap gap-3">
                                                  {record.responsible.map((personId, personIndex) => {
                                                    const person = responsiblePersons.find(p => p.value === personId);
                                                    return person ? (
                                                      <div key={personIndex} className="flex items-center gap-2">
                                                        <Avatar className="h-10 w-10">
                                                          <AvatarImage src={person.image} alt={person.label} />
                                                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                            {person.label.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase()}
                                                          </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                          <span className="text-sm font-medium">{person.label}</span>
                                                          <span className="text-xs text-muted-foreground">{person.position}</span>
                                                        </div>
                                                      </div>
                                                    ) : null;
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-1 shrink-0">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 shrink-0"
                                              onClick={() => handleEditCooperationLineInMain(university.id, record.id)}
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 shrink-0"
                                              onClick={() => handleRemoveCooperationLineFromMain(university.id, record.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  /* Старый формат: для обратной совместимости */
                                  <Card className="p-3">
                                      <div className="flex-1 space-y-1.5">
                                        {university.cooperationLine && (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Label className="text-sm font-semibold text-foreground">
                                              {Array.isArray(university.cooperationLine) && university.cooperationLine.length > 1 
                                                ? "Линии сотрудничества" 
                                                : "Линия сотрудничества"}
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                              {Array.isArray(university.cooperationLine) ? (
                                                university.cooperationLine.map((line, index) => (
                                                  <Badge key={index} variant="outline" className={`text-xs ${getCooperationLineBadgeColor(line)}`}>
                                                    {getCooperationLineLabel(line)}
                                                  </Badge>
                                                ))
                                              ) : (
                                                <Badge variant="outline" className={`text-xs ${getCooperationLineBadgeColor(university.cooperationLine)}`}>
                                                  {getCooperationLineLabel(university.cooperationLine)}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {(university.cooperationLineYear || university.cooperationStartYear) && (
                                            <div className="flex items-center gap-2">
                                              <Label className="text-sm text-muted-foreground">
                                                {university.cooperationLine ? "Год по линии" : "Год начала сотрудничества"}
                                              </Label>
                                              <span className="text-base font-medium">
                                                {university.cooperationLineYear ?? university.cooperationStartYear}
                                              </span>
                                            </div>
                                          )}
                                          {university.cooperationLineResponsible && (
                                            <div className="flex items-center gap-2">
                                              <Label className="text-sm font-semibold">Ответственное лицо по линии:</Label>
                                              <div className="flex flex-wrap gap-3">
                                                {Array.isArray(university.cooperationLineResponsible) ? (
                                                  university.cooperationLineResponsible.map((personId, index) => {
                                                    const person = responsiblePersons.find(p => p.value === personId);
                                                    return person ? (
                                                      <div key={index} className="flex items-center gap-2">
                                                        <Avatar className="h-10 w-10">
                                                          <AvatarImage src={person.image} alt={person.label} />
                                                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                            {person.label.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase()}
                                                          </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                          <span className="text-sm font-medium">{person.label}</span>
                                                          <span className="text-xs text-muted-foreground">{person.position}</span>
                                                        </div>
                                                      </div>
                                                    ) : null;
                                                  })
                                                ) : (
                                                  <span className="text-base font-medium">{university.cooperationLineResponsible}</span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                )}
                                <div className="flex items-center justify-end w-full">
                                  <Button
                                    onClick={() => {
                                      setNewCooperationLineForMain({
                                        id: `clr-${Date.now()}`,
                                        line: "drp",
                                        year: new Date().getFullYear(),
                                        responsible: [],
                                      });
                                      setEditingMainCooperationLine(null);
                                      setIsMainCooperationLineDialogOpen(true);
                                    }}
                                    size="sm"
                                    disabled={!selectedUniversity}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить линию сотрудничества
                                  </Button>
                                </div>
                                </div>
                              ) : (
                                <Card className="p-3">
                                  <p className="text-sm text-muted-foreground text-center">Линии сотрудничества не добавлены</p>
                                  <div className="flex items-center justify-end w-full mt-3">
                                    <Button
                                      onClick={() => {
                                        setNewCooperationLineForMain({
                                          id: `clr-${Date.now()}`,
                                          line: "drp",
                                          year: new Date().getFullYear(),
                                          responsible: [],
                                        });
                                        setEditingMainCooperationLine(null);
                                        setIsMainCooperationLineDialogOpen(true);
                                      }}
                                      size="sm"
                                      disabled={!selectedUniversity}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Добавить линию сотрудничества
                                    </Button>
                                  </div>
                                </Card>
                              )}
                            </TabsContent>
                            
                            {/* Подтаб: Филиалы ВУЗа */}
                            <TabsContent value="branches" className="space-y-4 mt-4">
                              <div className="space-y-3">
                                {university.branchCurators && university.branchCurators.length > 0 ? (
                                  <>
                                    {university.branchCurators.map((curator) => (
                                      <Card key={curator.id} className="p-3">
                                        {editingCuratorId === curator.id ? (
                                          <div className="flex-1 space-y-1.5">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                              <div className="space-y-1">
                                                <Label htmlFor={`edit-curator-city-${curator.id}`} className="text-xs text-muted-foreground">Город</Label>
                                                <Input
                                                  id={`edit-curator-city-${curator.id}`}
                                                  placeholder="Москва"
                                                  value={editingCurator.city}
                                                  onChange={(e) => setEditingCurator({ ...editingCurator, city: e.target.value })}
                                                  className="h-9"
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <Label htmlFor={`edit-curator-branch-${curator.id}`} className="text-xs text-muted-foreground">Филиал</Label>
                                                <Input
                                                  id={`edit-curator-branch-${curator.id}`}
                                                  placeholder="Московский филиал"
                                                  value={editingCurator.branch}
                                                  onChange={(e) => setEditingCurator({ ...editingCurator, branch: e.target.value })}
                                                  className="h-9"
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-2">
                                              <Label className="text-xs text-muted-foreground">Линии сотрудничества (максимум 3)</Label>
                                              <div className="space-y-3">
                                                {editingCurator.cooperationLines.map((record, index) => (
                                                  <div key={record.id} className="p-3 border rounded-lg space-y-2">
                                                    <div className="flex items-center gap-2">
                                                      <Select
                                                        value={record.line}
                                                        onValueChange={(value) => {
                                                          const updated = editingCurator.cooperationLines.map((r, i) =>
                                                            i === index ? { ...r, line: value as CooperationLine } : r
                                                          );
                                                          setEditingCurator({ ...editingCurator, cooperationLines: updated });
                                                        }}
                                                      >
                                                        <SelectTrigger className="flex-1 h-9">
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {cooperationLines.map((line) => (
                                                            <SelectItem key={line.value} value={line.value}>
                                                              {line.label}
                                                            </SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                          const updated = editingCurator.cooperationLines.filter((_, i) => i !== index);
                                                          setEditingCurator({ ...editingCurator, cooperationLines: updated });
                                                        }}
                                                        className="h-9 w-9"
                                                      >
                                                        <X className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                      <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Год начала</Label>
                                                        <Input
                                                          type="number"
                                                          value={record.year}
                                                          onChange={(e) => {
                                                            const updated = editingCurator.cooperationLines.map((r, i) =>
                                                              i === index ? { ...r, year: parseInt(e.target.value) || new Date().getFullYear() } : r
                                                            );
                                                            setEditingCurator({ ...editingCurator, cooperationLines: updated });
                                                          }}
                                                          placeholder={String(new Date().getFullYear())}
                                                          className="h-9"
                                                        />
                                                      </div>
                                                      <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Ответственное лицо</Label>
                                                        <MultiSelect
                                                          options={responsiblePersons.map(p => ({ value: p.value, label: p.label }))}
                                                          selected={record.responsible}
                                                          onChange={(selected) => {
                                                            const updated = editingCurator.cooperationLines.map((r, i) =>
                                                              i === index ? { ...r, responsible: selected } : r
                                                            );
                                                            setEditingCurator({ ...editingCurator, cooperationLines: updated });
                                                          }}
                                                          placeholder="Выберите ответственное лицо"
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                                {editingCurator.cooperationLines.length < 3 && (
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                      const newRecord: CooperationLineRecord = {
                                                        id: `clr-${Date.now()}`,
                                                        line: "drp",
                                                        year: new Date().getFullYear(),
                                                        responsible: [],
                                                      };
                                                      setEditingCurator({
                                                        ...editingCurator,
                                                        cooperationLines: [...editingCurator.cooperationLines, newRecord],
                                                      });
                                                    }}
                                                    className="w-full"
                                                  >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Добавить линию
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEditingCurator}
                                              >
                                                Отмена
                                              </Button>
                                              <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleUpdateCuratorForUniversity(university.id, curator.id)}
                                                disabled={!editingCurator.city.trim() || !editingCurator.branch.trim()}
                                              >
                                                Сохранить
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 shrink-0"
                                                    onClick={() => {
                                                      const newCollapsed = new Set(collapsedBranches);
                                                      if (newCollapsed.has(curator.id)) {
                                                        newCollapsed.delete(curator.id);
                                                      } else {
                                                        newCollapsed.add(curator.id);
                                                      }
                                                      setCollapsedBranches(newCollapsed);
                                                    }}
                                                    title={collapsedBranches.has(curator.id) ? "Развернуть" : "Свернуть"}
                                                  >
                                                    {collapsedBranches.has(curator.id) ? (
                                                      <ChevronRight className="h-3.5 w-3.5" />
                                                    ) : (
                                                      <ChevronDown className="h-3.5 w-3.5" />
                                                    )}
                                                  </Button>
                                                  <Badge variant="secondary" className="text-sm font-semibold px-3 py-1.5 flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20">
                                                    <Building2 className="h-4 w-4" />
                                                    <span className="text-sm text-muted-foreground font-normal">Филиал:</span>
                                                    <span className="text-base font-bold">{curator.branch}</span>
                                                  </Badge>
                                                  <Separator orientation="vertical" className="h-6" />
                                                  <Badge variant="secondary" className="text-sm font-semibold px-3 py-1.5 flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="text-sm text-muted-foreground font-normal">Город:</span>
                                                    <span className="text-base font-bold">{curator.city}</span>
                                                  </Badge>
                                                  {curator.cooperationLines && curator.cooperationLines.length > 0 && (
                                                    <>
                                                      <Separator orientation="vertical" className="h-6" />
                                                      <div className="flex items-center gap-2 flex-wrap">
                                                        {curator.cooperationLines.map((record, idx) => (
                                                          <Badge key={record.id || idx} variant="outline" className={`text-xs ${getCooperationLineBadgeColor(record.line)}`}>
                                                            {getCooperationLineLabel(record.line)}
                                                          </Badge>
                                                        ))}
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex gap-1 shrink-0">
                                                {(!curator.cooperationLines || curator.cooperationLines.length < 3) && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 shrink-0"
                                                    onClick={() => {
                                                      setSelectedBranchId(curator.id);
                                                      setNewCooperationLineForBranch({
                                                        id: `clr-${Date.now()}`,
                                                        line: "drp",
                                                        year: new Date().getFullYear(),
                                                        responsible: [],
                                                      });
                                                      setIsCooperationLineDialogOpen(true);
                                                    }}
                                                    title="Добавить линию сотрудничества"
                                                  >
                                                    <Plus className="h-3.5 w-3.5" />
                                                  </Button>
                                                )}
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 shrink-0"
                                                  onClick={() => handleStartEditingCurator(curator)}
                                                  title="Редактировать"
                                                >
                                                  <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 shrink-0"
                                                  onClick={() => handleRemoveCuratorForUniversity(university.id, curator.id)}
                                                  title="Удалить"
                                                >
                                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                </Button>
                                              </div>
                                            </div>
                                            {!collapsedBranches.has(curator.id) && curator.cooperationLines && curator.cooperationLines.length > 0 && (
                                              <div className="space-y-3 mt-3 pt-3 border-t">
                                                {curator.cooperationLines.map((record, idx) => (
                                                  <Card key={record.id || idx} className="p-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                      <div className="flex-1 space-y-1.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          <Badge variant="outline" className={`text-xs ${getCooperationLineBadgeColor(record.line)}`}>
                                                            {getCooperationLineLabel(record.line)}
                                                          </Badge>
                                                          <div className="flex items-center gap-2">
                                                            <Label className="text-sm text-muted-foreground">Год начала сотрудничества:</Label>
                                                            <span className="text-base font-medium text-foreground">{record.year}</span>
                                                          </div>
                                                        </div>
                                                        {record.responsible && record.responsible.length > 0 && (
                                                          <div className="flex items-center gap-2">
                                                            <Label className="text-sm font-semibold">Ответственное лицо:</Label>
                                                            <div className="flex flex-wrap gap-3">
                                                              {record.responsible.map((personId, personIndex) => {
                                                                const person = responsiblePersons.find(p => p.value === personId);
                                                                return person ? (
                                                                  <div key={personIndex} className="flex items-center gap-2">
                                                                    <Avatar className="h-10 w-10">
                                                                      <AvatarImage src={person.image} alt={person.label} />
                                                                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                                        {person.label.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase()}
                                                                      </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col">
                                                                      <span className="text-sm font-medium">{person.label}</span>
                                                                      <span className="text-xs text-muted-foreground">{person.position}</span>
                                                                    </div>
                                                                  </div>
                                                                ) : null;
                                                              })}
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="flex gap-1 shrink-0">
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-8 w-8 p-0 shrink-0"
                                                          onClick={() => handleEditCooperationLineInBranch(university.id, curator.id, record.id)}
                                                        >
                                                          <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-8 w-8 p-0 shrink-0"
                                                          onClick={() => handleRemoveCooperationLineFromBranch(university.id, curator.id, record.id)}
                                                        >
                                                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </Card>
                                                ))}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </Card>
                                    ))}
                                  </>
                                ) : (
                                  <Card className="p-3">
                                    <p className="text-sm text-muted-foreground text-center">Филиалы ВУЗа не добавлены</p>
                                  </Card>
                                )}
                                
                                <div className="flex items-center justify-end w-full">
                                  <Button
                                    onClick={() => {
                                      setNewCuratorForUniversity({ city: "", branch: "", cooperationLines: [] });
                                      setIsBranchDialogOpen(true);
                                    }}
                                    size="sm"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить филиал
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </TabsContent>

                        {/* Таб 2: Договорная база */}
                        <TabsContent value="contracts" className="space-y-4 mt-4">
                          <div className="space-y-4">
                            {/* Виджет статистики и кнопка добавления */}
                            <div className="flex items-center gap-4 w-full">
                              {selectedUniversity && (() => {
                                const stats = getContractStatistics(selectedUniversity);
                                return (
                                  <>
                                    <Card className="p-3 flex-[3]">
                                      <div className="space-y-2">
                                        <Label className="text-base font-semibold">Тип договора</Label>
                                        <div className="flex items-center gap-3">
                                          <div className="text-base">
                                            <span className="text-muted-foreground">О сотрудничестве: </span>
                                            <Badge
                                              variant="outline"
                                              className={`!bg-blue-500 !text-white !border-blue-500 hover:!bg-blue-600 cursor-pointer ${contractFilters.type === "cooperation" ? "ring-2 ring-blue-600" : ""}`}
                                              onClick={() => {
                                                setContractFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "cooperation" ? null : "cooperation"
                                                }));
                                              }}
                                            >
                                              {stats.byType.cooperation}
                                            </Badge>
                                          </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Об именных стипендиях: </span>
                                            <Badge 
                                              variant="outline"
                                              className={`!bg-purple-500 !text-white !border-purple-500 hover:!bg-purple-600 cursor-pointer ${contractFilters.type === "scholarship" ? "ring-2 ring-purple-600" : ""}`}
                                              onClick={() => {
                                                setContractFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "scholarship" ? null : "scholarship"
                                                }));
                                              }}
                                            >
                                              {stats.byType.scholarship}
                                            </Badge>
                                          </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">О практике: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`!bg-green-500 !text-white !border-green-500 hover:!bg-green-600 cursor-pointer ${contractFilters.type === "internship" ? "ring-2 ring-green-600" : ""}`}
                                              onClick={() => {
                                                setContractFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "internship" ? null : "internship"
                                                }));
                                              }}
                                            >
                                              {stats.byType.internship}
                                            </Badge>
                                          </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Кафедра банка: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`!bg-orange-500 !text-white !border-orange-500 hover:!bg-orange-600 cursor-pointer ${contractFilters.type === "bankDepartment" ? "ring-2 ring-orange-600" : ""}`}
                                              onClick={() => {
                                                setContractFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "bankDepartment" ? null : "bankDepartment"
                                                }));
                                              }}
                                            >
                                              {stats.byType.bankDepartment}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                    <Card className="p-3 flex-[1]">
                                      <div className="space-y-2">
                                        <Label className="text-base font-semibold">Статус</Label>
                                        <div className="flex items-center gap-3">
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Активный: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`cursor-pointer ${contractFilters.status === "active" ? "ring-2 ring-primary" : ""}`}
                                              onClick={() => {
                                                setContractFilters(prev => ({
                                                  ...prev,
                                                  status: prev.status === "active" ? null : "active"
                                                }));
                                              }}
                                            >
                                              {stats.byStatus.active}
                                            </Badge>
                                          </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Истекший: </span>
                                            <Badge 
                                              variant="default" 
                                              className={`cursor-pointer ${contractFilters.status === "expired" ? "ring-2 ring-primary" : ""}`}
                                              onClick={() => {
                                                setContractFilters(prev => ({
                                                  ...prev,
                                                  status: prev.status === "expired" ? null : "expired"
                                                }));
                                              }}
                                            >
                                              {stats.byStatus.expired}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  </>
                                );
                              })()}
                              <Button
                                onClick={() => {
                                  setEditingContract(null);
                                  setNewContractForTab({ type: "cooperation", hasContract: true, contractFile: "", number: "", date: "", period: { start: "", end: "" }, asddLink: "", contractBranch: "" });
                                  setIsContractDialogOpen(true);
                                }}
                                size="sm"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить договор
                              </Button>
                            </div>

                            {/* Список договоров */}
                            {university.contracts && university.contracts.length > 0 ? (() => {
                              const filteredContracts = university.contracts.filter((contract) => {
                                // Фильтрация по типу
                                if (contractFilters.type && contract.type !== contractFilters.type) return false;
                                // Фильтрация по статусу
                                if (contractFilters.status) {
                                  const now = new Date();
                                  const isExpired = contract.period?.end ? new Date(contract.period.end) < now : false;
                                  if (contractFilters.status === "expired" && !isExpired) return false;
                                  if (contractFilters.status === "active" && isExpired) return false;
                                }
                                return true;
                              });
                              return filteredContracts.length > 0 ? (
                                <div className="space-y-3">
                                  {filteredContracts.map((contract) => {
                                  const contractTypeLabels: Record<Contract["type"], string> = {
                                    cooperation: "О сотрудничестве",
                                    scholarship: "Об именных стипендиях",
                                    internship: "О практике",
                                    bankDepartment: "Кафедра банка",
                                  };
                                  // Проверка истечения срока действия договора
                                  const isExpired = contract.period?.end 
                                    ? new Date(contract.period.end) < new Date()
                                    : false;
                                  return (
                                    <Card 
                                      key={contract.id} 
                                      className={`p-4 relative ${isExpired ? 'border-2 border-red-300' : ''}`}
                                    >
                                      {isExpired && (
                                        <div className="absolute -top-3 left-4 px-2 bg-red-100 text-red-700 text-xs font-medium rounded border border-red-300">
                                          Истек срок действия договора
                                        </div>
                                      )}
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className={`text-xs ${getContractTypeBadgeColor(contract.type)}`}>
                                              {contractTypeLabels[contract.type]}
                                            </Badge>
                                            {contract.contractBranch && (
                                              <Badge variant="secondary" className="text-xs">
                                                {contract.contractBranch}
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            {contract.number && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-muted-foreground whitespace-nowrap">Номер:</span>
                                                <span className="font-medium">{contract.number}</span>
                                              </div>
                                            )}
                                            {contract.date && (
                                              <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                <span className="font-medium">{formatDateToDDMMYYYY(contract.date)}</span>
                                              </div>
                                            )}
                                            {contract.period && (contract.period.start || contract.period.end) && (
                                              <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Период действия:</span>
                                                <span className="font-medium">
                                                  {contract.period.start && contract.period.end 
                                                    ? `${formatDateToDDMMYYYY(contract.period.start)}.${formatDateToDDMMYYYY(contract.period.end)}`
                                                    : formatDateToDDMMYYYY(contract.period.start || contract.period.end || "")}
                                                </span>
                                              </div>
                                            )}
                                            {contract.asddLink && (
                                              <div className="flex items-start gap-2 md:col-span-2">
                                                <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Ссылка на АСДД:</span>
                                                <a 
                                                  href={contract.asddLink} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-primary hover:underline break-all"
                                                >
                                                  {contract.asddLink}
                                                </a>
                                              </div>
                                            )}
                                            {contract.contractFile && (
                                              <div className="flex items-start gap-2 md:col-span-2">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Файл договора:</span>
                                                <a 
                                                  href={contract.contractFile} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-primary hover:underline break-all"
                                                >
                                                  {contract.contractFile}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                              handleEditContractForTab(university.id, contract.id);
                                            }}
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleRemoveContractForTab(university.id, contract.id)}
                                          >
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                    </Card>
                                  );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-base">Договоры не найдены по выбранным фильтрам</p>
                                </div>
                              );
                            })() : (
                              <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-base">Договоры не добавлены</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        {/* Таб 3: Мероприятия */}
                        <TabsContent value="events" className="space-y-4 mt-4">
                          <div className="space-y-4">
                            {/* Виджет статистики и кнопка добавления */}
                            <div className="flex items-center gap-4 w-full">
                              {selectedUniversity && (() => {
                                const stats = getEventStatistics(selectedUniversity);
                                return (
                                  <>
                                    <Card className="p-3 flex-[2]">
                        <div className="space-y-2">
                                        <Label className="text-base font-semibold">Тип мероприятия</Label>
                                        <div className="flex items-center gap-3">
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Дни карьеры: </span>
                          <Badge
                            variant="outline"
                                              className={`!bg-blue-500 !text-white !border-blue-500 hover:!bg-blue-600 cursor-pointer ${eventFilters.type === "careerDays" ? "ring-2 ring-blue-600" : ""}`}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "careerDays" ? null : "careerDays"
                                                }));
                                              }}
                                            >
                                              {stats.byType.careerDays}
                          </Badge>
                        </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Экспертное участие: </span>
                                            <Badge 
                                variant="outline"
                                              className={`!bg-purple-500 !text-white !border-purple-500 hover:!bg-purple-600 cursor-pointer ${eventFilters.type === "expertParticipation" ? "ring-2 ring-purple-600" : ""}`}
                                onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "expertParticipation" ? null : "expertParticipation"
                                                }));
                                              }}
                                            >
                                              {stats.byType.expertParticipation}
                                            </Badge>
                            </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Кейс-чемпионат: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`!bg-green-500 !text-white !border-green-500 hover:!bg-green-600 cursor-pointer ${eventFilters.type === "caseChampionships" ? "ring-2 ring-green-600" : ""}`}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "caseChampionships" ? null : "caseChampionships"
                                                }));
                                              }}
                                            >
                                              {stats.byType.caseChampionships}
                                            </Badge>
                          </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Встреча: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`!bg-gray-500 !text-white !border-gray-500 hover:!bg-gray-600 cursor-pointer ${eventFilters.type === "meeting" ? "ring-2 ring-gray-600" : ""}`}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "meeting" ? null : "meeting"
                                                }));
                                              }}
                                            >
                                              {stats.byType.meeting}
                                            </Badge>
                          </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Коммуникация: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`!bg-cyan-500 !text-white !border-cyan-500 hover:!bg-cyan-600 cursor-pointer ${eventFilters.type === "communication" ? "ring-2 ring-cyan-600" : ""}`}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  type: prev.type === "communication" ? null : "communication"
                                                }));
                                              }}
                                            >
                                              {stats.byType.communication}
                                            </Badge>
                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                    <Card className="p-3 flex-[1]">
                        <div className="space-y-2">
                                        <Label className="text-base font-semibold">Статус</Label>
                                                <div className="flex items-center gap-3 flex-wrap">
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Запланировано: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={cn(
                                                "cursor-pointer",
                                                getStatusBadgeColor("planned"),
                                                eventFilters.status === "planned" && "ring-2 ring-primary"
                                              )}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  status: prev.status === "planned" ? null : "planned"
                                                }));
                                              }}
                                            >
                                              {stats.byStatus.planned}
                          </Badge>
                                                  </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">В процессе: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={cn(
                                                "cursor-pointer",
                                                getStatusBadgeColor("in_progress"),
                                                eventFilters.status === "in_progress" && "ring-2 ring-primary"
                                              )}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  status: prev.status === "in_progress" ? null : "in_progress"
                                                }));
                                              }}
                                            >
                                              {stats.byStatus.in_progress}
                                            </Badge>
                                                </div>
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Проведено: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={cn(
                                                "cursor-pointer",
                                                getStatusBadgeColor("completed"),
                                                eventFilters.status === "completed" && "ring-2 ring-primary"
                                              )}
                                              onClick={() => {
                                                setEventFilters(prev => ({
                                                  ...prev,
                                                  status: prev.status === "completed" ? null : "completed"
                                                }));
                                              }}
                                            >
                                              {stats.byStatus.completed}
                                            </Badge>
                                                </div>
                                                        </div>
                                                    </div>
                                    </Card>
                                  </>
                                                  );
                                                })()}
                              <Button
                                onClick={() => {
                                  setEditingEvent(null);
                                  setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: [] });
                                  setIsEventDialogOpen(true);
                                }}
                                disabled={!selectedUniversity}
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Добавить мероприятие
                              </Button>
                        </div>

                            {/* Список мероприятий */}
                            {university.events && university.events.length > 0 ? (() => {
                              const filteredEvents = university.events.filter(event => {
                                if (eventFilters.type && event.type !== eventFilters.type) return false;
                                if (eventFilters.status && event.status !== eventFilters.status) return false;
                                return true;
                              });
                              return filteredEvents.length > 0 ? (
                              <div className="space-y-3">
                                  {filteredEvents.map((event) => {
                                  const eventTypeLabels: Record<Event["type"], string> = {
                                    careerDays: "Дни карьеры",
                                    expertParticipation: "Экспертное участие",
                                    caseChampionships: "Кейс-чемпионат",
                                    meeting: "Встреча",
                                    communication: "Коммуникация",
                                  };
                                  const eventStatusLabels: Record<Event["status"], string> = {
                                    planned: "Запланировано",
                                    in_progress: "В процессе",
                                    completed: "Проведено",
                                  };
                                  const getEventTypeBadgeVariant = (type: Event["type"]): "outline" => {
                                    return "outline"; // Используем outline для всех, чтобы кастомные цвета работали
                                  };
                                  const getEventTypeBadgeClassName = (type: Event["type"]) => {
                                    switch (type) {
                                      case "careerDays":
                                        return "!bg-blue-500 !text-white !border-blue-500 hover:!bg-blue-600";
                                      case "expertParticipation":
                                        return "!bg-purple-500 !text-white !border-purple-500 hover:!bg-purple-600";
                                      case "caseChampionships":
                                        return "!bg-green-500 !text-white !border-green-500 hover:!bg-green-600";
                                      case "meeting":
                                        return "!bg-gray-500 !text-white !border-gray-500 hover:!bg-gray-600";
                                      case "communication":
                                        return "!bg-cyan-500 !text-white !border-cyan-500 hover:!bg-cyan-600";
                                      default:
                                        return "";
                                    }
                                  };
                                  return (
                                    <Card key={event.id} className="p-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 space-y-1.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge 
                                              variant={getEventTypeBadgeVariant(event.type)}
                                              className={getEventTypeBadgeClassName(event.type)}
                                            >
                                              {eventTypeLabels[event.type]}
                                            </Badge>
                                            <Badge 
                                              variant="outline" 
                                              className={cn(getStatusBadgeColor(event.status))}
                                            >
                                              {eventStatusLabels[event.status]}
                                            </Badge>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-semibold">
                                      {(() => {
                                                const formatDate = (dateString: string) => {
                                                  if (!dateString) return "Не указано";
                                                  // Парсим дату в формате YYYY-MM-DD
                                                  const [year, month, day] = dateString.split('-').map(Number);
                                                  if (isNaN(year) || isNaN(month) || isNaN(day)) {
                                                    return "Неверный формат";
                                                  }
                                                  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                                };
                                                return `${formatDate(event.date)} - ${formatDate(event.endDate)}`;
                                              })()}
                            </span>
                          </div>
                                      <div className="flex items-center gap-2">
                                            <Label className="text-sm font-semibold">Ответственное лицо Банк:</Label>
                                            <div className="flex items-center gap-2 flex-wrap">
                                              {event.responsiblePerson.length > 0 ? (
                                                event.responsiblePerson.map((personId, index) => {
                                                  const person = responsiblePersons.find(p => p.value === personId);
                                                  return person ? (
                                                    <div key={index} className="flex items-center gap-2">
                                                      <Avatar className="h-10 w-10 shrink-0">
                                                        <AvatarImage src={person.image} alt={person.label} />
                                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                          {person.label.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase()}
                                                        </AvatarFallback>
                                                      </Avatar>
                                                      <span className="text-sm font-medium">{person.label}</span>
                                                    </div>
                                                  ) : null;
                                                })
                                              ) : (
                                                <span className="text-sm text-muted-foreground">Не указано</span>
                                              )}
                                            </div>
                                                </div>
                                          {event.comments && (
                                            <div className="flex items-center gap-2">
                                              <Label className="text-sm font-semibold">Комментарий:</Label>
                                              <span className="text-sm text-muted-foreground">{event.comments}</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                <div className="flex gap-1">
                              <Button
                                                    variant="ghost"
                                size="sm"
                                            className="h-8 w-8 p-0"
                                onClick={() => {
                                              handleEditEvent(selectedUniversity!, event.id);
                                            }}
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleRemoveEvent(selectedUniversity!, event.id)}
                                          >
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                                    </Card>
                                        );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-base">Мероприятия не найдены по выбранным фильтрам</p>
                                </div>
                              );
                            })() : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-base">Мероприятия не добавлены</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        {/* Таб 4: Кадровые показатели */}
                        <TabsContent value="staff" className="space-y-4 mt-4">
                          <Tabs value={staffSubTab} onValueChange={(v) => setStaffSubTab(v as typeof staffSubTab)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="interns">Сотрудники</TabsTrigger>
                              <TabsTrigger value="practitioners">Практиканты</TabsTrigger>
                            </TabsList>
                            
                            {/* Подтаб: Сотрудники */}
                            <TabsContent value="interns" className="space-y-4 mt-4">
                              {(() => {
                                // Вычисляем отфильтрованные данные один раз
                                const filteredInterns = (university.internList || []).filter((intern) => {
                                  // Фильтр по имени сотрудника
                                  if (internsFilters.employeeName) {
                                    const searchName = internsFilters.employeeName.toLowerCase();
                                    if (!intern.employeeName.toLowerCase().includes(searchName)) {
                                      return false;
                                    }
                                  }
                                  
                                  // Фильтр по возрасту
                                  if (internsFilters.ageMin && intern.age < Number(internsFilters.ageMin)) {
                                    return false;
                                  }
                                  if (internsFilters.ageMax && intern.age > Number(internsFilters.ageMax)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по должности
                                  if (internsFilters.positions.length > 0 && !internsFilters.positions.includes(intern.position)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по подразделению
                                  if (internsFilters.departments.length > 0 && !internsFilters.departments.includes(intern.department)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по дате приема на работу
                                  if (internsFilters.hireDateFrom && intern.hireDate < internsFilters.hireDateFrom) {
                                    return false;
                                  }
                                  if (internsFilters.hireDateTo && intern.hireDate > internsFilters.hireDateTo) {
                                    return false;
                                  }
                                  
                                  // Фильтр по статусу
                                  if (internsFilters.statuses.length > 0 && !internsFilters.statuses.includes(intern.status)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по практике в банке
                                  if (internsFilters.practiceInBank !== "all") {
                                    const hasPractice = intern.practiceInBank;
                                    if (internsFilters.practiceInBank === "yes" && !hasPractice) {
                                      return false;
                                    }
                                    if (internsFilters.practiceInBank === "no" && hasPractice) {
                                      return false;
                                    }
                                  }
                                  
                                  // Фильтр по стажировке в банке
                                  if (internsFilters.internshipInBank !== "all") {
                                    const hasInternship = intern.internshipInBank;
                                    if (internsFilters.internshipInBank === "yes" && !hasInternship) {
                                      return false;
                                    }
                                    if (internsFilters.internshipInBank === "no" && hasInternship) {
                                      return false;
                                    }
                                  }
                                  
                                  return true;
                                });
                                
                                return university.internList && university.internList.length > 0 ? (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className="text-sm text-muted-foreground">
                                          Найдено: <span className="font-semibold text-foreground">{filteredInterns.length}</span> {filteredInterns.length === 1 ? 'сотрудник' : filteredInterns.length > 1 && filteredInterns.length < 5 ? 'сотрудника' : 'сотрудников'}
                                          {filteredInterns.length !== university.internList.length && (
                                            <span className="ml-1">из {university.internList.length}</span>
                                          )}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setInternsFilters({
                                              employeeName: "",
                                              ageMin: "",
                                              ageMax: "",
                                              positions: [],
                                              departments: [],
                                              hireDateFrom: "",
                                              hireDateTo: "",
                                              statuses: [],
                                              practiceInBank: "all",
                                              internshipInBank: "all",
                                            });
                                            setInternsCurrentPage(1);
                                          }}
                                        >
                                          Показать всех
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setInternsFilters({
                                              employeeName: "",
                                              ageMin: "",
                                              ageMax: "27",
                                              positions: [],
                                              departments: [],
                                              hireDateFrom: "",
                                              hireDateTo: "",
                                              statuses: [],
                                              practiceInBank: "all",
                                              internshipInBank: "all",
                                            });
                                            setInternsCurrentPage(1);
                                          }}
                                        >
                                          До 27 лет
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Dialog open={internsFilterDialogOpen} onOpenChange={setInternsFilterDialogOpen}>
                                          <DialogTrigger asChild>
                                            <Button variant="outline">
                                              <Filter className="mr-2 h-4 w-4" />
                                              Фильтры
                                          {(() => {
                                            const activeFiltersCount = 
                                              (internsFilters.employeeName ? 1 : 0) +
                                              (internsFilters.ageMin || internsFilters.ageMax ? 1 : 0) +
                                              internsFilters.positions.length +
                                              internsFilters.departments.length +
                                              (internsFilters.hireDateFrom || internsFilters.hireDateTo ? 1 : 0) +
                                              internsFilters.statuses.length +
                                              (internsFilters.practiceInBank !== "all" ? 1 : 0) +
                                              (internsFilters.internshipInBank !== "all" ? 1 : 0);
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
                                          <DialogTitle className="text-lg">Фильтры сотрудников</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                          {/* Фильтр по имени сотрудника */}
                            <div className="space-y-2">
                                            <Label className="text-sm font-medium">Сотрудник</Label>
                                            <Input
                                              placeholder="Поиск по ФИО..."
                                              value={internsFilters.employeeName}
                                              onChange={(e) => setInternsFilters({ ...internsFilters, employeeName: e.target.value })}
                                            />
                                          </div>
                                          
                                          {/* Фильтр по возрасту */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Возраст</Label>
                              <div className="flex items-center gap-2">
                                              <Input
                                                type="number"
                                                placeholder="От"
                                                value={internsFilters.ageMin}
                                                onChange={(e) => setInternsFilters({ ...internsFilters, ageMin: e.target.value })}
                                                className="w-full"
                                              />
                                              <span className="text-sm text-muted-foreground">—</span>
                                              <Input
                                                type="number"
                                                placeholder="До"
                                                value={internsFilters.ageMax}
                                                onChange={(e) => setInternsFilters({ ...internsFilters, ageMax: e.target.value })}
                                                className="w-full"
                                              />
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по должности */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Должность</Label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                              {(() => {
                                                const uniquePositions = Array.from(new Set(university.internList?.map(i => i.position) || []));
                                                return uniquePositions.map((position) => (
                                                  <div key={position} className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`filter-position-${position}`}
                                                      checked={internsFilters.positions.includes(position)}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setInternsFilters({
                                                            ...internsFilters,
                                                            positions: [...internsFilters.positions, position],
                                                          });
                                                        } else {
                                                          setInternsFilters({
                                                            ...internsFilters,
                                                            positions: internsFilters.positions.filter((p) => p !== position),
                                                          });
                                                        }
                                                      }}
                                                    />
                                                    <Label
                                                      htmlFor={`filter-position-${position}`}
                                                      className="text-sm font-normal cursor-pointer"
                                                    >
                                                      {position}
                                                    </Label>
                              </div>
                                                ));
                                              })()}
                            </div>
                                          </div>
                                          
                                          {/* Фильтр по подразделению */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Подразделение</Label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                              {(() => {
                                                const uniqueDepartments = Array.from(new Set(university.internList?.map(i => i.department) || []));
                                                return uniqueDepartments.map((department) => (
                                                  <div key={department} className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`filter-department-${department}`}
                                                      checked={internsFilters.departments.includes(department)}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setInternsFilters({
                                                            ...internsFilters,
                                                            departments: [...internsFilters.departments, department],
                                                          });
                                                        } else {
                                                          setInternsFilters({
                                                            ...internsFilters,
                                                            departments: internsFilters.departments.filter((d) => d !== department),
                                                          });
                                                        }
                                                      }}
                                                    />
                                                    <Label
                                                      htmlFor={`filter-department-${department}`}
                                                      className="text-sm font-normal cursor-pointer"
                                                    >
                                                      {department}
                            </Label>
                                                  </div>
                                                ));
                                              })()}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по дате приема на работу */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Дата приема на работу</Label>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="date"
                                                placeholder="От"
                                                value={internsFilters.hireDateFrom}
                                                onChange={(e) => setInternsFilters({ ...internsFilters, hireDateFrom: e.target.value })}
                                                className="w-full"
                                              />
                                              <span className="text-sm text-muted-foreground">—</span>
                                              <Input
                                                type="date"
                                                placeholder="До"
                                                value={internsFilters.hireDateTo}
                                                onChange={(e) => setInternsFilters({ ...internsFilters, hireDateTo: e.target.value })}
                                                className="w-full"
                                              />
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по статусу */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Статус</Label>
                                            <div className="space-y-1.5">
                                              {(["active", "dismissed"] as const).map((status) => (
                                                <div key={status} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`filter-status-${status}`}
                                                    checked={internsFilters.statuses.includes(status)}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        setInternsFilters({
                                                          ...internsFilters,
                                                          statuses: [...internsFilters.statuses, status],
                                                        });
                                                      } else {
                                                        setInternsFilters({
                                                          ...internsFilters,
                                                          statuses: internsFilters.statuses.filter((s) => s !== status),
                                                        });
                                                      }
                                                    }}
                                                  />
                                                  <Label
                                                    htmlFor={`filter-status-${status}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                  >
                                                    {status === "active" ? "Работает" : "Уволен"}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по практике в банке */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Практика в банке</Label>
                                            <Select
                                              value={internsFilters.practiceInBank}
                                              onValueChange={(value) => setInternsFilters({ ...internsFilters, practiceInBank: value as typeof internsFilters.practiceInBank })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="all">Все</SelectItem>
                                                <SelectItem value="yes">Да</SelectItem>
                                                <SelectItem value="no">Нет</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          
                                          {/* Фильтр по стажировке в банке */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Стажировка в банке</Label>
                                            <Select
                                              value={internsFilters.internshipInBank}
                                              onValueChange={(value) => setInternsFilters({ ...internsFilters, internshipInBank: value as typeof internsFilters.internshipInBank })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                                <SelectItem value="all">Все</SelectItem>
                                                <SelectItem value="yes">Да</SelectItem>
                                                <SelectItem value="no">Нет</SelectItem>
                                </SelectContent>
                              </Select>
                                          </div>
                                        </div>
                                        <DialogFooter className="pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                              setInternsFilters({
                                                employeeName: "",
                                                ageMin: "",
                                                ageMax: "",
                                                positions: [],
                                                departments: [],
                                                hireDateFrom: "",
                                                hireDateTo: "",
                                                statuses: [],
                                                internshipInBank: "all",
                                              });
                                              setInternsCurrentPage(1);
                                            }}
                                          >
                                            Сбросить
                              </Button>
                                          <Button size="sm" onClick={() => {
                                            setInternsFilterDialogOpen(false);
                                            setInternsCurrentPage(1);
                                          }}>
                                            Применить
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                            </div>
                                  
                                  {/* Активные фильтры */}
                                  {(() => {
                                    const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                                    
                                    // Фильтр по имени
                                    if (internsFilters.employeeName) {
                                      activeFilters.push({
                                        label: `Сотрудник: ${internsFilters.employeeName}`,
                                        onRemove: () => setInternsFilters({ ...internsFilters, employeeName: "" }),
                                      });
                                    }
                                    
                                    // Фильтр по возрасту
                                    if (internsFilters.ageMin || internsFilters.ageMax) {
                                      const ageLabel = internsFilters.ageMin && internsFilters.ageMax
                                        ? `Возраст: ${internsFilters.ageMin} - ${internsFilters.ageMax}`
                                        : internsFilters.ageMin
                                        ? `Возраст: от ${internsFilters.ageMin}`
                                        : `Возраст: до ${internsFilters.ageMax}`;
                                      activeFilters.push({
                                        label: ageLabel,
                                        onRemove: () => setInternsFilters({ ...internsFilters, ageMin: "", ageMax: "" }),
                                      });
                                    }
                                    
                                    // Фильтр по должностям
                                    internsFilters.positions.forEach((position) => {
                                      activeFilters.push({
                                        label: `Должность: ${position}`,
                                        onRemove: () => setInternsFilters({
                                          ...internsFilters,
                                          positions: internsFilters.positions.filter((p) => p !== position),
                                        }),
                                      });
                                    });
                                    
                                    // Фильтр по подразделениям
                                    internsFilters.departments.forEach((department) => {
                                      activeFilters.push({
                                        label: `Подразделение: ${department}`,
                                        onRemove: () => setInternsFilters({
                                          ...internsFilters,
                                          departments: internsFilters.departments.filter((d) => d !== department),
                                        }),
                                      });
                                    });
                                    
                                    // Фильтр по дате приема
                                    if (internsFilters.hireDateFrom || internsFilters.hireDateTo) {
                                      const formatDate = (dateString: string) => {
                                        if (!dateString) return "";
                                        const [year, month, day] = dateString.split('-').map(Number);
                                        return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                      };
                                      const dateLabel = internsFilters.hireDateFrom && internsFilters.hireDateTo
                                        ? `Дата приема: ${formatDate(internsFilters.hireDateFrom)} - ${formatDate(internsFilters.hireDateTo)}`
                                        : internsFilters.hireDateFrom
                                        ? `Дата приема: с ${formatDate(internsFilters.hireDateFrom)}`
                                        : `Дата приема: до ${formatDate(internsFilters.hireDateTo)}`;
                                      activeFilters.push({
                                        label: dateLabel,
                                        onRemove: () => setInternsFilters({ ...internsFilters, hireDateFrom: "", hireDateTo: "" }),
                                      });
                                    }
                                    
                                    // Фильтр по статусам
                                    internsFilters.statuses.forEach((status) => {
                                      activeFilters.push({
                                        label: `Статус: ${status === "active" ? "Работает" : "Уволен"}`,
                                        onRemove: () => setInternsFilters({
                                          ...internsFilters,
                                          statuses: internsFilters.statuses.filter((s) => s !== status),
                                        }),
                                      });
                                    });
                                    
                                    // Фильтр по практике в банке
                                    if (internsFilters.practiceInBank !== "all") {
                                      activeFilters.push({
                                        label: `Практика в банке: ${internsFilters.practiceInBank === "yes" ? "Да" : "Нет"}`,
                                        onRemove: () => setInternsFilters({ ...internsFilters, practiceInBank: "all" }),
                                      });
                                    }
                                    
                                    // Фильтр по стажировке в банке
                                    if (internsFilters.internshipInBank !== "all") {
                                      activeFilters.push({
                                        label: `Стажировка в банке: ${internsFilters.internshipInBank === "yes" ? "Да" : "Нет"}`,
                                        onRemove: () => setInternsFilters({ ...internsFilters, internshipInBank: "all" }),
                                      });
                                    }
                                    
                                    if (activeFilters.length === 0) return null;
                                    
                                    return (
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                  
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[240px]">Сотрудник</TableHead>
                                        <TableHead className="w-[80px] text-center">Возраст</TableHead>
                                        <TableHead className="w-[290px]">Должность / Подразделение</TableHead>
                                        <TableHead className="w-[120px]">Дата приема на работу</TableHead>
                                        <TableHead className="w-[120px]">Статус</TableHead>
                                        <TableHead className="w-[140px]">Практика в банке</TableHead>
                                        <TableHead className="w-[120px]">Стажировка в банке</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(() => {
                                        // Логика пагинации
                                        const totalPages = Math.ceil(filteredInterns.length / internsItemsPerPage);
                                        const startIndex = (internsCurrentPage - 1) * internsItemsPerPage;
                                        const endIndex = startIndex + internsItemsPerPage;
                                        const paginatedInterns = filteredInterns.slice(startIndex, endIndex);
                                        
                                        return paginatedInterns.map((intern) => {
                                          const getInitials = (name: string) => {
                                            return name.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase();
                                          };
                                          
                                          // Функция для получения информации о практике
                                          const getPracticeInfo = () => {
                                            // Проверяем практикантов
                                            const practitioner = university.practitionerList?.find(p => p.employeeName === intern.employeeName);
                                            if (practitioner) {
                                              const formatDate = (dateStr: string) => {
                                                const [year, month, day] = dateStr.split('-').map(Number);
                                                return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                              };
                                              return {
                                                type: "Практика",
                                                period: `${formatDate(practitioner.practiceStartDate)} - ${formatDate(practitioner.practiceEndDate)}`,
                                                comment: practitioner.comment,
                                              };
                                            }
                                            
                                            // Проверяем участников кейс-чемпионатов
                                            const participant = university.caseChampionshipParticipants?.find(p => p.employeeName === intern.employeeName);
                                            if (participant) {
                                              return {
                                                type: "Участник кейс-чемп",
                                                period: null,
                                                comment: participant.comments,
                                              };
                                            }
                                            
                                            // Проверяем целевых практикантов
                                            const targetPractitioner = university.targetPractitioners?.find(p => p.employeeName === intern.employeeName);
                                            if (targetPractitioner) {
                                              const formatDate = (dateStr: string) => {
                                                const [year, month, day] = dateStr.split('-').map(Number);
                                                return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                              };
                                              return {
                                                type: "Целевая практика",
                                                period: `${formatDate(targetPractitioner.targetStartDate)} - ${formatDate(targetPractitioner.targetEndDate)}`,
                                                comment: targetPractitioner.comments,
                                              };
                                            }
                                            
                                            return null;
                                          };
                                          
                                          const practiceInfo = getPracticeInfo();
                                          
                                          return (
                                          <TableRow key={intern.id}>
                                              <TableCell className="px-4 whitespace-normal">
                                                <div className="flex items-center gap-3">
                                                  <Avatar className="h-10 w-10 shrink-0">
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                    {getInitials(intern.employeeName)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex flex-col min-w-0">
                                                  <span className="font-medium">{intern.employeeName}</span>
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal text-center">
                                                {intern.age}
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                    <div className="flex flex-col gap-1">
                                                <span className="font-medium">{intern.position}</span>
                                                        <div className="text-sm text-muted-foreground">
                                                  {intern.department}
                                                        </div>
                                                    </div>
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                              {(() => {
                                                const [year, month, day] = intern.hireDate.split('-').map(Number);
                                                return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                              })()}
                                              </TableCell>
                                              <TableCell>
                                                {intern.status === "dismissed" && intern.dismissalDate ? (
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Badge
                                                        variant="outline"
                                                        className={cn(
                                                          "text-xs px-2 py-0.5 cursor-help",
                                                          getStatusBadgeColor("cancelled")
                                                        )}
                                                      >
                                                        Уволен
                                                      </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>
                                                        Дата увольнения: {(() => {
                                                          const [year, month, day] = intern.dismissalDate!.split('-').map(Number);
                                                          return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                                        })()}
                                                      </p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                ) : (
                                                  <Badge
                                                    variant="outline"
                                                    className={cn(
                                                      "text-xs px-2 py-0.5",
                                                      getStatusBadgeColor("active")
                                                    )}
                                                  >
                                                    Работает
                                                  </Badge>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {intern.practiceInBank ? (
                                                  practiceInfo ? (
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <Badge
                                                          variant="outline"
                                                          className={cn(
                                                            "text-xs px-2 py-0.5 cursor-help",
                                                            getStatusBadgeColor("approved")
                                                          )}
                                                        >
                                                          Да
                                                        </Badge>
                                                      </TooltipTrigger>
                                                      <TooltipContent className="max-w-xs">
                                                        <div className="space-y-1">
                                                          <p className="font-semibold">Вид практики: {practiceInfo.type}</p>
                                                          {practiceInfo.period && (
                                                            <p>Период прохождения практики: {practiceInfo.period}</p>
                                                          )}
                                                          {practiceInfo.comment && (
                                                            <p className="text-sm">Комментарий: {practiceInfo.comment}</p>
                                                          )}
                                                        </div>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  ) : (
                                                    <Badge
                                                      variant="outline"
                                                      className={cn(
                                                        "text-xs px-2 py-0.5",
                                                        getStatusBadgeColor("approved")
                                                      )}
                                                    >
                                                      Да
                                                    </Badge>
                                                  )
                                                ) : (
                                                  <Badge
                                                    variant="outline"
                                                    className={cn(
                                                      "text-xs px-2 py-0.5",
                                                      getStatusBadgeColor("notStarted")
                                                    )}
                                                  >
                                                    Нет
                                                  </Badge>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {intern.internshipInBank && intern.internshipStartDate && intern.internshipEndDate ? (
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Badge
                                                        variant="outline"
                                                        className={cn(
                                                          "text-xs px-2 py-0.5 cursor-help",
                                                          getStatusBadgeColor("approved")
                                                        )}
                                                      >
                                                        Да
                                                      </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>
                                                        Период стажировки: {(() => {
                                                          const formatDate = (dateString: string) => {
                                                            const [year, month, day] = dateString.split('-').map(Number);
                                                            return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                                          };
                                                          return `${formatDate(intern.internshipStartDate)} - ${formatDate(intern.internshipEndDate!)}`;
                                                        })()}
                                                      </p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                ) : (
                                                  <Badge
                                                    variant="outline"
                                                    className={cn(
                                                      "text-xs px-2 py-0.5",
                                                      getStatusBadgeColor("notStarted")
                                                    )}
                                                  >
                                                    Нет
                                                  </Badge>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        });
                                      })()}
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                    {/* Пагинация для сотрудников */}
                                    {(() => {
                                      const totalPages = Math.ceil(filteredInterns.length / internsItemsPerPage);
                                      
                                      return (
                                        <div className="flex items-center justify-between px-2">
                                          <div className="flex items-center gap-2">
                                            <Label htmlFor="interns-items-per-page" className="text-sm text-muted-foreground">
                                              Показать:
                                            </Label>
                                                <Select
                                              value={internsItemsPerPage.toString()}
                                              onValueChange={(value) => {
                                                setInternsItemsPerPage(Number(value));
                                                setInternsCurrentPage(1);
                                              }}
                                            >
                                              <SelectTrigger id="interns-items-per-page" className="w-[80px]">
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
                                              из {filteredInterns.length}
                                            </span>
                                          </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          Страница {internsCurrentPage} из {totalPages}
                                        </span>
                                        <div className="flex items-center gap-1">
                                                  <Button
                                            variant="outline"
                                                    size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setInternsCurrentPage(1)}
                                            disabled={internsCurrentPage === 1}
                                          >
                                            <ChevronsLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setInternsCurrentPage(internsCurrentPage - 1)}
                                            disabled={internsCurrentPage === 1}
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setInternsCurrentPage(internsCurrentPage + 1)}
                                            disabled={internsCurrentPage === totalPages}
                                          >
                                            <ChevronRight className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setInternsCurrentPage(totalPages)}
                                            disabled={internsCurrentPage === totalPages}
                                          >
                                            <ChevronsRight className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                                </>
                              ) : (
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[250px]">Сотрудник</TableHead>
                                        <TableHead className="w-[80px] text-center">Возраст</TableHead>
                                        <TableHead className="w-[260px]">Должность / Подразделение</TableHead>
                                        <TableHead className="w-[120px]">Дата приема на работу</TableHead>
                                        <TableHead className="w-[120px]">Статус</TableHead>
                                        <TableHead className="w-[140px]">Практика в банке</TableHead>
                                        <TableHead className="w-[120px]">Стажировка в банке</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                          Сотрудники не добавлены
                                              </TableCell>
                                            </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              );
                              })()}
                            </TabsContent>
                            
                            {/* Подтаб: Практиканты */}
                            <TabsContent value="practitioners" className="space-y-4 mt-4">
                              {/* Переключатель между таблицами */}
                              <div className="flex items-center gap-2 mb-4">
                                <Button
                                  variant={practitionersSubTab === "practitioners" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPractitionersSubTab("practitioners")}
                                >
                                  Практиканты
                                  {university.practitionerList && university.practitionerList.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">{university.practitionerList.length}</Badge>
                                  )}
                                </Button>
                                <Button
                                  variant={practitionersSubTab === "caseChampionships" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPractitionersSubTab("caseChampionships")}
                                >
                                  Участники кейс-чемпионатов
                                  {university.caseChampionshipParticipants && university.caseChampionshipParticipants.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">{university.caseChampionshipParticipants.length}</Badge>
                                  )}
                                </Button>
                                <Button
                                  variant={practitionersSubTab === "targetPractitioners" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPractitionersSubTab("targetPractitioners")}
                                >
                                  Целевые практиканты
                                  {university.targetPractitioners && university.targetPractitioners.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">{university.targetPractitioners.length}</Badge>
                                  )}
                                </Button>
                              </div>

                              {/* Таблица практикантов */}
                              {practitionersSubTab === "practitioners" && (() => {
                                // Вычисляем отфильтрованные данные один раз
                                const filteredPractitioners = (university.practitionerList || []).filter((practitioner) => {
                                  // Фильтр по имени практиканта
                                  if (practitionersFilters.employeeName) {
                                    const searchName = practitionersFilters.employeeName.toLowerCase();
                                    if (!practitioner.employeeName.toLowerCase().includes(searchName)) {
                                      return false;
                                    }
                                  }
                                  
                                  // Фильтр по подразделению
                                  if (practitionersFilters.departments.length > 0 && !practitionersFilters.departments.includes(practitioner.department)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по периоду прохождения практики
                                  if (practitionersFilters.practiceStartDate && practitioner.practiceStartDate < practitionersFilters.practiceStartDate) {
                                    return false;
                                  }
                                  if (practitionersFilters.practiceEndDate && practitioner.practiceEndDate > practitionersFilters.practiceEndDate) {
                                    return false;
                                  }
                                  
                                  // Фильтр по сотруднику, добавившему запись
                                  if (practitionersFilters.addedBy.length > 0 && !practitionersFilters.addedBy.includes(practitioner.addedBy)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по статусу практики
                                  if (practitionersFilters.practiceStatus.length > 0) {
                                    const status = practitioner.practiceStatus || "meets";
                                    if (!practitionersFilters.practiceStatus.includes(status)) {
                                      return false;
                                    }
                                  }
                                  
                                  // Фильтр по комментарию
                                  if (practitionersFilters.comment) {
                                    const searchComment = practitionersFilters.comment.toLowerCase();
                                    if (!practitioner.comment || !practitioner.comment.toLowerCase().includes(searchComment)) {
                                      return false;
                                    }
                                  }
                                  
                                  return true;
                                });
                                
                                return university.practitionerList && university.practitionerList.length > 0 ? (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm text-muted-foreground">
                                        Найдено: <span className="font-semibold text-foreground">{filteredPractitioners.length}</span> {filteredPractitioners.length === 1 ? 'практикант' : filteredPractitioners.length > 1 && filteredPractitioners.length < 5 ? 'практиканта' : 'практикантов'}
                                        {filteredPractitioners.length !== university.practitionerList.length && (
                                          <span className="ml-1">из {university.practitionerList.length}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="outline">
                                          <FileText className="mr-2 h-4 w-4" />
                                          Импорт Excel
                                        </Button>
                                        <Dialog open={practitionersFilterDialogOpen} onOpenChange={setPractitionersFilterDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">
                                          <Filter className="mr-2 h-4 w-4" />
                                          Фильтры
                                          {(() => {
                                            const activeFiltersCount = 
                                              (practitionersFilters.employeeName ? 1 : 0) +
                                              practitionersFilters.departments.length +
                                              (practitionersFilters.practiceStartDate || practitionersFilters.practiceEndDate ? 1 : 0) +
                                              practitionersFilters.addedBy.length +
                                              practitionersFilters.practiceStatus.length +
                                              (practitionersFilters.comment ? 1 : 0);
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
                                          <DialogTitle className="text-lg">Фильтры практикантов</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                          {/* Фильтр по имени практиканта */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Практикант</Label>
                                            <Input
                                              placeholder="Поиск по ФИО..."
                                              value={practitionersFilters.employeeName}
                                              onChange={(e) => setPractitionersFilters({ ...practitionersFilters, employeeName: e.target.value })}
                                            />
                                          </div>
                                          
                                          {/* Фильтр по подразделению */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Подразделение</Label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                              {(() => {
                                                const uniqueDepartments = Array.from(new Set(university.practitionerList?.map(i => i.department) || []));
                                                return uniqueDepartments.map((department) => (
                                                  <div key={department} className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`filter-practitioner-department-${department}`}
                                                      checked={practitionersFilters.departments.includes(department)}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setPractitionersFilters({
                                                            ...practitionersFilters,
                                                            departments: [...practitionersFilters.departments, department],
                                                          });
                                                        } else {
                                                          setPractitionersFilters({
                                                            ...practitionersFilters,
                                                            departments: practitionersFilters.departments.filter((d) => d !== department),
                                                          });
                                                        }
                                                      }}
                                                    />
                                                    <Label
                                                      htmlFor={`filter-practitioner-department-${department}`}
                                                      className="text-sm font-normal cursor-pointer"
                                                    >
                                                      {department}
                                                    </Label>
                                                  </div>
                                                ));
                                              })()}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по периоду прохождения практики */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Период прохождения практики</Label>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="date"
                                                placeholder="От"
                                                value={practitionersFilters.practiceStartDate}
                                                onChange={(e) => setPractitionersFilters({ ...practitionersFilters, practiceStartDate: e.target.value })}
                                                className="w-full"
                                              />
                                              <span className="text-sm text-muted-foreground">—</span>
                                              <Input
                                                type="date"
                                                placeholder="До"
                                                value={practitionersFilters.practiceEndDate}
                                                onChange={(e) => setPractitionersFilters({ ...practitionersFilters, practiceEndDate: e.target.value })}
                                                className="w-full"
                                              />
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по сотруднику, добавившему запись */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Сотрудник добавивший запись</Label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                              {(() => {
                                                const uniqueAddedBy = Array.from(new Set(university.practitionerList?.map(i => i.addedBy) || []));
                                                return uniqueAddedBy.map((addedBy) => (
                                                  <div key={addedBy} className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`filter-practitioner-addedBy-${addedBy}`}
                                                      checked={practitionersFilters.addedBy.includes(addedBy)}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setPractitionersFilters({
                                                            ...practitionersFilters,
                                                            addedBy: [...practitionersFilters.addedBy, addedBy],
                                                          });
                                                        } else {
                                                          setPractitionersFilters({
                                                            ...practitionersFilters,
                                                            addedBy: practitionersFilters.addedBy.filter((a) => a !== addedBy),
                                                          });
                                                        }
                                                      }}
                                                    />
                                                    <Label
                                                      htmlFor={`filter-practitioner-addedBy-${addedBy}`}
                                                      className="text-sm font-normal cursor-pointer"
                                                    >
                                                      {addedBy}
                                                    </Label>
                                                  </div>
                                                ));
                                              })()}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по статусу практики */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Статус практики</Label>
                                            <div className="space-y-1.5">
                                              {[
                                                { value: "meets", label: "Соответствует" },
                                                { value: "exceeds", label: "Превосходит" },
                                                { value: "not_meets", label: "Не соответствует" },
                                              ].map((status) => (
                                                <div key={status.value} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`filter-practitioner-status-${status.value}`}
                                                    checked={practitionersFilters.practiceStatus.includes(status.value as "not_meets" | "meets" | "exceeds")}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        setPractitionersFilters({
                                                          ...practitionersFilters,
                                                          practiceStatus: [...practitionersFilters.practiceStatus, status.value as "not_meets" | "meets" | "exceeds"],
                                                        });
                                                      } else {
                                                        setPractitionersFilters({
                                                          ...practitionersFilters,
                                                          practiceStatus: practitionersFilters.practiceStatus.filter((s) => s !== status.value),
                                                        });
                                                      }
                                                    }}
                                                  />
                                                  <Label
                                                    htmlFor={`filter-practitioner-status-${status.value}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                  >
                                                    {status.label}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по комментарию */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Комментарий</Label>
                                            <Input
                                              placeholder="Поиск по комментарию..."
                                              value={practitionersFilters.comment}
                                              onChange={(e) => setPractitionersFilters({ ...practitionersFilters, comment: e.target.value })}
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="pt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setPractitionersFilters({
                                                employeeName: "",
                                                departments: [],
                                                practiceStartDate: "",
                                                practiceEndDate: "",
                                                addedBy: [],
                                                practiceStatus: [],
                                                comment: "",
                                              });
                                              setPractitionersCurrentPage(1);
                                            }}
                                          >
                                            Сбросить
                                          </Button>
                                          <Button size="sm" onClick={() => {
                                            setPractitionersFilterDialogOpen(false);
                                            setPractitionersCurrentPage(1);
                                          }}>
                                            Применить
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                        <Dialog open={addPractitionerDialogOpen} onOpenChange={setAddPractitionerDialogOpen}>
                                          <DialogTrigger asChild>
                                            <Button variant="default" size="sm">
                                              <Plus className="mr-2 h-4 w-4" />
                                              Добавить практиканта
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>Добавить практиканта</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="practitioner-name">ФИО *</Label>
                                                <Input
                                                  id="practitioner-name"
                                                  placeholder="Иванов Иван Иванович"
                                                  value={newPractitioner.employeeName}
                                                  onChange={(e) => setNewPractitioner({ ...newPractitioner, employeeName: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="practitioner-department">Подразделение *</Label>
                                                <Input
                                                  id="practitioner-department"
                                                  placeholder="Департамент развития"
                                                  value={newPractitioner.department}
                                                  onChange={(e) => setNewPractitioner({ ...newPractitioner, department: e.target.value })}
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <Label htmlFor="practitioner-start-date">Дата начала практики *</Label>
                                                  <Input
                                                    id="practitioner-start-date"
                                                    type="date"
                                                    value={newPractitioner.practiceStartDate}
                                                    onChange={(e) => setNewPractitioner({ ...newPractitioner, practiceStartDate: e.target.value })}
                                                  />
                                                </div>
                                                <div className="space-y-2">
                                                  <Label htmlFor="practitioner-end-date">Дата окончания практики *</Label>
                                                  <Input
                                                    id="practitioner-end-date"
                                                    type="date"
                                                    value={newPractitioner.practiceEndDate}
                                                    onChange={(e) => setNewPractitioner({ ...newPractitioner, practiceEndDate: e.target.value })}
                                                  />
                                                </div>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="practitioner-supervisor">Руководитель практики</Label>
                                                <Input
                                                  id="practitioner-supervisor"
                                                  placeholder="ФИО руководителя (необязательно)"
                                                  value={newPractitioner.practiceSupervisor}
                                                  onChange={(e) => setNewPractitioner({ ...newPractitioner, practiceSupervisor: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="practitioner-status">Статус</Label>
                                                <Select
                                                  value={newPractitioner.practiceStatus}
                                                  onValueChange={(value) => setNewPractitioner({ ...newPractitioner, practiceStatus: value as "not_meets" | "meets" | "exceeds" })}
                                                >
                                                  <SelectTrigger id="practitioner-status">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="not_meets">Не соответствует ожиданиям</SelectItem>
                                                    <SelectItem value="meets">Соответствует ожиданиям</SelectItem>
                                                    <SelectItem value="exceeds">Превосходит ожидания</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => setAddPractitionerDialogOpen(false)}>
                                                Отмена
                                              </Button>
                                              <Button 
                                                onClick={() => handleAddPractitioner(university.id)}
                                                disabled={!newPractitioner.employeeName.trim() || !newPractitioner.department.trim() || !newPractitioner.practiceStartDate || !newPractitioner.practiceEndDate}
                                              >
                                                Добавить
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  
                                  {/* Активные фильтры */}
                                  {(() => {
                                    const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                                    
                                    // Фильтр по имени практиканта
                                    if (practitionersFilters.employeeName) {
                                      activeFilters.push({
                                        label: `Практикант: ${practitionersFilters.employeeName}`,
                                        onRemove: () => setPractitionersFilters({ ...practitionersFilters, employeeName: "" }),
                                      });
                                    }
                                    
                                    // Фильтр по подразделениям
                                    practitionersFilters.departments.forEach((department) => {
                                      activeFilters.push({
                                        label: `Подразделение: ${department}`,
                                        onRemove: () => setPractitionersFilters({
                                          ...practitionersFilters,
                                          departments: practitionersFilters.departments.filter((d) => d !== department),
                                        }),
                                      });
                                    });
                                    
                                    // Фильтр по периоду прохождения практики
                                    if (practitionersFilters.practiceStartDate || practitionersFilters.practiceEndDate) {
                                      const formatDate = (dateString: string) => {
                                        if (!dateString) return "";
                                        const [year, month, day] = dateString.split('-').map(Number);
                                        return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                      };
                                      const dateLabel = practitionersFilters.practiceStartDate && practitionersFilters.practiceEndDate
                                        ? `Период практики: ${formatDate(practitionersFilters.practiceStartDate)} - ${formatDate(practitionersFilters.practiceEndDate)}`
                                        : practitionersFilters.practiceStartDate
                                        ? `Период практики: с ${formatDate(practitionersFilters.practiceStartDate)}`
                                        : `Период практики: до ${formatDate(practitionersFilters.practiceEndDate)}`;
                                      activeFilters.push({
                                        label: dateLabel,
                                        onRemove: () => setPractitionersFilters({ ...practitionersFilters, practiceStartDate: "", practiceEndDate: "" }),
                                      });
                                    }
                                    
                                    // Фильтр по сотрудникам, добавившим запись
                                    practitionersFilters.addedBy.forEach((addedBy) => {
                                      activeFilters.push({
                                        label: `Добавил: ${addedBy}`,
                                        onRemove: () => setPractitionersFilters({
                                          ...practitionersFilters,
                                          addedBy: practitionersFilters.addedBy.filter((a) => a !== addedBy),
                                        }),
                                      });
                                    });
                                    
                                    // Фильтр по статусу практики
                                    practitionersFilters.practiceStatus.forEach((status) => {
                                      const statusLabels: Record<string, string> = {
                                        not_meets: "Не соответствует",
                                        meets: "Соответствует",
                                        exceeds: "Превосходит",
                                      };
                                      activeFilters.push({
                                        label: `Статус практики: ${statusLabels[status]}`,
                                        onRemove: () => setPractitionersFilters({
                                          ...practitionersFilters,
                                          practiceStatus: practitionersFilters.practiceStatus.filter((s) => s !== status),
                                        }),
                                      });
                                    });
                                    
                                    // Фильтр по комментарию
                                    if (practitionersFilters.comment) {
                                      activeFilters.push({
                                        label: `Комментарий: ${practitionersFilters.comment}`,
                                        onRemove: () => setPractitionersFilters({ ...practitionersFilters, comment: "" }),
                                      });
                                    }
                                    
                                    if (activeFilters.length === 0) return null;
                                    
                                    return (
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                  
                                  <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[240px]">ФИО</TableHead>
                                        <TableHead className="w-[200px]">Период прохождения практики</TableHead>
                                        <TableHead className="w-[250px]">Подразделение</TableHead>
                                        <TableHead className="w-[220px]">Руководитель практики</TableHead>
                                        <TableHead className="w-[150px] text-center">Статус</TableHead>
                                        <TableHead className="w-[80px] text-center">Действия</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(() => {
                                        // Логика пагинации
                                        const totalPages = Math.ceil(filteredPractitioners.length / practitionersItemsPerPage);
                                        const startIndex = (practitionersCurrentPage - 1) * practitionersItemsPerPage;
                                        const endIndex = startIndex + practitionersItemsPerPage;
                                        const paginatedPractitioners = filteredPractitioners.slice(startIndex, endIndex);
                                        
                                        return paginatedPractitioners.map((practitioner) => {
                                          const getInitials = (name: string) => {
                                            return name.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase();
                                          };
                                          const formatDate = (dateString: string) => {
                                            const [year, month, day] = dateString.split('-').map(Number);
                                            return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                          };
                                          return (
                                          <TableRow key={practitioner.id}>
                                              <TableCell className="px-4 whitespace-normal">
                                                <span className="font-medium">{practitioner.employeeName}</span>
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {formatDate(practitioner.practiceStartDate)}-{formatDate(practitioner.practiceEndDate)}
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {practitioner.department}
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {practitioner.practiceSupervisor ? (
                                                  <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                        {getInitials(practitioner.practiceSupervisor)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                      <span className="font-medium">{practitioner.practiceSupervisor}</span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <span className="text-muted-foreground">—</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                  {(() => {
                                                    const status = practitioner.practiceStatus || "meets";
                                                    switch (status) {
                                                      case "not_meets":
                                                        return (
                                                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                            Не соответствует
                                                          </Badge>
                                                        );
                                                      case "exceeds":
                                                        return (
                                                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            Превосходит
                                                          </Badge>
                                                        );
                                                      default:
                                                        return (
                                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Соответствует
                                                          </Badge>
                                                        );
                                                    }
                                                  })()}
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleOpenCommentDialog(university.id, practitioner.id, practitioner.comment)}
                                                  >
                                                    <MessageSquare className={`h-4 w-4 ${practitioner.comment ? 'text-primary' : 'text-muted-foreground'}`} />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => handleStartEditPractitioner(university.id, practitioner)}
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        });
                                      })()}
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                    {/* Пагинация для практикантов */}
                                    {(() => {
                                      const totalPages = Math.ceil(filteredPractitioners.length / practitionersItemsPerPage);
                                  
                                  return (
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-2">
                                            <Label htmlFor="practitioners-items-per-page" className="text-sm text-muted-foreground">
                                          Показать:
                                        </Label>
                                        <Select
                                              value={practitionersItemsPerPage.toString()}
                                          onValueChange={(value) => {
                                                setPractitionersItemsPerPage(Number(value));
                                                setPractitionersCurrentPage(1);
                                          }}
                                        >
                                              <SelectTrigger id="practitioners-items-per-page" className="w-[80px]">
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
                                              из {filteredPractitioners.length}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          Страница {practitionersCurrentPage} из {totalPages}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setPractitionersCurrentPage(1)}
                                            disabled={practitionersCurrentPage === 1}
                                          >
                                            <ChevronsLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setPractitionersCurrentPage(practitionersCurrentPage - 1)}
                                            disabled={practitionersCurrentPage === 1}
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setPractitionersCurrentPage(practitionersCurrentPage + 1)}
                                            disabled={practitionersCurrentPage === totalPages}
                                          >
                                            <ChevronRight className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setPractitionersCurrentPage(totalPages)}
                                            disabled={practitionersCurrentPage === totalPages}
                                          >
                                            <ChevronsRight className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                                </>
                              ) : (
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[240px]">ФИО</TableHead>
                                        <TableHead className="w-[200px]">Период прохождения практики</TableHead>
                                        <TableHead className="w-[250px]">Подразделение</TableHead>
                                        <TableHead className="w-[220px]">Руководитель практики</TableHead>
                                        <TableHead className="w-[150px] text-center">Статус</TableHead>
                                        <TableHead className="w-[80px] text-center">Действия</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                          Практиканты не добавлены
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              );
                              })()}

                              {/* Таблица: Участники кейс-чемпионатов */}
                              {practitionersSubTab === "caseChampionships" && (() => {
                                // Вычисляем отфильтрованные данные один раз
                                const filteredParticipants = (university.caseChampionshipParticipants || []).filter((participant) => {
                                  // Фильтр по имени участника
                                  if (participantsFilters.employeeName) {
                                    const searchName = participantsFilters.employeeName.toLowerCase();
                                    if (!participant.employeeName.toLowerCase().includes(searchName)) {
                                      return false;
                                    }
                                  }
                                  
                                  // Фильтр по кейс-чемпионату
                                  if (participantsFilters.eventIds.length > 0 && !participantsFilters.eventIds.includes(participant.eventId)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по статусу
                                  if (participantsFilters.statuses.length > 0 && !participantsFilters.statuses.includes(participant.status)) {
                                    return false;
                                  }
                                  
                                  // Фильтр по комментарию
                                  if (participantsFilters.comments) {
                                    const searchComment = participantsFilters.comments.toLowerCase();
                                    if (!participant.comments || !participant.comments.toLowerCase().includes(searchComment)) {
                                      return false;
                                    }
                                  }
                                  
                                  return true;
                                });
                                
                                return university.caseChampionshipParticipants && university.caseChampionshipParticipants.length > 0 ? (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm text-muted-foreground">
                                        Найдено: <span className="font-semibold text-foreground">{filteredParticipants.length}</span> {filteredParticipants.length === 1 ? 'участник' : filteredParticipants.length > 1 && filteredParticipants.length < 5 ? 'участника' : 'участников'}
                                        {filteredParticipants.length !== university.caseChampionshipParticipants.length && (
                                          <span className="text-xs ml-1">из {university.caseChampionshipParticipants.length}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="outline">
                                          <FileText className="mr-2 h-4 w-4" />
                                          Импорт Excel
                                        </Button>
                                        <Dialog open={participantsFilterDialogOpen} onOpenChange={setParticipantsFilterDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">
                                          <Filter className="mr-2 h-4 w-4" />
                                          Фильтры
                                          {(() => {
                                            const activeFiltersCount = 
                                              (participantsFilters.employeeName ? 1 : 0) +
                                              participantsFilters.eventIds.length +
                                              participantsFilters.statuses.length +
                                              (participantsFilters.comments ? 1 : 0);
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
                                          <DialogTitle className="text-lg">Фильтры участников кейс-чемпионатов</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                          {/* Фильтр по имени участника */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Участник</Label>
                                            <Input
                                              placeholder="Поиск по ФИО..."
                                              value={participantsFilters.employeeName}
                                              onChange={(e) => setParticipantsFilters({ ...participantsFilters, employeeName: e.target.value })}
                                            />
                                          </div>
                                          
                                          {/* Фильтр по кейс-чемпионату */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Кейс-чемпионат</Label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                              {(() => {
                                                const formatDate = (dateStr: string) => {
                                                  const [year, month, day] = dateStr.split('-').map(Number);
                                                  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                                };
                                                const caseChampionshipEvents = university.events?.filter(e => e.type === "caseChampionships") || [];
                                                return caseChampionshipEvents.map((event) => (
                                                  <div key={event.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`filter-participant-event-${event.id}`}
                                                      checked={participantsFilters.eventIds.includes(event.id)}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setParticipantsFilters({
                                                            ...participantsFilters,
                                                            eventIds: [...participantsFilters.eventIds, event.id],
                                                          });
                                                        } else {
                                                          setParticipantsFilters({
                                                            ...participantsFilters,
                                                            eventIds: participantsFilters.eventIds.filter((id) => id !== event.id),
                                                          });
                                                        }
                                                      }}
                                                    />
                                                    <Label
                                                      htmlFor={`filter-participant-event-${event.id}`}
                                                      className="text-sm font-normal cursor-pointer"
                                                    >
                                                      {event.comments || "Кейс-чемпионат"} ({formatDate(event.date)})
                                                    </Label>
                                                  </div>
                                                ));
                                              })()}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по статусу */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Статус</Label>
                                            <div className="space-y-1.5">
                                              {[
                                                { value: "registered", label: "Зарегистрирован" },
                                                { value: "participated", label: "Участвовал" },
                                                { value: "prize_winner", label: "Призёр" },
                                                { value: "winner", label: "Победитель" },
                                              ].map((status) => (
                                                <div key={status.value} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`filter-participant-status-${status.value}`}
                                                    checked={participantsFilters.statuses.includes(status.value as "registered" | "participated" | "winner" | "prize_winner")}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        setParticipantsFilters({
                                                          ...participantsFilters,
                                                          statuses: [...participantsFilters.statuses, status.value as "registered" | "participated" | "winner" | "prize_winner"],
                                                        });
                                                      } else {
                                                        setParticipantsFilters({
                                                          ...participantsFilters,
                                                          statuses: participantsFilters.statuses.filter((s) => s !== status.value),
                                                        });
                                                      }
                                                    }}
                                                  />
                                                  <Label
                                                    htmlFor={`filter-participant-status-${status.value}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                  >
                                                    {status.label}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по комментарию */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Комментарий</Label>
                                            <Input
                                              placeholder="Поиск по комментарию..."
                                              value={participantsFilters.comments}
                                              onChange={(e) => setParticipantsFilters({ ...participantsFilters, comments: e.target.value })}
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="pt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setParticipantsFilters({
                                                employeeName: "",
                                                eventIds: [],
                                                statuses: [],
                                                comments: "",
                                              });
                                              setParticipantsCurrentPage(1);
                                            }}
                                          >
                                            Сбросить
                                          </Button>
                                          <Button size="sm" onClick={() => {
                                            setParticipantsFilterDialogOpen(false);
                                            setParticipantsCurrentPage(1);
                                          }}>
                                            Применить
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                        <Dialog open={addParticipantDialogOpen} onOpenChange={setAddParticipantDialogOpen}>
                                          <DialogTrigger asChild>
                                            <Button variant="default" size="sm">
                                              <Plus className="mr-2 h-4 w-4" />
                                              Добавить участника
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>Добавить участника кейс-чемпионата</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="participant-name">ФИО *</Label>
                                                <Input
                                                  id="participant-name"
                                                  placeholder="Иванов Иван Иванович"
                                                  value={newParticipant.employeeName}
                                                  onChange={(e) => setNewParticipant({ ...newParticipant, employeeName: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="participant-event">Кейс-чемпионат *</Label>
                                                <Select
                                                  value={newParticipant.eventId}
                                                  onValueChange={(value) => setNewParticipant({ ...newParticipant, eventId: value })}
                                                >
                                                  <SelectTrigger id="participant-event">
                                                    <SelectValue placeholder="Выберите кейс-чемпионат" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {university.events?.filter(e => e.type === "caseChampionships").map((event) => {
                                                      const formatDate = (dateStr: string) => {
                                                        const [year, month, day] = dateStr.split('-').map(Number);
                                                        return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                                      };
                                                      return (
                                                        <SelectItem key={event.id} value={event.id}>
                                                          {event.comments || "Кейс-чемпионат"} ({formatDate(event.date)})
                                                        </SelectItem>
                                                      );
                                                    })}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="participant-status">Статус *</Label>
                                                <Select
                                                  value={newParticipant.status}
                                                  onValueChange={(value) => setNewParticipant({ ...newParticipant, status: value as "registered" | "participated" | "winner" | "prize_winner" })}
                                                >
                                                  <SelectTrigger id="participant-status">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="registered">Зарегистрирован</SelectItem>
                                                    <SelectItem value="participated">Участвовал</SelectItem>
                                                    <SelectItem value="prize_winner">Призёр</SelectItem>
                                                    <SelectItem value="winner">Победитель</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="participant-comments">Комментарии</Label>
                                                <Textarea
                                                  id="participant-comments"
                                                  placeholder="Комментарии к участию..."
                                                  value={newParticipant.comments}
                                                  onChange={(e) => setNewParticipant({ ...newParticipant, comments: e.target.value })}
                                                  rows={3}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => setAddParticipantDialogOpen(false)}>
                                                Отмена
                                              </Button>
                                              <Button 
                                                onClick={() => handleAddCaseChampionshipParticipant(university.id)}
                                                disabled={!newParticipant.employeeName.trim() || !newParticipant.eventId}
                                              >
                                                Добавить
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                    
                                    {/* Активные фильтры */}
                                    {(() => {
                                      const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                                      
                                      // Фильтр по имени участника
                                      if (participantsFilters.employeeName) {
                                        activeFilters.push({
                                          label: `Участник: ${participantsFilters.employeeName}`,
                                          onRemove: () => setParticipantsFilters({ ...participantsFilters, employeeName: "" }),
                                        });
                                      }
                                      
                                      // Фильтр по кейс-чемпионатам
                                      participantsFilters.eventIds.forEach((eventId) => {
                                        const event = university.events?.find(e => e.id === eventId);
                                        const formatDate = (dateStr: string) => {
                                          if (!dateStr) return "";
                                          const [year, month, day] = dateStr.split('-').map(Number);
                                          return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                        };
                                        if (event) {
                                          activeFilters.push({
                                            label: `Кейс-чемпионат: ${event.comments || "Кейс-чемпионат"} (${formatDate(event.date)})`,
                                            onRemove: () => setParticipantsFilters({
                                              ...participantsFilters,
                                              eventIds: participantsFilters.eventIds.filter((id) => id !== eventId),
                                            }),
                                          });
                                        }
                                      });
                                      
                                      // Фильтр по статусу
                                      participantsFilters.statuses.forEach((status) => {
                                        const statusLabels: Record<string, string> = {
                                          registered: "Зарегистрирован",
                                          participated: "Участвовал",
                                          prize_winner: "Призёр",
                                          winner: "Победитель",
                                        };
                                        activeFilters.push({
                                          label: `Статус: ${statusLabels[status]}`,
                                          onRemove: () => setParticipantsFilters({
                                            ...participantsFilters,
                                            statuses: participantsFilters.statuses.filter((s) => s !== status),
                                          }),
                                        });
                                      });
                                      
                                      // Фильтр по комментарию
                                      if (participantsFilters.comments) {
                                        activeFilters.push({
                                          label: `Комментарий: ${participantsFilters.comments}`,
                                          onRemove: () => setParticipantsFilters({ ...participantsFilters, comments: "" }),
                                        });
                                      }
                                      
                                      if (activeFilters.length === 0) return null;
                                      
                                      return (
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                    
                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[300px]">ФИО</TableHead>
                                          <TableHead className="w-[350px]">Кейс-чемпионат</TableHead>
                                          <TableHead className="w-[150px] text-center">Статус</TableHead>
                                          <TableHead className="w-[80px] text-center">Действия</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(() => {
                                          const totalPages = Math.ceil(filteredParticipants.length / participantsItemsPerPage);
                                          const startIndex = (participantsCurrentPage - 1) * participantsItemsPerPage;
                                          const endIndex = startIndex + participantsItemsPerPage;
                                          const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex);
                                          
                                          return paginatedParticipants.length > 0 ? (
                                            paginatedParticipants.map((participant) => {
                                          const event = university.events?.find(e => e.id === participant.eventId);
                                          const formatDate = (dateStr: string) => {
                                            const [year, month, day] = dateStr.split('-').map(Number);
                                            return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                          };
                                          const getStatusBadge = (status: string) => {
                                            switch (status) {
                                              case "winner":
                                                return <Badge className="bg-yellow-500 text-white">Победитель</Badge>;
                                              case "prize_winner":
                                                return <Badge className="bg-amber-500 text-white">Призёр</Badge>;
                                              case "participated":
                                                return <Badge variant="secondary">Участвовал</Badge>;
                                              case "registered":
                                                return <Badge variant="outline">Зарегистрирован</Badge>;
                                              default:
                                                return <Badge variant="outline">{status}</Badge>;
                                            }
                                          };
                                          return (
                                            <TableRow key={participant.id}>
                                              <TableCell className="font-medium">{participant.employeeName}</TableCell>
                                              <TableCell>
                                                {event ? (
                                                  <div className="flex flex-col">
                                                    <span>{event.comments || "Кейс-чемпионат"}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                      {formatDate(event.date)} - {formatDate(event.endDate)}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-muted-foreground">Мероприятие не найдено</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                  {getStatusBadge(participant.status)}
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleOpenParticipantCommentDialog(university.id, participant.id, participant.comments)}
                                                  >
                                                    <MessageSquare className={`h-4 w-4 ${participant.comments ? 'text-primary' : 'text-muted-foreground'}`} />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => handleStartEditParticipant(university.id, participant)}
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          );
                                            })
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                Участники не найдены
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })()}
                                      </TableBody>
                                    </Table>
                                    </div>
                                    
                                    {/* Пагинация */}
                                    {(() => {
                                      const totalPages = Math.ceil(filteredParticipants.length / participantsItemsPerPage);
                                      
                                      return totalPages > 1 ? (
                                        <div className="flex items-center justify-between mt-3">
                                          <div className="text-sm text-muted-foreground">
                                            Страница {participantsCurrentPage} из {totalPages}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setParticipantsCurrentPage(1)}
                                              disabled={participantsCurrentPage === 1}
                                            >
                                              <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setParticipantsCurrentPage(participantsCurrentPage - 1)}
                                              disabled={participantsCurrentPage === 1}
                                            >
                                              <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setParticipantsCurrentPage(participantsCurrentPage + 1)}
                                              disabled={participantsCurrentPage === totalPages}
                                            >
                                              <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setParticipantsCurrentPage(totalPages)}
                                              disabled={participantsCurrentPage === totalPages}
                                            >
                                              <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}
                                  </>
                                ) : (
                                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                                    Участники кейс-чемпионатов не добавлены
                                  </div>
                                );
                              })()}

                              {/* Таблица: Целевые практиканты */}
                              {practitionersSubTab === "targetPractitioners" && (() => {
                                // Вычисляем отфильтрованные данные один раз
                                const filteredTargetPractitioners = (university.targetPractitioners || []).filter((targetPractitioner) => {
                                  // Фильтр по имени
                                  if (targetPractitionersFilters.employeeName) {
                                    const searchName = targetPractitionersFilters.employeeName.toLowerCase();
                                    if (!targetPractitioner.employeeName.toLowerCase().includes(searchName)) {
                                      return false;
                                    }
                                  }
                                  
                                  // Фильтр по подразделению
                                  if (targetPractitionersFilters.departments.length > 0 && (!targetPractitioner.department || !targetPractitionersFilters.departments.includes(targetPractitioner.department))) {
                                    return false;
                                  }
                                  
                                  // Фильтр по периоду
                                  if (targetPractitionersFilters.targetStartDate && targetPractitioner.targetStartDate < targetPractitionersFilters.targetStartDate) {
                                    return false;
                                  }
                                  if (targetPractitionersFilters.targetEndDate && targetPractitioner.targetEndDate > targetPractitionersFilters.targetEndDate) {
                                    return false;
                                  }
                                  
                                  // Фильтр по комментарию
                                  if (targetPractitionersFilters.comments) {
                                    const searchComment = targetPractitionersFilters.comments.toLowerCase();
                                    if (!targetPractitioner.comments || !targetPractitioner.comments.toLowerCase().includes(searchComment)) {
                                      return false;
                                    }
                                  }
                                  
                                  return true;
                                });
                                
                                return university.targetPractitioners && university.targetPractitioners.length > 0 ? (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm text-muted-foreground">
                                        Найдено: <span className="font-semibold text-foreground">{filteredTargetPractitioners.length}</span> {filteredTargetPractitioners.length === 1 ? 'практикант' : filteredTargetPractitioners.length > 1 && filteredTargetPractitioners.length < 5 ? 'практиканта' : 'практикантов'}
                                        {filteredTargetPractitioners.length !== university.targetPractitioners.length && (
                                          <span className="text-xs ml-1">из {university.targetPractitioners.length}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="outline">
                                          <FileText className="mr-2 h-4 w-4" />
                                          Импорт Excel
                                        </Button>
                                        <Dialog open={targetPractitionersFilterDialogOpen} onOpenChange={setTargetPractitionersFilterDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline">
                                          <Filter className="mr-2 h-4 w-4" />
                                          Фильтры
                                          {(() => {
                                            const activeFiltersCount = 
                                              (targetPractitionersFilters.employeeName ? 1 : 0) +
                                              targetPractitionersFilters.departments.length +
                                              (targetPractitionersFilters.targetStartDate || targetPractitionersFilters.targetEndDate ? 1 : 0) +
                                              (targetPractitionersFilters.comments ? 1 : 0);
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
                                          <DialogTitle className="text-lg">Фильтры целевых практикантов</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                          {/* Фильтр по имени */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Практикант</Label>
                                            <Input
                                              placeholder="Поиск по ФИО..."
                                              value={targetPractitionersFilters.employeeName}
                                              onChange={(e) => setTargetPractitionersFilters({ ...targetPractitionersFilters, employeeName: e.target.value })}
                                            />
                                          </div>
                                          
                                          {/* Фильтр по подразделению */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Подразделение</Label>
                                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                              {(() => {
                                                const uniqueDepartments = Array.from(new Set(university.targetPractitioners?.map(tp => tp.department).filter(Boolean) || []));
                                                return uniqueDepartments.map((department) => (
                                                  <div key={department} className="flex items-center space-x-2">
                                                    <Checkbox
                                                      id={`filter-target-practitioner-department-${department}`}
                                                      checked={targetPractitionersFilters.departments.includes(department)}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          setTargetPractitionersFilters({
                                                            ...targetPractitionersFilters,
                                                            departments: [...targetPractitionersFilters.departments, department],
                                                          });
                                                        } else {
                                                          setTargetPractitionersFilters({
                                                            ...targetPractitionersFilters,
                                                            departments: targetPractitionersFilters.departments.filter((d) => d !== department),
                                                          });
                                                        }
                                                      }}
                                                    />
                                                    <Label
                                                      htmlFor={`filter-target-practitioner-department-${department}`}
                                                      className="text-sm font-normal cursor-pointer"
                                                    >
                                                      {department}
                                                    </Label>
                                                  </div>
                                                ));
                                              })()}
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по периоду */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Период прохождения практики</Label>
                                            <div className="flex items-center gap-2">
                                              <Input
                                                type="date"
                                                placeholder="От"
                                                value={targetPractitionersFilters.targetStartDate}
                                                onChange={(e) => setTargetPractitionersFilters({ ...targetPractitionersFilters, targetStartDate: e.target.value })}
                                                className="w-full"
                                              />
                                              <span className="text-sm text-muted-foreground">—</span>
                                              <Input
                                                type="date"
                                                placeholder="До"
                                                value={targetPractitionersFilters.targetEndDate}
                                                onChange={(e) => setTargetPractitionersFilters({ ...targetPractitionersFilters, targetEndDate: e.target.value })}
                                                className="w-full"
                                              />
                                            </div>
                                          </div>
                                          
                                          {/* Фильтр по комментарию */}
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Комментарий</Label>
                                            <Input
                                              placeholder="Поиск по комментарию..."
                                              value={targetPractitionersFilters.comments}
                                              onChange={(e) => setTargetPractitionersFilters({ ...targetPractitionersFilters, comments: e.target.value })}
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="pt-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setTargetPractitionersFilters({
                                                employeeName: "",
                                                departments: [],
                                                targetStartDate: "",
                                                targetEndDate: "",
                                                comments: "",
                                              });
                                              setTargetPractitionersCurrentPage(1);
                                            }}
                                          >
                                            Сбросить
                                          </Button>
                                          <Button size="sm" onClick={() => {
                                            setTargetPractitionersFilterDialogOpen(false);
                                            setTargetPractitionersCurrentPage(1);
                                          }}>
                                            Применить
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                        <Dialog open={addTargetPractitionerDialogOpen} onOpenChange={setAddTargetPractitionerDialogOpen}>
                                          <DialogTrigger asChild>
                                            <Button variant="default" size="sm">
                                              <Plus className="mr-2 h-4 w-4" />
                                              Добавить практиканта
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>Добавить практиканта</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="target-practitioner-name">ФИО *</Label>
                                                <Input
                                                  id="target-practitioner-name"
                                                  placeholder="Иванов Иван Иванович"
                                                  value={newTargetPractitioner.employeeName}
                                                  onChange={(e) => setNewTargetPractitioner({ ...newTargetPractitioner, employeeName: e.target.value })}
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <Label htmlFor="target-practitioner-start-date">Дата начала *</Label>
                                                  <Input
                                                    id="target-practitioner-start-date"
                                                    type="date"
                                                    value={newTargetPractitioner.targetStartDate}
                                                    onChange={(e) => setNewTargetPractitioner({ ...newTargetPractitioner, targetStartDate: e.target.value })}
                                                  />
                                                </div>
                                                <div className="space-y-2">
                                                  <Label htmlFor="target-practitioner-end-date">Дата окончания *</Label>
                                                  <Input
                                                    id="target-practitioner-end-date"
                                                    type="date"
                                                    value={newTargetPractitioner.targetEndDate}
                                                    onChange={(e) => setNewTargetPractitioner({ ...newTargetPractitioner, targetEndDate: e.target.value })}
                                                  />
                                                </div>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="target-practitioner-department">Подразделение</Label>
                                                <Input
                                                  id="target-practitioner-department"
                                                  placeholder="Департамент развития"
                                                  value={newTargetPractitioner.department}
                                                  onChange={(e) => setNewTargetPractitioner({ ...newTargetPractitioner, department: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="target-practitioner-supervisor">Руководитель практики</Label>
                                                <Input
                                                  id="target-practitioner-supervisor"
                                                  placeholder="ФИО руководителя (необязательно)"
                                                  value={newTargetPractitioner.practiceSupervisor}
                                                  onChange={(e) => setNewTargetPractitioner({ ...newTargetPractitioner, practiceSupervisor: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="target-practitioner-comments">Комментарии</Label>
                                                <Textarea
                                                  id="target-practitioner-comments"
                                                  placeholder="Комментарии к целевой практике..."
                                                  value={newTargetPractitioner.comments}
                                                  onChange={(e) => setNewTargetPractitioner({ ...newTargetPractitioner, comments: e.target.value })}
                                                  rows={3}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => setAddTargetPractitionerDialogOpen(false)}>
                                                Отмена
                                              </Button>
                                              <Button 
                                                onClick={() => handleAddTargetPractitioner(university.id)}
                                                disabled={!newTargetPractitioner.employeeName.trim() || !newTargetPractitioner.targetStartDate || !newTargetPractitioner.targetEndDate}
                                              >
                                                Добавить
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                    
                                    {/* Активные фильтры */}
                                    {(() => {
                                      const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                                      
                                      // Фильтр по имени
                                      if (targetPractitionersFilters.employeeName) {
                                        activeFilters.push({
                                          label: `Практикант: ${targetPractitionersFilters.employeeName}`,
                                          onRemove: () => setTargetPractitionersFilters({ ...targetPractitionersFilters, employeeName: "" }),
                                        });
                                      }
                                      
                                      // Фильтр по подразделениям
                                      targetPractitionersFilters.departments.forEach((department) => {
                                        activeFilters.push({
                                          label: `Подразделение: ${department}`,
                                          onRemove: () => setTargetPractitionersFilters({
                                            ...targetPractitionersFilters,
                                            departments: targetPractitionersFilters.departments.filter((d) => d !== department),
                                          }),
                                        });
                                      });
                                      
                                      // Фильтр по периоду
                                      if (targetPractitionersFilters.targetStartDate || targetPractitionersFilters.targetEndDate) {
                                        const formatDate = (dateString: string) => {
                                          if (!dateString) return "";
                                          const [year, month, day] = dateString.split('-').map(Number);
                                          return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                        };
                                        const dateLabel = targetPractitionersFilters.targetStartDate && targetPractitionersFilters.targetEndDate
                                          ? `Период: ${formatDate(targetPractitionersFilters.targetStartDate)} - ${formatDate(targetPractitionersFilters.targetEndDate)}`
                                          : targetPractitionersFilters.targetStartDate
                                          ? `Период: с ${formatDate(targetPractitionersFilters.targetStartDate)}`
                                          : `Период: до ${formatDate(targetPractitionersFilters.targetEndDate)}`;
                                        activeFilters.push({
                                          label: dateLabel,
                                          onRemove: () => setTargetPractitionersFilters({ ...targetPractitionersFilters, targetStartDate: "", targetEndDate: "" }),
                                        });
                                      }
                                      
                                      // Фильтр по комментарию
                                      if (targetPractitionersFilters.comments) {
                                        activeFilters.push({
                                          label: `Комментарий: ${targetPractitionersFilters.comments}`,
                                          onRemove: () => setTargetPractitionersFilters({ ...targetPractitionersFilters, comments: "" }),
                                        });
                                      }
                                      
                                      if (activeFilters.length === 0) return null;
                                      
                                      return (
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                    
                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[300px]">ФИО</TableHead>
                                          <TableHead className="w-[200px]">Период прохождения практики</TableHead>
                                          <TableHead className="w-[250px]">Подразделение</TableHead>
                                          <TableHead className="w-[220px]">Руководитель практики</TableHead>
                                          <TableHead className="w-[80px] text-center">Действия</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(() => {
                                          const totalPages = Math.ceil(filteredTargetPractitioners.length / targetPractitionersItemsPerPage);
                                          const startIndex = (targetPractitionersCurrentPage - 1) * targetPractitionersItemsPerPage;
                                          const endIndex = startIndex + targetPractitionersItemsPerPage;
                                          const paginatedTargetPractitioners = filteredTargetPractitioners.slice(startIndex, endIndex);
                                          
                                          return paginatedTargetPractitioners.length > 0 ? (
                                            paginatedTargetPractitioners.map((targetPractitioner) => {
                                          const formatDate = (dateStr: string) => {
                                            const [year, month, day] = dateStr.split('-').map(Number);
                                            return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                          };
                                          const getInitials = (name: string) => {
                                            return name.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase();
                                          };
                                          return (
                                            <TableRow key={targetPractitioner.id}>
                                              <TableCell className="font-medium">{targetPractitioner.employeeName}</TableCell>
                                              <TableCell>
                                                {formatDate(targetPractitioner.targetStartDate)} - {formatDate(targetPractitioner.targetEndDate)}
                                              </TableCell>
                                              <TableCell>{targetPractitioner.department || <span className="text-muted-foreground">—</span>}</TableCell>
                                              <TableCell>
                                                {targetPractitioner.practiceSupervisor ? (
                                                  <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                        {getInitials(targetPractitioner.practiceSupervisor)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                      <span className="font-medium">{targetPractitioner.practiceSupervisor}</span>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <span className="text-muted-foreground">—</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => handleStartEditTargetPractitioner(university.id, targetPractitioner)}
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          );
                                            })
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                Целевые практиканты не найдены
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })()}
                                      </TableBody>
                                    </Table>
                                    </div>
                                    
                                    {/* Пагинация */}
                                    {(() => {
                                      const totalPages = Math.ceil(filteredTargetPractitioners.length / targetPractitionersItemsPerPage);
                                      
                                      return totalPages > 1 ? (
                                        <div className="flex items-center justify-between mt-3">
                                          <div className="text-sm text-muted-foreground">
                                            Страница {targetPractitionersCurrentPage} из {totalPages}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setTargetPractitionersCurrentPage(1)}
                                              disabled={targetPractitionersCurrentPage === 1}
                                            >
                                              <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setTargetPractitionersCurrentPage(targetPractitionersCurrentPage - 1)}
                                              disabled={targetPractitionersCurrentPage === 1}
                                            >
                                              <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setTargetPractitionersCurrentPage(targetPractitionersCurrentPage + 1)}
                                              disabled={targetPractitionersCurrentPage === totalPages}
                                            >
                                              <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => setTargetPractitionersCurrentPage(totalPages)}
                                              disabled={targetPractitionersCurrentPage === totalPages}
                                            >
                                              <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}
                                  </>
                                ) : (
                                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                                    Целевые практиканты не добавлены
                                  </div>
                                );
                              })()}
                              
                              {/* Модальное окно редактирования практиканта */}
                              <Dialog open={editPractitionerDialogOpen} onOpenChange={setEditPractitionerDialogOpen}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать практиканта</DialogTitle>
                                  </DialogHeader>
                                  {editingPractitioner && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-practitioner-name">ФИО *</Label>
                                        <Input
                                          id="edit-practitioner-name"
                                          value={editingPractitioner.employeeName}
                                          onChange={(e) => setEditingPractitioner({ ...editingPractitioner, employeeName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-practitioner-department">Подразделение *</Label>
                                        <Input
                                          id="edit-practitioner-department"
                                          value={editingPractitioner.department}
                                          onChange={(e) => setEditingPractitioner({ ...editingPractitioner, department: e.target.value })}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-practitioner-start-date">Дата начала *</Label>
                                          <Input
                                            id="edit-practitioner-start-date"
                                            type="date"
                                            value={editingPractitioner.practiceStartDate}
                                            onChange={(e) => setEditingPractitioner({ ...editingPractitioner, practiceStartDate: e.target.value })}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-practitioner-end-date">Дата окончания *</Label>
                                          <Input
                                            id="edit-practitioner-end-date"
                                            type="date"
                                            value={editingPractitioner.practiceEndDate}
                                            onChange={(e) => setEditingPractitioner({ ...editingPractitioner, practiceEndDate: e.target.value })}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-practitioner-supervisor">Руководитель практики</Label>
                                        <Input
                                          id="edit-practitioner-supervisor"
                                          value={editingPractitioner.practiceSupervisor}
                                          onChange={(e) => setEditingPractitioner({ ...editingPractitioner, practiceSupervisor: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-practitioner-status">Статус</Label>
                                        <Select
                                          value={editingPractitioner.practiceStatus}
                                          onValueChange={(value) => setEditingPractitioner({ ...editingPractitioner, practiceStatus: value as "not_meets" | "meets" | "exceeds" })}
                                        >
                                          <SelectTrigger id="edit-practitioner-status">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="not_meets">Не соответствует ожиданиям</SelectItem>
                                            <SelectItem value="meets">Соответствует ожиданиям</SelectItem>
                                            <SelectItem value="exceeds">Превосходит ожидания</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter className="flex justify-between">
                                    <Button
                                      variant="destructive"
                                      onClick={() => editingPractitioner && handleDeletePractitioner(editingPractitioner.universityId, editingPractitioner.id)}
                                    >
                                      Удалить
                                    </Button>
                                    <div className="flex gap-2">
                                      <Button variant="outline" onClick={() => setEditPractitionerDialogOpen(false)}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={handleSaveEditPractitioner}
                                        disabled={!editingPractitioner?.employeeName.trim() || !editingPractitioner?.department.trim()}
                                      >
                                        Сохранить
                                      </Button>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              {/* Модальное окно комментария практиканта */}
                              <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Комментарий к практиканту</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="practitioner-comment-dialog">Комментарий</Label>
                                      <Textarea
                                        id="practitioner-comment-dialog"
                                        placeholder="Введите комментарий..."
                                        value={commentDialogPractitioner?.comment || ""}
                                        onChange={(e) => {
                                          if (commentDialogPractitioner) {
                                            setCommentDialogPractitioner({
                                              ...commentDialogPractitioner,
                                              comment: e.target.value
                                            });
                                          }
                                        }}
                                        rows={5}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                                      Отмена
                                    </Button>
                                    <Button onClick={() => handleUpdatePractitionerComment(commentDialogPractitioner?.comment || "")}>
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Модальное окно редактирования участника кейс-чемпионата */}
                              <Dialog open={editParticipantDialogOpen} onOpenChange={setEditParticipantDialogOpen}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать участника</DialogTitle>
                                  </DialogHeader>
                                  {editingParticipant && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-participant-name">ФИО *</Label>
                                        <Input
                                          id="edit-participant-name"
                                          value={editingParticipant.employeeName}
                                          onChange={(e) => setEditingParticipant({ ...editingParticipant, employeeName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-participant-event">Кейс-чемпионат *</Label>
                                        <Select
                                          value={editingParticipant.eventId}
                                          onValueChange={(value) => setEditingParticipant({ ...editingParticipant, eventId: value })}
                                        >
                                          <SelectTrigger id="edit-participant-event">
                                            <SelectValue placeholder="Выберите кейс-чемпионат" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {university.events?.filter(e => e.type === "caseChampionships").map((event) => {
                                              const formatDate = (dateStr: string) => {
                                                const [year, month, day] = dateStr.split('-').map(Number);
                                                return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                              };
                                              return (
                                                <SelectItem key={event.id} value={event.id}>
                                                  {event.comments || "Кейс-чемпионат"} ({formatDate(event.date)})
                                                </SelectItem>
                                              );
                                            })}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-participant-status">Статус *</Label>
                                        <Select
                                          value={editingParticipant.status}
                                          onValueChange={(value) => setEditingParticipant({ ...editingParticipant, status: value as "registered" | "participated" | "winner" | "prize_winner" })}
                                        >
                                          <SelectTrigger id="edit-participant-status">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="registered">Зарегистрирован</SelectItem>
                                            <SelectItem value="participated">Участвовал</SelectItem>
                                            <SelectItem value="prize_winner">Призёр</SelectItem>
                                            <SelectItem value="winner">Победитель</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-participant-comments">Комментарии</Label>
                                        <Textarea
                                          id="edit-participant-comments"
                                          placeholder="Комментарии к участию..."
                                          value={editingParticipant.comments || ""}
                                          onChange={(e) => setEditingParticipant({ ...editingParticipant, comments: e.target.value })}
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter className="flex justify-between">
                                    <Button
                                      variant="destructive"
                                      onClick={() => editingParticipant && handleDeleteParticipant(editingParticipant.universityId, editingParticipant.id)}
                                    >
                                      Удалить
                                    </Button>
                                    <div className="flex gap-2">
                                      <Button variant="outline" onClick={() => setEditParticipantDialogOpen(false)}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={handleSaveEditParticipant}
                                        disabled={!editingParticipant?.employeeName.trim() || !editingParticipant?.eventId}
                                      >
                                        Сохранить
                                      </Button>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Модальное окно комментария участника кейс-чемпионата */}
                              <Dialog open={commentDialogParticipantOpen} onOpenChange={setCommentDialogParticipantOpen}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Комментарий к участнику</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="participant-comment-dialog">Комментарий</Label>
                                      <Textarea
                                        id="participant-comment-dialog"
                                        placeholder="Введите комментарий..."
                                        value={commentDialogParticipant?.comment || ""}
                                        onChange={(e) => {
                                          if (commentDialogParticipant) {
                                            setCommentDialogParticipant({
                                              ...commentDialogParticipant,
                                              comment: e.target.value
                                            });
                                          }
                                        }}
                                        rows={5}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setCommentDialogParticipantOpen(false)}>
                                      Отмена
                                    </Button>
                                    <Button onClick={() => handleUpdateParticipantComment(commentDialogParticipant?.comment || "")}>
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Модальное окно редактирования целевого практиканта */}
                              <Dialog open={editTargetPractitionerDialogOpen} onOpenChange={setEditTargetPractitionerDialogOpen}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать целевого практиканта</DialogTitle>
                                  </DialogHeader>
                                  {editingTargetPractitioner && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-target-practitioner-name">ФИО *</Label>
                                        <Input
                                          id="edit-target-practitioner-name"
                                          value={editingTargetPractitioner.employeeName}
                                          onChange={(e) => setEditingTargetPractitioner({ ...editingTargetPractitioner, employeeName: e.target.value })}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-target-practitioner-start-date">Дата начала *</Label>
                                          <Input
                                            id="edit-target-practitioner-start-date"
                                            type="date"
                                            value={editingTargetPractitioner.targetStartDate}
                                            onChange={(e) => setEditingTargetPractitioner({ ...editingTargetPractitioner, targetStartDate: e.target.value })}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-target-practitioner-end-date">Дата окончания *</Label>
                                          <Input
                                            id="edit-target-practitioner-end-date"
                                            type="date"
                                            value={editingTargetPractitioner.targetEndDate}
                                            onChange={(e) => setEditingTargetPractitioner({ ...editingTargetPractitioner, targetEndDate: e.target.value })}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-target-practitioner-department">Подразделение</Label>
                                        <Input
                                          id="edit-target-practitioner-department"
                                          value={editingTargetPractitioner.department || ""}
                                          onChange={(e) => setEditingTargetPractitioner({ ...editingTargetPractitioner, department: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-target-practitioner-supervisor">Руководитель практики</Label>
                                        <Input
                                          id="edit-target-practitioner-supervisor"
                                          placeholder="ФИО руководителя (необязательно)"
                                          value={editingTargetPractitioner.practiceSupervisor || ""}
                                          onChange={(e) => setEditingTargetPractitioner({ ...editingTargetPractitioner, practiceSupervisor: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-target-practitioner-comments">Комментарии</Label>
                                        <Textarea
                                          id="edit-target-practitioner-comments"
                                          placeholder="Комментарии к целевой практике..."
                                          value={editingTargetPractitioner.comments || ""}
                                          onChange={(e) => setEditingTargetPractitioner({ ...editingTargetPractitioner, comments: e.target.value })}
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter className="flex justify-between">
                                    <Button
                                      variant="destructive"
                                      onClick={() => editingTargetPractitioner && handleDeleteTargetPractitioner(editingTargetPractitioner.universityId, editingTargetPractitioner.id)}
                                    >
                                      Удалить
                                    </Button>
                                    <div className="flex gap-2">
                                      <Button variant="outline" onClick={() => setEditTargetPractitionerDialogOpen(false)}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={handleSaveEditTargetPractitioner}
                                        disabled={!editingTargetPractitioner?.employeeName.trim() || !editingTargetPractitioner?.targetStartDate || !editingTargetPractitioner?.targetEndDate}
                                      >
                                        Сохранить
                                      </Button>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              {/* Модальное окно комментария целевого практиканта */}
                              <Dialog open={commentDialogTargetPractitionerOpen} onOpenChange={setCommentDialogTargetPractitionerOpen}>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Комментарий к целевому практиканту</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="target-practitioner-comment-dialog">Комментарий</Label>
                                      <Textarea
                                        id="target-practitioner-comment-dialog"
                                        placeholder="Введите комментарий..."
                                        value={commentDialogTargetPractitioner?.comment || ""}
                                        onChange={(e) => {
                                          if (commentDialogTargetPractitioner) {
                                            setCommentDialogTargetPractitioner({
                                              ...commentDialogTargetPractitioner,
                                              comment: e.target.value
                                            });
                                          }
                                        }}
                                        rows={5}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setCommentDialogTargetPractitionerOpen(false)}>
                                      Отмена
                                    </Button>
                                    <Button onClick={() => handleUpdateTargetPractitionerComment(commentDialogTargetPractitioner?.comment || "")}>
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TabsContent>
                          </Tabs>
                        </TabsContent>

                        {/* Таб 5: Договорная база БКО */}
                        <TabsContent value="bko" className="space-y-4 mt-4">
                          {/* Блок Зарплатный проект */}
                          <Card>
                            <CardContent className="space-y-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold">Зарплатный проект</h3>
                                    <p className="text-sm text-muted-foreground">Наличие зарплатного проекта</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-students" className="text-base font-medium">Студенты</Label>
                                      <p className="text-sm text-muted-foreground">Зарплатный проект для студентов</p>
                                    </div>
                                    <Switch
                                      id="bko-students"
                                      checked={university.bkoData?.salaryProject?.students || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  salaryProject: {
                                                    ...u.bkoData?.salaryProject,
                                                    students: checked,
                                                  },
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-employees" className="text-base font-medium">Сотрудники</Label>
                                      <p className="text-sm text-muted-foreground">Зарплатный проект для сотрудников</p>
                                    </div>
                                    <Switch
                                      id="bko-employees"
                                      checked={university.bkoData?.salaryProject?.employees || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  salaryProject: {
                                                    ...u.bkoData?.salaryProject,
                                                    employees: checked,
                                                  },
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="space-y-6">
                              {/* Блок Транзакционные продукты */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold">Транзакционные продукты</h3>
                                    <p className="text-sm text-muted-foreground">Наличие транзакционных продуктов</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-ie" className="text-base font-medium">ИЭ</Label>
                                      <p className="text-sm text-muted-foreground">Интернет-эквайринг</p>
                                    </div>
                                    <Switch
                                      id="bko-ie"
                                      checked={university.bkoData?.transactionalProducts?.ie || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  transactionalProducts: {
                                                    ...u.bkoData?.transactionalProducts,
                                                    ie: checked,
                                                  },
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-te" className="text-base font-medium">ТЭ</Label>
                                      <p className="text-sm text-muted-foreground">Торговый эквайринг</p>
                                    </div>
                                    <Switch
                                      id="bko-te"
                                      checked={university.bkoData?.transactionalProducts?.te || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  transactionalProducts: {
                                                    ...u.bkoData?.transactionalProducts,
                                                    te: checked,
                                                  },
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-sbp" className="text-base font-medium">СБП</Label>
                                      <p className="text-sm text-muted-foreground">Система быстрых платежей</p>
                                    </div>
                                    <Switch
                                      id="bko-sbp"
                                      checked={university.bkoData?.transactionalProducts?.sbp || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  transactionalProducts: {
                                                    ...u.bkoData?.transactionalProducts,
                                                    sbp: checked,
                                                  },
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-adm" className="text-base font-medium">АДМ</Label>
                                      <p className="text-sm text-muted-foreground">Административные платежи</p>
                                    </div>
                                    <Switch
                                      id="bko-adm"
                                      checked={university.bkoData?.transactionalProducts?.adm || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  transactionalProducts: {
                                                    ...u.bkoData?.transactionalProducts,
                                                    adm: checked,
                                                  },
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Блок Лимит */}
                          <Card>
                            <CardContent className="space-y-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold">Лимит</h3>
                                    <p className="text-sm text-muted-foreground">Наличие лимита</p>
                                  </div>
                                </div>
                                <div className="pl-4">
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-limit" className="text-base font-medium">Лимит</Label>
                                      <p className="text-sm text-muted-foreground">Установлен лимит</p>
                                    </div>
                                    <Switch
                                      id="bko-limit"
                                      checked={university.bkoData?.limit || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  limit: checked,
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Блок УК ГПБ фондами ЦК */}
                          <Card>
                            <CardContent className="space-y-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold">УК ГПБ фондами ЦК</h3>
                                    <p className="text-sm text-muted-foreground">Наличие УК ГПБ фондами ЦК</p>
                                  </div>
                                </div>
                                <div className="pl-4">
                                  <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                      <Label htmlFor="bko-uk-gpb-funds-ck" className="text-base font-medium">УК ГПБ фондами ЦК</Label>
                                      <p className="text-sm text-muted-foreground">Управление капиталом ГПБ фондами ЦК</p>
                                    </div>
                                    <Switch
                                      id="bko-uk-gpb-funds-ck"
                                      checked={university.bkoData?.ukGpbFundsCk || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                bkoData: {
                                                  ...u.bkoData,
                                                  ukGpbFundsCk: checked,
                                                },
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Комментарий */}
                          <Card>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="bko-comment" className="text-base font-medium">Комментарий</Label>
                                <Textarea
                                  id="bko-comment"
                                  placeholder="Введите комментарий..."
                                  value={university.bkoData?.comment || ""}
                                  onChange={(e) => {
                                    const updatedUniversities = universities.map((u) =>
                                      u.id === university.id
                                        ? {
                                            ...u,
                                            bkoData: {
                                              ...u.bkoData,
                                              comment: e.target.value,
                                            },
                                          }
                                        : u
                                    );
                                    setUniversities(updatedUniversities);
                                  }}
                                  className="min-h-[100px]"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Таб 6: ЦНТР */}
                        <TabsContent value="cntr" className="space-y-4 mt-4">
                          <Tabs value={cntrSubTab} onValueChange={(value) => setCntrSubTab(value as typeof cntrSubTab)} className="w-full">
                            <div className="flex gap-4">
                              {/* Контент слева */}
                              <div className="flex-1">
                            
                            {/* Подвкладка 1: Развитие научно-технологической инфраструктуры */}
                            <TabsContent value="infrastructure" className="space-y-4 mt-0">
                              <div className="flex items-center justify-end mb-4">
                                <Dialog open={addInfrastructureDialogOpen} onOpenChange={setAddInfrastructureDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="default" size="sm" onClick={() => {
                                      setNewInfrastructure({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                      setEditingInfrastructure(null);
                                    }}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Добавить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Добавить элемент инфраструктуры</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="infrastructure-development-type">Вид развития *</Label>
                                        <Select
                                          value={newInfrastructure.developmentType}
                                          onValueChange={(value) => setNewInfrastructure({ ...newInfrastructure, developmentType: value })}
                                        >
                                          <SelectTrigger id="infrastructure-development-type">
                                            <SelectValue placeholder="Выберите вид развития" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="financing">Финансирование научно-технологической инфраструктуры</SelectItem>
                                            <SelectItem value="endowment">Финансирование научно-технологической инфраструктуры (эндаумент)</SelectItem>
                                            <SelectItem value="endowment-fund">Финансирование научно-технологической инфраструктуры (эндаумент фонд)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="infrastructure-date">Дата *</Label>
                                        <Input
                                          id="infrastructure-date"
                                          type="date"
                                          value={newInfrastructure.date}
                                          onChange={(e) => setNewInfrastructure({ ...newInfrastructure, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="infrastructure-branch">Головной ВУЗ / Филиал</Label>
                                        <Select
                                          value={newInfrastructure.branch}
                                          onValueChange={(value) => setNewInfrastructure({ ...newInfrastructure, branch: value })}
                                        >
                                          <SelectTrigger id="infrastructure-branch">
                                            <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                            {university?.branch?.map((branchName) => (
                                              <SelectItem key={branchName} value={branchName}>
                                                {branchName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="infrastructure-description">Описание</Label>
                                        <Textarea
                                          id="infrastructure-description"
                                          placeholder="Введите описание элемента инфраструктуры..."
                                          value={newInfrastructure.description}
                                          onChange={(e) => setNewInfrastructure({ ...newInfrastructure, description: e.target.value })}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="infrastructure-document">Документ (PDF)</Label>
                                        <Input
                                          id="infrastructure-document"
                                          type="text"
                                          placeholder="URL или путь к PDF файлу..."
                                          value={newInfrastructure.document}
                                          onChange={(e) => setNewInfrastructure({ ...newInfrastructure, document: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setAddInfrastructureDialogOpen(false);
                                        setEditingInfrastructure(null);
                                        setNewInfrastructure({ developmentType: "", date: "", branch: "", description: "" });
                                      }}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (newInfrastructure.developmentType && newInfrastructure.date && selectedUniversity) {
                                            // Добавление
                                            const newItem: CNTRInfrastructureItem = {
                                              id: `cntr-infra-${Date.now()}`,
                                              developmentType: newInfrastructure.developmentType as "financing" | "endowment" | "endowment-fund",
                                              date: newInfrastructure.date,
                                              branch: newInfrastructure.branch || undefined,
                                              description: newInfrastructure.description?.trim() || undefined,
                                              document: newInfrastructure.document?.trim() || undefined,
                                            };
                                            const updatedUniversities = universities.map((u) =>
                                              u.id === selectedUniversity
                                                ? {
                                                    ...u,
                                                    cntrInfrastructure: [...(u.cntrInfrastructure || []), newItem],
                                                  }
                                                : u
                                            );
                                            setUniversities(updatedUniversities);
                                            setAddInfrastructureDialogOpen(false);
                                            setNewInfrastructure({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                          }
                                        }}
                                        disabled={!newInfrastructure.developmentType || !newInfrastructure.date}
                                      >
                                        Добавить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                {/* Диалог редактирования инфраструктуры */}
                                <Dialog open={editInfrastructureDialogOpen} onOpenChange={setEditInfrastructureDialogOpen}>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Редактировать элемент инфраструктуры</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-infrastructure-development-type">Вид развития *</Label>
                                        <Select
                                          value={newInfrastructure.developmentType}
                                          onValueChange={(value) => setNewInfrastructure({ ...newInfrastructure, developmentType: value })}
                                        >
                                          <SelectTrigger id="edit-infrastructure-development-type">
                                            <SelectValue placeholder="Выберите вид развития" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="financing">Финансирование научно-технологической инфраструктуры</SelectItem>
                                            <SelectItem value="endowment">Финансирование научно-технологической инфраструктуры (эндаумент)</SelectItem>
                                            <SelectItem value="endowment-fund">Финансирование научно-технологической инфраструктуры (эндаумент фонд)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-infrastructure-date">Дата *</Label>
                                        <Input
                                          id="edit-infrastructure-date"
                                          type="date"
                                          value={newInfrastructure.date}
                                          onChange={(e) => setNewInfrastructure({ ...newInfrastructure, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-infrastructure-branch">Головной ВУЗ / Филиал</Label>
                                        <Select
                                          value={newInfrastructure.branch}
                                          onValueChange={(value) => setNewInfrastructure({ ...newInfrastructure, branch: value })}
                                        >
                                          <SelectTrigger id="edit-infrastructure-branch">
                                            <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                            {university?.branch?.map((branchName) => (
                                              <SelectItem key={branchName} value={branchName}>
                                                {branchName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-infrastructure-description">Описание</Label>
                                        <Textarea
                                          id="edit-infrastructure-description"
                                          placeholder="Введите описание элемента инфраструктуры..."
                                          value={newInfrastructure.description}
                                          onChange={(e) => setNewInfrastructure({ ...newInfrastructure, description: e.target.value })}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-infrastructure-document">Документ (PDF)</Label>
                                        <Input
                                          id="edit-infrastructure-document"
                                          type="text"
                                          placeholder="URL или путь к PDF файлу..."
                                          value={newInfrastructure.document}
                                          onChange={(e) => setNewInfrastructure({ ...newInfrastructure, document: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setEditInfrastructureDialogOpen(false);
                                        setEditingInfrastructure(null);
                                        setNewInfrastructure({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                      }}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (newInfrastructure.developmentType && newInfrastructure.date && selectedUniversity && editingInfrastructure) {
                                            const updatedUniversities = universities.map((u) =>
                                              u.id === selectedUniversity
                                                ? {
                                                    ...u,
                                                    cntrInfrastructure: (u.cntrInfrastructure || []).map((item) =>
                                                      item.id === editingInfrastructure.itemId
                                                        ? {
                                                            ...item,
                                                            developmentType: newInfrastructure.developmentType as "financing" | "endowment" | "endowment-fund",
                                                            date: newInfrastructure.date,
                                                            branch: newInfrastructure.branch || undefined,
                                                            description: newInfrastructure.description?.trim() || undefined,
                                                            document: newInfrastructure.document?.trim() || undefined,
                                                          }
                                                        : item
                                                    ),
                                                  }
                                                : u
                                            );
                                            setUniversities(updatedUniversities);
                                            setEditInfrastructureDialogOpen(false);
                                            setNewInfrastructure({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                            setEditingInfrastructure(null);
                                          }
                                        }}
                                        disabled={!newInfrastructure.developmentType || !newInfrastructure.date}
                                      >
                                        Сохранить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              {(() => {
                                const infrastructureItems = university.cntrInfrastructure || [];
                                const getDevelopmentTypeLabel = (type: string) => {
                                  switch (type) {
                                    case "financing":
                                      return "Финансирование научно-технологической инфраструктуры";
                                    case "endowment":
                                      return "Финансирование научно-технологической инфраструктуры (эндаумент)";
                                    case "endowment-fund":
                                      return "Финансирование научно-технологической инфраструктуры (эндаумент фонд)";
                                    default:
                                      return type;
                                  }
                                };
                                
                                const formatDate = (dateStr: string) => {
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                };
                                
                                const handleEditInfrastructure = (item: CNTRInfrastructureItem) => {
                                  if (!selectedUniversity) return;
                                  setEditingInfrastructure({ universityId: selectedUniversity, itemId: item.id });
                                  setNewInfrastructure({
                                    developmentType: item.developmentType,
                                    date: item.date,
                                    branch: item.branch || "",
                                    description: item.description || "",
                                    document: item.document || "",
                                  });
                                  setEditInfrastructureDialogOpen(true);
                                };
                                
                                const handleRemoveInfrastructure = (itemId: string) => {
                                  if (!selectedUniversity) return;
                                  const updatedUniversities = universities.map((u) =>
                                    u.id === selectedUniversity
                                      ? {
                                          ...u,
                                          cntrInfrastructure: (u.cntrInfrastructure || []).filter((item) => item.id !== itemId),
                                        }
                                      : u
                                  );
                                  setUniversities(updatedUniversities);
                                };
                                
                                return infrastructureItems.length > 0 ? (
                                  <div className="space-y-4">
                                    {infrastructureItems.map((item) => (
                                      <Card key={item.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge variant="outline" className="text-xs">
                                                {getDevelopmentTypeLabel(item.developmentType)}
                                              </Badge>
                                              {item.branch && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {item.branch}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                              <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                <span className="font-medium">{formatDate(item.date)}</span>
                                              </div>
                                            </div>
                                            {item.description && (
                                              <div className="text-sm">
                                                <span className="text-muted-foreground">Описание:</span>
                                                <p className="mt-1 text-foreground">{item.description}</p>
                                              </div>
                                            )}
                                            {item.document && (
                                              <div className="flex items-start gap-2 md:col-span-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Документ:</span>
                                                <a 
                                                  href={item.document} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-primary hover:underline break-all"
                                                >
                                                  {item.document}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleEditInfrastructure(item)}
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleRemoveInfrastructure(item.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card>
                                    <CardContent className="space-y-6 pt-6">
                                      <div className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Развитие научно-технологической инфраструктуры</p>
                                        <p className="text-sm">Элементы инфраструктуры не добавлены</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })()}
                            </TabsContent>
                            
                            {/* Подвкладка 2: Развитие научно-технологических проектов */}
                            <TabsContent value="projects" className="space-y-4 mt-0">
                              <div className="flex items-center justify-end mb-4">
                                <Dialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="default" size="sm" onClick={() => {
                                      setNewProject({ projectName: "", date: "", branch: "", fundingAmount: "", supportFormat: "", description: "", document: "" });
                                      setEditingProject(null);
                                    }}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Добавить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Добавить проект</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="project-name">Название проекта *</Label>
                                        <Input
                                          id="project-name"
                                          placeholder="Введите название проекта..."
                                          value={newProject.projectName}
                                          onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="project-date">Дата *</Label>
                                        <Input
                                          id="project-date"
                                          type="date"
                                          value={newProject.date}
                                          onChange={(e) => setNewProject({ ...newProject, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="project-branch">Головной ВУЗ / Филиал</Label>
                                        <Select
                                          value={newProject.branch}
                                          onValueChange={(value) => setNewProject({ ...newProject, branch: value })}
                                        >
                                          <SelectTrigger id="project-branch">
                                            <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                            {university?.branch?.map((branchName) => (
                                              <SelectItem key={branchName} value={branchName}>
                                                {branchName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="project-funding-amount">Размер финансирования (руб.)</Label>
                                        <Input
                                          id="project-funding-amount"
                                          type="number"
                                          placeholder="Введите размер финансирования..."
                                          value={newProject.fundingAmount}
                                          onChange={(e) => setNewProject({ ...newProject, fundingAmount: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="project-support-format">Формат поддержки</Label>
                                        <Select
                                          value={newProject.supportFormat}
                                          onValueChange={(value) => setNewProject({ ...newProject, supportFormat: value })}
                                        >
                                          <SelectTrigger id="project-support-format">
                                            <SelectValue placeholder="Выберите формат поддержки" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="grant-cofinancing">софинансирование гранта</SelectItem>
                                            <SelectItem value="ordered-rd-center-lift">заказной НИОКР в интересах центра ЛИФТ</SelectItem>
                                            <SelectItem value="targeted-charity">целевая благотворительность</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="project-description">Описание</Label>
                                        <Textarea
                                          id="project-description"
                                          placeholder="Введите описание проекта..."
                                          value={newProject.description}
                                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="project-document">Документ (PDF)</Label>
                                        <Input
                                          id="project-document"
                                          type="text"
                                          placeholder="URL или путь к PDF файлу..."
                                          value={newProject.document}
                                          onChange={(e) => setNewProject({ ...newProject, document: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setAddProjectDialogOpen(false);
                                        setEditingProject(null);
                                        setNewProject({ projectName: "", date: "", branch: "", fundingAmount: "", supportFormat: "", description: "", document: "" });
                                      }}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (newProject.projectName && newProject.date && selectedUniversity) {
                                            const newItem: CNTRProjectItem = {
                                              id: `cntr-project-${Date.now()}`,
                                              projectName: newProject.projectName,
                                              date: newProject.date,
                                              branch: newProject.branch || undefined,
                                              fundingAmount: newProject.fundingAmount ? Number(newProject.fundingAmount) : undefined,
                                              supportFormat: (newProject.supportFormat as "grant-cofinancing" | "ordered-rd-center-lift" | "targeted-charity") || undefined,
                                              description: newProject.description?.trim() || undefined,
                                              document: newProject.document?.trim() || undefined,
                                            };
                                            const updatedUniversities = universities.map((u) =>
                                              u.id === selectedUniversity
                                                ? {
                                                    ...u,
                                                    cntrProjects: [...(u.cntrProjects || []), newItem],
                                                  }
                                                : u
                                            );
                                            setUniversities(updatedUniversities);
                                            setAddProjectDialogOpen(false);
                                            setNewProject({ projectName: "", date: "", branch: "", fundingAmount: "", supportFormat: "", description: "", document: "" });
                                          }
                                        }}
                                        disabled={!newProject.projectName || !newProject.date}
                                      >
                                        Добавить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                {/* Диалог редактирования проекта */}
                                <Dialog open={editProjectDialogOpen} onOpenChange={setEditProjectDialogOpen}>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Редактировать проект</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-name">Название проекта *</Label>
                                        <Input
                                          id="edit-project-name"
                                          placeholder="Введите название проекта..."
                                          value={newProject.projectName}
                                          onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-date">Дата *</Label>
                                        <Input
                                          id="edit-project-date"
                                          type="date"
                                          value={newProject.date}
                                          onChange={(e) => setNewProject({ ...newProject, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-branch">Головной ВУЗ / Филиал</Label>
                                        <Select
                                          value={newProject.branch}
                                          onValueChange={(value) => setNewProject({ ...newProject, branch: value })}
                                        >
                                          <SelectTrigger id="edit-project-branch">
                                            <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                            {university?.branch?.map((branchName) => (
                                              <SelectItem key={branchName} value={branchName}>
                                                {branchName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-funding-amount">Размер финансирования (руб.)</Label>
                                        <Input
                                          id="edit-project-funding-amount"
                                          type="number"
                                          placeholder="Введите размер финансирования..."
                                          value={newProject.fundingAmount}
                                          onChange={(e) => setNewProject({ ...newProject, fundingAmount: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-support-format">Формат поддержки</Label>
                                        <Select
                                          value={newProject.supportFormat}
                                          onValueChange={(value) => setNewProject({ ...newProject, supportFormat: value })}
                                        >
                                          <SelectTrigger id="edit-project-support-format">
                                            <SelectValue placeholder="Выберите формат поддержки" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="grant-cofinancing">софинансирование гранта</SelectItem>
                                            <SelectItem value="ordered-rd-center-lift">заказной НИОКР в интересах центра ЛИФТ</SelectItem>
                                            <SelectItem value="targeted-charity">целевая благотворительность</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-description">Описание</Label>
                                        <Textarea
                                          id="edit-project-description"
                                          placeholder="Введите описание проекта..."
                                          value={newProject.description}
                                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-project-document">Документ (PDF)</Label>
                                        <Input
                                          id="edit-project-document"
                                          type="text"
                                          placeholder="URL или путь к PDF файлу..."
                                          value={newProject.document}
                                          onChange={(e) => setNewProject({ ...newProject, document: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setEditProjectDialogOpen(false);
                                        setEditingProject(null);
                                        setNewProject({ projectName: "", date: "", branch: "", fundingAmount: "", supportFormat: "", description: "", document: "" });
                                      }}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (newProject.projectName && newProject.date && selectedUniversity && editingProject) {
                                            const updatedUniversities = universities.map((u) =>
                                              u.id === selectedUniversity
                                                ? {
                                                    ...u,
                                                    cntrProjects: (u.cntrProjects || []).map((item) =>
                                                      item.id === editingProject.itemId
                                                        ? {
                                                            ...item,
                                                            projectName: newProject.projectName,
                                                            date: newProject.date,
                                                            branch: newProject.branch || undefined,
                                                            fundingAmount: newProject.fundingAmount ? Number(newProject.fundingAmount) : undefined,
                                                            supportFormat: (newProject.supportFormat as "grant-cofinancing" | "ordered-rd-center-lift" | "targeted-charity") || undefined,
                                                            description: newProject.description?.trim() || undefined,
                                                            document: newProject.document?.trim() || undefined,
                                                          }
                                                        : item
                                                    ),
                                                  }
                                                : u
                                            );
                                            setUniversities(updatedUniversities);
                                            setEditProjectDialogOpen(false);
                                            setNewProject({ projectName: "", date: "", branch: "", fundingAmount: "", supportFormat: "", description: "", document: "" });
                                            setEditingProject(null);
                                          }
                                        }}
                                        disabled={!newProject.projectName || !newProject.date}
                                      >
                                        Сохранить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              {(() => {
                                const projectItems = university.cntrProjects || [];
                                const formatDate = (dateStr: string) => {
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                };
                                
                                const formatFundingAmount = (amount?: number) => {
                                  if (!amount) return "";
                                  return `${amount.toLocaleString('ru-RU')} руб`;
                                };
                                
                                const formatSupportFormat = (format?: string) => {
                                  if (!format) return "";
                                  const formatMap: Record<string, string> = {
                                    "grant-cofinancing": "Софинансирование гранта",
                                    "ordered-rd-center-lift": "Заказной НИОКР в интересах центра ЛИФТ",
                                    "targeted-charity": "Целевая благотворительность",
                                  };
                                  return formatMap[format] || format;
                                };
                                
                                const handleEditProject = (item: CNTRProjectItem) => {
                                  if (!selectedUniversity) return;
                                  setEditingProject({ universityId: selectedUniversity, itemId: item.id });
                                  setNewProject({
                                    projectName: item.projectName,
                                    date: item.date,
                                    branch: item.branch || "",
                                    fundingAmount: item.fundingAmount?.toString() || "",
                                    supportFormat: item.supportFormat || "",
                                    description: item.description || "",
                                    document: item.document || "",
                                  });
                                  setEditProjectDialogOpen(true);
                                };
                                
                                const handleRemoveProject = (itemId: string) => {
                                  if (!selectedUniversity) return;
                                  const updatedUniversities = universities.map((u) =>
                                    u.id === selectedUniversity
                                      ? {
                                          ...u,
                                          cntrProjects: (u.cntrProjects || []).filter((item) => item.id !== itemId),
                                        }
                                      : u
                                  );
                                  setUniversities(updatedUniversities);
                                };
                                
                                return projectItems.length > 0 ? (
                                  <div className="space-y-4">
                                    {projectItems.map((item) => (
                                      <Card key={item.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge variant="outline" className="text-xs">
                                                {item.projectName}
                                              </Badge>
                                              {item.branch && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {item.branch}
                                                </Badge>
                                              )}
                                              {item.fundingAmount && (
                                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                                  {formatFundingAmount(item.fundingAmount)}
                                                </Badge>
                                              )}
                                              {item.supportFormat && (
                                                <Badge variant="outline" className="text-xs">
                                                  {formatSupportFormat(item.supportFormat)}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                              <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                <span className="font-medium">{formatDate(item.date)}</span>
                                              </div>
                                            </div>
                                            {item.description && (
                                              <div className="text-sm">
                                                <span className="text-muted-foreground">Описание:</span>
                                                <p className="mt-1 text-foreground">{item.description}</p>
                                              </div>
                                            )}
                                            {item.document && (
                                              <div className="flex items-start gap-2 md:col-span-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Документ:</span>
                                                <a 
                                                  href={item.document} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-primary hover:underline break-all"
                                                >
                                                  {item.document}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleEditProject(item)}
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleRemoveProject(item.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card>
                                    <CardContent className="space-y-6 pt-6">
                                      <div className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Развитие научно-технологических проектов</p>
                                        <p className="text-sm">Проекты не добавлены</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })()}
                            </TabsContent>
                            
                            {/* Подвкладка 3: Участие в акселераторе Газпромбанк Тех. Трек Наука */}
                            <TabsContent value="accelerator" className="space-y-4 mt-0">
                              <Card>
                                <CardContent className="space-y-6 pt-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <Label htmlFor="accelerator-switch" className="text-base font-medium">
                                      Участие в Акселераторе Газпромбанк.Тех: Наука
                                    </Label>
                                    <Switch
                                      id="accelerator-switch"
                                      checked={university.cntrAcceleratorEnabled || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                cntrAcceleratorEnabled: checked,
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                  
                                  {university.cntrAcceleratorEnabled && (
                                    <>
                                      <div className="flex items-center justify-end mb-4">
                                        <Dialog open={addAcceleratorDialogOpen} onOpenChange={setAddAcceleratorDialogOpen}>
                                          <DialogTrigger asChild>
                                            <Button variant="default" size="sm" onClick={() => {
                                              setNewAccelerator({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                              setEditingAccelerator(null);
                                            }}>
                                              <Plus className="mr-2 h-4 w-4" />
                                              Добавить
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                              <DialogTitle>Добавить элемент акселератора</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="accelerator-date">Дата *</Label>
                                                <Input
                                                  id="accelerator-date"
                                                  type="date"
                                                  value={newAccelerator.date}
                                                  onChange={(e) => setNewAccelerator({ ...newAccelerator, date: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="accelerator-branch">Головной ВУЗ / Филиал</Label>
                                                <Select
                                                  value={newAccelerator.branch}
                                                  onValueChange={(value) => setNewAccelerator({ ...newAccelerator, branch: value })}
                                                >
                                                  <SelectTrigger id="accelerator-branch">
                                                    <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                                    {university?.branch?.map((branchName) => (
                                                      <SelectItem key={branchName} value={branchName}>
                                                        {branchName}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="accelerator-description">Описание</Label>
                                                <Textarea
                                                  id="accelerator-description"
                                                  placeholder="Введите описание элемента акселератора..."
                                                  value={newAccelerator.description}
                                                  onChange={(e) => setNewAccelerator({ ...newAccelerator, description: e.target.value })}
                                                  rows={4}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="accelerator-document">Документ (PDF)</Label>
                                                <Input
                                                  id="accelerator-document"
                                                  type="text"
                                                  placeholder="URL или путь к PDF файлу..."
                                                  value={newAccelerator.document}
                                                  onChange={(e) => setNewAccelerator({ ...newAccelerator, document: e.target.value })}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => {
                                                setAddAcceleratorDialogOpen(false);
                                                setEditingAccelerator(null);
                                                setNewAccelerator({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                              }}>
                                                Отмена
                                              </Button>
                                              <Button 
                                                onClick={() => {
                                                  if (newAccelerator.date && selectedUniversity) {
                                                    const newItem: CNTRAcceleratorItem = {
                                                      id: `cntr-accelerator-${Date.now()}`,
                                                      developmentType: newAccelerator.developmentType as "financing" | "endowment" | "endowment-fund" || undefined,
                                                      date: newAccelerator.date,
                                                      branch: newAccelerator.branch || undefined,
                                                      description: newAccelerator.description?.trim() || undefined,
                                                      document: newAccelerator.document?.trim() || undefined,
                                                    };
                                                    const updatedUniversities = universities.map((u) =>
                                                      u.id === selectedUniversity
                                                        ? {
                                                            ...u,
                                                            cntrAcceleratorItems: [...(u.cntrAcceleratorItems || []), newItem],
                                                          }
                                                        : u
                                                    );
                                                    setUniversities(updatedUniversities);
                                                    setAddAcceleratorDialogOpen(false);
                                                    setNewAccelerator({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                                  }
                                                }}
                                                disabled={!newAccelerator.date}
                                              >
                                                Сохранить
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                      
                                      {(() => {
                                        const acceleratorItems = university.cntrAcceleratorItems || [];
                                        
                                        const formatDate = (dateStr: string) => {
                                          const [year, month, day] = dateStr.split('-').map(Number);
                                          return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                        };
                                        
                                        const handleEditAccelerator = (item: CNTRAcceleratorItem) => {
                                          if (!selectedUniversity) return;
                                          setEditingAccelerator({ universityId: selectedUniversity, itemId: item.id });
                                          setNewAccelerator({
                                            developmentType: item.developmentType || "",
                                            date: item.date,
                                            branch: item.branch || "",
                                            description: item.description || "",
                                            document: item.document || "",
                                          });
                                          setEditAcceleratorDialogOpen(true);
                                        };
                                        
                                        const handleRemoveAccelerator = (itemId: string) => {
                                          if (!selectedUniversity) return;
                                          const updatedUniversities = universities.map((u) =>
                                            u.id === selectedUniversity
                                              ? {
                                                  ...u,
                                                  cntrAcceleratorItems: (u.cntrAcceleratorItems || []).filter((item) => item.id !== itemId),
                                                }
                                              : u
                                          );
                                          setUniversities(updatedUniversities);
                                        };
                                        
                                        return acceleratorItems.length > 0 ? (
                                          <div className="space-y-4">
                                            {acceleratorItems.map((item) => (
                                              <Card key={item.id} className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                  <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      {item.branch && (
                                                        <Badge variant="secondary" className="text-xs">
                                                          {item.branch}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                      <div className="flex items-start gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                        <span className="font-medium">{formatDate(item.date)}</span>
                                                      </div>
                                                    </div>
                                                    {item.description && (
                                                      <div className="text-sm">
                                                        <span className="text-muted-foreground">Описание:</span>
                                                        <p className="mt-1 text-foreground">{item.description}</p>
                                                      </div>
                                                    )}
                                                    {item.document && (
                                                      <div className="flex items-start gap-2 md:col-span-2 text-sm">
                                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground whitespace-nowrap">Документ:</span>
                                                        <a 
                                                          href={item.document} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer" 
                                                          className="text-primary hover:underline break-all"
                                                        >
                                                          {item.document}
                                                        </a>
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-8 w-8 p-0"
                                                      onClick={() => handleEditAccelerator(item)}
                                                    >
                                                      <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-8 w-8 p-0"
                                                      onClick={() => handleRemoveAccelerator(item.id)}
                                                    >
                                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </Card>
                                            ))}
                                          </div>
                                        ) : (
                                          <Card>
                                            <CardContent className="space-y-6 pt-6">
                                              <div className="text-center py-12 text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium mb-2">Участие в акселераторе Газпромбанк Тех. Трек Наука</p>
                                                <p className="text-sm">Элементы акселератора не добавлены</p>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        );
                                      })()}
                                    </>
                                  )}
                                  
                                  {!university.cntrAcceleratorEnabled && (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <p className="text-sm">Включите участие в акселераторе для добавления элементов</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                              
                              {/* Диалог редактирования элемента акселератора */}
                              <Dialog open={editAcceleratorDialogOpen} onOpenChange={setEditAcceleratorDialogOpen}>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать элемент акселератора</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-accelerator-date">Дата *</Label>
                                      <Input
                                        id="edit-accelerator-date"
                                        type="date"
                                        value={newAccelerator.date}
                                        onChange={(e) => setNewAccelerator({ ...newAccelerator, date: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-accelerator-branch">Головной ВУЗ / Филиал</Label>
                                      <Select
                                        value={newAccelerator.branch}
                                        onValueChange={(value) => setNewAccelerator({ ...newAccelerator, branch: value })}
                                      >
                                        <SelectTrigger id="edit-accelerator-branch">
                                          <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                          {university?.branch?.map((branchName) => (
                                            <SelectItem key={branchName} value={branchName}>
                                              {branchName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-accelerator-description">Описание</Label>
                                      <Textarea
                                        id="edit-accelerator-description"
                                        placeholder="Введите описание элемента акселератора..."
                                        value={newAccelerator.description}
                                        onChange={(e) => setNewAccelerator({ ...newAccelerator, description: e.target.value })}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-accelerator-document">Документ (PDF)</Label>
                                      <Input
                                        id="edit-accelerator-document"
                                        type="text"
                                        placeholder="URL или путь к PDF файлу..."
                                        value={newAccelerator.document}
                                        onChange={(e) => setNewAccelerator({ ...newAccelerator, document: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setEditAcceleratorDialogOpen(false);
                                      setEditingAccelerator(null);
                                      setNewAccelerator({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                    }}>
                                      Отмена
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        if (newAccelerator.date && selectedUniversity && editingAccelerator) {
                                          const updatedUniversities = universities.map((u) =>
                                            u.id === selectedUniversity
                                              ? {
                                                  ...u,
                                                  cntrAcceleratorItems: (u.cntrAcceleratorItems || []).map((item) =>
                                                    item.id === editingAccelerator.itemId
                                                      ? {
                                                          ...item,
                                                          developmentType: newAccelerator.developmentType as "financing" | "endowment" | "endowment-fund" || undefined,
                                                          date: newAccelerator.date,
                                                          branch: newAccelerator.branch || undefined,
                                                          description: newAccelerator.description?.trim() || undefined,
                                                          document: newAccelerator.document?.trim() || undefined,
                                                        }
                                                      : item
                                                  ),
                                                }
                                              : u
                                          );
                                          setUniversities(updatedUniversities);
                                          setEditAcceleratorDialogOpen(false);
                                          setNewAccelerator({ developmentType: "", date: "", branch: "", description: "", document: "" });
                                          setEditingAccelerator(null);
                                        }
                                      }}
                                      disabled={!newAccelerator.date}
                                    >
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TabsContent>
                            
                            {/* Подвкладка 4: Мероприятия */}
                            <TabsContent value="events" className="space-y-4 mt-0">
                              <div className="flex items-center justify-end mb-4">
                                <Dialog open={addCntrEventDialogOpen} onOpenChange={setAddCntrEventDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="default" size="sm" onClick={() => {
                                      setNewCntrEvent({ date: "", branch: "", description: "", document: "" });
                                      setEditingCntrEvent(null);
                                    }}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Добавить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Добавить мероприятие</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-event-date">Дата *</Label>
                                        <Input
                                          id="cntr-event-date"
                                          type="date"
                                          value={newCntrEvent.date}
                                          onChange={(e) => setNewCntrEvent({ ...newCntrEvent, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-event-branch">Головной ВУЗ / Филиал</Label>
                                        <Select
                                          value={newCntrEvent.branch}
                                          onValueChange={(value) => setNewCntrEvent({ ...newCntrEvent, branch: value })}
                                        >
                                          <SelectTrigger id="cntr-event-branch">
                                            <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                            {university?.branch?.map((branchName) => (
                                              <SelectItem key={branchName} value={branchName}>
                                                {branchName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-event-description">Описание</Label>
                                        <Textarea
                                          id="cntr-event-description"
                                          placeholder="Введите описание мероприятия..."
                                          value={newCntrEvent.description}
                                          onChange={(e) => setNewCntrEvent({ ...newCntrEvent, description: e.target.value })}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-event-document">Документ (PDF)</Label>
                                        <Input
                                          id="cntr-event-document"
                                          type="text"
                                          placeholder="URL или путь к PDF файлу..."
                                          value={newCntrEvent.document}
                                          onChange={(e) => setNewCntrEvent({ ...newCntrEvent, document: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setAddCntrEventDialogOpen(false);
                                        setEditingCntrEvent(null);
                                        setNewCntrEvent({ date: "", branch: "", description: "", document: "" });
                                      }}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (newCntrEvent.date && selectedUniversity) {
                                            const newItem: CNTREventItem = {
                                              id: `cntr-event-${Date.now()}`,
                                              date: newCntrEvent.date,
                                              branch: newCntrEvent.branch || undefined,
                                              description: newCntrEvent.description?.trim() || undefined,
                                              document: newCntrEvent.document?.trim() || undefined,
                                            };
                                            const updatedUniversities = universities.map((u) =>
                                              u.id === selectedUniversity
                                                ? {
                                                    ...u,
                                                    cntrEventsItems: [...(u.cntrEventsItems || []), newItem],
                                                  }
                                                : u
                                            );
                                            setUniversities(updatedUniversities);
                                            setAddCntrEventDialogOpen(false);
                                            setNewCntrEvent({ date: "", branch: "", description: "", document: "" });
                                          }
                                        }}
                                        disabled={!newCntrEvent.date}
                                      >
                                        Сохранить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              {(() => {
                                const eventItems = university.cntrEventsItems || [];
                                
                                const formatDate = (dateStr: string) => {
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                };
                                
                                const handleEditCntrEvent = (item: CNTREventItem) => {
                                  if (!selectedUniversity) return;
                                  setEditingCntrEvent({ universityId: selectedUniversity, itemId: item.id });
                                  setNewCntrEvent({
                                    date: item.date,
                                    branch: item.branch || "",
                                    description: item.description || "",
                                    document: item.document || "",
                                  });
                                  setEditCntrEventDialogOpen(true);
                                };
                                
                                const handleRemoveCntrEvent = (itemId: string) => {
                                  if (!selectedUniversity) return;
                                  const updatedUniversities = universities.map((u) =>
                                    u.id === selectedUniversity
                                      ? {
                                          ...u,
                                          cntrEventsItems: (u.cntrEventsItems || []).filter((item) => item.id !== itemId),
                                        }
                                      : u
                                  );
                                  setUniversities(updatedUniversities);
                                };
                                
                                return eventItems.length > 0 ? (
                                  <div className="space-y-4">
                                    {eventItems.map((item) => (
                                      <Card key={item.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              {item.branch && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {item.branch}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                              <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                <span className="font-medium">{formatDate(item.date)}</span>
                                              </div>
                                            </div>
                                            {item.description && (
                                              <div className="text-sm">
                                                <span className="text-muted-foreground">Описание:</span>
                                                <p className="mt-1 text-foreground">{item.description}</p>
                                              </div>
                                            )}
                                            {item.document && (
                                              <div className="flex items-start gap-2 md:col-span-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Документ:</span>
                                                <a 
                                                  href={item.document} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-primary hover:underline break-all"
                                                >
                                                  {item.document}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleEditCntrEvent(item)}
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleRemoveCntrEvent(item.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card>
                                    <CardContent className="space-y-6 pt-6">
                                      <div className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Мероприятия</p>
                                        <p className="text-sm">Мероприятия не добавлены</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })()}
                              
                              {/* Диалог редактирования мероприятия */}
                              <Dialog open={editCntrEventDialogOpen} onOpenChange={setEditCntrEventDialogOpen}>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать мероприятие</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-event-date">Дата *</Label>
                                      <Input
                                        id="edit-cntr-event-date"
                                        type="date"
                                        value={newCntrEvent.date}
                                        onChange={(e) => setNewCntrEvent({ ...newCntrEvent, date: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-event-branch">Головной ВУЗ / Филиал</Label>
                                      <Select
                                        value={newCntrEvent.branch}
                                        onValueChange={(value) => setNewCntrEvent({ ...newCntrEvent, branch: value })}
                                      >
                                        <SelectTrigger id="edit-cntr-event-branch">
                                          <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                          {university?.branch?.map((branchName) => (
                                            <SelectItem key={branchName} value={branchName}>
                                              {branchName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-event-description">Описание</Label>
                                      <Textarea
                                        id="edit-cntr-event-description"
                                        placeholder="Введите описание мероприятия..."
                                        value={newCntrEvent.description}
                                        onChange={(e) => setNewCntrEvent({ ...newCntrEvent, description: e.target.value })}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-event-document">Документ (PDF)</Label>
                                      <Input
                                        id="edit-cntr-event-document"
                                        type="text"
                                        placeholder="URL или путь к PDF файлу..."
                                        value={newCntrEvent.document}
                                        onChange={(e) => setNewCntrEvent({ ...newCntrEvent, document: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setEditCntrEventDialogOpen(false);
                                      setEditingCntrEvent(null);
                                      setNewCntrEvent({ date: "", branch: "", description: "", document: "" });
                                    }}>
                                      Отмена
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        if (newCntrEvent.date && selectedUniversity && editingCntrEvent) {
                                          const updatedUniversities = universities.map((u) =>
                                            u.id === selectedUniversity
                                              ? {
                                                  ...u,
                                                  cntrEventsItems: (u.cntrEventsItems || []).map((item) =>
                                                    item.id === editingCntrEvent.itemId
                                                      ? {
                                                          ...item,
                                                          date: newCntrEvent.date,
                                                          branch: newCntrEvent.branch || undefined,
                                                          description: newCntrEvent.description?.trim() || undefined,
                                                          document: newCntrEvent.document?.trim() || undefined,
                                                        }
                                                      : item
                                                  ),
                                                }
                                              : u
                                          );
                                          setUniversities(updatedUniversities);
                                          setEditCntrEventDialogOpen(false);
                                          setNewCntrEvent({ date: "", branch: "", description: "", document: "" });
                                          setEditingCntrEvent(null);
                                        }
                                      }}
                                      disabled={!newCntrEvent.date}
                                    >
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TabsContent>
                            
                            {/* Подвкладка 5: Соглашения о сотрудничестве */}
                            <TabsContent value="agreements" className="space-y-4 mt-0">
                              <Card>
                                <CardContent className="space-y-6 pt-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <Label htmlFor="agreement-switch" className="text-base font-medium">
                                      Соглашение о сотрудничестве
                                    </Label>
                                    <Switch
                                      id="agreement-switch"
                                      checked={university.cntrAgreementEnabled || false}
                                      onCheckedChange={(checked) => {
                                        const updatedUniversities = universities.map((u) =>
                                          u.id === university.id
                                            ? {
                                                ...u,
                                                cntrAgreementEnabled: checked,
                                              }
                                            : u
                                        );
                                        setUniversities(updatedUniversities);
                                      }}
                                    />
                                  </div>
                                  
                                  {university.cntrAgreementEnabled && (
                                    <>
                                      <div className="flex items-center justify-end mb-4">
                                        <Dialog open={addCntrAgreementDialogOpen} onOpenChange={setAddCntrAgreementDialogOpen}>
                                          <DialogTrigger asChild>
                                            <Button variant="default" size="sm" onClick={() => {
                                              setNewCntrAgreement({ date: "", branch: "", status: "", description: "", document: "" });
                                              setEditingCntrAgreement(null);
                                            }}>
                                              <Plus className="mr-2 h-4 w-4" />
                                              Добавить
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                              <DialogTitle>Добавить соглашение о сотрудничестве</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="cntr-agreement-date">Дата *</Label>
                                                <Input
                                                  id="cntr-agreement-date"
                                                  type="date"
                                                  value={newCntrAgreement.date}
                                                  onChange={(e) => setNewCntrAgreement({ ...newCntrAgreement, date: e.target.value })}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="cntr-agreement-branch">Головной ВУЗ / Филиал</Label>
                                                <Select
                                                  value={newCntrAgreement.branch}
                                                  onValueChange={(value) => setNewCntrAgreement({ ...newCntrAgreement, branch: value })}
                                                >
                                                  <SelectTrigger id="cntr-agreement-branch">
                                                    <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                                    {university?.branch?.map((branchName) => (
                                                      <SelectItem key={branchName} value={branchName}>
                                                        {branchName}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="cntr-agreement-status">Статус</Label>
                                                <Select
                                                  value={newCntrAgreement.status}
                                                  onValueChange={(value) => setNewCntrAgreement({ ...newCntrAgreement, status: value })}
                                                >
                                                  <SelectTrigger id="cntr-agreement-status">
                                                    <SelectValue placeholder="Выберите статус" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="in-progress">в процессе</SelectItem>
                                                    <SelectItem value="signed">подписано</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="cntr-agreement-description">Описание</Label>
                                                <Textarea
                                                  id="cntr-agreement-description"
                                                  placeholder="Введите описание соглашения о сотрудничестве..."
                                                  value={newCntrAgreement.description}
                                                  onChange={(e) => setNewCntrAgreement({ ...newCntrAgreement, description: e.target.value })}
                                                  rows={4}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="cntr-agreement-document">Документ (PDF)</Label>
                                                <Input
                                                  id="cntr-agreement-document"
                                                  type="text"
                                                  placeholder="URL или путь к PDF файлу..."
                                                  value={newCntrAgreement.document}
                                                  onChange={(e) => setNewCntrAgreement({ ...newCntrAgreement, document: e.target.value })}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => {
                                                setAddCntrAgreementDialogOpen(false);
                                                setEditingCntrAgreement(null);
                                                setNewCntrAgreement({ date: "", branch: "", status: "", description: "", document: "" });
                                              }}>
                                                Отмена
                                              </Button>
                                              <Button 
                                                onClick={() => {
                                                  if (newCntrAgreement.date && selectedUniversity) {
                                                    const newItem: CNTRAgreementItem = {
                                                      id: `cntr-agreement-${Date.now()}`,
                                                      date: newCntrAgreement.date,
                                                      branch: newCntrAgreement.branch || undefined,
                                                      status: (newCntrAgreement.status as "in-progress" | "signed") || undefined,
                                                      description: newCntrAgreement.description?.trim() || undefined,
                                                      document: newCntrAgreement.document?.trim() || undefined,
                                                    };
                                                    const updatedUniversities = universities.map((u) =>
                                                      u.id === selectedUniversity
                                                        ? {
                                                            ...u,
                                                            cntrAgreementItems: [...(u.cntrAgreementItems || []), newItem],
                                                          }
                                                        : u
                                                    );
                                                    setUniversities(updatedUniversities);
                                                    setAddCntrAgreementDialogOpen(false);
                                                    setNewCntrAgreement({ date: "", branch: "", status: "", description: "", document: "" });
                                                  }
                                                }}
                                                disabled={!newCntrAgreement.date}
                                              >
                                                Сохранить
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                      
                                      {(() => {
                                        const agreementItems = university.cntrAgreementItems || [];
                                        
                                        const formatDate = (dateStr: string) => {
                                          const [year, month, day] = dateStr.split('-').map(Number);
                                          return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                        };
                                        
                                        const formatAgreementStatus = (status?: string) => {
                                          switch (status) {
                                            case "in-progress":
                                              return "в процессе";
                                            case "signed":
                                              return "подписано";
                                            default:
                                              return "";
                                          }
                                        };
                                        
                                        const handleEditCntrAgreement = (item: CNTRAgreementItem) => {
                                          if (!selectedUniversity) return;
                                          setEditingCntrAgreement({ universityId: selectedUniversity, itemId: item.id });
                                          setNewCntrAgreement({
                                            date: item.date,
                                            branch: item.branch || "",
                                            status: item.status || "",
                                            description: item.description || "",
                                            document: item.document || "",
                                          });
                                          setEditCntrAgreementDialogOpen(true);
                                        };
                                        
                                        const handleRemoveCntrAgreement = (itemId: string) => {
                                          if (!selectedUniversity) return;
                                          const updatedUniversities = universities.map((u) =>
                                            u.id === selectedUniversity
                                              ? {
                                                  ...u,
                                                  cntrAgreementItems: (u.cntrAgreementItems || []).filter((item) => item.id !== itemId),
                                                }
                                              : u
                                          );
                                          setUniversities(updatedUniversities);
                                        };
                                        
                                        return agreementItems.length > 0 ? (
                                          <div className="space-y-4">
                                            {agreementItems.map((item) => (
                                              <Card key={item.id} className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                  <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      {item.branch && (
                                                        <Badge variant="secondary" className="text-xs">
                                                          {item.branch}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                      <div className="flex items-start gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                        <span className="font-medium">{formatDate(item.date)}</span>
                                                      </div>
                                                    </div>
                                                    {item.description && (
                                                      <div className="text-sm">
                                                        <span className="text-muted-foreground">Описание:</span>
                                                        <p className="mt-1 text-foreground">{item.description}</p>
                                                      </div>
                                                    )}
                                                    {item.document && (
                                                      <div className="flex items-start gap-2 md:col-span-2 text-sm">
                                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground whitespace-nowrap">Документ:</span>
                                                        <a 
                                                          href={item.document} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer" 
                                                          className="text-primary hover:underline break-all"
                                                        >
                                                          {item.document}
                                                        </a>
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-8 w-8 p-0"
                                                      onClick={() => handleEditCntrAgreement(item)}
                                                    >
                                                      <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-8 w-8 p-0"
                                                      onClick={() => handleRemoveCntrAgreement(item.id)}
                                                    >
                                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </Card>
                                            ))}
                                          </div>
                                        ) : (
                                          <Card>
                                            <CardContent className="space-y-6 pt-6">
                                              <div className="text-center py-12 text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium mb-2">Соглашения о сотрудничестве</p>
                                                <p className="text-sm">Соглашения не добавлены</p>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        );
                                      })()}
                                    </>
                                  )}
                                  
                                  {!university.cntrAgreementEnabled && (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <p className="text-sm">Включите соглашение о сотрудничестве для добавления элементов</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                              
                              {/* Диалог редактирования соглашения о сотрудничестве */}
                              <Dialog open={editCntrAgreementDialogOpen} onOpenChange={setEditCntrAgreementDialogOpen}>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать соглашение о сотрудничестве</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-agreement-date">Дата *</Label>
                                      <Input
                                        id="edit-cntr-agreement-date"
                                        type="date"
                                        value={newCntrAgreement.date}
                                        onChange={(e) => setNewCntrAgreement({ ...newCntrAgreement, date: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-agreement-branch">Головной ВУЗ / Филиал</Label>
                                      <Select
                                        value={newCntrAgreement.branch}
                                        onValueChange={(value) => setNewCntrAgreement({ ...newCntrAgreement, branch: value })}
                                      >
                                        <SelectTrigger id="edit-cntr-agreement-branch">
                                          <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                          {university?.branch?.map((branchName) => (
                                            <SelectItem key={branchName} value={branchName}>
                                              {branchName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-agreement-status">Статус</Label>
                                      <Select
                                        value={newCntrAgreement.status}
                                        onValueChange={(value) => setNewCntrAgreement({ ...newCntrAgreement, status: value })}
                                      >
                                        <SelectTrigger id="edit-cntr-agreement-status">
                                          <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="in-progress">в процессе</SelectItem>
                                          <SelectItem value="signed">подписано</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-agreement-description">Описание</Label>
                                      <Textarea
                                        id="edit-cntr-agreement-description"
                                        placeholder="Введите описание соглашения о сотрудничестве..."
                                        value={newCntrAgreement.description}
                                        onChange={(e) => setNewCntrAgreement({ ...newCntrAgreement, description: e.target.value })}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-agreement-document">Документ (PDF)</Label>
                                      <Input
                                        id="edit-cntr-agreement-document"
                                        type="text"
                                        placeholder="URL или путь к PDF файлу..."
                                        value={newCntrAgreement.document}
                                        onChange={(e) => setNewCntrAgreement({ ...newCntrAgreement, document: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setEditCntrAgreementDialogOpen(false);
                                      setEditingCntrAgreement(null);
                                      setNewCntrAgreement({ date: "", branch: "", status: "", description: "", document: "" });
                                    }}>
                                      Отмена
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        if (newCntrAgreement.date && selectedUniversity && editingCntrAgreement) {
                                          const updatedUniversities = universities.map((u) =>
                                            u.id === selectedUniversity
                                              ? {
                                                  ...u,
                                                  cntrAgreementItems: (u.cntrAgreementItems || []).map((item) =>
                                                    item.id === editingCntrAgreement.itemId
                                                      ? {
                                                          ...item,
                                                          date: newCntrAgreement.date,
                                                          branch: newCntrAgreement.branch || undefined,
                                                          status: (newCntrAgreement.status as "in-progress" | "signed") || undefined,
                                                          description: newCntrAgreement.description?.trim() || undefined,
                                                          document: newCntrAgreement.document?.trim() || undefined,
                                                        }
                                                      : item
                                                  ),
                                                }
                                              : u
                                          );
                                          setUniversities(updatedUniversities);
                                          setEditCntrAgreementDialogOpen(false);
                                          setNewCntrAgreement({ date: "", branch: "", status: "", description: "", document: "" });
                                          setEditingCntrAgreement(null);
                                        }
                                      }}
                                      disabled={!newCntrAgreement.date}
                                    >
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TabsContent>
                            
                            {/* Подвкладка 6: Образовательные проекты */}
                            <TabsContent value="educational" className="space-y-4 mt-0">
                              <div className="flex items-center justify-end mb-4">
                                <Dialog open={addCntrEducationalProjectDialogOpen} onOpenChange={setAddCntrEducationalProjectDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="default" size="sm" onClick={() => {
                                      setNewCntrEducationalProject({ date: "", branch: "", description: "", document: "" });
                                      setEditingCntrEducationalProject(null);
                                    }}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Добавить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Добавить образовательный проект</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-educational-project-date">Дата *</Label>
                                        <Input
                                          id="cntr-educational-project-date"
                                          type="date"
                                          value={newCntrEducationalProject.date}
                                          onChange={(e) => setNewCntrEducationalProject({ ...newCntrEducationalProject, date: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-educational-project-branch">Головной ВУЗ / Филиал</Label>
                                        <Select
                                          value={newCntrEducationalProject.branch}
                                          onValueChange={(value) => setNewCntrEducationalProject({ ...newCntrEducationalProject, branch: value })}
                                        >
                                          <SelectTrigger id="cntr-educational-project-branch">
                                            <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                            {university?.branch?.map((branchName) => (
                                              <SelectItem key={branchName} value={branchName}>
                                                {branchName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-educational-project-description">Описание</Label>
                                        <Textarea
                                          id="cntr-educational-project-description"
                                          placeholder="Введите описание образовательного проекта..."
                                          value={newCntrEducationalProject.description}
                                          onChange={(e) => setNewCntrEducationalProject({ ...newCntrEducationalProject, description: e.target.value })}
                                          rows={4}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cntr-educational-project-document">Документ (PDF)</Label>
                                        <Input
                                          id="cntr-educational-project-document"
                                          type="text"
                                          placeholder="URL или путь к PDF файлу..."
                                          value={newCntrEducationalProject.document}
                                          onChange={(e) => setNewCntrEducationalProject({ ...newCntrEducationalProject, document: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setAddCntrEducationalProjectDialogOpen(false);
                                        setEditingCntrEducationalProject(null);
                                        setNewCntrEducationalProject({ date: "", branch: "", description: "", document: "" });
                                      }}>
                                        Отмена
                                      </Button>
                                      <Button 
                                        onClick={() => {
                                          if (newCntrEducationalProject.date && selectedUniversity) {
                                            const newItem: CNTREducationalProjectItem = {
                                              id: `cntr-educational-project-${Date.now()}`,
                                              date: newCntrEducationalProject.date,
                                              branch: newCntrEducationalProject.branch || undefined,
                                              description: newCntrEducationalProject.description?.trim() || undefined,
                                              document: newCntrEducationalProject.document?.trim() || undefined,
                                            };
                                            const updatedUniversities = universities.map((u) =>
                                              u.id === selectedUniversity
                                                ? {
                                                    ...u,
                                                    cntrEducationalProjectsItems: [...(u.cntrEducationalProjectsItems || []), newItem],
                                                  }
                                                : u
                                            );
                                            setUniversities(updatedUniversities);
                                            setAddCntrEducationalProjectDialogOpen(false);
                                            setNewCntrEducationalProject({ date: "", branch: "", description: "", document: "" });
                                          }
                                        }}
                                        disabled={!newCntrEducationalProject.date}
                                      >
                                        Сохранить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              {(() => {
                                const educationalProjectItems = university.cntrEducationalProjectsItems || [];
                                
                                const formatDate = (dateStr: string) => {
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                                };
                                
                                const handleEditCntrEducationalProject = (item: CNTREducationalProjectItem) => {
                                  if (!selectedUniversity) return;
                                  setEditingCntrEducationalProject({ universityId: selectedUniversity, itemId: item.id });
                                  setNewCntrEducationalProject({
                                    date: item.date,
                                    branch: item.branch || "",
                                    description: item.description || "",
                                    document: item.document || "",
                                  });
                                  setEditCntrEducationalProjectDialogOpen(true);
                                };
                                
                                const handleRemoveCntrEducationalProject = (itemId: string) => {
                                  if (!selectedUniversity) return;
                                  const updatedUniversities = universities.map((u) =>
                                    u.id === selectedUniversity
                                      ? {
                                          ...u,
                                          cntrEducationalProjectsItems: (u.cntrEducationalProjectsItems || []).filter((item) => item.id !== itemId),
                                        }
                                      : u
                                  );
                                  setUniversities(updatedUniversities);
                                };
                                
                                return educationalProjectItems.length > 0 ? (
                                  <div className="space-y-4">
                                    {educationalProjectItems.map((item) => (
                                      <Card key={item.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              {item.branch && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {item.branch}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                              <div className="flex items-start gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Дата:</span>
                                                <span className="font-medium">{formatDate(item.date)}</span>
                                              </div>
                                            </div>
                                            {item.description && (
                                              <div className="text-sm">
                                                <span className="text-muted-foreground">Описание:</span>
                                                <p className="mt-1 text-foreground">{item.description}</p>
                                              </div>
                                            )}
                                            {item.document && (
                                              <div className="flex items-start gap-2 md:col-span-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground whitespace-nowrap">Документ:</span>
                                                <a 
                                                  href={item.document} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="text-primary hover:underline break-all"
                                                >
                                                  {item.document}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleEditCntrEducationalProject(item)}
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => handleRemoveCntrEducationalProject(item.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                          </div>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card>
                                    <CardContent className="space-y-6 pt-6">
                                      <div className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Образовательные проекты</p>
                                        <p className="text-sm">Образовательные проекты не добавлены</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })()}
                              
                              {/* Диалог редактирования образовательного проекта */}
                              <Dialog open={editCntrEducationalProjectDialogOpen} onOpenChange={setEditCntrEducationalProjectDialogOpen}>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Редактировать образовательный проект</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-educational-project-date">Дата *</Label>
                                      <Input
                                        id="edit-cntr-educational-project-date"
                                        type="date"
                                        value={newCntrEducationalProject.date}
                                        onChange={(e) => setNewCntrEducationalProject({ ...newCntrEducationalProject, date: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-educational-project-branch">Головной ВУЗ / Филиал</Label>
                                      <Select
                                        value={newCntrEducationalProject.branch}
                                        onValueChange={(value) => setNewCntrEducationalProject({ ...newCntrEducationalProject, branch: value })}
                                      >
                                        <SelectTrigger id="edit-cntr-educational-project-branch">
                                          <SelectValue placeholder="Выберите ВУЗ/филиал" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Головной ВУЗ">Головной ВУЗ</SelectItem>
                                          {university?.branch?.map((branchName) => (
                                            <SelectItem key={branchName} value={branchName}>
                                              {branchName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-educational-project-description">Описание</Label>
                                      <Textarea
                                        id="edit-cntr-educational-project-description"
                                        placeholder="Введите описание образовательного проекта..."
                                        value={newCntrEducationalProject.description}
                                        onChange={(e) => setNewCntrEducationalProject({ ...newCntrEducationalProject, description: e.target.value })}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-cntr-educational-project-document">Документ (PDF)</Label>
                                      <Input
                                        id="edit-cntr-educational-project-document"
                                        type="text"
                                        placeholder="URL или путь к PDF файлу..."
                                        value={newCntrEducationalProject.document}
                                        onChange={(e) => setNewCntrEducationalProject({ ...newCntrEducationalProject, document: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                      setEditCntrEducationalProjectDialogOpen(false);
                                      setEditingCntrEducationalProject(null);
                                      setNewCntrEducationalProject({ date: "", branch: "", description: "", document: "" });
                                    }}>
                                      Отмена
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        if (newCntrEducationalProject.date && selectedUniversity && editingCntrEducationalProject) {
                                          const updatedUniversities = universities.map((u) =>
                                            u.id === selectedUniversity
                                              ? {
                                                  ...u,
                                                  cntrEducationalProjectsItems: (u.cntrEducationalProjectsItems || []).map((item) =>
                                                    item.id === editingCntrEducationalProject.itemId
                                                      ? {
                                                          ...item,
                                                          date: newCntrEducationalProject.date,
                                                          branch: newCntrEducationalProject.branch || undefined,
                                                          description: newCntrEducationalProject.description?.trim() || undefined,
                                                          document: newCntrEducationalProject.document?.trim() || undefined,
                                                        }
                                                      : item
                                                  ),
                                                }
                                              : u
                                          );
                                          setUniversities(updatedUniversities);
                                          setEditCntrEducationalProjectDialogOpen(false);
                                          setNewCntrEducationalProject({ date: "", branch: "", description: "", document: "" });
                                          setEditingCntrEducationalProject(null);
                                        }
                                      }}
                                      disabled={!newCntrEducationalProject.date}
                                    >
                                      Сохранить
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TabsContent>
                              </div>
                              
                              {/* Навигация справа вертикально */}
                              <div className="w-[280px] shrink-0">
                                <TabsList className="flex flex-col h-auto bg-transparent p-0 py-2 w-full border-l pl-4">
                                  <TabsTrigger 
                                    value="infrastructure" 
                                    className="w-full justify-between items-center whitespace-normal text-left border border-transparent rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                                  >
                                    <span>Развитие научно-технологической инфраструктуры</span>
                                    {university.cntrInfrastructure && university.cntrInfrastructure.length > 0 && (
                                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary border-primary/20">
                                        {university.cntrInfrastructure.length}
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="projects" 
                                    className="w-full justify-between items-center whitespace-normal text-left border border-transparent rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                                  >
                                    <span>Развитие научно-технологических проектов</span>
                                    {university.cntrProjects && university.cntrProjects.length > 0 && (
                                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary border-primary/20">
                                        {university.cntrProjects.length}
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="accelerator" 
                                    className="w-full justify-between items-center whitespace-normal text-left border border-transparent rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                                  >
                                    <span>Участие в акселераторе Газпромбанк Тех. Трек Наука</span>
                                    {university.cntrAcceleratorItems && university.cntrAcceleratorItems.length > 0 && (
                                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary border-primary/20">
                                        {university.cntrAcceleratorItems.length}
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="events" 
                                    className="w-full justify-between items-center whitespace-normal text-left border border-transparent rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                                  >
                                    <span>Мероприятия</span>
                                    {university.cntrEventsItems && university.cntrEventsItems.length > 0 && (
                                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary border-primary/20">
                                        {university.cntrEventsItems.length}
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="agreements" 
                                    className="w-full justify-between items-center whitespace-normal text-left border border-transparent rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                                  >
                                    <span>Соглашения о сотрудничестве</span>
                                    {university.cntrAgreementItems && university.cntrAgreementItems.length > 0 && (
                                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary border-primary/20">
                                        {university.cntrAgreementItems.length}
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="educational" 
                                    className="w-full justify-between items-center whitespace-normal text-left border border-transparent rounded-md data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                                  >
                                    <span>Образовательные проекты</span>
                                    {university.cntrEducationalProjectsItems && university.cntrEducationalProjectsItems.length > 0 && (
                                      <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary border-primary/20">
                                        {university.cntrEducationalProjectsItems.length}
                                      </Badge>
                                    )}
                                  </TabsTrigger>
                                </TabsList>
                              </div>
                            </div>
                          </Tabs>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                );
                })() : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Выберите ВУЗ</h3>
                      <p className="text-muted-foreground">
                        Выберите ВУЗ из списка слева, чтобы просмотреть подробную информацию
                      </p>
                    </CardContent>
                  </Card>
                )}
                              </div>
                            </div>
            )}
          </TabsContent>

          <TabsContent value="internships" className="mt-4 space-y-4 w-full">
            {/* Поиск и фильтры для стажировок */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию стажировки или вузу..."
                  value={internshipSearchQuery}
                  onChange={(e) => setInternshipSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {internshipSearchQuery && (
                                          <Button
                                                    variant="ghost"
                                            size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setInternshipSearchQuery("")}
                                          >
                    <X className="h-4 w-4" />
                                          </Button>
                )}
                                                </div>
              <Dialog open={isInternshipFiltersDialogOpen} onOpenChange={setIsInternshipFiltersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                    {(internshipFilters.statuses.length > 0 || internshipFilters.universities.length > 0) && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                        {internshipFilters.statuses.length + internshipFilters.universities.length}
                      </Badge>
                    )}
                                          </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-3">
                    <DialogTitle className="text-lg">Фильтры</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Статус</Label>
                      <div className="space-y-1.5">
                        {(["planned", "recruiting", "active", "completed"] as InternshipStatus[]).map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-status-${status}`}
                              checked={internshipFilters.statuses.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setInternshipFilters({
                                    ...internshipFilters,
                                    statuses: [...internshipFilters.statuses, status],
                                  });
                                } else {
                                  setInternshipFilters({
                                    ...internshipFilters,
                                    statuses: internshipFilters.statuses.filter((s) => s !== status),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-status-${status}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {getInternshipStatusText(status)}
                                        </Label>
                                        </div>
                        ))}
                                      </div>
                                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">ВУЗ</Label>
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                        {uniqueInternshipUniversities.map((university) => (
                          <div key={university.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-university-${university.id}`}
                              checked={internshipFilters.universities.includes(university.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setInternshipFilters({
                                    ...internshipFilters,
                                    universities: [...internshipFilters.universities, university.id],
                                  });
                                } else {
                                  setInternshipFilters({
                                    ...internshipFilters,
                                    universities: internshipFilters.universities.filter((id) => id !== university.id),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-university-${university.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {university.name}
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
                        setInternshipFilters({ statuses: [], universities: [] });
                      }}
                    >
                      Сбросить
                                          </Button>
                    <Button size="sm" onClick={() => setIsInternshipFiltersDialogOpen(false)}>
                      Применить
                                          </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={handleCreateInternship} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Добавить стажировку
                                </Button>
                              </div>

            {/* Список стажировок */}
            {filteredInternshipsForTab.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Стажировки не найдены</p>
                    <p className="text-muted-foreground mb-4">
                      {internshipSearchQuery || internshipFilters.statuses.length > 0 || internshipFilters.universities.length > 0
                        ? "Попробуйте изменить фильтры"
                        : "Создайте первую стажировку, чтобы начать работу"}
                    </p>
                    {!internshipSearchQuery && internshipFilters.statuses.length === 0 && internshipFilters.universities.length === 0 && (
                      <Button onClick={handleCreateInternship} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить стажировку
                                          </Button>
                    )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {filteredInternshipsForTab
                  .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                  .map((internship) => (
                        <Card 
                          key={internship.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md h-[280px] flex flex-col overflow-hidden",
                            selectedInternship?.id === internship.id && "ring-2 ring-primary"
                          )}
                          onClick={() => {
                            router.push(`/services/universities/internship/${internship.id}`);
                          }}
                        >
                          <CardHeader className="pb-3 flex-shrink-0 overflow-hidden">
                            <div className="flex items-start justify-between gap-2 min-w-0">
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <CardTitle className="text-base mb-1.5 line-clamp-2 leading-tight break-words">{internship.title}</CardTitle>
                                <CardDescription className="text-xs mt-1.5 space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Building2 className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{internship.universityName}</span>
                                      </div>
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{internship.startDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} - {internship.endDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                                    </div>
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <Badge variant="outline" className={cn(getInternshipStatusColor(internship.status), "text-xs px-2 py-0.5 whitespace-nowrap")}>
                                  {getInternshipStatusText(internship.status)}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
                            <div className="flex-1 min-h-0 overflow-hidden">
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed break-words">
                                {internship.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs px-2 py-0.5 whitespace-nowrap">
                                  {internship.location === 'remote' ? 'Удаленно' : 
                                   internship.location === 'office' ? 'Офис' : 'Гибридно'}
                                </Badge>
                                {internship.city && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 whitespace-nowrap">
                                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                    <span className="truncate max-w-[80px]">{internship.city}</span>
                                  </Badge>
                )}
              </div>
                              {internship.salary && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 mt-2 whitespace-nowrap">
                                  {internship.salary.toLocaleString('ru-RU')} ₽
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 space-y-1.5 flex-shrink-0">
                              <div className="flex items-center justify-between text-xs text-muted-foreground min-w-0">
                                <span className="flex items-center gap-1.5 min-w-0 truncate">
                                  <Users className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{internship.currentParticipants} / {internship.maxParticipants}</span>
                                </span>
                              </div>
                              <Progress 
                                value={(internship.currentParticipants / internship.maxParticipants) * 100} 
                                className="h-1.5 w-full"
                              />
                                <Button
                                  variant="outline"
                                  size="sm"
                                className="w-full mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/services/universities/internship/${internship.id}`);
                                }}
                              >
                                Подробнее
                                <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
            </div>
          )}
          </TabsContent>

          <TabsContent value="reporting" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Отчетность</CardTitle>
                <CardDescription>
                  Раздел для работы с отчетами по ВУЗам и стажировкам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Отчетность</p>
                  <p className="text-sm">Раздел находится в разработке</p>
              </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Дэшборд</CardTitle>
                <CardDescription>
                  Аналитика и статистика по ВУЗам и стажировкам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Дэшборд</p>
                  <p className="text-sm">Раздел находится в разработке</p>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

          {/* Модальное окно создания ВУЗа */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setCreateType(null);
          setEditingUniversity(null);
          setUniversityFormData({
                name: "",
            shortName: "",
            inn: "",
            city: "",
            branch: [] as string[],
            cooperationStartYear: new Date().getFullYear(),
            cooperationLine: [] as CooperationLine[],
            cooperationLineYear: new Date().getFullYear(),
            cooperationLineResponsible: [] as string[],
            cooperationLines: [] as CooperationLineRecord[],
            targetAudience: "",
            initiatorBlock: "",
            initiatorName: "",
            branchCurators: [],
            contracts: [],
            allEmployees: 0,
            internHiring: false,
            averageInternsPerYear: 0,
            interns: 0,
            region: "",
                description: "",
              });
          setNewCurator({ city: "", branch: "" });
          setNewCuratorForUniversity({ city: "", branch: "", cooperationLines: [] });
          setNewContract({ type: "cooperation", hasContract: false, contractFile: "" });
            }
          }}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
              {editingUniversity
                ? "Редактировать ВУЗ"
                : "Добавить ВУЗ"}
                </DialogTitle>
                <DialogDescription>
              {editingUniversity
                ? "Внесите изменения в ВУЗ"
                : "Заполните информацию о ВУЗе"}
                </DialogDescription>
              </DialogHeader>
          {createType === "university" ? (
                <div className="space-y-6 py-4">
                  {/* Содержимое формы */}
                  <div className="min-h-[400px]">
                    <div className="space-y-6">
                        {/* Основная информация */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-base font-semibold">Основная информация</Label>
                        </div>
                  <div className="space-y-2">
                    <Label htmlFor="university-name">
                              Наименование учебного заведения <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="university-name"
                      value={universityFormData.name}
                      onChange={(e) => setUniversityFormData({ ...universityFormData, name: e.target.value })}
                      placeholder="Московский государственный университет"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university-short-name">Сокращенное наименование</Label>
                      <Input
                        id="university-short-name"
                        value={universityFormData.shortName}
                        onChange={(e) => setUniversityFormData({ ...universityFormData, shortName: e.target.value })}
                        placeholder="МГУ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university-inn">ИНН</Label>
                      <Input
                        id="university-inn"
                        value={universityFormData.inn}
                        onChange={(e) => setUniversityFormData({ ...universityFormData, inn: e.target.value })}
                        placeholder="7707083893"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university-city">
                        Город <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="university-city"
                        value={universityFormData.city}
                        onChange={(e) => setUniversityFormData({ ...universityFormData, city: e.target.value })}
                        placeholder="Москва"
                      />
                    </div>
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-audience">Целевая аудитория</Label>
                      <Input
                        id="target-audience"
                        value={universityFormData.targetAudience}
                        onChange={(e) => setUniversityFormData({ ...universityFormData, targetAudience: e.target.value })}
                        placeholder="Студенты IT-направлений"
                      />
                    </div>
                        </div>
                      </div>
                  </div>

                  {/* Навигация */}
                  <div className="flex items-center justify-end gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} size="sm">
                      Отмена
                    </Button>
                    <Button 
                      onClick={handleCreateUniversity}
                      disabled={
                        !universityFormData.name.trim() ||
                        !universityFormData.city.trim()
                      }
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {editingUniversity ? "Сохранить изменения" : "Добавить ВУЗ"}
                    </Button>
                </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          {/* Модальное окно добавления/редактирования мероприятия */}
          <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
            setIsEventDialogOpen(open);
            if (!open) {
              setEditingEvent(null);
              setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: [] });
            }
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent && editingEvent.universityId === selectedUniversity ? "Редактировать мероприятие" : "Добавить мероприятие"}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent && editingEvent.universityId === selectedUniversity 
                    ? "Внесите изменения в мероприятие" 
                    : "Заполните информацию о мероприятии"}
                </DialogDescription>
              </DialogHeader>
                <div className="space-y-4 py-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="event-type-dialog">Тип мероприятия</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Выберите тип мероприятия: дни карьеры, экспертное участие, кейс-чемпионат, встреча или коммуникация</p>
                        </TooltipContent>
                      </Tooltip>
                  </div>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, type: value as "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication" })}
                    >
                      <SelectTrigger id="event-type-dialog" className="w-full">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="careerDays">Дни карьеры</SelectItem>
                        <SelectItem value="expertParticipation">Экспертное участие</SelectItem>
                        <SelectItem value="caseChampionships">Кейс-чемпионат</SelectItem>
                        <SelectItem value="meeting">Встреча</SelectItem>
                        <SelectItem value="communication">Коммуникация</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="event-date-dialog">Дата начала</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Укажите дату начала проведения мероприятия</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="event-date-dialog"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="event-end-date-dialog">Дата окончания</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Укажите дату окончания проведения мероприятия</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="event-end-date-dialog"
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="event-status-dialog">Статус</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Выберите статус мероприятия: запланировано, в процессе или проведено</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                      <Select
                      value={newEvent.status}
                      onValueChange={(value) => setNewEvent({ ...newEvent, status: value as "planned" | "in_progress" | "completed" })}
                      >
                      <SelectTrigger id="event-status-dialog" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Запланировано</SelectItem>
                          <SelectItem value="in_progress">В процессе</SelectItem>
                        <SelectItem value="completed">Проведено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="event-responsible-dialog">Ответственное лицо Банк</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Выберите сотрудников Банка, ответственных за проведение мероприятия</p>
                        </TooltipContent>
                      </Tooltip>
                  </div>
                      <MultiSelect
                        options={responsiblePersons.map(p => ({ value: p.value, label: p.label }))}
                        selected={newEvent.responsiblePerson}
                        onChange={(selected) => setNewEvent({ ...newEvent, responsiblePerson: selected })}
                        placeholder="Выберите ответственное лицо"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="event-comments-dialog">Комментарий</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Дополнительная информация о мероприятии (необязательное поле)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                      <Input
                    id="event-comments-dialog"
                    value={newEvent.comments}
                    onChange={(e) => setNewEvent({ ...newEvent, comments: e.target.value })}
                    placeholder="Комментарий"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEventDialogOpen(false);
                    setEditingEvent(null);
                    setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: [] });
                  }}
                >
                  Отмена
                    </Button>
                {editingEvent && editingEvent.universityId === selectedUniversity ? (
                    <Button 
                    onClick={() => {
                      handleSaveEvent();
                    }}
                    disabled={!newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || newEvent.responsiblePerson.length === 0}
                  >
                    Сохранить
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (selectedUniversity) {
                        handleAddEvent(selectedUniversity);
                      }
                    }}
                    disabled={!newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || newEvent.responsiblePerson.length === 0 || !selectedUniversity}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                    </Button>
              )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Модальное окно добавления/редактирования договора */}
          <Dialog open={isContractDialogOpen} onOpenChange={(open) => {
            setIsContractDialogOpen(open);
            if (!open) {
              setEditingContract(null);
              setNewContractForTab({ type: "cooperation", hasContract: false, contractFile: "", number: "", date: "", period: { start: "", end: "" }, asddLink: "", contractBranch: "" });
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContract && editingContract.universityId === selectedUniversity ? "Редактировать договор" : "Добавить договор"}
                </DialogTitle>
                <DialogDescription>
                  {editingContract && editingContract.universityId === selectedUniversity 
                    ? "Внесите изменения в договор" 
                    : "Заполните информацию о договоре"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                    <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="contract-type">Тип договора</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Выберите тип договора: о сотрудничестве, об именных стипендиях, о практике или кафедра банка</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={newContractForTab.type}
                    onValueChange={(value) => setNewContractForTab({ ...newContractForTab, type: value as Contract["type"] })}
                  >
                    <SelectTrigger id="contract-type">
                      <SelectValue placeholder="Выберите тип договора" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cooperation">О сотрудничестве</SelectItem>
                      <SelectItem value="scholarship">Об именных стипендиях</SelectItem>
                      <SelectItem value="internship">О практике</SelectItem>
                      <SelectItem value="bankDepartment">Кафедра банка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-number">Номер</Label>
                  <Input
                    id="contract-number"
                    placeholder="Введите номер договора"
                    value={newContractForTab.number}
                    onChange={(e) => setNewContractForTab({ ...newContractForTab, number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-date">Дата</Label>
                  <Input
                    id="contract-date"
                    type="date"
                    value={newContractForTab.date}
                    onChange={(e) => setNewContractForTab({ ...newContractForTab, date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-period-start">Период действия (начало)</Label>
                    <Input
                      id="contract-period-start"
                      type="date"
                      value={newContractForTab.period.start}
                      onChange={(e) => setNewContractForTab({ ...newContractForTab, period: { ...newContractForTab.period, start: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract-period-end">Период действия (конец)</Label>
                    <Input
                      id="contract-period-end"
                      type="date"
                      value={newContractForTab.period.end}
                      onChange={(e) => setNewContractForTab({ ...newContractForTab, period: { ...newContractForTab.period, end: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-asdd-link">Ссылка на АСДД</Label>
                  <Input
                    id="contract-asdd-link"
                    type="url"
                    placeholder="Введите ссылку на АСДД"
                    value={newContractForTab.asddLink}
                    onChange={(e) => setNewContractForTab({ ...newContractForTab, asddLink: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-branch">Головной офис / Филиал</Label>
                  <Select
                    value={newContractForTab.contractBranch}
                    onValueChange={(value) => setNewContractForTab({ ...newContractForTab, contractBranch: value })}
                  >
                    <SelectTrigger id="contract-branch">
                      <SelectValue placeholder="Выберите головной офис или филиал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Головной офис">Головной офис</SelectItem>
                      {selectedUniversity && (() => {
                        const university = universities.find(u => u.id === selectedUniversity);
                        const branches = university?.branchCurators || [];
                        return branches.length > 0 ? (
                          branches.map((curator) => (
                            <SelectItem key={curator.id} value={curator.branch}>
                              {curator.branch}
                            </SelectItem>
                          ))
                        ) : null;
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="contract-file">Договор (файл)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Загрузите файл договора в формате PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                      <Input
                    id="contract-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewContractForTab({ ...newContractForTab, contractFile: file.name });
                      }
                    }}
                  />
                    </div>
                      </div>
                  <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsContractDialogOpen(false);
                    setEditingContract(null);
                    setNewContractForTab({ type: "cooperation", hasContract: false, contractFile: "", number: "", date: "", period: { start: "", end: "" }, asddLink: "", contractBranch: "" });
                  }}
                >
                  Отмена
                    </Button>
                {editingContract && editingContract.universityId === selectedUniversity ? (
                    <Button 
                    onClick={handleSaveContractForTab}
                  >
                    Сохранить
                    </Button>
                ) : (
                  <Button
                    onClick={() => selectedUniversity && handleAddContractForTab(selectedUniversity)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Диалог удаления ВУЗа */}
          <AlertDialog open={deleteUniversityId !== null} onOpenChange={(open) => !open && setDeleteUniversityId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  {(() => {
                    const university = universities.find(u => u.id === deleteUniversityId);
                    return `Вы уверены, что хотите удалить ВУЗ "${university?.name}"? Это действие нельзя отменить.`;
                  })()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUniversity}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Диалог истории изменений университета */}
          {/* Модальное окно для добавления филиала */}
          <Dialog open={isBranchDialogOpen} onOpenChange={(open) => {
            setIsBranchDialogOpen(open);
            if (!open) {
              setNewCuratorForUniversity({ city: "", branch: "", cooperationLines: [] });
            }
          }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить филиал</DialogTitle>
                <DialogDescription>
                  Заполните информацию о филиале
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-curator-city">Город</Label>
                    <Input
                      id="dialog-curator-city"
                      placeholder="Москва"
                      value={newCuratorForUniversity.city}
                      onChange={(e) => setNewCuratorForUniversity({ ...newCuratorForUniversity, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-curator-branch">Филиал</Label>
                    <Input
                      id="dialog-curator-branch"
                      placeholder="Московский филиал"
                      value={newCuratorForUniversity.branch}
                      onChange={(e) => setNewCuratorForUniversity({ ...newCuratorForUniversity, branch: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBranchDialogOpen(false);
                    setNewCuratorForUniversity({ city: "", branch: "", cooperationLines: [] });
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUniversity) {
                      handleAddCuratorForUniversity(selectedUniversity);
                      setIsBranchDialogOpen(false);
                    }
                  }}
                  disabled={!newCuratorForUniversity.city.trim() || !newCuratorForUniversity.branch.trim() || !selectedUniversity}
                >
                  Добавить филиал
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Модальное окно для добавления/редактирования линии сотрудничества в филиале */}
          <Dialog open={isCooperationLineDialogOpen} onOpenChange={(open) => {
            setIsCooperationLineDialogOpen(open);
            if (!open) {
              setSelectedBranchId(null);
              setEditingCooperationLine(null);
              setNewCooperationLineForBranch({
                id: `clr-${Date.now()}`,
                line: "drp",
                year: new Date().getFullYear(),
                responsible: [],
              });
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCooperationLine ? "Редактировать линию сотрудничества" : "Добавить линию сотрудничества"}
                </DialogTitle>
                <DialogDescription>
                  {editingCooperationLine ? "Внесите изменения в линию сотрудничества для филиала" : "Заполните информацию о линии сотрудничества для филиала"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Линия сотрудничества</Label>
                  <Select
                    value={newCooperationLineForBranch.line}
                    onValueChange={(value) => setNewCooperationLineForBranch({ ...newCooperationLineForBranch, line: value as CooperationLine })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cooperationLines.map((line) => (
                        <SelectItem key={line.value} value={line.value}>
                          {line.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Год начала</Label>
                    <Input
                      type="number"
                      value={newCooperationLineForBranch.year}
                      onChange={(e) => setNewCooperationLineForBranch({ ...newCooperationLineForBranch, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      placeholder={String(new Date().getFullYear())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ответственное лицо</Label>
                    <MultiSelect
                      options={responsiblePersons.map(p => ({ value: p.value, label: p.label }))}
                      selected={newCooperationLineForBranch.responsible}
                      onChange={(selected) => setNewCooperationLineForBranch({ ...newCooperationLineForBranch, responsible: selected })}
                      placeholder="Выберите ответственное лицо"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCooperationLineDialogOpen(false);
                    setSelectedBranchId(null);
                    setEditingCooperationLine(null);
                    setNewCooperationLineForBranch({
                      id: `clr-${Date.now()}`,
                      line: "drp",
                      year: new Date().getFullYear(),
                      responsible: [],
                    });
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (selectedBranchId && selectedUniversity) {
                      if (editingCooperationLine) {
                        handleSaveCooperationLineInBranch();
                      } else {
                        handleAddCooperationLineToBranch(selectedUniversity, selectedBranchId);
                      }
                    }
                  }}
                >
                  {editingCooperationLine ? "Сохранить изменения" : "Добавить линию"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Модальное окно для добавления/редактирования линии сотрудничества головного ВУЗа */}
          <Dialog open={isMainCooperationLineDialogOpen} onOpenChange={(open) => {
            setIsMainCooperationLineDialogOpen(open);
            if (!open) {
              setEditingMainCooperationLine(null);
              setNewCooperationLineForMain({
                id: `clr-${Date.now()}`,
                line: "drp",
                year: new Date().getFullYear(),
                responsible: [],
              });
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMainCooperationLine ? "Редактировать линию сотрудничества" : "Добавить линию сотрудничества"}
                </DialogTitle>
                <DialogDescription>
                  {editingMainCooperationLine ? "Внесите изменения в линию сотрудничества для головного ВУЗа" : "Заполните информацию о линии сотрудничества для головного ВУЗа"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Линия сотрудничества</Label>
                  <Select
                    value={newCooperationLineForMain.line}
                    onValueChange={(value) => setNewCooperationLineForMain({ ...newCooperationLineForMain, line: value as CooperationLine })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cooperationLines.map((line) => (
                        <SelectItem key={line.value} value={line.value}>
                          {line.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Год начала</Label>
                    <Input
                      type="number"
                      value={newCooperationLineForMain.year}
                      onChange={(e) => setNewCooperationLineForMain({ ...newCooperationLineForMain, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      placeholder={String(new Date().getFullYear())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ответственное лицо</Label>
                    <MultiSelect
                      options={responsiblePersons.map(p => ({ value: p.value, label: p.label }))}
                      selected={newCooperationLineForMain.responsible}
                      onChange={(selected) => setNewCooperationLineForMain({ ...newCooperationLineForMain, responsible: selected })}
                      placeholder="Выберите ответственное лицо"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMainCooperationLineDialogOpen(false);
                    setEditingMainCooperationLine(null);
                    setNewCooperationLineForMain({
                      id: `clr-${Date.now()}`,
                      line: "drp",
                      year: new Date().getFullYear(),
                      responsible: [],
                    });
                  }}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUniversity) {
                      if (editingMainCooperationLine) {
                        handleSaveCooperationLineInMain();
                      } else {
                        handleAddCooperationLineToMain(selectedUniversity);
                      }
                    }
                  }}
                  disabled={!selectedUniversity}
                >
                  {editingMainCooperationLine ? "Сохранить изменения" : "Добавить линию"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={universityHistoryDialogOpen} onOpenChange={setUniversityHistoryDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>История изменений</DialogTitle>
                <DialogDescription>
                  {(() => {
                    const university = universities.find(u => u.id === selectedUniversityForHistory);
                    return `Подробная история изменений для "${university?.name || 'ВУЗа'}"`;
                  })()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedUniversityForHistory && (() => {
                  const history = getUniversityChangeHistory(selectedUniversityForHistory);
                  const formatDate = (date: Date) => {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${day}.${month}.${year} ${hours}:${minutes}`;
                  };
                  
                  const getActionText = (action: ChangeHistory['action']) => {
                    switch (action) {
                      case "created":
                        return "Создан";
                      case "updated":
                        return "Изменен";
                      case "deleted":
                        return "Удален";
                      case "status_changed":
                        return "Изменен статус";
                      case "student_added":
                        return "Добавлен студент";
                      case "student_removed":
                        return "Удален студент";
                      default:
                        return action;
                    }
                  };
                  
                  const getFieldName = (field?: string) => {
                    if (!field) return "";
                    const fieldNames: Record<string, string> = {
                      name: "Название",
                      shortName: "Краткое название",
                      city: "Город",
                      branch: "Филиал",
                      cooperationStartYear: "Год начала сотрудничества",
                      cooperationLine: "Линия сотрудничества",
                      cooperationLineYear: "Год по линии",
                      cooperationLineResponsible: "Ответственное лицо по линии",
                      targetAudience: "Целевая аудитория",
                      initiatorBlock: "Инициатор (блок)",
                      initiatorName: "Инициатор (ФИО)",
                      region: "Регион",
                      description: "Описание",
                      image: "Логотип",
                    };
                    return fieldNames[field] || field;
                  };
                  
                  return history.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      История изменений отсутствует
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getActionText(item.action)}
                                </Badge>
                                {item.field && (
                                  <span className="text-sm text-muted-foreground">
                                    Поле: {getFieldName(item.field)}
                                  </span>
                                )}
                              </div>
                              {item.field && item.oldValue !== undefined && item.newValue !== undefined && (
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Было:</span>
                                    <span className="line-through text-red-600 dark:text-red-400">{item.oldValue || "(пусто)"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Стало:</span>
                                    <span className="text-green-600 dark:text-green-400">{item.newValue || "(пусто)"}</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{item.user}</span>
                                <Clock className="h-3 w-3 ml-2" />
                                <span>{formatDate(item.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <DialogFooter>
                <Button onClick={() => setUniversityHistoryDialogOpen(false)}>Закрыть</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Диалог удаления партнерства - удален */}
          {/* <AlertDialog open={deletePartnershipId !== null} onOpenChange={(open) => !open && setDeletePartnershipId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  {(() => {
                    if (!deletePartnershipId) return "";
                    const university = universities.find(u => u.id === deletePartnershipId.universityId);
                    const partnership = university?.partnerships.find(p => p.id === deletePartnershipId.partnershipId);
                    if (partnership?.students && partnership.students.length > 0) {
                      return `Партнерство "${partnership.name}" содержит ${partnership.students.length} студентов. Удаление невозможно. Сначала удалите всех студентов.`;
                    }
                    return `Вы уверены, что хотите удалить партнерство "${partnership?.name}"? Это действие нельзя отменить.`;
                  })()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePartnership}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={(() => {
                    if (!deletePartnershipId) return false;
                    const university = universities.find(u => u.id === deletePartnershipId.universityId);
                    const partnership = university?.partnerships.find(p => p.id === deletePartnershipId.partnershipId);
                    return partnership?.students && partnership.students.length > 0 ? true : false;
                  })()}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          {/* Диалог фильтров */}
          <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Фильтры и сортировка</DialogTitle>
                <DialogDescription>
                  Настройте фильтры для поиска ВУЗов
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Город</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все города</SelectItem>
                      {uniqueCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {uniqueRegions.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Регион</Label>
                      <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите регион" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все регионы</SelectItem>
                          {uniqueRegions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label>Линии сотрудничества</Label>
                  <MultiSelect
                    options={cooperationLines.map(line => ({ value: line.value, label: line.label }))}
                    selected={cooperationLineFilter}
                    onChange={setCooperationLineFilter}
                    placeholder="Выберите линии сотрудничества"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Сортировка</Label>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Сортировать по" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">По названию</SelectItem>
                        <SelectItem value="city">По городу</SelectItem>
                        {uniqueRegions.length > 0 && (
                          <SelectItem value="region">По региону</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      title={sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
                    >
                      {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCityFilter("all");
                    setRegionFilter("all");
                    setCooperationLineFilter([]);
                    setSortBy("name");
                    setSortOrder("asc");
                  }}
                >
                  Сбросить фильтры
                </Button>
                <Button onClick={() => setIsFiltersDialogOpen(false)}>
                  Применить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


      {/* Диалоги для стажировок */}
      {/* Диалог создания/редактирования стажировки */}
      <Dialog open={isInternshipCreateDialogOpen} onOpenChange={setIsInternshipCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInternship ? "Редактировать стажировку" : "Добавить стажировку"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о стажировке
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internship-title">Название стажировки *</Label>
              <Input
                  id="internship-title"
                  value={internshipFormData.title}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: Frontend разработка на React"
              />
            </div>
              <div className="space-y-2">
                <Label htmlFor="internship-university">ВУЗ *</Label>
                <Select 
                  value={internshipFormData.universityId} 
                  onValueChange={(v) => setInternshipFormData(prev => ({ ...prev, universityId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ВУЗ" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueInternshipUniversities.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internship-description">Описание *</Label>
              <Textarea
                id="internship-description"
                value={internshipFormData.description}
                onChange={(e) => setInternshipFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Подробное описание стажировки..."
                rows={4}
              />
                  </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internship-startDate">Дата начала *</Label>
                <Input
                  id="internship-startDate"
                  type="date"
                  value={internshipFormData.startDate}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
                </div>
              <div className="space-y-2">
                <Label htmlFor="internship-endDate">Дата окончания *</Label>
                <Input
                  id="internship-endDate"
                  type="date"
                  value={internshipFormData.endDate}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internship-deadline">Дедлайн заявок *</Label>
                <Input
                  id="internship-deadline"
                  type="date"
                  value={internshipFormData.applicationDeadline}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internship-maxParticipants">Максимум участников *</Label>
                <Input
                  id="internship-maxParticipants"
                  type="number"
                  min="1"
                  value={internshipFormData.maxParticipants}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internship-status">Статус</Label>
                <Select 
                  value={internshipFormData.status} 
                  onValueChange={(v) => setInternshipFormData(prev => ({ ...prev, status: v as InternshipStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">План</SelectItem>
                    <SelectItem value="recruiting">Набор</SelectItem>
                    <SelectItem value="active">Активна</SelectItem>
                    <SelectItem value="completed">Завершена</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="internship-location">Формат</Label>
                <Select 
                  value={internshipFormData.location} 
                  onValueChange={(v) => setInternshipFormData(prev => ({ ...prev, location: v as "remote" | "office" | "hybrid" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Удаленно</SelectItem>
                    <SelectItem value="office">Офис</SelectItem>
                    <SelectItem value="hybrid">Гибридно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internship-city">Город</Label>
                <Input
                  id="internship-city"
                  value={internshipFormData.city}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Москва"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internship-salary">Зарплата (₽)</Label>
                <Input
                  id="internship-salary"
                  type="number"
                  value={internshipFormData.salary}
                  onChange={(e) => setInternshipFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="30000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internship-mentor">Наставник</Label>
              <Select 
                value={internshipFormData.mentorId} 
                onValueChange={(v) => setInternshipFormData(prev => ({ ...prev, mentorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите наставника" />
                </SelectTrigger>
                <SelectContent>
                  {mockMentors.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.fullName} - {m.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInternshipCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveInternship}>
              {editingInternship ? "Сохранить изменения" : "Добавить стажировку"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог деталей стажировки с заявками */}
      <Dialog open={isInternshipDetailsDialogOpen} onOpenChange={setIsInternshipDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedInternship?.title}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInternshipStatisticsDialogOpen(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Статистика
                </Button>
                <Badge variant="outline" className={cn(selectedInternship && getInternshipStatusColor(selectedInternship.status))}>
                  {selectedInternship && getInternshipStatusText(selectedInternship.status)}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedInternship?.universityName} • {selectedInternship?.startDate.toLocaleDateString('ru-RU')} - {selectedInternship?.endDate.toLocaleDateString('ru-RU')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInternship && (
            <Tabs defaultValue="applications" className="w-full">
              <TabsList variant="grid3">
                <TabsTrigger value="applications">
                  Заявки ({currentInternshipApplications.length})
                </TabsTrigger>
                <TabsTrigger value="students">
                  Студенты ({currentInternshipApplications.filter(a => ['confirmed', 'active', 'completed'].includes(a.status)).length})
                </TabsTrigger>
                <TabsTrigger value="details">Детали</TabsTrigger>
            </TabsList>
            
              <TabsContent value="applications" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      На рассмотрении: {currentInternshipApplications.filter(a => a.status === 'pending').length}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                      Одобрено: {currentInternshipApplications.filter(a => a.status === 'approved').length}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                      Подтверждено: {currentInternshipApplications.filter(a => a.status === 'confirmed').length}
                    </Badge>
                </div>
                </div>
                
                <div className="rounded-md border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold text-base text-foreground">Студент</TableHead>
                        <TableHead className="font-bold text-base text-foreground">ВУЗ</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Курс</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Релевантность</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Статус</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Дата подачи</TableHead>
                        <TableHead className="text-right font-bold text-base text-foreground">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInternshipApplications
                        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                        .map((application) => {
                          const student = internshipStudents.find(s => s.id === application.studentId);
                          return (
                            <TableRow key={application.id}>
                              <TableCell className="break-words whitespace-normal">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarFallback>
                                      {application.studentName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-medium break-words">{application.studentName}</div>
                                    <div className="text-xs text-muted-foreground break-words">{application.studentEmail}</div>
                </div>
                    </div>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">{application.universityName}</TableCell>
                              <TableCell className="break-words whitespace-normal">{application.course} курс</TableCell>
                              <TableCell className="break-words whitespace-normal">
                                <div className="flex items-center gap-2">
                                  <Progress value={application.matchScore || 0} className="w-20 h-2" />
                                  <span className="text-sm font-medium">{application.matchScore || 0}%</span>
                </div>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">
                                <Badge variant="outline" className={cn(getInternshipStatusColor(application.status), "whitespace-nowrap")}>
                                  {getInternshipStatusText(application.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">
                                {application.appliedAt.toLocaleDateString('ru-RU')}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                  <Button
                                    variant="ghost"
                                    size="sm"
                    onClick={() => {
                                      setSelectedInternshipApplication(application);
                                      setIsInternshipApplicationDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                  </Button>
                                  {application.status === 'pending' && (
                                    <>
                  <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600 hover:text-green-700"
                                        onClick={() => handleApproveInternshipApplication(application.id)}
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                    onClick={() => {
                                          const reason = prompt('Причина отклонения:');
                                          if (reason) {
                                            handleRejectInternshipApplication(application.id, reason);
                                          }
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                  </Button>
                                    </>
                                  )}
                                  {application.status === 'approved' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleConfirmInternshipApplication(application.id)}
                                    >
                                      <UserCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {(application.status === 'active' || application.status === 'confirmed') && selectedInternship?.status === 'active' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEvaluationApplicationId(application.id);
                                        setIsEvaluationDialogOpen(true);
                                      }}
                                      title="Оценить студента"
                                    >
                                      <Star className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
              </div>
            </TabsContent>
            
              <TabsContent value="students" className="mt-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                      Подтверждено: {currentInternshipApplications.filter(a => a.status === 'confirmed').length}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">
                      Активно: {currentInternshipApplications.filter(a => a.status === 'active').length}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                      Завершено: {currentInternshipApplications.filter(a => a.status === 'completed').length}
                    </Badge>
                  </div>
                </div>
                
                <div className="rounded-md border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold text-base text-foreground">Студент</TableHead>
                        <TableHead className="font-bold text-base text-foreground">ВУЗ</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Курс</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Средний балл</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Релевантность</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Статус</TableHead>
                        <TableHead className="font-bold text-base text-foreground">Дата подтверждения</TableHead>
                        <TableHead className="text-right font-bold text-base text-foreground">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInternshipApplications
                        .filter(a => ['confirmed', 'active', 'completed'].includes(a.status))
                        .sort((a, b) => {
                          const statusOrder = { 'active': 0, 'confirmed': 1, 'completed': 2 };
                          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
                        })
                        .map((application) => {
                          const student = internshipStudents.find(s => s.id === application.studentId);
                          return (
                            <TableRow key={application.id}>
                              <TableCell className="break-words whitespace-normal">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarFallback>
                                      {application.studentName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-medium break-words">{application.studentName}</div>
                                    <div className="text-xs text-muted-foreground break-words">{application.studentEmail}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">{application.universityName}</TableCell>
                              <TableCell className="break-words whitespace-normal">{application.course} курс</TableCell>
                              <TableCell className="break-words whitespace-normal">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{application.gpa}</span>
                                </div>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">
                                <div className="flex items-center gap-2">
                                  <Progress value={application.matchScore || 0} className="w-20 h-2" />
                                  <span className="text-sm font-medium">{application.matchScore || 0}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">
                                <Badge variant="outline" className={cn(getInternshipStatusColor(application.status), "whitespace-nowrap")}>
                                  {application.status === 'confirmed' ? 'Подтверждено' :
                                   application.status === 'active' ? 'Активно' :
                                   application.status === 'completed' ? 'Завершено' : application.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="break-words whitespace-normal">
                                {application.confirmedAt 
                                  ? application.confirmedAt.toLocaleDateString('ru-RU')
                                  : application.appliedAt.toLocaleDateString('ru-RU')}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInternshipApplication(application);
                                      setIsInternshipApplicationDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {(application.status === 'active' || application.status === 'confirmed') && selectedInternship?.status === 'active' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEvaluationApplicationId(application.id);
                                        setIsEvaluationDialogOpen(true);
                                      }}
                                      title="Оценить студента"
                                    >
                                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {currentInternshipApplications.filter(a => ['confirmed', 'active', 'completed'].includes(a.status)).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Нет студентов, участвующих в стажировке
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Описание</Label>
                        <p className="text-sm">{selectedInternship.description}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Формат</Label>
                        <p className="text-sm">
                          {selectedInternship.location === 'remote' ? 'Удаленно' : 
                           selectedInternship.location === 'office' ? 'Офис' : 'Гибридно'}
                          </p>
                        </div>
                      {selectedInternship.city && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Город</Label>
                          <p className="text-sm">{selectedInternship.city}</p>
                        </div>
                      )}
                      {selectedInternship.salary && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Зарплата</Label>
                          <p className="text-sm">{selectedInternship.salary.toLocaleString('ru-RU')} ₽</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Участники</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Текущее количество</span>
                          <span className="font-medium">{selectedInternship.currentParticipants} / {selectedInternship.maxParticipants}</span>
                        </div>
                        <Progress 
                          value={(selectedInternship.currentParticipants / selectedInternship.maxParticipants) * 100} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог деталей заявки стажировки */}
      <Dialog open={isInternshipApplicationDialogOpen} onOpenChange={setIsInternshipApplicationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заявка студента</DialogTitle>
            <DialogDescription>
              {selectedInternshipApplication?.studentName} • {selectedInternshipApplication?.universityName}
            </DialogDescription>
          </DialogHeader>
          {selectedInternshipApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Курс</Label>
                  <p className="text-sm font-medium">{selectedInternshipApplication.course} курс</p>
                                  </div>
                {selectedInternshipApplication.gpa && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Средний балл</Label>
                    <p className="text-sm font-medium">{selectedInternshipApplication.gpa}</p>
                  </div>
                )}
              </div>
              {selectedInternshipApplication.matchScore !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Релевантность</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedInternshipApplication.matchScore} className="flex-1" />
                    <span className="text-sm font-medium">{selectedInternshipApplication.matchScore}%</span>
                  </div>
                </div>
              )}
              {selectedInternshipApplication.motivationLetter && (
                <div>
                  <Label className="text-xs text-muted-foreground">Мотивационное письмо</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {selectedInternshipApplication.motivationLetter}
                                  </p>
                                </div>
              )}
              {selectedInternshipApplication.rejectionReason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Причина отклонения</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-300">
                    {selectedInternshipApplication.rejectionReason}
                  </p>
                                </div>
              )}
                              </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInternshipApplicationDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог статистики стажировки */}
      <Dialog open={isInternshipStatisticsDialogOpen} onOpenChange={setIsInternshipStatisticsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Статистика стажировки</DialogTitle>
            <DialogDescription>
              {selectedInternship?.title}
            </DialogDescription>
          </DialogHeader>
          {internshipStatistics && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.totalApplications}</div>
                    <div className="text-xs text-muted-foreground">Всего заявок</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{internshipStatistics.approvedApplications}</div>
                    <div className="text-xs text-muted-foreground">Одобрено</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{internshipStatistics.confirmedApplications}</div>
                    <div className="text-xs text-muted-foreground">Подтверждено</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.averageMatchScore}%</div>
                    <div className="text-xs text-muted-foreground">Средняя релевантность</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Конверсия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Заявки → Одобрено</span>
                    <span className="font-medium">{internshipStatistics.conversionRate.applicationsToApproved}%</span>
                                </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Одобрено → Подтверждено</span>
                    <span className="font-medium">{internshipStatistics.conversionRate.approvedToConfirmed}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Подтверждено → Завершено</span>
                    <span className="font-medium">{internshipStatistics.conversionRate.confirmedToCompleted}%</span>
                  </div>
                </CardContent>
              </Card>

              {internshipStatistics.topUniversities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Топ ВУЗы по заявкам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {internshipStatistics.topUniversities.map((univ, idx) => (
                        <div key={univ.universityId} className="flex items-center justify-between">
                          <span className="text-sm">
                            {idx + 1}. {univ.universityName}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{univ.applicationsCount} заявок</Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                              {univ.approvedCount} одобрено
                                    </Badge>
                                </div>
                              </div>
                      ))}
                            </div>
                          </CardContent>
                        </Card>
              )}
                </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInternshipStatisticsDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления стажировки */}
      <AlertDialog open={!!deleteInternshipId} onOpenChange={() => setDeleteInternshipId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить стажировку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Стажировка и все связанные заявки будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInternshipConfirm} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог оценки студента */}
      {evaluationApplicationId && (
        <EvaluationDialog
          open={isEvaluationDialogOpen}
          onOpenChange={setIsEvaluationDialogOpen}
          applicationId={evaluationApplicationId}
          studentName={internshipApplications.find(a => a.id === evaluationApplicationId)?.studentName || ''}
          internshipTitle={selectedInternship?.title || ''}
          onSubmit={handleSaveInternshipEvaluation}
          existingEvaluation={evaluations.find(e => 
            e.applicationId === evaluationApplicationId && 
            e.period === 'final'
          ) || undefined}
        />
      )}
    </div>
  );
}

