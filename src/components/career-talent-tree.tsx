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
        className={cn(
          "w-80 border-2 transition-all duration-300 hover:shadow-lg",
          isUnlocked
            ? "border-primary/50 shadow-md hover:border-primary/70 gradient-card-unlocked"
            : "border-muted bg-muted/30 opacity-75",
          isCurrent && "ring-2 ring-primary shadow-lg ring-accent/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold leading-tight">
                {level.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
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
                      "text-xs border",
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
                      "text-xs border",
                      isUnlocked ? corporateColor : `${corporateColor} opacity-60`
                    )}
                  >
                    {competence?.name || "?"} {requiredLevel}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
  
  // Вычисляем высоту контейнера на основе максимальной высоты карточек
  const containerHeight = useMemo(() => {
    // Находим уровень с максимальным количеством компетенций
    const maxCompetences = Math.max(
      ...careerTrack.levels.map(level => Object.keys(level.requiredSkills).length),
      0
    );
    
    // Вычисляем высоту секции компетенций
    // Каждая компетенция занимает примерно 24px (высота Badge + gap)
    // Учитываем переносы строк (ширина карточки 320px, Badge примерно 100-150px)
    const badgesPerRow = Math.floor(320 / 120); // Примерно 2-3 бейджа в строке
    const competenceRows = Math.ceil(maxCompetences / badgesPerRow);
    const competenceSectionHeight = 20 + (competenceRows * 24); // Заголовок + строки
    
    // Общая высота карточки (учитываем padding Card: py-6 = 24px сверху и снизу)
    const cardHeight = 
      24 + // Padding сверху от Card (py-6)
      80 + // CardHeader (название + описание)
      40 + // Progress section
      competenceSectionHeight + // Competences section
      30 + // Минимальное соответствие
      24; // Padding снизу от Card (py-6)
    
    // Высота контейнера = отступ сверху (20px) + самая длинная карточка + дополнительный отступ снизу (100px для больших карточек)
    return 20 + cardHeight + 100;
  }, [careerTrack.levels]);

  return (
    <div className="w-full overflow-visible">
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{
          width: `${totalWidth}px`,
          maxWidth: "100%",
          minHeight: `${containerHeight}px`,
          padding: "20px 0 100px 0",
          overflow: "visible",
        }}
      >
        {/* Фоновые линии соединения со стрелками */}
        <svg
          className="absolute pointer-events-none"
          style={{ 
            width: `${totalWidth}px`, 
            height: `${containerHeight}px`,
            top: 0,
            left: 0,
            overflow: "visible"
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

