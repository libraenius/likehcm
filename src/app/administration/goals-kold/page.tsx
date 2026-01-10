"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { MouseEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Users, FileText, Table as TableIcon, Search, X, ChevronDown, ChevronRight, Building2, UserCircle, Plus, Pencil, Trash2, BarChart3, Edit, Filter, GripVertical, FolderOpen, LayoutDashboard, Ruler, Calculator, AlertCircle, ChevronLeft, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, Calendar, CheckCircle2, XCircle, Eye, History, Download, Upload, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Leader, Stream, Team, KPI, AttachedFile } from "@/types/goals-kold";
import { getInitials, formatDate, calculateKPIMetrics } from "@/lib/goals-kold/utils";
import { mockStreamKPIs, mockQuarterlyKPIsData, mockITLeaderKPIsData, generateMockStreams, mockStreams } from "@/lib/goals-kold/mock-data";
import { StreamsList } from "@/components/goals-kold/StreamsList";
import { TeamDetails } from "@/components/goals-kold/TeamDetails";
import { FilterDialog } from "@/components/goals-kold/FilterDialog";
import { KPIDialog } from "@/components/goals-kold/KPIDialog";
import { AnnualKPICards } from "@/components/goals-kold/AnnualKPICards";
import { QuarterlyKPICards } from "@/components/goals-kold/QuarterlyKPICards";
import { ITLeaderKPICards } from "@/components/goals-kold/ITLeaderKPICards";
import { DashboardTab } from "@/components/goals-kold/DashboardTab";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/contexts/toast-context";
import * as XLSX from "xlsx";

// Функции для стилизации статусов
const getStatusBadgeVariant = (status: string | undefined) => {
  return "outline";
};

const getStatusBadgeClassName = (status: string | undefined) => {
  if (!status) return "";
  if (status.includes("согласован")) {
    return "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
  }
  if (status.includes("отклонен")) {
    return "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
  }
  if (status.includes("выставление")) {
    return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400";
  }
  return "";
};

// Компонент для ввода плана/факта с поддержкой запятой и без автоподстановки 0
function PlanFactInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [localValue, setLocalValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Инициализируем локальное значение только при первом рендере
  useEffect(() => {
    if (!isFocused) {
      if (value !== undefined && value !== null && value !== 0) {
        setLocalValue(value.toString().replace('.', ','));
      } else {
        setLocalValue("");
      }
    }
  }, [value, isFocused]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={localValue}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        // При потере фокуса сохраняем значение только если оно не пустое
        const inputValue = localValue;
        if (inputValue === "") {
          // Не сохраняем 0, оставляем поле пустым
          return;
        }
        const normalizedValue = inputValue.replace(',', '.');
        const numValue = parseFloat(normalizedValue);
        if (!isNaN(numValue)) {
          const roundedValue = Math.round(numValue * 100) / 100;
          onChange(roundedValue);
          // Обновляем локальное состояние с отформатированным значением
          setLocalValue(roundedValue.toString().replace('.', ','));
        }
      }}
      onChange={(e) => {
        const inputValue = e.target.value;
        
        // Разрешаем только цифры, запятую и точку
        const validPattern = /^-?\d*[,.]?\d{0,2}$/;
        if (inputValue !== "" && !validPattern.test(inputValue)) {
          return;
        }
        
        // Обновляем локальное состояние
        setLocalValue(inputValue);
        
        // Если поле пустое, не сохраняем значение
        if (inputValue === "") {
          return;
        }
        
        // Заменяем запятую на точку для парсинга
        const normalizedValue = inputValue.replace(',', '.');
        const numValue = parseFloat(normalizedValue);
        
        if (!isNaN(numValue)) {
          // Округляем до 2 знаков после запятой
          const roundedValue = Math.round(numValue * 100) / 100;
          onChange(roundedValue);
        }
      }}
      placeholder=""
      className="h-8 w-20 text-center"
    />
  );
}

// Компонент строки таблицы стримов с коллапсом
function StreamTableRow({
  stream,
  fullStream,
  onEdit,
  datEmployees,
  getInitialsFromName,
}: {
  stream: { id: string; name: string; type: string; businessType: string; datEmployeeIds?: string[]; description: string };
  fullStream?: Stream | null;
  onEdit: () => void;
  datEmployees: Array<{ id: string; fullName: string; position: string; avatar?: string }>;
  getInitialsFromName: (name: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow 
        className={cn(
          "cursor-pointer transition-colors",
          isExpanded && "bg-muted/50 border-l-4 border-l-blue-500"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="font-medium w-[250px]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {stream.name}
          </div>
        </TableCell>
        <TableCell className="w-[150px]">
          <Badge variant="outline">{stream.businessType || "—"}</Badge>
        </TableCell>
        <TableCell className="w-[150px]">
          <Badge variant="outline">{stream.type}</Badge>
        </TableCell>
        <TableCell className="w-[300px]">
          {stream.datEmployeeIds && stream.datEmployeeIds.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {stream.datEmployeeIds.map((employeeId) => {
                const employee = datEmployees.find(emp => emp.id === employeeId);
                return employee ? (
                  <div key={employeeId} className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      {employee.avatar ? (
                        <AvatarImage src={employee.avatar} alt={employee.fullName} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitialsFromName(employee.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm truncate">{employee.fullName}</span>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-right w-[150px]">
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/40">
          <TableCell colSpan={5} className="p-4 w-full max-w-full border-l-4 border-l-blue-500">
            <div className="space-y-4 w-full max-w-full">
              {/* Информация о стриме */}
              {fullStream && (
                <>
                  {/* Лидеры */}
                  {(fullStream.leader || fullStream.itLeader) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Руководство:
                      </Label>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {fullStream.leader && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Лидер стрима</p>
                            <p className="text-sm font-medium">{fullStream.leader.name}</p>
                            {fullStream.leader.position && (
                              <p className="text-xs text-muted-foreground">{fullStream.leader.position}</p>
                            )}
                          </div>
                        )}
                        {fullStream.itLeader && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">ИТ-лидер</p>
                            <p className="text-sm font-medium">{fullStream.itLeader.name}</p>
                            {fullStream.itLeader.position && (
                              <p className="text-xs text-muted-foreground">{fullStream.itLeader.position}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Команды */}
                  {fullStream.teams && fullStream.teams.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        Команды ({fullStream.teams.length}):
                      </Label>
                      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {fullStream.teams.map((team) => (
                          <div key={team.id} className="rounded-lg border bg-card p-3 space-y-1">
                            <p className="text-sm font-medium">{team.name}</p>
                            {team.description && (
                              <p className="text-xs text-muted-foreground">{team.description}</p>
                            )}
                            {team.leader && (
                              <p className="text-xs text-muted-foreground">Лидер: {team.leader}</p>
                            )}
                            {team.membersCount !== undefined && (
                              <p className="text-xs text-muted-foreground">Участников: {team.membersCount}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function GoalsKoldPage() {
  // Состояние для управления стримами и командами
  const [streams, setStreams] = useState<Stream[]>(mockStreams);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    types: Array<"продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный">;
  }>({
    types: [],
  });

  // Состояние для управления КПЭ
  const [annualKPIs, setAnnualKPIs] = useState<Record<string, Record<string, KPI[]>>>(mockStreamKPIs);
  const [quarterlyKPIs, setQuarterlyKPIs] = useState<Record<string, Record<string, KPI[]>>>(mockQuarterlyKPIsData);
  
  // Состояние для режима редактирования
  const [isEditModeAnnual, setIsEditModeAnnual] = useState(false);
  const [isEditModeQuarterly, setIsEditModeQuarterly] = useState<Record<string, boolean>>({});
  
  // Состояние для drag-and-drop
  const [draggedKPIId, setDraggedKPIId] = useState<string | null>(null);
  const [draggedKPIQuarter, setDraggedKPIQuarter] = useState<string | null>(null);
  
  // Состояние для сворачивания блоков
  const [isAnnualExpanded, setIsAnnualExpanded] = useState(true);
  const [isQuarterlyExpanded, setIsQuarterlyExpanded] = useState(true);
  
  // Состояние для выбранного года годовых карт
  const [selectedAnnualYear, setSelectedAnnualYear] = useState<string>("2025");
  
  // Состояние для выбранного года квартальных карт
  const [selectedQuarterlyYear, setSelectedQuarterlyYear] = useState<string>("2025");
  
  // Состояние для сворачивания блока карт ИТ лидера
  const [isITLeaderExpanded, setIsITLeaderExpanded] = useState(true);
  
  // Состояние для выбранного года карт ИТ лидера
  const [selectedITLeaderYear, setSelectedITLeaderYear] = useState<string>("2025");
  
  // Состояние для управления КПЭ ИТ лидера (квартальные)
  const [itLeaderKPIs, setItLeaderKPIs] = useState<Record<string, Record<string, KPI[]>>>(mockITLeaderKPIsData);
  
  // Состояние для режима редактирования карт ИТ лидера
  const [isEditModeITLeader, setIsEditModeITLeader] = useState<Record<string, boolean>>({});
  
  // Состояние для диалогов редактирования КПЭ
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [kpiDialogType, setKpiDialogType] = useState<"annual" | "quarterly">("annual");
  const [kpiQuarter, setKpiQuarter] = useState<string>("q1-2025");
  const [kpiSource, setKpiSource] = useState<"stream" | "itLeader">("stream");
  const [kpiFormData, setKpiFormData] = useState({
    name: "",
    weight: 0,
    type: "Количественный",
    unit: "",
    plan: 0,
    fact: 0,
  });
  const [planFile, setPlanFile] = useState<AttachedFile | null>(null);
  const [factFile, setFactFile] = useState<AttachedFile | null>(null);

  // Состояние для справочников
  const [units, setUnits] = useState<Array<{ id: string; name: string; abbreviation: string; description: string }>>([
    { id: "1", name: "Штука", abbreviation: "шт.", description: "Единица измерения количества" },
    { id: "2", name: "Процент", abbreviation: "%", description: "Единица измерения доли" },
    { id: "3", name: "День", abbreviation: "дн.", description: "Единица измерения времени" },
  ]);
  const [formulas, setFormulas] = useState<Array<{ id: string; name: string; formula: string; description: string }>>([
    { id: "1", name: "Процент выполнения", formula: "(факт / план) * 100", description: "Расчет процента выполнения плана" },
    { id: "2", name: "Оценка КПЭ", formula: "min(процент_выполнения * (вес / 100), вес * 1.2)", description: "Расчет оценки КПЭ с ограничением 120%" },
  ]);
  // Тестовые данные сотрудников ДАТ из mockEmployees (external-providers)
  const mockDATEmployees = [
    { id: "emp-1", fullName: "Петров Иван Сергеевич", position: "Главный инженер", avatar: undefined },
    { id: "emp-2", fullName: "Сидорова Мария Александровна", position: "Ведущий разработчик", avatar: undefined },
    { id: "emp-3", fullName: "Иванов Алексей Дмитриевич", position: "Старший разработчик", avatar: undefined },
    { id: "emp-4", fullName: "Смирнова Елена Викторовна", position: "QA инженер", avatar: undefined },
    { id: "emp-5", fullName: "Помыткин Сергей Олегович", position: "Руководитель разработки", avatar: undefined },
    { id: "emp-6", fullName: "Козлова Анна Петровна", position: "Менеджер проектов", avatar: undefined },
    { id: "emp-7", fullName: "Морозов Дмитрий Александрович", position: "Специалист", avatar: undefined },
    { id: "emp-8", fullName: "Волков Сергей Петрович", position: "Разработчик", avatar: undefined },
    { id: "emp-9", fullName: "Новикова Анна Игоревна", position: "Аналитик", avatar: undefined },
    { id: "emp-10", fullName: "Лебедев Павел Олегович", position: "Тестировщик", avatar: undefined },
    { id: "emp-11", fullName: "Соколова Ольга Владимировна", position: "Дизайнер", avatar: undefined },
    { id: "emp-12", fullName: "Орлов Максим Сергеевич", position: "Архитектор", avatar: undefined },
    { id: "emp-13", fullName: "Федорова Татьяна Николаевна", position: "Руководитель команды", avatar: undefined },
    { id: "emp-14", fullName: "Григорьев Андрей Валерьевич", position: "DevOps инженер", avatar: undefined },
    { id: "emp-15", fullName: "Романова Юлия Дмитриевна", position: "Product Manager", avatar: undefined },
  ];

  // Функция для получения инициалов из ФИО
  const getInitialsFromName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return "??";
  };

  // Инициализация справочника стримов на основе стримов со страницы
  const [referenceStreams, setReferenceStreams] = useState<Array<{ id: string; name: string; type: string; businessType: string; datEmployeeIds?: string[]; description: string }>>(() => {
    return mockStreams.map((stream, index) => {
      // Случайное количество сотрудников от 1 до 3
      const numEmployees = Math.floor(Math.random() * 3) + 1;
      const selectedEmployees: string[] = [];
      const usedIndices = new Set<number>();
      
      // Выбираем случайных сотрудников без повторений
      while (selectedEmployees.length < numEmployees) {
        const randomIndex = Math.floor(Math.random() * mockDATEmployees.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          const employee = mockDATEmployees[randomIndex];
          if (employee) {
            selectedEmployees.push(employee.id);
          }
        }
        // Защита от бесконечного цикла
        if (usedIndices.size >= mockDATEmployees.length) break;
      }
      
      return {
        id: stream.id,
        name: stream.name,
        type: stream.type || "продуктовый",
        businessType: stream.businessType || "РБ",
        datEmployeeIds: selectedEmployees,
        description: stream.description || "",
      };
    });
  });
  
  // Состояние для диалогов справочников
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [formulaDialogOpen, setFormulaDialogOpen] = useState(false);
  const [streamDialogOpen, setStreamDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{ id: string; name: string; abbreviation: string; description: string } | null>(null);
  const [editingFormula, setEditingFormula] = useState<{ id: string; name: string; formula: string; description: string } | null>(null);
  const [editingStream, setEditingStream] = useState<{ id: string; name: string; type: string; businessType: string; datEmployeeIds?: string[]; description: string } | null>(null);
  const [unitFormData, setUnitFormData] = useState({ name: "", abbreviation: "", description: "" });
  const [formulaFormData, setFormulaFormData] = useState({ name: "", formula: "", description: "" });
  const [streamFormData, setStreamFormData] = useState({ name: "", type: "продуктовый", businessType: "РБ", datEmployeeIds: [] as string[], description: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "unit" | "formula" | "stream"; id: string } | null>(null);
  
  // Состояние для поиска в справочниках
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [formulaSearchQuery, setFormulaSearchQuery] = useState("");
  const [streamSearchQuery, setStreamSearchQuery] = useState("");
  
  // Состояние для диалогов фильтров справочников
  const [unitFilterDialogOpen, setUnitFilterDialogOpen] = useState(false);
  const [formulaFilterDialogOpen, setFormulaFilterDialogOpen] = useState(false);
  const [streamFilterDialogOpen, setStreamFilterDialogOpen] = useState(false);
  
  // Состояние для фильтров справочников
  const [unitFilters, setUnitFilters] = useState<{
    abbreviations: string[];
  }>({
    abbreviations: [],
  });
  const [formulaFilters, setFormulaFilters] = useState<{
    categories: string[];
  }>({
    categories: [],
  });
  const [streamFilters, setStreamFilters] = useState<{
    types: Array<"продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный">;
    businessTypes: string[];
  }>({
    types: [],
    businessTypes: [],
  });
  
  // Состояние для пагинации справочников
  const [unitCurrentPage, setUnitCurrentPage] = useState(1);
  const [formulaCurrentPage, setFormulaCurrentPage] = useState(1);
  const [streamCurrentPage, setStreamCurrentPage] = useState(1);
  const [unitItemsPerPage, setUnitItemsPerPage] = useState(10);
  const [formulaItemsPerPage, setFormulaItemsPerPage] = useState(10);
  const [streamItemsPerPage, setStreamItemsPerPage] = useState(10);
  
  // Состояние для пагинации таблицы ПФК
  const [pfkTableCurrentPage, setPfkTableCurrentPage] = useState(1);
  const [pfkTableItemsPerPage, setPfkTableItemsPerPage] = useState(10);
  
  // Состояние для поиска и фильтров таблицы ПФК
  const [pfkTableSearchQuery, setPfkTableSearchQuery] = useState("");
  const [pfkTableFilterDialogOpen, setPfkTableFilterDialogOpen] = useState(false);
  const [pfkTableFilters, setPfkTableFilters] = useState<{
    streams: string[];
    periods: Array<"annual" | "quarterly">;
    planStatuses: string[];
    factStatuses: string[];
    sources: Array<"annual" | "quarterly" | "itLeader">;
  }>({
    streams: [],
    periods: [],
    planStatuses: [],
    factStatuses: [],
    sources: [],
  });
  
  // Состояние для сортировки таблицы ПФК
  const [pfkTableSortOrder, setPfkTableSortOrder] = useState<"asc" | "desc">("asc");
  
  // Состояние для режима редактирования таблицы ПФК
  const [isPfkTableEditMode, setIsPfkTableEditMode] = useState(false);
  
  // Состояние для диалога отклонения с комментарием
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [pendingRejection, setPendingRejection] = useState<{
    kpiId: string;
    statusType: "plan" | "fact";
    streamId: string;
    source: "annual" | "quarterly" | "itLeader";
    period: string;
  } | null>(null);
  
  // Состояние для диалога просмотра комментария отклонения
  const [viewCommentDialogOpen, setViewCommentDialogOpen] = useState(false);
  const [viewingComment, setViewingComment] = useState<{
    comment: string | undefined;
    statusType: "plan" | "fact";
  } | null>(null);
  
  // Состояние для диалога истории операций с КПЭ
  const [kpiHistoryDialogOpen, setKpiHistoryDialogOpen] = useState(false);
  const [selectedKpiForHistory, setSelectedKpiForHistory] = useState<{
    kpi: KPI;
    streamName: string;
    period: string;
    source: "annual" | "quarterly" | "itLeader";
  } | null>(null);
  
  // Состояние для модального окна КПЭ в таблице ПФК
  const [pfkTableKPIDialogOpen, setPfkTableKPIDialogOpen] = useState(false);
  const [selectedPfkTableKPI, setSelectedPfkTableKPI] = useState<KPI | null>(null);
  const [selectedPfkTableKPIMeta, setSelectedPfkTableKPIMeta] = useState<{
    streamId: string;
    period: string;
    source: "annual" | "quarterly" | "itLeader";
  } | null>(null);
  
  const [unitSortOrder, setUnitSortOrder] = useState<"asc" | "desc">("asc");
  const [formulaSortOrder, setFormulaSortOrder] = useState<"asc" | "desc">("asc");
  const [streamSortOrder, setStreamSortOrder] = useState<"asc" | "desc">("asc");

  // Состояние для выбранного типа справочника
  const [selectedReferenceType, setSelectedReferenceType] = useState<"units" | "formulas" | "streams">("units");

  // Сброс страницы при изменении поиска или количества элементов
  useEffect(() => {
    setUnitCurrentPage(1);
  }, [unitSearchQuery, unitItemsPerPage, unitSortOrder, unitFilters]);

  useEffect(() => {
    setFormulaCurrentPage(1);
  }, [formulaSearchQuery, formulaItemsPerPage, formulaSortOrder, formulaFilters]);

  useEffect(() => {
    setStreamCurrentPage(1);
  }, [streamSearchQuery, streamItemsPerPage, streamSortOrder, streamFilters]);

  // Сброс страницы при изменении поиска или фильтров таблицы ПФК
  useEffect(() => {
    setPfkTableCurrentPage(1);
  }, [pfkTableSearchQuery, pfkTableItemsPerPage, pfkTableFilters, pfkTableSortOrder]);

  // Хук для уведомлений
  const { success, error: showError } = useToast();

  // Refs для input элементов загрузки файлов в модальном окне ПФК
  const pfkTablePlanFileInputRef = useRef<HTMLInputElement>(null);
  const pfkTableFactFileInputRef = useRef<HTMLInputElement>(null);

  // Функция для обновления KPI в данных
  const updateKPIFile = (kpiId: string, fileType: "planFile" | "factFile", file: AttachedFile | null) => {
    if (!selectedPfkTableKPIMeta) return;

    const { streamId, period, source } = selectedPfkTableKPIMeta;
    const updatedKPI = { ...selectedPfkTableKPI! };
    
    if (fileType === "planFile") {
      updatedKPI.planFile = file ?? undefined;
    } else {
      updatedKPI.factFile = file ?? undefined;
    }

    // Обновляем KPI в соответствующих данных
    if (source === "annual") {
      const years = annualKPIs[streamId];
      if (years) {
        const yearKPIs = years[period];
        if (yearKPIs) {
          const updatedKPIs = yearKPIs.map(kpi => 
            kpi.id === kpiId ? updatedKPI : kpi
          );
          setAnnualKPIs({
            ...annualKPIs,
            [streamId]: {
              ...years,
              [period]: updatedKPIs,
            },
          });
        }
      }
    } else if (source === "quarterly") {
      // Преобразуем период обратно в формат quarter (например, "1Q2025" -> "q1-2025")
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      const quarters = quarterlyKPIs[streamId];
      if (quarters) {
        const quarterKPIs = quarters[quarter];
        if (quarterKPIs) {
          const updatedKPIs = quarterKPIs.map(kpi => 
            kpi.id === kpiId ? updatedKPI : kpi
          );
          setQuarterlyKPIs({
            ...quarterlyKPIs,
            [streamId]: {
              ...quarters,
              [quarter]: updatedKPIs,
            },
          });
        }
      }
    } else if (source === "itLeader") {
      // Преобразуем период обратно в формат quarter
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      const quarters = itLeaderKPIs[streamId];
      if (quarters) {
        const quarterKPIs = quarters[quarter];
        if (quarterKPIs) {
          const updatedKPIs = quarterKPIs.map(kpi => 
            kpi.id === kpiId ? updatedKPI : kpi
          );
          setItLeaderKPIs({
            ...itLeaderKPIs,
            [streamId]: {
              ...quarters,
              [quarter]: updatedKPIs,
            },
          });
        }
      }
    }
    
    // Обновляем выбранный KPI
    setSelectedPfkTableKPI(updatedKPI);
  };

  // Обработчики загрузки файлов
  const handlePfkTablePlanFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file || !selectedPfkTableKPI) {
      if (pfkTablePlanFileInputRef.current) {
        pfkTablePlanFileInputRef.current.value = '';
      }
      return;
    }

    // Проверяем, что файл Excel
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      if (pfkTablePlanFileInputRef.current) {
        pfkTablePlanFileInputRef.current.value = '';
      }
      showError('Пожалуйста, загрузите файл Excel (.xlsx, .xls, .xlsm)');
      return;
    }

    // Создаем объект файла
    const fileUrl = URL.createObjectURL(file);
    const attachedFile: AttachedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
      size: file.size,
    };

    updateKPIFile(selectedPfkTableKPI.id, "planFile", attachedFile);
    success('Файл для плана успешно загружен');
  };

  const handlePfkTableFactFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file || !selectedPfkTableKPI) {
      if (pfkTableFactFileInputRef.current) {
        pfkTableFactFileInputRef.current.value = '';
      }
      return;
    }

    // Проверяем, что файл Excel
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      if (pfkTableFactFileInputRef.current) {
        pfkTableFactFileInputRef.current.value = '';
      }
      showError('Пожалуйста, загрузите файл Excel (.xlsx, .xls, .xlsm)');
      return;
    }

    // Создаем объект файла
    const fileUrl = URL.createObjectURL(file);
    const attachedFile: AttachedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
      size: file.size,
    };

    updateKPIFile(selectedPfkTableKPI.id, "factFile", attachedFile);
    success('Файл для факта успешно загружен');
  };

  const handleRemovePfkTablePlanFile = () => {
    if (selectedPfkTableKPI?.planFile?.url) {
      URL.revokeObjectURL(selectedPfkTableKPI.planFile.url);
    }
    if (selectedPfkTableKPI) {
      updateKPIFile(selectedPfkTableKPI.id, "planFile", null);
    }
    if (pfkTablePlanFileInputRef.current) {
      pfkTablePlanFileInputRef.current.value = '';
    }
  };

  const handleRemovePfkTableFactFile = () => {
    if (selectedPfkTableKPI?.factFile?.url) {
      URL.revokeObjectURL(selectedPfkTableKPI.factFile.url);
    }
    if (selectedPfkTableKPI) {
      updateKPIFile(selectedPfkTableKPI.id, "factFile", null);
    }
    if (pfkTableFactFileInputRef.current) {
      pfkTableFactFileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  // Функция для сбора всех данных таблицы ПФК
  const getAllPfkTableData = () => {
    const allKPIs: Array<{
      kpi: KPI;
      streamId: string;
      streamName: string;
      period: string;
      teamOrLeader: string;
      source: "annual" | "quarterly" | "itLeader";
      datEmployee?: string;
      planResponsible?: string;
      factResponsible?: string;
    }> = [];

    // Годовые KPI стримов
    Object.entries(annualKPIs).forEach(([streamId, years]) => {
      const stream = streams.find(s => s.id === streamId);
      const streamName = stream?.name || streamId;
      const referenceStream = referenceStreams.find(s => s.id === streamId);
      const datEmployee = referenceStream?.datEmployeeIds && referenceStream.datEmployeeIds.length > 0
        ? mockDATEmployees.find(emp => emp.id === referenceStream.datEmployeeIds![0])?.fullName || "—"
        : "—";
      const planResponsible = datEmployee !== "—" ? datEmployee : "—";
      const factResponsible = datEmployee !== "—" ? datEmployee : "—";
      Object.entries(years).forEach(([year, kpis]) => {
        kpis.forEach(kpi => {
          allKPIs.push({
            kpi,
            streamId,
            streamName,
            period: year,
            teamOrLeader: stream?.teams?.[0]?.name || "—",
            source: "annual",
            datEmployee,
            planResponsible,
            factResponsible,
          });
        });
      });
    });

    // Квартальные KPI стримов
    Object.entries(quarterlyKPIs).forEach(([streamId, quarters]) => {
      const stream = streams.find(s => s.id === streamId);
      const streamName = stream?.name || streamId;
      const referenceStream = referenceStreams.find(s => s.id === streamId);
      const datEmployee = referenceStream?.datEmployeeIds && referenceStream.datEmployeeIds.length > 0
        ? mockDATEmployees.find(emp => emp.id === referenceStream.datEmployeeIds![0])?.fullName || "—"
        : "—";
      const planResponsible = datEmployee !== "—" ? datEmployee : "—";
      const factResponsible = datEmployee !== "—" ? datEmployee : "—";
      Object.entries(quarters).forEach(([quarter, kpis]) => {
        const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
        const quarterLabel = quarterMatch 
          ? `${quarterMatch[1]}Q${quarterMatch[2]}`
          : quarter.replace("q", "").replace("-", "Q");
        kpis.forEach(kpi => {
          allKPIs.push({
            kpi,
            streamId,
            streamName,
            period: quarterLabel,
            teamOrLeader: stream?.teams?.[0]?.name || "—",
            source: "quarterly",
            datEmployee,
            planResponsible,
            factResponsible,
          });
        });
      });
    });

    // Квартальные KPI IT лидеров
    Object.entries(itLeaderKPIs).forEach(([streamId, quarters]) => {
      const stream = streams.find(s => s.id === streamId);
      const streamName = stream?.name || streamId;
      const referenceStream = referenceStreams.find(s => s.id === streamId);
      const datEmployee = referenceStream?.datEmployeeIds && referenceStream.datEmployeeIds.length > 0
        ? mockDATEmployees.find(emp => emp.id === referenceStream.datEmployeeIds![0])?.fullName || "—"
        : "—";
      const planResponsible = datEmployee !== "—" ? datEmployee : "—";
      const factResponsible = datEmployee !== "—" ? datEmployee : "—";
      Object.entries(quarters).forEach(([quarter, kpis]) => {
        const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
        const quarterLabel = quarterMatch 
          ? `${quarterMatch[1]}Q${quarterMatch[2]}`
          : quarter.replace("q", "").replace("-", "Q");
        kpis.forEach(kpi => {
          allKPIs.push({
            kpi,
            streamId,
            streamName,
            period: quarterLabel,
            teamOrLeader: stream?.itLeader ? `${stream.itLeader.name} (IT лидер)` : "IT лидер",
            source: "itLeader",
            datEmployee,
            planResponsible,
            factResponsible,
          });
        });
      });
    });

    return allKPIs;
  };

  // Экспорт в Excel
  const handleExportExcel = () => {
    try {
      const allKPIs = getAllPfkTableData();
      
      const data = allKPIs.map(item => ({
        "Наименование КПЭ": item.kpi.name,
        "Период": item.period,
        "Стрим": item.streamName,
        "Команда/IT лидер": item.teamOrLeader,
        "План": item.kpi.plan,
        "Статус план": item.kpi.planStatus || "—",
        "Факт": item.kpi.fact,
        "Статус факт": item.kpi.factStatus || "—",
        "Значение выполнения": `${item.kpi.completionPercent.toFixed(2)}%`,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Таблица ПФК");
      
      const fileName = `Таблица_ПФК_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      success("Экспорт в Excel выполнен успешно");
    } catch (err) {
      showError("Ошибка при экспорте в Excel: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
    }
  };

  // Импорт из Excel
  const handleImportExcel = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Array<Record<string, any>>;

          // Валидация и обработка данных
          let importedCount = 0;
          const errors: string[] = [];

          jsonData.forEach((row, index) => {
            try {
              const kpiName = row["Наименование КПЭ"];
              const streamName = row["Стрим"];
              const period = row["Период"];
              const plan = parseFloat(row["План"]);
              const fact = parseFloat(row["Факт"]);

              if (!kpiName || !streamName || !period) {
                errors.push(`Строка ${index + 2}: отсутствуют обязательные поля`);
                return;
              }

              // Находим соответствующий KPI и обновляем его
              const stream = streams.find(s => s.name === streamName);
              if (!stream) {
                errors.push(`Строка ${index + 2}: стрим "${streamName}" не найден`);
                return;
              }

              // Ищем KPI в annualKPIs или quarterlyKPIs
              let found = false;
              
              // Проверяем годовые KPI
              if (annualKPIs[stream.id]) {
                Object.entries(annualKPIs[stream.id]).forEach(([year, kpis]) => {
                  if (year === period) {
                    const kpi = kpis.find(k => k.name === kpiName);
                    if (kpi) {
                      kpi.plan = plan || kpi.plan;
                      kpi.fact = fact || kpi.fact;
                      if (row["Статус план"]) kpi.planStatus = row["Статус план"];
                      if (row["Статус факт"]) kpi.factStatus = row["Статус факт"];
                      const metrics = calculateKPIMetrics(kpi.plan, kpi.fact, kpi.weight);
                      kpi.completionPercent = metrics.completionPercent;
                      kpi.evaluationPercent = metrics.evaluationPercent;
                      found = true;
                      importedCount++;
                    }
                  }
                });
              }

              // Проверяем квартальные KPI
              if (!found && quarterlyKPIs[stream.id]) {
                Object.entries(quarterlyKPIs[stream.id]).forEach(([quarter, kpis]) => {
                  const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
                  const quarterLabel = quarterMatch 
                    ? `${quarterMatch[1]}Q${quarterMatch[2]}`
                    : quarter.replace("q", "").replace("-", "Q");
                  if (quarterLabel === period) {
                    const kpi = kpis.find(k => k.name === kpiName);
                    if (kpi) {
                      kpi.plan = plan || kpi.plan;
                      kpi.fact = fact || kpi.fact;
                      if (row["Статус план"]) kpi.planStatus = row["Статус план"];
                      if (row["Статус факт"]) kpi.factStatus = row["Статус факт"];
                      const metrics = calculateKPIMetrics(kpi.plan, kpi.fact, kpi.weight);
                      kpi.completionPercent = metrics.completionPercent;
                      kpi.evaluationPercent = metrics.evaluationPercent;
                      found = true;
                      importedCount++;
                    }
                  }
                });
              }

              if (!found) {
                errors.push(`Строка ${index + 2}: KPI "${kpiName}" не найден для стрима "${streamName}" и периода "${period}"`);
              }
            } catch (err) {
              errors.push(`Строка ${index + 2}: ошибка обработки - ${err instanceof Error ? err.message : "Неизвестная ошибка"}`);
            }
          });

          // Обновляем состояния
          setAnnualKPIs({ ...annualKPIs });
          setQuarterlyKPIs({ ...quarterlyKPIs });

          if (importedCount > 0) {
            success(`Импортировано ${importedCount} записей${errors.length > 0 ? `. Ошибок: ${errors.length}` : ""}`);
          } else {
            showError("Не удалось импортировать данные. Проверьте формат файла.");
          }

          if (errors.length > 0) {
            console.error("Ошибки импорта:", errors);
          }
        } catch (err) {
          showError("Ошибка при чтении файла Excel: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  // Переключение раскрытия стрима
  const toggleStream = (streamId: string, e?: MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newExpanded = new Set(expandedStreams);
    if (newExpanded.has(streamId)) {
      newExpanded.delete(streamId);
    } else {
      newExpanded.add(streamId);
    }
    setExpandedStreams(newExpanded);
  };

  // Выбор стрима
  const handleSelectStream = (stream: Stream) => {
    setSelectedStream(stream);
    setSelectedTeam(null); // Сбрасываем выбор команды при выборе стрима
  };

  // Выбор команды
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setSelectedStream(null); // Сбрасываем выбор стрима при выборе команды
  };

  // Расчет completionPercent и evaluationPercent
  const calculateKPIMetrics = (plan: number, fact: number, weight: number) => {
    const completionPercent = plan !== 0 ? (fact / plan) * 100 : 0;
    const evaluationPercent = Math.min(completionPercent * (weight / 100), weight * 1.2); // Максимум 120% от веса
    return { completionPercent, evaluationPercent };
  };

  // Открытие диалога добавления КПЭ
  const handleAddKPI = (type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => {
    setEditingKPI(null);
    setKpiDialogType(type);
    if (quarter) setKpiQuarter(quarter);
    setKpiSource(source || "stream");
    setKpiFormData({
      name: "",
      weight: 0,
      type: "Количественный",
      unit: "",
      plan: 0,
      fact: 0,
    });
    setPlanFile(null);
    setFactFile(null);
    // Если это ИТ лидер, добавляем КПЭ напрямую без диалога
    if (source === "itLeader" && quarter && selectedStream) {
      const { completionPercent, evaluationPercent } = calculateKPIMetrics(0, 0, 0);
      const newKPI: KPI = {
        id: `it-kpi-${Date.now()}`,
        number: (itLeaderKPIs[selectedStream.id]?.[quarter]?.length || 0) + 1,
        name: "",
        weight: 0,
        type: "Количественный",
        unit: "",
        plan: 0,
        fact: 0,
        completionPercent,
        evaluationPercent,
      };
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [selectedStream.id]: {
          ...(itLeaderKPIs[selectedStream.id] || {}),
          [quarter]: [...(itLeaderKPIs[selectedStream.id]?.[quarter] || []), newKPI],
        },
      });
      return;
    }
    
    setIsKPIDialogOpen(true);
  };

  // Открытие диалога редактирования КПЭ
  const handleEditKPI = (kpi: KPI, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => {
    setEditingKPI(kpi);
    setKpiDialogType(type);
    if (quarter) setKpiQuarter(quarter);
    setKpiSource(source || "stream");
    setKpiFormData({
      name: kpi.name,
      weight: kpi.weight,
      type: kpi.type,
      unit: kpi.unit,
      plan: kpi.plan,
      fact: kpi.fact,
    });
    setPlanFile(kpi.planFile || null);
    setFactFile(kpi.factFile || null);
    setIsKPIDialogOpen(true);
  };

  // Сохранение КПЭ
  const handleSaveKPI = () => {
    if (!selectedStream || !kpiFormData.name.trim() || kpiFormData.weight <= 0) return;

    const { completionPercent, evaluationPercent } = calculateKPIMetrics(
      kpiFormData.plan,
      kpiFormData.fact,
      kpiFormData.weight
    );

    const newKPI: KPI = {
      id: editingKPI?.id || `kpi-${Date.now()}`,
      number: editingKPI?.number || (kpiDialogType === "annual" 
        ? (annualKPIs[selectedStream.id]?.[selectedAnnualYear]?.length || 0) + 1
        : kpiSource === "itLeader"
        ? (itLeaderKPIs[selectedStream.id]?.[kpiQuarter]?.length || 0) + 1
        : (quarterlyKPIs[selectedStream.id]?.[kpiQuarter]?.length || 0) + 1),
      name: kpiFormData.name.trim(),
      weight: kpiFormData.weight,
      type: kpiFormData.type,
      unit: kpiFormData.unit.trim(),
      plan: kpiFormData.plan,
      fact: kpiFormData.fact,
      completionPercent,
      evaluationPercent,
      planFile: planFile || undefined,
      factFile: factFile || undefined,
    };

    if (kpiDialogType === "annual") {
      if (editingKPI) {
        setAnnualKPIs({
          ...annualKPIs,
          [selectedStream.id]: {
            ...annualKPIs[selectedStream.id],
            [selectedAnnualYear]: annualKPIs[selectedStream.id]?.[selectedAnnualYear]?.map(kpi => 
            kpi.id === editingKPI.id ? newKPI : kpi
            ) || [],
          },
        });
      } else {
        setAnnualKPIs({
          ...annualKPIs,
          [selectedStream.id]: {
            ...(annualKPIs[selectedStream.id] || {}),
            [selectedAnnualYear]: [...(annualKPIs[selectedStream.id]?.[selectedAnnualYear] || []), newKPI],
          },
        });
      }
    } else {
      if (kpiSource === "itLeader") {
        if (editingKPI) {
          setItLeaderKPIs({
            ...itLeaderKPIs,
            [selectedStream.id]: {
              ...itLeaderKPIs[selectedStream.id],
              [kpiQuarter]: (itLeaderKPIs[selectedStream.id]?.[kpiQuarter] || []).map(kpi =>
                kpi.id === editingKPI.id ? newKPI : kpi
              ),
            },
          });
        } else {
          setItLeaderKPIs({
            ...itLeaderKPIs,
            [selectedStream.id]: {
              ...(itLeaderKPIs[selectedStream.id] || {}),
              [kpiQuarter]: [...(itLeaderKPIs[selectedStream.id]?.[kpiQuarter] || []), newKPI],
            },
          });
        }
      } else {
        if (editingKPI) {
          const currentQuarterlyKPIs = quarterlyKPIs[selectedStream.id]?.[kpiQuarter] || [];
          setQuarterlyKPIs({
            ...quarterlyKPIs,
            [selectedStream.id]: {
              ...(quarterlyKPIs[selectedStream.id] || {}),
              [kpiQuarter]: currentQuarterlyKPIs.map(kpi =>
                kpi.id === editingKPI.id ? newKPI : kpi
              ),
            },
          });
        } else {
          setQuarterlyKPIs({
            ...quarterlyKPIs,
            [selectedStream.id]: {
              ...(quarterlyKPIs[selectedStream.id] || {}),
              [kpiQuarter]: [...(quarterlyKPIs[selectedStream.id]?.[kpiQuarter] || []), newKPI],
            },
          });
        }
      }
    }

    setIsKPIDialogOpen(false);
    setEditingKPI(null);
    setPlanFile(null);
    setFactFile(null);
    setKpiSource("stream");
  };

  // Удаление КПЭ
  const handleDeleteKPI = (kpiId: string, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => {
    if (!selectedStream) return;

    if (source === "itLeader" && quarter) {
      const remainingKPIs = itLeaderKPIs[selectedStream.id]?.[quarter]?.filter(kpi => kpi.id !== kpiId) || [];
      const updatedKPIs = remainingKPIs.map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      }));
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [selectedStream.id]: {
          ...itLeaderKPIs[selectedStream.id],
          [quarter]: updatedKPIs,
        },
      });
      return;
    }

    if (type === "annual") {
      setAnnualKPIs({
        ...annualKPIs,
        [selectedStream.id]: {
          ...annualKPIs[selectedStream.id],
          [selectedAnnualYear]: annualKPIs[selectedStream.id]?.[selectedAnnualYear]?.filter(kpi => kpi.id !== kpiId) || [],
        },
      });
    } else {
      if (quarter) {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [selectedStream.id]: {
            ...quarterlyKPIs[selectedStream.id],
            [quarter]: quarterlyKPIs[selectedStream.id][quarter].filter(kpi => kpi.id !== kpiId),
          },
        });
      }
    }
  };

  // Обновление КПЭ прямо в таблице
  const handleUpdateKPIInTable = (
    kpiId: string,
    field: keyof KPI | string,
    value: string | number,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    if (!selectedStream) return;

    const updateKPI = (kpi: KPI): KPI => {
      if (kpi.id !== kpiId) return kpi;

      const updatedKPI = { ...kpi, [field]: value };

      // Пересчитываем метрики, если изменились план, факт или вес
      if (field === "plan" || field === "fact" || field === "weight") {
        const { completionPercent, evaluationPercent } = calculateKPIMetrics(
          updatedKPI.plan,
          updatedKPI.fact,
          updatedKPI.weight
        );
        updatedKPI.completionPercent = completionPercent;
        updatedKPI.evaluationPercent = evaluationPercent;
      }

      return updatedKPI;
    };

    if (source === "itLeader" && quarter) {
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [selectedStream.id]: {
          ...itLeaderKPIs[selectedStream.id],
          [quarter]: itLeaderKPIs[selectedStream.id]?.[quarter]?.map(updateKPI) || [],
        },
      });
      return;
    }

    if (type === "annual") {
      setAnnualKPIs({
        ...annualKPIs,
        [selectedStream.id]: {
          ...annualKPIs[selectedStream.id],
          [selectedAnnualYear]: annualKPIs[selectedStream.id]?.[selectedAnnualYear]?.map(updateKPI) || [],
        },
      });
    } else {
      if (quarter) {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [selectedStream.id]: {
            ...quarterlyKPIs[selectedStream.id],
            [quarter]: quarterlyKPIs[selectedStream.id][quarter].map(updateKPI),
          },
        });
      }
    }
  };

  // Обновление KPI в таблице ПФК
  const handleUpdateKPIPFKTable = (
    kpiId: string,
    field: "plan" | "fact",
    value: number,
    streamId: string,
    source: "annual" | "quarterly" | "itLeader",
    period: string
  ) => {
    const updateKPI = (kpi: KPI): KPI => {
      if (kpi.id !== kpiId) return kpi;

      const updatedKPI = { ...kpi, [field]: value };

      // Пересчитываем метрики, если изменились план или факт
      if (field === "plan" || field === "fact") {
        const { completionPercent, evaluationPercent } = calculateKPIMetrics(
          updatedKPI.plan,
          updatedKPI.fact,
          updatedKPI.weight
        );
        updatedKPI.completionPercent = completionPercent;
        updatedKPI.evaluationPercent = evaluationPercent;
      }

      return updatedKPI;
    };

    if (source === "annual") {
      // Для годовых KPI period - это год
      const year = period;
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: (annualKPIs[streamId]?.[year] || []).map(updateKPI),
        },
      });
    } else if (source === "itLeader") {
      // Для IT лидеров нужно преобразовать period обратно в формат q1-2025
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [streamId]: {
          ...(itLeaderKPIs[streamId] || {}),
          [quarter]: (itLeaderKPIs[streamId]?.[quarter] || []).map(updateKPI),
        },
      });
    } else {
      // Для квартальных KPI стримов
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      setQuarterlyKPIs({
        ...quarterlyKPIs,
        [streamId]: {
          ...(quarterlyKPIs[streamId] || {}),
          [quarter]: (quarterlyKPIs[streamId]?.[quarter] || []).map(updateKPI),
        },
      });
    }
  };

  // Обновление статуса плана или факта в таблице ПФК
  const handleApproveStatusPFKTable = (
    kpiId: string,
    statusType: "plan" | "fact",
    streamId: string,
    source: "annual" | "quarterly" | "itLeader",
    period: string
  ) => {
    const updateKPI = (kpi: KPI): KPI => {
      if (kpi.id !== kpiId) return kpi;

      const newStatus = statusType === "plan" ? "План согласован" : "Факт согласован";
      const updatedKPI = { 
        ...kpi, 
        [statusType === "plan" ? "planStatus" : "factStatus"]: newStatus 
      };

      return updatedKPI;
    };

    if (source === "annual") {
      const year = period;
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: (annualKPIs[streamId]?.[year] || []).map(updateKPI),
        },
      });
    } else if (source === "itLeader") {
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [streamId]: {
          ...(itLeaderKPIs[streamId] || {}),
          [quarter]: (itLeaderKPIs[streamId]?.[quarter] || []).map(updateKPI),
        },
      });
    } else {
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      setQuarterlyKPIs({
        ...quarterlyKPIs,
        [streamId]: {
          ...(quarterlyKPIs[streamId] || {}),
          [quarter]: (quarterlyKPIs[streamId]?.[quarter] || []).map(updateKPI),
        },
      });
    }
  };

  // Открытие диалога отклонения
  const handleOpenRejectionDialog = (
    kpiId: string,
    statusType: "plan" | "fact",
    streamId: string,
    source: "annual" | "quarterly" | "itLeader",
    period: string
  ) => {
    setPendingRejection({ kpiId, statusType, streamId, source, period });
    setRejectionComment("");
    setRejectionDialogOpen(true);
  };

  // Отклонение статуса плана или факта в таблице ПФК
  const handleRejectStatusPFKTable = (comment: string) => {
    if (!pendingRejection || !comment.trim()) {
      return;
    }

    const { kpiId, statusType, streamId, source, period } = pendingRejection;

    const updateKPI = (kpi: KPI): KPI => {
      if (kpi.id !== kpiId) return kpi;

      const newStatus = statusType === "plan" ? "План отклонен" : "Факт отклонен";
      const updatedKPI = { 
        ...kpi, 
        [statusType === "plan" ? "planStatus" : "factStatus"]: newStatus,
        [statusType === "plan" ? "planRejectionComment" : "factRejectionComment"]: comment.trim()
      };

      return updatedKPI;
    };

    if (source === "annual") {
      const year = period;
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: (annualKPIs[streamId]?.[year] || []).map(updateKPI),
        },
      });
    } else if (source === "itLeader") {
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [streamId]: {
          ...(itLeaderKPIs[streamId] || {}),
          [quarter]: (itLeaderKPIs[streamId]?.[quarter] || []).map(updateKPI),
        },
      });
    } else {
      const quarterMatch = period.match(/(\d)Q(\d{4})/);
      const quarter = quarterMatch ? `q${quarterMatch[1]}-${quarterMatch[2]}` : period;
      setQuarterlyKPIs({
        ...quarterlyKPIs,
        [streamId]: {
          ...(quarterlyKPIs[streamId] || {}),
          [quarter]: (quarterlyKPIs[streamId]?.[quarter] || []).map(updateKPI),
        },
      });
    }

    setRejectionDialogOpen(false);
    setPendingRejection(null);
    setRejectionComment("");
  };

  // Функция для перемещения КПЭ
  const handleMoveKPI = (dragIndex: number, hoverIndex: number, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => {
    if (!selectedStream) return;
    
    if (source === "itLeader" && quarter) {
      const kpis = itLeaderKPIs[selectedStream.id]?.[quarter] || [];
      if (dragIndex === hoverIndex || dragIndex < 0 || hoverIndex < 0 || dragIndex >= kpis.length || hoverIndex >= kpis.length) return;
      
      const newKPIs = [...kpis];
      const [movedKPI] = newKPIs.splice(dragIndex, 1);
      newKPIs.splice(hoverIndex, 0, movedKPI);
      
      // Обновляем номера
      const updatedKPIs = newKPIs.map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      }));
      
      setItLeaderKPIs({
        ...itLeaderKPIs,
        [selectedStream.id]: {
          ...itLeaderKPIs[selectedStream.id],
          [quarter]: updatedKPIs,
        },
      });
      return;
    }
    
    if (type === "annual") {
      const kpis = annualKPIs[selectedStream.id]?.[selectedAnnualYear] || [];
      if (dragIndex === hoverIndex || dragIndex < 0 || hoverIndex < 0 || dragIndex >= kpis.length || hoverIndex >= kpis.length) return;
      
      const newKPIs = [...kpis];
      const [movedKPI] = newKPIs.splice(dragIndex, 1);
      newKPIs.splice(hoverIndex, 0, movedKPI);
      
      // Обновляем номера
      const updatedKPIs = newKPIs.map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      }));
      
      setAnnualKPIs({
        ...annualKPIs,
        [selectedStream.id]: {
          ...annualKPIs[selectedStream.id],
          [selectedAnnualYear]: updatedKPIs,
        },
      });
    } else {
      if (!quarter) return;
      const kpis = quarterlyKPIs[selectedStream.id]?.[quarter] || [];
      if (dragIndex === hoverIndex || dragIndex < 0 || hoverIndex < 0 || dragIndex >= kpis.length || hoverIndex >= kpis.length) return;
      
      const newKPIs = [...kpis];
      const [movedKPI] = newKPIs.splice(dragIndex, 1);
      newKPIs.splice(hoverIndex, 0, movedKPI);
      
      // Обновляем номера
      const updatedKPIs = newKPIs.map((kpi, index) => ({
        ...kpi,
        number: index + 1,
      }));
      
      setQuarterlyKPIs({
        ...quarterlyKPIs,
        [selectedStream.id]: {
          ...quarterlyKPIs[selectedStream.id],
          [quarter]: updatedKPIs,
        },
      });
    }
  };

  // Фильтрация стримов и команд
  const filteredStreams = streams.filter(stream => {
    // Фильтр по типам стримов
    if (filters.types.length > 0 && stream.type && !filters.types.includes(stream.type)) {
      return false;
    }
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const streamMatches = 
      stream.name.toLowerCase().includes(query) ||
      stream.description?.toLowerCase().includes(query) ||
      stream.leader?.name.toLowerCase().includes(query) ||
      stream.leader?.position.toLowerCase().includes(query) ||
      stream.itLeader?.name.toLowerCase().includes(query) ||
      stream.itLeader?.position.toLowerCase().includes(query);
    
    const filteredTeams = stream.teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.leader?.toLowerCase().includes(query)
    );
    
    return streamMatches || filteredTeams.length > 0;
  }).map(stream => {
    if (!searchQuery.trim()) return stream;
    
    const query = searchQuery.toLowerCase();
    const streamMatches = 
      stream.name.toLowerCase().includes(query) ||
      stream.description?.toLowerCase().includes(query) ||
      stream.leader?.name.toLowerCase().includes(query) ||
      stream.leader?.position.toLowerCase().includes(query) ||
      stream.itLeader?.name.toLowerCase().includes(query) ||
      stream.itLeader?.position.toLowerCase().includes(query);
    
    const filteredTeams = stream.teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.leader?.toLowerCase().includes(query)
    );
    
    if (streamMatches) {
      return stream;
    }
    
    if (filteredTeams.length > 0) {
      return { ...stream, teams: filteredTeams };
    }
    
    return null;
  }).filter(Boolean) as Stream[];
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Целеполагание Стримы</h1>
          <p className="text-muted-foreground">
            Управление целеполаганием стримовой деятельности
          </p>
        </div>
      </div>

      <Tabs defaultValue="streams-teams" className="w-full max-w-full overflow-x-hidden">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="streams-teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>КР стримов и команд</span>
          </TabsTrigger>
          <TabsTrigger value="kpi-registry" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Реестр КПЭ</span>
          </TabsTrigger>
          <TabsTrigger value="pfk-table" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Таблица ПФК</span>
          </TabsTrigger>
          <TabsTrigger value="reference" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span>Справочники</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Дэшборд</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="streams-teams" className="space-y-4">
          {/* Поиск и фильтры */}
          <div className="flex gap-2">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по стримам и командам..."
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
            <FilterDialog
              open={filterDialogOpen}
              onOpenChange={setFilterDialogOpen}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Двухколоночная структура */}
          {filteredStreams.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "Стримы и команды не найдены" : "Нет стримов и команд"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Стримы и команды будут отображаться здесь"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 w-full overflow-x-hidden">
              {/* Левая колонка - иерархия стримов и команд */}
              <StreamsList
                streams={filteredStreams}
                selectedStream={selectedStream}
                selectedTeam={selectedTeam}
                expandedStreams={expandedStreams}
                onSelectStream={handleSelectStream}
                onSelectTeam={handleSelectTeam}
                onToggleStream={toggleStream}
              />

              {/* Правая колонка - детальная информация о стриме или команде */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-280px)] pr-2">
                {selectedTeam ? (
                  <TeamDetails team={selectedTeam} />
                ) : selectedStream ? (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl break-words">{selectedStream.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-x-hidden p-0">
                      <Tabs defaultValue="stream-info" className="w-full">
                        <div className="px-6 pt-2">
                          <TabsList className="grid w-full grid-cols-5 rounded-lg">
                          <TabsTrigger value="stream-info" className="rounded-l-lg">
                            Информация о стриме
                          </TabsTrigger>
                          <TabsTrigger value="annual-kpi">
                            Годовые КР стрима
                          </TabsTrigger>
                          <TabsTrigger value="quarterly-kpi">
                            Квартальные КР стрима
                          </TabsTrigger>
                          <TabsTrigger value="it-leader-kpi">
                            Квартальные КР ИТ лидера
                          </TabsTrigger>
                          <TabsTrigger value="dashboard" className="rounded-r-lg">
                            Дэшборд
                          </TabsTrigger>
                        </TabsList>
                        </div>
                        
                        <TabsContent value="stream-info" className="space-y-6 p-6 mt-4">
                          {/* Информация о стриме */}
                          <div className="space-y-3">
                            <div className="p-5 border rounded-lg bg-muted/30">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Левая колонка */}
                                <div className="space-y-4">
                                  {selectedStream.businessType && (
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Вид бизнеса</Label>
                                      <div>
                                        <Badge variant="default" className="text-sm">
                                          {selectedStream.businessType}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                  {selectedStream.type && (
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Тип стрима</Label>
                                      <div>
                                        <Badge variant="default" className="text-sm">
                                          {selectedStream.type}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Правая колонка */}
                                <div className="space-y-4">
                                  {selectedStream.leader && (
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Лидер стрима</Label>
                                      <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                            {getInitials(selectedStream.leader)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <p className="text-sm font-medium">{selectedStream.leader.name}</p>
                                          <p className="text-xs text-muted-foreground mt-0.5">{selectedStream.leader.position}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {selectedStream.itLeader && (
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">ИТ лидер стрима</Label>
                                      <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                            {getInitials(selectedStream.itLeader)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <p className="text-sm font-medium">{selectedStream.itLeader.name}</p>
                                          <p className="text-xs text-muted-foreground mt-0.5">{selectedStream.itLeader.position}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Сотрудники ДАТ */}
                          {(() => {
                            const referenceStream = referenceStreams.find(s => s.id === selectedStream.id);
                            const streamDATEmployees = referenceStream?.datEmployeeIds 
                              ? mockDATEmployees.filter(emp => referenceStream.datEmployeeIds!.includes(emp.id))
                              : [];
                            
                            return streamDATEmployees.length > 0 ? (
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                  <UserCircle className="h-4 w-4" />
                                  Сотрудники ДАТ
                                </Label>
                                <div className="p-5 border rounded-lg bg-muted/30">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {streamDATEmployees.map((employee) => (
                                      <div key={employee.id} className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                          {employee.avatar ? (
                                            <AvatarImage src={employee.avatar} alt={employee.fullName} />
                                          ) : null}
                                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                            {getInitialsFromName(employee.fullName)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <p className="text-sm font-medium">{employee.fullName}</p>
                                          <p className="text-xs text-muted-foreground mt-0.5">{employee.position}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}

                          <Separator />

                          {/* Команды стрима */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Команды стрима
                            </Label>
                            <div className="flex flex-wrap gap-2.5">
                              {selectedStream.teams.map((team) => (
                                <Badge
                                  key={team.id}
                                  variant="outline"
                                  className="text-sm cursor-pointer border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-colors px-3 py-1.5"
                                  onClick={() => handleSelectTeam(team)}
                                >
                                  {team.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="annual-kpi" className="space-y-6 p-6 mt-4">
                          <AnnualKPICards
                            stream={selectedStream}
                            annualKPIs={annualKPIs}
                            isAnnualExpanded={isAnnualExpanded}
                            isEditModeAnnual={isEditModeAnnual}
                            selectedAnnualYear={selectedAnnualYear}
                            draggedKPIId={draggedKPIId}
                            onAnnualExpandedChange={setIsAnnualExpanded}
                            onEditModeAnnualChange={setIsEditModeAnnual}
                            onSelectedAnnualYearChange={setSelectedAnnualYear}
                            onDraggedKPIIdChange={setDraggedKPIId}
                            onDraggedKPIQuarterChange={setDraggedKPIQuarter}
                            onAddKPI={handleAddKPI}
                            onDeleteKPI={handleDeleteKPI}
                            onMoveKPI={handleMoveKPI}
                            onUpdateKPIInTable={handleUpdateKPIInTable}
                            onAnnualKPIsChange={setAnnualKPIs}
                          />
                        </TabsContent>

                        <TabsContent value="quarterly-kpi" className="space-y-6 p-6 mt-4">
                          <QuarterlyKPICards
                            stream={selectedStream}
                            quarterlyKPIs={quarterlyKPIs}
                            isQuarterlyExpanded={isQuarterlyExpanded}
                            isEditModeQuarterly={isEditModeQuarterly}
                            selectedQuarterlyYear={selectedQuarterlyYear}
                            draggedKPIId={draggedKPIId}
                            draggedKPIQuarter={draggedKPIQuarter}
                            onQuarterlyExpandedChange={setIsQuarterlyExpanded}
                            onEditModeQuarterlyChange={setIsEditModeQuarterly}
                            onSelectedQuarterlyYearChange={setSelectedQuarterlyYear}
                            onDraggedKPIIdChange={setDraggedKPIId}
                            onDraggedKPIQuarterChange={setDraggedKPIQuarter}
                            onAddKPI={handleAddKPI}
                            onDeleteKPI={handleDeleteKPI}
                            onMoveKPI={handleMoveKPI}
                            onUpdateKPIInTable={handleUpdateKPIInTable}
                            onQuarterlyKPIsChange={setQuarterlyKPIs}
                          />
                        </TabsContent>

                        <TabsContent value="it-leader-kpi" className="space-y-6 p-6 mt-4">
                          <ITLeaderKPICards
                            stream={selectedStream}
                            itLeaderKPIs={itLeaderKPIs}
                            isITLeaderExpanded={isITLeaderExpanded}
                            isEditModeITLeader={isEditModeITLeader}
                            selectedITLeaderYear={selectedITLeaderYear}
                            draggedKPIId={draggedKPIId}
                            draggedKPIQuarter={draggedKPIQuarter}
                            onITLeaderExpandedChange={setIsITLeaderExpanded}
                            onEditModeITLeaderChange={setIsEditModeITLeader}
                            onSelectedITLeaderYearChange={setSelectedITLeaderYear}
                            onDraggedKPIIdChange={setDraggedKPIId}
                            onDraggedKPIQuarterChange={setDraggedKPIQuarter}
                            onAddKPI={handleAddKPI}
                            onDeleteKPI={handleDeleteKPI}
                            onMoveKPI={handleMoveKPI}
                            onUpdateKPIInTable={handleUpdateKPIInTable}
                            onITLeaderKPIsChange={setItLeaderKPIs}
                          />
                        </TabsContent>

                        <TabsContent value="dashboard" className="p-6 mt-4">
                          <DashboardTab
                            streams={[selectedStream]}
                            annualKPIs={annualKPIs}
                            quarterlyKPIs={quarterlyKPIs}
                            itLeaderKPIs={itLeaderKPIs}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Выберите стрим или команду</h3>
                      <p className="text-muted-foreground">
                        Выберите стрим или команду из списка слева, чтобы просмотреть подробную информацию
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="kpi-registry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Реестр КПЭ
              </CardTitle>
              <CardDescription>
                Реестр ключевых показателей эффективности
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Раздел находится в разработке. Здесь будет отображаться реестр ключевых показателей эффективности.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pfk-table" className="space-y-6 w-full max-w-full">
          <Card className="w-full max-w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Таблица ПФК
                  </CardTitle>
                  <CardDescription>
                    Таблица плановых фактических критических значений
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="w-full max-w-full">
              {/* Поиск и фильтры */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по наименованию КПЭ, стриму, команде..."
                    value={pfkTableSearchQuery}
                    onChange={(e) => setPfkTableSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {pfkTableSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setPfkTableSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Dialog open={pfkTableFilterDialogOpen} onOpenChange={setPfkTableFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Фильтры
                      {(pfkTableFilters.streams.length > 0 ||
                        pfkTableFilters.periods.length > 0 ||
                        pfkTableFilters.planStatuses.length > 0 ||
                        pfkTableFilters.factStatuses.length > 0 ||
                        pfkTableFilters.sources.length > 0) && (
                        <Badge variant="secondary" className="ml-2">
                          {pfkTableFilters.streams.length +
                            pfkTableFilters.periods.length +
                            pfkTableFilters.planStatuses.length +
                            pfkTableFilters.factStatuses.length +
                            pfkTableFilters.sources.length}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-3">
                      <DialogTitle className="text-lg">Фильтры таблицы ПФК</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-2">
                      {/* Левый столбец */}
                      <div className="space-y-6">
                        {/* Фильтр по стримам */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Стримы</Label>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                            {streams.map((stream) => (
                              <div key={stream.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`stream-${stream.id}`}
                                  checked={pfkTableFilters.streams.includes(stream.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setPfkTableFilters({
                                        ...pfkTableFilters,
                                        streams: [...pfkTableFilters.streams, stream.id],
                                      });
                                    } else {
                                      setPfkTableFilters({
                                        ...pfkTableFilters,
                                        streams: pfkTableFilters.streams.filter((id) => id !== stream.id),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`stream-${stream.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {stream.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Фильтр по статусам плана */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Статус плана</Label>
                          <div className="space-y-1.5">
                            {["План согласован", "План выставление"].map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`plan-status-${status}`}
                                  checked={pfkTableFilters.planStatuses.includes(status)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setPfkTableFilters({
                                        ...pfkTableFilters,
                                        planStatuses: [...pfkTableFilters.planStatuses, status],
                                      });
                                    } else {
                                      setPfkTableFilters({
                                        ...pfkTableFilters,
                                        planStatuses: pfkTableFilters.planStatuses.filter((s) => s !== status),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`plan-status-${status}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {status}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Правый столбец */}
                      <div className="space-y-6">
                        {/* Фильтр по периодам */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Периоды</Label>
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="period-annual"
                                checked={pfkTableFilters.periods.includes("annual")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      periods: [...pfkTableFilters.periods, "annual"],
                                    });
                                  } else {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      periods: pfkTableFilters.periods.filter((p) => p !== "annual"),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor="period-annual" className="text-sm font-normal cursor-pointer">
                                Годовые
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="period-quarterly"
                                checked={pfkTableFilters.periods.includes("quarterly")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      periods: [...pfkTableFilters.periods, "quarterly"],
                                    });
                                  } else {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      periods: pfkTableFilters.periods.filter((p) => p !== "quarterly"),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor="period-quarterly" className="text-sm font-normal cursor-pointer">
                                Квартальные
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Фильтр по статусам факта */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Статус факта</Label>
                          <div className="space-y-1.5">
                            {["Факт согласован", "Факт выставление"].map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`fact-status-${status}`}
                                  checked={pfkTableFilters.factStatuses.includes(status)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setPfkTableFilters({
                                        ...pfkTableFilters,
                                        factStatuses: [...pfkTableFilters.factStatuses, status],
                                      });
                                    } else {
                                      setPfkTableFilters({
                                        ...pfkTableFilters,
                                        factStatuses: pfkTableFilters.factStatuses.filter((s) => s !== status),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`fact-status-${status}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {status}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Фильтр по источникам */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Источник</Label>
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="source-annual"
                                checked={pfkTableFilters.sources.includes("annual")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      sources: [...pfkTableFilters.sources, "annual"],
                                    });
                                  } else {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      sources: pfkTableFilters.sources.filter((s) => s !== "annual"),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor="source-annual" className="text-sm font-normal cursor-pointer">
                                Годовые КПЭ стримов
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="source-quarterly"
                                checked={pfkTableFilters.sources.includes("quarterly")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      sources: [...pfkTableFilters.sources, "quarterly"],
                                    });
                                  } else {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      sources: pfkTableFilters.sources.filter((s) => s !== "quarterly"),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor="source-quarterly" className="text-sm font-normal cursor-pointer">
                                Квартальные КПЭ стримов
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="source-itLeader"
                                checked={pfkTableFilters.sources.includes("itLeader")}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      sources: [...pfkTableFilters.sources, "itLeader"],
                                    });
                                  } else {
                                    setPfkTableFilters({
                                      ...pfkTableFilters,
                                      sources: pfkTableFilters.sources.filter((s) => s !== "itLeader"),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor="source-itLeader" className="text-sm font-normal cursor-pointer">
                                КПЭ IT лидеров
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPfkTableFilters({
                            streams: [],
                            periods: [],
                            planStatuses: [],
                            factStatuses: [],
                            sources: [],
                          });
                        }}
                      >
                        Сбросить фильтры
                      </Button>
                      <Button onClick={() => setPfkTableFilterDialogOpen(false)}>Применить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Экспорт/импорт excel
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportExcel}>
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт таблица ПФК
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportExcel}>
                      <Upload className="h-4 w-4 mr-2" />
                      Импорт таблица ПФК
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-mode-toggle" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Режим редактирования
                  </Label>
                  <Switch
                    id="edit-mode-toggle"
                    checked={isPfkTableEditMode}
                    onCheckedChange={setIsPfkTableEditMode}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-card" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                <div className="overflow-x-auto" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <table className="caption-bottom text-sm table-fixed w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="min-w-[300px] font-bold text-base text-foreground">Наименование КПЭ</TableHead>
                        <TableHead className="w-[100px] text-center font-bold text-base text-foreground">Период</TableHead>
                        <TableHead className="min-w-[150px] font-bold text-base text-foreground">Стрим</TableHead>
                        <TableHead className="min-w-[150px] font-bold text-base text-foreground">Команда/IT лидер</TableHead>
                        <TableHead className="w-[180px] text-center font-bold text-base text-foreground">План</TableHead>
                        <TableHead className="w-[130px] font-bold text-base text-foreground">Статус план</TableHead>
                        <TableHead className="w-[180px] text-center font-bold text-base text-foreground">Факт</TableHead>
                        <TableHead className="w-[130px] font-bold text-base text-foreground">Статус факт</TableHead>
                        <TableHead className="w-[180px] text-center font-bold text-base text-foreground">Значение выполнения</TableHead>
                        <TableHead className="w-[120px] text-center font-bold text-base text-foreground">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {(() => {
                      // Собираем все KPI из разных источников
                      const allKPIs: Array<{
                        kpi: KPI;
                        streamId: string;
                        streamName: string;
                        period: string;
                        teamOrLeader: string;
                        source: "annual" | "quarterly" | "itLeader";
                        datEmployee?: string;
                        planResponsible?: string;
                        factResponsible?: string;
                      }> = [];

                      // Годовые KPI стримов
                      Object.entries(annualKPIs).forEach(([streamId, years]) => {
                        const stream = streams.find(s => s.id === streamId);
                        const streamName = stream?.name || streamId;
                        const referenceStream = referenceStreams.find(s => s.id === streamId);
                        const datEmployee = referenceStream?.datEmployeeIds && referenceStream.datEmployeeIds.length > 0
                          ? mockDATEmployees.find(emp => emp.id === referenceStream.datEmployeeIds![0])?.fullName || "—"
                          : "—";
                        // Моковые данные для ответственных (можно заменить на реальные данные из KPI)
                        const planResponsible = datEmployee !== "—" ? datEmployee : "—";
                        const factResponsible = datEmployee !== "—" ? datEmployee : "—";
                        Object.entries(years).forEach(([year, kpis]) => {
                          kpis.forEach(kpi => {
                            allKPIs.push({
                              kpi,
                              streamId,
                              streamName,
                              period: year,
                              teamOrLeader: stream?.teams?.[0]?.name || "—",
                              source: "annual",
                              datEmployee,
                              planResponsible,
                              factResponsible,
                            });
                          });
                        });
                      });

                      // Квартальные KPI стримов
                      Object.entries(quarterlyKPIs).forEach(([streamId, quarters]) => {
                        const stream = streams.find(s => s.id === streamId);
                        const streamName = stream?.name || streamId;
                        const referenceStream = referenceStreams.find(s => s.id === streamId);
                        const datEmployee = referenceStream?.datEmployeeIds && referenceStream.datEmployeeIds.length > 0
                          ? mockDATEmployees.find(emp => emp.id === referenceStream.datEmployeeIds![0])?.fullName || "—"
                          : "—";
                        const planResponsible = datEmployee !== "—" ? datEmployee : "—";
                        const factResponsible = datEmployee !== "—" ? datEmployee : "—";
                        Object.entries(quarters).forEach(([quarter, kpis]) => {
                          // Преобразуем формат q1-2025 в 1Q2025
                          const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
                          const quarterLabel = quarterMatch 
                            ? `${quarterMatch[1]}Q${quarterMatch[2]}`
                            : quarter.replace("q", "").replace("-", "Q");
                          kpis.forEach(kpi => {
                            allKPIs.push({
                              kpi,
                              streamId,
                              streamName,
                              period: quarterLabel,
                              teamOrLeader: stream?.teams?.[0]?.name || "—",
                              source: "quarterly",
                              datEmployee,
                              planResponsible,
                              factResponsible,
                            });
                          });
                        });
                      });

                      // Квартальные KPI IT лидеров
                      Object.entries(itLeaderKPIs).forEach(([streamId, quarters]) => {
                        const stream = streams.find(s => s.id === streamId);
                        const streamName = stream?.name || streamId;
                        const referenceStream = referenceStreams.find(s => s.id === streamId);
                        const datEmployee = referenceStream?.datEmployeeIds && referenceStream.datEmployeeIds.length > 0
                          ? mockDATEmployees.find(emp => emp.id === referenceStream.datEmployeeIds![0])?.fullName || "—"
                          : "—";
                        const planResponsible = datEmployee !== "—" ? datEmployee : "—";
                        const factResponsible = datEmployee !== "—" ? datEmployee : "—";
                        Object.entries(quarters).forEach(([quarter, kpis]) => {
                          // Преобразуем формат q1-2025 в 1Q2025
                          const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
                          const quarterLabel = quarterMatch 
                            ? `${quarterMatch[1]}Q${quarterMatch[2]}`
                            : quarter.replace("q", "").replace("-", "Q");
                          kpis.forEach(kpi => {
                            allKPIs.push({
                              kpi,
                              streamId,
                              streamName,
                              period: quarterLabel,
                              teamOrLeader: stream?.itLeader ? `${stream.itLeader.name} (IT лидер)` : "IT лидер",
                              source: "itLeader",
                              datEmployee,
                              planResponsible,
                              factResponsible,
                            });
                          });
                        });
                      });

                      // Фильтрация данных
                      let filteredKPIs = allKPIs;

                      // Фильтр по поисковому запросу
                      if (pfkTableSearchQuery.trim()) {
                        const query = pfkTableSearchQuery.toLowerCase();
                        filteredKPIs = filteredKPIs.filter((item) => {
                          return (
                            item.kpi.name.toLowerCase().includes(query) ||
                            item.streamName.toLowerCase().includes(query) ||
                            item.teamOrLeader.toLowerCase().includes(query) ||
                            item.period.toLowerCase().includes(query)
                          );
                        });
                      }

                      // Фильтр по стримам
                      if (pfkTableFilters.streams.length > 0) {
                        filteredKPIs = filteredKPIs.filter((item) =>
                          pfkTableFilters.streams.includes(item.streamId)
                        );
                      }

                      // Фильтр по периодам
                      if (pfkTableFilters.periods.length > 0) {
                        filteredKPIs = filteredKPIs.filter((item) => {
                          if (pfkTableFilters.periods.includes("annual") && item.source === "annual") {
                            return true;
                          }
                          if (pfkTableFilters.periods.includes("quarterly") && item.source === "quarterly") {
                            return true;
                          }
                          return false;
                        });
                      }

                      // Фильтр по статусам плана
                      if (pfkTableFilters.planStatuses.length > 0) {
                        filteredKPIs = filteredKPIs.filter((item) =>
                          item.kpi.planStatus && pfkTableFilters.planStatuses.includes(item.kpi.planStatus)
                        );
                      }

                      // Фильтр по статусам факта
                      if (pfkTableFilters.factStatuses.length > 0) {
                        filteredKPIs = filteredKPIs.filter((item) =>
                          item.kpi.factStatus && pfkTableFilters.factStatuses.includes(item.kpi.factStatus)
                        );
                      }

                      // Фильтр по источникам
                      if (pfkTableFilters.sources.length > 0) {
                        filteredKPIs = filteredKPIs.filter((item) =>
                          pfkTableFilters.sources.includes(item.source)
                        );
                      }

                      if (filteredKPIs.length === 0) {
                        const colSpan = 10;
                        return (
                          <TableRow>
                            <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-8">
                              {pfkTableSearchQuery || Object.values(pfkTableFilters).some(f => Array.isArray(f) && f.length > 0)
                                ? "Нет данных, соответствующих фильтрам"
                                : "Нет данных для отображения"}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // Пагинация
                      const totalPages = Math.ceil(filteredKPIs.length / pfkTableItemsPerPage);
                      const startIndex = (pfkTableCurrentPage - 1) * pfkTableItemsPerPage;
                      const endIndex = startIndex + pfkTableItemsPerPage;
                      const paginatedKPIs = filteredKPIs.slice(startIndex, endIndex);

                      return paginatedKPIs.map((item) => {
                        const { kpi, streamName, period, teamOrLeader, streamId, source } = item;
                        return (
                          <TableRow key={kpi.id}>
                            <TableCell className="break-words whitespace-normal">
                              <span 
                                className="cursor-pointer hover:text-primary hover:underline"
                                onClick={() => {
                                  setSelectedPfkTableKPI(kpi);
                                  setSelectedPfkTableKPIMeta({ streamId, period, source });
                                  setPfkTableKPIDialogOpen(true);
                                }}
                              >
                                {kpi.name}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-xs">
                                {period}
                              </Badge>
                            </TableCell>
                            <TableCell>{streamName}</TableCell>
                            <TableCell>{teamOrLeader}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                {isPfkTableEditMode ? (
                                  <PlanFactInput
                                    value={kpi.plan}
                                    onChange={(newValue) => {
                                      handleUpdateKPIPFKTable(kpi.id, "plan", newValue, item.streamId, item.source, item.period);
                                    }}
                                  />
                                ) : (
                                  <span>{kpi.plan !== undefined && kpi.plan !== null && kpi.plan !== 0 ? kpi.plan.toString().replace('.', ',') : "—"}</span>
                                )}
                                {kpi.planFile && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      if (kpi.planFile?.url) {
                                        window.open(kpi.planFile.url, '_blank');
                                      }
                                    }}
                                    title={`Файл: ${kpi.planFile.name}`}
                                  >
                                    <FileText className="h-4 w-4 text-primary" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Badge 
                                  variant={getStatusBadgeVariant(kpi.planStatus) as any}
                                  className={cn("text-xs", getStatusBadgeClassName(kpi.planStatus))}
                                >
                                  {kpi.planStatus || "—"}
                                </Badge>
                                {kpi.planStatus && kpi.planStatus.includes("отклонен") && kpi.planRejectionComment && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      setViewingComment({
                                        comment: kpi.planRejectionComment,
                                        statusType: "plan",
                                      });
                                      setViewCommentDialogOpen(true);
                                    }}
                                    title="Просмотреть комментарий отклонения"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {isPfkTableEditMode && kpi.planStatus && !kpi.planStatus.includes("согласован") && !kpi.planStatus.includes("отклонен") && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                                      onClick={() => handleApproveStatusPFKTable(kpi.id, "plan", item.streamId, item.source, item.period)}
                                      title="Согласовать план"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                      onClick={() => handleOpenRejectionDialog(kpi.id, "plan", item.streamId, item.source, item.period)}
                                      title="Отклонить план"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                {isPfkTableEditMode ? (
                                  <PlanFactInput
                                    value={kpi.fact}
                                    onChange={(newValue) => {
                                      handleUpdateKPIPFKTable(kpi.id, "fact", newValue, item.streamId, item.source, item.period);
                                    }}
                                  />
                                ) : (
                                  <span>{kpi.fact !== undefined && kpi.fact !== null && kpi.fact !== 0 ? kpi.fact.toString().replace('.', ',') : "—"}</span>
                                )}
                                {kpi.factFile && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      if (kpi.factFile?.url) {
                                        window.open(kpi.factFile.url, '_blank');
                                      }
                                    }}
                                    title={`Файл: ${kpi.factFile.name}`}
                                  >
                                    <FileText className="h-4 w-4 text-primary" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Badge 
                                  variant={getStatusBadgeVariant(kpi.factStatus) as any}
                                  className={cn("text-xs", getStatusBadgeClassName(kpi.factStatus))}
                                >
                                  {kpi.factStatus || "—"}
                                </Badge>
                                {kpi.factStatus && kpi.factStatus.includes("отклонен") && kpi.factRejectionComment && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                      setViewingComment({
                                        comment: kpi.factRejectionComment!,
                                        statusType: "fact",
                                      });
                                      setViewCommentDialogOpen(true);
                                    }}
                                    title="Просмотреть комментарий отклонения"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {isPfkTableEditMode && kpi.factStatus && !kpi.factStatus.includes("согласован") && !kpi.factStatus.includes("отклонен") && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                                      onClick={() => handleApproveStatusPFKTable(kpi.id, "fact", item.streamId, item.source, item.period)}
                                      title="Согласовать факт"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                      onClick={() => handleOpenRejectionDialog(kpi.id, "fact", item.streamId, item.source, item.period)}
                                      title="Отклонить факт"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{kpi.completionPercent.toFixed(1)}%</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedKpiForHistory({
                                      kpi,
                                      streamName,
                                      period,
                                      source: item.source,
                                    });
                                    setKpiHistoryDialogOpen(true);
                                  }}
                                  title="Посмотреть историю операций с КПЭ"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                  </table>
                </div>
              </div>
              
              {/* Пагинация для таблицы ПФК */}
              {(() => {
                // Собираем все KPI для подсчета (та же логика, что и в таблице)
                const allKPIs: Array<{
                  kpi: KPI;
                  streamId: string;
                  streamName: string;
                  period: string;
                  teamOrLeader: string;
                  source: "annual" | "quarterly" | "itLeader";
                }> = [];

                Object.entries(annualKPIs).forEach(([streamId, years]) => {
                  const stream = streams.find(s => s.id === streamId);
                  const streamName = stream?.name || streamId;
                  Object.entries(years).forEach(([year, kpis]) => {
                    kpis.forEach(kpi => {
                      allKPIs.push({
                        kpi,
                        streamId,
                        streamName,
                        period: year,
                        teamOrLeader: stream?.teams?.[0]?.name || "—",
                        source: "annual",
                      });
                    });
                  });
                });

                Object.entries(quarterlyKPIs).forEach(([streamId, quarters]) => {
                  const stream = streams.find(s => s.id === streamId);
                  const streamName = stream?.name || streamId;
                  Object.entries(quarters).forEach(([quarter, kpis]) => {
                    const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
                    const quarterLabel = quarterMatch 
                      ? `${quarterMatch[1]}Q${quarterMatch[2]}`
                      : quarter.replace("q", "").replace("-", "Q");
                    kpis.forEach(kpi => {
                      allKPIs.push({
                        kpi,
                        streamId,
                        streamName,
                        period: quarterLabel,
                        teamOrLeader: stream?.teams?.[0]?.name || "—",
                        source: "quarterly",
                      });
                    });
                  });
                });

                Object.entries(itLeaderKPIs).forEach(([streamId, quarters]) => {
                  const stream = streams.find(s => s.id === streamId);
                  const streamName = stream?.name || streamId;
                  Object.entries(quarters).forEach(([quarter, kpis]) => {
                    const quarterMatch = quarter.match(/q(\d)-(\d{4})/);
                    const quarterLabel = quarterMatch 
                      ? `${quarterMatch[1]}Q${quarterMatch[2]}`
                      : quarter.replace("q", "").replace("-", "Q");
                    kpis.forEach(kpi => {
                      allKPIs.push({
                        kpi,
                        streamId,
                        streamName,
                        period: quarterLabel,
                        teamOrLeader: stream?.itLeader ? `${stream.itLeader.name} (IT лидер)` : "IT лидер",
                        source: "itLeader",
                      });
                    });
                  });
                });

                // Применяем фильтры (та же логика, что и в таблице)
                let filteredKPIs = allKPIs;

                if (pfkTableSearchQuery.trim()) {
                  const query = pfkTableSearchQuery.toLowerCase();
                  filteredKPIs = filteredKPIs.filter((item) => {
                    return (
                      item.kpi.name.toLowerCase().includes(query) ||
                      item.streamName.toLowerCase().includes(query) ||
                      item.teamOrLeader.toLowerCase().includes(query) ||
                      item.period.toLowerCase().includes(query)
                    );
                  });
                }

                if (pfkTableFilters.streams.length > 0) {
                  filteredKPIs = filteredKPIs.filter((item) =>
                    pfkTableFilters.streams.includes(item.streamId)
                  );
                }

                if (pfkTableFilters.periods.length > 0) {
                  filteredKPIs = filteredKPIs.filter((item) => {
                    if (pfkTableFilters.periods.includes("annual") && item.source === "annual") {
                      return true;
                    }
                    if (pfkTableFilters.periods.includes("quarterly") && item.source === "quarterly") {
                      return true;
                    }
                    return false;
                  });
                }

                if (pfkTableFilters.planStatuses.length > 0) {
                  filteredKPIs = filteredKPIs.filter((item) =>
                    item.kpi.planStatus && pfkTableFilters.planStatuses.includes(item.kpi.planStatus)
                  );
                }

                if (pfkTableFilters.factStatuses.length > 0) {
                  filteredKPIs = filteredKPIs.filter((item) =>
                    item.kpi.factStatus && pfkTableFilters.factStatuses.includes(item.kpi.factStatus)
                  );
                }

                if (pfkTableFilters.sources.length > 0) {
                  filteredKPIs = filteredKPIs.filter((item) =>
                    pfkTableFilters.sources.includes(item.source)
                  );
                }

                const totalKPICount = filteredKPIs.length;
                const totalPages = Math.ceil(totalKPICount / pfkTableItemsPerPage);
                
                return totalKPICount > 0 && (
                  <div className="flex items-center justify-between px-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pfk-table-items-per-page" className="text-sm text-muted-foreground">
                        Показать:
                      </Label>
                      <Select
                        value={pfkTableItemsPerPage.toString()}
                        onValueChange={(value) => {
                          setPfkTableItemsPerPage(Number(value));
                          setPfkTableCurrentPage(1);
                        }}
                      >
                        <SelectTrigger id="pfk-table-items-per-page" className="w-[80px]">
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
                        из {totalKPICount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Страница {pfkTableCurrentPage} из {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPfkTableCurrentPage(1)}
                          disabled={pfkTableCurrentPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPfkTableCurrentPage(pfkTableCurrentPage - 1)}
                          disabled={pfkTableCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPfkTableCurrentPage(pfkTableCurrentPage + 1)}
                          disabled={pfkTableCurrentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPfkTableCurrentPage(totalPages)}
                          disabled={pfkTableCurrentPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference" className="space-y-6">
          {/* Выпадающий список для выбора типа справочника */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium whitespace-nowrap">Тип справочника:</Label>
            <Select value={selectedReferenceType} onValueChange={(value) => setSelectedReferenceType(value as "units" | "formulas" | "streams")}>
              <SelectTrigger className="w-[280px] h-11 border-2 border-border bg-background shadow-sm hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
                <SelectValue placeholder="Выберите тип справочника" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="units">Единицы измерения</SelectItem>
                <SelectItem value="formulas">Формулы</SelectItem>
                <SelectItem value="streams">Стримы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Контент в зависимости от выбранного типа */}
          {selectedReferenceType === "units" && (
            <div className="space-y-4">
              {/* Единицы измерения */}
                <div className="flex items-center justify-end -mt-2">
                  <Dialog open={unitDialogOpen} onOpenChange={(open) => {
                    setUnitDialogOpen(open);
                    if (!open) {
                      setEditingUnit(null);
                      setUnitFormData({ name: "", abbreviation: "", description: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          setEditingUnit(null);
                          setUnitFormData({ name: "", abbreviation: "", description: "" });
                          setUnitDialogOpen(true);
                        }}
                        size="lg"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить единицу
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          {editingUnit ? "Редактировать единицу измерения" : "Создать единицу измерения"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingUnit
                            ? "Внесите изменения в единицу измерения"
                            : "Заполните информацию о единице измерения"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="unit-name" className="text-sm font-semibold">
                              Название <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="unit-name"
                              value={unitFormData.name}
                              onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                              placeholder="Например: Штука"
                              className="text-base"
                            />
                            <p className="text-xs text-muted-foreground">
                              Краткое название единицы измерения, которое будет отображаться в справочнике
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="unit-abbr" className="text-sm font-semibold">
                              Сокращение <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="unit-abbr"
                              value={unitFormData.abbreviation}
                              onChange={(e) => setUnitFormData({ ...unitFormData, abbreviation: e.target.value })}
                              placeholder="Например: шт."
                              className="text-base"
                            />
                            <p className="text-xs text-muted-foreground">
                              Сокращенное обозначение единицы измерения
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="unit-desc" className="text-sm font-semibold">
                              Описание
                            </Label>
                            <Textarea
                              id="unit-desc"
                              value={unitFormData.description}
                              onChange={(e) => setUnitFormData({ ...unitFormData, description: e.target.value })}
                              placeholder="Описание единицы измерения, её назначение и область применения"
                              rows={3}
                              className="text-base"
                            />
                            <p className="text-xs text-muted-foreground">
                              Подробное описание единицы измерения, которое поможет понять её суть
                            </p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button onClick={() => {
                          if (unitFormData.name && unitFormData.abbreviation) {
                            if (editingUnit) {
                              setUnits(units.map(u => u.id === editingUnit.id ? { ...editingUnit, ...unitFormData } : u));
                            } else {
                              setUnits([...units, { ...unitFormData, id: Date.now().toString() }]);
                            }
                            setUnitDialogOpen(false);
                            setEditingUnit(null);
                            setUnitFormData({ name: "", abbreviation: "", description: "" });
                          }
                        }}>
                          {editingUnit ? "Сохранить" : "Создать"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по названию или сокращению..."
                      value={unitSearchQuery}
                      onChange={(e) => setUnitSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {unitSearchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setUnitSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Dialog open={unitFilterDialogOpen} onOpenChange={setUnitFilterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Фильтры
                        {unitFilters.abbreviations.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {unitFilters.abbreviations.length}
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
                          <Label className="text-sm font-medium">Сокращение</Label>
                          <div className="space-y-1.5">
                            {Array.from(new Set(units.map(u => u.abbreviation))).sort().map((abbr) => (
                              <div key={abbr} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`unit-filter-abbr-${abbr}`}
                                  checked={unitFilters.abbreviations.includes(abbr)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setUnitFilters({
                                        ...unitFilters,
                                        abbreviations: [...unitFilters.abbreviations, abbr],
                                      });
                                    } else {
                                      setUnitFilters({
                                        ...unitFilters,
                                        abbreviations: unitFilters.abbreviations.filter((a) => a !== abbr),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`unit-filter-abbr-${abbr}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {abbr}
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
                            setUnitFilters({ abbreviations: [] });
                          }}
                        >
                          Сбросить
                        </Button>
                        <Button size="sm" onClick={() => setUnitFilterDialogOpen(false)}>
                          Применить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px] font-bold text-base text-foreground">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-bold hover:bg-transparent"
                            onClick={() => setUnitSortOrder(unitSortOrder === "asc" ? "desc" : "asc")}
                          >
                            <div className="flex items-center gap-2">
                              Название
                              {unitSortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </Button>
                        </TableHead>
                        <TableHead className="w-[150px] font-bold text-base text-foreground">Сокращение</TableHead>
                        <TableHead className="w-[400px] font-bold text-base text-foreground">Описание</TableHead>
                        <TableHead className="w-[150px] text-right font-bold text-base text-foreground">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filtered = units.filter(u => {
                          // Поиск
                          const matchesSearch = !unitSearchQuery || 
                            u.name.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
                            u.abbreviation.toLowerCase().includes(unitSearchQuery.toLowerCase());
                          
                          // Фильтры
                          const matchesFilters = unitFilters.abbreviations.length === 0 ||
                            unitFilters.abbreviations.includes(u.abbreviation);
                          
                          return matchesSearch && matchesFilters;
                        });
                        const sorted = [...filtered].sort((a, b) => {
                          const comparison = a.name.localeCompare(b.name, "ru", { sensitivity: "base", caseFirst: "upper" });
                          return unitSortOrder === "asc" ? comparison : -comparison;
                        });
                        const totalPages = Math.ceil(sorted.length / unitItemsPerPage);
                        const startIndex = (unitCurrentPage - 1) * unitItemsPerPage;
                        const endIndex = startIndex + unitItemsPerPage;
                        const paginated = sorted.slice(startIndex, endIndex);
                        
                        return paginated.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Нет единиц измерения. Создайте первую единицу измерения.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginated.map((unit) => (
                            <TableRow key={unit.id}>
                              <TableCell className="font-medium">{unit.name}</TableCell>
                              <TableCell>{unit.abbreviation}</TableCell>
                              <TableCell>{unit.description}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingUnit(unit);
                                      setUnitFormData({ name: unit.name, abbreviation: unit.abbreviation, description: unit.description });
                                      setUnitDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setItemToDelete({ type: "unit", id: unit.id });
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
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
                
                {/* Пагинация для единиц измерения */}
                {(() => {
                  const filtered = units.filter(u => 
                    !unitSearchQuery || 
                    u.name.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
                    u.abbreviation.toLowerCase().includes(unitSearchQuery.toLowerCase())
                  );
                  const sorted = [...filtered].sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name, "ru", { sensitivity: "base", caseFirst: "upper" });
                    return unitSortOrder === "asc" ? comparison : -comparison;
                  });
                  const totalPages = Math.ceil(sorted.length / unitItemsPerPage);
                  
                  return sorted.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="unit-items-per-page" className="text-sm text-muted-foreground">
                          Показать:
                        </Label>
                        <Select
                          value={unitItemsPerPage.toString()}
                          onValueChange={(value) => {
                            setUnitItemsPerPage(Number(value));
                            setUnitCurrentPage(1);
                          }}
                        >
                          <SelectTrigger id="unit-items-per-page" className="w-[80px]">
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
                          из {sorted.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Страница {unitCurrentPage} из {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setUnitCurrentPage(1)}
                            disabled={unitCurrentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setUnitCurrentPage(unitCurrentPage - 1)}
                            disabled={unitCurrentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setUnitCurrentPage(unitCurrentPage + 1)}
                            disabled={unitCurrentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setUnitCurrentPage(totalPages)}
                            disabled={unitCurrentPage === totalPages}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}

          {selectedReferenceType === "formulas" && (
            <div className="space-y-4">
              {/* Формулы */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по названию или формуле..."
                      value={formulaSearchQuery}
                      onChange={(e) => setFormulaSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {formulaSearchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setFormulaSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Dialog open={formulaFilterDialogOpen} onOpenChange={setFormulaFilterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Фильтры
                        {formulaFilters.categories.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {formulaFilters.categories.length}
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
                          <Label className="text-sm font-medium">Категория формулы</Label>
                          <div className="space-y-1.5">
                            {["Процент", "Оценка", "Расчет"].map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`formula-filter-category-${category}`}
                                  checked={formulaFilters.categories.includes(category)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormulaFilters({
                                        ...formulaFilters,
                                        categories: [...formulaFilters.categories, category],
                                      });
                                    } else {
                                      setFormulaFilters({
                                        ...formulaFilters,
                                        categories: formulaFilters.categories.filter((c) => c !== category),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`formula-filter-category-${category}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {category}
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
                            setFormulaFilters({ categories: [] });
                          }}
                        >
                          Сбросить
                        </Button>
                        <Button size="sm" onClick={() => setFormulaFilterDialogOpen(false)}>
                          Применить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px] font-bold text-base text-foreground">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-bold hover:bg-transparent"
                            onClick={() => setFormulaSortOrder(formulaSortOrder === "asc" ? "desc" : "asc")}
                          >
                            <div className="flex items-center gap-2">
                              Название
                              {formulaSortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </Button>
                        </TableHead>
                        <TableHead className="w-[300px] font-bold text-base text-foreground">Формула</TableHead>
                        <TableHead className="w-[400px] font-bold text-base text-foreground">Описание</TableHead>
                        <TableHead className="w-[150px] text-right font-bold text-base text-foreground">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filtered = formulas.filter(f => {
                          // Поиск
                          const matchesSearch = !formulaSearchQuery || 
                            f.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) ||
                            f.formula.toLowerCase().includes(formulaSearchQuery.toLowerCase());
                          
                          // Фильтры
                          const matchesFilters = formulaFilters.categories.length === 0 ||
                            formulaFilters.categories.some(category => f.name.toLowerCase().includes(category.toLowerCase()));
                          
                          return matchesSearch && matchesFilters;
                        });
                        const sorted = [...filtered].sort((a, b) => {
                          const comparison = a.name.localeCompare(b.name, "ru", { sensitivity: "base", caseFirst: "upper" });
                          return formulaSortOrder === "asc" ? comparison : -comparison;
                        });
                        const totalPages = Math.ceil(sorted.length / formulaItemsPerPage);
                        const startIndex = (formulaCurrentPage - 1) * formulaItemsPerPage;
                        const endIndex = startIndex + formulaItemsPerPage;
                        const paginated = sorted.slice(startIndex, endIndex);
                        
                        return paginated.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Нет формул. Создайте первую формулу.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginated.map((formula) => (
                            <TableRow key={formula.id}>
                              <TableCell className="font-medium">{formula.name}</TableCell>
                              <TableCell className="font-mono text-sm">{formula.formula}</TableCell>
                              <TableCell>{formula.description}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingFormula(formula);
                                      setFormulaFormData({ name: formula.name, formula: formula.formula, description: formula.description });
                                      setFormulaDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setItemToDelete({ type: "formula", id: formula.id });
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
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
                
                {/* Пагинация для формул */}
                {(() => {
                  const filtered = formulas.filter(f => 
                    !formulaSearchQuery || 
                    f.name.toLowerCase().includes(formulaSearchQuery.toLowerCase()) ||
                    f.formula.toLowerCase().includes(formulaSearchQuery.toLowerCase())
                  );
                  const sorted = [...filtered].sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name, "ru", { sensitivity: "base", caseFirst: "upper" });
                    return formulaSortOrder === "asc" ? comparison : -comparison;
                  });
                  const totalPages = Math.ceil(sorted.length / formulaItemsPerPage);
                  
                  return sorted.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="formula-items-per-page" className="text-sm text-muted-foreground">
                          Показать:
                        </Label>
                        <Select
                          value={formulaItemsPerPage.toString()}
                          onValueChange={(value) => {
                            setFormulaItemsPerPage(Number(value));
                            setFormulaCurrentPage(1);
                          }}
                        >
                          <SelectTrigger id="formula-items-per-page" className="w-[80px]">
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
                          из {sorted.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Страница {formulaCurrentPage} из {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setFormulaCurrentPage(1)}
                            disabled={formulaCurrentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setFormulaCurrentPage(formulaCurrentPage - 1)}
                            disabled={formulaCurrentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setFormulaCurrentPage(formulaCurrentPage + 1)}
                            disabled={formulaCurrentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setFormulaCurrentPage(totalPages)}
                            disabled={formulaCurrentPage === totalPages}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}

          {selectedReferenceType === "streams" && (
            <div className="space-y-4">
              {/* Стримы */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по названию или типу..."
                      value={streamSearchQuery}
                      onChange={(e) => setStreamSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {streamSearchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setStreamSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Dialog open={streamFilterDialogOpen} onOpenChange={setStreamFilterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Фильтры
                        {(streamFilters.types.length > 0 || streamFilters.businessTypes.length > 0) && (
                          <Badge variant="secondary" className="ml-2">
                            {streamFilters.types.length + streamFilters.businessTypes.length}
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
                          <Label className="text-sm font-medium">Тип стрима</Label>
                          <div className="space-y-1.5">
                            {(["продуктовый", "канальный", "сегментный", "платформенный", "сервисный"] as const).map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`stream-filter-type-${type}`}
                                  checked={streamFilters.types.includes(type)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setStreamFilters({
                                        ...streamFilters,
                                        types: [...streamFilters.types, type],
                                      });
                                    } else {
                                      setStreamFilters({
                                        ...streamFilters,
                                        types: streamFilters.types.filter((t) => t !== type),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`stream-filter-type-${type}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Тип бизнеса</Label>
                          <div className="space-y-1.5">
                            {["РБ", "МСБ"].map((businessType) => (
                              <div key={businessType} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`stream-filter-business-${businessType}`}
                                  checked={streamFilters.businessTypes.includes(businessType)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setStreamFilters({
                                        ...streamFilters,
                                        businessTypes: [...streamFilters.businessTypes, businessType],
                                      });
                                    } else {
                                      setStreamFilters({
                                        ...streamFilters,
                                        businessTypes: streamFilters.businessTypes.filter((bt) => bt !== businessType),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`stream-filter-business-${businessType}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {businessType}
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
                            setStreamFilters({ types: [], businessTypes: [] });
                          }}
                        >
                          Сбросить
                        </Button>
                        <Button size="sm" onClick={() => setStreamFilterDialogOpen(false)}>
                          Применить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px] font-bold text-base text-foreground">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-bold hover:bg-transparent"
                            onClick={() => setStreamSortOrder(streamSortOrder === "asc" ? "desc" : "asc")}
                          >
                            <div className="flex items-center gap-2">
                              Название
                              {streamSortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </Button>
                        </TableHead>
                        <TableHead className="w-[150px] font-bold text-base text-foreground">Тип бизнеса</TableHead>
                        <TableHead className="w-[150px] font-bold text-base text-foreground">Вид</TableHead>
                        <TableHead className="w-[300px] font-bold text-base text-foreground">Сотрудник ДАТ</TableHead>
                        <TableHead className="w-[150px] text-right font-bold text-base text-foreground">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const filtered = referenceStreams.filter(s => {
                          // Поиск
                          const matchesSearch = !streamSearchQuery || 
                            s.name.toLowerCase().includes(streamSearchQuery.toLowerCase()) ||
                            s.type.toLowerCase().includes(streamSearchQuery.toLowerCase());
                          
                          // Фильтры
                          const matchesTypeFilter = streamFilters.types.length === 0 ||
                            (s.type && streamFilters.types.includes(s.type as "продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный"));
                          const matchesBusinessFilter = streamFilters.businessTypes.length === 0 ||
                            (s.businessType && streamFilters.businessTypes.includes(s.businessType));
                          
                          return matchesSearch && matchesTypeFilter && matchesBusinessFilter;
                        });
                        const sorted = [...filtered].sort((a, b) => {
                          const comparison = a.name.localeCompare(b.name, "ru", { sensitivity: "base", caseFirst: "upper" });
                          return streamSortOrder === "asc" ? comparison : -comparison;
                        });
                        const totalPages = Math.ceil(sorted.length / streamItemsPerPage);
                        const startIndex = (streamCurrentPage - 1) * streamItemsPerPage;
                        const endIndex = startIndex + streamItemsPerPage;
                        const paginated = sorted.slice(startIndex, endIndex);
                        
                        return paginated.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              Нет стримов. Создайте первый стрим.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginated.map((stream) => {
                            const fullStream = streams.find(s => s.id === stream.id);
                            return (
                              <StreamTableRow
                                key={stream.id}
                                stream={stream}
                                fullStream={fullStream}
                                datEmployees={mockDATEmployees}
                                getInitialsFromName={getInitialsFromName}
                                onEdit={() => {
                                  setEditingStream(stream);
                                  setStreamFormData({ name: stream.name, type: stream.type, businessType: stream.businessType || "РБ", datEmployeeIds: stream.datEmployeeIds || [], description: stream.description });
                                  setStreamDialogOpen(true);
                                }}
                              />
                            );
                          })
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Пагинация для стримов */}
                {(() => {
                  const filtered = referenceStreams.filter(s => 
                    !streamSearchQuery || 
                    s.name.toLowerCase().includes(streamSearchQuery.toLowerCase()) ||
                    s.type.toLowerCase().includes(streamSearchQuery.toLowerCase())
                  );
                  const sorted = [...filtered].sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name, "ru", { sensitivity: "base", caseFirst: "upper" });
                    return streamSortOrder === "asc" ? comparison : -comparison;
                  });
                  const totalPages = Math.ceil(sorted.length / streamItemsPerPage);
                  
                  return sorted.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="stream-items-per-page" className="text-sm text-muted-foreground">
                          Показать:
                        </Label>
                        <Select
                          value={streamItemsPerPage.toString()}
                          onValueChange={(value) => {
                            setStreamItemsPerPage(Number(value));
                            setStreamCurrentPage(1);
                          }}
                        >
                          <SelectTrigger id="stream-items-per-page" className="w-[80px]">
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
                          из {sorted.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Страница {streamCurrentPage} из {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setStreamCurrentPage(1)}
                            disabled={streamCurrentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setStreamCurrentPage(streamCurrentPage - 1)}
                            disabled={streamCurrentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setStreamCurrentPage(streamCurrentPage + 1)}
                            disabled={streamCurrentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setStreamCurrentPage(totalPages)}
                            disabled={streamCurrentPage === totalPages}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}

          {/* Диалог подтверждения удаления */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (itemToDelete) {
                      if (itemToDelete.type === "unit") {
                        setUnits(units.filter(u => u.id !== itemToDelete.id));
                      } else if (itemToDelete.type === "formula") {
                        setFormulas(formulas.filter(f => f.id !== itemToDelete.id));
                      } else if (itemToDelete.type === "stream") {
                        setReferenceStreams(referenceStreams.filter(s => s.id !== itemToDelete.id));
                      }
                      setDeleteDialogOpen(false);
                      setItemToDelete(null);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab
            streams={filteredStreams}
            annualKPIs={annualKPIs}
            quarterlyKPIs={quarterlyKPIs}
            itLeaderKPIs={itLeaderKPIs}
          />
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования стрима */}
      <Dialog open={streamDialogOpen} onOpenChange={(open) => {
        setStreamDialogOpen(open);
        if (!open) {
          setEditingStream(null);
          setStreamFormData({ name: "", type: "продуктовый", businessType: "РБ", datEmployeeIds: [], description: "" });
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingStream ? "Редактировать стрим" : "Создать стрим"}
            </DialogTitle>
            <DialogDescription>
              {editingStream
                ? "Внесите изменения в стрим"
                : "Заполните информацию о стриме"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="stream-name" className="text-sm font-semibold">
                  Название
                </Label>
                <Input
                  id="stream-name"
                  value={streamFormData.name}
                  disabled={true}
                  className="text-base bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Краткое название стрима, которое будет отображаться в справочнике
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stream-business-type" className="text-sm font-semibold">
                  Тип бизнеса
                </Label>
                <Select
                  value={streamFormData.businessType}
                  disabled={true}
                >
                  <SelectTrigger id="stream-business-type" className="text-base bg-muted">
                    <SelectValue placeholder="Выберите тип бизнеса" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="РБ">РБ</SelectItem>
                    <SelectItem value="МСБ">МСБ</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Тип бизнеса стрима (РБ - розничный бизнес, МСБ - малый и средний бизнес)
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stream-type" className="text-sm font-semibold">
                  Вид
                </Label>
                <Select
                  value={streamFormData.type}
                  disabled={true}
                >
                  <SelectTrigger id="stream-type" className="text-base bg-muted">
                    <SelectValue placeholder="Выберите вид" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="продуктовый">Продуктовый</SelectItem>
                    <SelectItem value="канальный">Канальный</SelectItem>
                    <SelectItem value="сегментный">Сегментный</SelectItem>
                    <SelectItem value="платформенный">Платформенный</SelectItem>
                    <SelectItem value="сервисный">Сервисный</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Вид стрима определяет его организационную структуру и направление деятельности
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stream-dat-employees" className="text-sm font-semibold">
                  Сотрудники ДАТ
                </Label>
                <MultiSelect
                  options={mockDATEmployees.map((employee) => ({
                    value: employee.id,
                    label: employee.fullName,
                  }))}
                  selected={streamFormData.datEmployeeIds}
                  onChange={(selected) => setStreamFormData({ ...streamFormData, datEmployeeIds: selected })}
                  placeholder="Выберите сотрудников ДАТ..."
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Выберите сотрудников ДАТ, ответственных за стрим (можно выбрать несколько)
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stream-desc" className="text-sm font-semibold">
                  Описание
                </Label>
                <Textarea
                  id="stream-desc"
                  value={streamFormData.description}
                  disabled={true}
                  rows={3}
                  className="text-base bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Подробное описание стрима, которое поможет понять его суть
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStreamDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => {
              if (editingStream) {
                setReferenceStreams(referenceStreams.map(s => 
                  s.id === editingStream.id 
                    ? { ...editingStream, datEmployeeIds: streamFormData.datEmployeeIds } 
                    : s
                ));
                setStreamDialogOpen(false);
                setEditingStream(null);
                setStreamFormData({ name: "", type: "продуктовый", businessType: "РБ", datEmployeeIds: [], description: "" });
              }
            }} disabled={!editingStream}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования/добавления КПЭ */}
      <KPIDialog
        open={isKPIDialogOpen}
        onOpenChange={(open) => {
          setIsKPIDialogOpen(open);
          if (!open) {
            setEditingKPI(null);
            setPlanFile(null);
            setFactFile(null);
            setKpiSource("stream");
          }
        }}
        editingKPI={editingKPI}
        kpiDialogType={kpiDialogType}
        kpiQuarter={kpiQuarter}
        kpiFormData={kpiFormData}
        onKpiFormDataChange={setKpiFormData}
        planFile={planFile}
        factFile={factFile}
        onPlanFileChange={setPlanFile}
        onFactFileChange={setFactFile}
        onSave={handleSaveKPI}
      />

      {/* Диалог отклонения с комментарием */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {pendingRejection?.statusType === "plan" ? "Отклонить план" : "Отклонить факт"}
            </DialogTitle>
            <DialogDescription>
              Пожалуйста, укажите причину отклонения. Комментарий обязателен для заполнения.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-comment">
                Комментарий <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-comment"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Введите причину отклонения..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {rejectionComment.length} / 500 символов
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectionDialogOpen(false);
                setPendingRejection(null);
                setRejectionComment("");
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={() => handleRejectStatusPFKTable(rejectionComment)}
              disabled={!rejectionComment.trim()}
              variant="destructive"
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра комментария отклонения */}
      <Dialog open={viewCommentDialogOpen} onOpenChange={setViewCommentDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Комментарий отклонения {viewingComment?.statusType === "plan" ? "плана" : "факта"}
            </DialogTitle>
            <DialogDescription>
              Причина отклонения, указанная при отклонении.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Комментарий</Label>
              <div className="p-4 bg-muted rounded-md border min-h-[120px]">
                <p className="text-sm whitespace-pre-wrap break-words">
                  {viewingComment?.comment || "Комментарий не найден"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setViewCommentDialogOpen(false);
                setViewingComment(null);
              }}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог истории операций с КПЭ */}
      <Dialog open={kpiHistoryDialogOpen} onOpenChange={setKpiHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              История операций с КПЭ
            </DialogTitle>
            <DialogDescription>
              {selectedKpiForHistory && (
                <>
                  КПЭ: {selectedKpiForHistory.kpi.name}
                  <br />
                  Стрим: {selectedKpiForHistory.streamName} | Период: {selectedKpiForHistory.period}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedKpiForHistory && [
              {
                date: new Date(2025, 0, 20, 15, 30),
                user: "Иванов Иван Иванович",
                action: "Изменение значения",
                details: `План изменен с ${selectedKpiForHistory.kpi.plan - 5} на ${selectedKpiForHistory.kpi.plan}`,
                type: "edit" as const,
              },
              {
                date: new Date(2025, 0, 18, 14, 20),
                user: "Петрова Мария Сергеевна",
                action: "Изменение значения",
                details: `Факт изменен с ${selectedKpiForHistory.kpi.fact - 3} на ${selectedKpiForHistory.kpi.fact}`,
                type: "edit" as const,
              },
              selectedKpiForHistory.kpi.planStatus && selectedKpiForHistory.kpi.planStatus.includes("согласован") && {
                date: new Date(2025, 0, 15, 11, 15),
                user: "Сидоров Петр Александрович",
                action: "Согласование",
                details: `Статус плана изменен на '${selectedKpiForHistory.kpi.planStatus}'`,
                type: "status" as const,
              },
              selectedKpiForHistory.kpi.planStatus && selectedKpiForHistory.kpi.planStatus.includes("отклонен") && selectedKpiForHistory.kpi.planRejectionComment && {
                date: new Date(2025, 0, 12, 10, 45),
                user: "Козлова Анна Викторовна",
                action: "Отклонение",
                details: `План отклонен. Комментарий: ${selectedKpiForHistory.kpi.planRejectionComment}`,
                type: "reject" as const,
              },
              selectedKpiForHistory.kpi.factStatus && selectedKpiForHistory.kpi.factStatus.includes("согласован") && {
                date: new Date(2025, 0, 10, 9, 30),
                user: "Смирнов Алексей Владимирович",
                action: "Согласование",
                details: `Статус факта изменен на '${selectedKpiForHistory.kpi.factStatus}'`,
                type: "status" as const,
              },
              selectedKpiForHistory.kpi.factStatus && selectedKpiForHistory.kpi.factStatus.includes("отклонен") && selectedKpiForHistory.kpi.factRejectionComment && {
                date: new Date(2025, 0, 8, 16, 20),
                user: "Волкова Елена Дмитриевна",
                action: "Отклонение",
                details: `Факт отклонен. Комментарий: ${selectedKpiForHistory.kpi.factRejectionComment}`,
                type: "reject" as const,
              },
              {
                date: new Date(2024, 11, 28, 16, 45),
                user: "Администратор системы",
                action: "Создание КПЭ",
                details: `КПЭ '${selectedKpiForHistory.kpi.name}' создан`,
                type: "create" as const,
              },
            ].filter((item): item is { date: Date; user: string; action: string; details: string; type: "edit" | "status" | "reject" | "create" } => 
              Boolean(item) && typeof item === 'object' && item !== null && 'user' in item && 'date' in item
            ).map((item, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{item.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.date.toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      {item.date.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно с подробной информацией о КПЭ из таблицы ПФК */}
      <Dialog open={pfkTableKPIDialogOpen} onOpenChange={(open) => {
        setPfkTableKPIDialogOpen(open);
        if (!open) {
          setSelectedPfkTableKPIMeta(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Подробная информация о КПЭ</DialogTitle>
            <DialogDescription>
              {selectedPfkTableKPI?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPfkTableKPI && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Номер</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.number}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Вес, %</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.weight}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Тип КПЭ</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Единица измерения</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.unit || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">План</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.plan}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Факт</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.fact}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Значение выполнения, %</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.completionPercent.toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Оценка, %</Label>
                  <p className="text-sm font-medium">{selectedPfkTableKPI.evaluationPercent.toFixed(1)}%</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Статус ПЛАН</Label>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedPfkTableKPI.planStatus ? (
                      <Badge 
                        variant={getStatusBadgeVariant(selectedPfkTableKPI.planStatus) as any} 
                        className={cn("text-xs", getStatusBadgeClassName(selectedPfkTableKPI.planStatus))}
                      >
                        {selectedPfkTableKPI.planStatus}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                    <div className="flex items-center gap-2">
                      {selectedPfkTableKPI.planFile ? (
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedPfkTableKPI.planFile.name}</p>
                            {selectedPfkTableKPI.planFile.size && (
                              <p className="text-xs text-muted-foreground">{formatFileSize(selectedPfkTableKPI.planFile.size)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                if (selectedPfkTableKPI.planFile?.url) {
                                  window.open(selectedPfkTableKPI.planFile.url, '_blank');
                                }
                              }}
                              title="Скачать файл"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={handleRemovePfkTablePlanFile}
                              title="Удалить файл"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            ref={pfkTablePlanFileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.xlsm"
                            onChange={handlePfkTablePlanFileUpload}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden"
                            id="pfk-table-plan-file-upload"
                          />
                          <label htmlFor="pfk-table-plan-file-upload" className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                pfkTablePlanFileInputRef.current?.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Загрузить Excel
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Статус ФАКТ</Label>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedPfkTableKPI.factStatus ? (
                      <Badge 
                        variant={getStatusBadgeVariant(selectedPfkTableKPI.factStatus) as any} 
                        className={cn("text-xs", getStatusBadgeClassName(selectedPfkTableKPI.factStatus))}
                      >
                        {selectedPfkTableKPI.factStatus}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                    <div className="flex items-center gap-2">
                      {selectedPfkTableKPI.factFile ? (
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedPfkTableKPI.factFile.name}</p>
                            {selectedPfkTableKPI.factFile.size && (
                              <p className="text-xs text-muted-foreground">{formatFileSize(selectedPfkTableKPI.factFile.size)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                if (selectedPfkTableKPI.factFile?.url) {
                                  window.open(selectedPfkTableKPI.factFile.url, '_blank');
                                }
                              }}
                              title="Скачать файл"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={handleRemovePfkTableFactFile}
                              title="Удалить файл"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <input
                            ref={pfkTableFactFileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.xlsm"
                            onChange={handlePfkTableFactFileUpload}
                            onClick={(e) => e.stopPropagation()}
                            className="hidden"
                            id="pfk-table-fact-file-upload"
                          />
                          <label htmlFor="pfk-table-fact-file-upload" className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                pfkTableFactFileInputRef.current?.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Загрузить Excel
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

