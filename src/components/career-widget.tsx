"use client";

import { useMemo } from "react";
import { getCareerTracks } from "@/lib/data";
import { getUserCareerTrackProgress, calculateCareerTrackProgress } from "@/lib/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/types";

interface CareerWidgetProps {
  userProfile: UserProfile | null;
}

export function CareerWidget({ userProfile }: CareerWidgetProps) {
  const careerData = useMemo(() => {
    if (!userProfile?.mainProfileId || !userProfile.skills || userProfile.skills.length === 0) {
      return null;
    }

    const progress = getUserCareerTrackProgress(userProfile);
    if (!progress) return null;

    const tracks = getCareerTracks();
    const track = tracks.find((t) => t.id === progress.careerTrackId) || 
                  tracks.find((t) => t.profileId === userProfile.mainProfileId);

    if (!track) return null;

    // Пересчитываем прогресс на основе самооценки
    const actualProgress = calculateCareerTrackProgress(userProfile, track);

    // Получаем текущий уровень
    const currentLevel = actualProgress.currentLevel > 0 
      ? track.levels.find((l) => l.level === actualProgress.currentLevel)
      : null;
    
    const firstLevel = track.levels.length > 0 ? track.levels[0] : null;
    
    // Определяем целевой уровень
    const targetLevel = (() => {
      if (actualProgress.currentLevel === 0 && firstLevel) {
        return firstLevel;
      }
      
      const userSkillsMap: Record<string, number> = {};
      userProfile.skills.forEach((skill) => {
        userSkillsMap[skill.competenceId] = skill.selfAssessment;
      });

      let bestTargetLevel = null;
      let bestMatchPercentage = 0;

      for (const level of track.levels) {
        if (level.level <= actualProgress.currentLevel) continue;

        let levelMatch = 0;
        let totalRequired = 0;

        for (const [competenceId, requiredLevel] of Object.entries(level.requiredSkills)) {
          const userLevel = userSkillsMap[competenceId] || 0;
          levelMatch += Math.min(userLevel, requiredLevel);
          totalRequired += requiredLevel;
        }

        const matchPercentage = totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;

        if (matchPercentage > bestMatchPercentage) {
          bestMatchPercentage = matchPercentage;
          bestTargetLevel = level;
        }
      }

      return bestTargetLevel || track.levels.find((l) => l.level === actualProgress.currentLevel + 1);
    })();

    // Вычисляем пробелы для целевого уровня
    const targetLevelGaps = targetLevel ? (() => {
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

    // Вычисляем прогресс к целевому уровню
    const targetLevelProgress = targetLevel ? (() => {
      const totalSkills = Object.keys(targetLevel.requiredSkills).length;
      const closedSkills = totalSkills - targetLevelGaps.length;
      
      return totalSkills > 0 ? Math.round((closedSkills / totalSkills) * 100) : 0;
    })() : 0;

    return {
      currentLevel,
      targetLevel,
      targetLevelProgress,
      targetLevelGaps,
      trackName: track.name,
      totalLevels: track.levels.length,
    };
  }, [userProfile]);

  if (!userProfile?.mainProfileId) {
    return (
      <div className="p-4 border rounded-lg border-dashed text-center">
        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Выберите основной профиль, чтобы увидеть карьерный прогресс
        </p>
        <Link href="/services/career">
          <Button variant="outline" size="sm">
            Выбрать профиль
          </Button>
        </Link>
      </div>
    );
  }

  if (!userProfile.skills || userProfile.skills.length === 0) {
    return (
      <div className="p-4 border rounded-lg border-dashed text-center">
        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Пройдите самооценку компетенций и получите верификацию руководителя, чтобы увидеть карьерный прогресс
        </p>
        <Link href="/services/career">
          <Button variant="outline" size="sm">
            Пройти самооценку
          </Button>
        </Link>
      </div>
    );
  }

  if (!careerData) {
    return (
      <div className="p-4 border rounded-lg border-dashed text-center">
        <p className="text-sm text-muted-foreground">
          Карьерный трек не найден для выбранного профиля
        </p>
      </div>
    );
  }

  const { currentLevel, targetLevel, targetLevelProgress, targetLevelGaps, trackName, totalLevels } = careerData;

  return (
    <div className="space-y-4">
        {/* Название трека */}
        <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">Трек</Badge>
            <span className="text-sm font-semibold">{trackName}</span>
          </div>
        </div>

        {/* Текущий и целевой уровни */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-semibold">Текущий уровень</span>
            </div>
            {currentLevel ? (
              <div>
                <p className="text-sm font-medium">{currentLevel.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {currentLevel.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Еще не достигнут первый уровень
              </p>
            )}
          </div>

          <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">Целевой уровень</span>
            </div>
            {targetLevel ? (
              <div>
                <p className="text-sm font-medium">{targetLevel.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {targetLevel.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Достигнут максимальный уровень
              </p>
            )}
          </div>
        </div>

        {/* Прогресс к целевому уровню */}
        {targetLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Прогресс к целевому уровню</span>
              <span className="text-xs text-muted-foreground">{targetLevelProgress}%</span>
            </div>
            <Progress value={targetLevelProgress} className="h-2" />
          </div>
        )}

        {/* Пробелы в компетенциях */}
        {targetLevelGaps.length > 0 ? (
          <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold">Области для развития</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {targetLevelGaps.length} компетенций требуют развития
            </p>
          </div>
        ) : targetLevel ? (
          <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold">Все компетенции развиты</p>
            </div>
          </div>
        ) : null}

      {/* Горизонтальная черта с информацией о треке */}
      <div className="pt-2 mt-2 border-t">
        <div className="text-xs text-muted-foreground">
          Уровней в треке: <span className="font-semibold">{totalLevels}</span>
        </div>
      </div>
    </div>
  );
}

