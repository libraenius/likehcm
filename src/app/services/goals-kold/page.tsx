"use client";

import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Users, FileText, Table as TableIcon, Search, X, ChevronDown, ChevronRight, Building2, UserCircle, Plus, Pencil, Trash2, BarChart3, Edit, Filter, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Leader, Stream, Team, KPI } from "./types";
import { getInitials, formatDate, calculateKPIMetrics } from "./utils";
import { mockStreamKPIs, mockQuarterlyKPIsData, mockITLeaderKPIsData, generateMockStreams, mockStreams } from "./mock-data";
import { StreamsList } from "./components/StreamsList";
import { TeamDetails } from "./components/TeamDetails";
import { FilterDialog } from "./components/FilterDialog";
import { KPIDialog } from "./components/KPIDialog";
import { AnnualKPICards } from "./components/AnnualKPICards";
import { QuarterlyKPICards } from "./components/QuarterlyKPICards";
import { ITLeaderKPICards } from "./components/ITLeaderKPICards";


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
  const [kpiFormData, setKpiFormData] = useState({
    name: "",
    weight: 0,
    type: "Количественный",
    unit: "",
    plan: 0,
    fact: 0,
  });

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
    setKpiFormData({
      name: "",
      weight: 0,
      type: "Количественный",
      unit: "",
      plan: 0,
      fact: 0,
    });
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
  const handleEditKPI = (kpi: KPI, type: "annual" | "quarterly", quarter?: string) => {
    setEditingKPI(kpi);
    setKpiDialogType(type);
    if (quarter) setKpiQuarter(quarter);
    setKpiFormData({
      name: kpi.name,
      weight: kpi.weight,
      type: kpi.type,
      unit: kpi.unit,
      plan: kpi.plan,
      fact: kpi.fact,
    });
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
        : (quarterlyKPIs[selectedStream.id]?.[kpiQuarter]?.length || 0) + 1),
      name: kpiFormData.name.trim(),
      weight: kpiFormData.weight,
      type: kpiFormData.type,
      unit: kpiFormData.unit.trim(),
      plan: kpiFormData.plan,
      fact: kpiFormData.fact,
      completionPercent,
      evaluationPercent,
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
      if (editingKPI) {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [selectedStream.id]: {
            ...quarterlyKPIs[selectedStream.id],
            [kpiQuarter]: quarterlyKPIs[selectedStream.id][kpiQuarter].map(kpi =>
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

    setIsKPIDialogOpen(false);
    setEditingKPI(null);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Целеполагание Стримы</h1>
          <p className="text-muted-foreground">
            Управление целеполаганием стримовой деятельности
          </p>
        </div>
      </div>

      <Tabs defaultValue="streams-teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="streams-teams" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">КР стримов и команд</h2>
              <p className="text-muted-foreground">
                Управление ключевыми результатами стримов и команд
              </p>
            </div>
          </div>

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
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-360px)]">
                {selectedTeam ? (
                  <TeamDetails team={selectedTeam} />
                ) : selectedStream ? (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-1 break-words">{selectedStream.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 overflow-x-hidden">
                      <div className="space-y-4 max-w-full">
                        {/* Информация о стриме */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Информация о стриме
                          </Label>
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Левая колонка */}
                              <div className="space-y-3">
                                {selectedStream.businessType && (
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Вид бизнеса</Label>
                                    <div>
                                      <Badge variant="default" className="text-sm">
                                        {selectedStream.businessType}
                                      </Badge>
                                    </div>
                                  </div>
                                )}
                                {selectedStream.type && (
                                  <div className="space-y-1">
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
                              <div className="space-y-3">
                            {selectedStream.leader && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Лидер стрима</Label>
                                    <div className="flex items-start gap-2">
                                      <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                      {getInitials(selectedStream.leader)}
                                    </AvatarFallback>
                                  </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{selectedStream.leader.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedStream.leader.position}</p>
                                      </div>
                                </div>
                              </div>
                            )}
                            {selectedStream.itLeader && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">ИТ лидер стрима</Label>
                                    <div className="flex items-start gap-2">
                                      <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                      {getInitials(selectedStream.itLeader)}
                                    </AvatarFallback>
                                  </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{selectedStream.itLeader.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedStream.itLeader.position}</p>
                                      </div>
                                </div>
                              </div>
                            )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Команды стрима */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Команды стрима
                          </Label>
                          <div className="flex flex-wrap gap-2">
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
                      </div>
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

        <TabsContent value="pfk-table" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Таблица ПФК
              </CardTitle>
              <CardDescription>
                Таблица плановых фактических критических значений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Раздел находится в разработке. Здесь будет отображаться реестр ключевых показателей эффективности.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования/добавления КПЭ */}
      <KPIDialog
        open={isKPIDialogOpen}
        onOpenChange={setIsKPIDialogOpen}
        editingKPI={editingKPI}
        kpiDialogType={kpiDialogType}
        kpiQuarter={kpiQuarter}
        kpiFormData={kpiFormData}
        onKpiFormDataChange={setKpiFormData}
        onSave={handleSaveKPI}
      />
    </div>
  );
}

