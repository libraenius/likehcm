"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orgUnits, users as reportUsers } from "@/lib/external-reports/mock-data";
import {
  REPORT_TYPES,
  reportTypeLabels,
  roleLabels,
} from "@/lib/external-reports/types";
import type { Report, ReportType } from "@/lib/external-reports/types";
import { Archive, Building2, FileText, FileUp, ShieldCheck, Upload, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProcedureOption {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  participants?: { id: string; fullName: string; position: string; email: string }[];
}

interface ReportUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (reports: Report[]) => void;
  procedures: ProcedureOption[];
}

interface BatchRow {
  employeeId: string;
  fullName: string;
  fileName: string;
}

const mockCsvBatchRows: BatchRow[] = [
  { employeeId: "p1-1", fullName: "Иванов Иван Иванович", fileName: "report_p1-1.pdf" },
  { employeeId: "p1-2", fullName: "Петрова Мария Сергеевна", fileName: "report_p1-2.pdf" },
  { employeeId: "p1-3", fullName: "Сидоров Алексей Дмитриевич", fileName: "report_p1-3.pdf" },
  { employeeId: "p1-4", fullName: "Козлова Елена Викторовна", fileName: "report_p1-4.pdf" },
  { employeeId: "p1-5", fullName: "Морозов Дмитрий Александрович", fileName: "report_p1-5.pdf" },
];

const mockZipBatchRows: BatchRow[] = [
  { employeeId: "emp-1", fullName: "Петров Иван Сергеевич", fileName: "emp-1.pdf" },
  { employeeId: "emp-2", fullName: "Сидорова Мария Александровна", fileName: "emp-2.pdf" },
  { employeeId: "emp-3", fullName: "Иванов Алексей Дмитриевич", fileName: "emp-3.pdf" },
  { employeeId: "emp-5", fullName: "Помыткин Сергей Олегович", fileName: "emp-5.pdf" },
  { employeeId: "emp-7", fullName: "Морозов Дмитрий Александрович", fileName: "emp-7.pdf" },
  { employeeId: "emp-8", fullName: "Волков Сергей Петрович", fileName: "emp-8.pdf" },
];

export function ReportUploadDialog({
  open,
  onOpenChange,
  onUpload,
  procedures,
}: ReportUploadDialogProps) {
  const [procedureId, setProcedureId] = useState("");
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [title, setTitle] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchParsed, setBatchParsed] = useState(false);
  const [individualMode, setIndividualMode] = useState<string>("single");
  const [batchSource, setBatchSource] = useState<"csv" | "zip">("zip");

  const selectedProcedure = useMemo(
    () => procedures.find((p) => p.id === procedureId),
    [procedureId, procedures],
  );

  const participants = selectedProcedure?.participants ?? [];
  const isIndividual = reportType === "INDIVIDUAL";
  const needsUnit = reportType === "GROUP" || reportType === "SUMMARY" || reportType === "OVERALL" || reportType === "ANALYTIC";

  const isSingleValid = reportType && title.trim() && file && procedureId &&
    (isIndividual ? ownerUserId : true) && (needsUnit ? unitId : true);

  const handleProcedureChange = (id: string) => {
    setProcedureId(id);
    setOwnerUserId("");
  };

  const handleTypeChange = (type: ReportType) => {
    setReportType(type);
    if (selectedProcedure) {
      setTitle(`${reportTypeLabels[type]} отчет — ${selectedProcedure.providerName}`);
    }
    if (type !== "INDIVIDUAL") setOwnerUserId("");
    setIndividualMode("single");
    setBatchFile(null);
    setBatchParsed(false);
  };

  const handleSubmitSingle = () => {
    if (!isSingleValid || !reportType || !selectedProcedure) return;

    const report: Report = {
      id: `report-${Date.now()}`,
      providerId: selectedProcedure.providerId,
      procedureId: selectedProcedure.id,
      procedureName: selectedProcedure.name,
      type: reportType,
      title: title.trim(),
      filePath: `/uploads/${file!.name}`,
      ownerUserId: isIndividual ? ownerUserId : null,
      unitId: unitId || null,
      uploadedAt: new Date().toISOString(),
      customViewerUserIds: [],
    };

    onUpload([report]);
    resetForm();
    onOpenChange(false);
  };

  const activeBatchRows = batchSource === "zip" ? mockZipBatchRows : mockCsvBatchRows;

  const handleSubmitBatch = () => {
    if (!selectedProcedure || !batchParsed) return;

    const reports: Report[] = activeBatchRows.map((row, i) => ({
      id: `report-batch-${Date.now()}-${i}`,
      providerId: selectedProcedure.providerId,
      procedureId: selectedProcedure.id,
      procedureName: selectedProcedure.name,
      type: "INDIVIDUAL" as ReportType,
      title: `Индивидуальный отчет ${selectedProcedure.providerName} — ${row.fullName}`,
      filePath: `/uploads/${row.fileName}`,
      ownerUserId: row.employeeId,
      unitId: null,
      uploadedAt: new Date().toISOString(),
      customViewerUserIds: [],
    }));

    onUpload(reports);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setProcedureId("");
    setReportType("");
    setTitle("");
    setOwnerUserId("");
    setUnitId("");
    setFile(null);
    setBatchFile(null);
    setBatchParsed(false);
    setIndividualMode("single");
    setBatchSource("zip");
  };

  const handleDrop = (e: React.DragEvent, isBatch = false) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    if (isBatch) {
      setBatchFile(droppedFile);
      setBatchParsed(true);
    } else {
      setFile(droppedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Загрузка отчета провайдера
          </DialogTitle>
          <DialogDescription>
            Выберите процедуру, тип отчета и загрузите файл
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: Procedure */}
          <div className="space-y-2">
            <Label>Процедура <span className="text-destructive">*</span></Label>
            <Select value={procedureId} onValueChange={handleProcedureChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите процедуру" />
              </SelectTrigger>
              <SelectContent>
                {procedures.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground text-xs">({p.providerName})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Report Type */}
          {procedureId && (
            <div className="space-y-2">
              <Label>Тип отчета <span className="text-destructive">*</span></Label>
              <Select value={reportType} onValueChange={(v) => handleTypeChange(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип отчета" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{reportTypeLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: INDIVIDUAL with mode switcher */}
          {isIndividual && procedureId && (
            <Tabs value={individualMode} onValueChange={setIndividualMode}>
              <TabsList variant="grid2">
                <TabsTrigger value="single">По одному</TabsTrigger>
                <TabsTrigger value="batch">Пакетная загрузка</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4 mt-3">
                <div className="space-y-2">
                  <Label>Название отчета <span className="text-destructive">*</span></Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Индивидуальный отчет — ФИО" />
                </div>

                <div className="space-y-2">
                  <Label>Сотрудник (участник процедуры) <span className="text-destructive">*</span></Label>
                  <Select value={ownerUserId} onValueChange={setOwnerUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.fullName} — {p.position}
                        </SelectItem>
                      ))}
                      {participants.length === 0 && (
                        <SelectItem value="_none" disabled>Нет участников в процедуре</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <FileDropZone
                  file={file}
                  isDragOver={isDragOver}
                  inputId="report-file-single"
                  onDragOver={() => setIsDragOver(true)}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => handleDrop(e)}
                  onFileSelect={(f) => setFile(f)}
                />

                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Отмена</Button>
                  <Button onClick={handleSubmitSingle} disabled={!isSingleValid}>
                    <Upload className="h-4 w-4 mr-2" />Загрузить отчет
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="batch" className="space-y-4 mt-3">
                <div className="flex gap-2">
                  <Button
                    variant={batchSource === "zip" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setBatchSource("zip"); setBatchFile(null); setBatchParsed(false); }}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1.5" />ZIP-архив с PDF
                  </Button>
                  <Button
                    variant={batchSource === "csv" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setBatchSource("csv"); setBatchFile(null); setBatchParsed(false); }}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />CSV / Excel
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  {batchSource === "zip"
                    ? "Загрузите ZIP-архив с PDF-файлами, названными по ID сотрудников (например, emp-1.pdf, emp-2.pdf). Система автоматически сопоставит файлы с участниками процедуры."
                    : "Загрузите файл выгрузки от провайдера (CSV/Excel) с ID сотрудников и ссылками на файлы отчетов."
                  }
                </p>

                <FileDropZone
                  file={batchFile}
                  isDragOver={isDragOver}
                  inputId="report-file-batch"
                  accept={batchSource === "zip" ? ".zip" : ".csv,.xlsx,.xls"}
                  label={batchSource === "zip" ? "ZIP-архив (содержит PDF по ID сотрудников)" : "CSV / Excel от провайдера"}
                  onDragOver={() => setIsDragOver(true)}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => handleDrop(e, true)}
                  onFileSelect={(f) => { setBatchFile(f); setBatchParsed(true); }}
                />

                {batchParsed && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">
                        {batchSource === "zip" ? "Распознанные PDF из архива" : "Распознанные отчеты"} ({activeBatchRows.length})
                      </Label>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID сотрудника</TableHead>
                            <TableHead>ФИО</TableHead>
                            <TableHead>{batchSource === "zip" ? "Файл в архиве" : "Файл отчета"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeBatchRows.map((row) => (
                            <TableRow key={row.employeeId}>
                              <TableCell className="font-mono text-xs">{row.employeeId}</TableCell>
                              <TableCell className="text-sm">{row.fullName}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <FileText className="h-3.5 w-3.5" />{row.fileName}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Отмена</Button>
                  <Button onClick={handleSubmitBatch} disabled={!batchParsed}>
                    <Upload className="h-4 w-4 mr-2" />Загрузить все ({activeBatchRows.length})
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}

          {/* Step 3: Non-individual */}
          {needsUnit && procedureId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название отчета <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, Групповой отчет — Отдел" />
              </div>

              <div className="space-y-2">
                <Label>Подразделение <span className="text-destructive">*</span></Label>
                <Select value={unitId} onValueChange={setUnitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите подразделение" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgUnits.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />{u.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {unitId && (() => {
                const selectedUnit = orgUnits.find((u) => u.id === unitId);
                const manager = selectedUnit?.managerUserId
                  ? reportUsers.find((u) => u.id === selectedUnit.managerUserId)
                  : null;
                if (!manager) return null;
                return (
                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-sm">
                      <span className="text-muted-foreground">Руководитель подразделения (ССП):</span>{" "}
                      <span className="font-medium">{manager.fullName}</span>
                      <span className="text-muted-foreground ml-1">({roleLabels[manager.role] ?? manager.role})</span>
                    </AlertDescription>
                  </Alert>
                );
              })()}

              <FileDropZone
                file={file}
                isDragOver={isDragOver}
                inputId="report-file-other"
                onDragOver={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => handleDrop(e)}
                onFileSelect={(f) => setFile(f)}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Отмена</Button>
                <Button onClick={handleSubmitSingle} disabled={!isSingleValid}>
                  <Upload className="h-4 w-4 mr-2" />Загрузить отчет
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FileDropZone({
  file,
  isDragOver,
  inputId,
  accept = ".pdf,.docx,.xlsx,.xls,.doc",
  label = "PDF, DOCX, XLSX до 50 MB",
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: {
  file: File | null;
  isDragOver: boolean;
  inputId: string;
  accept?: string;
  label?: string;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (f: File) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Файл <span className="text-destructive">*</span></Label>
      <div
        onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <FileUp className="h-8 w-8 text-muted-foreground" />
        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Перетащите файл сюда или нажмите для выбора</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }}
        />
      </div>
    </div>
  );
}
