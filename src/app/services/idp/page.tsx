"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { NotebookPen, Users, Settings, FileText, Calendar, Plus, ChevronDown, ChevronRight, ChevronLeft, Pencil, Trash2, Search, X, CheckCircle2, Clock, Target, Eye, EyeOff, ClipboardCheck, BookOpen, AlertCircle, Info } from "lucide-react";
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
  
  // Состояние для администрирования - загружаем из localStorage или используем начальные данные
  const [idps, setIDPs] = useState<IDP[]>(() => {
    if (typeof window !== "undefined") {
      return getIDPs();
    }
    return initialMockIDPs;
  });

  // Синхронизация данных при монтировании
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getIDPs();
      if (stored.length > 0) {
        setIDPs(stored);
      }
    }
  }, []);
  const [selectedIDP, setSelectedIDP] = useState<IDP | null>(null);
  const [expandedIDPs, setExpandedIDPs] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [editingIDP, setEditingIDP] = useState<IDP | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingForCurrentUser, setIsCreatingForCurrentUser] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [idpErrors, setIdpErrors] = useState<Record<string, string>>({});
  const [createScenario, setCreateScenario] = useState<"classic" | "one-to-one" | null>(null);

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
        if (!idpFormData.employeeId) {
          errors.employeeId = "Выберите сотрудника";
        }
        if (!idpFormData.managerId) {
          errors.managerId = "Выберите руководителя";
        }
        break;
      case 3: // Компетенции и оценка - опциональные поля, валидация не требуется
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">ИПР</h1>
          <p className="text-muted-foreground">
            Управление индивидуальными планами развития
          </p>
        </div>
      </div>

      <Tabs defaultValue="my-idp" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="my-idp">
            Мои ИПР
          </TabsTrigger>
          <TabsTrigger value="employees-idp">
            ИПР сотрудников
          </TabsTrigger>
          <TabsTrigger value="administration">
            Администрирование
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-idp" className="mt-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Мои ИПР</h2>
              <p className="text-muted-foreground">
                Управление вашими индивидуальными планами развития
              </p>
            </div>
            <Button onClick={() => handleCreate(true)} size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Создать ИПР
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
                  <Button onClick={() => handleCreate(true)} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Создать ИПР
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Активные ИПР */}
              {(() => {
                const activeIDPs = myIDPs.filter(
                  (idp) => idp.status === "draft" || idp.status === "in-progress"
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

              {/* Завершенные ИПР */}
              {(() => {
                const completedIDPs = myIDPs.filter(
                  (idp) => idp.status === "completed" || idp.status === "cancelled"
                );
                if (completedIDPs.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Завершенные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {completedIDPs.map((idp) => (
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                ИПР сотрудников
              </CardTitle>
              <CardDescription>
                Просмотр и управление индивидуальными планами развития сотрудников
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employeesIDPs.length === 0 ? (
                <p className="text-muted-foreground">
                  У сотрудников пока нет индивидуальных планов развития
                </p>
              ) : (
                <div className="space-y-4">
                  {employeesIDPs.map((idp) => (
                    <Card 
                      key={idp.id} 
                      className="border cursor-pointer hover:border-primary transition-colors"
                      onClick={() => router.push(`/services/idp/${idp.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getInitials(idp.employeeName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{idp.employeeName}</h3>
                                <p className="text-sm text-muted-foreground">{idp.employeePosition}</p>
                              </div>
                            </div>
                            <div className="ml-13 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium">{idp.title}</h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {getIDPTypeText(idp.type)}
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
                                <p className="text-sm text-muted-foreground">{idp.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                                  {formatDate(idp.startDate)} - {formatDate(idp.endDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administration" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Администрирование</h2>
              <p className="text-muted-foreground">
                Управление индивидуальными планами развития
              </p>
            </div>
            <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Создать ИПР
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

          {/* Список ИПР */}
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
            <div className="space-y-3">
              {filteredIDPs.map((idp) => (
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
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0.5"
                              >
                                {getIDPTypeText(idp.type)}
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
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditIDP(idp)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteIDP(idp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Выбор типа ИПР, компетенций и связи с оценкой</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Настройка периода, руководителя и видимости</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
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
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Автоматическое заполнение на основе встречи</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Связь с результатами оценки и обратной связи</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
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
              <div className="flex items-center gap-2 w-full pb-2">
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
                          isCompleted && "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30",
                          !isCurrent && !isCompleted && isAccessible && "hover:bg-muted"
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
                              "text-sm font-medium truncate",
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
                      {index < IDP_STEPS.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Заголовок шага */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="text-xl font-bold">{IDP_STEPS[currentStep - 1].title}</h3>
                <p className="text-muted-foreground text-sm">{IDP_STEPS[currentStep - 1].description}</p>
              </div>

              {/* Содержимое шагов */}
              <div className="min-h-[400px] space-y-4">
                {/* Шаг 1: Основная информация */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название ИПР *</Label>
                      <Input
                        id="title"
                        value={idpFormData.title}
                        onChange={(e) => {
                          setIDPFormData({ ...idpFormData, title: e.target.value });
                          if (idpErrors.title) setIdpErrors({ ...idpErrors, title: "" });
                        }}
                        placeholder="Например: Развитие лидерских компетенций"
                        className={cn(idpErrors.title && "border-destructive")}
                      />
                      {idpErrors.title && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {idpErrors.title}
                        </p>
                      )}
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Дата начала *</Label>
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
                        <Label htmlFor="endDate">Дата окончания *</Label>
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">Сотрудник *</Label>
                      {isCreatingForCurrentUser ? (
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
                        <>
                          <Select
                            value={idpFormData.employeeId}
                            onValueChange={(value) => {
                              setIDPFormData({ ...idpFormData, employeeId: value });
                              if (idpErrors.employeeId) setIdpErrors({ ...idpErrors, employeeId: "" });
                            }}
                          >
                            <SelectTrigger id="employee" className={cn(idpErrors.employeeId && "border-destructive")}>
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
                          {idpErrors.employeeId && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {idpErrors.employeeId}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manager">Руководитель *</Label>
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
                {currentStep === 3 && (
                  <div className="space-y-4">
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


              </div>

              {/* Навигация */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                <div className="text-sm text-muted-foreground">
                  Шаг {currentStep} из {IDP_STEPS.length}
                </div>
                {currentStep < IDP_STEPS.length ? (
                  <Button type="button" onClick={handleNextStep}>
                    Далее
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSaveIDP}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Создать ИПР
                  </Button>
                )}
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
    </div>
  );
}
