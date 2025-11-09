"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfileById } from "@/lib/data";
import type { TeamMember } from "@/types";

// Моковые данные команды
const mockTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Иван Петров",
    email: "ivan.petrov@example.com",
    mainProfileId: "profile-1",
    additionalProfileIds: ["profile-3"],
  },
  {
    id: "member-2",
    name: "Мария Сидорова",
    email: "maria.sidorova@example.com",
    mainProfileId: "profile-2",
    additionalProfileIds: [],
  },
  {
    id: "member-3",
    name: "Алексей Иванов",
    email: "alexey.ivanov@example.com",
    mainProfileId: "profile-3",
    additionalProfileIds: ["profile-1"],
  },
  {
    id: "member-4",
    name: "Елена Смирнова",
    email: "elena.smirnova@example.com",
    mainProfileId: "profile-4",
    additionalProfileIds: [],
  },
];

export default function TeamPage() {
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Моя команда</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр участников команды и их профилей
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => {
          const mainProfile = getProfileById(member.mainProfileId);
          const additionalProfiles = member.additionalProfileIds
            .map((id) => getProfileById(id))
            .filter(Boolean);

          return (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {member.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Основной профиль:</p>
                  {mainProfile ? (
                    <Badge variant="default">{mainProfile.name}</Badge>
                  ) : (
                    <Badge variant="secondary">Не выбран</Badge>
                  )}
                </div>

                {additionalProfiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Дополнительные профили:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {additionalProfiles.map((profile) => (
                        <Badge key={profile!.id} variant="secondary">
                          {profile!.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-4" size="sm">
                  Просмотр профиля
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

