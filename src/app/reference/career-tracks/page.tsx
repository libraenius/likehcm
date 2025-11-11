"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getCareerTracks,
  createCareerTrack,
  updateCareerTrack,
  deleteCareerTrack,
  getProfiles,
  getCompetences,
} from "@/lib/reference-data";
import type { CareerTrack, CareerTrackLevel } from "@/types";
import { getProfileById, getCompetenceById } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, AlertCircle, Search } from "lucide-react";
import type { SkillLevel } from "@/types";
import { CareerTalentTree } from "@/components/career-talent-tree";
import { getUserProfile } from "@/lib/data";
import { calculateCareerTrackProgress } from "@/lib/calculations";

export default function CareerTracksPage() {
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [profiles] = useState(getProfiles());
  const [competences] = useState(getCompetences());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<CareerTrack | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    profileId: "",
    levels: [] as CareerTrackLevel[],
  });

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = () => {
    setTracks(getCareerTracks());
  };

  // Фильтрация треков по поисковому запросу
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    
    const query = searchQuery.toLowerCase();
    return tracks.filter((track) => {
      const profile = getProfileById(track.profileId);
      const profileName = profile?.name || "";
      
      return (
        track.name.toLowerCase().includes(query) ||
        track.description.toLowerCase().includes(query) ||
        profileName.toLowerCase().includes(query)
      );
    });
  }, [tracks, searchQuery]);

  const handleCreate = () => {
    setEditingTrack(null);
    setFormData({ name: "", description: "", profileId: "", levels: [] });
    setIsDialogOpen(true);
  };

  const handleEdit = (track: CareerTrack) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      description: track.description,
      profileId: track.profileId,
      levels: [...track.levels],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTrackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (trackToDelete) {
      deleteCareerTrack(trackToDelete);
      loadTracks();
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    }
  };

  useEffect(() => {
    if (errorAlert) {
      const timer = setTimeout(() => {
        setErrorAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorAlert]);

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.profileId) {
      setErrorAlert("Пожалуйста, заполните название, описание и выберите профиль");
      return;
    }

    if (editingTrack) {
      updateCareerTrack(editingTrack.id, formData);
    } else {
      createCareerTrack(formData);
    }

    setIsDialogOpen(false);
    setErrorAlert(null);
    loadTracks();
  };

  const addLevel = () => {
    const newLevelNumber = formData.levels.length > 0
      ? Math.max(...formData.levels.map((l) => l.level)) + 1
      : 1;
    setFormData({
      ...formData,
      levels: [
        ...formData.levels,
        {
          level: newLevelNumber,
          name: "",
          description: "",
          requiredSkills: {},
          minMatchPercentage: 60,
        },
      ],
    });
  };

  const removeLevel = (index: number) => {
    setFormData({
      ...formData,
      levels: formData.levels.filter((_, i) => i !== index),
    });
  };

  const updateLevel = (index: number, field: keyof CareerTrackLevel, value: any) => {
    const updated = [...formData.levels];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, levels: updated });
  };

  const addSkillToLevel = (levelIndex: number) => {
    const level = formData.levels[levelIndex];
    const updatedSkills = { ...level.requiredSkills };
    // Находим первую доступную компетенцию
    const availableComp = competences.find(
      (c) => !updatedSkills[c.id]
    );
    if (availableComp) {
      updatedSkills[availableComp.id] = 1 as SkillLevel;
      updateLevel(levelIndex, "requiredSkills", updatedSkills);
    }
  };

  const removeSkillFromLevel = (levelIndex: number, competenceId: string) => {
    const level = formData.levels[levelIndex];
    const updatedSkills = { ...level.requiredSkills };
    delete updatedSkills[competenceId];
    updateLevel(levelIndex, "requiredSkills", updatedSkills);
  };

  const updateSkillLevel = (levelIndex: number, competenceId: string, level: SkillLevel) => {
    const trackLevel = formData.levels[levelIndex];
    const updatedSkills = { ...trackLevel.requiredSkills, [competenceId]: level };
    updateLevel(levelIndex, "requiredSkills", updatedSkills);
  };

  return (
    <div className="space-y-6">
      {errorAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{errorAlert}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Карьерные треки</h1>
          <p className="text-muted-foreground">
            Справочник карьерных треков с уровнями развития
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить карьерный трек
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrack ? "Редактировать карьерный трек" : "Создать карьерный трек"}
              </DialogTitle>
              <DialogDescription>
                {editingTrack
                  ? "Внесите изменения в карьерный трек"
                  : "Добавьте новый карьерный трек в систему"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например, Frontend Developer Track"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile">Профиль *</Label>
                  <Select
                    value={formData.profileId}
                    onValueChange={(value) => setFormData({ ...formData, profileId: value })}
                  >
                    <SelectTrigger id="profile">
                      <SelectValue placeholder="Выберите профиль" />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание карьерного трека"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Уровни трека</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLevel}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить уровень
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.levels
                    .sort((a, b) => a.level - b.level)
                    .map((level, levelIndex) => {
                      const actualIndex = formData.levels.findIndex((l) => l.level === level.level);
                      return (
                        <div key={levelIndex} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Номер уровня</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={level.level}
                                  onChange={(e) =>
                                    updateLevel(actualIndex, "level", parseInt(e.target.value) || 1)
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Минимальное соответствие (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={level.minMatchPercentage}
                                  onChange={(e) =>
                                    updateLevel(actualIndex, "minMatchPercentage", parseInt(e.target.value) || 60)
                                  }
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Название уровня</Label>
                                <Input
                                  value={level.name}
                                  onChange={(e) =>
                                    updateLevel(actualIndex, "name", e.target.value)
                                  }
                                  placeholder="Например, Junior Developer"
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Описание уровня</Label>
                                <Textarea
                                  value={level.description}
                                  onChange={(e) =>
                                    updateLevel(actualIndex, "description", e.target.value)
                                  }
                                  placeholder="Описание уровня"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLevel(actualIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Требуемые навыки</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addSkillToLevel(actualIndex)}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Добавить навык
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(level.requiredSkills).map(([competenceId, skillLevel]) => {
                                const comp = getCompetenceById(competenceId);
                                if (!comp) return null;
                                return (
                                  <div key={competenceId} className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <span className="flex-1 text-sm">{comp.name}</span>
                                    <Select
                                      value={skillLevel.toString()}
                                      onValueChange={(value) =>
                                        updateSkillLevel(actualIndex, competenceId, parseInt(value) as SkillLevel)
                                      }
                                    >
                                      <SelectTrigger className="w-24">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5].map((lvl) => (
                                          <SelectItem key={lvl} value={lvl.toString()}>
                                            {lvl}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeSkillFromLevel(actualIndex, competenceId)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                              {Object.keys(level.requiredSkills).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  Нет добавленных навыков
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {formData.levels.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Нет добавленных уровней
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {editingTrack ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию, описанию или профилю..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {filteredTracks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "Карьерные треки не найдены" : "Нет карьерных треков"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Попробуйте изменить поисковый запрос"
                    : "Создайте первый карьерный трек, чтобы начать работу"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить карьерный трек
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTracks.map((track) => {
          const profile = getProfileById(track.profileId);
          return (
            <Card key={track.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{track.name}</CardTitle>
                    <CardDescription>{track.description}</CardDescription>
                    {profile && (
                      <Badge variant="outline" className="w-fit mt-2">
                        Профиль: {profile.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(track)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(track.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Дерево развития талантов</h3>
                    <p className="text-sm text-muted-foreground">
                      Визуализация карьерного пути в виде дерева талантов. Разблокируйте уровни, развивая необходимые навыки.
                    </p>
                  </div>
                  <CareerTalentTree
                    careerTrack={track}
                    progress={(() => {
                      const userProfile = getUserProfile();
                      if (!userProfile) return null;
                      return calculateCareerTrackProgress(userProfile, track);
                    })()}
                    userSkills={(() => {
                      const userProfile = getUserProfile();
                      if (!userProfile) return {};
                      const skills: Record<string, number> = {};
                      userProfile.skills.forEach((skill) => {
                        skills[skill.competenceId] = skill.selfAssessment;
                      });
                      return skills;
                    })()}
                  />
                </div>
              </CardContent>
            </Card>
          );
          })
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот карьерный трек?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
