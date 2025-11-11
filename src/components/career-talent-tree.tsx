"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import type { CareerTrack, CareerTrackLevel, CareerTrackProgress } from "@/types";
import { getCompetenceById } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Lock, TrendingUp } from "lucide-react";
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
  position: { x: number; y: number };
  isLast: boolean;
}

function TalentNode({ level, isUnlocked, isCurrent, matchPercentage, position, isLast }: TalentNodeProps) {
  const competences = Object.entries(level.requiredSkills).map(([id, reqLevel]) => ({
    competence: getCompetenceById(id),
    requiredLevel: reqLevel,
  }));

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Линия соединения к следующему узлу - теперь рисуется в SVG */}

      {/* Узел таланта */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-300 cursor-pointer",
              isUnlocked
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 hover:scale-110 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                : "border-muted-foreground/30 bg-muted/50 cursor-not-allowed",
              isCurrent && "ring-4 ring-primary/50 ring-offset-2 animate-pulse"
            )}
            disabled={!isUnlocked}
          >
            {isUnlocked ? (
              <CheckCircle2 className="h-10 w-10 text-primary animate-in zoom-in-50 duration-300" />
            ) : (
              <Lock className="h-8 w-8 text-muted-foreground" />
            )}
            
            {/* Индикатор уровня */}
            <div
              className={cn(
                "absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 text-xs font-bold",
                isUnlocked
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground"
              )}
            >
              {level.level}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold">{level.name}</h4>
              <p className="text-xs text-muted-foreground">{level.description}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs font-medium mb-1">Требуемые навыки:</p>
              <div className="space-y-1">
                {competences.map(({ competence, requiredLevel }) => (
                  <div key={competence?.id} className="flex items-center justify-between text-xs">
                    <span>{competence?.name || "Неизвестно"}</span>
                    <Badge variant="outline" className="ml-2">
                      Ур. {requiredLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <span>Соответствие:</span>
                <span className="font-semibold">{matchPercentage}%</span>
              </div>
              <Progress value={matchPercentage} className="mt-1 h-1.5" />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Карточка с информацией под узлом */}
      <Card
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-6 w-56 border-2 transition-all duration-300 hover:shadow-lg",
          isUnlocked
            ? "border-primary/50 bg-primary/5 shadow-md hover:border-primary/70"
            : "border-muted bg-muted/30 opacity-75",
          isCurrent && "ring-2 ring-primary shadow-lg"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold leading-tight">
                {level.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {level.description}
              </CardDescription>
            </div>
            {isCurrent && (
              <Badge variant="default" className="ml-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                Текущий
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Прогресс */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Соответствие</span>
              <span className="font-semibold">{matchPercentage}%</span>
            </div>
            <Progress value={matchPercentage} className="h-2" />
          </div>

          {/* Требуемые навыки */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Навыки:</p>
            <div className="flex flex-wrap gap-1">
              {competences.slice(0, 3).map(({ competence, requiredLevel }) => (
                <Badge
                  key={competence?.id}
                  variant={isUnlocked ? "default" : "outline"}
                  className="text-xs"
                >
                  {competence?.name || "?"} {requiredLevel}
                </Badge>
              ))}
              {competences.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{competences.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Минимальное соответствие */}
          <div className="flex items-center justify-between text-xs pt-1 border-t">
            <span className="text-muted-foreground">Минимум:</span>
            <Badge variant="secondary">{level.minMatchPercentage}%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CareerTalentTree({ careerTrack, progress, userSkills = {} }: CareerTalentTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // Используем ResizeObserver для более точного отслеживания
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    // Также обновляем при изменении размера окна
    window.addEventListener('resize', updateWidth);
    updateWidth(); // Начальное обновление

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Вычисляем прогресс для каждого уровня
  const levelsWithProgress = useMemo(() => {
    return careerTrack.levels.map((level) => {
      let levelMatch = 0;
      let totalRequired = 0;

      for (const [competenceId, requiredLevel] of Object.entries(level.requiredSkills)) {
        const userLevel = userSkills[competenceId] || 0;
        levelMatch += Math.min(userLevel, requiredLevel);
        totalRequired += requiredLevel;
      }

      const matchPercentage = totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;
      const isUnlocked = matchPercentage >= level.minMatchPercentage;
      const isCurrent = progress?.currentLevel === level.level;

      return {
        level,
        matchPercentage,
        isUnlocked,
        isCurrent,
      };
    });
  }, [careerTrack.levels, userSkills, progress]);

  // Позиционирование узлов (горизонтальное дерево)
  const nodePositions = useMemo(() => {
    const numLevels = careerTrack.levels.length;
    // Используем процентное позиционирование для адаптивности
    const startPercent = 8; // Начальная позиция слева в процентах
    const endPercent = 92; // Конечная позиция справа в процентах
    
    // Вычисляем spacing динамически, чтобы все узлы равномерно распределились
    const spacing = numLevels > 1 ? (endPercent - startPercent) / (numLevels - 1) : 50;
    
    return careerTrack.levels.map((level, index) => ({
      x: startPercent + index * spacing,
      y: 100, // Центр по вертикали в пикселях
    }));
  }, [careerTrack.levels.length]);

  const containerHeight = 500; // Фиксированная высота для горизонтального дерева

  return (
    <div className="w-full overflow-x-visible overflow-y-visible">
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{
          width: "100%",
          maxWidth: "100%",
          minHeight: `${containerHeight}px`,
          padding: "20px 0",
        }}
      >
        {/* Фоновые линии соединения */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: `${containerHeight}px` }}
        >
          {nodePositions.map((pos, index) => {
            if (index === nodePositions.length - 1) return null;
            const nextPos = nodePositions[index + 1];
            const isUnlocked = levelsWithProgress[index]?.isUnlocked || false;
            
            // Конвертируем проценты в пиксели для SVG
            const x1 = (pos.x / 100) * containerWidth;
            const x2 = (nextPos.x / 100) * containerWidth;
            
            return (
              <line
                key={index}
                x1={x1}
                y1={pos.y}
                x2={x2}
                y2={nextPos.y}
                stroke={isUnlocked ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                strokeWidth="2"
                strokeDasharray={isUnlocked ? "0" : "5,5"}
                className="transition-colors duration-300"
              />
            );
          })}
        </svg>

        {/* Узлы талантов */}
        {levelsWithProgress.map(({ level, matchPercentage, isUnlocked, isCurrent }, index) => (
          <TalentNode
            key={level.level}
            level={level}
            isUnlocked={isUnlocked}
            isCurrent={isCurrent}
            matchPercentage={matchPercentage}
            position={nodePositions[index]}
            isLast={index === levelsWithProgress.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

