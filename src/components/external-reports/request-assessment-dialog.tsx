"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Send } from "lucide-react";

type RequestAssessmentType = "external" | "360_FKR" | "ASSESSMENT_CENTER" | "COR";

interface ProviderOption {
  id: string;
  name: string;
}

interface EmployeeOption {
  id: string;
  fullName: string;
  position: string;
}

interface RequestAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: ProviderOption[];
  employees: EmployeeOption[];
  onSubmit: (data: {
    type: RequestAssessmentType;
    providerId?: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    participantIds: string[];
    comment: string;
  }) => void;
}

const ASSESSMENT_TYPE_OPTIONS: { value: RequestAssessmentType; label: string }[] = [
  { value: "external", label: "Внешний провайдер" },
  { value: "360_FKR", label: "Оценка 360 (ФКР)" },
  { value: "ASSESSMENT_CENTER", label: "Ассессмент-центр" },
  { value: "COR", label: "Оценка результативности (ЦОР)" },
];

export function RequestAssessmentDialog({
  open,
  onOpenChange,
  providers,
  employees,
  onSubmit,
}: RequestAssessmentDialogProps) {
  const [assessmentType, setAssessmentType] = useState<RequestAssessmentType>("external");
  const [providerId, setProviderId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const resetForm = () => {
    setAssessmentType("external");
    setProviderId("");
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setParticipantIds([]);
    setComment("");
  };

  const isValid =
    name.trim() !== "" &&
    startDate !== "" &&
    endDate !== "" &&
    participantIds.length > 0 &&
    (assessmentType !== "external" || providerId !== "");

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      type: assessmentType,
      providerId: assessmentType === "external" ? providerId : undefined,
      name,
      description,
      startDate,
      endDate,
      participantIds,
      comment,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Подать заявку на оценку
          </DialogTitle>
          <DialogDescription>
            Заявка будет направлена администратору для рассмотрения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Тип оценки <span className="text-destructive">*</span></Label>
            <Select value={assessmentType} onValueChange={(v) => setAssessmentType(v as RequestAssessmentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSESSMENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {assessmentType === "external" && (
            <div className="space-y-2">
              <Label>Провайдер <span className="text-destructive">*</span></Label>
              <Select value={providerId} onValueChange={setProviderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите провайдера" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Название <span className="text-destructive">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название процедуры оценки"
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание и цели оценки"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Дата начала <span className="text-destructive">*</span></Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания <span className="text-destructive">*</span></Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Участники <span className="text-destructive">*</span></Label>
            <MultiSelect
              options={employees.map((e) => ({
                value: e.id,
                label: `${e.fullName} (${e.position})`,
              }))}
              selected={participantIds}
              onChange={setParticipantIds}
              placeholder="Выберите сотрудников..."
              maxCount={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Комментарий к заявке</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительная информация для администратора"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="gap-1.5">
            <Send className="h-4 w-4" />
            Отправить заявку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
