"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCareerTracks, getProfileById, getCompetenceById } from "@/lib/data";
import { CareerTalentTree } from "@/components/career-talent-tree";
import { calculateCareerTrackProgress } from "@/lib/calculations";
import { Target, TrendingUp, BookOpen, Users, CheckCircle2, AlertCircle, Video, GraduationCap } from "lucide-react";
import { useMemo } from "react";
import type { CareerTrackProgress, UserProfile } from "@/types";

interface CareerTrackProgressProps {
  progress: CareerTrackProgress;
  userProfile?: UserProfile;
}

export function CareerTrackProgress({ progress, userProfile }: CareerTrackProgressProps) {
  const tracks = getCareerTracks();
  // Находим трек по ID или по profileId
  let track = tracks.find((t) => t.id === progress.careerTrackId);
  
  // Если трек не найден по ID, пытаемся найти по profileId из userProfile
  if (!track && userProfile?.mainProfileId) {
    track = tracks.find((t) => t.profileId === userProfile.mainProfileId);
  }

  if (!track) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Карьерный трек не найден</p>
        </CardContent>
      </Card>
    );
  }

  // Получаем навыки пользователя для дерева талантов
  const userSkills = userProfile?.skills ? userProfile.skills.reduce((acc, skill) => {
    acc[skill.competenceId] = skill.selfAssessment;
    return acc;
  }, {} as Record<string, number>) : {};

  // Пересчитываем прогресс на основе самооценки, если она доступна
  const actualProgress = useMemo(() => {
    if (userProfile && userProfile.skills && userProfile.skills.length > 0) {
      return calculateCareerTrackProgress(userProfile, track);
    }
    return progress;
  }, [userProfile, track, progress]);

  // Получаем текущий уровень
  // Если currentLevel === 0, это означает, что пользователь не достиг даже первого уровня
  const currentLevel = actualProgress.currentLevel > 0 
    ? track.levels.find((l) => l.level === actualProgress.currentLevel)
    : null;
  
  // Если пользователь не достиг первого уровня, первый уровень становится целевым
  const firstLevel = track.levels.length > 0 ? track.levels[0] : null;
  
  // Определяем целевой уровень на основе самооценки
  // Вычисляем соответствие для всех уровней после текущего
  const targetLevel = (() => {
    // Если пользователь не достиг первого уровня, первый уровень - это целевой
    if (actualProgress.currentLevel === 0 && firstLevel) {
      return firstLevel;
    }
    
    if (!userProfile?.skills || userProfile.skills.length === 0) {
      // Если нет самооценки, берем следующий уровень после текущего
      return track.levels.find((l) => l.level === actualProgress.currentLevel + 1);
    }

    const userSkillsMap: Record<string, number> = {};
    userProfile.skills.forEach((skill) => {
      userSkillsMap[skill.competenceId] = skill.selfAssessment;
    });

    // Ищем уровень после текущего с наибольшим соответствием
    let bestTargetLevel = null;
    let bestMatchPercentage = 0;

    // Проверяем все уровни после текущего
    for (const level of track.levels) {
      if (level.level <= actualProgress.currentLevel) continue;

      let levelMatch = 0;
      let totalRequired = 0;

      // Вычисляем соответствие для этого уровня
      for (const [competenceId, requiredLevel] of Object.entries(level.requiredSkills)) {
        const userLevel = userSkillsMap[competenceId] || 0;
        levelMatch += Math.min(userLevel, requiredLevel);
        totalRequired += requiredLevel;
      }

      const matchPercentage = totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;

      // Выбираем уровень с наибольшим соответствием
      if (matchPercentage > bestMatchPercentage) {
        bestMatchPercentage = matchPercentage;
        bestTargetLevel = level;
      }
    }

    // Если не нашли подходящий уровень, берем следующий после текущего
    return bestTargetLevel || track.levels.find((l) => l.level === actualProgress.currentLevel + 1);
  })();

  // Вычисляем пробелы для целевого уровня на основе самооценки
  const targetLevelGaps = targetLevel ? (() => {
    if (!userProfile?.skills || userProfile.skills.length === 0) {
      return progress.skillGaps; // Используем существующие пробелы
    }

    const userSkillsMap: Record<string, number> = {};
    userProfile.skills.forEach((skill) => {
      userSkillsMap[skill.competenceId] = skill.selfAssessment;
    });

    const gaps: Array<{
      competenceId: string;
      currentLevel: number;
      requiredLevel: number;
      gap: number;
    }> = [];
    
    for (const [competenceId, requiredLevel] of Object.entries(targetLevel.requiredSkills)) {
      const userLevel = userSkillsMap[competenceId] || 0;
      const gap = Math.max(0, requiredLevel - userLevel);

      if (gap > 0) {
        gaps.push({
          competenceId,
          currentLevel: userLevel,
          requiredLevel: requiredLevel,
          gap,
        });
      }
    }

    return gaps;
  })() : [];

  // Разделяем пробелы на профессиональные и корпоративные
  const professionalGaps = targetLevelGaps.filter((gap) => {
    const comp = getCompetenceById(gap.competenceId);
    return comp && comp.type === "профессиональные компетенции";
  });
  const corporateGaps = targetLevelGaps.filter((gap) => {
    const comp = getCompetenceById(gap.competenceId);
    return comp && comp.type === "корпоративные компетенции";
  });

  // Вычисляем прогресс к целевому уровню на основе самооценки
  const targetLevelProgress = targetLevel ? (() => {
    const totalSkills = Object.keys(targetLevel.requiredSkills).length;
    const closedSkills = totalSkills - targetLevelGaps.length;
    
    return totalSkills > 0 ? Math.round((closedSkills / totalSkills) * 100) : 0;
  })() : 0;

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Card>
        <CardHeader>
          <CardTitle>Дерево развития талантов</CardTitle>
          <CardDescription>
            Визуализация вашего карьерного пути. Разблокируйте уровни, развивая необходимые компетенции.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-hidden pb-16">
          <div className="overflow-x-hidden">
            <CareerTalentTree
              careerTrack={track}
              progress={actualProgress}
              userSkills={userSkills}
            />
          </div>
        </CardContent>
      </Card>

      {/* Блок ИПР */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Индивидуальный План Развития (ИПР)</CardTitle>
          </div>
          <CardDescription>
            Автоматически сформированный план развития на основе вашего текущего уровня и карьерных целей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Текущий и целевой уровни */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold">Текущий уровень</span>
              </div>
              {currentLevel ? (
                <div>
                  <p className="font-medium">{currentLevel.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{currentLevel.description}</p>
                </div>
              ) : actualProgress.currentLevel === 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Вы еще не достигли первого уровня. Развивайте компетенции для достижения первого уровня.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Уровень не определен</p>
              )}
            </div>

            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Целевой уровень</span>
              </div>
              {targetLevel ? (
                <div>
                  <p className="font-medium">{targetLevel.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{targetLevel.description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Вы достигли максимального уровня</p>
              )}
            </div>
          </div>

          {/* Пробелы в компетенциях */}
          {targetLevelGaps.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold">Области для развития</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Для перехода на следующий уровень необходимо развить следующие компетенции:
              </p>

              {/* Список компетенций в 2 столбца */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Профессиональные компетенции */}
                {professionalGaps.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      <h4 className="text-sm font-semibold">Профессиональные компетенции</h4>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                        {professionalGaps.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                    {professionalGaps.map((gap) => {
                      const comp = getCompetenceById(gap.competenceId);
                      if (!comp) return null;
                      
                      return (
                        <div
                          key={gap.competenceId}
                          className="p-3 border rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{comp.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Текущий:</span>
                              <Badge variant="secondary" className="text-xs">
                                {gap.currentLevel || 0}
                              </Badge>
                            </div>
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Требуется:</span>
                              <Badge variant="default" className="text-xs">
                                {gap.requiredLevel}
                              </Badge>
                            </div>
                            <div className="flex-1 flex justify-end">
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                                Не хватает: {gap.gap}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Рекомендуемые ресурсы для требуемого уровня */}
                          {comp.resources && (() => {
                            const requiredLevel = gap.requiredLevel;
                            const levelNames = ["", "Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                            
                            // Фильтруем ресурсы по требуемому уровню
                            const literature = comp.resources.literature?.filter(r => r.level === requiredLevel) || [];
                            const videos = comp.resources.videos?.filter(r => r.level === requiredLevel) || [];
                            const courses = comp.resources.courses?.filter(r => r.level === requiredLevel) || [];
                            
                            if (literature.length === 0 && videos.length === 0 && courses.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800 space-y-3">
                                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                  Рекомендуемые материалы для уровня {requiredLevel} ({levelNames[requiredLevel]}):
                                </p>
                                
                                {/* Литература */}
                                {literature.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Литература</span>
                                    </div>
                                    <ul className="space-y-1 ml-6">
                                      {literature.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground list-disc">
                                          {item.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Видео */}
                                {videos.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Video className="h-3.5 w-3.5 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Видео</span>
                                    </div>
                                    <ul className="space-y-1 ml-6">
                                      {videos.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground list-disc">
                                          {item.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Курсы */}
                                {courses.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Курсы</span>
                                    </div>
                                    <ul className="space-y-1 ml-6">
                                      {courses.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground list-disc">
                                          {item.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                    </div>
                  </div>
                )}

                {/* Корпоративные компетенции */}
                {corporateGaps.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                      <h4 className="text-sm font-semibold">Корпоративные компетенции</h4>
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                        {corporateGaps.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                    {corporateGaps.map((gap) => {
                      const comp = getCompetenceById(gap.competenceId);
                      if (!comp) return null;
                      
                      return (
                        <div
                          key={gap.competenceId}
                          className="p-3 border rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{comp.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Текущий:</span>
                              <Badge variant="secondary" className="text-xs">
                                {gap.currentLevel || 0}
                              </Badge>
                            </div>
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Требуется:</span>
                              <Badge variant="default" className="text-xs">
                                {gap.requiredLevel}
                              </Badge>
                            </div>
                            <div className="flex-1 flex justify-end">
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                                Не хватает: {gap.gap}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Рекомендуемые ресурсы для требуемого уровня */}
                          {comp.resources && (() => {
                            const requiredLevel = gap.requiredLevel;
                            const levelNames = ["", "Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                            
                            // Фильтруем ресурсы по требуемому уровню
                            const literature = comp.resources.literature?.filter(r => r.level === requiredLevel) || [];
                            const videos = comp.resources.videos?.filter(r => r.level === requiredLevel) || [];
                            const courses = comp.resources.courses?.filter(r => r.level === requiredLevel) || [];
                            
                            if (literature.length === 0 && videos.length === 0 && courses.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div className="mt-4 pt-4 border-t border-cyan-200 dark:border-cyan-800 space-y-3">
                                <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                                  Рекомендуемые материалы для уровня {requiredLevel} ({levelNames[requiredLevel]}):
                                </p>
                                
                                {/* Литература */}
                                {literature.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="h-3.5 w-3.5 text-cyan-600" />
                                      <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Литература</span>
                                    </div>
                                    <ul className="space-y-1 ml-6">
                                      {literature.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground list-disc">
                                          {item.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Видео */}
                                {videos.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Video className="h-3.5 w-3.5 text-cyan-600" />
                                      <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Видео</span>
                                    </div>
                                    <ul className="space-y-1 ml-6">
                                      {videos.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground list-disc">
                                          {item.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Курсы */}
                                {courses.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="h-3.5 w-3.5 text-cyan-600" />
                                      <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Курсы</span>
                                    </div>
                                    <ul className="space-y-1 ml-6">
                                      {courses.map((item, idx) => (
                                        <li key={idx} className="text-xs text-muted-foreground list-disc">
                                          {item.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Все компетенции развиты</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {targetLevel 
                      ? "Вы готовы к переходу на целевой уровень" 
                      : "Вы достигли максимального уровня в карьерном треке"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

