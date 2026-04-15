"use client";

import { useState, useEffect, useMemo } from "react";
import { getUserProfile, saveUserProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  Users, 
  User, 
  ShieldCheck, 
  UsersRound, 
  UserCheck,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Eye,
  Target,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowLeft
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserProfile, AssessmentRole, MultiRoleAssessment } from "@/types";
import { 
  JohariWindowVisualization, 
  MultiRoleAssessmentComponent,
  AssessmentAnalytics 
} from "@/components/johari-window";
import { 
  createJohariWindowDataset, 
  calculateJohariStats,
  aggregateAssessments,
  hasReliableData 
} from "@/lib/johari-window";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AssessmentPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AssessmentRole>("самооценка");

  useEffect(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
  }, []);

  // Создаем данные окна Джохари
  const johariData = useMemo(() => {
    if (!userProfile?.multiRoleAssessments) return [];
    return createJohariWindowDataset(userProfile.multiRoleAssessments);
  }, [userProfile?.multiRoleAssessments]);

  // Статистика
  const stats = useMemo(() => {
    if (johariData.length === 0) return null;
    return calculateJohariStats(johariData);
  }, [johariData]);

  // Проверка наличия оценок от разных ролей
  const assessmentCoverage = useMemo(() => {
    if (!userProfile?.multiRoleAssessments) {
      return {
        hasSelf: false,
        hasManager: false,
        hasPeers: false,
        hasSubordinates: false,
        peerCount: 0,
        subordinateCount: 0,
      };
    }

    let hasSelf = false;
    let hasManager = false;
    let peerCount = 0;
    let subordinateCount = 0;

    userProfile.multiRoleAssessments.forEach(assessment => {
      if (assessment.selfAssessment !== undefined) hasSelf = true;
      if (assessment.managerAssessment !== undefined) hasManager = true;
      peerCount += assessment.peerAssessments?.length || 0;
      subordinateCount += assessment.subordinateAssessments?.length || 0;
    });

    return {
      hasSelf,
      hasManager,
      hasPeers: peerCount > 0,
      hasSubordinates: subordinateCount > 0,
      peerCount,
      subordinateCount,
    };
  }, [userProfile?.multiRoleAssessments]);

  const handleAssessmentUpdate = (assessments: MultiRoleAssessment[]) => {
    if (!userProfile) return;

    // Обновляем мультиролевые оценки в профиле
    const existingAssessments = userProfile.multiRoleAssessments || [];
    const updatedAssessments = [...existingAssessments];

    assessments.forEach(newAssessment => {
      const existingIndex = updatedAssessments.findIndex(
        a => a.competenceId === newAssessment.competenceId
      );

      if (existingIndex >= 0) {
        // Обновляем существующую оценку
        updatedAssessments[existingIndex] = newAssessment;
      } else {
        // Добавляем новую оценку
        updatedAssessments.push(newAssessment);
      }
    });

    // Также обновляем старый формат skills для совместимости
    if (selectedRole === "самооценка") {
      const updatedSkills = assessments.map(assessment => ({
        competenceId: assessment.competenceId,
        selfAssessment: assessment.selfAssessment!,
        lastUpdated: assessment.lastUpdated,
        comment: assessment.comments?.self,
        role: "самооценка" as AssessmentRole,
      }));

      const newProfile: UserProfile = {
        ...userProfile,
        skills: updatedSkills,
        multiRoleAssessments: updatedAssessments,
      };

      saveUserProfile(newProfile);
      setUserProfile(newProfile);
    } else {
      const newProfile: UserProfile = {
        ...userProfile,
        multiRoleAssessments: updatedAssessments,
      };

      saveUserProfile(newProfile);
      setUserProfile(newProfile);
    }

    setIsAssessmentDialogOpen(false);
  };

  const handleStartAssessment = (role: AssessmentRole) => {
    setSelectedRole(role);
    setIsAssessmentDialogOpen(true);
  };

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!userProfile.mainProfileId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Профиль не настроен</CardTitle>
            <CardDescription>
              Для использования многосторонней оценки необходимо настроить профиль
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Перейти к профилю
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleConfig: Record<AssessmentRole, {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }> = {
    "самооценка": {
      icon: User,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-300 dark:border-blue-700",
      description: "Оцените свои компетенции",
    },
    "руководитель": {
      icon: ShieldCheck,
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      borderColor: "border-purple-300 dark:border-purple-700",
      description: "Оценка от руководителя",
    },
    "коллега": {
      icon: UsersRound,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-300 dark:border-green-700",
      description: "Анонимная оценка от коллег",
    },
    "подчиненный": {
      icon: UserCheck,
      color: "text-amber-700 dark:text-amber-300",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      borderColor: "border-amber-300 dark:border-amber-700",
      description: "Анонимная оценка от подчиненных",
    },
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Многосторонняя оценка (360°)</h1>
          <p className="text-muted-foreground">
            Оценка компетенций с разных точек зрения и окно Джохари для самопознания
          </p>
        </div>
        <Link href="/profile">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К профилю
          </Button>
        </Link>
      </div>

      {/* Статус покрытия оценками */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Статус оценок
          </CardTitle>
          <CardDescription>
            Для построения окна Джохари рекомендуется получить оценки от разных источников
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(roleConfig) as AssessmentRole[]).map(role => {
              const config = roleConfig[role];
              const Icon = config.icon;
              
              let hasData = false;
              let count = 0;
              
              if (role === "самооценка") {
                hasData = assessmentCoverage.hasSelf;
              } else if (role === "руководитель") {
                hasData = assessmentCoverage.hasManager;
              } else if (role === "коллега") {
                hasData = assessmentCoverage.hasPeers;
                count = assessmentCoverage.peerCount;
              } else if (role === "подчиненный") {
                hasData = assessmentCoverage.hasSubordinates;
                count = assessmentCoverage.subordinateCount;
              }

              return (
                <Card 
                  key={role}
                  className={cn(
                    "border-2 transition-all",
                    hasData ? config.borderColor : "border-slate-300 dark:border-slate-700"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        hasData ? config.bgColor : "bg-slate-100 dark:bg-slate-900"
                      )}>
                        <Icon className={cn("h-5 w-5", hasData ? config.color : "text-slate-500")} />
                      </div>
                      {hasData ? (
                        <CheckCircle2 className={cn("h-5 w-5", config.color)} />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-1">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {config.description}
                    </p>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {count} {count === 1 ? "оценка" : "оценок"}
                      </Badge>
                    )}
                    {!hasData && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => handleStartAssessment(role)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Добавить
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!assessmentCoverage.hasSelf && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Начните с самооценки</AlertTitle>
              <AlertDescription>
                Самооценка - основа для построения окна Джохари. Начните с оценки своих компетенций.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Вкладки */}
      <Tabs defaultValue="johari" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="johari">
            <Sparkles className="h-4 w-4 mr-2" />
            Окно Джохари
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <Users className="h-4 w-4 mr-2" />
            Оценки
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        {/* Окно Джохари */}
        <TabsContent value="johari" className="mt-6">
          {johariData.length > 0 ? (
            <JohariWindowVisualization data={johariData} showDetails={true} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Окно Джохари недоступно</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Для построения окна Джохари необходимо пройти самооценку и получить хотя бы одну оценку 
                  от руководителя или коллег.
                </p>
                <Button onClick={() => handleStartAssessment("самооценка")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Начать самооценку
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Управление оценками */}
        <TabsContent value="assessments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление оценками</CardTitle>
              <CardDescription>
                Добавьте или обновите оценки компетенций от разных ролей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(roleConfig) as AssessmentRole[]).map(role => {
                  const config = roleConfig[role];
                  const Icon = config.icon;

                  return (
                    <Card 
                      key={role}
                      className={cn("border-2 cursor-pointer hover:bg-muted/50 transition-colors", config.borderColor)}
                      onClick={() => handleStartAssessment(role)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn("p-3 rounded-lg", config.bgColor)}>
                            <Icon className={cn("h-6 w-6", config.color)} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {config.description}
                            </p>
                            <Button size="sm" variant="outline">
                              <PlusCircle className="h-3 w-3 mr-1" />
                              {role === "самооценка" ? "Обновить" : "Провести"} оценку
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Аналитика */}
        <TabsContent value="analytics" className="mt-6">
          {userProfile.multiRoleAssessments && userProfile.multiRoleAssessments.length > 0 ? (
            <AssessmentAnalytics multiRoleAssessments={userProfile.multiRoleAssessments} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Аналитика недоступна</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Аналитика будет доступна после проведения оценок компетенций
                </p>
                <Button onClick={() => handleStartAssessment("самооценка")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Начать самооценку
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог для проведения оценки */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => {
                const Icon = roleConfig[selectedRole].icon;
                return <Icon className={cn("h-5 w-5", roleConfig[selectedRole].color)} />;
              })()}
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </DialogTitle>
            <DialogDescription>
              {roleConfig[selectedRole].description}
            </DialogDescription>
          </DialogHeader>

          <MultiRoleAssessmentComponent
            userProfile={userProfile}
            assessmentRole={selectedRole}
            onAssessmentUpdate={handleAssessmentUpdate}
            onClose={() => setIsAssessmentDialogOpen(false)}
            isAnonymous={selectedRole === "коллега" || selectedRole === "подчиненный"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
