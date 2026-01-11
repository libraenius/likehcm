"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { GraduationCap, ClipboardCheck, Users, Settings, ExternalLink, FileText, Calendar, Link2, Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, X, ChevronLeft, ChevronsLeft, ChevronsRight, AlertCircle, Mail, Send, CheckCircle2, Clock, MapPin, Building2, Archive, ArchiveRestore, Filter, SortAsc, SortDesc, BarChart3, MessageSquare, History, FileText as FileTextIcon, Edit3, Copy, Tag, Eye, EyeOff, Star, UserCheck, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
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

// Тип для университета
interface University {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  region: string;
  description?: string;
  partnerships: Partnership[];
}

// Тип для партнерства
interface Partnership {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  type: "internship" | "recruitment" | "research" | "education" | "joint_program";
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: "planned" | "active" | "completed" | "cancelled";
  link?: string;
  students?: Student[];
}

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

// Расширенный интерфейс партнерства с архивом и комментариями
interface PartnershipExtended extends Partnership {
  comments?: Comment[];
  isArchived?: boolean;
  archivedAt?: Date;
}

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
    region: "Московская область",
    description: "Ведущий университет России",
    partnerships: [
      {
        id: "part-1",
        name: "Программа стажировок для студентов IT-направлений",
        universityId: "univ-1",
        universityName: "МГУ",
        type: "internship",
        description: "Программа стажировок для студентов факультета вычислительной математики и кибернетики",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-06-30"),
        status: "active",
        link: "https://partnership.example.com/partnership/1",
        students: [
          { id: "student-1", fullName: "Иванов Иван Иванович", email: "student1@university.edu", status: "in-progress" as const, departmentId: "dept-1", uniqueLink: "https://partnership.example.com/partnership/1?student=student-1" },
          { id: "student-2", fullName: "Петрова Мария Сергеевна", email: "student2@university.edu", status: "completed" as const, departmentId: "dept-2", uniqueLink: "https://partnership.example.com/partnership/1?student=student-2" },
          { id: "student-3", fullName: "Сидоров Алексей Дмитриевич", email: "student3@university.edu", status: "invited" as const, departmentId: "dept-3", uniqueLink: "https://partnership.example.com/partnership/1?student=student-3" },
        ],
      },
    ],
  },
  {
    id: "univ-2",
    name: "Санкт-Петербургский государственный университет",
    shortName: "СПбГУ",
    city: "Санкт-Петербург",
    region: "Ленинградская область",
    description: "Один из старейших университетов России",
    partnerships: [
      {
        id: "part-2",
        name: "Совместная образовательная программа",
        universityId: "univ-2",
        universityName: "СПбГУ",
        type: "education",
        description: "Разработка совместной магистерской программы",
        startDate: new Date("2024-02-01"),
        status: "active",
        link: "https://partnership.example.com/partnership/2",
      },
    ],
  },
  {
    id: "univ-3",
    name: "Московский физико-технический институт",
    shortName: "МФТИ",
    city: "Долгопрудный",
    region: "Московская область",
    description: "Ведущий технический университет",
    partnerships: [
      {
        id: "part-3",
        name: "Программа рекрутинга выпускников",
        universityId: "univ-3",
        universityName: "МФТИ",
        type: "recruitment",
        description: "Привлечение талантливых выпускников",
        startDate: new Date("2024-03-01"),
        status: "planned",
        link: "https://partnership.example.com/partnership/3",
      },
    ],
  },
];

// Функция для получения цвета статуса (использует централизованные цвета)
const getStatusColor = (status: Partnership["status"]) => {
  return getStatusBadgeColor(status);
};

// Функция для получения текста статуса
const getStatusText = (status: Partnership["status"]) => {
  switch (status) {
    case "planned":
      return "Запланировано";
    case "active":
      return "Активно";
    case "completed":
      return "Завершено";
    case "cancelled":
      return "Отменено";
    default:
      return status;
  }
};

// Функция для получения текста типа партнерства
const getPartnershipTypeText = (type: Partnership["type"]) => {
  switch (type) {
    case "internship":
      return "Стажировка";
    case "recruitment":
      return "Рекрутинг";
    case "research":
      return "Исследования";
    case "education":
      return "Образование";
    case "joint_program":
      return "Совместная программа";
    default:
      return type;
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
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [expandedUniversities, setExpandedUniversities] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"university" | "partnership" | null>(null);
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Состояние для пагинации таблицы студентов
  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1);
  const [studentsItemsPerPage, setStudentsItemsPerPage] = useState(10);
  
  // Состояние для формы создания университета
  const [universityFormData, setUniversityFormData] = useState({
    name: "",
    shortName: "",
    city: "",
    region: "",
    description: "",
  });
  
  // Состояние для формы создания партнерства
  const [partnershipFormData, setPartnershipFormData] = useState({
    name: "",
    universityId: "",
    description: "",
    type: "internship" as Partnership["type"],
    startDate: "",
    endDate: "",
    link: "",
    status: "planned" as Partnership["status"],
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
  const [deletePartnershipId, setDeletePartnershipId] = useState<{ universityId: string; partnershipId: string } | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "city" | "partnerships" | "date">("name");
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
  const [activeTab, setActiveTab] = useState<"partnerships" | "internships">(
    tabFromQuery === "internships" ? "internships" : "partnerships"
  );
  
  // Обновляем активную вкладку при изменении query параметра
  useEffect(() => {
    if (tabFromQuery === "internships") {
      setActiveTab("internships");
    } else if (tabFromQuery === "partnerships") {
      setActiveTab("partnerships");
    }
  }, [tabFromQuery]);
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
  const handleSelectPartnership = (partnership: Partnership) => {
    setSelectedPartnership(partnership);
    setStudentsCurrentPage(1);
  };
  
  // Сбрасываем пагинацию при изменении количества элементов на странице
  useEffect(() => {
    setStudentsCurrentPage(1);
  }, [studentsItemsPerPage]);
  
  // Открытие диалога создания
  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    setCreateType(null);
    setEditingPartnership(null);
    setUniversityFormData({ name: "", shortName: "", city: "", region: "", description: "" });
    setPartnershipFormData({
      name: "",
      universityId: "",
      description: "",
      type: "internship",
      startDate: "",
      endDate: "",
      link: "",
      status: "planned",
    });
  };
  
  // Создание университета
  const handleCreateUniversity = () => {
    if (!universityFormData.name.trim() || !universityFormData.city.trim() || !universityFormData.region.trim()) {
      return;
    }
    
    const newUniversity: University = {
      id: `univ-${Date.now()}`,
      name: universityFormData.name.trim(),
      shortName: universityFormData.shortName.trim() || undefined,
      city: universityFormData.city.trim(),
      region: universityFormData.region.trim(),
      description: universityFormData.description.trim() || undefined,
      partnerships: [],
    };
    
    setUniversities([...universities, newUniversity]);
    setIsCreateDialogOpen(false);
    setCreateType(null);
    setUniversityFormData({ name: "", shortName: "", city: "", region: "", description: "" });
  };
  
  // Создание или обновление партнерства
  const handleCreatePartnership = () => {
    if (!partnershipFormData.name.trim() || !partnershipFormData.universityId || !partnershipFormData.startDate) {
      return;
    }
    
    // Валидация
    const dateError = validateDates(partnershipFormData.startDate, partnershipFormData.endDate);
    if (dateError) {
      return;
    }
    
    if (partnershipFormData.link && !validateURL(partnershipFormData.link)) {
      return;
    }
    
    const university = universities.find(u => u.id === partnershipFormData.universityId);
    if (!university) return;
    
    if (editingPartnership) {
      // Редактирование существующего партнерства
      const updatedPartnership: Partnership = {
        ...editingPartnership,
        name: partnershipFormData.name.trim(),
        universityId: partnershipFormData.universityId,
        universityName: university.name,
        description: partnershipFormData.description.trim() || undefined,
        type: partnershipFormData.type,
        startDate: new Date(partnershipFormData.startDate),
        endDate: partnershipFormData.endDate ? new Date(partnershipFormData.endDate) : undefined,
        link: partnershipFormData.link.trim() || undefined,
        status: partnershipFormData.status,
        // Сохраняем существующих студентов
        students: editingPartnership.students,
      };
      
      const universityChanged = editingPartnership.universityId !== partnershipFormData.universityId;
      
      const finalUniversities = universities.map(u => {
        if (universityChanged) {
          // Если университет изменился, удаляем из старого и добавляем в новый
          if (u.id === editingPartnership.universityId) {
            return {
              ...u,
              partnerships: u.partnerships.filter(p => p.id !== editingPartnership.id),
            };
          }
          if (u.id === partnershipFormData.universityId) {
            return {
              ...u,
              partnerships: [...u.partnerships, updatedPartnership],
            };
          }
        } else {
          // Если университет не изменился, просто обновляем партнерство
          if (u.id === partnershipFormData.universityId) {
            return {
              ...u,
              partnerships: u.partnerships.map(p => 
                p.id === editingPartnership.id ? updatedPartnership : p
              ),
            };
          }
        }
        return u;
      });
      
      setUniversities(finalUniversities);
      
      // Обновляем выбранное партнерство, если оно было отредактировано
      if (selectedPartnership?.id === editingPartnership.id) {
        setSelectedPartnership(updatedPartnership);
      }
    } else {
      // Создание нового партнерства
      const newPartnership: Partnership = {
        id: `part-${Date.now()}`,
        name: partnershipFormData.name.trim(),
        universityId: partnershipFormData.universityId,
        universityName: university.name,
        description: partnershipFormData.description.trim() || undefined,
        type: partnershipFormData.type,
        startDate: new Date(partnershipFormData.startDate),
        endDate: partnershipFormData.endDate ? new Date(partnershipFormData.endDate) : undefined,
        link: partnershipFormData.link.trim() || undefined,
        status: partnershipFormData.status,
        students: [],
      };
      
      const updatedUniversities = universities.map(u => {
        if (u.id === partnershipFormData.universityId) {
          return {
            ...u,
            partnerships: [...u.partnerships, newPartnership],
          };
        }
        return u;
      });
      
      setUniversities(updatedUniversities);
    }
    
    setIsCreateDialogOpen(false);
    setCreateType(null);
    setEditingPartnership(null);
    setPartnershipFormData({
      name: "",
      universityId: "",
      description: "",
      type: "internship",
      startDate: "",
      endDate: "",
      link: "",
      status: "planned",
    });
  };
  

  // Фильтрация и сортировка данных
  const filteredData = useMemo(() => {
    let result = universities.map(university => {
      const query = searchQuery.toLowerCase();
      const universityMatches = !searchQuery.trim() ||
        university.name.toLowerCase().includes(query) ||
        university.shortName?.toLowerCase().includes(query) ||
        university.city.toLowerCase().includes(query) ||
        university.region.toLowerCase().includes(query) ||
        university.description?.toLowerCase().includes(query);
      
      let filteredPartnerships = university.partnerships.filter(partnership => {
        const extended = partnership as PartnershipExtended;
        if (showArchived && !extended.isArchived) return false;
        if (!showArchived && extended.isArchived) return false;
        
        if (searchQuery.trim()) {
          const matchesSearch = 
            partnership.name.toLowerCase().includes(query) ||
            partnership.description?.toLowerCase().includes(query);
          if (!matchesSearch && !universityMatches) return false;
        }
        
        if (statusFilter !== "all" && partnership.status !== statusFilter) return false;
        if (typeFilter !== "all" && partnership.type !== typeFilter) return false;
        
        return true;
      });
      
      return { ...university, partnerships: universityMatches ? filteredPartnerships : filteredPartnerships };
    }).filter(u => {
      if (cityFilter !== "all" && u.city !== cityFilter) return false;
      return u.partnerships.length > 0 || !searchQuery.trim();
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
        case "partnerships":
          comparison = a.partnerships.length - b.partnerships.length;
          break;
        case "date":
          const aLatest = a.partnerships.length > 0 
            ? Math.max(...a.partnerships.map(p => p.startDate.getTime()))
            : 0;
          const bLatest = b.partnerships.length > 0
            ? Math.max(...b.partnerships.map(p => p.startDate.getTime()))
            : 0;
          comparison = aLatest - bLatest;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [universities, searchQuery, statusFilter, typeFilter, cityFilter, sortBy, sortOrder, showArchived]);

  // Получение уникальных городов для фильтра
  const uniqueCities = useMemo(() => {
    const cities = new Set(universities.map(u => u.city));
    return Array.from(cities).sort();
  }, [universities]);

  // Функции удаления
  const handleDeleteUniversity = useCallback(() => {
    if (!deleteUniversityId) return;
    const university = universities.find(u => u.id === deleteUniversityId);
    if (university && university.partnerships.length > 0) {
      // Предупреждение если есть партнерства
      return;
    }
    setUniversities(universities.filter(u => u.id !== deleteUniversityId));
    if (selectedPartnership && selectedPartnership.universityId === deleteUniversityId) {
      setSelectedPartnership(null);
    }
    setDeleteUniversityId(null);
  }, [deleteUniversityId, universities, selectedPartnership]);

  const handleDeletePartnership = useCallback(() => {
    if (!deletePartnershipId) return;
    const { universityId, partnershipId } = deletePartnershipId;
    const university = universities.find(u => u.id === universityId);
    const partnership = university?.partnerships.find(p => p.id === partnershipId);
    
    if (partnership && partnership.students && partnership.students.length > 0) {
      // Предупреждение
      return;
    }
    
    setUniversities(universities.map(u => {
      if (u.id === universityId) {
        return {
          ...u,
          partnerships: u.partnerships.filter(p => p.id !== partnershipId),
        };
      }
      return u;
    }));
    
    if (selectedPartnership?.id === partnershipId) {
      setSelectedPartnership(null);
    }
    setDeletePartnershipId(null);
  }, [deletePartnershipId, universities, selectedPartnership]);

  const handleDeleteStudent = useCallback(() => {
    if (!deleteStudentId || !selectedPartnership) return;
    
    setUniversities(universities.map(u => {
      if (u.id === selectedPartnership.universityId) {
        return {
          ...u,
          partnerships: u.partnerships.map(p => {
            if (p.id === selectedPartnership.id) {
              return {
                ...p,
                students: (p.students || []).filter(s => s.id !== deleteStudentId),
              };
            }
            return p;
          }),
        };
      }
      return u;
    }));
    
    const updatedPartnership = universities
      .find(u => u.id === selectedPartnership.universityId)
      ?.partnerships.find(p => p.id === selectedPartnership.id);
    if (updatedPartnership) {
      setSelectedPartnership({
        ...updatedPartnership,
        students: (updatedPartnership.students || []).filter(s => s.id !== deleteStudentId),
      });
    }
    setDeleteStudentId(null);
  }, [deleteStudentId, selectedPartnership, universities]);

  // Изменение статуса студента
  const handleChangeStudentStatus = useCallback((studentId: string, newStatus: Student["status"]) => {
    if (!selectedPartnership) return;
    
    setUniversities(universities.map(u => {
      if (u.id === selectedPartnership.universityId) {
        return {
          ...u,
          partnerships: u.partnerships.map(p => {
            if (p.id === selectedPartnership.id) {
              return {
                ...p,
                students: (p.students || []).map(s =>
                  s.id === studentId ? { ...s, status: newStatus } : s
                ),
              };
            }
            return p;
          }),
        };
      }
      return u;
    }));
    
    const updatedPartnership = universities
      .find(u => u.id === selectedPartnership.universityId)
      ?.partnerships.find(p => p.id === selectedPartnership.id);
    if (updatedPartnership) {
      const updatedStudents = (updatedPartnership.students || []).map(s =>
        s.id === studentId ? { ...s, status: newStatus } : s
      );
      setSelectedPartnership({ ...updatedPartnership, students: updatedStudents });
    }
  }, [selectedPartnership, universities]);

  // Работа с комментариями
  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !selectedPartnership) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      partnershipId: selectedPartnership.id,
      author: "Текущий пользователь", // В реальном приложении брать из контекста
      text: newComment.trim(),
      createdAt: new Date(),
    };
    
    setComments([...comments, comment]);
    setNewComment("");
  }, [newComment, selectedPartnership, comments]);


  // Фильтрация студентов
  const filteredStudents = useMemo(() => {
    if (!selectedPartnership?.students) return [];
    if (studentStatusFilter === "all") return selectedPartnership.students;
    return selectedPartnership.students.filter(s => s.status === studentStatusFilter);
  }, [selectedPartnership, studentStatusFilter]);

  // Применение шаблона email
  const handleApplyTemplate = useCallback((template: EmailTemplate) => {
    if (!selectedPartnership) return;
    
    const variables: Record<string, string> = {
      partnershipName: selectedPartnership.name,
      startDate: formatDate(selectedPartnership.startDate),
      status: getStatusText(selectedPartnership.status),
    };
    
    let subject = replaceTemplateVariables(template.subject, variables);
    let message = replaceTemplateVariables(template.body, variables);
    
    setNotificationFormData(prev => ({
      ...prev,
      subject,
      message,
    }));
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(false);
  }, [selectedPartnership]);

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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "partnerships" | "internships")} className="w-full">
          <TabsList variant="grid2">
            <TabsTrigger value="partnerships">Партнерства</TabsTrigger>
            <TabsTrigger value="internships">Стажировки</TabsTrigger>
          </TabsList>

          <TabsContent value="partnerships" className="mt-4 space-y-4">
            {/* Поиск и фильтры для партнерств */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по университетам и партнерствам..."
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
                Добавить партнерство
              </Button>
            </div>
            {/* Двухколоночная структура */}
            {filteredData.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "Университеты не найдены" : "Нет университетов"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Создайте первый университет, чтобы начать работу"}
                  </p>
                    {!searchQuery && (
                      <Button onClick={handleCreate} size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить университет
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-4 min-h-[calc(100vh-280px)] w-full overflow-x-hidden">
              {/* Левая колонка - иерархия университетов и партнерств */}
              <div className="w-[20rem] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
                <div className="p-2 border-b bg-muted/30">
                  <h3 className="font-semibold text-sm">Университеты и партнерства</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredData.map((university) => (
                      <div key={university.id} className="space-y-1">
                        {/* Университет */}
                        <div
                          className="p-2 rounded-md cursor-pointer transition-colors hover:bg-muted"
                          onClick={() => toggleUniversity(university.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUniversity(university.id);
                              }}
                            >
                              {expandedUniversities.has(university.id) ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm break-words">{university.name}</div>
                              {university.description && (
                                <div className="text-xs break-words mt-0.5 text-muted-foreground">
                                  {university.description.length > 50
                                    ? university.description.substring(0, 50) + "..."
                                    : university.description}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {university.partnerships.length}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteUniversityId(university.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Партнерства университета */}
                        {expandedUniversities.has(university.id) && (
                          <div className="ml-6 space-y-1">
                            {university.partnerships.map((partnership) => {
                              return (
                                <div
                                  key={partnership.id}
                                  onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button, input')) return;
                                    e.stopPropagation();
                                    handleSelectPartnership(partnership);
                                  }}
                                  className={cn(
                                    "p-2 rounded-md cursor-pointer transition-colors text-sm flex items-center gap-2",
                                    selectedPartnership?.id === partnership.id
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-muted/50"
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm break-words">{partnership.name}</div>
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs mt-0.5", getStatusColor(partnership.status))}
                                    >
                                      {getStatusText(partnership.status)}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletePartnershipId({ universityId: university.id, partnershipId: partnership.id });
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Правая колонка - детальная информация о партнерстве */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-280px)]">
                {selectedPartnership ? (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-1 break-words">{selectedPartnership.name}</CardTitle>
                          <CardDescription className="text-base break-words">
                            {selectedPartnership.description || "Описание отсутствует"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsCommentsDialogOpen(true)}
                            title="Комментарии"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsHistoryDialogOpen(true)}
                            title="История изменений"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingPartnership(selectedPartnership);
                              setPartnershipFormData({
                                name: selectedPartnership.name,
                                universityId: selectedPartnership.universityId,
                                description: selectedPartnership.description || "",
                                type: selectedPartnership.type,
                                startDate: selectedPartnership.startDate.toISOString().split('T')[0],
                                endDate: selectedPartnership.endDate ? selectedPartnership.endDate.toISOString().split('T')[0] : "",
                                link: selectedPartnership.link || "",
                                status: selectedPartnership.status,
                              });
                              setCreateType("partnership");
                              setIsCreateDialogOpen(true);
                            }}
                            title="Редактировать"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 overflow-x-hidden">
                      <div className="space-y-4 max-w-full">
                        {/* Университет */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Университет</Label>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedPartnership.universityName}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Статус */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Статус</Label>
                          <Badge
                            variant="outline"
                            className={cn("text-sm px-3 py-1", getStatusColor(selectedPartnership.status))}
                          >
                            {getStatusText(selectedPartnership.status)}
                          </Badge>
                        </div>

                        <Separator />

                        {/* Тип партнерства */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Тип партнерства</Label>
                          <Badge variant="outline" className="text-sm px-3 py-1">
                            {getPartnershipTypeText(selectedPartnership.type)}
                          </Badge>
                        </div>

                        <Separator />

                        {/* Даты */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Период проведения</Label>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(selectedPartnership.startDate)}
                              {selectedPartnership.endDate && ` - ${formatDate(selectedPartnership.endDate)}`}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        {/* Ссылка */}
                        {selectedPartnership.link && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Ссылка на партнерство</Label>
                              <div className="flex items-center gap-2">
                                <a
                                  href={selectedPartnership.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                                >
                                  {selectedPartnership.link}
                                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                </a>
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}

                        {/* Студенты */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Студенты ({filteredStudents.length})
                            </Label>
                            <div className="flex gap-2 flex-wrap">
                              <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Фильтр по статусу" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Все статусы</SelectItem>
                                  <SelectItem value="not-started">Не начато</SelectItem>
                                  <SelectItem value="invited">Приглашен</SelectItem>
                                  <SelectItem value="in-progress">В процессе</SelectItem>
                                  <SelectItem value="completed">Завершено</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsNotificationsDialogOpen(true)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Уведомления
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const existingStudentIds = selectedPartnership.students?.map(s => {
                                    const employee = mockEmployees.find(emp => 
                                      emp.email === s.email || emp.fullName === s.fullName
                                    );
                                    return employee?.id;
                                  }).filter(Boolean) as string[] || [];
                                  setSelectedStudentIds(existingStudentIds);
                                  setIsAddStudentsDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить
                              </Button>
                            </div>
                          </div>
                          {filteredStudents.length > 0 ? (
                              <div className="space-y-3">
                                <div className="rounded-md border bg-card overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                      <TableHead className="w-[250px] font-bold text-base text-foreground">Студент</TableHead>
                                      <TableHead className="w-[200px] font-bold text-base text-foreground">Должность / Подразделение</TableHead>
                                      <TableHead className="w-[300px] font-bold text-base text-foreground">Уникальная ссылка на партнерство</TableHead>
                                        <TableHead className="w-[150px] font-bold text-base text-foreground">Статус</TableHead>
                                        <TableHead className="w-[120px] font-bold text-base text-foreground">Действия</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(() => {
                                        const totalPages = Math.ceil(filteredStudents.length / studentsItemsPerPage);
                                        const startIndex = (studentsCurrentPage - 1) * studentsItemsPerPage;
                                        const endIndex = startIndex + studentsItemsPerPage;
                                        const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
                                        
                                        return paginatedStudents.length === 0 ? (
                                          <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                              Нет студентов
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          paginatedStudents.map((student) => (
                                            <TableRow key={student.id}>
                                              <TableCell className="px-4 whitespace-normal">
                                                <div className="flex items-center gap-3">
                                                  <Avatar className="h-10 w-10 shrink-0">
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                      {getInitials(student.fullName)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-medium">{student.fullName}</span>
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {(() => {
                                                  const department = student.departmentId 
                                                    ? mockDepartments.find((d) => d.id === student.departmentId)
                                                    : null;
                                                  return (
                                                    <div className="flex flex-col gap-1">
                                                      {student.position && (
                                                        <span className="font-medium">{student.position}</span>
                                                      )}
                                                      {department && (
                                                        <div className="text-sm text-muted-foreground">
                                                          {department.name}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })()}
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {student.uniqueLink ? (
                                                  <a
                                                    href={student.uniqueLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                                                  >
                                                    {student.uniqueLink}
                                                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                                  </a>
                                                ) : (
                                                  <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="break-words whitespace-normal">
                                                <Select
                                                  value={student.status}
                                                  onValueChange={(value) => handleChangeStudentStatus(student.id, value as Student["status"])}
                                                >
                                                  <SelectTrigger className="h-8 w-[120px]">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="not-started">Не начато</SelectItem>
                                                    <SelectItem value="invited">Приглашен</SelectItem>
                                                    <SelectItem value="in-progress">В процессе</SelectItem>
                                                    <SelectItem value="completed">Завершено</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </TableCell>
                                              <TableCell className="break-words whitespace-normal">
                                                <div className="flex gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => setDeleteStudentId(student.id)}
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        );
                                      })()}
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                {/* Пагинация */}
                                {filteredStudents.length > 0 && (() => {
                                  const totalPages = Math.ceil(filteredStudents.length / studentsItemsPerPage);
                                  
                                  return (
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-2">
                                        <Label htmlFor="students-items-per-page" className="text-sm text-muted-foreground">
                                          Показать:
                                        </Label>
                                        <Select
                                          value={studentsItemsPerPage.toString()}
                                          onValueChange={(value) => {
                                            setStudentsItemsPerPage(Number(value));
                                            setStudentsCurrentPage(1);
                                          }}
                                        >
                                          <SelectTrigger id="students-items-per-page" className="w-[80px]">
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
                                          из {filteredStudents.length}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          Страница {studentsCurrentPage} из {totalPages}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setStudentsCurrentPage(1)}
                                            disabled={studentsCurrentPage === 1}
                                          >
                                            <ChevronsLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setStudentsCurrentPage(studentsCurrentPage - 1)}
                                            disabled={studentsCurrentPage === 1}
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setStudentsCurrentPage(studentsCurrentPage + 1)}
                                            disabled={studentsCurrentPage === totalPages}
                                          >
                                            <ChevronRight className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setStudentsCurrentPage(totalPages)}
                                            disabled={studentsCurrentPage === totalPages}
                                          >
                                            <ChevronsRight className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="border rounded-lg p-8 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">
                                  Студенты не добавлены
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStudentIds([]);
                                    setIsAddStudentsDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Добавить студентов
                                </Button>
                              </div>
                            )}
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Выберите партнерство</h3>
                      <p className="text-muted-foreground">
                        Выберите партнерство из списка слева, чтобы просмотреть подробную информацию
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

      {/* Модальное окно создания университета или партнерства */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          setCreateType(null);
          setEditingPartnership(null);
          setUniversityFormData({ name: "", shortName: "", city: "", region: "", description: "" });
          setPartnershipFormData({
            name: "",
            universityId: "",
            description: "",
            type: "internship",
            startDate: "",
            endDate: "",
            link: "",
            status: "planned",
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {!createType 
                ? "Добавить" 
                : createType === "university" 
                ? "Добавить университет" 
                : editingPartnership 
                ? "Редактировать партнерство" 
                : "Добавить партнерство"}
            </DialogTitle>
            <DialogDescription>
              {!createType 
                ? "Выберите, что вы хотите добавить"
                : createType === "university"
                ? "Заполните информацию об университете"
                : editingPartnership
                ? "Внесите изменения в партнерство"
                : "Заполните информацию о партнерстве"}
            </DialogDescription>
          </DialogHeader>
          {!createType ? (
            <div className="space-y-3 py-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setCreateType("university")}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Университет</div>
                        <div className="text-sm text-muted-foreground">
                          Добавить новый университет
                        </div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setCreateType("partnership")}
                    disabled={universities.length === 0}
                  >
                    <div className="flex items-center gap-3">
                      <Link2 className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Партнерство</div>
                        <div className="text-sm text-muted-foreground">
                          Добавить новое партнерство
                        </div>
                      </div>
                    </div>
                  </Button>
                  {universities.length === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-muted">
                      <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Сначала добавьте университет
                      </p>
                    </div>
                  )}
                </div>
              ) : createType === "university" ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="university-name">
                      Название университета <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="university-name"
                      value={universityFormData.name}
                      onChange={(e) => setUniversityFormData({ ...universityFormData, name: e.target.value })}
                      placeholder="Московский государственный университет"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university-short-name">Краткое название</Label>
                    <Input
                      id="university-short-name"
                      value={universityFormData.shortName}
                      onChange={(e) => setUniversityFormData({ ...universityFormData, shortName: e.target.value })}
                      placeholder="МГУ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="university-region">
                        Регион <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="university-region"
                        value={universityFormData.region}
                        onChange={(e) => setUniversityFormData({ ...universityFormData, region: e.target.value })}
                        placeholder="Московская область"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university-description">Описание</Label>
                    <Textarea
                      id="university-description"
                      value={universityFormData.description}
                      onChange={(e) => setUniversityFormData({ ...universityFormData, description: e.target.value })}
                      placeholder="Описание университета..."
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setCreateType(null);
                      setEditingPartnership(null);
                      setPartnershipFormData({
                        name: "",
                        universityId: "",
                        description: "",
                        type: "internship",
                        startDate: "",
                        endDate: "",
                        link: "",
                        status: "planned",
                      });
                    }}>
                      Назад
                    </Button>
                    <Button 
                      onClick={handleCreateUniversity}
                      disabled={!universityFormData.name.trim() || !universityFormData.city.trim() || !universityFormData.region.trim()}
                    >
                      Добавить университет
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="partnership-name">
                      Название партнерства <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="partnership-name"
                      value={partnershipFormData.name}
                      onChange={(e) => setPartnershipFormData({ ...partnershipFormData, name: e.target.value })}
                      placeholder="Программа стажировок"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnership-university">
                      Университет <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={partnershipFormData.universityId}
                      onValueChange={(value) => setPartnershipFormData({ ...partnershipFormData, universityId: value })}
                    >
                      <SelectTrigger id="partnership-university">
                        <SelectValue placeholder="Выберите университет" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((university) => (
                          <SelectItem key={university.id} value={university.id}>
                            {university.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnership-description">Описание</Label>
                    <Textarea
                      id="partnership-description"
                      value={partnershipFormData.description}
                      onChange={(e) => setPartnershipFormData({ ...partnershipFormData, description: e.target.value })}
                      placeholder="Описание партнерства"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnership-type">
                        Тип партнерства <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={partnershipFormData.type}
                        onValueChange={(value) => setPartnershipFormData({ ...partnershipFormData, type: value as Partnership["type"] })}
                      >
                        <SelectTrigger id="partnership-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Стажировка</SelectItem>
                          <SelectItem value="recruitment">Рекрутинг</SelectItem>
                          <SelectItem value="research">Исследования</SelectItem>
                          <SelectItem value="education">Образование</SelectItem>
                          <SelectItem value="joint_program">Совместная программа</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnership-status">
                        Статус <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={partnershipFormData.status}
                        onValueChange={(value: "planned" | "active" | "completed" | "cancelled") => 
                          setPartnershipFormData({ ...partnershipFormData, status: value })
                        }
                      >
                        <SelectTrigger id="partnership-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Запланировано</SelectItem>
                          <SelectItem value="active">Активно</SelectItem>
                          <SelectItem value="completed">Завершено</SelectItem>
                          <SelectItem value="cancelled">Отменено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnership-start-date">
                        Дата начала <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="partnership-start-date"
                        type="date"
                        value={partnershipFormData.startDate}
                        onChange={(e) => setPartnershipFormData({ ...partnershipFormData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnership-end-date">Дата окончания</Label>
                      <Input
                        id="partnership-end-date"
                        type="date"
                        value={partnershipFormData.endDate}
                        onChange={(e) => setPartnershipFormData({ ...partnershipFormData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnership-link">Ссылка</Label>
                      <Input
                        id="partnership-link"
                        type="url"
                        value={partnershipFormData.link}
                        onChange={(e) => setPartnershipFormData({ ...partnershipFormData, link: e.target.value })}
                        placeholder="https://partnership.example.com/partnership/1"
                      />
                      {partnershipFormData.link && !validateURL(partnershipFormData.link) && (
                        <p className="text-xs text-destructive">Некорректный URL</p>
                      )}
                    </div>
                    {validateDates(partnershipFormData.startDate, partnershipFormData.endDate) && (
                      <div className="text-sm text-destructive">
                        {validateDates(partnershipFormData.startDate, partnershipFormData.endDate)}
                      </div>
                    )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setCreateType(null);
                      setEditingPartnership(null);
                      setPartnershipFormData({
                        name: "",
                        universityId: "",
                        description: "",
                        type: "internship",
                        startDate: "",
                        endDate: "",
                        link: "",
                        status: "planned",
                      });
                    }}>
                      Назад
                    </Button>
                    <Button 
                      onClick={handleCreatePartnership}
                      disabled={
                        !partnershipFormData.name.trim() ||
                        !partnershipFormData.universityId ||
                        !partnershipFormData.startDate
                      }
                    >
                      {editingPartnership ? "Сохранить изменения" : "Добавить партнерство"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
        </DialogContent>
      </Dialog>

      {/* Диалог удаления университета */}
      <AlertDialog open={deleteUniversityId !== null} onOpenChange={(open) => !open && setDeleteUniversityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
                  {(() => {
                    const university = universities.find(u => u.id === deleteUniversityId);
                    if (university?.partnerships.length) {
                      return `Университет "${university.name}" содержит ${university.partnerships.length} партнерств. Удаление невозможно. Сначала удалите все партнерства.`;
                    }
                    return `Вы уверены, что хотите удалить университет "${university?.name}"? Это действие нельзя отменить.`;
                  })()}
                </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUniversity}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={(() => {
                const university = universities.find(u => u.id === deleteUniversityId);
                return university?.partnerships.length ? true : false;
              })()}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог удаления партнерства */}
      <AlertDialog open={deletePartnershipId !== null} onOpenChange={(open) => !open && setDeletePartnershipId(null)}>
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

      {/* Диалог удаления студента */}
      <AlertDialog open={deleteStudentId !== null} onOpenChange={(open) => !open && setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
                  Вы уверены, что хотите удалить этого студента из партнерства? Это действие нельзя отменить.
                </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог комментариев */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Комментарии</DialogTitle>
            <DialogDescription>
                  Комментарии к партнерству "{selectedPartnership?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {comments.filter(c => c.partnershipId === selectedPartnership?.id).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Нет комментариев
              </p>
            ) : (
              comments
                .filter(c => c.partnershipId === selectedPartnership?.id)
                .map(comment => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Добавить комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Добавить комментарий
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог истории изменений */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>История изменений</DialogTitle>
            <DialogDescription>
              История изменений партнерства "{selectedPartnership?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {changeHistory.filter(h => h.partnershipId === selectedPartnership?.id).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Нет истории изменений
              </p>
            ) : (
              changeHistory
                .filter(h => h.partnershipId === selectedPartnership?.id)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map(change => (
                  <Card key={change.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{change.action}</Badge>
                            <span className="text-sm font-medium">{change.user}</span>
                          </div>
                          {change.field && (
                            <div className="text-sm text-muted-foreground">
                              {change.field}: {change.oldValue} → {change.newValue}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(change.timestamp)} {change.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог шаблонов email */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Выберите шаблон</DialogTitle>
            <DialogDescription>
              Выберите шаблон для заполнения уведомления
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {emailTemplates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleApplyTemplate(template)}
              >
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.subject.substring(0, 80)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалоги для партнерств */}
      {/* Диалог фильтров */}
      <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Фильтры и сортировка</DialogTitle>
            <DialogDescription>
              Настройте фильтры для поиска университетов и партнерств
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
                  <Label>Статус партнерства</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="planned">Запланировано</SelectItem>
                      <SelectItem value="active">Активно</SelectItem>
                      <SelectItem value="completed">Завершено</SelectItem>
                      <SelectItem value="cancelled">Отменено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Тип партнерства</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="internship">Стажировка</SelectItem>
                      <SelectItem value="recruitment">Рекрутинг</SelectItem>
                      <SelectItem value="research">Исследования</SelectItem>
                      <SelectItem value="education">Образование</SelectItem>
                      <SelectItem value="joint_program">Совместная программа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                        <SelectItem value="partnerships">По количеству партнерств</SelectItem>
                        <SelectItem value="date">По дате</SelectItem>
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

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Архив</Label>
                    <Button
                      variant={showArchived ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowArchived(!showArchived)}
                    >
                      {showArchived ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                      {showArchived ? "Показать активные" : "Показать архив"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {showArchived 
                      ? "Отображаются только архивированные партнерства" 
                      : "Отображаются только активные партнерства"}
                  </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter("all");
                setTypeFilter("all");
                setCityFilter("all");
                setSortBy("name");
                setSortOrder("asc");
                setShowArchived(false);
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

      {/* Диалог добавления студентов */}
      <Dialog open={isAddStudentsDialogOpen} onOpenChange={setIsAddStudentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить студентов</DialogTitle>
            <DialogDescription>
              Выберите студентов для партнерства "{selectedPartnership?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск студентов..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={selectedStudentIds.includes(employee.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStudentIds([...selectedStudentIds, employee.id]);
                      } else {
                        setSelectedStudentIds(selectedStudentIds.filter(id => id !== employee.id));
                      }
                    }}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(employee.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{employee.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddStudentsDialogOpen(false);
              setSelectedStudentIds([]);
            }}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                if (selectedPartnership) {
                  const newStudents: Student[] = selectedStudentIds.map(id => {
                    const employee = mockEmployees.find(e => e.id === id);
                    return {
                      id: `student-${id}`,
                      fullName: employee?.fullName || "",
                      email: employee?.email || "",
                      status: "invited" as const,
                      departmentId: employee?.departmentId,
                      uniqueLink: `https://partnership.example.com/partnership/${selectedPartnership.id}?student=student-${id}`,
                    };
                  });
                  
                  const updatedUniversities = universities.map(u => {
                    if (u.id === selectedPartnership.universityId) {
                      return {
                        ...u,
                        partnerships: u.partnerships.map(p => {
                          if (p.id === selectedPartnership.id) {
                            return {
                              ...p,
                              students: [...(p.students || []), ...newStudents],
                            };
                          }
                          return p;
                        }),
                      };
                    }
                    return u;
                  });
                  setUniversities(updatedUniversities);
                  
                  // Обновляем выбранное партнерство
                  const updatedPartnership = updatedUniversities
                    .find(u => u.id === selectedPartnership.universityId)
                    ?.partnerships.find(p => p.id === selectedPartnership.id);
                  if (updatedPartnership) {
                    setSelectedPartnership(updatedPartnership);
                  }
                }
                setIsAddStudentsDialogOpen(false);
                setSelectedStudentIds([]);
              }}
              disabled={selectedStudentIds.length === 0}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно управления нотификациями */}
      <Dialog open={isNotificationsDialogOpen} onOpenChange={setIsNotificationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Управление нотификациями
            </DialogTitle>
            <DialogDescription>
              Выберите студентов и отправьте им уведомления на почту
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="send" className="w-full">
            <TabsList variant="grid2">
              <TabsTrigger value="send">Отправить уведомление</TabsTrigger>
              <TabsTrigger value="history">История отправленных</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Шаблоны</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTemplateDialogOpen(true)}
                  >
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Выбрать шаблон
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-subject">
                    Тема письма <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="notification-subject"
                    value={notificationFormData.subject}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, subject: e.target.value })}
                    placeholder="Например, Приглашение на стажировку"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-message">
                    Текст сообщения <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="notification-message"
                    value={notificationFormData.message}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })}
                    placeholder="Введите текст уведомления..."
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>
                    Получатели <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelect
                    options={selectedPartnership?.students?.map(s => ({
                      value: s.id,
                      label: `${s.fullName} (${s.email})`,
                    })) || []}
                    selected={notificationFormData.recipientIds}
                    onChange={(selected) => setNotificationFormData({ ...notificationFormData, recipientIds: selected })}
                    placeholder="Выберите студентов..."
                  />
                  {notificationFormData.recipientIds.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Выбрано студентов: {notificationFormData.recipientIds.length}
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotificationFormData({
                        subject: "",
                        message: "",
                        recipientIds: [],
                      });
                    }}
                  >
                    Очистить
                  </Button>
                  <Button
                    onClick={() => {
                      if (!notificationFormData.subject.trim() || !notificationFormData.message.trim() || notificationFormData.recipientIds.length === 0) {
                        return;
                      }
                      
                      const selectedStudents = selectedPartnership?.students?.filter(s => 
                        notificationFormData.recipientIds.includes(s.id)
                      ) || [];
                      
                      const newNotification: Notification = {
                        id: `notif-${Date.now()}`,
                        subject: notificationFormData.subject.trim(),
                        message: notificationFormData.message.trim(),
                        recipientIds: notificationFormData.recipientIds,
                        recipientEmails: selectedStudents.map(s => s.email),
                        sentAt: new Date(),
                        status: "sent",
                      };
                      
                      setNotifications([newNotification, ...notifications]);
                      setNotificationFormData({
                        subject: "",
                        message: "",
                        recipientIds: [],
                      });
                    }}
                    disabled={
                      !notificationFormData.subject.trim() ||
                      !notificationFormData.message.trim() ||
                      notificationFormData.recipientIds.length === 0
                    }
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Отправить уведомления
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-4">
              <div className="space-y-4">
                {/* Поиск по истории */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по теме или получателям..."
                    value={notificationSearchQuery}
                    onChange={(e) => setNotificationSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {notificationSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setNotificationSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Список уведомлений */}
                <div className="space-y-3">
                  {(() => {
                    const filteredNotifications = notifications.filter(notif => {
                      if (!notificationSearchQuery.trim()) return true;
                      const query = notificationSearchQuery.toLowerCase();
                      return (
                        notif.subject.toLowerCase().includes(query) ||
                        notif.message.toLowerCase().includes(query) ||
                        notif.recipientEmails.some(email => email.toLowerCase().includes(query))
                      );
                    });
                    
                    if (filteredNotifications.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">
                            {notificationSearchQuery ? "Уведомления не найдены" : "Нет отправленных уведомлений"}
                          </p>
                        </div>
                      );
                    }
                    
                    return filteredNotifications.map((notification) => {
                      const recipients = selectedPartnership?.students?.filter(s => 
                        notification.recipientIds.includes(s.id)
                      ) || [];
                      
                      return (
                        <Card key={notification.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{notification.subject}</h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        notification.status === "sent" && "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
                                        notification.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
                                        notification.status === "failed" && "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                      )}
                                    >
                                      {notification.status === "sent" && (
                                        <>
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Отправлено
                                        </>
                                      )}
                                      {notification.status === "pending" && (
                                        <>
                                          <Clock className="h-3 w-3 mr-1" />
                                          В очереди
                                        </>
                                      )}
                                      {notification.status === "failed" && "Ошибка"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(notification.sentAt)} {notification.sentAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Получатели ({recipients.length}):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {recipients.map((recipient) => (
                                    <Badge key={recipient.id} variant="secondary" className="text-xs">
                                      {recipient.fullName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
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

