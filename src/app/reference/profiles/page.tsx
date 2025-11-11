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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Plus, Pencil, Trash2, X, AlertCircle, Search, Filter, Info, Users, ChevronDown, ChevronRight, Briefcase } from "lucide-react";
import type { SkillLevel, ProfileLevel } from "@/types";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";

const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
const levelColors = [
  "bg-slate-100 text-slate-700 border-slate-300",
  "bg-blue-100 text-blue-700 border-blue-300",
  "bg-purple-100 text-purple-700 border-purple-300",
  "bg-purple-200 text-purple-700 border-purple-400",
  "bg-purple-300 text-purple-700 border-purple-600",
];

const profileLevelColors = {
  trainee: "bg-slate-100 text-slate-700 border-slate-300",
  junior: "bg-blue-100 text-blue-700 border-blue-300",
  middle: "bg-purple-100 text-purple-700 border-purple-300",
  senior: "bg-purple-200 text-purple-700 border-purple-400",
  lead: "bg-purple-300 text-purple-700 border-purple-600",
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
    <div className="border rounded-md overflow-hidden bg-card">
      <div
        className="p-2.5 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
        onClick={() => setIsExpanded(!isExpanded)}
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
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </Button>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${levelColor}`}>
            {levelLabel}
          </Badge>
          <span className="font-semibold text-xs">{profileLevel.name}</span>
          {!isExpanded && (
            <span className="text-xs text-muted-foreground truncate ml-2">
              {profileLevel.description}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/30 p-2.5 space-y-2.5">
          {/* Обязанности */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs flex items-center gap-1.5">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              Обязанности:
            </h4>
            <ul className="space-y-1 ml-4">
              {profileLevel.responsibilities.map((responsibility, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-2" />

          {/* Навыки */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs flex items-center gap-1.5">
              <Info className="h-3 w-3 text-muted-foreground" />
              Навыки:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Профессиональные навыки */}
              <div className="space-y-1">
                <h5 className="font-semibold text-[10px] flex items-center gap-1 text-purple-700">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-[10px] px-1 py-0">
                    Проф.
                  </Badge>
                  Профессиональные:
                </h5>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "профессиональные компетенции";
                    })
                    .map(([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const levelName = levelNames[requiredLevel - 1];
                      const skillLevelColor = levelColors[requiredLevel - 1];

                      return (
                        <div
                          key={competenceId}
                          className="p-1.5 border rounded-md space-y-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-[10px] leading-tight">{comp.name}</span>
                            <Badge variant="outline" className={`text-[10px] px-1 py-0 ${skillLevelColor}`}>
                              {levelName}
                            </Badge>
                          </div>
                          <Progress
                            value={(requiredLevel / 5) * 100}
                            className="h-1 [&>div]:bg-purple-500"
                          />
                        </div>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "профессиональные компетенции";
                  }).length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">Нет профессиональных навыков</p>
                  )}
                </div>
              </div>

              {/* Корпоративные навыки */}
              <div className="space-y-1">
                <h5 className="font-semibold text-[10px] flex items-center gap-1 text-cyan-700">
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300 text-[10px] px-1 py-0">
                    Корп.
                  </Badge>
                  Корпоративные:
                </h5>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "корпоративные компетенции";
                    })
                    .map(([competenceId, requiredLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const levelName = levelNames[requiredLevel - 1];
                      const corporateColors = [
                        "bg-slate-100 text-slate-700 border-slate-300",
                        "bg-cyan-50 text-cyan-700 border-cyan-300",
                        "bg-cyan-100 text-cyan-700 border-cyan-400",
                        "bg-cyan-200 text-cyan-700 border-cyan-500",
                        "bg-cyan-300 text-cyan-700 border-cyan-600",
                      ];
                      const finalColor = corporateColors[requiredLevel - 1];

                      return (
                        <div
                          key={competenceId}
                          className="p-1.5 border rounded-md space-y-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-[10px] leading-tight">{comp.name}</span>
                            <Badge variant="outline" className={`text-[10px] px-1 py-0 ${finalColor}`}>
                              {levelName}
                            </Badge>
                          </div>
                          <Progress
                            value={(requiredLevel / 5) * 100}
                            className="h-1 [&>div]:bg-cyan-500"
                          />
                        </div>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "корпоративные компетенции";
                  }).length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">Нет корпоративных навыков</p>
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requiredCompetences: [] as ProfileCompetence[],
    experts: [] as Array<{ avatar: string; fullName: string; position: string }>,
    levels: [] as Array<{
      level: "trainee" | "junior" | "middle" | "senior" | "lead";
      name: string;
      description: string;
      responsibilities: string[];
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
      
      return (
        profile.name.toLowerCase().includes(query) ||
        profile.description.toLowerCase().includes(query) ||
        compNames.includes(query)
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
        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          {/* Левая колонка - список профилей (20%) */}
          <div className="w-[20%] min-w-[200px] flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
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
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium text-sm">{profile.name}</div>
                    <div className={`text-xs mt-0.5 ${
                      selectedProfile?.id === profile.id
                        ? "text-primary-foreground/80"
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

          {/* Правая колонка - детальная информация (80%) */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-280px)]">
            {selectedProfile ? (
              <Card className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1">{selectedProfile.name}</CardTitle>
                      <CardDescription className="text-sm">
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
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Компетенции - Облако тегов */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Обязательные компетенции:
                      </h3>
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/20 min-h-[80px]">
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
                                          {comp.name} - {levelName}
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
                          <h3 className="font-semibold text-sm flex items-center gap-2">
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

                    {/* Информация об экспертах */}
                    {selectedProfile.experts && selectedProfile.experts.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Эксперты (владельцы профиля):
                          </h3>
                          <div className="space-y-2">
                            {selectedProfile.experts.map((expert, index) => (
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProfile ? "Редактировать профиль" : "Создать профиль"}
            </DialogTitle>
            <DialogDescription>
              {editingProfile
                ? "Внесите изменения в профиль и его компетенции"
                : "Заполните информацию о профиле и добавьте требуемые компетенции"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Основная информация */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Основная информация</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name">
                    Название профиля <span className="text-destructive">*</span>
                  </Label>
                  {formData.name && (
                    <span className="text-xs text-muted-foreground">{formData.name.length} символов</span>
                  )}
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например, Разработчик Perl"
                  className="text-base"
                  maxLength={100}
                />
                {!formData.name && (
                  <p className="text-xs text-muted-foreground">Введите название профиля разработчика</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">
                    Описание <span className="text-destructive">*</span>
                  </Label>
                  {formData.description && (
                    <span className="text-xs text-muted-foreground">{formData.description.length} символов</span>
                  )}
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишите профиль и его основные задачи, область применения, ключевые технологии"
                  rows={4}
                  className="text-base resize-none"
                  maxLength={500}
                />
                {!formData.description && (
                  <p className="text-xs text-muted-foreground">Добавьте описание профиля для лучшего понимания его назначения</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Информация об экспертах */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-base font-semibold">Эксперты (владельцы профиля)</Label>
                  {formData.experts.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formData.experts.length} {formData.experts.length === 1 ? "эксперт" : formData.experts.length < 5 ? "эксперта" : "экспертов"}
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (formData.experts.length < 10) {
                      setFormData({
                        ...formData,
                        experts: [
                          ...formData.experts,
                          { avatar: "", fullName: "", position: "" },
                        ],
                      });
                    }
                  }}
                  disabled={formData.experts.length >= 10}
                  title={formData.experts.length >= 10 ? "Максимум 10 экспертов" : "Добавить эксперта"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить эксперта
                  {formData.experts.length > 0 && ` (${formData.experts.length}/10)`}
                </Button>
              </div>
              
              {formData.experts.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/20">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Нет добавленных экспертов</p>
                  <p className="text-xs text-muted-foreground">Нажмите "Добавить эксперта" для добавления владельца профиля</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.experts.map((expert, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold">Эксперт {index + 1}</Label>
                          {expert.fullName && expert.position && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              Заполнен
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              experts: formData.experts.filter((_, i) => i !== index),
                            });
                          }}
                          title="Удалить эксперта"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`expert-fullName-${index}`}>
                            ФИО эксперта <span className="text-muted-foreground text-xs">(рекомендуется)</span>
                          </Label>
                          <Input
                            id={`expert-fullName-${index}`}
                            value={expert.fullName}
                            onChange={(e) => {
                              const updatedExperts = [...formData.experts];
                              updatedExperts[index] = { ...updatedExperts[index], fullName: e.target.value };
                              setFormData({ ...formData, experts: updatedExperts });
                            }}
                            placeholder="Например, Глебкин Роман Игоревич"
                            className="text-base"
                            maxLength={100}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`expert-position-${index}`}>
                            Должность <span className="text-muted-foreground text-xs">(рекомендуется)</span>
                          </Label>
                          <Input
                            id={`expert-position-${index}`}
                            value={expert.position}
                            onChange={(e) => {
                              const updatedExperts = [...formData.experts];
                              updatedExperts[index] = { ...updatedExperts[index], position: e.target.value };
                              setFormData({ ...formData, experts: updatedExperts });
                            }}
                            placeholder="Например, Исполнительный директор по разработке"
                            className="text-base"
                            maxLength={100}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`expert-avatar-${index}`}>
                          URL аватарки <span className="text-muted-foreground text-xs">(необязательно)</span>
                        </Label>
                        <Input
                          id={`expert-avatar-${index}`}
                          value={expert.avatar}
                          onChange={(e) => {
                            const updatedExperts = [...formData.experts];
                            updatedExperts[index] = { ...updatedExperts[index], avatar: e.target.value };
                            setFormData({ ...formData, experts: updatedExperts });
                          }}
                          placeholder="https://example.com/avatar.jpg"
                          className="text-base"
                          type="url"
                        />
                        {expert.avatar && !expert.avatar.startsWith("http") && (
                          <p className="text-xs text-amber-600">URL должен начинаться с http:// или https://</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Компетенции */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Обязательные компетенции</Label>
                {formData.requiredCompetences.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {formData.requiredCompetences.length} {formData.requiredCompetences.length === 1 ? "компетенция" : formData.requiredCompetences.length < 5 ? "компетенции" : "компетенций"}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Выберите компетенции <span className="text-destructive">*</span></Label>
                <MultiSelect
                  options={competences
                    .filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined && c.id !== undefined)
                    .map((c) => ({
                      value: c.id!,
                      label: c.name,
                      badge: c.type === "корпоративные компетенции" ? "Корп." : "Проф.",
                      badgeClassName: c.type === "корпоративные компетенции"
                        ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                        : "bg-purple-50 text-purple-700 border-purple-300",
                    }))}
                  selected={formData.requiredCompetences.map((c) => c.competenceId)}
                  onChange={(selectedIds) => {
                    // Добавляем новые компетенции с уровнем по умолчанию
                    const currentIds = new Set(formData.requiredCompetences.map((c) => c.competenceId));
                    const newIds = selectedIds.filter((id) => !currentIds.has(id));
                    const removedIds = formData.requiredCompetences
                      .map((c) => c.competenceId)
                      .filter((id) => !selectedIds.includes(id));

                    let updated = formData.requiredCompetences.filter(
                      (c) => !removedIds.includes(c.competenceId)
                    );

                    // Добавляем новые компетенции (без указания уровня, используется значение по умолчанию)
                    newIds.forEach((id) => {
                      updated.push({
                        competenceId: id,
                        requiredLevel: 1 as SkillLevel, // Минимальный уровень по умолчанию
                      });
                    });

                    setFormData({ ...formData, requiredCompetences: updated });
                  }}
                  placeholder="Выберите компетенции..."
                  className="w-full"
                />
              </div>

              {formData.requiredCompetences.length > 0 && (
                <>
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Всего компетенций: <span className="font-semibold text-foreground">{formData.requiredCompetences.length}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const professional = formData.requiredCompetences.filter((reqComp) => {
                            const comp = getCompetenceById(reqComp.competenceId);
                            return comp && comp.type === "профессиональные компетенции";
                          }).length;
                          const corporate = formData.requiredCompetences.length - professional;
                          return (
                            <>
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                                Проф.: {professional}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-cyan-50 text-cyan-700 border-cyan-300">
                                Корп.: {corporate}
                              </Badge>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.requiredCompetences.map((reqComp, index) => {
                      const comp = getCompetenceById(reqComp.competenceId);
                      if (!comp) return null;

                      return (
                        <div
                          key={reqComp.competenceId}
                          className="flex items-center gap-2 p-2 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <span className="text-sm font-medium">{comp.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              comp.type === "корпоративные компетенции"
                                ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                : "bg-purple-50 text-purple-700 border-purple-300"
                            }`}
                          >
                            {comp.type === "корпоративные компетенции" ? "Корп." : "Проф."}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeCompetence(index)}
                            title="Удалить компетенцию"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {formData.requiredCompetences.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                  <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Нет добавленных компетенций
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Выберите компетенции из списка выше. Компетенции определяют необходимые навыки для профиля.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Уровни профиля */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-base font-semibold">Уровни профиля</Label>
                  {formData.levels.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formData.levels.length} {formData.levels.length === 1 ? "уровень" : formData.levels.length < 5 ? "уровня" : "уровней"}
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLevel}
                  disabled={formData.levels.length >= 5}
                  title={formData.levels.length >= 5 ? "Максимум 5 уровней" : "Добавить уровень"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить уровень
                  {formData.levels.length > 0 && ` (${formData.levels.length}/5)`}
                </Button>
              </div>

              {formData.levels.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                  <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Нет добавленных уровней
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Нажмите "Добавить уровень", чтобы начать. Уровни определяют карьерную прогрессию в профиле.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.levels.map((level, levelIndex) => {
                    const levelOption = levelOptions.find((opt) => opt.value === level.level);
                    const usedLevels = new Set(formData.levels.map((l, i) => i !== levelIndex ? l.level : null).filter(Boolean));
                    const availableLevelOptions = levelOptions.filter((opt) => !usedLevels.has(opt.value) || opt.value === level.level);

                    return (
                      <div key={levelIndex} className="p-4 border rounded-lg space-y-4 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-semibold">
                              Уровень {levelIndex + 1}: {levelOption?.label || level.level}
                            </Label>
                            {level.name && level.description && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Заполнен
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeLevel(levelIndex)}
                            title="Удалить уровень"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Тип уровня <span className="text-destructive">*</span></Label>
                            <Select
                              value={level.level}
                              onValueChange={(value) => updateLevel(levelIndex, "level", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableLevelOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Название уровня <span className="text-destructive">*</span></Label>
                            <Input
                              value={level.name}
                              onChange={(e) => updateLevel(levelIndex, "name", e.target.value)}
                              placeholder="Например, Trainee Perl Developer"
                              className="text-base"
                              maxLength={100}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Описание уровня <span className="text-destructive">*</span></Label>
                            <Textarea
                              value={level.description}
                              onChange={(e) => updateLevel(levelIndex, "description", e.target.value)}
                              placeholder="Опишите уровень и его основные характеристики"
                              rows={3}
                              className="text-base resize-none"
                              maxLength={500}
                            />
                          </div>

                          {/* Обязанности */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Типовые должностные обязанности</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addResponsibility(levelIndex)}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Добавить обязанность
                              </Button>
                            </div>
                            {level.responsibilities.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">Нет обязанностей. Нажмите "Добавить обязанность" для добавления.</p>
                            ) : (
                              <div className="space-y-2">
                                {level.responsibilities.map((resp, respIndex) => (
                                  <div key={respIndex} className="flex items-center gap-2">
                                    <Input
                                      value={resp}
                                      onChange={(e) => updateResponsibility(levelIndex, respIndex, e.target.value)}
                                      placeholder="Введите обязанность"
                                      className="text-sm"
                                      maxLength={200}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => removeResponsibility(levelIndex, respIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Навыки уровня */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Требуемые навыки</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addLevelSkill(levelIndex)}
                                disabled={Object.keys(level.requiredSkills).length >= competences.length}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Добавить навык
                              </Button>
                            </div>
                            
                            {/* Форма добавления навыка */}
                            {addingSkillToLevel === levelIndex && (() => {
                              const levelSkills = new Set(Object.keys(level.requiredSkills));
                              const availableComps = competences.filter((c) => c.id && !levelSkills.has(c.id));
                              
                              return (
                                <div className="p-3 border rounded-md bg-muted/30 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={selectedCompetenceForSkill}
                                      onValueChange={setSelectedCompetenceForSkill}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Выберите компетенцию" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableComps.map((comp) => (
                                          <SelectItem key={comp.id} value={comp.id}>
                                            <div className="flex items-center gap-2">
                                              <span>{comp.name}</span>
                                              <Badge
                                                variant="outline"
                                                className={`text-xs ${
                                                  comp.type === "корпоративные компетенции"
                                                    ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                                    : "bg-purple-50 text-purple-700 border-purple-300"
                                                }`}
                                              >
                                                {comp.type === "корпоративные компетенции" ? "Корп." : "Проф."}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      onClick={() => confirmAddLevelSkill(levelIndex)}
                                      disabled={!selectedCompetenceForSkill}
                                    >
                                      Добавить
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setAddingSkillToLevel(null);
                                        setSelectedCompetenceForSkill("");
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}

                            {Object.keys(level.requiredSkills).length === 0 && addingSkillToLevel !== levelIndex ? (
                              <p className="text-xs text-muted-foreground italic">Нет навыков. Нажмите "Добавить навык" для добавления.</p>
                            ) : (
                              <div className="space-y-2">
                                {Object.entries(level.requiredSkills).map(([competenceId, skillLevel]) => {
                                  const comp = getCompetenceById(competenceId);
                                  if (!comp) return null;

                                  return (
                                    <div key={competenceId} className="p-3 border rounded-md bg-muted/10 flex items-center gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium">{comp.name}</span>
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                              comp.type === "корпоративные компетенции"
                                                ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                                : "bg-purple-50 text-purple-700 border-purple-300"
                                            }`}
                                          >
                                            {comp.type === "корпоративные компетенции" ? "Корп." : "Проф."}
                                          </Badge>
                                        </div>
                                        <Select
                                          value={skillLevel.toString()}
                                          onValueChange={(value) => updateLevelSkill(levelIndex, competenceId, parseInt(value) as SkillLevel)}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                              <SelectItem key={lvl} value={lvl.toString()}>
                                                {lvl}. {levelNames[lvl - 1]}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => removeLevelSkill(levelIndex, competenceId)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.description || formData.requiredCompetences.length === 0}>
              {editingProfile ? "Сохранить изменения" : "Создать профиль"}
            </Button>
          </DialogFooter>
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
    </div>
  );
}
