"use client";

import { useState, useEffect } from "react";
import { getProfiles, getUserProfile, saveUserProfile } from "@/lib/data";
import { getUserCareerTrackProgress } from "@/lib/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { UserProfile, SkillLevel } from "@/types";
import { SkillAssessment } from "@/components/skill-assessment";
import { CareerTrackProgress } from "@/components/career-track-progress";
import { ClipboardCheck } from "lucide-react";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mainProfileId, setMainProfileId] = useState<string>("");
  const [additionalProfileIds, setAdditionalProfileIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState(getProfiles());
  const [isSkillAssessmentOpen, setIsSkillAssessmentOpen] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserProfile(profile);
      setMainProfileId(profile.mainProfileId);
      setAdditionalProfileIds(profile.additionalProfileIds || []);
    } else {
      // Создаем новый профиль
      const newProfile: UserProfile = {
        userId: "user-1",
        mainProfileId: "",
        additionalProfileIds: [],
        skills: [],
      };
      setUserProfile(newProfile);
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

  const handleSkillUpdate = (skills: Array<{ competenceId: string; selfAssessment: SkillLevel }>) => {
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

  const careerTrackProgress = userProfile?.mainProfileId && userProfile.skills && userProfile.skills.length > 0
    ? getUserCareerTrackProgress(userProfile)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мой профиль</h1>
        <p className="text-muted-foreground mt-2">
          Управление вашим профилем, навыками и карьерным развитием
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Выбор профиля</TabsTrigger>
          <TabsTrigger value="progress">Карьерный прогресс</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Выбор профилей</CardTitle>
              <CardDescription>
                Выберите основной профиль и дополнительные профили (опционально)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="main-profile">Основной профиль *</Label>
                <Select value={mainProfileId} onValueChange={setMainProfileId}>
                  <SelectTrigger id="main-profile">
                    <SelectValue placeholder="Выберите основной профиль" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Дополнительные профили (опционально)</Label>
                <div className="space-y-3">
                  {profiles
                    .filter((p) => p.id !== mainProfileId)
                    .map((profile) => (
                      <div key={profile.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`profile-${profile.id}`}
                          checked={additionalProfileIds.includes(profile.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAdditionalProfileIds([...additionalProfileIds, profile.id]);
                            } else {
                              setAdditionalProfileIds(
                                additionalProfileIds.filter((id) => id !== profile.id)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`profile-${profile.id}`}
                          className="font-normal cursor-pointer"
                        >
                          {profile.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              <Button onClick={handleSaveProfileSelection} disabled={!mainProfileId}>
                Сохранить выбор профилей
              </Button>

              {userProfile?.mainProfileId && (
                <div className="space-y-4">
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold mb-2">Выбранные профили:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">
                        Основной: {profiles.find((p) => p.id === userProfile.mainProfileId)?.name}
                      </Badge>
                      {userProfile.additionalProfileIds.map((id) => {
                        const profile = profiles.find((p) => p.id === id);
                        return profile ? (
                          <Badge key={id} variant="secondary">
                            {profile.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsSkillAssessmentOpen(true)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Пройти самооценку навыков
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {careerTrackProgress ? (
            <CareerTrackProgress progress={careerTrackProgress} userProfile={userProfile || undefined} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Прогресс будет отображаться после выбора основного профиля и прохождения самооценки навыков
                </p>
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
            <DialogTitle>Самооценка навыков</DialogTitle>
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
    </div>
  );
}

