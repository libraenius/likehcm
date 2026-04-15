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
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, FileUp, Link2, QrCode, Search, Upload, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Employee {
  id: string;
  fullName: string;
  position: string;
  email: string;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
  parentId?: string;
}

interface CsvImportRow {
  employeeId: string;
  fullName: string;
  procedureLink: string;
  qrCode: string;
}

const mockCsvRows: CsvImportRow[] = [
  { employeeId: "emp-1", fullName: "Петров Иван Сергеевич", procedureLink: "https://assess.example.com/p/abc123", qrCode: "QR-001" },
  { employeeId: "emp-3", fullName: "Иванов Алексей Дмитриевич", procedureLink: "https://assess.example.com/p/def456", qrCode: "QR-002" },
  { employeeId: "emp-5", fullName: "Помыткин Сергей Олегович", procedureLink: "https://assess.example.com/p/ghi789", qrCode: "QR-003" },
  { employeeId: "emp-7", fullName: "Морозов Дмитрий Александрович", procedureLink: "https://assess.example.com/p/jkl012", qrCode: "QR-004" },
  { employeeId: "emp-9", fullName: "Новикова Анна Игоревна", procedureLink: "https://assess.example.com/p/mno345", qrCode: "QR-005" },
  { employeeId: "emp-11", fullName: "Соколова Ольга Владимировна", procedureLink: "https://assess.example.com/p/pqr678", qrCode: "QR-006" },
];

interface AddParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  departments: Department[];
  existingParticipantIds: string[];
  onAddParticipants: (employeeIds: string[]) => void;
}

export function AddParticipantsDialog({
  open,
  onOpenChange,
  employees,
  departments,
  existingParticipantIds,
  onAddParticipants,
}: AddParticipantsDialogProps) {
  const [tab, setTab] = useState("manual");
  const [selectedIds, setSelectedIds] = useState<string[]>(existingParticipantIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParsed, setCsvParsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetState = () => {
    setSelectedIds(existingParticipantIds);
    setSearchQuery("");
    setSelectedDeptId("");
    setCsvFile(null);
    setCsvParsed(false);
    setTab("manual");
  };

  const getChildDepartmentIds = (deptId: string): string[] => {
    const result = [deptId];
    const children = departments.filter((d) => d.parentId === deptId);
    for (const child of children) {
      result.push(...getChildDepartmentIds(child.id));
    }
    return result;
  };

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      );
    }
    return result;
  }, [employees, searchQuery]);

  const deptEmployees = useMemo(() => {
    if (!selectedDeptId) return [];
    const deptIds = getChildDepartmentIds(selectedDeptId);
    return employees.filter((e) => e.departmentId && deptIds.includes(e.departmentId));
  }, [selectedDeptId, employees, departments]);

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAddFromDept = () => {
    const newIds = deptEmployees.map((e) => e.id);
    setSelectedIds((prev) => [...new Set([...prev, ...newIds])]);
  };

  const handleImportCsv = () => {
    const importedIds = mockCsvRows.map((r) => r.employeeId);
    setSelectedIds((prev) => [...new Set([...prev, ...importedIds])]);
    setTab("manual");
  };

  const handleSubmit = () => {
    onAddParticipants(selectedIds);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Добавление участников
          </DialogTitle>
          <DialogDescription>
            Выберите сотрудников вручную, из оргструктуры или импортируйте от провайдера
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList variant="grid3">
            <TabsTrigger value="manual">Ручной выбор</TabsTrigger>
            <TabsTrigger value="org">Из оргструктуры</TabsTrigger>
            <TabsTrigger value="import">Импорт от провайдера</TabsTrigger>
          </TabsList>

          {/* Manual Selection */}
          <TabsContent value="manual" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по ФИО, должности, email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Badge variant="outline">{selectedIds.length} выбрано</Badge>
            </div>

            <div className="border rounded-lg max-h-[340px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>ФИО</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow
                      key={emp.id}
                      className="cursor-pointer"
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(emp.id)}
                          onCheckedChange={() => toggleEmployee(emp.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sm">{emp.fullName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{emp.position}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{emp.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Org Structure */}
          <TabsContent value="org" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Подразделение</label>
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подразделение" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {dept.parentId ? `  └ ${dept.name}` : dept.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDeptId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Найдено сотрудников: <span className="font-medium text-foreground">{deptEmployees.length}</span>
                    {departments.find((d) => d.id === selectedDeptId)?.name && (
                      <> в подразделении «{departments.find((d) => d.id === selectedDeptId)?.name}» и дочерних</>
                    )}
                  </p>
                  <Button size="sm" variant="outline" onClick={handleAddFromDept} disabled={deptEmployees.length === 0}>
                    Добавить всех ({deptEmployees.length})
                  </Button>
                </div>

                {deptEmployees.length > 0 && (
                  <div className="border rounded-lg max-h-[280px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10" />
                          <TableHead>ФИО</TableHead>
                          <TableHead>Должность</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deptEmployees.map((emp) => (
                          <TableRow key={emp.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(emp.id)}
                                onCheckedChange={() => toggleEmployee(emp.id)}
                              />
                            </TableCell>
                            <TableCell className="text-sm font-medium">{emp.fullName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{emp.position}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* CSV Import */}
          <TabsContent value="import" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Загрузите файл выгрузки от провайдера (CSV/Excel) с ID сотрудников, ссылками на процедуры и QR-кодами.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) { setCsvFile(f); setCsvParsed(true); } }}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onClick={() => document.getElementById("csv-import-input")?.click()}
            >
              <FileUp className="h-8 w-8 text-muted-foreground" />
              {csvFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{csvFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Перетащите файл CSV/Excel сюда или нажмите для выбора</p>
                  <p className="text-xs text-muted-foreground">Формат: CSV, XLSX (ID сотрудника, ссылка, QR-код)</p>
                </div>
              )}
              <input
                id="csv-import-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setCsvFile(f); setCsvParsed(true); }
                }}
              />
            </div>

            {csvParsed && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Распознано участников: {mockCsvRows.length}
                  </p>
                  <Button size="sm" onClick={handleImportCsv}>
                    Импортировать всех ({mockCsvRows.length})
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Ссылка</TableHead>
                        <TableHead>QR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCsvRows.map((row) => (
                        <TableRow key={row.employeeId}>
                          <TableCell className="font-mono text-xs">{row.employeeId}</TableCell>
                          <TableCell className="text-sm">{row.fullName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[200px]">
                              <Link2 className="h-3 w-3 flex-shrink-0" />{row.procedureLink}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              <QrCode className="h-3 w-3 mr-1" />{row.qrCode}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
            <span className="text-xs text-muted-foreground mr-1 self-center">Выбрано ({selectedIds.length}):</span>
            {selectedIds.slice(0, 8).map((id) => {
              const emp = employees.find((e) => e.id === id);
              return (
                <Badge key={id} variant="secondary" className="text-xs gap-1">
                  {emp ? emp.fullName.split(" ").slice(0, 2).join(" ") : id}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => toggleEmployee(id)} />
                </Badge>
              );
            })}
            {selectedIds.length > 8 && (
              <Badge variant="outline" className="text-xs">+{selectedIds.length - 8}</Badge>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetState(); onOpenChange(false); }}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <Users className="h-4 w-4 mr-2" />
            Сохранить участников ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
