"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

// Функция для определения варианта badge статуса
const getStatusBadgeVariant = (status: string | undefined): "outline" => {
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

interface AnnualKPICardsProps {
  stream: Stream;
  annualKPIs: Record<string, Record<string, KPI[]>>;
  isAnnualExpanded: boolean;
  isEditModeAnnual: boolean;
  selectedAnnualYear: string;
  draggedKPIId: string | null;
  onAnnualExpandedChange: (expanded: boolean) => void;
  onEditModeAnnualChange: (enabled: boolean) => void;
  onSelectedAnnualYearChange: (year: string) => void;
  onDraggedKPIIdChange: (id: string | null) => void;
  onDraggedKPIQuarterChange: (quarter: string | null) => void;
  onAddKPI: (type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => void;
  onDeleteKPI: (kpiId: string, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => void;
  onMoveKPI: (dragIndex: number, dropIndex: number, type: "annual" | "quarterly", quarter?: string, source?: "stream" | "itLeader") => void;
  onUpdateKPIInTable: (kpiId: string, field: keyof KPI | string, value: string | number, type: "annual" | "quarterly", quarter?: string) => void;
  onAnnualKPIsChange: (kpis: Record<string, Record<string, KPI[]>>) => void;
}

export function AnnualKPICards({
  stream,
  annualKPIs,
  isAnnualExpanded,
  isEditModeAnnual,
  selectedAnnualYear,
  draggedKPIId,
  onAnnualExpandedChange,
  onEditModeAnnualChange,
  onSelectedAnnualYearChange,
  onDraggedKPIIdChange,
  onDraggedKPIQuarterChange,
  onAddKPI,
  onDeleteKPI,
  onMoveKPI,
  onUpdateKPIInTable,
  onAnnualKPIsChange,
}: AnnualKPICardsProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const handleMoveKPI = (dragIndex: number, dropIndex: number) => {
    onMoveKPI(dragIndex, dropIndex, "annual");
  };

  const handleKPIClick = (kpi: KPI) => {
    if (!isEditModeAnnual) {
      setSelectedKPI(kpi);
      setIsKPIDialogOpen(true);
    }
  };

  const handleUpdateKPI = (kpiId: string, field: string, value: string | number) => {
    onUpdateKPIInTable(kpiId, field, value, "annual");
    
    if (field === "plan" || field === "fact") {
      const kpis = annualKPIs[stream.id]?.[selectedAnnualYear] || [];
      const kpi = kpis.find(k => k.id === kpiId);
      if (kpi) {
        const updatedKpi = { ...kpi, [field]: value };
        const metrics = calculateKPIMetrics(updatedKpi.plan, updatedKpi.fact, updatedKpi.weight);
        const finalKpi = { ...updatedKpi, ...metrics };
        
        const updatedKpis = kpis.map(k => k.id === kpiId ? finalKpi : k);
        onAnnualKPIsChange({
          ...annualKPIs,
          [stream.id]: {
            ...annualKPIs[stream.id],
            [selectedAnnualYear]: updatedKpis,
          },
        });
      }
    }
  };

  const currentKPIs = annualKPIs[stream.id]?.[selectedAnnualYear] || [];
  const integralKPI = currentKPIs.reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0);

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAnnualExpandedChange(!isAnnualExpanded)}
            >
              {isAnnualExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <Label className="text-sm font-semibold flex items-center gap-2 cursor-pointer" onClick={() => onAnnualExpandedChange(!isAnnualExpanded)}>
              <Target className="h-4 w-4" />
              Годовые карты результативности стрима
            </Label>
          </div>
        </div>
        {isAnnualExpanded && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="w-[100px] flex-shrink-0">
                <Select value={selectedAnnualYear} onValueChange={onSelectedAnnualYearChange}>
                  <SelectTrigger className="w-[100px] h-8">
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
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHistoryDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  История карты результативности
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-mode-annual-toggle" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Режим редактирования
                  </Label>
                  <Switch
                    id="edit-mode-annual-toggle"
                    checked={isEditModeAnnual}
                    onCheckedChange={onEditModeAnnualChange}
                  />
                </div>
                {isEditModeAnnual && (
                  <Button
                    size="sm"
                    onClick={() => onAddKPI("annual")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить КПЭ
                  </Button>
                )}
              </div>
            </div>
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
                    {isEditModeAnnual && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentKPIs.length > 0 ? (
                    currentKPIs.map((kpi: KPI, index: number) => (
                      <TableRow
                        key={kpi.id}
                        draggable={isEditModeAnnual}
                        onDragStart={(e) => {
                          if (!isEditModeAnnual) return;
                          onDraggedKPIIdChange(kpi.id);
                          onDraggedKPIQuarterChange(null);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          if (!isEditModeAnnual || draggedKPIId !== kpi.id) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDrop={(e) => {
                          if (!isEditModeAnnual || !draggedKPIId) return;
                          e.preventDefault();
                          const dragIndex = currentKPIs.findIndex(k => k.id === draggedKPIId);
                          if (dragIndex !== -1 && dragIndex !== index) {
                            handleMoveKPI(dragIndex, index);
                          }
                          onDraggedKPIIdChange(null);
                        }}
                        onDragEnd={() => {
                          onDraggedKPIIdChange(null);
                          onDraggedKPIQuarterChange(null);
                        }}
                        className={cn(
                          isEditModeAnnual && "cursor-move",
                          draggedKPIId === kpi.id && "opacity-50"
                        )}
                      >
                        <TableCell className="text-center">
                          {isEditModeAnnual ? (
                            <div className="flex items-center justify-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              {kpi.number}
                            </div>
                          ) : (
                            kpi.number
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditModeAnnual ? (
                            <Input
                              value={kpi.name}
                              onChange={(e) => handleUpdateKPI(kpi.id, "name", e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            <span 
                              className="cursor-pointer hover:text-primary hover:underline"
                              onClick={() => handleKPIClick(kpi)}
                            >
                              {kpi.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditModeAnnual ? (
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
                          {isEditModeAnnual ? (
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
                              variant={getStatusBadgeVariant(kpi.planStatus)} 
                              className={cn("text-xs", getStatusBadgeClassName(kpi.planStatus))}
                            >
                              {kpi.planStatus}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditModeAnnual ? (
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
                        {isEditModeAnnual && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onDeleteKPI(kpi.id, "annual")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isEditModeAnnual ? 12 : 11} className="text-center text-muted-foreground py-8">
                        Нет данных о годовых целях
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
        )}
      </div>

      {/* Модальное окно с подробной информацией о КПЭ */}
      <Dialog open={isKPIDialogOpen} onOpenChange={setIsKPIDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    variant={getStatusBadgeVariant(selectedKPI.planStatus)} 
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
              Годовые карты результативности стрима - {selectedAnnualYear} год
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                date: new Date(2025, 0, 15, 14, 30),
                user: "Иванов Иван Иванович",
                action: "Изменение КПЭ",
                details: "КПЭ 'Количество выпущенных релизов': План изменен с 10 на 12",
                type: "edit" as const,
              },
              {
                date: new Date(2025, 0, 10, 11, 20),
                user: "Петрова Мария Сергеевна",
                action: "Добавление КПЭ",
                details: "Добавлен новый КПЭ 'Удовлетворенность команды'",
                type: "add" as const,
              },
              {
                date: new Date(2025, 0, 5, 9, 15),
                user: "Сидоров Петр Александрович",
                action: "Изменение статуса",
                details: "КПЭ 'Качество кода': Статус ПЛАН изменен на 'План согласован'",
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

