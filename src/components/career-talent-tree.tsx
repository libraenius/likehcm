"use client";

import { useMemo } from "react";
import type { CareerTrack, CareerTrackLevel, CareerTrackProgress } from "@/types";
import { getCompetenceById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerTalentTreeProps {
  careerTrack: CareerTrack;
  progress?: CareerTrackProgress | null;
  userSkills?: Record<string, number>;
}

interface TalentNodeProps {
  level: CareerTrackLevel;
  isUnlocked: boolean;
  isCurrent: boolean;
  matchPercentage: number;
  isLast: boolean;
  lineHeight?: number;
}

// Константы
const STEP_SPACING = 100;
const NODE_SIZE = "w-6 h-6";
const NODE_ICON_SIZE = "h-3.5 w-3.5";
const LINE_WIDTH = "w-[2px]";

// Компонент для отображения узла
function StepperNode({ 
  isUnlocked, 
  isCurrent 
}: { 
  isUnlocked: boolean; 
  isCurrent: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 transition-all duration-300 flex-shrink-0",
        NODE_SIZE,
        isUnlocked
          ? "bg-primary border-primary"
          : isCurrent
          ? "bg-primary/10 border-primary ring-2 ring-primary ring-offset-1"
          : "bg-background border-border"
      )}
    >
      {isUnlocked ? (
        <CheckCircle2 className={cn(NODE_ICON_SIZE, "text-primary-foreground")} />
      ) : (
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            isCurrent ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
      )}
    </div>
  );
}

// Компонент для отображения компетенций
function CompetenceBadges({
  competences,
  isUnlocked,
  type,
}: {
  competences: Array<{ competence: ReturnType<typeof getCompetenceById>; requiredLevel: number }>;
  isUnlocked: boolean;
  type: "professional" | "corporate";
}) {
  if (competences.length === 0) return null;

  const label = type === "professional" ? "Профессиональные:" : "Корпоративные:";
  const unlockedStyles =
    type === "professional"
      ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
      : "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800";
  const lockedStyles = "bg-muted/50 border-muted-foreground/30 opacity-60";

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {competences.map(({ competence, requiredLevel }) => (
          <Badge
            key={competence?.id}
            variant="outline"
            className={cn("text-xs px-1.5 py-0.5 h-5", isUnlocked ? unlockedStyles : lockedStyles)}
          >
            {competence?.name || "?"} <span className="font-semibold ml-0.5">{requiredLevel}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}

function TalentNode({
  level,
  isUnlocked,
  isCurrent,
  matchPercentage,
  isLast,
  lineHeight = STEP_SPACING,
}: TalentNodeProps) {
  // Получаем и разделяем компетенции
  const competences = useMemo(() => {
    return Object.entries(level.requiredSkills).map(([id, reqLevel]) => ({
      competence: getCompetenceById(id),
      requiredLevel: reqLevel,
    }));
  }, [level.requiredSkills]);

  const professional = useMemo(
    () =>
      competences.filter(
        (item) => item.competence?.type === "профессиональные компетенции"
      ),
    [competences]
  );

  const corporate = useMemo(
    () =>
      competences.filter(
        (item) => item.competence?.type === "корпоративные компетенции"
      ),
    [competences]
  );

  return (
    <div className="relative flex items-start gap-3 w-full" data-card-level={level.level}>
      {/* Левая часть - узел и линии */}
      <div className="flex flex-col items-center flex-shrink-0 relative w-6">
        {/* Линия начинается из центра узла и идет до начала следующего узла */}
        {!isLast && (
          <div
            className={cn(
              LINE_WIDTH,
              "absolute pointer-events-none",
              isUnlocked ? "bg-primary" : "bg-border"
            )}
            style={{ 
              top: "12px", // Центр текущего узла (половина высоты узла 24px / 2 = 12px)
              bottom: "-12px", // До центра следующего узла (отрицательное значение для растягивания вниз)
              left: "11px", // Центр узла по горизонтали (12px - 1px половина ширины линии 2px)
            }}
          />
        )}
        {/* Узел поверх линии */}
        <div className="relative z-10">
          <StepperNode isUnlocked={isUnlocked} isCurrent={isCurrent} />
        </div>
      </div>

      {/* Правая часть - контент */}
      <div className={cn("flex-1 min-w-0", !isLast && "pb-0")}>
        {/* Заголовок уровня */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "font-semibold text-sm",
              isCurrent
                ? "text-primary"
                : isUnlocked
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {level.name}
          </span>
          {isCurrent && (
            <Badge variant="default" className="h-4 px-1.5 text-xs">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              Текущий
            </Badge>
          )}
        </div>

        {/* Описание */}
        {level.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {level.description}
          </p>
        )}

        {/* Прогресс */}
        {matchPercentage > 0 && (
          <>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span
                className={cn(
                  "text-muted-foreground",
                  isUnlocked && "text-primary font-medium"
                )}
              >
                {matchPercentage}%
              </span>
            </div>
            <Progress
              value={matchPercentage}
              className={cn("h-1 mt-1", isUnlocked && "opacity-70")}
            />
          </>
        )}

        {/* Компетенции */}
        <CompetenceBadges
          competences={professional}
          isUnlocked={isUnlocked}
          type="professional"
        />
        <CompetenceBadges
          competences={corporate}
          isUnlocked={isUnlocked}
          type="corporate"
        />
      </div>
    </div>
  );
}

export function CareerTalentTree({
  careerTrack,
  progress,
  userSkills = {},
}: CareerTalentTreeProps) {
  // Вычисляем прогресс для каждого уровня
  const levelsWithProgress = useMemo(() => {
    const hasUserData = userSkills && Object.keys(userSkills).length > 0;
    const progressMap = new Map<
      number,
      {
        level: CareerTrackLevel;
        matchPercentage: number;
        isUnlocked: boolean;
        isCurrent: boolean;
      }
    >();

    careerTrack.levels.forEach((level) => {
      let levelMatch = 0;
      let totalRequired = 0;

      if (hasUserData) {
        for (const [competenceId, requiredLevel] of Object.entries(
          level.requiredSkills
        )) {
          const userLevel = userSkills[competenceId] || 0;
          levelMatch += Math.min(userLevel, requiredLevel);
          totalRequired += requiredLevel;
        }
      } else {
        totalRequired = Object.values(level.requiredSkills).reduce(
          (sum, level) => sum + level,
          0
        );
      }

      const matchPercentage =
        totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;
      const isUnlocked = hasUserData
        ? matchPercentage >= level.minMatchPercentage
        : false;
      const isCurrent =
        hasUserData && progress
          ? progress.currentLevel === level.level
          : false;

      progressMap.set(level.level, {
        level,
        matchPercentage,
        isUnlocked,
        isCurrent,
      });
    });

    return progressMap;
  }, [careerTrack.levels, userSkills, progress]);

  // Сортируем уровни от минимального к максимальному
  const sortedLevels = useMemo(() => {
    return [...careerTrack.levels].sort((a, b) => a.level - b.level);
  }, [careerTrack.levels]);

  return (
    <div className="w-full max-w-full relative">
      <div className="relative mx-auto flex flex-col w-full">
        {sortedLevels.map((level, index) => {
          const progressData = levelsWithProgress.get(level.level);
          if (!progressData) return null;

          return (
            <TalentNode
              key={level.level}
              level={level}
              isUnlocked={progressData.isUnlocked}
              isCurrent={progressData.isCurrent}
              matchPercentage={progressData.matchPercentage}
              isLast={index === sortedLevels.length - 1}
              lineHeight={STEP_SPACING}
            />
          );
        })}
      </div>
    </div>
  );
}
