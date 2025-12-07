"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, X, Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPI, AttachedFile } from "@/types/goals-kold";

interface KPIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingKPI: KPI | null;
  kpiDialogType: "annual" | "quarterly";
  kpiQuarter?: string;
  kpiFormData: {
    name: string;
    weight: number;
    type: string;
    unit: string;
    plan: number;
    fact: number;
  };
  onKpiFormDataChange: (data: {
    name: string;
    weight: number;
    type: string;
    unit: string;
    plan: number;
    fact: number;
  }) => void;
  planFile?: AttachedFile | null;
  factFile?: AttachedFile | null;
  onPlanFileChange?: (file: AttachedFile | null) => void;
  onFactFileChange?: (file: AttachedFile | null) => void;
  onSave: () => void;
}

export function KPIDialog({
  open,
  onOpenChange,
  editingKPI,
  kpiDialogType,
  kpiQuarter,
  kpiFormData,
  onKpiFormDataChange,
  planFile,
  factFile,
  onPlanFileChange,
  onFactFileChange,
  onSave,
}: KPIDialogProps) {
  const planFileInputRef = useRef<HTMLInputElement>(null);
  const factFileInputRef = useRef<HTMLInputElement>(null);

  const handlePlanFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file || !onPlanFileChange) {
      if (planFileInputRef.current) {
        planFileInputRef.current.value = '';
      }
      return;
    }

    // Проверяем, что файл Excel
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      if (planFileInputRef.current) {
        planFileInputRef.current.value = '';
      }
      // Используем более мягкое уведомление вместо alert
      console.warn('Пожалуйста, загрузите файл Excel (.xlsx, .xls, .xlsm)');
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

    onPlanFileChange(attachedFile);
  };

  const handleFactFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file || !onFactFileChange) {
      if (factFileInputRef.current) {
        factFileInputRef.current.value = '';
      }
      return;
    }

    // Проверяем, что файл Excel
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      if (factFileInputRef.current) {
        factFileInputRef.current.value = '';
      }
      // Используем более мягкое уведомление вместо alert
      console.warn('Пожалуйста, загрузите файл Excel (.xlsx, .xls, .xlsm)');
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

    onFactFileChange(attachedFile);
  };

  const handleRemovePlanFile = () => {
    if (onPlanFileChange) {
      if (planFile?.url) {
        URL.revokeObjectURL(planFile.url);
      }
      onPlanFileChange(null);
    }
    if (planFileInputRef.current) {
      planFileInputRef.current.value = '';
    }
  };

  const handleRemoveFactFile = () => {
    if (onFactFileChange) {
      if (factFile?.url) {
        URL.revokeObjectURL(factFile.url);
      }
      onFactFileChange(null);
    }
    if (factFileInputRef.current) {
      factFileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingKPI ? "Редактировать КПЭ" : "Добавить КПЭ"}
          </DialogTitle>
          <DialogDescription>
            {kpiDialogType === "annual" 
              ? "Заполните информацию о годовом КПЭ"
              : `Заполните информацию о КПЭ за ${kpiQuarter === "q1-2025" ? "1" : kpiQuarter === "q2-2025" ? "2" : kpiQuarter === "q3-2025" ? "3" : "4"} квартал 2025`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="kpi-name">
              Наименование КПЭ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="kpi-name"
              value={kpiFormData.name}
              onChange={(e) => onKpiFormDataChange({ ...kpiFormData, name: e.target.value })}
              placeholder="Введите наименование КПЭ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kpi-weight">
                Вес <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kpi-weight"
                type="number"
                min="0"
                max="100"
                value={kpiFormData.weight}
                onChange={(e) => onKpiFormDataChange({ ...kpiFormData, weight: Number(e.target.value) })}
                placeholder="0-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-type">
                Вид <span className="text-destructive">*</span>
              </Label>
              <Select
                value={kpiFormData.type}
                onValueChange={(value) => onKpiFormDataChange({ ...kpiFormData, type: value })}
              >
                <SelectTrigger id="kpi-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Количественный">Количественный</SelectItem>
                  <SelectItem value="Качественный">Качественный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kpi-unit">
              Единица измерения <span className="text-destructive">*</span>
            </Label>
            <Input
              id="kpi-unit"
              value={kpiFormData.unit}
              onChange={(e) => onKpiFormDataChange({ ...kpiFormData, unit: e.target.value })}
              placeholder="шт., %, дн., час. и т.д."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kpi-plan">
                План <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kpi-plan"
                type="number"
                min="0"
                value={kpiFormData.plan}
                onChange={(e) => onKpiFormDataChange({ ...kpiFormData, plan: Number(e.target.value) })}
                placeholder="Плановое значение"
              />
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Подтверждающий Excel файл
                </Label>
                {planFile ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{planFile.name}</p>
                      {planFile.size && (
                        <p className="text-xs text-muted-foreground">{formatFileSize(planFile.size)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (planFile.url) {
                            window.open(planFile.url, '_blank');
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
                        onClick={handleRemovePlanFile}
                        title="Удалить файл"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      ref={planFileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.xlsm"
                      onChange={handlePlanFileUpload}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                      id="plan-file-upload"
                    />
                    <label htmlFor="plan-file-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          planFileInputRef.current?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить Excel файл
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-fact">
                Факт <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kpi-fact"
                type="number"
                min="0"
                value={kpiFormData.fact}
                onChange={(e) => onKpiFormDataChange({ ...kpiFormData, fact: Number(e.target.value) })}
                placeholder="Фактическое значение"
              />
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Подтверждающий Excel файл
                </Label>
                {factFile ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{factFile.name}</p>
                      {factFile.size && (
                        <p className="text-xs text-muted-foreground">{formatFileSize(factFile.size)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (factFile.url) {
                            window.open(factFile.url, '_blank');
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
                        onClick={handleRemoveFactFile}
                        title="Удалить файл"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      ref={factFileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.xlsm"
                      onChange={handleFactFileUpload}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                      id="fact-file-upload"
                    />
                    <label htmlFor="fact-file-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          factFileInputRef.current?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить Excel файл
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={onSave}
            disabled={!kpiFormData.name.trim() || kpiFormData.weight <= 0 || !kpiFormData.unit.trim()}
          >
            {editingKPI ? "Сохранить" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

