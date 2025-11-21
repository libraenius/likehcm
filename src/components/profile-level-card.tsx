"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, Briefcase, Info, ClipboardList } from "lucide-react";
import type { ProfileLevel } from "@/types";
import { getCompetenceById } from "@/lib/data";
import {
  PROFILE_LEVEL_COLORS,
  PROFILE_LEVEL_GRADIENT_COLORS,
  PROFILE_LEVEL_NAMES,
  COMPETENCE_TYPE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProfileLevelCardProps {
  profileLevel: ProfileLevel;
  levelLabel: string;
  levelIndex: number;
  variant?: "default" | "compact";
  className?: string;
}

/**
 * Компонент для отображения карточки уровня профиля
 * @param profileLevel - Данные уровня профиля
 * @param levelLabel - Метка уровня (например, "Стажер")
 * @param levelIndex - Индекс уровня
 * @param variant - Вариант отображения (default или compact)
 * @param className - Дополнительные CSS классы
 */
export function ProfileLevelCard({
  profileLevel,
  levelLabel,
  levelIndex,
  variant = "default",
  className,
}: ProfileLevelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const levelColor = PROFILE_LEVEL_COLORS[profileLevel.level] || PROFILE_LEVEL_COLORS.trainee;
  const isCompact = variant === "compact";
  const textSize = isCompact ? "text-xs" : "text-sm";
  const iconSize = isCompact ? "h-3 w-3" : "h-3.5 w-3.5";
  const badgeSize = isCompact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <div className={cn("border rounded-md overflow-hidden bg-card", className)}>
      <div
        className="p-2.5 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
        aria-label={`${levelLabel} ${profileLevel.name}`}
      >
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
          >
            {isExpanded ? (
              <ChevronDown className={iconSize} />
            ) : (
              <ChevronRight className={iconSize} />
            )}
          </Button>
          <Badge variant="outline" className={cn(badgeSize, levelColor)}>
            {levelLabel}
          </Badge>
          <span className={cn("font-semibold", textSize)}>{profileLevel.name}</span>
          {!isExpanded && (
            <span className={cn(textSize, "text-muted-foreground truncate ml-2")}>
              {profileLevel.description}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/30 p-2.5 space-y-2.5">
          {/* Обязанности */}
          <div className="space-y-1.5">
            <h4 className={cn("font-semibold flex items-center gap-1.5", textSize)}>
              <Briefcase className={cn(iconSize, "text-muted-foreground")} />
              Обязанности:
            </h4>
            <ul className="space-y-1 ml-4">
              {profileLevel.responsibilities.map((responsibility, idx) => (
                <li
                  key={idx}
                  className={cn(textSize, "text-muted-foreground")}
                >
                  <div className="flex items-start gap-1.5">
                    <span className="text-foreground mt-0.5 flex-shrink-0">•</span>
                    <div className="flex-1 whitespace-pre-line break-words">{responsibility}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-2" />

          {/* Требования к образованию и стажу */}
          <div className="space-y-1.5">
            <h4 className={cn("font-semibold flex items-center gap-1.5", textSize)}>
              <Info className={cn(iconSize, "text-muted-foreground")} />
              Требования:
            </h4>
            <div className="space-y-2 ml-4">
              <div className={textSize}>
                <span className="font-medium text-foreground">Образование: </span>
                <span className="text-muted-foreground">
                  {profileLevel.education || "Не указано"}
                </span>
              </div>
              <div className={textSize}>
                <span className="font-medium text-foreground">Стаж: </span>
                <span className="text-muted-foreground">
                  {profileLevel.experience || "Не указано"}
                </span>
              </div>
            </div>
          </div>

          {/* Примеры задач */}
          {profileLevel.taskExamples && profileLevel.taskExamples.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1.5">
                <h4 className={cn("font-semibold flex items-center gap-1.5", textSize)}>
                  <ClipboardList className={cn(iconSize, "text-muted-foreground")} />
                  Уровень сложности решаемых задач:
                </h4>
                <ul className="space-y-1 ml-4">
                  {profileLevel.taskExamples.map((task, idx) => (
                    <li
                      key={idx}
                      className={cn(textSize, "text-muted-foreground")}
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-foreground mt-0.5 flex-shrink-0 font-medium">{idx + 1}.</span>
                        <div className="flex-1 whitespace-pre-line break-words">{task}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator className="my-2" />

          {/* Компетенции */}
          <div className="space-y-1.5">
            <h4 className={cn("font-semibold flex items-center gap-1.5", textSize)}>
              <Info className={cn(iconSize, "text-muted-foreground")} />
              Компетенции:
            </h4>
            <div className="space-y-3">
              {/* Профессиональные компетенции */}
              <div className="space-y-1">
                <p className={cn(textSize, "font-medium text-muted-foreground")}>
                  Профессиональные компетенции:
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "профессиональные компетенции";
                    })
                    .map(([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const professionalColor = COMPETENCE_TYPE_COLORS["профессиональные компетенции"];

                      return (
                        <Badge
                          key={competenceId}
                          variant="outline"
                          className={cn("text-sm border", professionalColor)}
                        >
                          {comp.name} {requiredLevel}
                        </Badge>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "профессиональные компетенции";
                  }).length === 0 && (
                    <p className={cn(textSize, "text-muted-foreground italic")}>
                      Нет профессиональных компетенций
                    </p>
                  )}
                </div>
              </div>

              {/* Корпоративные компетенции */}
              <div className="space-y-1">
                <p className={cn(textSize, "font-medium text-muted-foreground")}>
                  Корпоративные компетенции:
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "корпоративные компетенции";
                    })
                    .map(([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const corporateColor = COMPETENCE_TYPE_COLORS["корпоративные компетенции"];

                      return (
                        <Badge
                          key={competenceId}
                          variant="outline"
                          className={cn("text-sm border", corporateColor)}
                        >
                          {comp.name} {requiredLevel}
                        </Badge>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "корпоративные компетенции";
                  }).length === 0 && (
                    <p className={cn(textSize, "text-muted-foreground italic")}>
                      Нет корпоративных компетенций
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

