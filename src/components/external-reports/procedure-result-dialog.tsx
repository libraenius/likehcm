"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, Download, Star, BarChart3, CheckCircle2 } from "lucide-react";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";

interface ProcedureResult {
  name: string;
  kind: "external" | "internal";
  providerOrTypeLabel: string;
  endDate: Date;
  score?: number;
  scoreUnit?: "points" | "percent";
  scoreLabel?: string;
  details?: { label: string; value: string }[];
  resultUrl?: string;
  reports?: { id: string; title: string; type: string }[];
}

interface ProcedureResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ProcedureResult | null;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

export function ProcedureResultDialog({ open, onOpenChange, result }: ProcedureResultDialogProps) {
  const scoreText =
    result?.score === undefined
      ? undefined
      : result.scoreUnit === "percent"
        ? `${result.score}%`
        : `${result.score}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {!result ? (
          <DialogHeader><DialogTitle>Загрузка...</DialogTitle></DialogHeader>
        ) : (<>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Результат процедуры
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">{result.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{result.providerOrTypeLabel}</p>
          </div>

          <Badge variant="outline" className={cn("text-xs", getStatusBadgeColor("completed"))}>
            Завершено
          </Badge>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Дата завершения:</span>
            <span className="font-medium">{formatDate(result.endDate)}</span>
          </div>

          {(result.score !== undefined || (result.details && result.details.length > 0) || result.scoreLabel) && (
            <>
              <Separator />
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    {result.kind === "internal" ? (
                      <BarChart3 className="h-6 w-6 text-primary" />
                    ) : (
                      <Star className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {scoreText && (
                      <>
                        <div className="text-xs text-muted-foreground">Оценка</div>
                        <div className="text-2xl font-bold text-primary">{scoreText}</div>
                      </>
                    )}
                    {result.scoreLabel && (
                      <div className="text-sm text-muted-foreground leading-snug">{result.scoreLabel}</div>
                    )}
                  </div>
                </div>
                {result.details && result.details.length > 0 && (
                  <div className="grid grid-cols-1 gap-1">
                    {result.details.map((d) => (
                      <div key={d.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="font-medium text-foreground truncate">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {result.reports && result.reports.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Доступные отчеты</h4>
              <div className="space-y-1">
                {result.reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{r.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Отчет</h4>
              {result.resultUrl ? (
                <div className="flex items-center justify-between py-3 px-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-sm font-medium">Отчет по результатам</div>
                      <div className="text-xs text-muted-foreground">PDF документ</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Открыть
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 border rounded-lg bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Файл отчета пока недоступен</p>
                </div>
              )}
            </div>
          )}
        </div>
        </>)}
      </DialogContent>
    </Dialog>
  );
}

export type { ProcedureResult };
