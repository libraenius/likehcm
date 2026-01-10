"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyPositionCard } from "@/components/succession/key-position-card";
import { SuccessorCard } from "@/components/succession/successor-card";
import { ReadinessIndicator } from "@/components/succession/readiness-indicator";
import {
  getKeyPositions,
  createKeyPosition,
  updateKeyPosition,
  deleteKeyPosition,
  getSuccessors,
  createSuccessor,
  updateSuccessor,
  deleteSuccessor,
  getSuccessorsByPositionId,
} from "@/lib/succession/services";
import {
  calculateReadiness,
  calculatePositionRisk,
  getRiskColor,
  getRiskLabel,
  getCriticalityLabel,
} from "@/lib/succession/calculations";
import type { KeyPosition, Successor, PositionCriticality, RiskLevel } from "@/types/succession";
import type { Profile, UserSkill, TeamMember } from "@/types";
import { getProfiles, getProfileById } from "@/lib/reference-data";
import { getUserProfile } from "@/lib/data";
import { Plus, Search, Filter, X, AlertCircle, TrendingUp, Users, Target, BarChart3, UserPlus, Edit, Trash2 } from "lucide-react";

// Моковые данные подразделений (из сервиса карьеры)
interface Department {
  id: string;
  name: string;
  parentId?: string;
}

const mockDepartments: Department[] = [
  { id: "dept-1", name: "Департамент автоматизации внутренних сервисов" },
  { id: "dept-2", name: "Управление развития общекорпоративных систем", parentId: "dept-1" },
  { id: "dept-3", name: "Управление разработки банковских продуктов", parentId: "dept-1" },
  { id: "dept-4", name: "Департамент информационной безопасности" },
  { id: "dept-5", name: "Управление качества и тестирования" },
];

// Моковые данные команды (из сервиса карьеры)
const mockTeamMembers: (TeamMember & { departmentId?: string })[] = [
  {
    id: "member-1",
    name: "Петров Иван Сергеевич",
    lastName: "Петров",
    firstName: "Иван",
    middleName: "Сергеевич",
    position: "Главный инженер",
    email: "ivan.petrov@example.com",
    mainProfileId: "profile-1",
    additionalProfileIds: ["profile-3"],
    avatar: undefined,
    departmentId: "dept-2",
  },
  {
    id: "member-2",
    name: "Сидорова Мария Александровна",
    lastName: "Сидорова",
    firstName: "Мария",
    middleName: "Александровна",
    position: "Ведущий разработчик",
    email: "maria.sidorova@example.com",
    mainProfileId: "profile-2",
    additionalProfileIds: [],
    avatar: undefined,
    departmentId: "dept-2",
  },
  {
    id: "member-3",
    name: "Иванов Алексей Дмитриевич",
    lastName: "Иванов",
    firstName: "Алексей",
    middleName: "Дмитриевич",
    position: "Старший разработчик",
    email: "alexey.ivanov@example.com",
    mainProfileId: "profile-3",
    additionalProfileIds: ["profile-1"],
    avatar: undefined,
    departmentId: "dept-3",
  },
];

export default function SuccessionPage() {
  const [positions, setPositions] = useState<KeyPosition[]>([]);
  const [successors, setSuccessors] = useState<Successor[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterCriticality, setFilterCriticality] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [isSuccessorDialogOpen, setIsSuccessorDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<KeyPosition | null>(null);
  const [editingSuccessor, setEditingSuccessor] = useState<Successor | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [deletePositionId, setDeletePositionId] = useState<string | null>(null);
  const [deleteSuccessorId, setDeleteSuccessorId] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // Форма позиции
  const [positionForm, setPositionForm] = useState({
    title: "",
    departmentId: "",
    currentHolderId: "",
    profileId: "",
    criticality: "medium" as PositionCriticality,
    description: "",
  });

  // Форма преемника
  const [successorForm, setSuccessorForm] = useState({
    employeeId: "",
    readinessLevel: 3 as 1 | 2 | 3 | 4 | 5,
    readinessPercentage: 60,
    status: "developing" as Successor["status"],
    notes: "",
    estimatedReadinessDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedPositions = getKeyPositions();
    const loadedSuccessors = getSuccessors();
    const loadedProfiles = getProfiles();

    // Обогащаем данные для удобства отображения
    const enrichedPositions = loadedPositions.map((pos) => {
      const dept = mockDepartments.find((d) => d.id === pos.departmentId);
      const profile = loadedProfiles.find((p) => p.id === pos.profileId);
      const holder = mockTeamMembers.find((m) => m.id === pos.currentHolderId);
      const posSuccessors = loadedSuccessors.filter((s) => s.positionId === pos.id);
      const riskLevel = calculatePositionRisk(pos.criticality, posSuccessors);

      return {
        ...pos,
        departmentName: dept?.name,
        profileName: profile?.name,
        currentHolderName: holder?.name,
        riskLevel,
      };
    });

    const enrichedSuccessors = loadedSuccessors.map((suc) => {
      const employee = mockTeamMembers.find((m) => m.id === suc.employeeId);
      const position = enrichedPositions.find((p) => p.id === suc.positionId);
      return {
        ...suc,
        employeeName: employee?.name,
        employeePosition: employee?.position,
      };
    });

    setPositions(enrichedPositions);
    setSuccessors(enrichedSuccessors);
    setProfiles(loadedProfiles);
  };

  // Статистика
  const statistics = useMemo(() => {
    const totalPositions = positions.length;
    const positionsWithSuccessors = positions.filter(
      (p) => successors.filter((s) => s.positionId === p.id).length > 0
    ).length;
    const totalSuccessors = successors.length;
    const readySuccessors = successors.filter((s) => s.status === "ready" || s.readinessLevel >= 5).length;
    const developingSuccessors = successors.filter((s) => s.status === "developing").length;
    const averageReadiness =
      successors.length > 0
        ? Math.round(successors.reduce((sum, s) => sum + s.readinessPercentage, 0) / successors.length)
        : 0;
    const highRiskPositions = positions.filter((p) => p.riskLevel === "high").length;
    const mediumRiskPositions = positions.filter((p) => p.riskLevel === "medium").length;
    const lowRiskPositions = positions.filter((p) => p.riskLevel === "low").length;

    return {
      totalPositions,
      positionsWithSuccessors,
      positionsWithoutSuccessors: totalPositions - positionsWithSuccessors,
      totalSuccessors,
      readySuccessors,
      developingSuccessors,
      averageReadiness,
      highRiskPositions,
      mediumRiskPositions,
      lowRiskPositions,
    };
  }, [positions, successors]);

  // Фильтрация позиций
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !pos.title.toLowerCase().includes(query) &&
          !pos.departmentName?.toLowerCase().includes(query) &&
          !pos.profileName?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filterDepartment !== "all" && pos.departmentId !== filterDepartment) {
        return false;
      }
      if (filterCriticality !== "all" && pos.criticality !== filterCriticality) {
        return false;
      }
      if (filterRisk !== "all" && pos.riskLevel !== filterRisk) {
        return false;
      }
      return true;
    });
  }, [positions, searchQuery, filterDepartment, filterCriticality, filterRisk]);

  // Обработчики позиций
  const handleCreatePosition = () => {
    setEditingPosition(null);
    setPositionForm({
      title: "",
      departmentId: "",
      currentHolderId: "",
      profileId: "",
      criticality: "medium",
      description: "",
    });
    setIsPositionDialogOpen(true);
  };

  const handleEditPosition = (position: KeyPosition) => {
    setEditingPosition(position);
    setPositionForm({
      title: position.title,
      departmentId: position.departmentId,
      currentHolderId: position.currentHolderId || "",
      profileId: position.profileId,
      criticality: position.criticality,
      description: position.description || "",
    });
    setIsPositionDialogOpen(true);
  };

  const handleSavePosition = () => {
    if (!positionForm.title || !positionForm.departmentId || !positionForm.profileId) {
      setErrorAlert("Заполните все обязательные поля");
      return;
    }

    const profile = profiles.find((p) => p.id === positionForm.profileId);
    if (!profile) {
      setErrorAlert("Профиль не найден");
      return;
    }

    const positionData = {
      title: positionForm.title,
      departmentId: positionForm.departmentId,
      currentHolderId: positionForm.currentHolderId || undefined,
      profileId: positionForm.profileId,
      criticality: positionForm.criticality,
      description: positionForm.description,
      requiredCompetences: profile.requiredCompetences,
    };

    if (editingPosition) {
      updateKeyPosition(editingPosition.id, positionData);
    } else {
      createKeyPosition(positionData);
    }

    setIsPositionDialogOpen(false);
    loadData();
    setErrorAlert(null);
  };

  const handleDeletePosition = (id: string) => {
    setDeletePositionId(id);
  };

  const confirmDeletePosition = () => {
    if (deletePositionId) {
      deleteKeyPosition(deletePositionId);
      setDeletePositionId(null);
      loadData();
    }
  };

  // Обработчики преемников
  const handleAddSuccessor = (positionId: string) => {
    setSelectedPositionId(positionId);
    setEditingSuccessor(null);
    setSuccessorForm({
      employeeId: "",
      readinessLevel: 3,
      readinessPercentage: 60,
      status: "developing",
      notes: "",
      estimatedReadinessDate: "",
    });
    setIsSuccessorDialogOpen(true);
  };

  const handleEditSuccessor = (successor: Successor) => {
    setEditingSuccessor(successor);
    setSelectedPositionId(successor.positionId);
    setSuccessorForm({
      employeeId: successor.employeeId,
      readinessLevel: successor.readinessLevel,
      readinessPercentage: successor.readinessPercentage,
      status: successor.status,
      notes: successor.notes || "",
      estimatedReadinessDate: successor.estimatedReadinessDate || "",
    });
    setIsSuccessorDialogOpen(true);
  };

  const handleSaveSuccessor = () => {
    if (!selectedPositionId || !successorForm.employeeId) {
      setErrorAlert("Выберите позицию и сотрудника");
      return;
    }

    const position = positions.find((p) => p.id === selectedPositionId);
    if (!position) {
      setErrorAlert("Позиция не найдена");
      return;
    }

    // Получаем навыки сотрудника (из профиля пользователя или моковых данных)
    const employee = mockTeamMembers.find((m) => m.id === successorForm.employeeId);
    if (!employee) {
      setErrorAlert("Сотрудник не найден");
      return;
    }

    // Для расчета готовности используем форму или пересчитываем
    const readiness = calculateReadiness(
      [], // В реальном приложении здесь будут навыки сотрудника
      position.requiredCompetences
    );

    const successorData: Omit<Successor, "id" | "assignedAt"> = {
      positionId: selectedPositionId,
      employeeId: successorForm.employeeId,
      readinessLevel: successorForm.readinessLevel,
      readinessPercentage: successorForm.readinessPercentage,
      status: successorForm.status,
      notes: successorForm.notes || undefined,
      estimatedReadinessDate: successorForm.estimatedReadinessDate || undefined,
      assignedBy: "current-user", // В реальном приложении из контекста
      skillGaps: readiness.gaps,
    };

    if (editingSuccessor) {
      updateSuccessor(editingSuccessor.id, successorData);
    } else {
      createSuccessor(successorData);
    }

    setIsSuccessorDialogOpen(false);
    setSelectedPositionId(null);
    loadData();
    setErrorAlert(null);
  };

  const handleDeleteSuccessor = (id: string) => {
    setDeleteSuccessorId(id);
  };

  const confirmDeleteSuccessor = () => {
    if (deleteSuccessorId) {
      deleteSuccessor(deleteSuccessorId);
      setDeleteSuccessorId(null);
      loadData();
    }
  };

  useEffect(() => {
    if (errorAlert) {
      const timer = setTimeout(() => setErrorAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorAlert]);

  return (
    <div className="space-y-6">
      {errorAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{errorAlert}</AlertDescription>
        </Alert>
      )}

      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Преемники</h1>
          <p className="text-muted-foreground">
            Управление ключевыми позициями и преемниками
          </p>
        </div>
        <Button onClick={handleCreatePosition} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Добавить позицию
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="positions">
            <Target className="mr-2 h-4 w-4" />
            Ключевые позиции
          </TabsTrigger>
          <TabsTrigger value="successors">
            <Users className="mr-2 h-4 w-4" />
            Преемники
          </TabsTrigger>
        </TabsList>

        {/* Вкладка Обзор */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего позиций</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalPositions}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.positionsWithSuccessors} с преемниками
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Преемники</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalSuccessors}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.readySuccessors} готовы
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Средняя готовность</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.averageReadiness}%</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.developingSuccessors} в развитии
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Высокий риск</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.highRiskPositions}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.mediumRiskPositions} средний, {statistics.lowRiskPositions} низкий
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Матрица рисков */}
          <Card>
            <CardHeader>
              <CardTitle>Матрица рисков</CardTitle>
              <CardDescription>
                Распределение позиций по критичности и готовности преемников
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {["low", "medium", "high", "critical"].map((crit) => (
                  <div key={crit} className="space-y-1">
                    <div className="text-xs font-medium text-center">
                      {getCriticalityLabel(crit as PositionCriticality)}
                    </div>
                    {["low", "medium", "high"].map((risk) => {
                      const count = positions.filter(
                        (p) => p.criticality === crit && p.riskLevel === risk
                      ).length;
                      return (
                        <div
                          key={risk}
                          className={`p-2 text-center text-xs rounded ${
                            risk === "high"
                              ? "bg-red-50 text-red-700"
                              : risk === "medium"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {count}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка Ключевые позиции */}
        <TabsContent value="positions" className="space-y-4">
          {/* Фильтры */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, подразделению..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Подразделение" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все подразделения</SelectItem>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCriticality} onValueChange={setFilterCriticality}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Критичность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="low">Низкая</SelectItem>
                <SelectItem value="medium">Средняя</SelectItem>
                <SelectItem value="high">Высокая</SelectItem>
                <SelectItem value="critical">Критическая</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Риск" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Список позиций */}
          {filteredPositions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {positions.length === 0
                  ? "Нет ключевых позиций. Создайте первую позицию."
                  : "Нет позиций, соответствующих фильтрам."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPositions.map((position) => {
                const positionSuccessors = successors.filter(
                  (s) => s.positionId === position.id
                );
                return (
                  <KeyPositionCard
                    key={position.id}
                    position={position}
                    successors={positionSuccessors}
                    onEdit={handleEditPosition}
                    onDelete={handleDeletePosition}
                    onAddSuccessor={handleAddSuccessor}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Вкладка Преемники */}
        <TabsContent value="successors" className="space-y-4">
          {successors.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Нет назначенных преемников.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {successors.map((successor) => {
                const position = positions.find((p) => p.id === successor.positionId);
                return (
                  <SuccessorCard
                    key={successor.id}
                    successor={successor}
                    positionTitle={position?.title}
                    onEdit={handleEditSuccessor}
                    onDelete={handleDeleteSuccessor}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог создания/редактирования позиции */}
      <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? "Редактировать позицию" : "Создать позицию"}
            </DialogTitle>
            <DialogDescription>
              {editingPosition
                ? "Внесите изменения в ключевую позицию"
                : "Заполните информацию о ключевой позиции"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Название должности <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={positionForm.title}
                onChange={(e) =>
                  setPositionForm({ ...positionForm, title: e.target.value })
                }
                placeholder="Например: Руководитель разработки"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">
                Подразделение <span className="text-destructive">*</span>
              </Label>
              <Select
                value={positionForm.departmentId}
                onValueChange={(value) =>
                  setPositionForm({ ...positionForm, departmentId: value })
                }
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Выберите подразделение" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">Профиль <span className="text-destructive">*</span></Label>
              <Select
                value={positionForm.profileId}
                onValueChange={(value) =>
                  setPositionForm({ ...positionForm, profileId: value })
                }
              >
                <SelectTrigger id="profile">
                  <SelectValue placeholder="Выберите профиль" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentHolder">Текущий держатель</Label>
              <Select
                value={positionForm.currentHolderId}
                onValueChange={(value) =>
                  setPositionForm({ ...positionForm, currentHolderId: value })
                }
              >
                <SelectTrigger id="currentHolder">
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не назначен</SelectItem>
                  {mockTeamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticality">Критичность</Label>
              <Select
                value={positionForm.criticality}
                onValueChange={(value) =>
                  setPositionForm({
                    ...positionForm,
                    criticality: value as PositionCriticality,
                  })
                }
              >
                <SelectTrigger id="criticality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкая</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="high">Высокая</SelectItem>
                  <SelectItem value="critical">Критическая</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={positionForm.description}
                onChange={(e) =>
                  setPositionForm({ ...positionForm, description: e.target.value })
                }
                placeholder="Дополнительная информация о позиции"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPositionDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSavePosition}>
              {editingPosition ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог создания/редактирования преемника */}
      <Dialog open={isSuccessorDialogOpen} onOpenChange={setIsSuccessorDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSuccessor ? "Редактировать преемника" : "Добавить преемника"}
            </DialogTitle>
            <DialogDescription>
              {editingSuccessor
                ? "Внесите изменения в информацию о преемнике"
                : "Выберите сотрудника и укажите его готовность"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedPositionId && (
              <div className="space-y-2">
                <Label htmlFor="position">
                  Позиция <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedPositionId || ""}
                  onValueChange={setSelectedPositionId}
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Выберите позицию" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.title} - {pos.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="employee">
                Сотрудник <span className="text-destructive">*</span>
              </Label>
              <Select
                value={successorForm.employeeId}
                onValueChange={(value) =>
                  setSuccessorForm({ ...successorForm, employeeId: value })
                }
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="readinessLevel">Уровень готовности</Label>
              <Select
                value={successorForm.readinessLevel.toString()}
                onValueChange={(value) =>
                  setSuccessorForm({
                    ...successorForm,
                    readinessLevel: parseInt(value) as 1 | 2 | 3 | 4 | 5,
                    readinessPercentage: parseInt(value) * 20 - 10, // Примерная формула
                  })
                }
              >
                <SelectTrigger id="readinessLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Не готов</SelectItem>
                  <SelectItem value="2">2 - Требует развития</SelectItem>
                  <SelectItem value="3">3 - В развитии</SelectItem>
                  <SelectItem value="4">4 - Почти готов</SelectItem>
                  <SelectItem value="5">5 - Готов</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="readinessPercentage">Процент готовности</Label>
              <Input
                id="readinessPercentage"
                type="number"
                min="0"
                max="100"
                value={successorForm.readinessPercentage}
                onChange={(e) =>
                  setSuccessorForm({
                    ...successorForm,
                    readinessPercentage: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={successorForm.status}
                onValueChange={(value) =>
                  setSuccessorForm({
                    ...successorForm,
                    status: value as Successor["status"],
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">Выявлен</SelectItem>
                  <SelectItem value="developing">В развитии</SelectItem>
                  <SelectItem value="ready">Готов</SelectItem>
                  <SelectItem value="not_ready">Не готов</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDate">Ожидаемая дата готовности</Label>
              <Input
                id="estimatedDate"
                type="date"
                value={successorForm.estimatedReadinessDate}
                onChange={(e) =>
                  setSuccessorForm({
                    ...successorForm,
                    estimatedReadinessDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={successorForm.notes}
                onChange={(e) =>
                  setSuccessorForm({ ...successorForm, notes: e.target.value })
                }
                placeholder="Дополнительная информация о преемнике"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuccessorDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveSuccessor}>
              {editingSuccessor ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления позиции */}
      <AlertDialog
        open={deletePositionId !== null}
        onOpenChange={(open) => !open && setDeletePositionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту позицию? Это действие также удалит всех
              назначенных преемников.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePosition} className="bg-destructive">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения удаления преемника */}
      <AlertDialog
        open={deleteSuccessorId !== null}
        onOpenChange={(open) => !open && setDeleteSuccessorId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этого преемника?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSuccessor} className="bg-destructive">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}








