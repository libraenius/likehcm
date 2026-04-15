"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Link2, QrCode, Building2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";

interface ExternalProcedureInfo {
  kind: "external";
  name: string;
  providerName: string;
  status: string;
  startDate: Date;
  endDate: Date;
  link?: string;
  qrCodeLink?: string;
  description?: string;
  participantStatus?: string;
}

interface InternalProcedureInfo {
  kind: "internal";
  name: string;
  type: "360_FKR" | "ASSESSMENT_CENTER" | "COR";
  typeLabel: string;
  status: string;
  statusLabel: string;
  startDate: Date;
  endDate: Date;
}

type ProcedureInfo = ExternalProcedureInfo | InternalProcedureInfo;

interface ProcedureInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure: ProcedureInfo | null;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const participantStatusLabel = (status?: string) => {
  switch (status) {
    case "not-started": return "Не начато";
    case "invited": return "Приглашен";
    case "in-progress": return "В процессе";
    case "completed": return "Завершено";
    default: return status ?? "";
  }
};

export function ProcedureInfoDialog({ open, onOpenChange, procedure }: ProcedureInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {!procedure ? (
          <DialogHeader><DialogTitle>Загрузка...</DialogTitle></DialogHeader>
        ) : (<>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Информация о процедуре
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">{procedure.name}</h3>
            {procedure.kind === "external" && (
              <p className="text-sm text-muted-foreground mt-0.5">{procedure.providerName}</p>
            )}
            {procedure.kind === "internal" && (
              <p className="text-sm text-muted-foreground mt-0.5">{procedure.typeLabel}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", getStatusBadgeColor(
              procedure.kind === "external" ? procedure.status : procedure.status
            ))}>
              {procedure.kind === "external"
                ? (procedure.status === "planned" ? "Запланировано"
                  : procedure.status === "in-progress" ? "В процессе"
                  : procedure.status === "request" ? "Заявка"
                  : procedure.status)
                : procedure.statusLabel
              }
            </Badge>
            {procedure.kind === "external" && procedure.participantStatus && (
              <Badge variant="secondary" className="text-xs">
                Ваш статус: {participantStatusLabel(procedure.participantStatus)}
              </Badge>
            )}
          </div>

          {procedure.kind === "external" && procedure.description && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">{procedure.description}</p>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Начало</div>
                <div className="font-medium">{formatDate(procedure.startDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Окончание</div>
                <div className="font-medium">{formatDate(procedure.endDate)}</div>
              </div>
            </div>
          </div>

          {procedure.kind === "external" && (procedure.link || procedure.qrCodeLink) && (
            <>
              <Separator />
              <div className="space-y-2">
                {procedure.link && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={procedure.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {procedure.link}
                    </a>
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </div>
                )}
                {procedure.qrCodeLink && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      QR-код для быстрого доступа к процедуре
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {procedure.kind === "internal" && (
            <>
              <Separator />
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">{procedure.typeLabel}</div>
                  <div className="text-xs text-muted-foreground">
                    Внутренняя оценочная процедура компании
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        </>)}
      </DialogContent>
    </Dialog>
  );
}

export type { ProcedureInfo, ExternalProcedureInfo, InternalProcedureInfo };
