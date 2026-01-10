"use client";

import { useState, useEffect } from "react";
import { getProfiles, getUserProfile, saveUserProfile, resetUserProfile, updateProfileWithAssessmentData, createDefaultUserProfile } from "@/lib/data";
import { DEFAULT_USER_PROFILE } from "@/lib/constants";
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
import { Trash2, Camera, X, Edit2, Save, Settings, Plus, User, Building, TrendingUp, Mail, Phone, Users, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileWidgets } from "@/components/profile-widgets";
import { AssessmentWidget } from "@/components/assessment-widget";
import { CareerWidget } from "@/components/career-widget";
import Link from "next/link";

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
  const [telegram, setTelegram] = useState<string>("");
  const [profiles] = useState(getProfiles());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      // Заполняем недостающие поля дефолтными значениями
      const defaultProfile = createDefaultUserProfile();
      const updatedProfile: UserProfile = {
        ...defaultProfile,
        ...profile,
        lastName: profile.lastName || defaultProfile.lastName,
        firstName: profile.firstName || defaultProfile.firstName,
        middleName: profile.middleName || defaultProfile.middleName,
        grade: profile.grade ?? defaultProfile.grade,
        position: profile.position || defaultProfile.position,
        linearStructure: profile.linearStructure || defaultProfile.linearStructure,
        agileRoles: profile.agileRoles && profile.agileRoles.length > 0 ? profile.agileRoles : defaultProfile.agileRoles,
        mainProfileId: profile.mainProfileId || defaultProfile.mainProfileId,
        email: profile.email || defaultProfile.email,
        phone: profile.phone || defaultProfile.phone,
        telegram: profile.telegram || defaultProfile.telegram,
        skills: profile.skills || [],
        additionalProfileIds: profile.additionalProfileIds || [],
        tags: profile.tags || [],
      };

      // Обновляем состояние формы
      setUserProfile(updatedProfile);
      setLastName(updatedProfile.lastName || "");
      setFirstName(updatedProfile.firstName || "");
      setMiddleName(updatedProfile.middleName || "");
      setGrade(updatedProfile.grade || 12);
      setPosition(updatedProfile.position || "");
      setLinearStructure(updatedProfile.linearStructure || "");
      setAgileRoles(updatedProfile.agileRoles || [{ role: "Разработчик" }]);
      setMainProfileId(updatedProfile.mainProfileId || "");
      setTags(updatedProfile.tags || []);
      setTelegram(updatedProfile.telegram || "");

      // Сохраняем обновленный профиль, если были изменения
      const hasChanges = 
        !profile.lastName || !profile.firstName || !profile.middleName || 
        profile.grade === undefined || !profile.position || !profile.linearStructure || 
        !profile.agileRoles || profile.agileRoles.length === 0 || !profile.mainProfileId ||
        !profile.email || !profile.phone;
      
      if (hasChanges) {
        saveUserProfile(updatedProfile);
      }

      // Автоматически обновляем данные по оценке при загрузке
      if (updatedProfile.mainProfileId) {
        const result = updateProfileWithAssessmentData();
        if (result.success) {
          const refreshedProfile = getUserProfile();
          if (refreshedProfile) {
            setUserProfile(refreshedProfile);
          }
        }
      }
    } else {
      // Создаем новый профиль с дефолтными значениями
      const newProfile = createDefaultUserProfile();
      setUserProfile(newProfile);
      setLastName(newProfile.lastName || "");
      setFirstName(newProfile.firstName || "");
      setMiddleName(newProfile.middleName || "");
      setGrade(newProfile.grade || 12);
      setPosition(newProfile.position || "");
      setLinearStructure(newProfile.linearStructure || "");
      setAgileRoles(newProfile.agileRoles || [{ role: "Разработчик" }]);
      setMainProfileId(newProfile.mainProfileId || "");
      setTags(newProfile.tags || []);
      setTelegram(newProfile.telegram || "");
      saveUserProfile(newProfile);
    }
  }, []);

  // Синхронизация состояния формы с userProfile при его изменении
  useEffect(() => {
    if (userProfile) {
      setTelegram(userProfile.telegram || "");
    }
  }, [userProfile]);

  const handleResetProfile = () => {
    resetUserProfile();
    const newProfile = createDefaultUserProfile({ avatar: undefined });
    setUserProfile(newProfile);
    setLastName(newProfile.lastName || "");
    setFirstName(newProfile.firstName || "");
    setMiddleName(newProfile.middleName || "");
    setGrade(newProfile.grade || 12);
    setPosition(newProfile.position || "");
    setLinearStructure(newProfile.linearStructure || "");
    setAgileRoles(newProfile.agileRoles || [{ role: "Разработчик" }]);
    setMainProfileId(newProfile.mainProfileId || "");
    setTags(newProfile.tags || []);
    setTelegram(newProfile.telegram || "");
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
    if (parts.length === 0) {
      return `${DEFAULT_USER_PROFILE.lastName} ${DEFAULT_USER_PROFILE.firstName} ${DEFAULT_USER_PROFILE.middleName}`;
    }
    return parts.join(" ");
  };

  // Получение инициалов для fallback аватара
  const getInitials = () => {
    const currentLastName = lastName || DEFAULT_USER_PROFILE.lastName;
    const currentFirstName = firstName || DEFAULT_USER_PROFILE.firstName;
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
      telegram: telegram.trim() || undefined,
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
        <div className="flex items-start justify-end">
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
        
        {/* Аватар пользователя по центру */}
        <div className="flex justify-center">
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
        </div>
        
        {/* Информация о профиле */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">{getFullName()}</h1>
          <div className="flex items-center gap-3 mb-2 flex-wrap justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-sm font-semibold px-3 py-1 cursor-help bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
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
            {mainProfileId && mainProfile ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-sm cursor-help bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    {mainProfile.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {mainProfile.description || "Профиль разработчика"}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Badge variant="outline" className="text-sm text-muted-foreground">
                не выбран
              </Badge>
            )}
          </div>
          {/* Горизонтальная линия на всю ширину экрана */}
          <div className="w-full border-b -mx-4" />
        </div>
        
        {/* Вкладки */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Мой профиль</TabsTrigger>
            <TabsTrigger value="team">Моя команда</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            {/* Два контейнера: 1/4 и 3/4 */}
            <div className="flex gap-4 w-full">
              <div className="w-1/4">
                <h2 className="text-lg font-bold mb-6 pt-6">Профиль</h2>
                <div className="space-y-6">
                  {/* Блок "Обо мне" */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Обо мне</h3>
                    <div className="space-y-3">
                      {/* ФИО */}
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{getFullName()}</span>
                      </div>
                      {/* Отдел/Линейная структура */}
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {linearStructure || "Отдел не указан"}
                        </span>
                      </div>
                      {/* Должность */}
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{position || "Должность не указана"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Блок "Контакты" */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Контакты</h3>
                    <div className="space-y-3">
                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {userProfile?.email || DEFAULT_USER_PROFILE.email}
                        </span>
                      </div>
                      {/* Телефон */}
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {userProfile?.phone || DEFAULT_USER_PROFILE.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Блок "Agile" */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Agile</h3>
                    <div className="space-y-3">
                      {agileRoles && agileRoles.length > 0 ? (
                        agileRoles.map((agileRole, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-sm">
                              {agileRole.role}
                            </Badge>
                            {agileRole.stream && (
                              <span className="text-sm text-foreground">{agileRole.stream}</span>
                            )}
                            {agileRole.team && (
                              <span className="text-sm text-foreground">{agileRole.team}</span>
                            )}
                            {agileRole.workload !== undefined && (
                              <span className="text-sm text-foreground">{agileRole.workload}%</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Нет Agile ролей</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Правая колонка: Оценка и три контейнера */}
              <div className="w-3/4 flex flex-col gap-4">
                {/* Карьера */}
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Карьера</CardTitle>
                      <Link href="/services/career" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Перейти в сервис "Карьера"</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CareerWidget userProfile={userProfile} />
                  </CardContent>
                </Card>
                
                {/* Оценка */}
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Оценка</CardTitle>
                      <Link href="/services/assessment" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Перейти в сервис "Оценка"</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProfileWidgets userProfile={userProfile} />
                  </CardContent>
                </Card>
                
                {/* Ассессмент */}
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Ассессмент</CardTitle>
                      <Link href="/services/assessment-center" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <span>Перейти в сервис "Ассессмент"</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AssessmentWidget userProfile={userProfile} />
                  </CardContent>
                </Card>
                
                {/* Целеполагание (неактивный) */}
                <Card className="opacity-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-muted-foreground">Целеполагание</CardTitle>
                      <Link href="/services/goals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pointer-events-none">
                        <span>Перейти в сервис "Целеполагание"</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Контент целеполагания */}
                  </CardContent>
                </Card>
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

          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Просмотр информации о команде</p>
              <Link href="/services/career">
                <Button variant="outline">Перейти к команде</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Диалог для загрузки фотографии */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                                const parsedValue = e.target.value === "" ? undefined : Number.parseInt(e.target.value);
                                const value = parsedValue !== undefined && !isNaN(parsedValue) ? parsedValue : undefined;
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

            {/* Telegram */}
            <div className="space-y-2">
              <Label htmlFor="telegram">Логин Telegram</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">@</span>
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value.replace(/^@/, ""))}
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Укажите логин Telegram без символа @
              </p>
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
    </div>
  );
}

