"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getCareerTracks, getCompetenceById, getProfileById } from "@/lib/data";
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

  const currentLevel = track.levels.find((l) => l.level === progress.currentLevel);
  const nextLevel = track.levels.find((l) => l.level === progress.currentLevel + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Карьерный прогресс</CardTitle>
          <CardDescription>{track.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Текущий уровень</span>
              <Badge variant={progress.currentLevel > 0 ? "default" : "secondary"}>
                {currentLevel ? currentLevel.name : "Не определен"}
              </Badge>
            </div>
            <Progress value={progress.matchPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Соответствие: {progress.matchPercentage}%</span>
              {nextLevel && (
                <span>Следующий уровень: {nextLevel.minMatchPercentage}%</span>
              )}
            </div>
          </div>

          {currentLevel && (
            <div className="space-y-2">
              <h3 className="font-semibold">Текущий уровень: {currentLevel.name}</h3>
              <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
            </div>
          )}

          {nextLevel && (
            <div className="space-y-2">
              <h3 className="font-semibold">Следующий уровень: {nextLevel.name}</h3>
              <p className="text-sm text-muted-foreground">{nextLevel.description}</p>
              <div className="text-sm">
                <p className="font-medium mb-2">Требуемые навыки для перехода:</p>
                <div className="space-y-1">
                  {Object.entries(nextLevel.requiredSkills).map(
                    ([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const userSkill = progress.skillGaps.find(
                        (g) => g.competenceId === competenceId
                      );
                      const currentLevel = userSkill?.currentLevel || 0;
                      const gap = userSkill?.gap || requiredLevel;

                      return (
                        <div
                          key={competenceId}
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                        >
                          <span>{comp.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Текущий: {currentLevel}
                            </span>
                            <span>→</span>
                            <Badge variant={gap === 0 ? "default" : "outline"}>
                              Требуется: {requiredLevel}
                            </Badge>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {progress.skillGaps.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Пробелы в навыках</h3>
              <div className="space-y-2">
                {progress.skillGaps.map((gap) => {
                  const comp = getCompetenceById(gap.competenceId);
                  if (!comp) return null;

                  return (
                    <div
                      key={gap.competenceId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{comp.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Текущий уровень: {gap.currentLevel} → Требуется: {gap.requiredLevel}
                        </p>
                      </div>
                      <Badge variant="destructive">Не хватает {gap.gap}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Показываем все уровни трека */}
      <Card>
        <CardHeader>
          <CardTitle>Все уровни карьерного трека</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {track.levels.map((level, index) => {
              const isCurrent = level.level === progress.currentLevel;
              const isCompleted = level.level < progress.currentLevel;
              const isLocked = level.level > progress.currentLevel;

              return (
                <div
                  key={level.level}
                  className={`p-4 border rounded-lg ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : isCompleted
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : isLocked
                      ? "border-muted bg-muted/50 opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCurrent
                            ? "default"
                            : isCompleted
                            ? "default"
                            : "secondary"
                        }
                      >
                        Уровень {level.level}
                      </Badge>
                      <h4 className="font-semibold">{level.name}</h4>
                    </div>
                    {isCurrent && <Badge variant="outline">Текущий</Badge>}
                    {isCompleted && <Badge variant="default">Завершен</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {level.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Минимальное соответствие: {level.minMatchPercentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

