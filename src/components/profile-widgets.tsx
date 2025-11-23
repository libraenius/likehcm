"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  User, 
  TrendingUp, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  getProfiles, 
  getCareerTracks, 
  getProfileById, 
  getCareerTrackByProfileId,
  getUserProfile,
  saveUserProfile
} from "@/lib/data";
import { getUserCareerTrackProgress } from "@/lib/calculations";
import type { UserProfile, AssessmentRole } from "@/types";

interface ProfileWidgetsProps {
  userProfile: UserProfile | null;
}

// Виджет профилей
function ProfilesWidget({ userProfile }: { userProfile: UserProfile | null }) {
  const profiles = getProfiles();
  const mainProfile = userProfile?.mainProfileId ? getProfileById(userProfile.mainProfileId) : null;
  const additionalProfiles = (userProfile?.additionalProfileIds || [])
    .map(id => getProfileById(id))
    .filter((profile): profile is NonNullable<typeof profile> => profile !== null && profile !== undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
            <CardTitle className="text-lg">Профили</CardTitle>
          </div>
          <Link href="/reference/profiles">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Ваши выбранные профили
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mainProfile ? (
          <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">Основной</Badge>
              <span className="text-sm font-semibold">{mainProfile.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {mainProfile.description}
            </p>
          </div>
        ) : (
          <div className="p-3 border rounded-lg border-dashed text-center">
            <p className="text-sm text-muted-foreground">Основной профиль не выбран</p>
            <Link href="/services/career">
              <Button variant="outline" size="sm" className="mt-2">
                Выбрать профиль
              </Button>
            </Link>
          </div>
        )}
        
        {additionalProfiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Дополнительные:</div>
            <div className="space-y-1">
              {additionalProfiles.map((profile) => (
                <div key={profile.id} className="p-2 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Доп.
                    </Badge>
                    <span className="text-sm">{profile.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Всего профилей в системе: <span className="font-semibold">{profiles.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Виджет карьерного прогресса
function CareerProgressWidget({ userProfile }: { userProfile: UserProfile | null }) {
  const progress = useMemo(() => {
    if (!userProfile) return null;
    return getUserCareerTrackProgress(userProfile);
  }, [userProfile]);

  const careerTrack = progress ? getCareerTrackByProfileId(userProfile?.mainProfileId || "") : null;
  const currentLevel = careerTrack?.levels.find(l => l.level === progress?.currentLevel);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
              <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-300" />
            </div>
            <CardTitle className="text-lg">Карьерный прогресс</CardTitle>
          </div>
          <Link href="/services/career">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Ваш прогресс по карьерному треку
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress && currentLevel ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Текущий уровень</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {currentLevel.name}
                </Badge>
              </div>
              <Progress value={progress.matchPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Соответствие: {progress.matchPercentage}%
              </div>
            </div>
            {progress.skillGaps.length > 0 && (
              <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold">Области для развития</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.skillGaps.length} компетенций требуют развития
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 border rounded-lg border-dashed text-center">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Прогресс пока недоступен
            </p>
            <Link href="/services/career">
              <Button variant="outline" size="sm">
                Начать карьерный путь
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Функция для генерации тестовых процедур
function generateTestProcedures(
  userProfile: UserProfile | null,
  roles: AssessmentRole[] | null,
  count: number
) {
  const profile = userProfile?.mainProfileId ? getProfileById(userProfile.mainProfileId) : null;
  const totalCompetences = profile?.requiredCompetences.length || 10; // Дефолтное значение если профиля нет
  
  // Определяем роль для тестовых процедур
  const defaultRole = roles === null ? "самооценка" : roles[0] || "самооценка";
  
  const procedures = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < count; i++) {
    const year = currentYear - Math.floor(i / 4); // Меняем год каждые 4 процедуры
    const month = 12 - (i % 12); // Месяцы от 12 до 1
    const day = 15 - (i % 15); // Дни от 15 до 1
    
    const date = new Date(year, month - 1, day);
    const dateKey = date.toISOString().split('T')[0];
    
    // Чередуем роли для разнообразия
    const roleIndex = i % 4;
    const role = roles === null 
      ? "самооценка"
      : roles[roleIndex % roles.length] || defaultRole;
    
    // Разные уровни прогресса для разнообразия (включая 0 для "не приступил")
    const progressValues = [100, 0, 85, 70, 0, 50, 100, 90, 5, 75, 100, 95, 0, 55, 45, 100, 88, 10];
    const progress = progressValues[i % progressValues.length];
    
    const period = year.toString();
    const procedureName = `Блок ИТ и ЦТ ${period}`;
    const procedureType = role === "самооценка" 
      ? "Оценка для целей развития"
      : role === "руководитель"
      ? "Оценка руководителя"
      : role === "коллега"
      ? "Оценка коллеги"
      : "Оценка подчиненного";
    
    procedures.push({
      id: `test-${dateKey}-${i}`,
      date: date,
      assessedCount: Math.round((progress / 100) * totalCompetences),
      totalCompetences,
      progress,
      skillsCount: Math.round((progress / 100) * totalCompetences),
      period,
      role,
      procedureName,
      procedureType,
    });
  }
  
  return procedures.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Вспомогательная функция для получения оценочных процедур по роли
function getAssessmentProceduresByRole(
  userProfile: UserProfile | null,
  roles: AssessmentRole[] | null // null означает самооценку (роль не указана или "самооценка")
) {
  const profile = userProfile?.mainProfileId ? getProfileById(userProfile.mainProfileId) : null;
  const totalCompetences = profile?.requiredCompetences.length || 0;
  
  let procedures: Array<{
    id: string;
    date: Date;
    assessedCount: number;
    totalCompetences: number;
    progress: number;
    skillsCount: number;
    period: string;
    role: AssessmentRole | "самооценка";
    procedureName: string;
    procedureType: string;
  }> = [];

  // Если есть реальные навыки, создаем процедуры из них
  if (userProfile?.skills && userProfile.skills.length > 0) {
    // Фильтруем навыки по роли
    const filteredSkills = userProfile.skills.filter((skill) => {
      const skillRole = skill.role || "самооценка";
      if (roles === null) {
        return skillRole === "самооценка" || !skill.role;
      }
      return roles.includes(skillRole);
    });

    if (filteredSkills.length > 0) {
      // Группируем навыки по дате обновления
      const dateGroups = new Map<string, typeof filteredSkills>();
      
      filteredSkills.forEach((skill) => {
        const dateKey = skill.lastUpdated instanceof Date 
          ? skill.lastUpdated.toISOString().split('T')[0]
          : new Date(skill.lastUpdated).toISOString().split('T')[0];
        
        if (!dateGroups.has(dateKey)) {
          dateGroups.set(dateKey, []);
        }
        dateGroups.get(dateKey)!.push(skill);
      });

      // Преобразуем в массив процедур
      procedures = Array.from(dateGroups.entries())
        .map(([date, skills]) => {
          const dateObj = new Date(date);
          const assessedCount = skills.length;
          const progress = totalCompetences > 0 ? Math.round((assessedCount / totalCompetences) * 100) : 0;
          
          // Получаем роль из первого навыка (все навыки в процедуре имеют одну роль)
          const role = skills[0]?.role || "самооценка";
          const period = dateObj.getFullYear().toString();
          
          // Генерируем название процедуры на основе даты и роли
          const procedureName = `Блок ИТ и ЦТ ${period}`;
          const procedureType = role === "самооценка" 
            ? "Оценка для целей развития"
            : role === "руководитель"
            ? "Оценка руководителя"
            : role === "коллега"
            ? "Оценка коллеги"
            : "Оценка подчиненного";

          return {
            id: date,
            date: dateObj,
            assessedCount,
            totalCompetences,
            progress,
            skillsCount: skills.length,
            period,
            role,
            procedureName,
            procedureType,
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }

  // Если процедур меньше 18, добавляем тестовые процедуры
  const neededCount = 18; // 3 активных + 15 архивных
  if (procedures.length < neededCount) {
    const existingDates = new Set(procedures.map(p => p.date.toISOString().split('T')[0]));
    let attempts = 0;
    let uniqueTestProcedures: typeof procedures = [];
    
    // Генерируем тестовые процедуры, пока не наберем нужное количество уникальных
    while (uniqueTestProcedures.length < neededCount - procedures.length && attempts < 50) {
      const testProcedures = generateTestProcedures(userProfile, roles, neededCount * 2);
      const unique = testProcedures.filter(p => 
        !existingDates.has(p.date.toISOString().split('T')[0])
      );
      uniqueTestProcedures = [...uniqueTestProcedures, ...unique]
        .filter((p, index, self) => 
          index === self.findIndex(t => t.date.toISOString().split('T')[0] === p.date.toISOString().split('T')[0])
        );
      attempts++;
    }
    
    procedures = [...procedures, ...uniqueTestProcedures]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, neededCount); // Ограничиваем до 18 процедур
  }

  return procedures;
}

// Виджет для отображения результатов оценочных процедур
function AssessmentResultsWidget({ 
  userProfile, 
  roles, 
  title 
}: { 
  userProfile: UserProfile | null; 
  roles: AssessmentRole[] | null;
  title: string;
}) {
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0);
  const [currentArchivedPage, setCurrentArchivedPage] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AssessmentRole | "самооценка" | null>(null);
  const isSelfAssessment = roles === null;

  const stats = useMemo(() => {
    if (!userProfile?.mainProfileId) {
      return { total: 0, assessed: 0, progress: 0 };
    }

    const profile = getProfileById(userProfile.mainProfileId);
    if (!profile) {
      return { total: 0, assessed: 0, progress: 0 };
    }

    const total = profile.requiredCompetences.length;
    const filteredSkills = userProfile.skills?.filter((skill) => {
      const skillRole = skill.role || "самооценка";
      if (roles === null) {
        return skillRole === "самооценка" || !skill.role;
      }
      return roles.includes(skillRole);
    }) || [];
    const assessed = filteredSkills.length;
    const progress = total > 0 ? Math.round((assessed / total) * 100) : 0;

    return { total, assessed, progress };
  }, [userProfile, roles]);

  // Получаем оценочные процедуры только для самооценки
  const allAssessmentProcedures = useMemo(() => {
    if (!isSelfAssessment) {
      return [];
    }
    return getAssessmentProceduresByRole(userProfile, roles);
  }, [userProfile, roles, isSelfAssessment]);

  // Фильтруем процедуры по выбранным фильтрам
  const filteredProcedures = useMemo(() => {
    let filtered = allAssessmentProcedures;
    
    if (selectedPeriod) {
      filtered = filtered.filter(p => p.period === selectedPeriod);
    }
    
    if (selectedRole) {
      filtered = filtered.filter(p => p.role === selectedRole);
    }
    
    return filtered;
  }, [allAssessmentProcedures, selectedPeriod, selectedRole]);

  // Разделяем на активные (первые 3) и архивные (следующие 15)
  const activeProcedures = useMemo(() => {
    const active = filteredProcedures.slice(0, 3);
    return active;
  }, [filteredProcedures]);

  const archivedProcedures = useMemo(() => {
    const archived = filteredProcedures.slice(3, 18); // С 3 по 18 (15 процедур)
    return archived;
  }, [filteredProcedures]);

  const hasAssessment = stats.assessed > 0 || (isSelfAssessment && allAssessmentProcedures.length > 0);
  
  // Сбрасываем индексы при изменении процедур
  useEffect(() => {
    if (activeProcedures.length > 0 && currentActiveIndex >= activeProcedures.length) {
      setCurrentActiveIndex(0);
    }
  }, [activeProcedures.length, currentActiveIndex]);

  // Сбрасываем индексы при изменении данных или фильтров
  useEffect(() => {
    setCurrentActiveIndex(0);
    setCurrentArchivedPage(0);
  }, [allAssessmentProcedures.length, selectedPeriod, selectedRole]);

  const validActiveIndex = activeProcedures.length > 0 
    ? Math.min(currentActiveIndex, activeProcedures.length - 1)
    : 0;
  const currentActiveProcedure = activeProcedures[validActiveIndex];

  // Подсчитываем процедуры со статусом "не приступил" в активных
  const notStartedCount = useMemo(() => {
    return activeProcedures.filter(p => p.progress === 0 || p.progress < 10).length;
  }, [activeProcedures]);

  return (
    <div className="space-y-4 h-full">
      {hasAssessment || (isSelfAssessment && allAssessmentProcedures.length > 0) ? (
        <>
          {/* Карусель с оценочными процедурами только для самооценки */}
          {isSelfAssessment && allAssessmentProcedures.length > 0 && (
            <div className="space-y-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Оценочные процедуры</span>
                  {(selectedPeriod || selectedRole) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setSelectedPeriod(null);
                        setSelectedRole(null);
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Сбросить фильтры
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs cursor-pointer transition-all",
                      selectedRole === "самооценка"
                        ? "ring-2 ring-primary ring-offset-1"
                        : "hover:opacity-80",
                      "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
                    )}
                    onClick={() => {
                      if (selectedRole === "самооценка") {
                        setSelectedRole(null);
                      } else {
                        setSelectedRole("самооценка");
                      }
                    }}
                  >
                    самооценка
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs cursor-pointer transition-all",
                      selectedRole === "руководитель"
                        ? "ring-2 ring-primary ring-offset-1"
                        : "hover:opacity-80",
                      "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50"
                    )}
                    onClick={() => {
                      if (selectedRole === "руководитель") {
                        setSelectedRole(null);
                      } else {
                        setSelectedRole("руководитель");
                      }
                    }}
                  >
                    руководитель
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs cursor-pointer transition-all",
                      selectedRole === "коллега"
                        ? "ring-2 ring-primary ring-offset-1"
                        : "hover:opacity-80",
                      "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50"
                    )}
                    onClick={() => {
                      if (selectedRole === "коллега") {
                        setSelectedRole(null);
                      } else {
                        setSelectedRole("коллега");
                      }
                    }}
                  >
                    коллега
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs cursor-pointer transition-all",
                      selectedRole === "подчиненный"
                        ? "ring-2 ring-primary ring-offset-1"
                        : "hover:opacity-80",
                      "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50"
                    )}
                    onClick={() => {
                      if (selectedRole === "подчиненный") {
                        setSelectedRole(null);
                      } else {
                        setSelectedRole("подчиненный");
                      }
                    }}
                  >
                    подчиненный
                  </Badge>
                </div>
              </div>

              {/* Блок Активные */}
              {activeProcedures.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Активные ({activeProcedures.length}
                      {(selectedPeriod || selectedRole) && allAssessmentProcedures.length > 0 && (
                        <span className="text-muted-foreground font-normal">
                          {" "}из {allAssessmentProcedures.slice(0, 3).length}
                        </span>
                      )}
                      )
                    </span>
                    {activeProcedures.length > 1 && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setCurrentActiveIndex((prev) => 
                              prev === 0 ? activeProcedures.length - 1 : prev - 1
                            );
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                          {validActiveIndex + 1} / {activeProcedures.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setCurrentActiveIndex((prev) => 
                              prev === activeProcedures.length - 1 ? 0 : prev + 1
                            );
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {currentActiveProcedure && (
                    <div className={cn(
                      "p-4 border rounded-lg bg-muted/30 relative",
                      (currentActiveProcedure.progress === 0 || currentActiveProcedure.progress < 10) && 
                      "border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20"
                    )}>
                      {/* Выделение для процедур со статусом "не приступил" */}
                      {(currentActiveProcedure.progress === 0 || currentActiveProcedure.progress < 10) && (
                        <div className="absolute -top-2 left-4">
                          <Badge 
                            variant="default" 
                            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md flex items-center gap-1.5 px-2.5 py-0.5"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs font-semibold">Ожидает вашего участия</span>
                          </Badge>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-6 items-start">
                        {/* Часть 1: Информация о процедуре */}
                        <div className="space-y-2">
                          {/* Первая строка: теги с периодом и ролью */}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {currentActiveProcedure.period}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                currentActiveProcedure.role === "самооценка"
                                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
                                  : currentActiveProcedure.role === "руководитель"
                                  ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50"
                                  : currentActiveProcedure.role === "коллега"
                                  ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50"
                                  : "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50"
                              )}
                            >
                              {currentActiveProcedure.role}
                            </Badge>
                          </div>
                          
                          {/* Вторая строка: название процедуры */}
                          <div className="text-sm font-semibold">
                            {currentActiveProcedure.procedureName}
                          </div>
                          
                          {/* Третья строка: тип процедуры */}
                          <div className="text-xs text-muted-foreground">
                            {currentActiveProcedure.procedureType}
                          </div>
                        </div>
                        
                        {/* Часть 2: Stepper */}
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-3">
                            {/* Шаг 1: Проведение оценки */}
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                1
                              </div>
                              <span className="text-xs text-center whitespace-nowrap">проведение оценки</span>
                            </div>
                            
                            {/* Линия между шагами */}
                            <div className="w-16 h-0.5 bg-muted"></div>
                            
                            {/* Шаг 2: Калибровка */}
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                                2
                              </div>
                              <span className="text-xs text-center whitespace-nowrap">калибровка</span>
                            </div>
                            
                            {/* Линия между шагами */}
                            <div className="w-16 h-0.5 bg-muted"></div>
                            
                            {/* Шаг 3: Результаты оценки */}
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                                3
                              </div>
                              <span className="text-xs text-center whitespace-nowrap">результаты оценки</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Часть 3: Моя оценка с тегом статуса и кнопкой */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Моя оценка:</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                currentActiveProcedure.progress === 100
                                  ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                  : currentActiveProcedure.progress === 0 || currentActiveProcedure.progress < 10
                                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
                              )}
                            >
                              {currentActiveProcedure.progress === 100 
                                ? "завершил" 
                                : currentActiveProcedure.progress === 0 || currentActiveProcedure.progress < 10
                                ? "не приступил"
                                : "в процессе"}
                            </Badge>
                          </div>
                          
                          {/* Кнопка действия */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              // TODO: Добавить логику перехода к результатам или продолжению оценки
                              if (currentActiveProcedure.progress === 100) {
                                // Переход к результатам
                                console.log("Посмотреть результаты");
                              } else if (currentActiveProcedure.progress === 0 || currentActiveProcedure.progress < 10) {
                                // Приступить к оценке
                                console.log("Приступить к оценке");
                              } else {
                                // Продолжить оценку
                                console.log("Продолжить оценку");
                              }
                            }}
                          >
                            {currentActiveProcedure.progress === 100 
                              ? "Посмотреть результаты" 
                              : currentActiveProcedure.progress === 0 || currentActiveProcedure.progress < 10
                              ? "Приступить к оценке"
                              : "Продолжить оценку"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Блок Архивные - находится под блоком Активные */}
              <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Архивные ({archivedProcedures.length}
                      {(selectedPeriod || selectedRole) && allAssessmentProcedures.length > 3 && (
                        <span className="text-muted-foreground font-normal">
                          {" "}из {allAssessmentProcedures.slice(3, 18).length}
                        </span>
                      )}
                      )
                    </span>
                    {archivedProcedures.length > 3 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            const totalPages = Math.ceil(archivedProcedures.length / 3);
                            setCurrentArchivedPage((prev) => 
                              prev === 0 ? totalPages - 1 : prev - 1
                            );
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                          {currentArchivedPage + 1} / {Math.ceil(archivedProcedures.length / 3)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            const totalPages = Math.ceil(archivedProcedures.length / 3);
                            setCurrentArchivedPage((prev) => 
                              prev === totalPages - 1 ? 0 : prev + 1
                            );
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {archivedProcedures.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {archivedProcedures.slice(currentArchivedPage * 3, currentArchivedPage * 3 + 3).map((procedure) => (
                        <div key={procedure.id} className="p-4 border rounded-lg bg-muted/30 space-y-3 relative">
                          {/* Моя оценка с тегом статуса и кнопкой - в правом верхнем углу */}
                          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Моя оценка:</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  procedure.progress === 100
                                    ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
                                )}
                              >
                                {procedure.progress === 100 ? "завершил" : "в процессе"}
                              </Badge>
                            </div>
                            
                            {/* Кнопка действия */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                // TODO: Добавить логику перехода к результатам или продолжению оценки
                                if (procedure.progress === 100) {
                                  console.log("Посмотреть результаты");
                                } else {
                                  console.log("Продолжить оценку");
                                }
                              }}
                            >
                              {procedure.progress === 100 ? "Посмотреть результаты" : "Продолжить оценку"}
                            </Button>
                          </div>
                          
                          {/* Теги с периодом и ролью */}
                          <div className="flex items-center gap-2 flex-wrap pr-32">
                            <Badge variant="outline" className="text-xs">
                              {procedure.period}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                procedure.role === "самооценка"
                                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50"
                                  : procedure.role === "руководитель"
                                  ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50"
                                  : procedure.role === "коллега"
                                  ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50"
                                  : "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50"
                              )}
                            >
                              {procedure.role}
                            </Badge>
                          </div>
                          
                          {/* Название процедуры */}
                          <div className="text-sm font-semibold line-clamp-2 pr-32">
                            {procedure.procedureName}
                          </div>
                          
                          {/* Тип процедуры */}
                          <div className="text-xs text-muted-foreground pr-32">
                            {procedure.procedureType}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg border-dashed text-center">
                      <p className="text-sm text-muted-foreground">Нет архивных процедур</p>
                    </div>
                  )}
                </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// Виджет команды
function TeamWidget() {
  // В реальном приложении здесь будет загрузка данных команды
  // Пока показываем статическую информацию
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950">
              <Users className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
            </div>
            <CardTitle className="text-lg">Моя команда</CardTitle>
          </div>
          <Link href="/team">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Информация о вашей команде
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 border rounded-lg border-dashed text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Просмотр информации о команде
          </p>
          <Link href="/team">
            <Button variant="outline" size="sm">
              Открыть команду
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Виджет карьерных треков
function CareerTracksWidget({ userProfile }: { userProfile: UserProfile | null }) {
  const tracks = getCareerTracks();
  const userTrack = userProfile?.mainProfileId 
    ? tracks.find(t => t.profileId === userProfile.mainProfileId)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-950">
              <Target className="h-4 w-4 text-pink-700 dark:text-pink-300" />
            </div>
            <CardTitle className="text-lg">Карьерные треки</CardTitle>
          </div>
          <Link href="/reference/career-tracks">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Справочник карьерных треков
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 border rounded-lg bg-muted/30">
          <div className="text-2xl font-bold">{tracks.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Всего карьерных треков
          </div>
        </div>
        {userTrack && (
          <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">Ваш трек</Badge>
              <span className="text-sm font-semibold">{userTrack.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {userTrack.description}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Уровней: {userTrack.levels.length}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileWidgets({ userProfile }: ProfileWidgetsProps) {
  return (
    <div className="w-full space-y-4">
      {/* Вертикальное расположение: Самооценка сверху, затем Руководитель / Коллега / Подчиненный */}
      <div className="space-y-4 w-full">
        {/* Самооценка */}
        <AssessmentResultsWidget 
          userProfile={userProfile} 
          roles={null} 
          title="Самооценка"
        />
        
        {/* Руководитель, коллега, подчиненный */}
        <AssessmentResultsWidget 
          userProfile={userProfile} 
          roles={["руководитель", "коллега", "подчиненный"]} 
          title="Руководитель / Коллега / Подчиненный"
        />
      </div>
    </div>
  );
}
