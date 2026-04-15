"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orgUnits, users } from "@/lib/external-reports/mock-data";
import { getVisibleReports } from "@/lib/external-reports/access";
import { reportTypeLabels } from "@/lib/external-reports/types";
import type { Report, ReportType, VisibilityPolicy } from "@/lib/external-reports/types";
import {
  BarChart3,
  Building2,
  Download,
  FileText,
  Users,
  User,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderInfo {
  id: string;
  name: string;
}

interface ReportsListProps {
  reports: Report[];
  policies: VisibilityPolicy[];
  currentUserId: string;
  showEmpty?: boolean;
  providers?: ProviderInfo[];
}

const typeIcons: Record<ReportType, React.ReactNode> = {
  INDIVIDUAL: <User className="h-4 w-4" />,
  GROUP: <Users className="h-4 w-4" />,
  SUMMARY: <Layers className="h-4 w-4" />,
  OVERALL: <BarChart3 className="h-4 w-4" />,
  ANALYTIC: <BarChart3 className="h-4 w-4" />,
};

const typeBadgeColors: Record<ReportType, string> = {
  INDIVIDUAL:
    "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  GROUP:
    "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
  SUMMARY:
    "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
  OVERALL:
    "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  ANALYTIC:
    "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900 dark:text-rose-200 dark:border-rose-700",
};

function ReportTypeBadge({ type }: { type: ReportType }) {
  return (
    <Badge variant="outline" className={cn("text-xs gap-1", typeBadgeColors[type])}>
      {typeIcons[type]}
      {reportTypeLabels[type]}
    </Badge>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ReportsList({
  reports,
  policies,
  currentUserId,
  showEmpty = true,
  providers = [],
}: ReportsListProps) {
  const visibleReports = useMemo(
    () => getVisibleReports(currentUserId, reports, policies),
    [currentUserId, reports, policies],
  );

  const grouped = useMemo(() => {
    const groups: Record<ReportType, Report[]> = {
      INDIVIDUAL: [],
      GROUP: [],
      SUMMARY: [],
      OVERALL: [],
      ANALYTIC: [],
    };
    for (const r of visibleReports) {
      groups[r.type].push(r);
    }
    return groups;
  }, [visibleReports]);

  if (visibleReports.length === 0 && showEmpty) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Для текущей роли нет доступных отчетов
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleReports.length === 0 && !showEmpty) {
    return null;
  }

  const groupOrder: ReportType[] = [
    "INDIVIDUAL",
    "GROUP",
    "SUMMARY",
    "OVERALL",
    "ANALYTIC",
  ];

  return (
    <div className="space-y-4">
      {groupOrder.map((type) => {
        const items = grouped[type];
        if (items.length === 0) return null;

        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <ReportTypeBadge type={type} />
              <span className="text-xs text-muted-foreground">
                ({items.length})
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead className="w-[180px]">Подразделение</TableHead>
                    <TableHead className="w-[100px]">Дата</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Действия
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((report) => {
                    const unit = report.unitId
                      ? orgUnits.find((u) => u.id === report.unitId)
                      : null;
                    const owner = report.ownerUserId
                      ? users.find((u) => u.id === report.ownerUserId)
                      : null;

                    const provider = report.providerId
                      ? providers.find((p) => p.id === report.providerId)
                      : null;

                    return (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm">
                                {report.title}
                              </div>
                              <div className="text-xs text-muted-foreground space-x-2">
                                {report.procedureName && (
                                  <span>Процедура: {report.procedureName}</span>
                                )}
                                {provider && (
                                  <span>· Провайдер: {provider.name}</span>
                                )}
                              </div>
                              {owner && (
                                <div className="text-xs text-muted-foreground">
                                  {owner.fullName}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {unit && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                              {unit.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(report.uploadedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Скачать
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ReportTypeBadge, typeBadgeColors };
