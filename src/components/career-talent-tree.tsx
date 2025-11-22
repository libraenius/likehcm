"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import type { CareerTrack, CareerTrackLevel, CareerTrackProgress } from "@/types";
import { getCompetenceById } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
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

  // Разделяем компетенции на профессиональные и корпоративные
  const professional = competences.filter(
    (item) => item.competence && item.competence.type === "профессиональные компетенции"
  );
  const corporate = competences.filter(
    (item) => item.competence && item.competence.type === "корпоративные компетенции"
  );

  // Цвета для профессиональных и корпоративных компетенций
  const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";
  const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: "0px",
        transform: "translateX(-50%)",
      }}
    >
      {/* Карточка с информацией */}
      <Card
        data-card-level={level.level}
        className={cn(
          "w-80 max-w-full border-2 transition-all duration-300 hover:shadow-lg overflow-hidden",
          "max-w-[calc(100vw-2rem)]",
          isUnlocked
            ? "border-primary/50 shadow-md hover:border-primary/70 gradient-card-unlocked"
            : "border-muted bg-muted/30 opacity-75",
          isCurrent && "ring-2 ring-primary shadow-lg ring-accent/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold leading-tight break-words">
                {level.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1 break-words line-clamp-3">
                {level.description}
              </CardDescription>
            </div>
            {isCurrent && (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                Текущий
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Прогресс - показываем только если есть данные пользователя */}
          {matchPercentage > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Соответствие</span>
                <span className="font-semibold">{matchPercentage}%</span>
              </div>
              <Progress value={matchPercentage} className="h-2" />
            </div>
          )}

          {/* Профессиональные компетенции */}
          {professional.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Профессиональные компетенции:</p>
              <div className="flex flex-wrap gap-1">
                {professional.map(({ competence, requiredLevel }) => (
                  <Badge
                    key={competence?.id}
                    variant="outline"
                    className={cn(
                      "text-xs border max-w-full whitespace-normal break-words",
                      isUnlocked ? professionalColor : `${professionalColor} opacity-60`
                    )}
                  >
                    {competence?.name || "?"} {requiredLevel}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Корпоративные компетенции */}
          {corporate.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Корпоративные компетенции:</p>
              <div className="flex flex-wrap gap-1">
                {corporate.map(({ competence, requiredLevel }) => (
                  <Badge
                    key={competence?.id}
                    variant="outline"
                    className={cn(
                      "text-xs border max-w-full whitespace-normal break-words",
                      isUnlocked ? corporateColor : `${corporateColor} opacity-60`
                    )}
                  >
                    {competence?.name || "?"} {requiredLevel}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CareerTalentTree({ careerTrack, progress, userSkills = {} }: CareerTalentTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
        // Измеряем реальную высоту карточек
        // Карточки позиционированы абсолютно, поэтому измеряем их напрямую
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // Находим все карточки внутри контейнера
            const cards = containerRef.current.querySelectorAll('[data-card-level]');
            let maxHeight = 0;
            
            cards.forEach((card) => {
              const rect = card.getBoundingClientRect();
              maxHeight = Math.max(maxHeight, rect.height);
            });
            
            // Если карточки еще не отрендерились, используем минимальную высоту
            if (maxHeight === 0) {
              maxHeight = 400;
            }
            
            // Добавляем отступы сверху и снизу (20px + 40px)
            setContainerHeight(maxHeight + 60);
          }
        });
      }
    };

    // Используем ResizeObserver для более точного отслеживания
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    // Также обновляем при изменении размера окна
    window.addEventListener('resize', updateSize);
    
    // Обновляем размер после рендера карточек
    // Используем несколько таймаутов для надежности
    const timeoutId1 = setTimeout(updateSize, 0);
    const timeoutId2 = setTimeout(updateSize, 100);
    const timeoutId3 = setTimeout(updateSize, 300);
    
    // Также обновляем при изменении уровней или данных пользователя
    updateSize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [careerTrack.levels, userSkills, progress]);

  // Вычисляем прогресс для каждого уровня
  // В справочнике (без userSkills и progress) не показываем прогресс пользователя
  const levelsWithProgress = useMemo(() => {
    const hasUserData = userSkills && Object.keys(userSkills).length > 0;
    
    return careerTrack.levels.map((level) => {
      let levelMatch = 0;
      let totalRequired = 0;

      if (hasUserData) {
        for (const [competenceId, requiredLevel] of Object.entries(level.requiredSkills)) {
          const userLevel = userSkills[competenceId] || 0;
          levelMatch += Math.min(userLevel, requiredLevel);
          totalRequired += requiredLevel;
        }
      } else {
        // В справочнике просто считаем общее количество требуемых компетенций
        totalRequired = Object.values(level.requiredSkills).reduce((sum, level) => sum + level, 0);
      }

      const matchPercentage = totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;
      const isUnlocked = hasUserData ? matchPercentage >= level.minMatchPercentage : false;
      const isCurrent = hasUserData && progress ? progress.currentLevel === level.level : false;

      return {
        level,
        matchPercentage,
        isUnlocked,
        isCurrent,
      };
    });
  }, [careerTrack.levels, userSkills, progress]);

  // Позиционирование узлов (горизонтальное дерево) - центрированное
  const { nodePositions, totalWidth } = useMemo(() => {
    const numLevels = careerTrack.levels.length;
    if (numLevels === 0) {
      return { nodePositions: [], totalWidth: 1000 };
    }
    
    // Фиксированное расстояние между центрами карточек в пикселях
    const fixedSpacing = 360;
    // Ширина карточки
    const cardWidth = 320; // w-80 = 320px
    
    // Рассчитываем общую ширину контента (все карточки + расстояния между ними)
    // Если N карточек, то нужно (N-1) расстояний между ними
    const contentWidth = cardWidth + (numLevels - 1) * fixedSpacing;
    
    // Отступы слева и справа (одинаковые для центрирования)
    const sidePadding = 40;
    
    // Общая ширина контейнера
    const containerWidth = contentWidth + sidePadding * 2;
    
    // Позиция первой карточки (центр карточки)
    const firstCardCenterX = sidePadding + cardWidth / 2;
    
    // Позиции всех карточек (центры)
    const positions = careerTrack.levels.map((level, index) => ({
      x: firstCardCenterX + index * fixedSpacing,
      y: 0,
    }));
    
    return {
      nodePositions: positions,
      totalWidth: containerWidth,
    };
  }, [careerTrack.levels.length]);
  

  return (
    <div className="w-full overflow-x-hidden max-w-full">
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{
          width: `${totalWidth}px`,
          maxWidth: "100%",
          minHeight: `${containerHeight}px`,
          padding: "20px 0 40px 0",
          overflowX: "hidden",
          overflowY: "visible",
        }}
      >
        {/* Фоновые линии соединения со стрелками */}
        <svg
          className="absolute pointer-events-none max-w-full"
          style={{ 
            width: `${totalWidth}px`, 
            maxWidth: "100%",
            height: `${containerHeight}px`,
            top: 0,
            left: 0,
            overflow: "hidden"
          }}
        >
          {nodePositions.map((pos, index) => {
            if (index === nodePositions.length - 1) return null;
            const nextPos = nodePositions[index + 1];
            const isUnlocked = levelsWithProgress[index]?.isUnlocked || false;
            
            // Позиции узлов уже в пикселях
            const x1 = pos.x;
            const x2 = nextPos.x;
            const y1 = pos.y;
            const y2 = nextPos.y;
            
            // Отступаем от узлов
            const nodeRadius = 40; // Радиус узла
            
            // Вычисляем центр между узлами
            const centerY = (y1 + y2) / 2;
            
            // Правый край левого узла и левый край правого узла
            const leftNodeRightEdgeX = x1 + nodeRadius;
            const rightNodeLeftEdgeX = x2 - nodeRadius;
            
            return (
              <g key={`connection-${index}`}>
                {/* Горизонтальная линия от правого края левого узла до левого края правого узла */}
                <line
                  x1={leftNodeRightEdgeX}
                  y1={centerY}
                  x2={rightNodeLeftEdgeX}
                  y2={centerY}
                  stroke={isUnlocked ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                  strokeWidth="2"
                  strokeDasharray={isUnlocked ? "0" : "5,5"}
                  className="transition-colors duration-300"
                />
              </g>
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

