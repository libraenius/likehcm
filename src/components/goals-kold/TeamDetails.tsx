"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, UserCircle } from "lucide-react";
import type { Team } from "@/types/goals-kold";

interface TeamDetailsProps {
  team: Team;
}

export function TeamDetails({ team }: TeamDetailsProps) {
  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl break-words">{team.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 overflow-x-hidden">
        {/* Стрим */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Стрим</Label>
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{team.streamName}</span>
          </div>
        </div>

        <Separator />

        {/* Руководитель */}
        {team.leader && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Руководитель команды</Label>
              <div className="flex items-center gap-2.5">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{team.leader}</span>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Количество участников */}
        {team.membersCount !== undefined && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Количество участников</Label>
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{team.membersCount} человек</span>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Дополнительная информация */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Дополнительная информация</Label>
          <p className="text-sm text-muted-foreground">
            Здесь будет отображаться информация о ключевых результатах команды.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

