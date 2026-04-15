"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { users } from "@/lib/external-reports/mock-data";
import { roleLabels } from "@/lib/external-reports/types";
import type { ReportUser } from "@/lib/external-reports/types";
import { Eye, ShieldCheck } from "lucide-react";

interface RoleSwitcherProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
}

const roleDescriptions: Record<string, string> = {
  "u-employee": "Видит только свой индивидуальный отчет",
  "u-head-section":
    "Индивидуальные отчеты подчиненных + групповой по отделу",
  "u-head-directorate":
    "Все отчеты ниже + сводный по управлению",
  "u-deputy-department-head":
    "Все отчеты ниже + общий по департаменту",
  "u-department-head":
    "Все отчеты ниже + общий по департаменту",
  "u-executive": "Доступ ко всем уровням отчетности",
  "u-customer": "Аналитические отчеты (заказчик исследования)",
};

export function RoleSwitcher({ currentUserId, onUserChange }: RoleSwitcherProps) {
  const currentUser = users.find((u) => u.id === currentUserId);

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border/60">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
        <Eye className="h-4 w-4" />
        Просмотр от лица:
      </div>
      <Select value={currentUserId} onValueChange={onUserChange}>
        <SelectTrigger className="w-[340px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <span>{user.fullName}</span>
                {user.isResearchCustomer && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    заказчик
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentUser && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-medium">{roleLabels[currentUser.role]}</span>
          <span className="hidden lg:inline">
            — {roleDescriptions[currentUser.id] ?? ""}
          </span>
        </div>
      )}
    </div>
  );
}
