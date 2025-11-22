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
  ClipboardCheck, 
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { 
  getProfiles, 
  getCareerTracks, 
  getProfileById, 
  getCareerTrackByProfileId,
  updateProfileWithAssessmentData,
  getUserProfile,
  saveUserProfile
} from "@/lib/data";
import { getUserCareerTrackProgress } from "@/lib/calculations";
import type { UserProfile } from "@/types";

interface ProfileWidgetsProps {
  userProfile: UserProfile | null;
}

// Виджет профилей
function ProfilesWidget({ userProfile }: { userProfile: UserProfile | null }) {
  const profiles = getProfiles();
  const mainProfile = userProfile?.mainProfileId ? getProfileById(userProfile.mainProfileId) : null;
  const additionalProfiles = (userProfile?.additionalProfileIds || [])
    .map(id => getProfileById(id))
    .filter(Boolean);

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

// Виджет самооценки
function SelfAssessmentWidget({ userProfile, onProfileUpdate }: { userProfile: UserProfile | null; onProfileUpdate?: () => void }) {
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const stats = useMemo(() => {
    if (!userProfile?.mainProfileId) {
      return { total: 0, assessed: 0, progress: 0 };
    }

    const profile = getProfileById(userProfile.mainProfileId);
    if (!profile) {
      return { total: 0, assessed: 0, progress: 0 };
    }

    const total = profile.requiredCompetences.length;
    const assessed = userProfile.skills?.length || 0;
    const progress = total > 0 ? Math.round((assessed / total) * 100) : 0;

    return { total, assessed, progress };
  }, [userProfile]);

  // Получаем последние оценочные процедуры на основе дат обновления навыков
  const assessmentProcedures = useMemo(() => {
    if (!userProfile?.skills || userProfile.skills.length === 0) {
      return [];
    }

    // Группируем навыки по дате обновления
    const dateGroups = new Map<string, typeof userProfile.skills>();
    
    userProfile.skills.forEach((skill) => {
      const dateKey = skill.lastUpdated instanceof Date 
        ? skill.lastUpdated.toISOString().split('T')[0]
        : new Date(skill.lastUpdated).toISOString().split('T')[0];
      
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(skill);
    });

    // Преобразуем в массив процедур и сортируем по дате (новые первыми)
    const procedures = Array.from(dateGroups.entries())
      .map(([date, skills]) => {
        const dateObj = new Date(date);
        const profile = userProfile.mainProfileId ? getProfileById(userProfile.mainProfileId) : null;
        const totalCompetences = profile?.requiredCompetences.length || 0;
        const assessedCount = skills.length;
        const progress = totalCompetences > 0 ? Math.round((assessedCount / totalCompetences) * 100) : 0;

        return {
          id: date,
          date: dateObj,
          assessedCount,
          totalCompetences,
          progress,
          skillsCount: skills.length,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3); // Берем только 3 последние

    return procedures;
  }, [userProfile]);

  const hasAssessment = stats.assessed > 0;
  
  // Сбрасываем индекс при изменении процедур
  useEffect(() => {
    if (assessmentProcedures.length > 0 && currentAssessmentIndex >= assessmentProcedures.length) {
      setCurrentAssessmentIndex(0);
    }
  }, [assessmentProcedures.length, currentAssessmentIndex]);

  const validIndex = assessmentProcedures.length > 0 
    ? Math.min(currentAssessmentIndex, assessmentProcedures.length - 1)
    : 0;
  const currentProcedure = assessmentProcedures[validIndex];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleUpdateAssessmentData = () => {
    setIsUpdating(true);
    const result = updateProfileWithAssessmentData();
    if (result.success) {
      // Обновляем профиль в родительском компоненте
      if (onProfileUpdate) {
        onProfileUpdate();
      } else {
        // Перезагружаем страницу для обновления данных
        window.location.reload();
      }
    } else {
      alert(`Ошибка: ${result.error}`);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
        {hasAssessment ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Прогресс заполнения</span>
                <span className="text-sm text-muted-foreground">
                  {stats.assessed} / {stats.total}
                </span>
              </div>
              <Progress value={stats.progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {stats.progress}% компетенций оценено
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold">Оценка пройдена</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateAssessmentData}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  {isUpdating ? "Обновление..." : "Обновить данные"}
                </Button>
              </div>
            </div>

            {/* Карусель с последними оценочными процедурами */}
            {assessmentProcedures.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Последние оценочные процедуры</span>
                  </div>
                  {assessmentProcedures.length > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setCurrentAssessmentIndex((prev) => 
                            prev === 0 ? assessmentProcedures.length - 1 : prev - 1
                          );
                        }}
                        disabled={assessmentProcedures.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                        {validIndex + 1} / {assessmentProcedures.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setCurrentAssessmentIndex((prev) => 
                            prev === assessmentProcedures.length - 1 ? 0 : prev + 1
                          );
                        }}
                        disabled={assessmentProcedures.length <= 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {currentProcedure ? formatDate(currentProcedure.date) : ''}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {currentProcedure?.assessedCount || 0} компетенций
                    </Badge>
                  </div>
                  
                  {currentProcedure && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Прогресс оценки</span>
                          <span className="font-semibold">{currentProcedure.progress}%</span>
                        </div>
                        <Progress value={currentProcedure.progress} className="h-1.5" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Оценено: </span>
                          <span className="font-semibold">{currentProcedure.assessedCount}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Всего: </span>
                          <span className="font-semibold">{currentProcedure.totalCompetences}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 border rounded-lg border-dashed text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Оценка еще не пройдена
            </p>
            <Link href="/services/career">
              <Button variant="outline" size="sm">
                Пройти оценку
              </Button>
            </Link>
          </div>
        )}
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

export function ProfileWidgets({ userProfile, onProfileUpdate }: ProfileWidgetsProps & { onProfileUpdate?: () => void }) {
  return (
    <div className="w-full">
      <SelfAssessmentWidget userProfile={userProfile} onProfileUpdate={onProfileUpdate} />
    </div>
  );
}

