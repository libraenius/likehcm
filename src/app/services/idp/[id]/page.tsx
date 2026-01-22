"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Pencil, 
  Send, 
  CheckCircle2, 
  Calendar, 
  User, 
  Target, 
  BookOpen, 
  ClipboardCheck,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Clock,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getStatusBadgeColor } from "@/lib/badge-colors";

// Типы импортируются из общего файла

// Импорт общих данных
import {
  mockCompetencies,
  mockAssessments,
  getIDPs,
  saveIDPs,
  updateIDP,
  getIDPTypeText,
  type IDP,
  type Competency,
  type Assessment,
  type IDPGoal,
  type IDPAction,
  type IDPType,
  type IDPScenario,
} from "@/lib/idp/mock-data";


const getStatusColor = (status: IDP["status"]) => {
  return getStatusBadgeColor(status);
};

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

const formatDate = (date: Date) => {
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "??";
};

export default function IDPDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { setCustomLabel } = useBreadcrumb();
  const idpId = params.id as string;

  const [idps, setIDPs] = useState<IDP[]>(() => getIDPs());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isSendForApprovalDialogOpen, setIsSendForApprovalDialogOpen] = useState(false);
  const [selectedCompetencyForGoal, setSelectedCompetencyForGoal] = useState<string>("");

  const selectedIDP = useMemo(() => {
    return idps.find(idp => idp.id === idpId) || null;
  }, [idps, idpId]);

  // Состояние для редактирования
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // Состояние для добавления цели
  const [goalFormData, setGoalFormData] = useState({
    competencyId: "",
    title: "",
    description: "",
    targetDate: "",
  });

  // Устанавливаем название ИПР в breadcrumbs
  useEffect(() => {
    if (selectedIDP) {
      setCustomLabel(selectedIDP.title);
    }
    return () => {
      setCustomLabel(null);
    };
  }, [selectedIDP, setCustomLabel]);

  // Если ИПР не найден
  if (!selectedIDP) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ИПР не найден</h3>
              <p className="text-muted-foreground mb-4">
                ИПР с указанным идентификатором не существует
              </p>
              <Button onClick={() => router.push("/services/idp")}>
                Вернуться к списку ИПР
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Получаем компетенции для отображения
  const selectedCompetencies = useMemo(() => {
    return mockCompetencies.filter(comp => selectedIDP.competencyIds.includes(comp.id));
  }, [selectedIDP]);

  // Группируем цели по компетенциям
  const goalsByCompetency = useMemo(() => {
    const grouped: Record<string, { competency: Competency; goals: IDPGoal[] }> = {};
    
    selectedIDP.competencyIds.forEach(compId => {
      const competency = mockCompetencies.find(c => c.id === compId);
      if (competency) {
        const goals = selectedIDP.goals.filter(g => g.competencyId === compId);
        if (goals.length > 0 || selectedIDP.competencyIds.includes(compId)) {
          grouped[compId] = { competency, goals };
        }
      }
    });

    // Добавляем компетенции без целей
    selectedIDP.competencyIds.forEach(compId => {
      if (!grouped[compId]) {
        const competency = mockCompetencies.find(c => c.id === compId);
        if (competency) {
          grouped[compId] = { competency, goals: [] };
        }
      }
    });

    return grouped;
  }, [selectedIDP]);

  // Открытие диалога редактирования
  const handleOpenEdit = () => {
    setEditFormData({
      title: selectedIDP.title,
      description: selectedIDP.description || "",
      startDate: selectedIDP.startDate.toISOString().split("T")[0],
      endDate: selectedIDP.endDate.toISOString().split("T")[0],
    });
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений
  const handleSaveEdit = () => {
    if (!editFormData.title.trim() || !editFormData.startDate || !editFormData.endDate) {
      return;
    }

    const updatedIDP: IDP = {
      ...selectedIDP,
      title: editFormData.title.trim(),
      description: editFormData.description.trim() || undefined,
      startDate: new Date(editFormData.startDate),
      endDate: new Date(editFormData.endDate),
      updatedAt: new Date(),
    };

    const updated = idps.map(idp => idp.id === selectedIDP.id ? updatedIDP : idp);
    setIDPs(updated);
    saveIDPs(updated);
    setIsEditDialogOpen(false);
  };

  // Открытие диалога добавления цели
  const handleOpenAddGoal = (competencyId: string) => {
    setSelectedCompetencyForGoal(competencyId);
    setGoalFormData({
      competencyId,
      title: "",
      description: "",
      targetDate: "",
    });
    setIsAddGoalDialogOpen(true);
  };

  // Добавление цели
  const handleAddGoal = () => {
    if (!goalFormData.title.trim() || !goalFormData.competencyId || !goalFormData.targetDate) {
      return;
    }

    const newGoal: IDPGoal = {
      id: `goal-${Date.now()}`,
      competencyId: goalFormData.competencyId,
      title: goalFormData.title.trim(),
      description: goalFormData.description.trim() || undefined,
      status: "not-started",
      targetDate: new Date(goalFormData.targetDate),
      actions: [],
    };

    const updatedIDP: IDP = {
      ...selectedIDP,
      goals: [...selectedIDP.goals, newGoal],
      updatedAt: new Date(),
    };

    const updated = idps.map(idp => idp.id === selectedIDP.id ? updatedIDP : idp);
    setIDPs(updated);
    saveIDPs(updated);
    setIsAddGoalDialogOpen(false);
    setGoalFormData({
      competencyId: "",
      title: "",
      description: "",
      targetDate: "",
    });
  };

  // Отправка на согласование
  const handleSendForApproval = () => {
    const updatedIDP: IDP = {
      ...selectedIDP,
      status: "pending-approval",
      updatedAt: new Date(),
    };

    const updated = idps.map(idp => idp.id === selectedIDP.id ? updatedIDP : idp);
    setIDPs(updated);
    saveIDPs(updated);
    setIsSendForApprovalDialogOpen(false);
  };

  // Удаление цели
  const handleDeleteGoal = (goalId: string) => {
    const updatedIDP: IDP = {
      ...selectedIDP,
      goals: selectedIDP.goals.filter(g => g.id !== goalId),
      updatedAt: new Date(),
    };

    const updated = idps.map(idp => idp.id === selectedIDP.id ? updatedIDP : idp);
    setIDPs(updated);
    saveIDPs(updated);
  };

  const canEdit = selectedIDP.status === "draft" || selectedIDP.status === "pending-approval";
  const canSendForApproval = selectedIDP.status === "draft";

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{selectedIDP.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getIDPTypeText(selectedIDP.scenario)}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", getStatusColor(selectedIDP.status))}
              >
                {getStatusText(selectedIDP.status)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" onClick={handleOpenEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          )}
          {canSendForApproval && (
            <Button onClick={() => setIsSendForApprovalDialogOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Отправить на согласование
            </Button>
          )}
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Сотрудник
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(selectedIDP.employeeName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedIDP.employeeName}</p>
                <p className="text-sm text-muted-foreground">{selectedIDP.employeePosition}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Руководитель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(selectedIDP.managerName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedIDP.managerName}</p>
                <p className="text-sm text-muted-foreground">Руководитель</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Период
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {formatDate(selectedIDP.startDate)} - {formatDate(selectedIDP.endDate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Описание */}
      {selectedIDP.description && (
        <Card>
          <CardHeader>
            <CardTitle>Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{selectedIDP.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Компетенции и цели */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Компетенции и задачи развития
            </CardTitle>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedIDP.competencyIds.length > 0) {
                    handleOpenAddGoal(selectedIDP.competencyIds[0]);
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить задачу
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.values(goalsByCompetency).map(({ competency, goals }) => (
            <div key={competency.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{competency.category}</Badge>
                  <h3 className="font-semibold">{competency.name}</h3>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenAddGoal(competency.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {goals.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                  Нет задач для этой компетенции
                  {canEdit && (
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleOpenAddGoal(competency.id)}
                    >
                      Добавить задачу
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", getStatusColor(goal.status as any))}
                              >
                                {goal.status === "not-started" && "Не начато"}
                                {goal.status === "in-progress" && "В процессе"}
                                {goal.status === "completed" && "Завершено"}
                                {goal.status === "cancelled" && "Отменено"}
                              </Badge>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground">{goal.description}</p>
                            )}
                            {goal.targetDate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Срок: {formatDate(goal.targetDate)}</span>
                              </div>
                            )}
                            {goal.actions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Действия:</p>
                                <div className="space-y-1">
                                  {goal.actions.map((action) => (
                                    <div
                                      key={action.id}
                                      className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded"
                                    >
                                      <CheckCircle2
                                        className={cn(
                                          "h-3.5 w-3.5",
                                          action.status === "completed"
                                            ? "text-green-600"
                                            : "text-muted-foreground"
                                        )}
                                      />
                                      <span className={cn(action.status === "completed" && "line-through text-muted-foreground")}>
                                        {action.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать ИПР</DialogTitle>
            <DialogDescription>
              Внесите изменения в индивидуальный план развития
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название ИПР *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Дата начала *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Дата окончания *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления задачи */}
      <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить задачу к компетенции</DialogTitle>
            <DialogDescription>
              Создайте новую задачу развития для выбранной компетенции
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-competency">Компетенция *</Label>
              <Select
                value={goalFormData.competencyId}
                onValueChange={(value) =>
                  setGoalFormData({ ...goalFormData, competencyId: value })
                }
              >
                <SelectTrigger id="goal-competency">
                  <SelectValue placeholder="Выберите компетенцию" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCompetencies.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-title">Название задачи *</Label>
              <Input
                id="goal-title"
                value={goalFormData.title}
                onChange={(e) =>
                  setGoalFormData({ ...goalFormData, title: e.target.value })
                }
                placeholder="Например: Освоить методологию OKR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Описание</Label>
              <Textarea
                id="goal-description"
                value={goalFormData.description}
                onChange={(e) =>
                  setGoalFormData({ ...goalFormData, description: e.target.value })
                }
                placeholder="Описание задачи и ожидаемых результатов"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-targetDate">Срок выполнения *</Label>
              <Input
                id="goal-targetDate"
                type="date"
                value={goalFormData.targetDate}
                onChange={(e) =>
                  setGoalFormData({ ...goalFormData, targetDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddGoal}>Добавить задачу</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог отправки на согласование */}
      <Dialog open={isSendForApprovalDialogOpen} onOpenChange={setIsSendForApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Отправить ИПР на согласование</DialogTitle>
            <DialogDescription>
              ИПР будет отправлен руководителю {selectedIDP.managerName} на согласование
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Сотрудник:</span>
                <span className="text-sm">{selectedIDP.employeeName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Руководитель:</span>
                <span className="text-sm">{selectedIDP.managerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Компетенций:</span>
                <span className="text-sm">{selectedIDP.competencyIds.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Задач:</span>
                <span className="text-sm">{selectedIDP.goals.length}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendForApprovalDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSendForApproval}>
              <Send className="mr-2 h-4 w-4" />
              Отправить на согласование
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
