"use client";

import { useState, useEffect } from "react";
import {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getCompetences,
} from "@/lib/reference-data";
import type { Profile, ProfileCompetence } from "@/types";
import { getCompetenceById } from "@/lib/data";
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
import { Plus, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import type { SkillLevel } from "@/types";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [competences] = useState(getCompetences());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requiredCompetences: [] as ProfileCompetence[],
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    setProfiles(getProfiles());
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setFormData({ name: "", description: "", requiredCompetences: [] });
    setIsDialogOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description,
      requiredCompetences: [...profile.requiredCompetences],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteProfile(profileToDelete);
      loadProfiles();
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
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
    if (!formData.name || !formData.description) {
      setErrorAlert("Пожалуйста, заполните название и описание");
      return;
    }

    if (editingProfile) {
      updateProfile(editingProfile.id, formData);
    } else {
      createProfile(formData);
    }

    setIsDialogOpen(false);
    setErrorAlert(null);
    loadProfiles();
  };

  const addCompetence = () => {
    setFormData({
      ...formData,
      requiredCompetences: [
        ...formData.requiredCompetences,
        { competenceId: "", requiredLevel: 1 as SkillLevel, weight: 1 },
      ],
    });
  };

  const removeCompetence = (index: number) => {
    setFormData({
      ...formData,
      requiredCompetences: formData.requiredCompetences.filter((_, i) => i !== index),
    });
  };

  const updateCompetence = (index: number, field: keyof ProfileCompetence, value: any) => {
    const updated = [...formData.requiredCompetences];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, requiredCompetences: updated });
  };

  const availableCompetences = competences.filter(
    (comp) => !formData.requiredCompetences.find((c) => c.competenceId === comp.id) || 
    formData.requiredCompetences.find((c, i) => c.competenceId === comp.id && formData.requiredCompetences.indexOf(c) === i)
  );

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
          <h1 className="text-3xl font-bold">Профили</h1>
          <p className="text-muted-foreground mt-2">
            Справочник всех доступных профилей в системе
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить профиль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? "Редактировать профиль" : "Создать профиль"}
              </DialogTitle>
              <DialogDescription>
                {editingProfile
                  ? "Внесите изменения в профиль"
                  : "Добавьте новый профиль в систему"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например, Frontend Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание профиля"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Требуемые компетенции</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCompetence}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.requiredCompetences.map((reqComp, index) => {
                    const comp = getCompetenceById(reqComp.competenceId);
                    return (
                      <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Select
                            value={reqComp.competenceId}
                            onValueChange={(value) =>
                              updateCompetence(index, "competenceId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите компетенцию" />
                            </SelectTrigger>
                            <SelectContent>
                              {competences.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Требуемый уровень</Label>
                              <Select
                                value={reqComp.requiredLevel.toString()}
                                onValueChange={(value) =>
                                  updateCompetence(index, "requiredLevel", parseInt(value) as SkillLevel)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <SelectItem key={level} value={level.toString()}>
                                      {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Вес (1-10)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={reqComp.weight}
                                onChange={(e) =>
                                  updateCompetence(index, "weight", parseInt(e.target.value) || 1)
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCompetence(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {formData.requiredCompetences.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Нет добавленных компетенций
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
                {editingProfile ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>{profile.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(profile)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(profile.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Требуемые компетенции:</h3>
                <div className="space-y-3">
                  {profile.requiredCompetences.map((reqComp) => {
                    const comp = getCompetenceById(reqComp.competenceId);
                    if (!comp) return null;
                    const levelKey = `level${reqComp.requiredLevel}` as keyof typeof comp.levels;
                    const levelDescription = comp.levels?.[levelKey] || "";
                    return (
                      <div
                        key={reqComp.competenceId}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{comp.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Уровень {reqComp.requiredLevel}
                            </Badge>
                            <Badge variant="secondary">
                              Вес {reqComp.weight}
                            </Badge>
                          </div>
                        </div>
                        {levelDescription && (
                          <p className="text-xs text-muted-foreground">
                            {levelDescription}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот профиль? Это действие также удалит все связанные карьерные треки.
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
