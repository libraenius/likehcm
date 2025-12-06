"use client";

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
import type { KPI } from "@/types/goals-kold";

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
  onSave,
}: KPIDialogProps) {
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
