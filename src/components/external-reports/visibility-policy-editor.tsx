"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { canUserViewReport } from "@/lib/external-reports/access";
import { users, seedReports } from "@/lib/external-reports/mock-data";
import {
  REPORT_TYPES,
  reportTypeLabels,
  roleLabels,
} from "@/lib/external-reports/types";
import type { Report, ReportType, VisibilityPolicy } from "@/lib/external-reports/types";
import {
  CheckCircle2,
  Eye,
  HelpCircle,
  Plus,
  Settings2,
  ShieldCheck,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EmployeeOption {
  id: string;
  fullName: string;
  position: string;
}

interface VisibilityPolicyEditorProps {
  policies: VisibilityPolicy[];
  onPoliciesChange: (policies: VisibilityPolicy[]) => void;
  reports: Report[];
  onReportsChange?: (reports: Report[]) => void;
  employees?: EmployeeOption[];
}

const rankOptions = [
  { value: "1", label: "1 — Сотрудник" },
  { value: "2", label: "2 — Начальник отдела" },
  { value: "3", label: "3 — Начальник управления" },
  { value: "4", label: "4 — Зам. начальника департамента" },
  { value: "5", label: "5 — Начальник департамента" },
  { value: "6", label: "6 — Курирующее ВДЛ" },
];

function PolicyCard({
  policy,
  onChange,
  reports,
  onAddPersonalAccess,
  onRemovePersonalAccess,
  employees,
}: {
  policy: VisibilityPolicy;
  onChange: (updated: VisibilityPolicy) => void;
  reports: Report[];
  onAddPersonalAccess: (reportType: ReportType, userId: string) => void;
  onRemovePersonalAccess: (reportType: ReportType, userId: string) => void;
  employees: EmployeeOption[];
}) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const typeReports = reports.filter((r) => r.type === policy.reportType);
  const customViewerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const r of typeReports) {
      for (const uid of r.customViewerUserIds) {
        ids.add(uid);
      }
    }
    return Array.from(ids);
  }, [typeReports]);

  const availableEmployees = useMemo(() => {
    let list = employees.filter((e) => !customViewerIds.includes(e.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) => e.fullName.toLowerCase().includes(q) || e.position.toLowerCase().includes(q),
      );
    }
    return list;
  }, [employees, customViewerIds, searchQuery]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {reportTypeLabels[policy.reportType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-1.5">
            Доступ владельцу отчета
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                Сотрудник, на которого составлен отчет (для индивидуальных отчетов), видит свой собственный отчет
              </TooltipContent>
            </Tooltip>
          </Label>
          <Switch
            checked={policy.allowSelfOwner}
            onCheckedChange={(v) => onChange({ ...policy, allowSelfOwner: v })}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-1.5">
            Доступ цепочке руководителей владельца
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                Все прямые руководители сотрудника вверх по цепочке подчинения (непосредственный руководитель → его руководитель → и т.д. до ВДЛ)
              </TooltipContent>
            </Tooltip>
          </Label>
          <Switch
            checked={policy.allowOwnerManagerChain}
            onCheckedChange={(v) => onChange({ ...policy, allowOwnerManagerChain: v })}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-1.5">
            Доступ по иерархии подразделений
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px]">
                Руководители всех подразделений в иерархии над подразделением владельца отчета. Доступ определяется рангом: чем выше ранг, тем больше видит руководитель (отдел → управление → департамент → ВДЛ)
              </TooltipContent>
            </Tooltip>
          </Label>
          <Switch
            checked={policy.allowUnitManagerHierarchy}
            onCheckedChange={(v) => onChange({ ...policy, allowUnitManagerHierarchy: v })}
          />
        </div>
        {policy.allowUnitManagerHierarchy && (
          <div className="ml-4 space-y-2">
            <Label className="text-xs text-muted-foreground">
              Минимальный ранг роли для доступа по иерархии
            </Label>
            <Select
              value={String(policy.minimumRoleRankForUnitHierarchy)}
              onValueChange={(v) =>
                onChange({ ...policy, minimumRoleRankForUnitHierarchy: Number(v) })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rankOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-1.5">
            Доступ заказчикам исследования
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                Сотрудники с ролью «Заказчик исследования» — кросс-функциональные руководители или HR BP, инициировавшие оценку и нуждающиеся в доступе к результатам
              </TooltipContent>
            </Tooltip>
          </Label>
          <Switch
            checked={policy.allowResearchCustomers}
            onCheckedChange={(v) => onChange({ ...policy, allowResearchCustomers: v })}
          />
        </div>

        {/* Personal access section */}
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Персональный доступ
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px]">
                  Конкретные сотрудники, которым предоставлен индивидуальный доступ к этому типу отчетов, вне зависимости от их роли и подразделения
                </TooltipContent>
              </Tooltip>
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowAddUser(!showAddUser)}
            >
              <Plus className="h-3 w-3 mr-1" />Добавить
            </Button>
          </div>

          {showAddUser && (
            <div className="space-y-1.5">
              <input
                type="text"
                className="w-full h-7 px-2 text-xs border rounded-md bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Поиск по ФИО или должности..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {availableEmployees.length > 0 ? (
                <Select
                  onValueChange={(uid) => {
                    onAddPersonalAccess(policy.reportType, uid);
                    setShowAddUser(false);
                    setSearchQuery("");
                  }}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Выберите сотрудника по ФИО" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.slice(0, 20).map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.fullName} — {e.position}
                      </SelectItem>
                    ))}
                    {availableEmployees.length > 20 && (
                      <SelectItem value="_more" disabled>
                        ...ещё {availableEmployees.length - 20} (уточните поиск)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground">Не найдено сотрудников</p>
              )}
            </div>
          )}

          {customViewerIds.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {customViewerIds.map((uid) => {
                const emp = employees.find((e) => e.id === uid);
                const roleUser = users.find((u) => u.id === uid);
                const displayName = emp?.fullName ?? roleUser?.fullName ?? uid;
                return (
                  <Badge key={uid} variant="secondary" className="text-xs gap-1 pr-0.5">
                    {displayName.split(" ").slice(0, 2).join(" ")}
                    <button
                      type="button"
                      className="inline-flex items-center justify-center h-4 w-4 rounded-sm hover:bg-destructive/20 hover:text-destructive transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemovePersonalAccess(policy.reportType, uid);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Нет персонального доступа</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AccessMatrix({
  policies,
  reports,
}: {
  policies: VisibilityPolicy[];
  reports: Report[];
}) {
  const allUsers = users;
  const reportsToCheck = reports.length > 0 ? reports : seedReports;

  const matrix = useMemo(() => {
    return allUsers.map((user) => {
      const row: Record<string, boolean> = {};
      for (const rt of REPORT_TYPES) {
        const matchingReports = reportsToCheck.filter((r) => r.type === rt);
        row[rt] = matchingReports.some((r) => canUserViewReport(user.id, r, policies));
      }

      const customTypes = new Set<string>();
      for (const r of reportsToCheck) {
        if (r.customViewerUserIds.includes(user.id)) {
          customTypes.add(r.type);
        }
      }

      return { user, access: row, customTypes };
    });
  }, [allUsers, policies, reportsToCheck]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Матрица доступа к отчетам
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px] whitespace-nowrap">Роль</TableHead>
                {REPORT_TYPES.map((rt) => (
                  <TableHead key={rt} className="text-center whitespace-nowrap">
                    {reportTypeLabels[rt]}
                  </TableHead>
                ))}
                <TableHead className="text-center whitespace-nowrap">Доп. доступ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map(({ user, access, customTypes }) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{roleLabels[user.role]}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.fullName}
                          {user.isResearchCustomer && (
                            <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                              заказчик
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {REPORT_TYPES.map((rt) => (
                    <TableCell key={rt} className="text-center">
                      {access[rt] ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {customTypes.size > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {Array.from(customTypes).map((rt) => (
                          <Badge key={rt} variant="outline" className="text-[10px] px-1.5 py-0">
                            {reportTypeLabels[rt as ReportType]}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function VisibilityPolicyEditor({
  policies,
  onPoliciesChange,
  reports,
  onReportsChange,
  employees = [],
}: VisibilityPolicyEditorProps) {
  const employeeList: EmployeeOption[] = employees.length > 0
    ? employees
    : users.map((u) => ({ id: u.id, fullName: u.fullName, position: roleLabels[u.role] }));
  const handlePolicyChange = (updated: VisibilityPolicy) => {
    onPoliciesChange(
      policies.map((p) => (p.reportType === updated.reportType ? updated : p)),
    );
  };

  const handleAddPersonalAccess = (reportType: ReportType, userId: string) => {
    if (!onReportsChange) return;
    onReportsChange(
      reports.map((r) =>
        r.type === reportType && !r.customViewerUserIds.includes(userId)
          ? { ...r, customViewerUserIds: [...r.customViewerUserIds, userId] }
          : r,
      ),
    );
  };

  const handleRemovePersonalAccess = (reportType: ReportType, userId: string) => {
    if (!onReportsChange) return;
    onReportsChange(
      reports.map((r) =>
        r.type === reportType
          ? { ...r, customViewerUserIds: r.customViewerUserIds.filter((id) => id !== userId) }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <Settings2 className="h-5 w-5" />
          Настройки видимости отчетов
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте правила доступа к отчетам для каждого типа. Изменения
          отражаются в матрице доступа в реальном времени.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.reportType}
            policy={policy}
            onChange={handlePolicyChange}
            reports={reports}
            onAddPersonalAccess={handleAddPersonalAccess}
            onRemovePersonalAccess={handleRemovePersonalAccess}
            employees={employeeList}
          />
        ))}
      </div>

      <AccessMatrix policies={policies} reports={reports} />
    </div>
  );
}
