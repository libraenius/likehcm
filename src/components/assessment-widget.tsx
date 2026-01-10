"use client";

import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  ClipboardCheck, 
  Calendar,
  User,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  getProfileById,
} from "@/lib/data";
import type { UserProfile } from "@/types";

interface AssessmentWidgetProps {
  userProfile: UserProfile | null;
}

// Интерфейс для заявки на ассессмент
interface AssessmentRequest {
  id: string;
  candidateName: string;
  candidatePosition: string;
  date: Date;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  progress: number;
  assessorName?: string;
  type: "my_participation" | "as_assessor" | "all";
}

// Функция для генерации тестовых заявок
function generateAssessmentRequests(
  userProfile: UserProfile | null,
  type: "my_participation" | "as_assessor" | "all"
): AssessmentRequest[] {
  const requests: AssessmentRequest[] = [];
  const currentYear = new Date().getFullYear();
  
  const candidateNames = [
    "Иванов Иван Иванович",
    "Петров Петр Петрович",
    "Сидоров Сидор Сидорович",
    "Кузнецов Кузьма Кузьмич",
    "Смирнов Смирн Смирнович"
  ];
  
  const positions = [
    "Разработчик",
    "Тестировщик",
    "Аналитик",
    "Руководитель проекта",
    "Архитектор"
  ];
  
  const assessorNames = [
    "Смирнов А.А.",
    "Петров П.П.",
    "Иванов И.И."
  ];
  
  let count = 0;
  
  if (type === "my_participation") {
    count = 3; // Мои заявки на прохождение
  } else if (type === "as_assessor") {
    count = 4; // Заявки где я ассессор
  } else {
    count = 152; // Все заявки
  }
  
  for (let i = 0; i < count; i++) {
    const year = currentYear;
    const month = 12 - (i % 12);
    const day = 15 - (i % 15);
    const date = new Date(year, month - 1, day);
    
    const statuses: Array<"pending" | "in_progress" | "completed" | "cancelled"> = 
      ["pending", "in_progress", "completed", "cancelled"];
    const status = statuses[i % statuses.length];
    
    const progressValues = [0, 25, 50, 75, 100];
    const progress = status === "completed" ? 100 : status === "pending" ? 0 : progressValues[i % progressValues.length];
    
    let candidateName = candidateNames[i % candidateNames.length];
    let assessorName = assessorNames[i % assessorNames.length];
    
    // Для "my_participation" - пользователь является кандидатом
    if (type === "my_participation") {
      candidateName = userProfile 
        ? `${userProfile.lastName || ""} ${userProfile.firstName || ""} ${userProfile.middleName || ""}`.trim() || "Вы"
        : "Вы";
      assessorName = assessorNames[i % assessorNames.length];
    } else if (type === "as_assessor") {
      // Для "as_assessor" - пользователь является ассессором
      candidateName = candidateNames[i % candidateNames.length];
      assessorName = userProfile 
        ? `${userProfile.lastName || ""} ${userProfile.firstName || ""}`.trim() || "Вы"
        : "Вы";
    } else {
      // Для "all" - любые заявки
      candidateName = candidateNames[i % candidateNames.length];
      assessorName = assessorNames[i % assessorNames.length];
    }
    
    requests.push({
      id: `assessment-${type}-${date.toISOString().split('T')[0]}-${i}`,
      candidateName,
      candidatePosition: positions[i % positions.length],
      date,
      status,
      progress,
      assessorName,
      type,
    });
  }
  
  return requests.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Завершен
        </Badge>
      );
    case "in_progress":
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
        >
          <Clock className="h-3 w-3 mr-1" />
          В процессе
        </Badge>
      );
    case "pending":
      return (
        <Badge 
          variant="outline" 
          className="bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Ожидает
        </Badge>
      );
    case "cancelled":
      return (
        <Badge 
          variant="outline" 
          className="bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Отменен
        </Badge>
      );
    default:
      return null;
  }
};

// Компонент для отображения списка заявок
function AssessmentRequestsList({ 
  requests, 
  emptyMessage,
  showProgress = true
}: { 
  requests: AssessmentRequest[];
  emptyMessage: string;
  showProgress?: boolean;
}) {
  if (requests.length === 0) {
    return (
      <div className="p-6 border rounded-lg border-dashed text-center">
        <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{request.candidateName}</span>
                <Badge variant="outline" className="text-xs">
                  {request.candidatePosition}
                </Badge>
              </div>
              
              {request.assessorName && (
                <div className="text-xs text-muted-foreground">
                  Ассессор: {request.assessorName}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Дата: {request.date.toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              
              {showProgress && request.status === "in_progress" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-semibold">{request.progress}%</span>
                  </div>
                  <Progress value={request.progress} className="h-2" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
              {getStatusBadge(request.status)}
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // TODO: Добавить логику перехода к заявке
                  console.log("Переход к заявке", request.id);
                }}
              >
                {request.status === "completed" 
                  ? "Посмотреть результаты" 
                  : request.status === "pending"
                  ? "Начать"
                  : "Продолжить"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssessmentWidget({ userProfile }: AssessmentWidgetProps) {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isAssessorInfoDialogOpen, setIsAssessorInfoDialogOpen] = useState(false);
  const [isAnalyticsInfoDialogOpen, setIsAnalyticsInfoDialogOpen] = useState(false);
  
  // Состояния для поиска и фильтров (Ассессор)
  const [assessorSearchQuery, setAssessorSearchQuery] = useState("");
  const [assessorFilterDialogOpen, setAssessorFilterDialogOpen] = useState(false);
  const [assessorFilters, setAssessorFilters] = useState<{
    status: string[];
  }>({
    status: [],
  });
  const [assessorCurrentPage, setAssessorCurrentPage] = useState(1);
  const assessorItemsPerPage = 10;
  
  // Состояния для поиска и фильтров (Аналитика)
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsFilterDialogOpen, setAnalyticsFilterDialogOpen] = useState(false);
  const [analyticsFilters, setAnalyticsFilters] = useState<{
    status: string[];
  }>({
    status: [],
  });
  const [analyticsCurrentPage, setAnalyticsCurrentPage] = useState(1);
  const analyticsItemsPerPage = 10;
  
  const statusOptions = ["pending", "in_progress", "completed", "cancelled"];
  const statusLabels: Record<string, string> = {
    pending: "Ожидает",
    in_progress: "В процессе",
    completed: "Завершен",
    cancelled: "Отменен",
  };

  const myParticipationRequests = useMemo(() => {
    return generateAssessmentRequests(userProfile, "my_participation");
  }, [userProfile]);

  const asAssessorRequests = useMemo(() => {
    return generateAssessmentRequests(userProfile, "as_assessor");
  }, [userProfile]);

  const allRequests = useMemo(() => {
    return generateAssessmentRequests(userProfile, "all");
  }, [userProfile]);

  // Фильтрация заявок для вкладки "Ассессор"
  const filteredAssessorRequests = useMemo(() => {
    return asAssessorRequests.filter((request) => {
      // Поиск по кандидату, должности, ассессору
      if (assessorSearchQuery) {
        const query = assessorSearchQuery.toLowerCase();
        const matchesSearch = 
          request.candidateName.toLowerCase().includes(query) ||
          request.candidatePosition.toLowerCase().includes(query) ||
          (request.assessorName?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }

      // Фильтр по статусу
      if (assessorFilters.status.length > 0) {
        if (!assessorFilters.status.includes(request.status)) return false;
      }

      return true;
    });
  }, [asAssessorRequests, assessorSearchQuery, assessorFilters]);

  // Пагинация для вкладки "Ассессор"
  const assessorTotalPages = Math.ceil(filteredAssessorRequests.length / assessorItemsPerPage);
  const assessorStartIndex = (assessorCurrentPage - 1) * assessorItemsPerPage;
  const assessorEndIndex = assessorStartIndex + assessorItemsPerPage;
  const paginatedAssessorRequests = filteredAssessorRequests.slice(assessorStartIndex, assessorEndIndex);

  // Фильтрация заявок для вкладки "Аналитика"
  const filteredAnalyticsRequests = useMemo(() => {
    return allRequests.filter((request) => {
      // Поиск по кандидату, должности, ассессору
      if (analyticsSearchQuery) {
        const query = analyticsSearchQuery.toLowerCase();
        const matchesSearch = 
          request.candidateName.toLowerCase().includes(query) ||
          request.candidatePosition.toLowerCase().includes(query) ||
          (request.assessorName?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }

      // Фильтр по статусу
      if (analyticsFilters.status.length > 0) {
        if (!analyticsFilters.status.includes(request.status)) return false;
      }

      return true;
    });
  }, [allRequests, analyticsSearchQuery, analyticsFilters]);

  // Пагинация для вкладки "Аналитика"
  const analyticsTotalPages = Math.ceil(filteredAnalyticsRequests.length / analyticsItemsPerPage);
  const analyticsStartIndex = (analyticsCurrentPage - 1) * analyticsItemsPerPage;
  const analyticsEndIndex = analyticsStartIndex + analyticsItemsPerPage;
  const paginatedAnalyticsRequests = filteredAnalyticsRequests.slice(analyticsStartIndex, analyticsEndIndex);

  // Сброс на первую страницу при изменении поиска или фильтров
  useEffect(() => {
    setAssessorCurrentPage(1);
  }, [assessorSearchQuery, assessorFilters]);

  useEffect(() => {
    setAnalyticsCurrentPage(1);
  }, [analyticsSearchQuery, analyticsFilters]);

  return (
    <>
      <Tabs defaultValue="my_participation" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="my_participation">
            <span className="hidden sm:inline">Мои заявки</span>
            <span className="sm:hidden">Мои</span>
          </TabsTrigger>
          <TabsTrigger value="as_assessor">
            <span className="hidden sm:inline">Ассессор</span>
            <span className="sm:hidden">Асс.</span>
          </TabsTrigger>
          <TabsTrigger value="all">
            <span className="hidden sm:inline">Аналитика</span>
            <span className="sm:hidden">Анал.</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my_participation" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Мои заявки на ассессмент (прохождение)</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={() => setIsInfoDialogOpen(true)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        <AssessmentRequestsList 
          requests={myParticipationRequests}
          emptyMessage="У вас нет заявок на прохождение ассессмента"
          showProgress={false}
        />
      </TabsContent>
      
      <TabsContent value="as_assessor" className="mt-4 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Заявки на ассессмент (ассессор)</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAssessorInfoDialogOpen(true)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Поиск и фильтрация */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по кандидату, должности или ассессору..."
              value={assessorSearchQuery}
              onChange={(e) => setAssessorSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {assessorSearchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setAssessorSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Dialog open={assessorFilterDialogOpen} onOpenChange={setAssessorFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Фильтры
                {assessorFilters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {assessorFilters.status.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-3">
                <DialogTitle className="text-lg">Фильтры</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Статус</Label>
                  <div className="space-y-1.5">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assessor-filter-status-${status}`}
                          checked={assessorFilters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAssessorFilters({
                                ...assessorFilters,
                                status: [...assessorFilters.status, status],
                              });
                            } else {
                              setAssessorFilters({
                                ...assessorFilters,
                                status: assessorFilters.status.filter((s) => s !== status),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`assessor-filter-status-${status}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {statusLabels[status]}
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
                    setAssessorFilters({ status: [] });
                  }}
                >
                  Сбросить
                </Button>
                <Button size="sm" onClick={() => setAssessorFilterDialogOpen(false)}>
                  Применить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {filteredAssessorRequests.length === 0 ? (
          <div className="p-6 border rounded-lg border-dashed text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {asAssessorRequests.length === 0 
                ? "У вас нет заявок в качестве ассессора"
                : "Заявки не найдены"}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Кандидат</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Ассессор</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Прогресс</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAssessorRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.candidateName}</TableCell>
                    <TableCell>{request.candidatePosition}</TableCell>
                    <TableCell>{request.assessorName || "-"}</TableCell>
                    <TableCell>
                      {request.date.toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {request.status === "in_progress" ? (
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={request.progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {request.progress}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // TODO: Добавить логику перехода к заявке
                          console.log("Переход к заявке", request.id);
                        }}
                      >
                        {request.status === "completed" 
                          ? "Результаты" 
                          : request.status === "pending"
                          ? "Начать"
                          : "Продолжить"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Пагинация для вкладки "Ассессор" */}
        {filteredAssessorRequests.length > 0 && assessorTotalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Показано {assessorStartIndex + 1}-{Math.min(assessorEndIndex, filteredAssessorRequests.length)} из {filteredAssessorRequests.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Страница {assessorCurrentPage} из {assessorTotalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAssessorCurrentPage(1)}
                  disabled={assessorCurrentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAssessorCurrentPage(assessorCurrentPage - 1)}
                  disabled={assessorCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAssessorCurrentPage(assessorCurrentPage + 1)}
                  disabled={assessorCurrentPage === assessorTotalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAssessorCurrentPage(assessorTotalPages)}
                  disabled={assessorCurrentPage === assessorTotalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="all" className="mt-4 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Все заявки (аналитика)</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAnalyticsInfoDialogOpen(true)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Поиск и фильтрация */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по кандидату, должности или ассессору..."
              value={analyticsSearchQuery}
              onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {analyticsSearchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setAnalyticsSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Dialog open={analyticsFilterDialogOpen} onOpenChange={setAnalyticsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Фильтры
                {analyticsFilters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {analyticsFilters.status.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-3">
                <DialogTitle className="text-lg">Фильтры</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Статус</Label>
                  <div className="space-y-1.5">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`analytics-filter-status-${status}`}
                          checked={analyticsFilters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAnalyticsFilters({
                                ...analyticsFilters,
                                status: [...analyticsFilters.status, status],
                              });
                            } else {
                              setAnalyticsFilters({
                                ...analyticsFilters,
                                status: analyticsFilters.status.filter((s) => s !== status),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`analytics-filter-status-${status}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {statusLabels[status]}
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
                    setAnalyticsFilters({ status: [] });
                  }}
                >
                  Сбросить
                </Button>
                <Button size="sm" onClick={() => setAnalyticsFilterDialogOpen(false)}>
                  Применить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {filteredAnalyticsRequests.length === 0 ? (
          <div className="p-6 border rounded-lg border-dashed text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {allRequests.length === 0 
                ? "Нет заявок на ассессмент"
                : "Заявки не найдены"}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Кандидат</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Ассессор</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Прогресс</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAnalyticsRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.candidateName}</TableCell>
                    <TableCell>{request.candidatePosition}</TableCell>
                    <TableCell>{request.assessorName || "-"}</TableCell>
                    <TableCell>
                      {request.date.toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {request.status === "in_progress" ? (
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={request.progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {request.progress}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // TODO: Добавить логику перехода к заявке
                          console.log("Переход к заявке", request.id);
                        }}
                      >
                        {request.status === "completed" 
                          ? "Результаты" 
                          : request.status === "pending"
                          ? "Начать"
                          : "Продолжить"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Пагинация для вкладки "Аналитика" */}
        {filteredAnalyticsRequests.length > 0 && analyticsTotalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Показано {analyticsStartIndex + 1}-{Math.min(analyticsEndIndex, filteredAnalyticsRequests.length)} из {filteredAnalyticsRequests.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Страница {analyticsCurrentPage} из {analyticsTotalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAnalyticsCurrentPage(1)}
                  disabled={analyticsCurrentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAnalyticsCurrentPage(analyticsCurrentPage - 1)}
                  disabled={analyticsCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAnalyticsCurrentPage(analyticsCurrentPage + 1)}
                  disabled={analyticsCurrentPage === analyticsTotalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAnalyticsCurrentPage(analyticsTotalPages)}
                  disabled={analyticsCurrentPage === analyticsTotalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>

    <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Мои заявки на ассессмент (прохождение)</DialogTitle>
          <DialogDescription>
            Заявки, в которых вы являетесь участником ассессмента. Здесь отображаются все заявки на прохождение ассессмента, где вы выступаете в роли кандидата.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <Dialog open={isAssessorInfoDialogOpen} onOpenChange={setIsAssessorInfoDialogOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Заявки на ассессмент (ассессор)</DialogTitle>
          <DialogDescription>
            Заявки, в которых вы являетесь ассессором. Здесь отображаются все заявки на ассессмент, где вы проводите оценку кандидатов.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <Dialog open={isAnalyticsInfoDialogOpen} onOpenChange={setIsAnalyticsInfoDialogOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Все заявки (аналитика)</DialogTitle>
          <DialogDescription>
            Все заявки на ассессмент для аналитики и статистики. Здесь отображается полная информация обо всех заявках в системе.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
    </>
  );
}
