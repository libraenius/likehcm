"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, ClipboardCheck, Users, Settings, ExternalLink, FileText, Calendar, Link2, Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, X, ChevronLeft, ChevronsLeft, ChevronsRight, AlertCircle, Mail, Send, CheckCircle2, Clock, MapPin, Building2, Archive, ArchiveRestore, Filter, SortAsc, SortDesc, BarChart3, MessageSquare, History, FileText as FileTextIcon, CheckSquare, Square, Edit3, Copy, Tag, Eye, EyeOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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

// Функция для получения цвета статуса
const getStatusColor = (status: Partnership["status"]) => {
  switch (status) {
    case "planned":
      return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    case "active":
      return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
    case "completed":
      return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
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

// Функция для получения цвета статуса студента
const getStudentStatusColor = (status: Student["status"]) => {
  switch (status) {
    case "not-started":
      return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
    case "invited":
      return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    case "in-progress":
      return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
    case "completed":
      return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
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
  const [selectedUniversityIds, setSelectedUniversityIds] = useState<Set<string>>(new Set());
  const [selectedPartnershipIds, setSelectedPartnershipIds] = useState<Set<string>>(new Set());
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

  // Массовые операции
  const handleBulkDeletePartnerships = useCallback(() => {
    if (selectedPartnershipIds.size === 0) return;
    
    setUniversities(universities.map(u => ({
      ...u,
      partnerships: u.partnerships.filter(p => !selectedPartnershipIds.has(p.id)),
    })));
    
    if (selectedPartnership && selectedPartnershipIds.has(selectedPartnership.id)) {
      setSelectedPartnership(null);
    }
    setSelectedPartnershipIds(new Set());
  }, [selectedPartnershipIds, universities, selectedPartnership]);

  const handleBulkChangeStatus = useCallback((newStatus: Partnership["status"]) => {
    if (selectedPartnershipIds.size === 0) return;
    
    setUniversities(universities.map(u => ({
      ...u,
      partnerships: u.partnerships.map(p =>
        selectedPartnershipIds.has(p.id) ? { ...p, status: newStatus } : p
      ),
    })));
    
    if (selectedPartnership && selectedPartnershipIds.has(selectedPartnership.id)) {
      setSelectedPartnership({ ...selectedPartnership, status: newStatus });
    }
    setSelectedPartnershipIds(new Set());
  }, [selectedPartnershipIds, universities, selectedPartnership]);

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

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Единая платформа по работе с ВУЗами</h1>
            <p className="text-muted-foreground">
              Управление партнерствами с образовательными учреждениями
            </p>
          </div>
          <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>

          {/* Поиск */}
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
          </div>
          
          {/* Массовые операции */}
          {selectedPartnershipIds.size > 0 && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Выбрано партнерств: {selectedPartnershipIds.size}
                  </span>
                  <div className="flex gap-2">
                    <Select onValueChange={(v) => handleBulkChangeStatus(v as Partnership["status"])}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Изменить статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Запланировано</SelectItem>
                        <SelectItem value="active">Активно</SelectItem>
                        <SelectItem value="completed">Завершено</SelectItem>
                        <SelectItem value="cancelled">Отменено</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" onClick={handleBulkDeletePartnerships}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedPartnershipIds(new Set())}>
                      Отменить выбор
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                              const isSelected = selectedPartnershipIds.has(partnership.id);
                              return (
                                <div
                                  key={partnership.id}
                                  onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button, input')) return;
                                    e.stopPropagation();
                                    handleSelectPartnership(partnership);
                                  }}
                                  className={cn(
                                    "p-2 rounded-md cursor-pointer transition-colors text-sm",
                                    selectedPartnership?.id === partnership.id
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-muted/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        const newSet = new Set(selectedPartnershipIds);
                                        if (checked) {
                                          newSet.add(partnership.id);
                                        } else {
                                          newSet.delete(partnership.id);
                                        }
                                        setSelectedPartnershipIds(newSet);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
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
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                      <TableHead className="w-[250px]">Студент</TableHead>
                                      <TableHead className="w-[200px]">Должность / Подразделение</TableHead>
                                      <TableHead className="w-[300px]">Уникальная ссылка на партнерство</TableHead>
                                        <TableHead className="w-[150px]">Статус</TableHead>
                                        <TableHead className="w-[120px]">Действия</TableHead>
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
                                              <TableCell>
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
                                              <TableCell>
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
            <DialogContent className="max-w-2xl">
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
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
            <DialogContent className="max-w-2xl">
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

          {/* Диалог фильтров */}
          <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
            <DialogContent className="max-w-2xl">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send">Отправить уведомление</TabsTrigger>
              <TabsTrigger value="history">История отправленных</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4 mt-4">
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
            
            <TabsContent value="history" className="space-y-4 mt-4">
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
                                        notification.status === "sent" && "bg-green-100 text-green-700 border-green-300",
                                        notification.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                                        notification.status === "failed" && "bg-red-100 text-red-700 border-red-300"
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
    </div>
  );
}

