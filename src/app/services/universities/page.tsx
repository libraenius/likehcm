"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, ClipboardCheck, Users, Settings, ExternalLink, FileText, Calendar, Link2, Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, X, ChevronLeft, ChevronsLeft, ChevronsRight, AlertCircle, Mail, Send, CheckCircle2, Clock, MapPin, Building2 } from "lucide-react";
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

// Моковые данные для вкладки "Мои партнерства"
const mockPartnerships: Partnership[] = [
  {
    id: "part-1",
    name: "Программа стажировок для студентов IT-направлений",
    universityId: "univ-1",
    universityName: "МГУ",
    type: "internship",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-06-30"),
    status: "active",
    link: "https://partnership.example.com/partnership/1",
  },
  {
    id: "part-2",
    name: "Совместная образовательная программа",
    universityId: "univ-2",
    universityName: "СПбГУ",
    type: "education",
    startDate: new Date("2024-02-01"),
    status: "active",
    link: "https://partnership.example.com/partnership/2",
  },
  {
    id: "part-3",
    name: "Программа рекрутинга выпускников",
    universityId: "univ-3",
    universityName: "МФТИ",
    type: "recruitment",
    startDate: new Date("2024-03-01"),
    status: "planned",
    link: "https://partnership.example.com/partnership/3",
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
  
  // Фильтрация данных
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return universities;
    
    const query = searchQuery.toLowerCase();
    return universities.map(university => {
      const universityMatches = 
        university.name.toLowerCase().includes(query) ||
        university.shortName?.toLowerCase().includes(query) ||
        university.city.toLowerCase().includes(query) ||
        university.region.toLowerCase().includes(query);
      
      const filteredPartnerships = university.partnerships.filter(partnership =>
        partnership.name.toLowerCase().includes(query) ||
        partnership.description?.toLowerCase().includes(query)
      );
      
      if (universityMatches || filteredPartnerships.length > 0) {
        return { ...university, partnerships: universityMatches ? university.partnerships : filteredPartnerships };
      }
      return null;
    }).filter(Boolean) as University[];
  }, [universities, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Единая платформа по работе с ВУЗами</h1>
          <p className="text-muted-foreground">
            Управление партнерствами с образовательными учреждениями
          </p>
        </div>
      </div>

      <Tabs defaultValue="my-partnerships" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-partnerships" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Мои партнерства</span>
          </TabsTrigger>
          <TabsTrigger value="students-partnerships" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Партнерства студентов</span>
          </TabsTrigger>
          <TabsTrigger value="administration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Администрирование</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-partnerships" className="space-y-6">
          {mockPartnerships.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  У вас пока нет партнерств
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Активные партнерства */}
              {(() => {
                const activePartnerships = mockPartnerships.filter(
                  (p) => p.status === "planned" || p.status === "active"
                );
                if (activePartnerships.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Активные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activePartnerships.map((partnership) => (
                        <Card key={partnership.id} className="border">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-base">{partnership.name}</h3>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs px-2 py-0.5 flex-shrink-0", getStatusColor(partnership.status))}
                                  >
                                    {getStatusText(partnership.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{partnership.universityName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="text-xs">
                                    {getPartnershipTypeText(partnership.type)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    {formatDate(partnership.startDate)}
                                    {partnership.endDate && ` - ${formatDate(partnership.endDate)}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {partnership.link && (
                              <div className="py-3 px-4 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">Ссылка:</span>
                                  <a
                                    href={partnership.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                                  >
                                    {partnership.link}
                                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Завершенные партнерства */}
              {(() => {
                const completedPartnerships = mockPartnerships.filter(
                  (p) => p.status === "completed" || p.status === "cancelled"
                );
                if (completedPartnerships.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Завершенные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {completedPartnerships.map((partnership) => (
                        <Card key={partnership.id} className="border">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-base">{partnership.name}</h3>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs px-2 py-0.5 flex-shrink-0", getStatusColor(partnership.status))}
                                  >
                                    {getStatusText(partnership.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{partnership.universityName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    {formatDate(partnership.startDate)}
                                    {partnership.endDate && ` - ${formatDate(partnership.endDate)}`}
                                  </span>
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

        <TabsContent value="students-partnerships" className="space-y-6">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                Партнерства студентов будут отображаться здесь
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administration" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Администрирование</h2>
              <p className="text-muted-foreground">
                Управление университетами и партнерствами
              </p>
            </div>
            <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Добавить университет/партнерство
            </Button>
          </div>

          {/* Поиск */}
          <div className="relative">
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
                    <Button onClick={handleCreate}>
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
              <div className="w-[480px] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
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
                            <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm break-words">{university.name}</div>
                              {university.description && (
                                <div className="text-xs text-muted-foreground break-words mt-0.5">
                                  {university.description.length > 40
                                    ? university.description.substring(0, 40) + "..."
                                    : university.description}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {university.partnerships.length}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Партнерства университета */}
                        {expandedUniversities.has(university.id) && (
                          <div className="ml-6 space-y-1">
                            {university.partnerships.map((partnership) => (
                              <div
                                key={partnership.id}
                                onClick={(e) => {
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
                                  <Link2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium break-words">{partnership.name}</div>
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs mt-1", getStatusColor(partnership.status))}
                                    >
                                      {getStatusText(partnership.status)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
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
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Студенты ({selectedPartnership.students?.length || 0})
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsNotificationsDialogOpen(true)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Управление нотификациями
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Получаем ID уже добавленных студентов
                                  const existingStudentIds = selectedPartnership.students?.map(s => {
                                    // Ищем сотрудника по email или fullName
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
                                Добавить студентов
                              </Button>
                            </div>
                          </div>
                          {selectedPartnership.students && selectedPartnership.students.length > 0 ? (
                              <div className="space-y-3">
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                      <TableHead className="w-[250px]">Студент</TableHead>
                                      <TableHead className="w-[200px]">Должность / Подразделение</TableHead>
                                      <TableHead className="w-[300px]">Уникальная ссылка на партнерство</TableHead>
                                        <TableHead className="w-[150px]">Статус</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(() => {
                                        // Логика пагинации
                                        const totalPages = Math.ceil((selectedPartnership.students?.length || 0) / studentsItemsPerPage);
                                        const startIndex = (studentsCurrentPage - 1) * studentsItemsPerPage;
                                        const endIndex = startIndex + studentsItemsPerPage;
                                        const paginatedStudents = selectedPartnership.students?.slice(startIndex, endIndex) || [];
                                        
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
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-xs px-2 py-0.5",
                                                    getStudentStatusColor(student.status)
                                                  )}
                                                >
                                                  {getStudentStatusText(student.status)}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        );
                                      })()}
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                {/* Пагинация */}
                                {selectedPartnership.students && selectedPartnership.students.length > 0 && (() => {
                                  const totalPages = Math.ceil(selectedPartnership.students.length / studentsItemsPerPage);
                                  
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
                                          из {selectedPartnership.students.length}
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
        </TabsContent>

      </Tabs>

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

