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
import type { UserProfile } from "@/types";
import { CheckCircle2, Trash2, Camera, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [middleName, setMiddleName] = useState<string>("");
  const [grade, setGrade] = useState<number>(12);
  const [position, setPosition] = useState<string>("Руководитель экспертизы по тестированию");
  const [linearStructure, setLinearStructure] = useState<string>("ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем");
  const [agileRole, setAgileRole] = useState<string>("Разработчик");
  const [agileProject, setAgileProject] = useState<string>("VS Ипотека 2026 / Заблокированный ТУЗ");
  const [mainProfileId, setMainProfileId] = useState<string>("");
  const [profiles] = useState(getProfiles());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

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
      setAgileRole(profile.agileRole || "Разработчик");
      setAgileProject(profile.agileProject || "VS Ипотека 2026 / Заблокированный ТУЗ");
      setMainProfileId(profile.mainProfileId || "profile-1");
      
      // Если ФИО, грейд, должность, линейная структура, Agile или профиль не были сохранены, сохраняем дефолтные значения
      if (!profile.lastName || !profile.firstName || !profile.middleName || !profile.grade || !profile.position || !profile.linearStructure || !profile.agileRole || !profile.agileProject || !profile.mainProfileId) {
        const updatedProfile: UserProfile = {
          ...profile,
          lastName: profile.lastName || "Помыткин",
          firstName: profile.firstName || "Сергей",
          middleName: profile.middleName || "Олегович",
          grade: profile.grade || 12,
          position: profile.position || "Руководитель экспертизы по тестированию",
          linearStructure: profile.linearStructure || "ГО / Департамент автоматизации внешних сервисов / Управление развития некорпоратинвых систем / Отдел сложных систем",
          agileRole: profile.agileRole || "Разработчик",
          agileProject: profile.agileProject || "VS Ипотека 2026 / Заблокированный ТУЗ",
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
        agileRole: "Разработчик",
        agileProject: "VS Ипотека 2026 / Заблокированный ТУЗ",
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
      setAgileRole("Разработчик");
      setAgileProject("VS Ипотека 2026 / Заблокированный ТУЗ");
      setMainProfileId("profile-1");
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
      agileRole: "Разработчик",
      agileProject: "VS Ипотека 2026 / Заблокированный ТУЗ",
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
    setAgileRole("Разработчик");
    setAgileProject("VS Ипотека 2026 / Заблокированный ТУЗ");
    setMainProfileId("profile-1");
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

  const mainProfile = profiles.find((p) => p.id === mainProfileId);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6 flex-1">
          {/* Аватар пользователя */}
          <div className="relative group">
            <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
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
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Agile: </span>
              {agileRole && (
                <Badge variant="outline" className="text-sm">
                  {agileRole}
                </Badge>
              )}
              {agileProject && (
                <span className="text-sm text-foreground">{agileProject}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Диалог для загрузки фотографии */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Фотография профиля</DialogTitle>
            <DialogDescription>
              Загрузите фотографию для вашего профиля. Поддерживаются форматы JPG, PNG, GIF. Максимальный размер: 10MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Предпросмотр текущей фотографии */}
            {userProfile?.avatar && (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-40 w-40 border-2">
                  <AvatarImage src={userProfile.avatar} alt="Текущее фото" className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
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
            <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">
                Рекомендуемый размер: 400x400 пикселей. Фотография будет автоматически сохранена.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

