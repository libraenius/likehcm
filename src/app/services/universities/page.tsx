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
import { GraduationCap, ClipboardCheck, Users, Settings, ExternalLink, FileText, Calendar, Link2, Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, X, ChevronLeft, ChevronsLeft, ChevronsRight, AlertCircle, Mail, Send, CheckCircle2, Clock, MapPin, Building2, Archive, ArchiveRestore, Filter, SortAsc, SortDesc, BarChart3, MessageSquare, History, FileText as FileTextIcon, Edit3, Copy, Tag, Eye, EyeOff, Star, UserCheck, User, ArrowRight, HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EvaluationDialog } from "@/components/internships/evaluation-dialog";
import { getStatusBadgeColor } from "@/lib/badge-colors";
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
  curatorName: string;
  image?: string;
}

// Тип для договора
interface Contract {
  id: string;
  type: "cooperation" | "scholarship" | "internship";
  hasContract: boolean;
  contractFile?: string; // URL или путь к файлу
  bankDepartment?: string;
}

// Тип для мероприятия
interface Event {
  id: string;
  type: "careerDays" | "expertParticipation" | "caseChampionships"; // Тип мероприятия
  date: string; // Дата начала проведения
  endDate: string; // Дата окончания проведения
  status: "planned" | "completed"; // Статус мероприятия
  comments?: string; // Комментарии
  responsiblePerson: string; // Ответственное лицо Банк
  responsiblePersonImage?: string; // Фото ответственного лица
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
  internshipInBank: boolean; // Стажировка в банке: да/нет
  internshipStartDate?: string; // Дата начала стажировки в банке (формат YYYY-MM-DD)
  internshipEndDate?: string; // Дата окончания стажировки в банке (формат YYYY-MM-DD)
}

// Тип для университета
interface University {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  branch?: string[]; // Филиалы в ГПБ
  cooperationStartYear?: number;
  targetAudience?: string;
  initiatorBlock?: string; // Инициатор сотрудничества (блок/ССП)
  initiatorName?: string; // Инициатор сотрудничества (ФИО)
  initiatorImage?: string; // Фото инициатора
  branchCurators?: BranchCurator[]; // Кураторы от филиалов
  contracts?: Contract[]; // Договоры
  events?: Event[]; // Мероприятия
  careerDays?: boolean; // Дни карьеры
  expertParticipation?: boolean; // Экспертное участие
  caseChampionships?: boolean; // Кейс-чемпионаты
  allEmployees?: number; // Все сотрудники
  internHiring?: boolean; // Найм стажеров
  averageInternsPerYear?: number; // Среднее количество стажеров в год
  interns?: number; // Практиканты
  internList?: Intern[]; // Список стажеров
  region?: string;
  description?: string;
  image?: string; // Фото/логотип ВУЗа
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

// Шаги для создания университета
const UNIVERSITY_STEPS = [
  { id: 1, title: "Общая информация", description: "Основные данные об учебном заведении и сотрудничестве" },
  { id: 2, title: "Договорная база", description: "Договоры и документы сотрудничества" },
];

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
    city: "Москва",
    branch: "Московский филиал",
    cooperationStartYear: 2020,
    targetAudience: "Студенты IT-направлений",
    initiatorBlock: "Блок развития",
    initiatorName: "Иванов Иван Иванович",
    initiatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { id: "cur-1", city: "Москва", branch: "Московский филиал", curatorName: "Петров Петр Петрович" },
    ],
    contracts: [
      { id: "cont-1", type: "cooperation", hasContract: true, bankDepartment: "Кафедра IT", contractFile: "contract-mgu-2020.pdf" },
      { id: "cont-2", type: "internship", hasContract: true, bankDepartment: "Кафедра разработки", contractFile: "contract-mgu-internship.pdf" },
    ],
    events: [
      {
        id: "event-mgu-1",
        type: "careerDays",
        date: "2024-02-10",
        endDate: "2024-02-12",
        status: "completed",
        responsiblePerson: "Смирнов Андрей Викторович",
        responsiblePersonImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        comments: "Дни карьеры для студентов факультета вычислительной математики и кибернетики.",
      },
      {
        id: "event-mgu-2",
        type: "expertParticipation",
        date: "2024-06-15",
        endDate: "2024-06-15",
        status: "completed",
        responsiblePerson: "Кузнецова Елена Сергеевна",
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
    city: "Санкт-Петербург",
    branch: ["Санкт-Петербургский филиал"],
    cooperationStartYear: 2019,
    targetAudience: "Студенты экономических направлений",
    initiatorBlock: "Блок управления",
    initiatorName: "Смирнова Анна Владимировна",
    initiatorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { id: "cur-2", city: "Санкт-Петербург", branch: "Санкт-Петербургский филиал", curatorName: "Козлов Дмитрий Сергеевич" },
      { id: "cur-3", city: "Санкт-Петербург", branch: "Центральный офис", curatorName: "Новикова Елена Петровна" },
    ],
    contracts: [
      { id: "cont-3", type: "cooperation", hasContract: true, bankDepartment: "Кафедра экономики" },
      { id: "cont-4", type: "scholarship", hasContract: true, bankDepartment: "Кафедра финансов", contractFile: "contract-spbgu-scholarship.pdf" },
    ],
    events: [
      {
        id: "event-spbgu-1",
        type: "careerDays",
        date: "2024-03-20",
        endDate: "2024-03-22",
        status: "completed",
        responsiblePerson: "Орлов Дмитрий Александрович",
        responsiblePersonImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        comments: "Дни карьеры для студентов экономического факультета СПбГУ.",
      },
      {
        id: "event-spbgu-2",
        type: "caseChampionships",
        date: "2024-05-25",
        endDate: "2024-05-27",
        status: "completed",
        responsiblePerson: "Белова Мария Игоревна",
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
    city: "Долгопрудный",
    branch: ["Московский филиал"],
    cooperationStartYear: 2021,
    targetAudience: "Студенты технических направлений",
    initiatorBlock: "Блок технологий",
    initiatorName: "Соколов Алексей Николаевич",
    branchCurators: [
      { id: "cur-4", city: "Долгопрудный", branch: "Московский филиал", curatorName: "Волков Михаил Игоревич" },
    ],
    contracts: [
      { id: "cont-5", type: "cooperation", hasContract: true, bankDepartment: "Кафедра разработки" },
      { id: "cont-6", type: "internship", hasContract: true, bankDepartment: "Кафедра IT", contractFile: "contract-mfti-internship.pdf" },
    ],
    events: [
      {
        id: "event-mfti-1",
        type: "expertParticipation",
        date: "2024-04-05",
        endDate: "2024-04-05",
        status: "completed",
        responsiblePerson: "Григорьев Павел Сергеевич",
        responsiblePersonImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        comments: "Участие в качестве эксперта на конференции по машинному обучению.",
      },
      {
        id: "event-mfti-2",
        type: "caseChampionships",
        date: "2024-06-01",
        endDate: "2024-06-03",
        status: "completed",
        responsiblePerson: "Тихонов Игорь Владимирович",
        responsiblePersonImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
        comments: "Кейс-чемпионат по разработке финансовых алгоритмов.",
      },
      {
        id: "event-mfti-3",
        type: "expertParticipation",
        date: "2024-11-10",
        endDate: "2024-11-10",
        status: "planned",
        responsiblePerson: "Соколова Анна Дмитриевна",
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
    city: "Москва",
    branch: ["Московский филиал", "Центральный офис"],
    cooperationStartYear: 2018,
    targetAudience: "Студенты экономики, менеджмента и IT",
    initiatorBlock: "Блок стратегии",
    initiatorName: "Морозова Ольга Александровна",
    branchCurators: [
      { id: "cur-5", city: "Москва", branch: "Московский филиал", curatorName: "Лебедев Сергей Викторович" },
      { id: "cur-6", city: "Москва", branch: "Центральный офис", curatorName: "Федорова Мария Дмитриевна" },
    ],
    contracts: [
      { id: "cont-7", type: "cooperation", hasContract: true, bankDepartment: "Кафедра экономики", contractFile: "contract-hse-2018.pdf" },
      { id: "cont-8", type: "scholarship", hasContract: true, bankDepartment: "Кафедра финансов" },
      { id: "cont-9", type: "internship", hasContract: true, bankDepartment: "Кафедра IT" },
    ],
    events: [
      {
        id: "event-hse-1",
        type: "careerDays",
        date: "2024-03-15",
        endDate: "2024-03-17",
        status: "completed",
        responsiblePerson: "Иванов Иван Иванович",
        responsiblePersonImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        comments: "Проведены дни карьеры для студентов экономического факультета. Участвовало более 150 студентов.",
      },
      {
        id: "event-hse-2",
        type: "expertParticipation",
        date: "2024-04-20",
        endDate: "2024-04-20",
        status: "completed",
        responsiblePerson: "Петрова Мария Сергеевна",
        responsiblePersonImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        comments: "Участие в качестве эксперта на защите дипломных работ по направлению 'Финансы и кредит'.",
      },
      {
        id: "event-hse-3",
        type: "caseChampionships",
        date: "2024-05-10",
        endDate: "2024-05-12",
        status: "completed",
        responsiblePerson: "Сидоров Алексей Дмитриевич",
        responsiblePersonImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        comments: "Кейс-чемпионат по банковскому делу. Победила команда студентов 3 курса.",
      },
      {
        id: "event-hse-4",
        type: "careerDays",
        date: "2024-09-25",
        endDate: "2024-09-27",
        status: "planned",
        responsiblePerson: "Козлова Елена Владимировна",
        responsiblePersonImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        comments: "Запланированы дни карьеры для студентов IT-направления. Ожидается участие 200+ студентов.",
      },
      {
        id: "event-hse-5",
        type: "expertParticipation",
        date: "2024-10-15",
        endDate: "2024-10-15",
        status: "planned",
        responsiblePerson: "Волков Дмитрий Николаевич",
        responsiblePersonImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        comments: "Планируется участие в качестве эксперта на конференции по финансовым технологиям.",
      },
      {
        id: "event-hse-6",
        type: "caseChampionships",
        date: "2024-11-20",
        endDate: "2024-11-22",
        status: "planned",
        responsiblePerson: "Новикова Анна Петровна",
        responsiblePersonImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        comments: "Организация кейс-чемпионата по управлению рисками в банковской сфере.",
      },
      {
        id: "event-hse-7",
        type: "careerDays",
        date: "2024-12-05",
        endDate: "2024-12-07",
        status: "planned",
        responsiblePerson: "Морозов Сергей Александрович",
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
      const startDate = new Date("2022-01-01");
      const endDate = new Date("2024-12-31");
      
      for (let i = 1; i <= 100; i++) {
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
        
        interns.push({
          id: `intern-hse-${i}`,
          employeeName: fullName,
          age,
          position,
          department,
          hireDate,
          status,
          dismissalDate,
          internshipInBank,
          internshipStartDate,
          internshipEndDate,
        });
      }
      
      return interns;
    })(),
    region: "Московская область",
    description: "Ведущий экономический и IT-университет",
    image: "https://www.hse.ru//images/main/main_logo_ru_full.svg",
  },
  {
    id: "univ-5",
    name: "Уральский федеральный университет имени первого Президента России Б.Н. Ельцина",
    shortName: "УрФУ",
    city: "Екатеринбург",
    branch: ["Уральский филиал"],
    cooperationStartYear: 2022,
    targetAudience: "Студенты IT и инженерии",
    initiatorBlock: "Блок развития",
    initiatorName: "Тихонов Андрей Борисович",
    branchCurators: [
      { id: "cur-7", city: "Екатеринбург", branch: "Уральский филиал", curatorName: "Семенова Ирина Алексеевна" },
    ],
    contracts: [
      { id: "cont-10", type: "cooperation", hasContract: true, bankDepartment: "Кафедра разработки", contractFile: "contract-urfu-2022.pdf" },
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
    city: "Новосибирск",
    branch: ["Сибирский филиал"],
    cooperationStartYear: 2021,
    targetAudience: "Студенты математики и IT",
    initiatorBlock: "Блок технологий",
    initiatorName: "Павлов Денис Олегович",
    branchCurators: [
      { id: "cur-8", city: "Новосибирск", branch: "Сибирский филиал", curatorName: "Орлова Татьяна Сергеевна" },
    ],
    contracts: [
      { id: "cont-11", type: "cooperation", hasContract: true, bankDepartment: "Кафедра математики" },
      { id: "cont-12", type: "internship", hasContract: true, bankDepartment: "Кафедра IT", contractFile: "contract-ngu-internship.pdf" },
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
    city: "Казань",
    branch: ["Приволжский филиал"],
    cooperationStartYear: 2020,
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Гарифуллин Рамиль Фаритович",
    branchCurators: [
      { id: "cur-9", city: "Казань", branch: "Приволжский филиал", curatorName: "Хабибуллина Алина Рашидовна", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
    ],
    contracts: [
      { id: "cont-13", type: "cooperation", hasContract: true, bankDepartment: "Кафедра IT", contractFile: "contract-kfu-2020.pdf" },
      { id: "cont-14", type: "scholarship", hasContract: true, bankDepartment: "Кафедра экономики" },
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
    city: "Томск",
    branch: ["Сибирский филиал"],
    cooperationStartYear: 2019,
    targetAudience: "Студенты IT и математики",
    initiatorBlock: "Блок технологий",
    initiatorName: "Кузнецов Владимир Петрович",
    branchCurators: [
      { id: "cur-10", city: "Томск", branch: "Сибирский филиал", curatorName: "Иванова Светлана Николаевна" },
    ],
    contracts: [
      { id: "cont-15", type: "cooperation", hasContract: true, bankDepartment: "Кафедра разработки" },
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
    city: "Санкт-Петербург",
    branch: ["Санкт-Петербургский филиал", "Центральный офис"],
    cooperationStartYear: 2021,
    targetAudience: "Студенты инженерии и IT",
    initiatorBlock: "Блок технологий",
    initiatorName: "Романов Павел Андреевич",
    branchCurators: [
      { id: "cur-11", city: "Санкт-Петербург", branch: "Санкт-Петербургский филиал", curatorName: "Соколова Екатерина Викторовна" },
      { id: "cur-12", city: "Санкт-Петербург", branch: "Центральный офис", curatorName: "Медведев Игорь Сергеевич" },
    ],
    contracts: [
      { id: "cont-16", type: "cooperation", hasContract: true, bankDepartment: "Кафедра инженерии", contractFile: "contract-spbpu-2021.pdf" },
      { id: "cont-17", type: "internship", hasContract: true, bankDepartment: "Кафедра IT" },
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
    city: "Москва",
    branch: ["Московский филиал"],
    cooperationStartYear: 2020,
    targetAudience: "Студенты IT, экономики и менеджмента",
    initiatorBlock: "Блок стратегии",
    initiatorName: "Алиева Зарина Магомедовна",
    branchCurators: [
      { id: "cur-13", city: "Москва", branch: "Московский филиал", curatorName: "Ким Дмитрий Владимирович" },
    ],
    contracts: [
      { id: "cont-18", type: "cooperation", hasContract: true, bankDepartment: "Кафедра IT", contractFile: "contract-rudn-2020.pdf" },
      { id: "cont-19", type: "scholarship", hasContract: true, bankDepartment: "Кафедра экономики" },
      { id: "cont-20", type: "internship", hasContract: true, bankDepartment: "Кафедра разработки" },
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
    city: "Ростов-на-Дону",
    branch: ["Южный филиал"],
    cooperationStartYear: 2022,
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Петренко Виктор Иванович",
    branchCurators: [
      { id: "cur-14", city: "Ростов-на-Дону", branch: "Южный филиал", curatorName: "Мельникова Оксана Анатольевна" },
    ],
    contracts: [
      { id: "cont-21", type: "cooperation", hasContract: true, bankDepartment: "Кафедра IT" },
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
    city: "Владивосток",
    branch: ["Дальневосточный филиал"],
    cooperationStartYear: 2023,
    targetAudience: "Студенты IT и инженерии",
    initiatorBlock: "Блок технологий",
    initiatorName: "Ким Александр Сергеевич",
    branchCurators: [
      { id: "cur-15", city: "Владивосток", branch: "Дальневосточный филиал", curatorName: "Ли Елена Викторовна" },
    ],
    contracts: [
      { id: "cont-22", type: "cooperation", hasContract: true, bankDepartment: "Кафедра разработки", contractFile: "contract-dvfu-2023.pdf" },
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
    targetAudience: "Студенты IT и экономики",
    initiatorBlock: "Блок развития",
    initiatorName: "Степанова Наталья Михайловна",
    initiatorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    branchCurators: [
      { id: "cur-16", city: "Белгород", branch: "Центральный филиал", curatorName: "Григорьев Андрей Валерьевич" },
    ],
    contracts: [
      { id: "cont-23", type: "cooperation", hasContract: true, bankDepartment: "Кафедра IT" },
      { id: "cont-24", type: "internship", hasContract: true, bankDepartment: "Кафедра разработки" },
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
  const [universityDetailTab, setUniversityDetailTab] = useState<"general" | "contracts" | "events" | "staff">("general");
  const [staffSubTab, setStaffSubTab] = useState<"interns" | "practitioners">("interns");
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
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"university" | null>(null);
  const [universityWizardStep, setUniversityWizardStep] = useState(1);
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
    internshipInBank: "all",
  });
  
  // Состояние для формы создания университета
  const [universityFormData, setUniversityFormData] = useState({
    // Шаг 1: Общая информация
    name: "",
    shortName: "",
    city: "",
    branch: [] as string[],
    cooperationStartYear: new Date().getFullYear(),
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
  
  // Состояние для добавления куратора
  const [newCurator, setNewCurator] = useState({
    city: "",
    branch: [] as string[],
    curatorName: "",
  });
  
  // Состояние для добавления договора
  const [newContract, setNewContract] = useState({
    type: "cooperation" as Contract["type"],
    hasContract: false,
    contractFile: "",
    bankDepartment: "",
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
  const [newEvent, setNewEvent] = useState<{
    type: "careerDays" | "expertParticipation" | "caseChampionships" | "";
    date: string;
    endDate: string;
    status: "planned" | "completed";
    comments: string;
    responsiblePerson: string;
  }>({
    type: "",
    date: "",
    endDate: "",
    status: "planned",
    comments: "",
    responsiblePerson: "",
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "city">("name");
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
  const [activeTab, setActiveTab] = useState<"internships" | "universities">("universities");
  
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
  
  // Открытие диалога создания ВУЗа
  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    setCreateType("university");
    setUniversityWizardStep(1);
    setEditingUniversity(null);
    setUniversityFormData({
      name: "",
      shortName: "",
      city: "",
      branch: [] as string[],
      cooperationStartYear: new Date().getFullYear(),
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
    setNewCurator({ city: "", branch: "", curatorName: "" });
    setNewContract({ type: "cooperation", hasContract: false, contractFile: "", bankDepartment: "" });
  };
  
  // Создание или обновление ВУЗа
  const handleCreateUniversity = () => {
    if (!universityFormData.name.trim() || !universityFormData.city.trim()) {
      return;
    }
    
    if (editingUniversity) {
      // Редактирование существующего ВУЗа
      const updatedUniversity: University = {
        ...editingUniversity,
        name: universityFormData.name.trim(),
        shortName: universityFormData.shortName.trim() || undefined,
        city: universityFormData.city.trim(),
        branch: universityFormData.branch.length > 0 ? universityFormData.branch : undefined,
        cooperationStartYear: universityFormData.cooperationStartYear || undefined,
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
      city: universityFormData.city.trim(),
        branch: universityFormData.branch.length > 0 ? universityFormData.branch : undefined,
        cooperationStartYear: universityFormData.cooperationStartYear || undefined,
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
    setUniversityWizardStep(1);
    setEditingUniversity(null);
    setUniversityFormData({
      name: "",
      shortName: "",
      city: "",
      branch: [] as string[],
      cooperationStartYear: new Date().getFullYear(),
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
    setNewCurator({ city: "", branch: "", curatorName: "" });
    setNewContract({ type: "cooperation", hasContract: false, contractFile: "", bankDepartment: "" });
  };
  
  // Добавление куратора
  const handleAddCurator = () => {
    if (!newCurator.city.trim() || !newCurator.branch.trim() || !newCurator.curatorName.trim()) {
      return;
    }
    const curator: BranchCurator = {
      id: `curator-${Date.now()}`,
      city: newCurator.city.trim(),
      branch: newCurator.branch.trim(),
      curatorName: newCurator.curatorName.trim(),
    };
    setUniversityFormData({
      ...universityFormData,
      branchCurators: [...universityFormData.branchCurators, curator],
    });
    setNewCurator({ city: "", branch: "", curatorName: "" });
  };
  
  // Удаление куратора
  const handleRemoveCurator = (id: string) => {
    setUniversityFormData({
      ...universityFormData,
      branchCurators: universityFormData.branchCurators.filter(c => c.id !== id),
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
      bankDepartment: newContract.bankDepartment.trim() || undefined,
    };
    setUniversityFormData({
      ...universityFormData,
      contracts: [...universityFormData.contracts, contract],
    });
    setNewContract({ type: "cooperation", hasContract: false, contractFile: "", bankDepartment: "" });
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
    if (!newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || !newEvent.responsiblePerson.trim()) {
      return;
    }
    const event: Event = {
      id: `event-${Date.now()}`,
      type: newEvent.type as "careerDays" | "expertParticipation" | "caseChampionships",
      date: newEvent.date,
      endDate: newEvent.endDate,
      status: newEvent.status,
      comments: newEvent.comments.trim() || undefined,
      responsiblePerson: newEvent.responsiblePerson.trim(),
    };
    const university = universities.find(u => u.id === universityId);
    if (university) {
      const updatedEvents = [...(university.events || []), event];
      setUniversities(universities.map(u => 
        u.id === universityId ? { ...u, events: updatedEvents } : u
      ));
      setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: "" });
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
    if (!editingEvent || !newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || !newEvent.responsiblePerson.trim()) {
      return;
    }
    const updatedEvents = universities
      .find(u => u.id === editingEvent.universityId)
      ?.events?.map(e => 
        e.id === editingEvent.event.id 
          ? { ...e, type: newEvent.type as "careerDays" | "expertParticipation" | "caseChampionships", date: newEvent.date, endDate: newEvent.endDate, status: newEvent.status, comments: newEvent.comments.trim() || undefined, responsiblePerson: newEvent.responsiblePerson.trim() }
          : e
      ) || [];
    setUniversities(universities.map(u => 
      u.id === editingEvent.universityId ? { ...u, events: updatedEvents } : u
    ));
    setEditingEvent(null);
    setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: "" });
    setIsEventDialogOpen(false);
  };
  
  // Подсчет статистики мероприятий
  const getEventStatistics = (universityId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (!university || !university.events) {
          return {
        byType: { careerDays: 0, expertParticipation: 0, caseChampionships: 0 },
        byStatus: { planned: 0, completed: 0 },
        total: 0,
      };
    }
    const byType = {
      careerDays: university.events.filter(e => e.type === "careerDays").length,
      expertParticipation: university.events.filter(e => e.type === "expertParticipation").length,
      caseChampionships: university.events.filter(e => e.type === "caseChampionships").length,
    };
    const byStatus = {
      planned: university.events.filter(e => e.status === "planned").length,
      completed: university.events.filter(e => e.status === "completed").length,
    };
    return {
      byType,
      byStatus,
      total: university.events.length,
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
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [universities, searchQuery, statusFilter, typeFilter, cityFilter, sortBy, sortOrder, showArchived]);
  
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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "universities" | "internships")} className="w-full">
          <TabsList variant="grid2">
            <TabsTrigger value="universities">ВУЗы</TabsTrigger>
            <TabsTrigger value="internships">Стажировки</TabsTrigger>
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
              {(statusFilter !== "all" || typeFilter !== "all" || cityFilter !== "all" || showArchived) && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {[
                    statusFilter !== "all" ? 1 : 0,
                    typeFilter !== "all" ? 1 : 0,
                    cityFilter !== "all" ? 1 : 0,
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
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {university.shortName}
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
                            <Avatar className="h-16 w-16 flex-shrink-0">
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
                                city: university.city,
                                branch: university.branch || [],
                                cooperationStartYear: university.cooperationStartYear || new Date().getFullYear(),
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
                              setUniversityWizardStep(1);
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
                    <CardContent className="pt-0 overflow-x-hidden">
                      <Tabs value={universityDetailTab} onValueChange={(v) => setUniversityDetailTab(v as typeof universityDetailTab)} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="general">Общая информация</TabsTrigger>
                          <TabsTrigger value="contracts">Договорная база</TabsTrigger>
                          <TabsTrigger value="events">Мероприятия</TabsTrigger>
                          <TabsTrigger value="staff">Кадровые показатели</TabsTrigger>
                        </TabsList>
                        
                        {/* Таб 1: Общая информация */}
                        <TabsContent value="general" className="space-y-4 mt-4">
                          {/* Основная информация */}
                          <Card className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-base font-semibold">Основная информация</Label>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                                  <Label className="text-sm font-semibold">Город</Label>
                          <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{university.city || "Не указано"}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                                  <Label className="text-sm font-semibold">Филиалы в ГПБ</Label>
                                  {university.branch && university.branch.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {university.branch.map((branch, index) => (
                                        <Badge key={index} variant="outline" className="text-sm">
                                          {branch}
                          </Badge>
                                      ))}
                        </div>
                                  ) : (
                                    <span className="text-sm font-medium text-muted-foreground">Не указано</span>
                                  )}
                                </div>
                                {university.cooperationStartYear && (
                        <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Год начала сотрудничества</Label>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">{university.cooperationStartYear}</span>
                        </div>
                                  </div>
                                )}
                                {university.targetAudience && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Целевая аудитория</Label>
                                    <span className="text-sm font-medium">{university.targetAudience}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>

                          {/* Инициаторы сотрудничества Банк */}
                          {(university.initiatorBlock || university.initiatorName) && (
                            <Card className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-base font-semibold">Инициаторы сотрудничества Банк</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  {university.initiatorBlock && (
                        <div className="space-y-2">
                                      <Label className="text-sm font-semibold">Блок/ССП</Label>
                                      <span className="text-sm font-medium">{university.initiatorBlock}</span>
                        </div>
                                  )}
                                  {university.initiatorName && (
                                    <div className="space-y-2">
                                      <Label className="text-sm font-semibold">ФИО</Label>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 shrink-0">
                                          <AvatarImage src={university.initiatorImage} alt={university.initiatorName} />
                                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                            {university.initiatorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{university.initiatorName}</span>
                        </div>
                        </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* Филиалы ВУЗа */}
                          {university.branchCurators && university.branchCurators.length > 0 && (
                            <Card className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-base font-semibold">Филиалы ВУЗа</Label>
                                </div>
                                <div className="space-y-3">
                                  {university.branchCurators.map((curator) => (
                                    <Card key={curator.id} className="p-3 bg-muted/30">
                                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                                          <Label className="text-sm font-semibold">Город - Филиал</Label>
                              <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{curator.city} - {curator.branch}</span>
                          </div>
                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-semibold">Куратор</Label>
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 shrink-0">
                                              <AvatarImage src={curator.image} alt={curator.curatorName} />
                                              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                {curator.curatorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{curator.curatorName}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          )}
                        </TabsContent>

                        {/* Таб 2: Договорная база */}
                        <TabsContent value="contracts" className="space-y-4 mt-4">
                          {university.contracts && university.contracts.length > 0 ? (
                        <div className="space-y-3">
                              {university.contracts.map((contract) => (
                                <Card key={contract.id} className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-sm">
                                        {contract.type === "cooperation" ? "О сотрудничестве" :
                                         contract.type === "scholarship" ? "Об именных стипендиях" :
                                         "О практике"}
                                      </Badge>
                            </div>
                                    {contract.bankDepartment && (
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Кафедра Банка</Label>
                                        <p className="text-sm">{contract.bankDepartment}</p>
                          </div>
                                    )}
                                    {contract.contractFile && (
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Договор</Label>
                              <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <a href={contract.contractFile} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                            {contract.contractFile}
                                </a>
                              </div>
                            </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Договоры не добавлены</p>
                            </div>
                          )}
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
                                    <Card className="p-3 flex-1">
                            <div className="space-y-2">
                                        <Label className="text-base font-semibold">Типы мероприятий</Label>
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
                                        </div>
                                      </div>
                                    </Card>
                                    <Card className="p-3 flex-1">
                                      <div className="space-y-2">
                                        <Label className="text-base font-semibold">Статусы</Label>
                                                <div className="flex items-center gap-3">
                                          <div className="text-base">
                                            <span className="text-muted-foreground">Запланировано: </span>
                                            <Badge 
                                              variant="outline" 
                                              className={`cursor-pointer ${eventFilters.status === "planned" ? "ring-2 ring-primary" : ""}`}
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
                                            <span className="text-muted-foreground">Проведено: </span>
                                            <Badge 
                                              variant="default" 
                                              className={`cursor-pointer ${eventFilters.status === "completed" ? "ring-2 ring-primary" : ""}`}
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
                                  setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: "" });
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
                                  };
                                  const eventStatusLabels: Record<Event["status"], string> = {
                                    planned: "Запланировано",
                                    completed: "Проведено",
                                  };
                                  const getEventTypeBadgeVariant = (type: Event["type"]) => {
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
                                            <Badge variant={event.status === "completed" ? "default" : "outline"}>
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
                                            <div className="flex items-center gap-2">
                                                  <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarImage src={event.responsiblePersonImage} alt={event.responsiblePerson} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                  {event.responsiblePerson.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                  </Avatar>
                                              <span className="text-sm font-medium">{event.responsiblePerson}</span>
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
                                      <div className="text-sm text-muted-foreground">
                                        Найдено: <span className="font-semibold text-foreground">{filteredInterns.length}</span> {filteredInterns.length === 1 ? 'сотрудник' : filteredInterns.length > 1 && filteredInterns.length < 5 ? 'сотрудника' : 'сотрудников'}
                                        {filteredInterns.length !== university.internList.length && (
                                          <span className="ml-1">из {university.internList.length}</span>
                                        )}
                                      </div>
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
                                        <TableHead className="w-[80px]">Возраст</TableHead>
                                      <TableHead className="w-[290px]">Должность / Подразделение</TableHead>
                                        <TableHead className="w-[120px]">Дата приема на работу</TableHead>
                                        <TableHead className="w-[120px]">Статус</TableHead>
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
                                            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                          };
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
                                              <TableCell className="px-4 whitespace-normal">
                                                {intern.age} лет
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
                                        <TableHead className="w-[100px]">Возраст</TableHead>
                                        <TableHead className="w-[260px]">Должность / Подразделение</TableHead>
                                        <TableHead className="w-[120px]">Дата приема на работу</TableHead>
                                        <TableHead className="w-[120px]">Статус</TableHead>
                                        <TableHead className="w-[120px]">Стажировка в банке</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                              {university.interns !== undefined && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold">Практиканты</Label>
                                  <p className="text-2xl font-bold">{university.interns}</p>
                                      </div>
                              )}
                            </TabsContent>
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
        </Tabs>
      </div>

          {/* Модальное окно создания ВУЗа */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setCreateType(null);
          setUniversityWizardStep(1);
          setEditingUniversity(null);
          setUniversityFormData({
                name: "",
            shortName: "",
            city: "",
            branch: [] as string[],
            cooperationStartYear: new Date().getFullYear(),
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
          setNewCurator({ city: "", branch: "", curatorName: "" });
          setNewContract({ type: "cooperation", hasContract: false, contractFile: "", bankDepartment: "" });
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
                  {/* Список шагов */}
                  <div className="flex items-center gap-2 w-full">
                    {UNIVERSITY_STEPS.map((step, index) => {
                      const stepNumber = index + 1;
                      const isCompleted = stepNumber < universityWizardStep;
                      const isCurrent = stepNumber === universityWizardStep;
                      
                      return (
                        <div key={step.id} className="flex items-center gap-2 flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (stepNumber <= universityWizardStep) {
                                setUniversityWizardStep(stepNumber);
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full justify-center",
                              "hover:bg-muted/50",
                              isCurrent && "bg-primary/10 ring-2 ring-primary shadow-sm",
                              isCompleted && "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30",
                              !isCurrent && !isCompleted && "hover:bg-muted"
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors flex-shrink-0",
                                isCompleted
                                  ? "bg-green-500 text-white"
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
                                  isCompleted && "text-green-700 dark:text-green-300",
                                  !isCurrent && !isCompleted && "text-muted-foreground"
                                )}
                                title={step.title}
                              >
                                {step.title}
                        </div>
                      </div>
                          </button>
                          {index < UNIVERSITY_STEPS.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                    </div>
                      );
                    })}
                    </div>

                  {/* Заголовок шага */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{UNIVERSITY_STEPS[universityWizardStep - 1].title}</h3>
                    <p className="text-muted-foreground">{UNIVERSITY_STEPS[universityWizardStep - 1].description}</p>
                </div>

                  {/* Содержимое шагов */}
                  <div className="min-h-[400px]">
                    {/* Шаг 1: Общая информация */}
                    {universityWizardStep === 1 && (
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
                          <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                              <Label htmlFor="cooperation-start-year">Год начала сотрудничества</Label>
                      <Input
                                id="cooperation-start-year"
                                type="number"
                                value={universityFormData.cooperationStartYear}
                                onChange={(e) => setUniversityFormData({ ...universityFormData, cooperationStartYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                placeholder="2024"
                      />
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
                          <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                              <Label htmlFor="initiator-block">Инициатор сотрудничества (блок/ССП)</Label>
                              <Input
                                id="initiator-block"
                                value={universityFormData.initiatorBlock}
                                onChange={(e) => setUniversityFormData({ ...universityFormData, initiatorBlock: e.target.value })}
                                placeholder="Блок развития"
                    />
                  </div>
                            <div className="space-y-2">
                              <Label htmlFor="initiator-name">Инициатор сотрудничества (ФИО)</Label>
                              <Input
                                id="initiator-name"
                                value={universityFormData.initiatorName}
                                onChange={(e) => setUniversityFormData({ ...universityFormData, initiatorName: e.target.value })}
                                placeholder="Иванов Иван Иванович"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Филиалы */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-base font-semibold">Филиалы ВУЗа</Label>
                          </div>
                          <div className="space-y-2">
                            <Label>Кураторы от филиалов</Label>
                            <div className="space-y-2">
                            {universityFormData.branchCurators.map((curator) => (
                              <Card key={curator.id} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{curator.city} - {curator.branch}</p>
                                    <p className="text-xs text-muted-foreground">{curator.curatorName}</p>
                                  </div>
                    <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveCurator(curator.id)}
                    >
                                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                              </Card>
                            ))}
                            <div className="grid grid-cols-3 gap-2">
                    <Input
                                placeholder="Город"
                                value={newCurator.city}
                                onChange={(e) => setNewCurator({ ...newCurator, city: e.target.value })}
                              />
                              <Input
                                placeholder="Филиал"
                                value={newCurator.branch}
                                onChange={(e) => setNewCurator({ ...newCurator, branch: e.target.value })}
                              />
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Куратор"
                                  value={newCurator.curatorName}
                                  onChange={(e) => setNewCurator({ ...newCurator, curatorName: e.target.value })}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddCurator}
                                  disabled={!newCurator.city.trim() || !newCurator.branch.trim() || !newCurator.curatorName.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                  </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    )}

                    {/* Шаг 2: Договорная база */}
                    {universityWizardStep === 2 && (
                      <div className="space-y-4">
                  <div className="space-y-2">
                          <Label>Договоры с учебным заведением</Label>
                          <div className="space-y-2">
                            {universityFormData.contracts.map((contract) => (
                              <Card key={contract.id} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {contract.type === "cooperation" ? "О сотрудничестве" :
                                       contract.type === "scholarship" ? "Об именных стипендиях" :
                                       "О практике"}
                                    </p>
                                    {contract.bankDepartment && (
                                      <p className="text-xs text-muted-foreground">Кафедра: {contract.bankDepartment}</p>
                                    )}
                                    {contract.contractFile && (
                                      <p className="text-xs text-muted-foreground">Файл: {contract.contractFile}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveContract(contract.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                  </div>
                              </Card>
                            ))}
                            <Card className="p-4 border-dashed">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={newContract.hasContract}
                                    onCheckedChange={(checked) => setNewContract({ ...newContract, hasContract: checked as boolean })}
                                  />
                                  <Label>Наличие договора</Label>
                  </div>
                                {newContract.hasContract && (
                                  <>
                    <Select
                                      value={newContract.type}
                                      onValueChange={(value) => setNewContract({ ...newContract, type: value as Contract["type"] })}
                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Тип договора" />
                      </SelectTrigger>
                      <SelectContent>
                                        <SelectItem value="cooperation">О сотрудничестве</SelectItem>
                                        <SelectItem value="scholarship">Об именных стипендиях</SelectItem>
                                        <SelectItem value="internship">О практике</SelectItem>
                      </SelectContent>
                    </Select>
                                    <Input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setNewContract({ ...newContract, contractFile: file.name });
                                        }
                                      }}
                                      placeholder="Загрузить PDF"
                                    />
                                    <Input
                                      placeholder="Кафедра Банка"
                                      value={newContract.bankDepartment}
                                      onChange={(e) => setNewContract({ ...newContract, bankDepartment: e.target.value })}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleAddContract}
                                      disabled={!newContract.hasContract}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Добавить договор
                                    </Button>
                                  </>
                                )}
                  </div>
                            </Card>
                  </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Навигация */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {universityWizardStep > 1 && (
                        <Button variant="outline" onClick={() => setUniversityWizardStep(universityWizardStep - 1)} size="sm">
                          <ChevronLeft className="h-4 w-4 mr-1" />
                      Назад
                    </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {universityWizardStep < UNIVERSITY_STEPS.length ? (
                    <Button 
                          onClick={() => {
                            if (universityWizardStep === 1) {
                              // Для шага 1 требуем только название и город
                              if (universityFormData.name.trim() && universityFormData.city.trim()) {
                                setUniversityWizardStep(universityWizardStep + 1);
                              }
                            } else {
                              // Для остальных шагов просто переходим дальше
                              setUniversityWizardStep(universityWizardStep + 1);
                            }
                          }}
                          disabled={universityWizardStep === 1 && (!universityFormData.name.trim() || !universityFormData.city.trim())}
                          size="sm"
                        >
                          Далее
                          <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} size="sm">
                            Отмена
                          </Button>
                          <Button 
                            onClick={handleCreateUniversity}
                            disabled={!universityFormData.name.trim() || !universityFormData.city.trim()}
                            size="sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {editingUniversity ? "Сохранить изменения" : "Добавить ВУЗ"}
                          </Button>
                        </>
                      )}
                    </div>
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
              setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: "" });
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
                          <p>Выберите тип мероприятия: дни карьеры, экспертное участие или кейс-чемпионат</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                      <Select
                      value={newEvent.type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, type: value as "careerDays" | "expertParticipation" | "caseChampionships" })}
                      >
                      <SelectTrigger id="event-type-dialog" className="w-full">
                        <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="careerDays">Дни карьеры</SelectItem>
                        <SelectItem value="expertParticipation">Экспертное участие</SelectItem>
                        <SelectItem value="caseChampionships">Кейс-чемпионат</SelectItem>
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
                          <p>Выберите статус мероприятия: запланировано или проведено</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                      <Select
                      value={newEvent.status}
                      onValueChange={(value) => setNewEvent({ ...newEvent, status: value as "planned" | "completed" })}
                    >
                      <SelectTrigger id="event-status-dialog" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Запланировано</SelectItem>
                        <SelectItem value="completed">Проведено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="event-responsible-dialog">Ответственное лицо Банк</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Укажите ФИО сотрудника Банка, ответственного за проведение мероприятия</p>
                        </TooltipContent>
                      </Tooltip>
                  </div>
                      <Input
                      id="event-responsible-dialog"
                      value={newEvent.responsiblePerson}
                      onChange={(e) => setNewEvent({ ...newEvent, responsiblePerson: e.target.value })}
                      placeholder="ФИО ответственного лица"
                      className="w-full"
                      />
                    </div>
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
                    setNewEvent({ type: "", date: "", endDate: "", status: "planned", comments: "", responsiblePerson: "" });
                  }}
                >
                  Отмена
                    </Button>
                {editingEvent && editingEvent.universityId === selectedUniversity ? (
                    <Button 
                    onClick={() => {
                      handleSaveEvent();
                    }}
                    disabled={!newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || !newEvent.responsiblePerson.trim()}
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
                    disabled={!newEvent.type || !newEvent.date.trim() || !newEvent.endDate.trim() || !newEvent.responsiblePerson.trim() || !selectedUniversity}
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
                                  <Avatar className="h-8 w-8 flex-shrink-0">
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
                                  <Avatar className="h-8 w-8 flex-shrink-0">
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

