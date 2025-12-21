"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ExternalLink, 
  Filter, 
  Link as LinkIcon, 
  Clock,
  User,
  Search,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JiraTask, KPI } from "@/types/goals-kold";

interface JiraTasksWidgetProps {
  tasks: JiraTask[];
  kpis: KPI[];
  quarter: string;
  onLinkTask?: (taskKey: string, kpiIds: string[]) => void;
  onUnlinkTask?: (taskId: string, kpiId: string) => void;
}

type GroupByOption = "kpi" | "status" | "assignee" | "none";
type FilterStatus = "all" | "todo" | "in-progress" | "done";

export function JiraTasksWidget({
  tasks,
  kpis,
  quarter,
  onLinkTask,
  onUnlinkTask,
}: JiraTasksWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupByOption>("status");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKpiForLinking, setSelectedKpiForLinking] = useState<string | null>(null);

  // Получаем уникальные статусы, исполнителей и типы задач
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.status))).sort();
  }, [tasks]);

  const uniqueAssignees = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))).sort();
  }, [tasks]);

  // Фильтрация задач
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Фильтр по статусу
    if (statusFilter !== "all") {
      result = result.filter(task => {
        const statusLower = task.status.toLowerCase();
        if (statusFilter === "todo") {
          return statusLower.includes("to do") || statusLower.includes("открыт") || statusLower.includes("новый");
        }
        if (statusFilter === "in-progress") {
          return statusLower.includes("in progress") || statusLower.includes("в работе") || statusLower.includes("в процессе");
        }
        if (statusFilter === "done") {
          return statusLower.includes("done") || statusLower.includes("готово") || statusLower.includes("закрыт") || statusLower.includes("решено");
        }
        return true;
      });
    }

    // Фильтр по исполнителю
    if (assigneeFilter !== "all") {
      result = result.filter(task => task.assignee === assigneeFilter);
    }

    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.key.toLowerCase().includes(query) ||
        task.summary.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tasks, statusFilter, assigneeFilter, searchQuery]);

  // Группировка задач
  const groupedTasks = useMemo(() => {
    if (groupBy === "none") {
      return { "Все задачи": filteredTasks };
    }

    if (groupBy === "kpi") {
      const grouped: Record<string, JiraTask[]> = {};
      filteredTasks.forEach(task => {
        if (task.kpiIds && task.kpiIds.length > 0) {
          task.kpiIds.forEach(kpiId => {
            const kpi = kpis.find(k => k.id === kpiId);
            const groupKey = kpi ? `${kpi.number}. ${kpi.name}` : "Без КПЭ";
            if (!grouped[groupKey]) {
              grouped[groupKey] = [];
            }
            if (!grouped[groupKey].find(t => t.id === task.id)) {
              grouped[groupKey].push(task);
            }
          });
        } else {
          if (!grouped["Без КПЭ"]) {
            grouped["Без КПЭ"] = [];
          }
          grouped["Без КПЭ"].push(task);
        }
      });
      return grouped;
    }

    if (groupBy === "status") {
      const grouped: Record<string, JiraTask[]> = {};
      filteredTasks.forEach(task => {
        if (!grouped[task.status]) {
          grouped[task.status] = [];
        }
        grouped[task.status].push(task);
      });
      return grouped;
    }

    if (groupBy === "assignee") {
      const grouped: Record<string, JiraTask[]> = {};
      filteredTasks.forEach(task => {
        const assignee = task.assignee || "Не назначен";
        if (!grouped[assignee]) {
          grouped[assignee] = [];
        }
        grouped[assignee].push(task);
      });
      return grouped;
    }

    return { "Все задачи": filteredTasks };
  }, [filteredTasks, groupBy, kpis]);

  // Статистика
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => {
      const status = t.status.toLowerCase();
      return status.includes("done") || status.includes("готово") || status.includes("закрыт") || status.includes("решено");
    }).length;
    const inProgress = tasks.filter(t => {
      const status = t.status.toLowerCase();
      return status.includes("in progress") || status.includes("в работе") || status.includes("в процессе");
    }).length;
    const todo = total - done - inProgress;

    return { total, done, inProgress, todo };
  }, [tasks]);

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("done") || statusLower.includes("готово") || statusLower.includes("закрыт") || statusLower.includes("решено")) {
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
    }
    if (statusLower.includes("in progress") || statusLower.includes("в работе") || statusLower.includes("в процессе")) {
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
    }
    return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800";
  };

  // Связывание задачи с КПЭ
  const handleLinkTask = (taskKey: string) => {
    if (selectedKpiForLinking && onLinkTask) {
      onLinkTask(taskKey, [selectedKpiForLinking]);
      setSelectedKpiForLinking(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Задачи Jira за квартал
          </CardTitle>
          <CardDescription>
            Нет связанных задач для {quarter}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Задачи Jira за квартал
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Всего задач: {stats.total} | Выполнено: {stats.done} | В работе: {stats.inProgress} | К выполнению: {stats.todo}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
        {/* Фильтры и группировка */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Группировка:</Label>
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupByOption)}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">По статусу</SelectItem>
                  <SelectItem value="kpi">По КПЭ</SelectItem>
                  <SelectItem value="assignee">По исполнителю</SelectItem>
                  <SelectItem value="none">Без группировки</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Статус:</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="todo">К выполнению</SelectItem>
                  <SelectItem value="in-progress">В работе</SelectItem>
                  <SelectItem value="done">Выполнено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {uniqueAssignees.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-sm">Исполнитель:</Label>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {uniqueAssignees.filter((assignee): assignee is string => Boolean(assignee)).map(assignee => (
                      <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по ключу или названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Таблица задач */}
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName} className="space-y-2">
              {groupBy !== "none" && (
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">{groupName} ({groupTasks.length})</Label>
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Ключ</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead className="w-[120px]">Статус</TableHead>
                      <TableHead className="w-[100px]">Приоритет</TableHead>
                      <TableHead className="w-[150px]">Исполнитель</TableHead>
                      <TableHead className="w-[120px]">Срок</TableHead>
                      <TableHead className="w-[150px]">Связанные КПЭ</TableHead>
                      {onLinkTask && <TableHead className="w-[80px]">Действия</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupTasks.map(task => (
                      <TableRow key={task.id} className="hover:bg-muted/50">
                        <TableCell>
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            {task.key}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{task.summary}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getStatusColor(task.status))}
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.priority ? (
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.assignee ? (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {task.assignee}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Не назначен</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {new Date(task.dueDate).toLocaleDateString("ru-RU", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.kpiIds && task.kpiIds.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {task.kpiIds.slice(0, 2).map(kpiId => {
                                const kpi = kpis.find(k => k.id === kpiId);
                                return kpi ? (
                                  <span key={kpiId} className="text-xs text-muted-foreground">
                                    {kpi.number}. {kpi.name.length > 30 ? `${kpi.name.substring(0, 30)}...` : kpi.name}
                                  </span>
                                ) : null;
                              })}
                              {task.kpiIds.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{task.kpiIds.length - 2} еще
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        {onLinkTask && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <LinkIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {kpis.map(kpi => (
                                  <DropdownMenuItem
                                    key={kpi.id}
                                    onClick={() => {
                                      setSelectedKpiForLinking(kpi.id);
                                      handleLinkTask(task.key);
                                    }}
                                  >
                                    Связать с КПЭ {kpi.number}. {kpi.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Задачи не найдены</p>
            {(statusFilter !== "all" || assigneeFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setStatusFilter("all");
                  setAssigneeFilter("all");
                  setSearchQuery("");
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
}

