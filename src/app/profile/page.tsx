"use client";

import { useState, useEffect } from "react";
import { getProfiles, getUserProfile, saveUserProfile, resetUserProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile, AgileRole } from "@/types";
import { CheckCircle2, Trash2, Camera, X, Edit2, Save, Settings, Plus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProfileWidgets } from "@/components/profile-widgets";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [middleName, setMiddleName] = useState<string>("");
  const [grade, setGrade] = useState<number>(12);
  const [position, setPosition] = useState<string>("Руководитель экспертизы по тестированию");
  const [linearStructure, setLinearStructure] = useState<string>("ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем");
  const [agileRoles, setAgileRoles] = useState<AgileRole[]>([{ role: "Разработчик" }]);
  const [mainProfileId, setMainProfileId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [profiles] = useState(getProfiles());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssessmentInfoDialogOpen, setIsAssessmentInfoDialogOpen] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserProfile(profile);
      // Если ФИО не указано, устанавливаем дефолтное значение
      setLastName(profile.lastName || "Помыткин");
      setFirstName(profile.firstName || "Сергей");
      setMiddleName(profile.middleName || "Олегович");
      setGrade(profile.grade || 12);
      setPosition(profile.position || "Руководитель экспертизы по тестированию");
      setLinearStructure(profile.linearStructure || "ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем");
      setAgileRoles(profile.agileRoles || [{ role: "Разработчик" }]);
      setMainProfileId(profile.mainProfileId || "profile-1");
      setTags(profile.tags || []);
      
      // Если ФИО, грейд, должность, линейная структура, Agile или профиль не были сохранены, сохраняем дефолтные значения
      if (!profile.lastName || !profile.firstName || !profile.middleName || !profile.grade || !profile.position || !profile.linearStructure || !profile.agileRoles || profile.agileRoles.length === 0 || !profile.mainProfileId) {
        const updatedProfile: UserProfile = {
          ...profile,
          lastName: profile.lastName || "Помыткин",
          firstName: profile.firstName || "Сергей",
          middleName: profile.middleName || "Олегович",
          grade: profile.grade || 12,
          position: profile.position || "Руководитель экспертизы по тестированию",
          linearStructure: profile.linearStructure || "ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем",
          agileRoles: profile.agileRoles || [{ role: "Разработчик" }],
          mainProfileId: profile.mainProfileId || "profile-1",
        };
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
      }
    } else {
      // Создаем новый профиль с дефолтным ФИО, грейдом, должностью, линейной структурой, Agile и профилем
      const newProfile: UserProfile = {
        userId: "user-1",
        lastName: "Помыткин",
        firstName: "Сергей",
        middleName: "Олегович",
        grade: 12,
        position: "Руководитель экспертизы по тестированию",
        linearStructure: "ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем",
        agileRoles: [{ role: "Разработчик" }],
        mainProfileId: "profile-1",
        additionalProfileIds: [],
        skills: [],
      };
      setUserProfile(newProfile);
      setLastName("Помыткин");
      setFirstName("Сергей");
      setMiddleName("Олегович");
      setGrade(12);
      setPosition("Руководитель экспертизы по тестированию");
      setLinearStructure("ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем");
      setAgileRoles([{ role: "Разработчик" }]);
      setMainProfileId("profile-1");
      setTags([]);
      saveUserProfile(newProfile);
    }
  }, []);

  const handleResetProfile = () => {
    resetUserProfile();
    const newProfile: UserProfile = {
      userId: "user-1",
      lastName: "Помыткин",
      firstName: "Сергей",
      middleName: "Олегович",
      grade: 12,
      position: "Руководитель экспертизы по тестированию",
      linearStructure: "ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем",
      agileRoles: [{ role: "Разработчик" }],
      mainProfileId: "profile-1",
      additionalProfileIds: [],
      skills: [],
      avatar: undefined,
    };
    setUserProfile(newProfile);
    setLastName("Помыткин");
    setFirstName("Сергей");
    setMiddleName("Олегович");
    setGrade(12);
    setPosition("Руководитель экспертизы по тестированию");
      setLinearStructure("ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем");
      setAgileRoles([{ role: "Разработчик" }]);
      setMainProfileId("profile-1");
      setTags([]);
    setIsResetDialogOpen(false);
  };

  // Обработка загрузки фотографии
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите файл изображения");
      return;
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Размер файла не должен превышать 10MB");
      return;
    }

    // Конвертируем файл в base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          avatar: base64String,
        };
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
        setIsAvatarDialogOpen(false);
      }
    };
    reader.onerror = () => {
      alert("Ошибка при чтении файла");
    };
    reader.readAsDataURL(file);
  };

  // Удаление фотографии
  const handleAvatarRemove = () => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        avatar: undefined,
      };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
      setIsAvatarDialogOpen(false);
    }
  };

  // Получение полного ФИО
  const getFullName = () => {
    const parts: string[] = [];
    if (lastName) parts.push(lastName);
    if (firstName) parts.push(firstName);
    if (middleName) parts.push(middleName);
    // Если ФИО не указано, используем дефолтное значение
    return parts.length > 0 ? parts.join(" ") : "Помыткин Сергей Олегович";
  };

  // Получение инициалов для fallback аватара
  const getInitials = () => {
    // Используем текущие значения или дефолтные
    const currentLastName = lastName || "Помыткин";
    const currentFirstName = firstName || "Сергей";
    if (currentLastName && currentFirstName) {
      return `${currentLastName[0]}${currentFirstName[0]}`.toUpperCase();
    }
    if (currentFirstName) {
      return currentFirstName[0].toUpperCase();
    }
    return "ПС";
  };

  // Сохранение изменений профиля
  const handleSaveProfile = () => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      lastName: lastName.trim() || undefined,
      firstName: firstName.trim() || undefined,
      middleName: middleName.trim() || undefined,
      grade: grade || undefined,
      position: position.trim() || undefined,
      linearStructure: linearStructure.trim() || undefined,
      agileRoles: agileRoles.filter(ar => ar.role.trim()).length > 0 ? agileRoles.filter(ar => ar.role.trim() || ar.stream?.trim() || ar.team?.trim() || ar.workload !== undefined).map(ar => ({
        role: ar.role.trim(),
        stream: ar.stream?.trim() || undefined,
        team: ar.team?.trim() || undefined,
        workload: ar.workload !== undefined && ar.workload >= 0 && ar.workload <= 100 ? ar.workload : undefined,
      })) : undefined,
      mainProfileId: mainProfileId || undefined,
      tags: tags.filter(tag => tag.trim()).length > 0 ? tags.filter(tag => tag.trim()) : undefined,
    };

    const result = saveUserProfile(updatedProfile);
    if (result.success) {
      setUserProfile(updatedProfile);
      setIsEditDialogOpen(false);
    } else {
      alert(`Ошибка при сохранении: ${result.error}`);
    }
  };

  const mainProfile = profiles.find((p) => p.id === mainProfileId);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6 flex-1">
            {/* Аватар пользователя */}
            <div className="relative group">
              <Avatar className="h-48 w-48 border-4 border-background shadow-lg">
                {userProfile?.avatar ? (
                  <AvatarImage src={userProfile.avatar} alt="Фото профиля" className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-shadow"
                onClick={() => setIsAvatarDialogOpen(true)}
                title="Изменить фотографию"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{getFullName()}</h1>
              <div className="flex items-center gap-3 mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-sm font-semibold px-3 py-1 cursor-help">
                      {grade}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Грейд — это уровень должности сотрудника в системе грейдирования. 
                      Значение может быть от 1 до 17, где более высокий грейд соответствует 
                      более высокой должности и уровню ответственности.
                    </p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm font-bold text-muted-foreground">{position}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Профиль:</span>
                {mainProfileId && mainProfile ? (
                  <Badge variant="outline" className="text-sm">
                    {mainProfile.name}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm text-muted-foreground">
                    не выбран
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">Линейная: </span>
                <span className="text-sm text-foreground">{linearStructure}</span>
              </div>
              {agileRoles && agileRoles.length > 0 && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Agile: </span>
                  {agileRoles.map((agileRole, index) => (
                    <div key={index} className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-sm">
                        {agileRole.role}
                      </Badge>
                      {(agileRole.stream || agileRole.team) && (
                        <span className="text-sm text-foreground">
                          {agileRole.stream && agileRole.team
                            ? `${agileRole.stream} / ${agileRole.team}`
                            : (agileRole.stream || agileRole.team)}
                        </span>
                      )}
                      {agileRole.workload !== undefined && (
                        <span className="text-sm text-foreground">
                          {agileRole.workload}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Button>
            {userProfile && (userProfile.mainProfileId || (userProfile.skills && userProfile.skills.length > 0)) && (
              <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Сбросить данные
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Сбросить данные профиля?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие удалит все ваши данные профиля, включая выбранные профили и результаты самооценки. 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Сбросить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        {/* Облако тегов */}
        {tags && tags.length > 0 && (
          <div className="w-full flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Контейнер Оценка */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Оценка</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsAssessmentInfoDialogOpen(true)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileWidgets userProfile={userProfile} />
        </CardContent>
      </Card>

      {/* Диалог для загрузки фотографии */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Фотография профиля
            </DialogTitle>
            <DialogDescription>
              Загрузите фотографию для вашего профиля. Поддерживаются форматы JPG, PNG, GIF. Максимальный размер: 10MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Предпросмотр текущей фотографии */}
            {userProfile?.avatar && (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg ring-2 ring-primary/10">
                  <AvatarImage src={userProfile.avatar} alt="Текущее фото" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleAvatarRemove}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Удалить фотографию
                </Button>
              </div>
            )}

            {/* Загрузка новой фотографии */}
            <div className="space-y-3">
              <Label htmlFor="avatar-upload" className="text-sm font-semibold">
                {userProfile?.avatar ? "Изменить фотографию" : "Загрузить фотографию"}
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Выбрать файл
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Рекомендуемый размер: 400x400 пикселей. Фотография будет автоматически сохранена.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог настроек профиля */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Настройки профиля
            </DialogTitle>
            <DialogDescription>
              Измените данные вашего профиля. Все изменения будут сохранены после нажатия кнопки "Сохранить".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* ФИО */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Фамилия"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Отчество"
                />
              </div>
            </div>

            {/* Грейд и должность */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Грейд</Label>
                <Input
                  id="grade"
                  type="number"
                  min="1"
                  max="17"
                  value={grade}
                  onChange={(e) => setGrade(Number.parseInt(e.target.value) || 1)}
                  placeholder="Грейд (1-17)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Должность"
                />
              </div>
            </div>

            {/* Линейная структура */}
            <div className="space-y-2">
              <Label htmlFor="linearStructure">Линейная структура</Label>
              <Input
                id="linearStructure"
                value={linearStructure}
                onChange={(e) => setLinearStructure(e.target.value)}
                placeholder="ГО / Департамент / Управление / Отдел"
              />
            </div>

            {/* Agile роли и проект */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Agile роли</Label>
                <div className="space-y-3">
                  {agileRoles.map((agileRole, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`role-${index}`} className="text-xs">Роль</Label>
                          <Input
                            id={`role-${index}`}
                            value={agileRole.role}
                            onChange={(e) => {
                              const newRoles = [...agileRoles];
                              newRoles[index] = { ...newRoles[index], role: e.target.value };
                              setAgileRoles(newRoles);
                            }}
                            placeholder="Agile роль"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`stream-${index}`} className="text-xs">Стрим</Label>
                          <Input
                            id={`stream-${index}`}
                            value={agileRole.stream || ""}
                            onChange={(e) => {
                              const newRoles = [...agileRoles];
                              newRoles[index] = { ...newRoles[index], stream: e.target.value };
                              setAgileRoles(newRoles);
                            }}
                            placeholder="Стрим"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`team-${index}`} className="text-xs">Команда</Label>
                          <Input
                            id={`team-${index}`}
                            value={agileRole.team || ""}
                            onChange={(e) => {
                              const newRoles = [...agileRoles];
                              newRoles[index] = { ...newRoles[index], team: e.target.value };
                              setAgileRoles(newRoles);
                            }}
                            placeholder="Команда"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`workload-${index}`} className="text-xs">Занятость</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              id={`workload-${index}`}
                              type="number"
                              min="0"
                              max="100"
                              value={agileRole.workload !== undefined ? agileRole.workload : ""}
                              onChange={(e) => {
                                const newRoles = [...agileRoles];
                                const value = e.target.value === "" ? undefined : Number.parseInt(e.target.value) || 0;
                                newRoles[index] = { ...newRoles[index], workload: value !== undefined && value >= 0 && value <= 100 ? value : undefined };
                                setAgileRoles(newRoles);
                              }}
                              placeholder="0"
                              className="w-full"
                            />
                            <span className="text-sm text-muted-foreground shrink-0">%</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newRoles = agileRoles.filter((_, i) => i !== index);
                                setAgileRoles(newRoles.length > 0 ? newRoles : [{ role: "" }]);
                              }}
                              className="shrink-0 ml-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAgileRoles([...agileRoles, { role: "" }])}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить роль
                  </Button>
                </div>
              </div>
            </div>

            {/* Основной профиль */}
            <div className="space-y-2">
              <Label htmlFor="mainProfile">Основной профиль</Label>
              <Select value={mainProfileId} onValueChange={setMainProfileId}>
                <SelectTrigger id="mainProfile">
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

            {/* Теги */}
            <div className="space-y-2">
              <Label>Теги</Label>
              <div className="space-y-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...tags];
                        newTags[index] = e.target.value;
                        setTags(newTags);
                      }}
                      placeholder="Тег"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newTags = tags.filter((_, i) => i !== index);
                        setTags(newTags);
                      }}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTags([...tags, ""])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить тег
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveProfile} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог с информацией о сервисе Оценка */}
      <Dialog open={isAssessmentInfoDialogOpen} onOpenChange={setIsAssessmentInfoDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              О сервисе "Оценка"
            </DialogTitle>
            <DialogDescription>
              Подробное описание функциональности сервиса оценки компетенций
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Назначение сервиса</h3>
              <p className="text-sm text-muted-foreground">
                Сервис "Оценка" предназначен для проведения комплексной оценки компетенций сотрудников 
                в различных ролях: самооценка, оценка руководителем, коллегами и подчиненными. 
                Это позволяет получить многогранную картину профессионального развития сотрудника.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Основные возможности</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>
                  <strong>Самооценка:</strong> Сотрудник самостоятельно оценивает свой уровень владения 
                  компетенциями, что способствует развитию навыков самоанализа и рефлексии.
                </li>
                <li>
                  <strong>Оценка руководителем:</strong> Руководитель оценивает компетенции подчиненного 
                  с точки зрения профессиональных требований и ожиданий от должности.
                </li>
                <li>
                  <strong>Оценка коллегами:</strong> Коллеги по команде или проекту оценивают компетенции 
                  сотрудника, что позволяет получить обратную связь от равных по статусу.
                </li>
                <li>
                  <strong>Оценка подчиненными:</strong> Подчиненные оценивают компетенции руководителя, 
                  что особенно важно для развития лидерских навыков и управленческих компетенций.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Процесс оценки</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Каждая оценочная процедура проходит через три основных этапа:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>
                    <strong>Проведение оценки:</strong> Участники процедуры оценивают компетенции 
                    сотрудника по заданным критериям и шкалам.
                  </li>
                  <li>
                    <strong>Калибровка:</strong> Результаты оценки проходят процесс калибровки, 
                    где происходит согласование оценок между различными участниками и приведение 
                    их к единым стандартам.
                  </li>
                  <li>
                    <strong>Результаты оценки:</strong> После завершения калибровки формируются 
                    итоговые результаты, которые отражают согласованный уровень компетенций 
                    сотрудника.
                  </li>
                </ol>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Управление процедурами</h3>
              <p className="text-sm text-muted-foreground">
                Все оценочные процедуры разделены на две категории:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>
                  <strong>Активные процедуры:</strong> Текущие оценочные процедуры, которые находятся 
                  в процессе проведения или недавно завершены. Эти процедуры требуют внимания и 
                  активных действий.
                </li>
                <li>
                  <strong>Архивные процедуры:</strong> Завершенные оценочные процедуры, которые 
                  были проведены ранее. Архивные процедуры доступны для просмотра и анализа 
                  исторических данных.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Статусы оценки</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Для каждой процедуры отображается статус вашей оценки:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Завершил:</strong> Оценка полностью завершена, все компетенции оценены. 
                    Вы можете просмотреть результаты оценки.
                  </li>
                  <li>
                    <strong>В процессе:</strong> Оценка начата, но еще не завершена. Вы можете 
                    продолжить оценку и завершить ее.
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-lg">Преимущества</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Комплексная оценка компетенций с разных точек зрения</li>
                <li>Прозрачный процесс калибровки для согласования результатов</li>
                <li>Исторический анализ развития компетенций через архивные процедуры</li>
                <li>Удобный интерфейс для отслеживания статуса и прогресса оценки</li>
                <li>Поддержка различных ролей оценки для получения полной картины</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

