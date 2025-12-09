"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, ChevronDown, ChevronRight, Plus, Edit, Trash2, GripVertical, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateKPIMetrics } from "@/lib/goals-kold/utils";
import type { KPI, Stream } from "@/types/goals-kold";

// Функция для определения цвета статуса
const getStatusBadgeVariant = (status: string | undefined) => {
  // Всегда используем outline, чтобы не было автоматической заливки
  return "outline";
};

const getStatusBadgeClassName = (status: string | undefined) => {
  if (!status) return "";
  if (status.includes("согласован")) {
    return "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
  }
  if (status.includes("выставление")) {
    return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400";
  }
  return "";
};

interface QuarterlyKPICardsProps {
  stream: Stream;
  quarterlyKPIs: Record<string, Record<string, KPI[]>>;
  isQuarterlyExpanded: boolean;
  isEditModeQuarterly: Record<string, boolean>;
  selectedQuarterlyYear: string;
  draggedKPIId: string | null;
  draggedKPIQuarter: string | null;
  onQuarterlyExpandedChange: (expanded: boolean) => void;
  onEditModeQuarterlyChange: (modes: Record<string, boolean>) => void;
  onSelectedQuarterlyYearChange: (year: string) => void;
  onDraggedKPIIdChange: (id: string | null) => void;
  onDraggedKPIQuarterChange: (quarter: string | null) => void;
  onAddKPI: (type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => void;
  onDeleteKPI: (kpiId: string, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => void;
  onMoveKPI: (dragIndex: number, dropIndex: number, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => void;
  onUpdateKPIInTable: (kpiId: string, field: keyof KPI | string, value: string | number, type: "annual" | "quarterly", quarter?: string) => void;
  onQuarterlyKPIsChange: (kpis: Record<string, Record<string, KPI[]>>) => void;
}

export function QuarterlyKPICards({
  stream,
  quarterlyKPIs,
  isQuarterlyExpanded,
  isEditModeQuarterly,
  selectedQuarterlyYear,
  draggedKPIId,
  draggedKPIQuarter,
  onQuarterlyExpandedChange,
  onEditModeQuarterlyChange,
  onSelectedQuarterlyYearChange,
  onDraggedKPIIdChange,
  onDraggedKPIQuarterChange,
  onAddKPI,
  onDeleteKPI,
  onMoveKPI,
  onUpdateKPIInTable,
  onQuarterlyKPIsChange,
}: QuarterlyKPICardsProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(`q1-${selectedQuarterlyYear}`);

  // Обновляем выбранный квартал при изменении года
  useEffect(() => {
    setSelectedQuarter(`q1-${selectedQuarterlyYear}`);
  }, [selectedQuarterlyYear]);

  const handleKPIClick = (kpi: KPI, quarter: string) => {
    const isEditMode = isEditModeQuarterly[quarter] || false;
    if (!isEditMode) {
      setSelectedKPI(kpi);
      setIsKPIDialogOpen(true);
    }
  };

  const renderQuarterTab = (quarterNum: number) => {
    const quarter = `q${quarterNum}-${selectedQuarterlyYear}`;
    const currentKPIs = quarterlyKPIs[stream.id]?.[quarter] || [];
    const isEditMode = isEditModeQuarterly[quarter] || false;
    const integralKPI = currentKPIs.reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0);

    const handleUpdateKPI = (kpiId: string, field: string, value: string | number) => {
      onUpdateKPIInTable(kpiId, field, value, "quarterly", quarter);
      
      // Обновляем метрики после изменения плана/факта
      if (field === "plan" || field === "fact") {
        const kpi = currentKPIs.find(k => k.id === kpiId);
        if (kpi) {
          const updatedKpi = { ...kpi, [field]: value };
          const metrics = calculateKPIMetrics(updatedKpi.plan, updatedKpi.fact, updatedKpi.weight);
          const finalKpi = { ...updatedKpi, ...metrics };
          
          const updatedKpis = currentKPIs.map(k => k.id === kpiId ? finalKpi : k);
          onQuarterlyKPIsChange({
            ...quarterlyKPIs,
            [stream.id]: {
              ...quarterlyKPIs[stream.id],
              [quarter]: updatedKpis,
            },
          });
        }
      }
    };

    return (
      <>
        {isEditMode && (
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              onClick={() => onAddKPI("quarterly", quarter)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Добавить КПЭ
            </Button>
          </div>
        )}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">№</TableHead>
                <TableHead>Наименование КПЭ</TableHead>
                <TableHead className="w-[80px]">Вес</TableHead>
                <TableHead className="w-[120px]">Тип КПЭ</TableHead>
                <TableHead className="w-[80px]">План</TableHead>
                <TableHead className="w-[100px]">Статус ПЛАН</TableHead>
                <TableHead className="w-[80px]">Факт</TableHead>
                <TableHead className="w-[100px]">Статус ФАКТ</TableHead>
                <TableHead className="w-[140px]">Значение выполнения, %</TableHead>
                <TableHead className="w-[100px]">Оценка, %</TableHead>
                {isEditMode && <TableHead className="w-[100px]">Действия</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentKPIs.length > 0 ? (
                currentKPIs.map((kpi: KPI, index: number) => (
                  <TableRow
                    key={kpi.id}
                    draggable={isEditMode}
                    onDragStart={(e) => {
                      if (!isEditMode) return;
                      onDraggedKPIIdChange(kpi.id);
                      onDraggedKPIQuarterChange(quarter);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      if (!isEditMode || draggedKPIId !== kpi.id || draggedKPIQuarter !== quarter) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }
                    }}
                    onDrop={(e) => {
                      if (!isEditMode || !draggedKPIId || draggedKPIQuarter !== quarter) return;
                      e.preventDefault();
                      const dragIndex = currentKPIs.findIndex(k => k.id === draggedKPIId);
                      if (dragIndex !== -1 && dragIndex !== index) {
                        onMoveKPI(dragIndex, index, "quarterly", quarter);
                      }
                      onDraggedKPIIdChange(null);
                      onDraggedKPIQuarterChange(null);
                    }}
                    onDragEnd={() => {
                      onDraggedKPIIdChange(null);
                      onDraggedKPIQuarterChange(null);
                    }}
                    className={cn(
                      isEditMode && "cursor-move",
                      draggedKPIId === kpi.id && draggedKPIQuarter === quarter && "opacity-50"
                    )}
                  >
                    <TableCell className="text-center">
                      {isEditMode ? (
                        <div className="flex items-center justify-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          {kpi.number}
                        </div>
                      ) : (
                        kpi.number
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditMode ? (
                        <Input
                          value={kpi.name}
                          onChange={(e) => handleUpdateKPI(kpi.id, "name", e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-primary hover:underline"
                          onClick={() => handleKPIClick(kpi, quarter)}
                        >
                          {kpi.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={kpi.weight}
                          onChange={(e) => handleUpdateKPI(kpi.id, "weight", Number(e.target.value))}
                          className="h-8 w-16 text-center"
                        />
                      ) : (
                        kpi.weight
                      )}
                    </TableCell>
                    <TableCell>{kpi.type}</TableCell>
                    <TableCell className="text-center">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={kpi.plan}
                          onChange={(e) => handleUpdateKPI(kpi.id, "plan", Number(e.target.value))}
                          className="h-8 w-16 text-center"
                        />
                      ) : (
                        kpi.plan
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {kpi.planStatus ? (
                        <Badge 
                          variant={getStatusBadgeVariant(kpi.planStatus) as any} 
                          className={cn("text-xs", getStatusBadgeClassName(kpi.planStatus))}
                        >
                          {kpi.planStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={kpi.fact}
                          onChange={(e) => handleUpdateKPI(kpi.id, "fact", Number(e.target.value))}
                          className="h-8 w-16 text-center"
                        />
                      ) : (
                        kpi.fact
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {kpi.factStatus ? (
                        <Badge 
                          variant={getStatusBadgeVariant(kpi.factStatus) as any} 
                          className={cn("text-xs", getStatusBadgeClassName(kpi.factStatus))}
                        >
                          {kpi.factStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{kpi.completionPercent.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{kpi.evaluationPercent.toFixed(1)}</TableCell>
                    {isEditMode && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDeleteKPI(kpi.id, "quarterly", quarter)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isEditMode ? 12 : 11} className="text-center text-muted-foreground py-8">
                    Нет данных за {quarterNum} квартал {selectedQuarterlyYear}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {currentKPIs.length > 0 && (
          <div className="flex justify-end pt-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <Label className="text-sm font-semibold">Интегральный показатель выполнения КПЭ:</Label>
              <span className="text-lg font-bold text-primary">
                {integralKPI.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onQuarterlyExpandedChange(!isQuarterlyExpanded)}
          >
            {isQuarterlyExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" onClick={() => onQuarterlyExpandedChange(!isQuarterlyExpanded)}>
            <Target className="h-4 w-4" />
            Квартальные карты результативности стрима
          </Label>
        </div>
        {isQuarterlyExpanded && (
          <>
            <div className="flex items-center gap-3 mb-3 w-full flex-nowrap">
              <Select value={selectedQuarterlyYear} onValueChange={onSelectedQuarterlyYearChange}>
                <SelectTrigger className="w-[100px] h-8 flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="w-[100px]" 
                  sideOffset={4} 
                  align="start"
                  position="popper"
                  collisionPadding={8}
                >
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="w-[150px] h-8 flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="w-[150px]" 
                  sideOffset={4} 
                  align="start"
                  position="popper"
                  collisionPadding={8}
                >
                  <SelectItem value={`q1-${selectedQuarterlyYear}`}>1 квартал {selectedQuarterlyYear}</SelectItem>
                  <SelectItem value={`q2-${selectedQuarterlyYear}`}>2 квартал {selectedQuarterlyYear}</SelectItem>
                  <SelectItem value={`q3-${selectedQuarterlyYear}`}>3 квартал {selectedQuarterlyYear}</SelectItem>
                  <SelectItem value={`q4-${selectedQuarterlyYear}`}>4 квартал {selectedQuarterlyYear}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                История карты результативности
              </Button>
              <Button
                variant={Object.values(isEditModeQuarterly).some(v => v) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const currentState = Object.values(isEditModeQuarterly).some(v => v);
                  const newModes: Record<string, boolean> = {};
                  ["q1", "q2", "q3", "q4"].forEach(q => {
                    newModes[`${q}-${selectedQuarterlyYear}`] = !currentState;
                  });
                  onEditModeQuarterlyChange(newModes);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Режим редактирования
              </Button>
            </div>
            <div className="mt-4">
              {(() => {
                const quarterNum = parseInt(selectedQuarter.split('-')[0].replace('q', ''));
                return renderQuarterTab(quarterNum);
              })()}
            </div>
          </>
        )}
      </div>

      {/* Модальное окно с подробной информацией о КПЭ */}
      <Dialog open={isKPIDialogOpen} onOpenChange={setIsKPIDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Подробная информация о КПЭ</DialogTitle>
            <DialogDescription>
              {selectedKPI?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedKPI && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Номер</Label>
                  <p className="text-sm font-medium">{selectedKPI.number}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Вес, %</Label>
                  <p className="text-sm font-medium">{selectedKPI.weight}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Тип КПЭ</Label>
                  <p className="text-sm font-medium">{selectedKPI.type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">План</Label>
                  <p className="text-sm font-medium">{selectedKPI.plan}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Факт</Label>
                  <p className="text-sm font-medium">{selectedKPI.fact}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Значение выполнения, %</Label>
                  <p className="text-sm font-medium">{selectedKPI.completionPercent.toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Оценка, %</Label>
                  <p className="text-sm font-medium">{selectedKPI.evaluationPercent.toFixed(1)}%</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Статус ПЛАН</Label>
                {selectedKPI.planStatus ? (
                  <Badge 
                    variant={getStatusBadgeVariant(selectedKPI.planStatus) as any} 
                    className={cn("text-xs", getStatusBadgeClassName(selectedKPI.planStatus))}
                  >
                    {selectedKPI.planStatus}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Статус ФАКТ</Label>
                {selectedKPI.factStatus ? (
                  <Badge 
                    variant={getStatusBadgeVariant(selectedKPI.factStatus) as any} 
                    className={cn("text-xs", getStatusBadgeClassName(selectedKPI.factStatus))}
                  >
                    {selectedKPI.factStatus}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно с историей карты результативности */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              История карты результативности
            </DialogTitle>
            <DialogDescription>
              Квартальные карты результативности стрима - {selectedQuarterlyYear} год
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                date: new Date(2025, 2, 15, 14, 30),
                user: "Иванов Иван Иванович",
                action: "Изменение КПЭ",
                details: "Q1: КПЭ 'Количество выпущенных релизов': План изменен с 2 на 3",
                type: "edit" as const,
              },
              {
                date: new Date(2025, 2, 10, 11, 20),
                user: "Петрова Мария Сергеевна",
                action: "Добавление КПЭ",
                details: "Q1: Добавлен новый КПЭ 'Качество кода'",
                type: "add" as const,
              },
              {
                date: new Date(2025, 2, 5, 9, 15),
                user: "Сидоров Петр Александрович",
                action: "Изменение статуса",
                details: "Q1: КПЭ 'Время разработки фичи': Статус ФАКТ изменен на 'Факт согласован'",
                type: "status" as const,
              },
              {
                date: new Date(2024, 11, 28, 16, 45),
                user: "Козлова Анна Викторовна",
                action: "Создание карты",
                details: "Создана карта результативности на 2025 год",
                type: "create" as const,
              },
            ].map((item, index) => (
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
    </>
  );
}
