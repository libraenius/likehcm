"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getProfileById,
  getCompetenceById,
  getCompetences,
} from "@/lib/data";
import type { UserProfile, SkillLevel, ProfileCompetence, Competence } from "@/types";
import { CheckCircle2, TrendingUp, BookOpen, Users, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkillAssessmentProps {
  userProfile: UserProfile;
  onSkillUpdate: (skills: Array<{ competenceId: string; selfAssessment: SkillLevel; comment?: string }>) => void;
  onClose?: () => void;
}

interface CompetenceCardProps {
  competence: Competence;
  competenceId: string;
  requirement: ProfileCompetence | null;
  requiredLevel: number;
  actualLevel: number;
  levelNames: Record<number, string>;
  onSkillChange: (competenceId: string, level: number) => void;
  onCommentChange: (competenceId: string, comment: string) => void;
  comment?: string;
  isCorporate: boolean;
}

// Компонент для выбора уровня с улучшенным UX
function LevelSelector({
  value,
  onChange,
  levelNames,
  className,
}: {
  value: number;
  onChange: (level: number) => void;
  levelNames: Record<number, string>;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* Кнопки для выбора уровня */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = value === level;
          return (
            <Button
              key={level}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(level)}
              className={cn(
                "flex items-center justify-center h-auto py-3 transition-all",
                isSelected && "shadow-md scale-105"
              )}
            >
              <span className="text-base font-semibold">
                {levelNames[level]}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function CompetenceCard({
  competence,
  competenceId,
  requirement,
  requiredLevel,
  actualLevel,
  levelNames,
  onSkillChange,
  onCommentChange,
  comment,
  isCorporate,
}: CompetenceCardProps) {
  const [isCommentOpen, setIsCommentOpen] = useState(!!comment);

  useEffect(() => {
    if (comment && !isCommentOpen) {
      setIsCommentOpen(true);
    }
  }, [comment, isCommentOpen]);

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      {/* Заголовок компетенции */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "p-1.5 rounded shrink-0",
            isCorporate 
              ? "bg-cyan-100 dark:bg-cyan-950" 
              : "bg-purple-100 dark:bg-purple-950"
          )}>
            {isCorporate ? (
              <Users className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
            ) : (
              <BookOpen className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            )}
          </div>
          <Label className="text-base font-semibold break-words flex-1">
            {competence.name}
          </Label>
          {actualLevel > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setIsCommentOpen(!isCommentOpen)}
              title={isCommentOpen ? "Скрыть комментарий" : "Добавить комментарий"}
            >
              <MessageSquare className={cn(
                "h-4 w-4",
                comment ? "text-primary" : "text-muted-foreground"
              )} />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground break-words">
          {competence.description}
        </p>
      </div>

      {/* Выбор уровня */}
      <div className="space-y-4">
        <LevelSelector
          value={actualLevel}
          onChange={(level) => onSkillChange(competenceId, level)}
          levelNames={levelNames}
        />
      </div>

      {actualLevel > 0 && (() => {
        const selectedLevelKey = `level${actualLevel}` as keyof typeof competence.levels;
        const levelDescription = competence.levels?.[selectedLevelKey] || "";
        return levelDescription ? (
          <div className="mt-6 p-3 bg-muted/50 rounded-md w-full min-w-0 border">
            <p className="text-sm font-semibold mb-2 break-words">Описание уровня {levelNames[actualLevel]}:</p>
            <p className="text-sm text-muted-foreground break-words">{levelDescription}</p>
          </div>
        ) : null;
      })()}

      {/* Поле для комментария */}
      {isCommentOpen && actualLevel > 0 && (
        <div className="space-y-2 mt-4">
          <Label htmlFor={`comment-${competenceId}`} className="text-sm font-medium">
            Комментарий (необязательно)
          </Label>
          <Textarea
            id={`comment-${competenceId}`}
            value={comment || ""}
            onChange={(e) => onCommentChange(competenceId, e.target.value)}
            placeholder="Добавьте комментарий к вашей оценке..."
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          {comment && (
            <p className="text-xs text-muted-foreground">
              {comment.length} / 500 символов
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SkillAssessment({ userProfile, onSkillUpdate, onClose }: SkillAssessmentProps) {
  // Используем number вместо SkillLevel, чтобы поддерживать 0 (не выбран)
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const skillsMap: Record<string, number> = {};
    const commentsMap: Record<string, string> = {};
    userProfile.skills.forEach((skill) => {
      skillsMap[skill.competenceId] = skill.selfAssessment;
      if (skill.comment) {
        commentsMap[skill.competenceId] = skill.comment;
      }
    });
    setSkills(skillsMap);
    setComments(commentsMap);
    setIsSaved(false);
  }, [userProfile]);

  // Функция для получения текущего уровня
  // Если компетенция не установлена в сохраненных данных, по умолчанию возвращаем 0 (не выбрано)
  const getCurrentLevel = (competenceId: string): number => {
    // Если компетенция установлена, возвращаем ее значение
    if (skills[competenceId] !== undefined && skills[competenceId] >= 0) {
      return skills[competenceId];
    }
    // По умолчанию возвращаем 0 (не выбрано)
    return 0;
  };

  if (!userProfile.mainProfileId) return null;
  const mainProfile = getProfileById(userProfile.mainProfileId);
  if (!mainProfile) return null;

  // Собираем компетенции основного профиля и уникальные компетенции дополнительных профилей
  const { mainProfileCompetenceIds, additionalProfileCompetenceIds, allCompetenceIds } = useMemo(() => {
    // Собираем компетенции основного профиля
    const mainIds = new Set<string>();
    mainProfile.requiredCompetences.forEach((c) =>
      mainIds.add(c.competenceId)
    );

    // Собираем уникальные компетенции дополнительных профилей (не входящие в основной)
    const additionalIds = new Set<string>();
    (userProfile.additionalProfileIds || []).forEach((profileId) => {
      const profile = getProfileById(profileId);
      profile?.requiredCompetences.forEach((c) => {
        // Добавляем только если компетенция не входит в основной профиль
        if (!mainIds.has(c.competenceId)) {
          additionalIds.add(c.competenceId);
        }
      });
    });

    // Все компетенции для расчета статистики и сохранения
    const allIds = new Set<string>();
    mainIds.forEach((id) => allIds.add(id));
    additionalIds.forEach((id) => allIds.add(id));

    return {
      mainProfileCompetenceIds: mainIds,
      additionalProfileCompetenceIds: additionalIds,
      allCompetenceIds: allIds,
    };
  }, [userProfile.mainProfileId, userProfile.additionalProfileIds, mainProfile]);

  const handleSkillChange = (competenceId: string, level: number) => {
    // Сохраняем уровень компетенции (0-5)
    if (level >= 0 && level <= 5) {
      setSkills({ ...skills, [competenceId]: level });
    }
    setIsSaved(false);
  };

  const handleCommentChange = (competenceId: string, comment: string) => {
    if (comment.trim()) {
      setComments({ ...comments, [competenceId]: comment.trim() });
    } else {
      const newComments = { ...comments };
      delete newComments[competenceId];
      setComments(newComments);
    }
    setIsSaved(false);
  };

  const handleSave = () => {
    // Сохраняем только компетенции с выбранным уровнем (1-5)
    // Компетенции с уровнем 0 или не выбранные не сохраняем
    const skillsArray: Array<{ competenceId: string; selfAssessment: SkillLevel; comment?: string }> = [];
    
    Array.from(allCompetenceIds).forEach((competenceId) => {
      const skillValue = skills[competenceId];
      // Сохраняем только компетенции с уровнем 1-5
      if (skillValue && skillValue > 0 && skillValue <= 5) {
        const skillData: { competenceId: string; selfAssessment: SkillLevel; comment?: string } = {
          competenceId,
          selfAssessment: skillValue as SkillLevel,
        };
        // Добавляем комментарий, если он есть
        if (comments[competenceId]) {
          skillData.comment = comments[competenceId];
        }
        skillsArray.push(skillData);
      }
      // Компетенции с уровнем 0 или не выбранные не сохраняем
    });
    
    onSkillUpdate(skillsArray);
    setIsSaved(true);
    // Закрываем модальное окно через 1.5 секунды после сохранения
    if (onClose) {
      setTimeout(() => {
        onClose();
        setIsSaved(false);
      }, 1500);
    }
  };


  const getCompetenceRequirement = (competenceId: string): ProfileCompetence | null => {
    // Сначала проверяем основной профиль
    const mainReq = mainProfile.requiredCompetences.find(
      (c) => c.competenceId === competenceId
    );
    if (mainReq) return mainReq;

    // Затем проверяем дополнительные профили
    for (const profileId of userProfile.additionalProfileIds || []) {
      const profile = getProfileById(profileId);
      const req = profile?.requiredCompetences.find(
        (c) => c.competenceId === competenceId
      );
      if (req) return req;
    }

    return null;
  };

  // Функция для получения и сортировки компетенций
  const getFilteredCompetences = (competenceIds: Set<string>) => {
    return Array.from(competenceIds)
      .map((competenceId) => {
        const competence = getCompetenceById(competenceId);
        if (!competence) return null;
        return { competenceId, competence };
      })
      .filter((item): item is { competenceId: string; competence: Competence } => item !== null)
      .sort((a, b) => {
        // Сначала профессиональные, потом корпоративные
        if (a.competence.type !== b.competence.type) {
          if (a.competence.type === "профессиональные компетенции") return -1;
          return 1;
        }
        // Затем по названию
        return a.competence.name.localeCompare(b.competence.name);
      });
  };

  // Компетенции основного профиля
  const mainProfileCompetences = useMemo(() => {
    return getFilteredCompetences(mainProfileCompetenceIds);
  }, [mainProfileCompetenceIds, userProfile.mainProfileId]);

  // Уникальные компетенции дополнительных профилей
  const additionalProfileCompetences = useMemo(() => {
    return getFilteredCompetences(additionalProfileCompetenceIds);
  }, [additionalProfileCompetenceIds, userProfile.additionalProfileIds, userProfile.mainProfileId]);

  // Все компетенции для статистики
  const allCompetences = useMemo(() => {
    return getFilteredCompetences(allCompetenceIds);
  }, [allCompetenceIds, userProfile.mainProfileId, userProfile.additionalProfileIds]);

  // Разделение компетенций основного профиля на профессиональные и корпоративные
  const mainProfessionalCompetences = useMemo(() => {
    return mainProfileCompetences.filter(
      ({ competence }) => competence.type === "профессиональные компетенции"
    );
  }, [mainProfileCompetences]);

  const mainCorporateCompetences = useMemo(() => {
    return mainProfileCompetences.filter(
      ({ competence }) => competence.type === "корпоративные компетенции"
    );
  }, [mainProfileCompetences]);

  // Разделение уникальных компетенций дополнительных профилей на профессиональные и корпоративные
  const additionalProfessionalCompetences = useMemo(() => {
    return additionalProfileCompetences.filter(
      ({ competence }) => competence.type === "профессиональные компетенции"
    );
  }, [additionalProfileCompetences]);

  const additionalCorporateCompetences = useMemo(() => {
    return additionalProfileCompetences.filter(
      ({ competence }) => competence.type === "корпоративные компетенции"
    );
  }, [additionalProfileCompetences]);

  // Статистика заполнения (для всех компетенций)
  const assessmentStats = useMemo(() => {
    const total = allCompetences.length;
    const assessed = allCompetences.filter(({ competenceId }) => {
      const level = skills[competenceId];
      return level !== undefined && level > 0;
    }).length;
    
    return {
      total,
      assessed,
      progress: total > 0 ? Math.round((assessed / total) * 100) : 0,
    };
  }, [allCompetences, skills]);

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Статистика и фильтры */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Прогресс заполнения</Label>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Оценено: <span className="font-semibold text-foreground">{assessmentStats.assessed}</span> из {assessmentStats.total}
            </span>
          </div>
        </div>
        <Progress value={assessmentStats.progress} className="h-2 w-full" />
      </div>


      {/* Вкладки для основного и дополнительных профилей */}
      {additionalProfileCompetences.length > 0 ? (
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="main">
              Основной профиль
            </TabsTrigger>
            <TabsTrigger value="additional">
              Дополнительные профили
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="main" className="mt-4">
            {/* Компетенции основного профиля */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Профессиональные компетенции основного профиля */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                  <Label className="text-lg font-semibold">Профессиональные компетенции</Label>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    {mainProfessionalCompetences.length}
                  </Badge>
                </div>
                {mainProfessionalCompetences.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground text-sm">Нет профессиональных компетенций</p>
                  </div>
                ) : (
                  mainProfessionalCompetences.map(({ competenceId, competence }) => {
                    const requirement = getCompetenceRequirement(competenceId);
                    const actualLevel: number = getCurrentLevel(competenceId);
                    const requiredLevel = requirement?.requiredLevel || 0;
                    const levelNames: Record<number, string> = {
                      1: "Начальный",
                      2: "Базовый",
                      3: "Средний",
                      4: "Продвинутый",
                      5: "Экспертный",
                    };

                    return (
                      <CompetenceCard
                        key={competenceId}
                        competence={competence}
                        competenceId={competenceId}
                        requirement={requirement}
                        requiredLevel={requiredLevel}
                        actualLevel={actualLevel}
                        levelNames={levelNames}
                        onSkillChange={handleSkillChange}
                        onCommentChange={handleCommentChange}
                        comment={comments[competenceId]}
                        isCorporate={false}
                      />
                    );
                  })
                )}
              </div>

              {/* Корпоративные компетенции основного профиля */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                  <Label className="text-lg font-semibold">Корпоративные компетенции</Label>
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                    {mainCorporateCompetences.length}
                  </Badge>
                </div>
                {mainCorporateCompetences.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground text-sm">Нет корпоративных компетенций</p>
                  </div>
                ) : (
                  mainCorporateCompetences.map(({ competenceId, competence }) => {
                    const requirement = getCompetenceRequirement(competenceId);
                    const actualLevel: number = getCurrentLevel(competenceId);
                    const requiredLevel = requirement?.requiredLevel || 0;
                    const levelNames: Record<number, string> = {
                      1: "Начальный",
                      2: "Базовый",
                      3: "Средний",
                      4: "Продвинутый",
                      5: "Экспертный",
                    };

                    return (
                      <CompetenceCard
                        key={competenceId}
                        competence={competence}
                        competenceId={competenceId}
                        requirement={requirement}
                        requiredLevel={requiredLevel}
                        actualLevel={actualLevel}
                        levelNames={levelNames}
                        onSkillChange={handleSkillChange}
                        onCommentChange={handleCommentChange}
                        comment={comments[competenceId]}
                        isCorporate={true}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="mt-4">
            {/* Уникальные компетенции дополнительных профилей */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Профессиональные компетенции дополнительных профилей */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                  <Label className="text-lg font-semibold">Профессиональные компетенции</Label>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    {additionalProfessionalCompetences.length}
                  </Badge>
                </div>
                {additionalProfessionalCompetences.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground text-sm">Нет профессиональных компетенций</p>
                  </div>
                ) : (
                  additionalProfessionalCompetences.map(({ competenceId, competence }) => {
                    const requirement = getCompetenceRequirement(competenceId);
                    const actualLevel: number = getCurrentLevel(competenceId);
                    const requiredLevel = requirement?.requiredLevel || 0;
                    const levelNames: Record<number, string> = {
                      1: "Начальный",
                      2: "Базовый",
                      3: "Средний",
                      4: "Продвинутый",
                      5: "Экспертный",
                    };

                    return (
                      <CompetenceCard
                        key={competenceId}
                        competence={competence}
                        competenceId={competenceId}
                        requirement={requirement}
                        requiredLevel={requiredLevel}
                        actualLevel={actualLevel}
                        levelNames={levelNames}
                        onSkillChange={handleSkillChange}
                        onCommentChange={handleCommentChange}
                        comment={comments[competenceId]}
                        isCorporate={false}
                      />
                    );
                  })
                )}
              </div>

              {/* Корпоративные компетенции дополнительных профилей */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                  <Label className="text-lg font-semibold">Корпоративные компетенции</Label>
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                    {additionalCorporateCompetences.length}
                  </Badge>
                </div>
                {additionalCorporateCompetences.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground text-sm">Нет корпоративных компетенций</p>
                  </div>
                ) : (
                  additionalCorporateCompetences.map(({ competenceId, competence }) => {
                    const requirement = getCompetenceRequirement(competenceId);
                    const actualLevel: number = getCurrentLevel(competenceId);
                    const requiredLevel = requirement?.requiredLevel || 0;
                    const levelNames: Record<number, string> = {
                      1: "Начальный",
                      2: "Базовый",
                      3: "Средний",
                      4: "Продвинутый",
                      5: "Экспертный",
                    };

                    return (
                      <CompetenceCard
                        key={competenceId}
                        competence={competence}
                        competenceId={competenceId}
                        requirement={requirement}
                        requiredLevel={requiredLevel}
                        actualLevel={actualLevel}
                        levelNames={levelNames}
                        onSkillChange={handleSkillChange}
                        onCommentChange={handleCommentChange}
                        comment={comments[competenceId]}
                        isCorporate={true}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* Если нет дополнительных профилей, показываем компетенции основного профиля без вкладок */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Профессиональные компетенции */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              <Label className="text-lg font-semibold">Профессиональные компетенции</Label>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                {mainProfessionalCompetences.length}
              </Badge>
            </div>
            {mainProfessionalCompetences.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground text-sm">Нет профессиональных компетенций</p>
              </div>
            ) : (
              mainProfessionalCompetences.map(({ competenceId, competence }) => {
                const requirement = getCompetenceRequirement(competenceId);
                const actualLevel: number = getCurrentLevel(competenceId);
                const requiredLevel = requirement?.requiredLevel || 0;
                const levelNames: Record<number, string> = {
                  1: "Начальный",
                  2: "Базовый",
                  3: "Средний",
                  4: "Продвинутый",
                  5: "Экспертный",
                };

                return (
                  <CompetenceCard
                    key={competenceId}
                    competence={competence}
                    competenceId={competenceId}
                    requirement={requirement}
                    requiredLevel={requiredLevel}
                    actualLevel={actualLevel}
                    levelNames={levelNames}
                    onSkillChange={handleSkillChange}
                    onCommentChange={handleCommentChange}
                    comment={comments[competenceId]}
                    isCorporate={false}
                  />
                );
              })
            )}
          </div>

          {/* Корпоративные компетенции */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
              <Label className="text-lg font-semibold">Корпоративные компетенции</Label>
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                {mainCorporateCompetences.length}
              </Badge>
            </div>
            {mainCorporateCompetences.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground text-sm">Нет корпоративных компетенций</p>
              </div>
            ) : (
              mainCorporateCompetences.map(({ competenceId, competence }) => {
                const requirement = getCompetenceRequirement(competenceId);
                const actualLevel: number = getCurrentLevel(competenceId);
                const requiredLevel = requirement?.requiredLevel || 0;
                const levelNames: Record<number, string> = {
                  1: "Начальный",
                  2: "Базовый",
                  3: "Средний",
                  4: "Продвинутый",
                  5: "Экспертный",
                };

                return (
                  <CompetenceCard
                    key={competenceId}
                    competence={competence}
                    competenceId={competenceId}
                    requirement={requirement}
                    requiredLevel={requiredLevel}
                    actualLevel={actualLevel}
                    levelNames={levelNames}
                    onSkillChange={handleSkillChange}
                    onCommentChange={handleCommentChange}
                    comment={comments[competenceId]}
                    isCorporate={true}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Кнопка сохранения */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Готовы сохранить самооценку?</p>
          <p className="text-xs text-muted-foreground">
            Оценено {assessmentStats.assessed} из {assessmentStats.total} компетенций
          </p>
        </div>
        <Button onClick={handleSave} size="lg" className="shrink-0">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Сохранить самооценку
        </Button>
      </div>

      {isSaved && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg w-full">
          <p className="text-sm text-green-800 dark:text-green-200">
            Самооценка успешно сохранена!
          </p>
        </div>
      )}
    </div>
  );
}
