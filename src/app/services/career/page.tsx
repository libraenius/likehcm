"use client";

import { useState, useEffect, useMemo } from "react";
import { getProfiles, getUserProfile, saveUserProfile, getProfileById } from "@/lib/data";
import { getUserCareerTrackProgress } from "@/lib/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserProfile, SkillLevel } from "@/types";
import { SkillAssessment } from "@/components/skill-assessment";
import { CareerTrackProgress } from "@/components/career-track-progress";
import { ClipboardCheck, User, Users, TrendingUp, CheckCircle2, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { ProfileLevelCard } from "@/components/profile-level-card";

function ProfileTooltipContent({ profile }: { profile: Profile }) {
  return (
    <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Описание профиля */}
      {profile.description && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Описание профиля</Label>
          <p className="text-xs text-muted-foreground">{profile.description}</p>
        </div>
      )}

      {/* ТФР */}
      {profile.tfr && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ТФР (Типовая функциональная роль)</Label>
            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
              {profile.tfr}
            </Badge>
          </div>
        </>
      )}

      {/* Уровни профиля */}
      {profile.levels && profile.levels.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Уровни профиля</Label>
            <div className="space-y-2">
              {(() => {
                const levelOrder = ["trainee", "junior", "middle", "senior", "lead"];
                const levelLabels = {
                  trainee: "Стажер",
                  junior: "Младший",
                  middle: "Средний",
                  senior: "Старший",
                  lead: "Ведущий",
                };
                
                // Сортируем уровни в правильном порядке
                const sortedLevels = [...profile.levels].sort((a, b) => {
                  const indexA = levelOrder.indexOf(a.level);
                  const indexB = levelOrder.indexOf(b.level);
                  return indexA - indexB;
                });
                
                return sortedLevels.map((profileLevel, levelIndex) => {
                  const levelLabel = levelLabels[profileLevel.level] || profileLevel.level;
                  
                  return (
                    <ProfileLevelCard
                      key={profileLevel.level}
                      profileLevel={profileLevel}
                      levelLabel={levelLabel}
                      levelIndex={levelIndex}
                    />
                  );
                });
              })()}
            </div>
          </div>
        </>
      )}

      {/* Информация об экспертах */}
      {profile.experts && profile.experts.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Эксперты (владельцы профиля):
            </h3>
            <div className="space-y-2">
              {profile.experts.map((expert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                  <Avatar className="h-12 w-12">
                    {expert.avatar ? (
                      <AvatarImage src={expert.avatar} alt={expert.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {expert.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expert.fullName}</div>
                    <div className="text-xs text-muted-foreground">{expert.position}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CareerPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mainProfileId, setMainProfileId] = useState<string>("");
  const [additionalProfileIds, setAdditionalProfileIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState(getProfiles());
  const [isSkillAssessmentOpen, setIsSkillAssessmentOpen] = useState(false);
  const [isProfileInfoDialogOpen, setIsProfileInfoDialogOpen] = useState(false);
  const [selectedProfileForInfo, setSelectedProfileForInfo] = useState<Profile | null>(null);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserProfile(profile);
      setMainProfileId(profile.mainProfileId || "profile-1");
      setAdditionalProfileIds(profile.additionalProfileIds || []);
    } else {
      // Создаем новый профиль с дефолтным профилем
      const newProfile: UserProfile = {
        userId: "user-1",
        lastName: "Помыткин",
        firstName: "Сергей",
        middleName: "Олегович",
        grade: 12,
        position: "Руководитель экспертизы по тестированию",
        mainProfileId: "profile-1",
        additionalProfileIds: [],
        skills: [],
      };
      setUserProfile(newProfile);
      setMainProfileId("profile-1");
      saveUserProfile(newProfile);
    }
    setProfiles(getProfiles());
  }, []);

  const handleSaveProfileSelection = () => {
    if (!userProfile || !mainProfileId) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      mainProfileId,
      additionalProfileIds,
    };

    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  };

  const handleSkillUpdate = (skills: Array<{ competenceId: string; selfAssessment: SkillLevel; comment?: string }>) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      skills: skills.map((s) => ({
        ...s,
        lastUpdated: new Date(),
      })),
    };

    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
    // Обновляем профили на случай изменений
    setProfiles(getProfiles());
  };

  // Пересчитываем прогресс при изменении профиля или навыков
  const careerTrackProgress = useMemo(() => {
    if (!userProfile?.mainProfileId || !userProfile.skills || userProfile.skills.length === 0) {
      return null;
    }
    return getUserCareerTrackProgress(userProfile);
  }, [userProfile?.mainProfileId, userProfile?.skills]);

  const mainProfile = profiles.find((p) => p.id === mainProfileId);
  const hasCompletedSetup = !!userProfile?.mainProfileId && userProfile.skills && userProfile.skills.length > 0;

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Заголовок */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Карьера</h1>
        <p className="text-muted-foreground">
          Управление вашим профилем, компетенциями и карьерным развитием
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Выбор профиля</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Карьерный прогресс</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Основной профиль */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Основной профиль</CardTitle>
                    <CardDescription>
                      Выберите ваш основной профессиональный профиль
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="main-profile" className="text-sm font-semibold">
                    Профиль <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select value={mainProfileId} onValueChange={setMainProfileId}>
                      <SelectTrigger id="main-profile" className="h-11 w-full">
                        <SelectValue placeholder="Выберите основной профиль" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned" className="w-[var(--radix-select-trigger-width)]">
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mainProfile && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-6 w-6 shrink-0 p-0"
                        onClick={() => {
                          setSelectedProfileForInfo(mainProfile);
                          setIsProfileInfoDialogOpen(true);
                        }}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Дополнительные профили */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Дополнительные профили</CardTitle>
                    <CardDescription>
                      Выберите дополнительные профили (опционально)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Дополнительные профили (максимум 2)
                    </Label>
                    <MultiSelect
                      options={profiles
                        .filter((p) => p.id !== mainProfileId)
                        .map((profile) => ({
                          value: profile.id,
                          label: profile.name,
                        }))}
                      selected={additionalProfileIds}
                      onChange={(selected) => {
                        if (selected.length <= 2) {
                          setAdditionalProfileIds(selected);
                        }
                      }}
                      placeholder="Выберите дополнительные профили..."
                      maxCount={2}
                    />
                    {profiles.filter((p) => p.id !== mainProfileId).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Нет доступных дополнительных профилей
                      </p>
                    )}
                    {additionalProfileIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Выбрано: {additionalProfileIds.length} из 2
                      </p>
                    )}
                  </div>
                  
                  {/* Выбранные дополнительные профили с кнопками Info */}
                  {additionalProfileIds.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Выбранные дополнительные профили:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {additionalProfileIds.map((profileId) => {
                          const profile = profiles.find((p) => p.id === profileId);
                          return profile ? (
                            <div key={profileId} className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                                <Users className="mr-1.5 h-3.5 w-3.5" />
                                {profile.name}
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-6 w-6 shrink-0 p-0"
                                onClick={() => {
                                  setSelectedProfileForInfo(profile);
                                  setIsProfileInfoDialogOpen(true);
                                }}
                                title={`Информация о профиле: ${profile.name}`}
                              >
                                <Info className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Кнопка сохранения */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Готовы сохранить изменения?</p>
              <p className="text-xs text-muted-foreground">
                После сохранения вы сможете пройти самооценку компетенций
              </p>
            </div>
            <Button
              onClick={handleSaveProfileSelection}
              disabled={!mainProfileId}
              size="lg"
              className="shrink-0"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Сохранить профили
            </Button>
          </div>

          {/* Самооценка компетенций */}
          {userProfile?.mainProfileId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Самооценка компетенций
                </CardTitle>
                <CardDescription>
                  Оцените свой уровень владения компетенциями выбранного профиля
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userProfile.skills && userProfile.skills.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Пройдите самооценку компетенций, чтобы увидеть ваш карьерный прогресс
                    </p>
                    <Button
                      onClick={() => setIsSkillAssessmentOpen(true)}
                      className="w-full"
                      size="lg"
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Пройти самооценку компетенций
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold">Самооценка пройдена</p>
                          <p className="text-xs text-muted-foreground">
                            Оценено {userProfile.skills?.length || 0} компетенций
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsSkillAssessmentOpen(true)}
                        variant="outline"
                        size="sm"
                      >
                        Изменить
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {careerTrackProgress ? (
            <CareerTrackProgress progress={careerTrackProgress} userProfile={userProfile || undefined} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Прогресс пока недоступен</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Для отображения карьерного прогресса необходимо выбрать основной профиль и пройти самооценку компетенций
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {!userProfile?.mainProfileId && (
                    <Button
                      onClick={() => {
                        const tabs = document.querySelector('[role="tablist"]') as HTMLElement;
                        const profileTab = tabs?.querySelector('[value="profile"]') as HTMLElement;
                        profileTab?.click();
                      }}
                      variant="outline"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Выбрать профиль
                    </Button>
                  )}
                  {userProfile?.mainProfileId && (!userProfile.skills || userProfile.skills.length === 0) && (
                    <Button onClick={() => setIsSkillAssessmentOpen(true)}>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Пройти самооценку
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isSkillAssessmentOpen} onOpenChange={setIsSkillAssessmentOpen}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto overflow-x-hidden max-w-[95vw] sm:max-w-[95vw] md:max-w-[1600px] lg:max-w-[1600px] xl:max-w-[1600px] 2xl:max-w-[1600px] w-[95vw]"
        >
          <DialogHeader>
            <DialogTitle>Самооценка компетенций</DialogTitle>
            <DialogDescription>
              Оцените свой уровень владения каждой компетенцией от 1 до 5
            </DialogDescription>
          </DialogHeader>
          {userProfile?.mainProfileId ? (
            <div className="overflow-x-hidden w-full">
              <SkillAssessment
                userProfile={userProfile}
                onSkillUpdate={handleSkillUpdate}
                onClose={() => setIsSkillAssessmentOpen(false)}
              />
            </div>
          ) : (
            <div className="py-6">
              <p className="text-muted-foreground text-center">
                Сначала выберите основной профиль
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileInfoDialogOpen} onOpenChange={setIsProfileInfoDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-7xl">
          <DialogHeader>
            <DialogTitle>{selectedProfileForInfo?.name || mainProfile?.name}</DialogTitle>
            <DialogDescription>
              Подробная информация о профиле из справочника
            </DialogDescription>
          </DialogHeader>
          {(selectedProfileForInfo || mainProfile) && (
            <div className="overflow-x-hidden w-full">
              <ProfileTooltipContent profile={selectedProfileForInfo || mainProfile!} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

