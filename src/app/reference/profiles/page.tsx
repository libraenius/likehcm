"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Plus, Pencil, Trash2, X, AlertCircle, Search, Info, Users, ChevronDown, ChevronRight, Briefcase, Link2, GitCompare, ClipboardList } from "lucide-react";
import type { SkillLevel, ProfileLevel } from "@/types";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { ProfileCreationWizard } from "@/components/profile-creation-wizard";

const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];

const profileLevelColors = {
  trainee: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  junior: "bg-slate-200 text-slate-700 border-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600",
  middle: "bg-slate-300 text-slate-800 border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500",
  senior: "bg-slate-400 text-slate-900 border-slate-600 dark:bg-slate-500 dark:text-slate-100 dark:border-slate-400",
  lead: "bg-slate-500 text-slate-950 border-slate-700 dark:bg-slate-400 dark:text-slate-50 dark:border-slate-300",
};

function ProfileLevelCard({
  profileLevel,
  levelLabel,
  levelIndex,
}: {
  profileLevel: ProfileLevel;
  levelLabel: string;
  levelIndex: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const levelColor = profileLevelColors[profileLevel.level] || "bg-slate-100 text-slate-700 border-slate-300";

  return (
    <div className="border rounded-md overflow-hidden bg-card max-w-full">
      <div
        className="p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs px-2 py-0.5 flex-shrink-0 ${levelColor}`}>
                {levelLabel}
              </Badge>
              <span className="font-semibold text-sm break-words">{profileLevel.name}</span>
            </div>
            {!isExpanded && (
              <div className="text-sm text-muted-foreground break-words mt-1">
                {profileLevel.description}
              </div>
            )}
          </div>
        </div>
      </div>

          {isExpanded && (
        <div className="border-t bg-muted/30 p-2.5 space-y-2.5 overflow-x-hidden">
          {/* Обязанности */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              Обязанности:
            </h4>
            <ul className="space-y-1 ml-4">
              {profileLevel.responsibilities.map((responsibility, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
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
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              Требования:
            </h4>
            <div className="space-y-2 ml-4">
              <div className="text-sm">
                <span className="font-medium text-foreground">Образование: </span>
                <span className="text-muted-foreground break-words">
                  {profileLevel.education || "Не указано"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Стаж: </span>
                <span className="text-muted-foreground break-words">
                  {profileLevel.experience || "Не указано"}
                </span>
              </div>
            </div>
          </div>
          <Separator className="my-2" />

          {/* Компетенции */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              Компетенции:
            </h4>
            <div className="space-y-3">
              {/* Профессиональные компетенции */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Профессиональные компетенции:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "профессиональные компетенции";
                    })
                    .map(([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";

                      return (
                        <Badge
                          key={competenceId}
                          variant="outline"
                          className={`text-sm border ${professionalColor}`}
                        >
                          {comp.name} {requiredLevel}
                        </Badge>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "профессиональные компетенции";
                  }).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Нет профессиональных компетенций</p>
                  )}
                </div>
              </div>

              {/* Корпоративные компетенции */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Корпоративные компетенции:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "корпоративные компетенции";
                    })
                    .map(([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";

                      return (
                        <Badge
                          key={competenceId}
                          variant="outline"
                          className={`text-sm border ${corporateColor}`}
                        >
                          {comp.name} {requiredLevel}
                        </Badge>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "корпоративные компетенции";
                  }).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Нет корпоративных компетенций</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Примеры задач */}
          {profileLevel.taskExamples && profileLevel.taskExamples.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1.5">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                  Уровень сложности решаемых задач:
                </h4>
                <ul className="space-y-2 ml-4">
                  {profileLevel.taskExamples.map((task, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
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
        </div>
      )}
    </div>
  );
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [competences] = useState(getCompetences());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [addingSkillToLevel, setAddingSkillToLevel] = useState<number | null>(null);
  const [selectedCompetenceForSkill, setSelectedCompetenceForSkill] = useState<string>("");
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tfr: "",
    requiredCompetences: [] as ProfileCompetence[],
    experts: [] as Array<{ avatar: string; fullName: string; position: string }>,
    levels: [] as Array<{
      level: "trainee" | "junior" | "middle" | "senior" | "lead";
      name: string;
      description: string;
      responsibilities: string[];
      education?: string;
      experience?: string;
      requiredSkills: Record<string, SkillLevel>;
    }>,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    // Автоматически выбираем первый профиль при загрузке
    if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0]);
    }
    // Если выбранный профиль был удален, выбираем первый доступный
    if (selectedProfile && !profiles.find(p => p.id === selectedProfile.id)) {
      setSelectedProfile(profiles.length > 0 ? profiles[0] : null);
    }
  }, [profiles, selectedProfile]);

  const loadProfiles = () => {
    setProfiles(getProfiles());
  };

  // Фильтрация профилей по поисковому запросу
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    
    const query = searchQuery.toLowerCase();
    return profiles.filter((profile) => {
      const compNames = profile.requiredCompetences
        .map((reqComp) => {
          const comp = getCompetenceById(reqComp.competenceId);
          return comp?.name || "";
        })
        .join(" ")
        .toLowerCase();
      
      const tfrMatch = profile.tfr?.toLowerCase().includes(query) || false;
      
      return (
        profile.name.toLowerCase().includes(query) ||
        profile.description.toLowerCase().includes(query) ||
        compNames.includes(query) ||
        tfrMatch
      );
    });
  }, [profiles, searchQuery]);

  const handleCreate = () => {
    setEditingProfile(null);
    setAddingSkillToLevel(null);
    setSelectedCompetenceForSkill("");
    setFormData({
      name: "",
      description: "",
      tfr: "",
      requiredCompetences: [],
      experts: [],
      levels: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setAddingSkillToLevel(null);
    setSelectedCompetenceForSkill("");
    setFormData({
      name: profile.name,
      description: profile.description,
      tfr: profile.tfr || "",
      requiredCompetences: [...profile.requiredCompetences],
      experts: profile.experts
        ? profile.experts.map((expert) => ({
            avatar: expert.avatar || "",
            fullName: expert.fullName || "",
            position: expert.position || "",
          }))
        : [],
      levels: profile.levels
        ? profile.levels.map((level) => ({
            level: level.level,
            name: level.name,
            description: level.description,
            responsibilities: [...level.responsibilities],
            education: level.education || "",
            experience: level.experience || "",
            requiredSkills: { ...level.requiredSkills },
          }))
        : [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      const wasSelected = selectedProfile?.id === profileToDelete;
      deleteProfile(profileToDelete);
      loadProfiles();
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
      // Если удалили выбранный профиль, выбираем первый доступный
      if (wasSelected) {
        const remainingProfiles = getProfiles();
        setSelectedProfile(remainingProfiles.length > 0 ? remainingProfiles[0] : null);
      }
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

    if (formData.requiredCompetences.length === 0) {
      setErrorAlert("Добавьте хотя бы одну компетенцию");
      return;
    }

    // Проверка на дубликаты компетенций
    const competenceIds = formData.requiredCompetences.map((c) => c.competenceId);
    const uniqueIds = new Set(competenceIds);
    if (uniqueIds.size !== competenceIds.length) {
      setErrorAlert("Нельзя добавлять одну и ту же компетенцию дважды");
      return;
    }

    // Проверка на пустые компетенции
    const hasEmptyCompetence = formData.requiredCompetences.some(
      (c) => !c.competenceId
    );
    if (hasEmptyCompetence) {
      setErrorAlert("Заполните все поля компетенций корректно");
      return;
    }

    // Подготовка данных профиля с информацией об экспертах
    const profileData: Partial<Omit<Profile, "id">> = {
      name: formData.name,
      description: formData.description,
      tfr: formData.tfr.trim() || undefined,
      requiredCompetences: formData.requiredCompetences,
    };

    // Добавляем информацию об экспертах, если она заполнена
    const validExperts = formData.experts
      .filter((expert) => expert.fullName.trim() || expert.position.trim())
      .map((expert) => ({
        avatar: expert.avatar.trim() || undefined,
        fullName: expert.fullName.trim(),
        position: expert.position.trim(),
      }));

    if (validExperts.length > 0) {
      profileData.experts = validExperts;
    }

    // Добавляем уровни профиля, если они заполнены
    const validLevels = formData.levels
      .filter((level) => level.name.trim() && level.description.trim())
      .map((level) => ({
        level: level.level,
        name: level.name.trim(),
        description: level.description.trim(),
        responsibilities: level.responsibilities.filter((r) => r.trim()),
        education: level.education?.trim() || undefined,
        experience: level.experience?.trim() || undefined,
        requiredSkills: level.requiredSkills,
      }));

    if (validLevels.length > 0) {
      profileData.levels = validLevels;
    }

    if (editingProfile) {
      updateProfile(editingProfile.id, profileData);
      // После обновления обновляем выбранный профиль
      const updatedProfiles = getProfiles();
      const updatedProfile = updatedProfiles.find(p => p.id === editingProfile.id);
      if (updatedProfile) {
        setSelectedProfile(updatedProfile);
      }
    } else {
      const newProfile = createProfile(profileData as Omit<Profile, "id">);
      // После создания выбираем новый профиль
      setSelectedProfile(newProfile);
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
        { competenceId: "", requiredLevel: 2 as SkillLevel },
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

  // Получаем доступные компетенции (не добавленные в форму)
  const availableCompetences = useMemo(() => {
    const addedIds = new Set(formData.requiredCompetences.map((c) => c.competenceId));
    return competences.filter((comp) => comp.id && !addedIds.has(comp.id));
  }, [competences, formData.requiredCompetences]);

  // Функции для управления уровнями профиля
  const levelOptions: Array<{ value: "trainee" | "junior" | "middle" | "senior" | "lead"; label: string }> = [
    { value: "trainee", label: "Стажер (Trainee)" },
    { value: "junior", label: "Младший (Junior)" },
    { value: "middle", label: "Средний (Middle)" },
    { value: "senior", label: "Старший (Senior)" },
    { value: "lead", label: "Ведущий (Lead)" },
  ];

  const addLevel = () => {
    const usedLevels = new Set(formData.levels.map((l) => l.level));
    const availableLevel = levelOptions.find((opt) => !usedLevels.has(opt.value));
    
    if (availableLevel) {
      setFormData({
        ...formData,
        levels: [
          ...formData.levels,
          {
            level: availableLevel.value,
            name: "",
            description: "",
            responsibilities: [],
            education: "",
            experience: "",
            requiredSkills: {},
          },
        ],
      });
    }
  };

  const removeLevel = (index: number) => {
    setFormData({
      ...formData,
      levels: formData.levels.filter((_, i) => i !== index),
    });
  };

  const updateLevel = (index: number, field: string, value: any) => {
    const updated = [...formData.levels];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, levels: updated });
  };

  const addResponsibility = (levelIndex: number) => {
    const updated = [...formData.levels];
    updated[levelIndex].responsibilities.push("");
    setFormData({ ...formData, levels: updated });
  };

  const removeResponsibility = (levelIndex: number, respIndex: number) => {
    const updated = [...formData.levels];
    updated[levelIndex].responsibilities = updated[levelIndex].responsibilities.filter((_, i) => i !== respIndex);
    setFormData({ ...formData, levels: updated });
  };

  const updateResponsibility = (levelIndex: number, respIndex: number, value: string) => {
    const updated = [...formData.levels];
    updated[levelIndex].responsibilities[respIndex] = value;
    setFormData({ ...formData, levels: updated });
  };

  const addLevelSkill = (levelIndex: number, competenceId?: string) => {
    const updated = [...formData.levels];
    const levelSkills = new Set(Object.keys(updated[levelIndex].requiredSkills));
    
    if (competenceId && !levelSkills.has(competenceId)) {
      updated[levelIndex].requiredSkills[competenceId] = 2 as SkillLevel;
      setFormData({ ...formData, levels: updated });
      setAddingSkillToLevel(null);
      setSelectedCompetenceForSkill("");
    } else {
      // Если компетенция не указана, открываем режим выбора
      setAddingSkillToLevel(levelIndex);
    }
  };

  const confirmAddLevelSkill = (levelIndex: number) => {
    if (selectedCompetenceForSkill) {
      addLevelSkill(levelIndex, selectedCompetenceForSkill);
    }
  };

  const removeLevelSkill = (levelIndex: number, competenceId: string) => {
    const updated = [...formData.levels];
    const { [competenceId]: removed, ...rest } = updated[levelIndex].requiredSkills;
    updated[levelIndex].requiredSkills = rest;
    setFormData({ ...formData, levels: updated });
  };

  const updateLevelSkill = (levelIndex: number, competenceId: string, level: SkillLevel) => {
    const updated = [...formData.levels];
    updated[levelIndex].requiredSkills[competenceId] = level;
    setFormData({ ...formData, levels: updated });
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

      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Профили</h1>
          <p className="text-muted-foreground">
            Управление профилями разработчиков и их компетенциями
          </p>
        </div>
        <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Добавить профиль
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию, описанию или компетенциям..."
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

      {/* Двухколоночная структура */}
      {filteredProfiles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "Профили не найдены" : "Нет профилей"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "Создайте первый профиль, чтобы начать работу"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить профиль
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 min-h-[calc(100vh-280px)] w-full overflow-x-hidden">
          {/* Левая колонка - список профилей (фиксированная ширина) */}
          <div className="w-[300px] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
            <div className="p-2 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Список профилей</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedProfile?.id === profile.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium text-sm break-words">{profile.name}</div>
                    <div className={`text-xs mt-0.5 break-words ${
                      selectedProfile?.id === profile.id
                        ? "text-accent-foreground/80"
                        : "text-muted-foreground"
                    }`}>
                      {profile.description.length > 50
                        ? profile.description.substring(0, 50) + "..."
                        : profile.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка - детальная информация (оставшееся пространство) */}
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-280px)]">
            {selectedProfile ? (
              <Card className="w-full max-w-full overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1 break-words">{selectedProfile.name}</CardTitle>
                      <CardDescription className="text-base break-words">
                        {selectedProfile.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(selectedProfile)}
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(selectedProfile.id)}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 overflow-x-hidden">
                  <div className="space-y-4 max-w-full">
                    {/* ТФР */}
                    {selectedProfile.tfr && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">ТФР (Типовая функциональная роль)</Label>
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">
                            {selectedProfile.tfr}
                          </Badge>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Компетенции - Облако тегов */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Обязательные компетенции:
                      </h3>
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/20 min-h-[80px] overflow-x-hidden">
                          {selectedProfile.requiredCompetences.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Нет компетенций</p>
                          ) : (
                            (() => {
                              // Разделяем компетенции на профессиональные и корпоративные
                              const professional: typeof selectedProfile.requiredCompetences = [];
                              const corporate: typeof selectedProfile.requiredCompetences = [];
                              
                              selectedProfile.requiredCompetences.forEach((reqComp) => {
                                const comp = getCompetenceById(reqComp.competenceId);
                                if (!comp) return;
                                
                                if (comp.type === "профессиональные компетенции") {
                                  professional.push(reqComp);
                                } else {
                                  corporate.push(reqComp);
                                }
                              });
                              
                              // Сортируем: сначала профессиональные, затем корпоративные
                              const sortedCompetences = [...professional, ...corporate];
                              
                              return sortedCompetences.map((reqComp) => {
                                const comp = getCompetenceById(reqComp.competenceId);
                                if (!comp) return null;
                                
                                const levelName = levelNames[reqComp.requiredLevel - 1];
                                const isCorporate = comp.type === "корпоративные компетенции";
                                
                                // Единая заливка для всех профессиональных компетенций (как у DevOps)
                                const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";
                                
                                // Единая светлосиняя заливка для всех корпоративных компетенций (аналогично фиолетовой)
                                const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";
                                
                                const tagColor = isCorporate 
                                  ? corporateColor 
                                  : professionalColor;
                                
                                // Уменьшенные размеры тегов (не круглые)
                                const sizeClasses = [
                                  "text-[10px] px-1.5 py-0.5 rounded-md", // level 1
                                  "text-[11px] px-2 py-0.5 rounded-md", // level 2
                                  "text-xs px-2 py-1 rounded-md", // level 3
                                  "text-sm px-2.5 py-1 rounded-md", // level 4
                                  "text-sm px-3 py-1.5 rounded-md", // level 5
                                ];
                                
                                return (
                                  <TooltipPrimitive.Root key={reqComp.competenceId}>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className={`${sizeClasses[reqComp.requiredLevel - 1]} ${tagColor} hover:opacity-80 transition-opacity cursor-default`}
                                      >
                                        <span className="font-medium">{comp.name}</span>
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-popover text-popover-foreground border shadow-md [&>svg]:bg-popover [&>svg]:fill-popover">
                                      <div className="space-y-1">
                                        <div className="font-semibold text-sm">
                                          {comp.name}
                                        </div>
                                        <div className="text-xs opacity-80 mb-1">
                                          {comp.type}
                                        </div>
                                        <div className="text-xs">
                                          {comp.description}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </TooltipPrimitive.Root>
                                );
                              });
                            })()
                          )}
                        </div>
                      </TooltipProvider>
                    </div>

                    {/* Уровни профиля */}
                    {selectedProfile.levels && selectedProfile.levels.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3 className="font-semibold text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            Уровни профиля:
                          </h3>
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
                              const sortedLevels = [...selectedProfile.levels].sort((a, b) => {
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

                    {/* Ссылка для сравнения уровней и экспертов */}
                    {selectedProfile.levels && selectedProfile.levels.length > 0 && (
                      <div className="flex items-center justify-center py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setComparisonDialogOpen(true)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Матрица верификации различий между уровнями профиля
                        </Button>
                      </div>
                    )}

                    {/* Информация об экспертах */}
                    {selectedProfile.experts && selectedProfile.experts.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Эксперты (владельцы профиля):
                          </h3>
                          <div className="space-y-2">
                            {selectedProfile.experts.map((expert, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20 overflow-hidden">
                                <Avatar className="h-12 w-12 flex-shrink-0">
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
                                  <div className="font-semibold text-base break-words">{expert.fullName}</div>
                                  <div className="text-sm text-muted-foreground break-words">{expert.position}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Выберите профиль</h3>
                  <p className="text-muted-foreground">
                    Выберите профиль из списка слева, чтобы просмотреть подробную информацию
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? "Редактировать профиль" : "Создать профиль"}
            </DialogTitle>
          </DialogHeader>
          {isDialogOpen && (
            <ProfileCreationWizard
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onSave={(profileData) => {
                const profileDataWithLevels: Omit<Profile, "id"> = {
                  name: profileData.name,
                  description: profileData.description,
                  tfr: profileData.tfr,
                  requiredCompetences: profileData.requiredCompetences,
                  experts: profileData.experts && profileData.experts.length > 0 ? profileData.experts : undefined,
                  levels: profileData.levels && profileData.levels.length > 0 ? profileData.levels : undefined,
                };

                if (editingProfile) {
                  updateProfile(editingProfile.id, profileDataWithLevels);
                } else {
                  createProfile(profileDataWithLevels);
                }
                loadProfiles();
                setIsDialogOpen(false);
                setEditingProfile(null);
                setErrorAlert(null);
              }}
              editingProfile={editingProfile}
              existingProfiles={profiles}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот профиль? Это действие также удалит все связанные карьерные треки и не может быть отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог сравнения уровней и экспертов */}
      <Dialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Матрица верификации различий между уровнями профиля
            </DialogTitle>
            <DialogDescription>
              Горизонтальное сравнение всех атрибутов между уровнями профиля
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && selectedProfile.levels && selectedProfile.levels.length > 0 && (
            <Tabs defaultValue="responsibilities" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="responsibilities">Обязанности и требования к образованию и стажу</TabsTrigger>
                <TabsTrigger value="competences">Компетенции</TabsTrigger>
                <TabsTrigger value="tasks">Уровень сложности решаемых задач</TabsTrigger>
              </TabsList>
              
              <TabsContent value="responsibilities" className="mt-4">
                <div className="py-4 overflow-x-auto">
                  {(() => {
                    const levelOrder = ["trainee", "junior", "middle", "senior", "lead"];
                    const levelLabels = {
                      trainee: "Стажер",
                      junior: "Младший",
                      middle: "Средний",
                      senior: "Старший",
                      lead: "Ведущий",
                    };
                    
                    const sortedLevels = [...selectedProfile.levels].sort((a, b) => {
                      const indexA = levelOrder.indexOf(a.level);
                      const indexB = levelOrder.indexOf(b.level);
                      return indexA - indexB;
                    });

                    return (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="border p-2 text-left font-semibold text-sm sticky left-0 bg-muted/50 z-10 min-w-[250px]">
                                  Обязанности и требования
                                </th>
                                {sortedLevels.map((level) => {
                                  const levelLabel = levelLabels[level.level] || level.level;
                                  const levelColor = profileLevelColors[level.level] || "bg-slate-100 text-slate-700 border-slate-300";
                                  return (
                                    <th
                                      key={level.level}
                                      className="border p-2 text-center font-semibold text-sm min-w-[200px] align-top"
                                    >
                                      <Badge variant="outline" className={`text-base px-4 py-1.5 font-semibold ${levelColor}`}>
                                        {levelLabel}
                                      </Badge>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {/* Обязанности */}
                              <tr className="hover:bg-muted/30 transition-colors">
                                <td className="border p-2 text-sm font-medium sticky left-0 bg-background z-10">
                                  Обязанности
                                </td>
                                {sortedLevels.map((level) => (
                                  <td key={level.level} className="border p-2 text-sm text-left align-top">
                                    {level.responsibilities && level.responsibilities.length > 0 ? (
                                      <ul className="space-y-1">
                                        {level.responsibilities.map((resp, idx) => (
                                          <li key={idx} className="text-sm">
                                            <div className="flex items-start gap-1.5">
                                              <span className="text-foreground mt-0.5 flex-shrink-0">•</span>
                                              <div className="flex-1 whitespace-pre-line break-words">{resp}</div>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                              
                              {/* Образование */}
                              <tr className="hover:bg-muted/30 transition-colors">
                                <td className="border p-2 text-sm font-medium sticky left-0 bg-background z-10">
                                  Образование
                                </td>
                                {sortedLevels.map((level) => (
                                  <td key={level.level} className="border p-2 text-sm text-left">
                                    {level.education || <span className="text-muted-foreground">Не указано</span>}
                                  </td>
                                ))}
                              </tr>
                              
                              {/* Стаж */}
                              <tr className="hover:bg-muted/30 transition-colors">
                                <td className="border p-2 text-sm font-medium sticky left-0 bg-background z-10">
                                  Стаж
                                </td>
                                {sortedLevels.map((level) => (
                                  <td key={level.level} className="border p-2 text-sm text-left">
                                    {level.experience || <span className="text-muted-foreground">Не указано</span>}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
              
              <TabsContent value="competences" className="mt-4">
                <div className="py-4 overflow-x-auto">
                  {(() => {
                    const levelOrder = ["trainee", "junior", "middle", "senior", "lead"];
                    const levelLabels = {
                      trainee: "Стажер",
                      junior: "Младший",
                      middle: "Средний",
                      senior: "Старший",
                      lead: "Ведущий",
                    };
                    
                    const sortedLevels = [...selectedProfile.levels].sort((a, b) => {
                      const indexA = levelOrder.indexOf(a.level);
                      const indexB = levelOrder.indexOf(b.level);
                      return indexA - indexB;
                    });

                    // Собираем все уникальные компетенции из всех уровней
                    const allCompetenceIds = new Set<string>();
                    sortedLevels.forEach(level => {
                      Object.keys(level.requiredSkills).forEach(id => allCompetenceIds.add(id));
                    });

                    // Создаем карту компетенций по уровням
                    const competenceMap = new Map<string, Map<string, SkillLevel>>();
                    allCompetenceIds.forEach(competenceId => {
                      const levelMap = new Map<string, SkillLevel>();
                      sortedLevels.forEach(level => {
                        if (level.requiredSkills[competenceId]) {
                          levelMap.set(level.level, level.requiredSkills[competenceId]);
                        }
                      });
                      competenceMap.set(competenceId, levelMap);
                    });

                    // Сортируем все компетенции: сначала профессиональные, потом корпоративные
                    const allCompetencesSorted = Array.from(allCompetenceIds).sort((a, b) => {
                      const compA = getCompetenceById(a);
                      const compB = getCompetenceById(b);
                      if (!compA || !compB) return 0;
                      
                      // Профессиональные компетенции идут первыми
                      if (compA.type === "профессиональные компетенции" && compB.type === "корпоративные компетенции") return -1;
                      if (compA.type === "корпоративные компетенции" && compB.type === "профессиональные компетенции") return 1;
                      
                      // Внутри одного типа сортируем по имени
                      return compA.name.localeCompare(compB.name);
                    });

                    return (
                      <TooltipProvider>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="border p-2 text-left font-semibold text-sm sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                                    Компетенция
                                  </th>
                                  <th className="border p-2 text-left font-semibold text-sm sticky left-[200px] bg-muted/50 z-10 min-w-[120px]">
                                    Тип компетенции
                                  </th>
                                  {sortedLevels.map((level) => {
                                    const levelLabel = levelLabels[level.level] || level.level;
                                    const levelColor = profileLevelColors[level.level] || "bg-slate-100 text-slate-700 border-slate-300";
                                    return (
                                      <th
                                        key={level.level}
                                        className="border p-2 text-center font-semibold text-sm min-w-[200px] align-top"
                                      >
                                        <Badge variant="outline" className={`text-base px-4 py-1.5 font-semibold ${levelColor}`}>
                                          {levelLabel}
                                        </Badge>
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {allCompetencesSorted.map((competenceId) => {
                                  const comp = getCompetenceById(competenceId);
                                  if (!comp) return null;
                                  const levelMap = competenceMap.get(competenceId)!;
                                  const isCorporate = comp.type === "корпоративные компетенции";
                                  const typeBadgeColor = isCorporate
                                    ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                    : "bg-purple-50 text-purple-700 border-purple-300";
                                  const skillBadgeColor = isCorporate
                                    ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                    : "bg-purple-50 text-purple-700 border-purple-300";
                                  
                                  return (
                                    <tr key={competenceId} className="hover:bg-muted/30 transition-colors">
                                      <td className="border p-2 text-sm font-medium sticky left-0 bg-background z-10">
                                        {comp.name}
                                      </td>
                                      <td className="border p-2 text-sm sticky left-[200px] bg-background z-10">
                                        <Badge variant="outline" className={`text-xs ${typeBadgeColor}`}>
                                          {isCorporate ? "Корп." : "Проф."}
                                        </Badge>
                                      </td>
                                      {sortedLevels.map((level) => {
                                        const skillLevel = levelMap.get(level.level);
                                        return (
                                          <td key={level.level} className="border p-2 text-center">
                                            {skillLevel ? (
                                              <TooltipPrimitive.Root>
                                                <TooltipTrigger asChild>
                                                  <Badge
                                                    variant="outline"
                                                    className={`${skillBadgeColor} text-xs cursor-help`}
                                                  >
                                                    {skillLevel}
                                                  </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs bg-popover text-popover-foreground border shadow-md [&>svg]:bg-popover [&>svg]:fill-popover">
                                                  <div className="space-y-2">
                                                    <div className="font-semibold text-sm">
                                                      {comp.name} - {levelNames[skillLevel - 1]}
                                                    </div>
                                                    <div className="text-xs opacity-80">
                                                      Уровень навыка: {skillLevel} из 5
                                                    </div>
                                                    {comp.levels && comp.levels[`level${skillLevel}` as keyof typeof comp.levels] && (
                                                      <div className="text-xs border-t pt-2 mt-2">
                                                        <div className="font-semibold mb-1">Описание уровня:</div>
                                                        <div className="opacity-90">
                                                          {comp.levels[`level${skillLevel}` as keyof typeof comp.levels]}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </TooltipContent>
                                              </TooltipPrimitive.Root>
                                            ) : (
                                              <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TooltipProvider>
                    );
                  })()}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-4">
                <div className="py-4 overflow-x-auto">
                  {(() => {
                    const levelOrder = ["trainee", "junior", "middle", "senior", "lead"];
                    const levelLabels = {
                      trainee: "Стажер",
                      junior: "Младший",
                      middle: "Средний",
                      senior: "Старший",
                      lead: "Ведущий",
                    };
                    
                    const sortedLevels = [...selectedProfile.levels].sort((a, b) => {
                      const indexA = levelOrder.indexOf(a.level);
                      const indexB = levelOrder.indexOf(b.level);
                      return indexA - indexB;
                    });

                    return (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="border p-2 text-left font-semibold text-sm sticky left-0 bg-muted/50 z-10 min-w-[250px]">
                                  Уровень сложности решаемых задач
                                </th>
                                {sortedLevels.map((level) => {
                                  const levelLabel = levelLabels[level.level] || level.level;
                                  const levelColor = profileLevelColors[level.level] || "bg-slate-100 text-slate-700 border-slate-300";
                                  return (
                                    <th
                                      key={level.level}
                                      className="border p-2 text-center font-semibold text-sm min-w-[200px] align-top"
                                    >
                                      <Badge variant="outline" className={`text-base px-4 py-1.5 font-semibold ${levelColor}`}>
                                        {levelLabel}
                                      </Badge>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-muted/30 transition-colors">
                                <td className="border p-2 text-sm font-medium sticky left-0 bg-background z-10">
                                  Примеры задач
                                </td>
                                {sortedLevels.map((level) => (
                                  <td key={level.level} className="border p-2 text-sm text-left align-top">
                                    {level.taskExamples && level.taskExamples.length > 0 ? (
                                      <ul className="space-y-2">
                                        {level.taskExamples.map((task, idx) => (
                                          <li key={idx} className="text-sm">
                                            <div className="flex items-start gap-1.5">
                                              <span className="text-foreground mt-0.5 flex-shrink-0 font-medium">{idx + 1}.</span>
                                              <div className="flex-1 whitespace-pre-line break-words">{task}</div>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {selectedProfile && (!selectedProfile.levels || selectedProfile.levels.length === 0) && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Нет уровней профиля для сравнения
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
