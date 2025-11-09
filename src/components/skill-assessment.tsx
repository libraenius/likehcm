"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  getProfileById,
  getCompetenceById,
  getProfiles,
  getCompetences,
} from "@/lib/data";
import { calculateProfileMatch } from "@/lib/calculations";
import type { UserProfile, SkillLevel, ProfileCompetence } from "@/types";

interface SkillAssessmentProps {
  userProfile: UserProfile;
  onSkillUpdate: (skills: Array<{ competenceId: string; selfAssessment: SkillLevel }>) => void;
  onClose?: () => void;
}

export function SkillAssessment({ userProfile, onSkillUpdate, onClose }: SkillAssessmentProps) {
  // Используем number вместо SkillLevel, чтобы поддерживать 0 (не выбран)
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const skillsMap: Record<string, number> = {};
    userProfile.skills.forEach((skill) => {
      skillsMap[skill.competenceId] = skill.selfAssessment;
    });
    setSkills(skillsMap);
    setIsSaved(false);
  }, [userProfile]);

  // Функция для получения текущего уровня
  // Если навык не установлен в сохраненных данных, по умолчанию возвращаем 1 (дефолтное состояние - чекбокс не нажат)
  const getCurrentLevel = (competenceId: string): number => {
    // Если навык явно установлен на 0 (чекбокс "Не выбран" нажат), возвращаем 0
    if (skills[competenceId] === 0) {
      return 0;
    }
    // Если навык установлен, возвращаем его значение
    if (skills[competenceId] && skills[competenceId] > 0) {
      return skills[competenceId] as SkillLevel;
    }
    // По умолчанию возвращаем 1 (чекбокс не нажат, уровень установлен на 1)
    return 1;
  };

  const mainProfile = getProfileById(userProfile.mainProfileId);
  if (!mainProfile) return null;

  // Собираем все компетенции из основного и дополнительных профилей
  const allCompetenceIds = new Set<string>();
  mainProfile.requiredCompetences.forEach((c) =>
    allCompetenceIds.add(c.competenceId)
  );
  userProfile.additionalProfileIds.forEach((profileId) => {
    const profile = getProfileById(profileId);
    profile?.requiredCompetences.forEach((c) =>
      allCompetenceIds.add(c.competenceId)
    );
  });

  const handleSkillChange = (competenceId: string, level: number) => {
    // Сохраняем уровень навыка
    if (level > 0 && level <= 5) {
      setSkills({ ...skills, [competenceId]: level });
    } else {
      const newSkills = { ...skills };
      delete newSkills[competenceId];
      setSkills(newSkills);
    }
    setIsSaved(false);
  };

  const handleNotSelectedToggle = (competenceId: string, checked: boolean) => {
    if (checked) {
      // Если чекбокс "Не выбран" отмечен, устанавливаем уровень 0
      setSkills({ ...skills, [competenceId]: 0 });
    } else {
      // Если чекбокс снят (дефолтное состояние), устанавливаем уровень по умолчанию - 1
      setSkills({ ...skills, [competenceId]: 1 });
    }
    setIsSaved(false);
  };

  const handleSave = () => {
    // Сохраняем все компетенции из профилей
    // Если навык установлен на 0 (чекбокс нажат), не сохраняем его
    // Если навык не установлен явно, сохраняем его со значением 1 (дефолтное состояние)
    const skillsArray: Array<{ competenceId: string; selfAssessment: SkillLevel }> = [];
    
    Array.from(allCompetenceIds).forEach((competenceId) => {
      const skillValue = skills[competenceId];
      // Если навык установлен на 0, пропускаем его (не сохраняем)
      if (skillValue === 0) {
        return;
      }
      // Если навык установлен (1-5), сохраняем его значение
      if (skillValue && skillValue > 0 && skillValue <= 5) {
        skillsArray.push({
          competenceId,
          selfAssessment: skillValue as SkillLevel,
        });
      } else {
        // Если навык не установлен явно, сохраняем со значением 1 (дефолтное состояние)
        skillsArray.push({
          competenceId,
          selfAssessment: 1 as SkillLevel,
        });
      }
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

  // Преобразуем skills в формат для calculateProfileMatch
  // Для навыков, которые не установлены явно (undefined), используем уровень 1 по умолчанию
  // Навыки с уровнем 0 (чекбокс "Не выбран" нажат) не включаются в расчет
  const skillsForCalculation: Record<string, SkillLevel> = {};
  Array.from(allCompetenceIds).forEach((competenceId) => {
    const skillValue = skills[competenceId];
    // Если навык установлен на 0 (чекбокс "Не выбран" нажат), не включаем его в расчет
    if (skillValue === 0) {
      return;
    }
    // Если навык установлен (1-5), используем его значение
    if (skillValue && skillValue > 0 && skillValue <= 5) {
      skillsForCalculation[competenceId] = skillValue as SkillLevel;
    } else {
      // Если навык не установлен явно (undefined), используем уровень 1 по умолчанию
      skillsForCalculation[competenceId] = 1 as SkillLevel;
    }
  });

  // Вычисляем соответствие основному профилю
  const mainProfileMatch = calculateProfileMatch(
    skillsForCalculation,
    mainProfile.requiredCompetences
  );

  // Вычисляем соответствие дополнительным профилям
  const allProfiles = getProfiles();
  const additionalMatches = userProfile.additionalProfileIds.map((profileId) => {
    const profile = getProfileById(profileId);
    if (!profile) return null;
    const match = calculateProfileMatch(skillsForCalculation, profile.requiredCompetences);
    return { profileId, profile, match };
  }).filter(Boolean) as Array<{ profileId: string; profile: typeof allProfiles[0]; match: number }>;

  const getCompetenceRequirement = (competenceId: string): ProfileCompetence | null => {
    // Сначала проверяем основной профиль
    const mainReq = mainProfile.requiredCompetences.find(
      (c) => c.competenceId === competenceId
    );
    if (mainReq) return mainReq;

    // Затем проверяем дополнительные профили
    for (const profileId of userProfile.additionalProfileIds) {
      const profile = getProfileById(profileId);
      const req = profile?.requiredCompetences.find(
        (c) => c.competenceId === competenceId
      );
      if (req) return req;
    }

    return null;
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {Array.from(allCompetenceIds).map((competenceId) => {
              const competence = getCompetenceById(competenceId);
              const requirement = getCompetenceRequirement(competenceId);
              if (!competence) return null;

              const actualLevel: number = getCurrentLevel(competenceId);
              const requiredLevel = requirement?.requiredLevel || 0;

          const selectedLevelKey = actualLevel > 0 ? `level${actualLevel}` as keyof typeof competence.levels : null;
          const selectedLevelDescription = selectedLevelKey ? competence.levels?.[selectedLevelKey] || "" : "";
          const levelNames: Record<number, string> = {
            1: "Начальный",
            2: "Базовый",
            3: "Средний",
            4: "Продвинутый",
            5: "Экспертный",
          };

          return (
            <div key={competenceId} className="space-y-4 p-4 border rounded-lg w-full min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Label className="text-base font-semibold break-words">
                    {competence.name}
                  </Label>
                  {requirement && (
                    <Badge variant="outline" className="shrink-0">
                      Требуется: {requiredLevel}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    <Checkbox
                      id={`not-selected-${competenceId}`}
                      checked={actualLevel === 0}
                      onCheckedChange={(checked) => {
                        handleNotSelectedToggle(competenceId, checked as boolean);
                      }}
                    />
                    <Label
                      htmlFor={`not-selected-${competenceId}`}
                      className="text-sm font-medium cursor-pointer whitespace-nowrap"
                    >
                      Не выбран
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {competence.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 w-full min-w-0">
              {actualLevel > 0 && (
                <>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-sm font-medium break-words">
                      Ваш уровень: {actualLevel} ({levelNames[actualLevel]})
                    </Label>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {levelNames[actualLevel]}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 w-full min-w-0">
                    <div className="w-full px-1 relative">
                      <Slider
                        value={[actualLevel]}
                        onValueChange={(value) => {
                          const newLevel = value[0];
                          // Автоматически снимаем чекбокс "Не выбран" при выборе уровня
                          if (newLevel > 0) {
                            handleSkillChange(competenceId, newLevel);
                          }
                        }}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      {/* Акцентные точки на уровнях */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-1 right-1 pointer-events-none" style={{ height: '8px' }}>
                        {[1, 2, 3, 4, 5].map((level) => {
                          // Вычисляем позицию точки в процентах (0%, 25%, 50%, 75%, 100%)
                          const position = ((level - 1) / 4) * 100;
                          return (
                            <div
                              key={level}
                              className={cn(
                                "absolute rounded-full border-2 transition-all duration-200 -translate-x-1/2",
                                actualLevel === level
                                  ? "w-3 h-3 bg-primary border-primary z-10 shadow-md shadow-primary/30"
                                  : "w-2.5 h-2.5 bg-background border-muted-foreground/60 hover:border-muted-foreground/80"
                              )}
                              style={{ left: `${position}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="w-full grid grid-cols-5 items-start gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className="flex flex-col items-center justify-start">
                          <span className={actualLevel === level ? "font-semibold text-foreground text-xs mb-0.5" : "text-muted-foreground text-xs mb-0.5"}>{level}</span>
                          <span className="text-[9px] text-muted-foreground text-center leading-[1.1] px-0.5">{levelNames[level]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {actualLevel > 0 && (() => {
                    const selectedLevelKey = `level${actualLevel}` as keyof typeof competence.levels;
                    const levelDescription = competence.levels?.[selectedLevelKey] || "";
                    return levelDescription ? (
                      <div className="mt-2 p-2 bg-muted/50 rounded-md w-full min-w-0">
                        <p className="text-xs font-semibold mb-1 break-words">Описание уровня {actualLevel}:</p>
                        <p className="text-xs text-muted-foreground line-clamp-3 break-words">{levelDescription}</p>
                      </div>
                    ) : null;
                  })()}

                  {actualLevel > 0 && requirement && (
                    <div className="space-y-1 w-full min-w-0">
                      <div className="flex justify-between text-sm gap-2">
                        <span className="break-words">Соответствие требованию</span>
                        <span className="font-semibold shrink-0">
                          {Math.min(100, Math.round((actualLevel / requiredLevel) * 100))}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, (actualLevel / requiredLevel) * 100)}
                        className="h-2 w-full"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      </div>

      <Button onClick={handleSave} className="w-full" size="lg">
        Сохранить самооценку
      </Button>

      {isSaved && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg w-full">
          <p className="text-sm text-green-800 dark:text-green-200">
            Самооценка успешно сохранена!
          </p>
        </div>
      )}

      {/* Показываем соответствие профилям */}
      <div className="grid gap-4 md:grid-cols-2 w-full min-w-0">
        <div className="p-4 border rounded-lg w-full min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm break-words">Основной профиль</p>
                <p className="text-xs text-muted-foreground break-words">{mainProfile.name}</p>
              </div>
              <span className="font-bold text-lg shrink-0">{mainProfileMatch}%</span>
            </div>
            <Progress value={mainProfileMatch} className="h-3 w-full" />
          </div>
        </div>

        {additionalMatches.map(({ profileId, profile, match }) => (
          <div key={profileId} className="p-4 border rounded-lg w-full min-w-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm break-words">Дополнительный профиль</p>
                  <p className="text-xs text-muted-foreground break-words">{profile.name}</p>
                </div>
                <span className="font-bold text-lg shrink-0">{match}%</span>
              </div>
              <Progress value={match} className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

