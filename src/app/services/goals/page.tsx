"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, AlertTriangle } from "lucide-react";

// Моковые данные для действий руководителя (employeeId связывает с записью в таблице)
const managerActionsInTime = [
  { id: "1", title: "Согласовать цели сотрудника", employee: "Петрова А.С.", employeeId: "2", deadline: "25.01.2026" },
  { id: "2", title: "Провести оценку результативности", employee: "Сидоров А.П.", employeeId: "3", deadline: "28.01.2026" },
  { id: "3", title: "Утвердить план развития", employee: "Козлова М.А.", employeeId: "4", deadline: "30.01.2026" },
];

const managerActionsOverdue = [
  { id: "1", title: "Согласовать цели сотрудника", employee: "Иванов И.И.", employeeId: "1", deadline: "15.01.2026" },
  { id: "2", title: "Провести промежуточную оценку", employee: "Федорова Е.И.", employeeId: "6", deadline: "10.01.2026" },
];

// Типы данных
interface PerformanceRecord {
  id: string;
  status: "draft" | "in_progress" | "completed" | "approved";
  fullName: string;
  position: string;
  department: string;
  evaluationPeriod: string;
  performanceScore: number | null;
}

// Моковые данные
const mockPerformanceData: PerformanceRecord[] = [
  {
    id: "1",
    status: "approved",
    fullName: "Иванов Иван Иванович",
    position: "Ведущий разработчик",
    department: "Департамент информационных технологий",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.5,
  },
  {
    id: "2",
    status: "completed",
    fullName: "Петрова Анна Сергеевна",
    position: "Менеджер проектов",
    department: "Управление проектами",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.2,
  },
  {
    id: "3",
    status: "in_progress",
    fullName: "Сидоров Алексей Петрович",
    position: "Аналитик данных",
    department: "Департамент аналитики",
    evaluationPeriod: "2024 Q4",
    performanceScore: null,
  },
  {
    id: "4",
    status: "draft",
    fullName: "Козлова Мария Александровна",
    position: "HR-специалист",
    department: "Управление персоналом",
    evaluationPeriod: "2024 Q4",
    performanceScore: null,
  },
  {
    id: "5",
    status: "approved",
    fullName: "Николаев Дмитрий Владимирович",
    position: "Финансовый аналитик",
    department: "Финансовый департамент",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.8,
  },
  {
    id: "6",
    status: "completed",
    fullName: "Федорова Екатерина Игоревна",
    position: "Руководитель отдела",
    department: "Департамент информационных технологий",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.6,
  },
  {
    id: "7",
    status: "in_progress",
    fullName: "Морозов Андрей Николаевич",
    position: "Системный администратор",
    department: "Департамент информационных технологий",
    evaluationPeriod: "2024 Q4",
    performanceScore: null,
  },
  {
    id: "8",
    status: "approved",
    fullName: "Волкова Ольга Дмитриевна",
    position: "Бизнес-аналитик",
    department: "Департамент аналитики",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.3,
  },
  {
    id: "9",
    status: "draft",
    fullName: "Соколов Михаил Сергеевич",
    position: "Разработчик",
    department: "Департамент информационных технологий",
    evaluationPeriod: "2024 Q4",
    performanceScore: null,
  },
  {
    id: "10",
    status: "completed",
    fullName: "Новикова Татьяна Павловна",
    position: "Тестировщик",
    department: "Управление качества",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.1,
  },
  {
    id: "11",
    status: "approved",
    fullName: "Орлов Павел Андреевич",
    position: "Архитектор решений",
    department: "Департамент информационных технологий",
    evaluationPeriod: "2024 Q4",
    performanceScore: 4.9,
  },
  {
    id: "12",
    status: "in_progress",
    fullName: "Лебедева Наталья Викторовна",
    position: "Маркетолог",
    department: "Департамент маркетинга",
    evaluationPeriod: "2024 Q4",
    performanceScore: null,
  },
];

// Функция получения цвета статуса
const getStatusBadgeVariant = (status: PerformanceRecord["status"]) => {
  switch (status) {
    case "draft":
      return "secondary";
    case "in_progress":
      return "default";
    case "completed":
      return "outline";
    case "approved":
      return "default";
    default:
      return "secondary";
  }
};

const getStatusBadgeClass = (status: PerformanceRecord["status"]) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "in_progress":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "completed":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "approved":
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "";
  }
};

const getStatusLabel = (status: PerformanceRecord["status"]) => {
  switch (status) {
    case "draft":
      return "Черновик";
    case "in_progress":
      return "В процессе";
    case "completed":
      return "Завершено";
    case "approved":
      return "Утверждено";
    default:
      return status;
  }
};

// Функция форматирования оценки
const formatScore = (score: number | null) => {
  if (score === null) return "—";
  return score.toFixed(1);
};

const getScoreBadgeClass = (score: number | null) => {
  if (score === null) return "bg-gray-100 text-gray-500";
  if (score >= 4.5) return "bg-green-100 text-green-700";
  if (score >= 4.0) return "bg-blue-100 text-blue-700";
  if (score >= 3.5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{ id: string; type: "inTime" | "overdue"; title: string; employee: string } | null>(null);

  // Получение уникальных подразделений
  const uniqueDepartments = Array.from(new Set(mockPerformanceData.map(r => r.department)));

  // Фильтрация данных
  const filteredData = mockPerformanceData.filter((record) => {
    // Фильтр по выбранному действию руководителя
    if (selectedAction) {
      const action = selectedAction.type === "inTime" 
        ? managerActionsInTime.find(a => a.id === selectedAction.id)
        : managerActionsOverdue.find(a => a.id === selectedAction.id);
      if (action && action.employeeId !== record.id) {
        return false;
      }
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        record.fullName.toLowerCase().includes(query) ||
        record.position.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Фильтр по статусу
    if (statusFilter !== "all" && record.status !== statusFilter) {
      return false;
    }

    // Фильтр по подразделению
    if (departmentFilter !== "all" && record.department !== departmentFilter) {
      return false;
    }

    return true;
  });

  // Пагинация
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Подсчет активных фильтров
  const activeFiltersCount = 
    (statusFilter !== "all" ? 1 : 0) + 
    (departmentFilter !== "all" ? 1 : 0) +
    (selectedAction ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Карта результативности</h1>
          <p className="text-muted-foreground">
            Управление оценками результативности сотрудников
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Оценки результативности</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Кнопка Руководитель */}
          <div className="flex items-center gap-2 mb-4">
            <Badge 
              variant="outline" 
              className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
            >
              Руководитель
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    {managerActionsInTime.length}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    Действия в сроках
                  </div>
                  {managerActionsInTime.map((action) => (
                    <DropdownMenuItem 
                      key={action.id} 
                      className="flex flex-col items-start gap-0.5 cursor-pointer"
                      onClick={() => {
                        setSelectedAction({ id: action.id, type: "inTime", title: action.title, employee: action.employee });
                        setCurrentPage(1);
                      }}
                    >
                      <span className="font-medium">{action.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {action.employee} • до {action.deadline}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge 
                    variant="destructive" 
                    className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs cursor-pointer hover:bg-destructive/80 transition-colors"
                  >
                    {managerActionsOverdue.length}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Просроченные действия
                  </div>
                  {managerActionsOverdue.map((action) => (
                    <DropdownMenuItem 
                      key={action.id} 
                      className="flex flex-col items-start gap-0.5 cursor-pointer"
                      onClick={() => {
                        setSelectedAction({ id: action.id, type: "overdue", title: action.title, employee: action.employee });
                        setCurrentPage(1);
                      }}
                    >
                      <span className="font-medium">{action.title}</span>
                      <span className="text-xs text-destructive">
                        {action.employee} • просрочено {action.deadline}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Badge>
          </div>

          {/* Панель поиска и фильтров */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО, должности, подразделению..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Фильтры</DialogTitle>
                  <DialogDescription>
                    Настройте фильтры для отображения данных
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Статус</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="draft">Черновик</SelectItem>
                        <SelectItem value="in_progress">В процессе</SelectItem>
                        <SelectItem value="completed">Завершено</SelectItem>
                        <SelectItem value="approved">Утверждено</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Подразделение</Label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите подразделение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все подразделения</SelectItem>
                        {uniqueDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setDepartmentFilter("all");
                      setSelectedAction(null);
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button onClick={() => setIsFilterDialogOpen(false)}>
                    Применить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Активные фильтры */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Статус: {getStatusLabel(statusFilter as PerformanceRecord["status"])}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {departmentFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Подразделение: {departmentFilter}
                  <button
                    onClick={() => setDepartmentFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedAction && (
                <Badge 
                  variant={selectedAction.type === "overdue" ? "destructive" : "secondary"} 
                  className="gap-1"
                >
                  {selectedAction.type === "overdue" ? "Просрочено: " : "В сроках: "}
                  {selectedAction.title} ({selectedAction.employee})
                  <button
                    onClick={() => setSelectedAction(null)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]">Статус</TableHead>
                  <TableHead className="w-[250px]">ФИО</TableHead>
                  <TableHead className="w-[200px]">Должность</TableHead>
                  <TableHead className="w-[250px]">Подразделение</TableHead>
                  <TableHead className="w-[120px]">Период оценки</TableHead>
                  <TableHead className="w-[150px] text-center">Оценка результативности</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(record.status)}
                          className={getStatusBadgeClass(record.status)}
                        >
                          {getStatusLabel(record.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{record.fullName}</TableCell>
                      <TableCell>{record.position}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.evaluationPeriod}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={getScoreBadgeClass(record.performanceScore)}
                        >
                          {formatScore(record.performanceScore)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Нет данных для отображения
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Показано {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} из {filteredData.length}</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
