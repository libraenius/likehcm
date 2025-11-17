"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SkillAssessment } from "@/components/skill-assessment";
import { getProfileById, getUserProfile, getCompetenceById, getCareerTrackByProfileId, getProfiles, getCareerTracks, getCompetences } from "@/lib/data";
import { calculateProfileMatch, calculateCareerTrackProgress } from "@/lib/calculations";
import { Users, Mail, User, TrendingUp, BookOpen, Info, Briefcase, ChevronDown, ChevronRight, Building2, Search, X, Edit, Star, CheckCircle2, ClipboardCheck, Target, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMember, UserProfile, SkillLevel, Profile, ProfileLevel } from "@/types";

// Структура подразделений
interface Department {
  id: string;
  name: string;
  parentId?: string;
}

// Моковые данные подразделений
const mockDepartments: Department[] = [
  { id: "dept-1", name: "Департамент автоматизации внутренних сервисов" },
  { id: "dept-2", name: "Управление развития общекорпоративных систем", parentId: "dept-1" },
  { id: "dept-3", name: "Управление разработки банковских продуктов", parentId: "dept-1" },
  { id: "dept-4", name: "Департамент информационной безопасности" },
  { id: "dept-5", name: "Управление качества и тестирования" },
];

// Моковые данные команды (в реальном приложении это будет из API)
const mockTeamMembers: (TeamMember & { departmentId?: string })[] = [
  {
    id: "member-1",
    name: "Петров Иван Сергеевич",
    lastName: "Петров",
    firstName: "Иван",
    middleName: "Сергеевич",
    position: "Главный инженер",
    email: "ivan.petrov@example.com",
    mainProfileId: "profile-1",
    additionalProfileIds: ["profile-3"],
    avatar: undefined,
    departmentId: "dept-2",
  },
  {
    id: "member-2",
    name: "Сидорова Мария Александровна",
    lastName: "Сидорова",
    firstName: "Мария",
    middleName: "Александровна",
    position: "Ведущий разработчик",
    email: "maria.sidorova@example.com",
    mainProfileId: "profile-2",
    additionalProfileIds: [],
    avatar: undefined,
    departmentId: "dept-2",
  },
  {
    id: "member-3",
    name: "Иванов Алексей Дмитриевич",
    lastName: "Иванов",
    firstName: "Алексей",
    middleName: "Дмитриевич",
    position: "Старший разработчик",
    email: "alexey.ivanov@example.com",
    mainProfileId: "profile-3",
    additionalProfileIds: ["profile-1"],
    avatar: undefined,
    departmentId: "dept-3",
  },
  {
    id: "member-4",
    name: "Смирнова Елена Викторовна",
    lastName: "Смирнова",
    firstName: "Елена",
    middleName: "Викторовна",
    position: "QA инженер",
    email: "elena.smirnova@example.com",
    mainProfileId: "profile-4",
    additionalProfileIds: [],
    avatar: undefined,
    departmentId: "dept-4",
  },
  {
    id: "member-5",
    name: "Помыткин Сергей Олегович",
    lastName: "Помыткин",
    firstName: "Сергей",
    middleName: "Олегович",
    position: "Руководитель разработки",
    email: "s.pomytkin@example.com",
    mainProfileId: "profile-1", // Будет заменено на профиль пользователя динамически
    additionalProfileIds: [],
    avatar: undefined,
    departmentId: "dept-1",
  },
];

// Моковые данные навыков для членов команды (в реальном приложении это будет из API)
const mockMemberSkills: Record<string, Record<string, number>> = {
  "member-1": { "comp-1": 3, "comp-2": 4, "comp-3": 2 },
  "member-2": { "comp-4": 5, "comp-5": 3 },
  "member-3": { "comp-1": 4, "comp-2": 5, "comp-3": 4 },
  "member-4": { "comp-6": 2, "comp-7": 3 },
  "member-5": { "comp-1": 4, "comp-2": 5, "comp-3": 4, "comp-4": 4 }, // Навыки для Помыткина
};

const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];

// Константы для уровней профиля
const profileLevelNames = {
  trainee: "Стажер",
  junior: "Младший",
  middle: "Средний",
  senior: "Старший",
  lead: "Ведущий",
};

const profileLevelColors = {
  trainee: "bg-gradient-to-r from-slate-100 to-slate-200 text-black border-slate-300 dark:from-slate-700 dark:to-slate-800 dark:text-white",
  junior: "bg-gradient-to-r from-slate-200 to-slate-300 text-black border-slate-400 dark:from-slate-600 dark:to-slate-700 dark:text-white",
  middle: "bg-gradient-to-r from-slate-300 to-slate-400 text-black border-slate-500 dark:from-slate-500 dark:to-slate-600 dark:text-white",
  senior: "bg-gradient-to-r from-slate-400 to-slate-500 text-black border-slate-600 dark:from-slate-400 dark:to-slate-500 dark:text-white",
  lead: "bg-gradient-to-r from-slate-500 to-slate-600 text-black border-slate-700 dark:from-slate-300 dark:to-slate-400 dark:text-white",
};

// Компонент для отображения уровня профиля
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
  const levelColor = profileLevelColors[profileLevel.level as keyof typeof profileLevelColors] || "bg-slate-100 text-slate-700 border-slate-300";

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
              {profileLevel.responsibilities.map((responsibility: string, idx: number) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-foreground mt-0.5">•</span>
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-2" />

          {/* Требования к образованию и стажу */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs flex items-center gap-1.5">
              <Info className="h-3 w-3 text-muted-foreground" />
              Требования:
            </h4>
            <div className="space-y-2 ml-4">
              <div className="text-xs">
                <span className="font-medium text-foreground">Образование: </span>
                <span className="text-muted-foreground">
                  {profileLevel.education || "Не указано"}
                </span>
              </div>
              <div className="text-xs">
                <span className="font-medium text-foreground">Стаж: </span>
                <span className="text-muted-foreground">
                  {profileLevel.experience || "Не указано"}
                </span>
              </div>
            </div>
          </div>
          <Separator className="my-2" />

          {/* Компетенции */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs flex items-center gap-1.5">
              <Info className="h-3 w-3 text-muted-foreground" />
              Компетенции:
            </h4>
            <div className="space-y-3">
              {/* Профессиональные компетенции */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Профессиональные компетенции:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "профессиональные компетенции";
                    })
                    .map(([competenceId, requiredLevel]: [string, SkillLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";

                      return (
                        <Badge
                          key={competenceId}
                          variant="outline"
                          className={`text-xs border ${professionalColor}`}
                        >
                          {comp.name} {requiredLevel}
                        </Badge>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "профессиональные компетенции";
                  }).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Нет профессиональных компетенций</p>
                  )}
                </div>
              </div>

              {/* Корпоративные компетенции */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Корпоративные компетенции:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileLevel.requiredSkills)
                    .filter(([competenceId]) => {
                      const comp = getCompetenceById(competenceId);
                      return comp && comp.type === "корпоративные компетенции";
                    })
                    .map(([competenceId, requiredLevel]: [string, SkillLevel]) => {
                      const comp = getCompetenceById(competenceId);
                      if (!comp) return null;

                      const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";

                      return (
                        <Badge
                          key={competenceId}
                          variant="outline"
                          className={`text-xs border ${corporateColor}`}
                        >
                          {comp.name} {requiredLevel}
                        </Badge>
                      );
                    })}
                  {Object.entries(profileLevel.requiredSkills).filter(([competenceId]) => {
                    const comp = getCompetenceById(competenceId);
                    return comp && comp.type === "корпоративные компетенции";
                  }).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Нет корпоративных компетенций</p>
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

// Компонент для содержимого тултипа профиля
function ProfileTooltipContent({ profile }: { profile: Profile }) {
  return (
    <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto w-full">
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
                
                // Сортируем уровни в правильном порядке
                const sortedLevels = [...profile.levels].sort((a, b) => {
                  const indexA = levelOrder.indexOf(a.level);
                  const indexB = levelOrder.indexOf(b.level);
                  return indexA - indexB;
                });
                
                return sortedLevels.map((profileLevel, levelIndex) => {
                  const levelLabel = profileLevelNames[profileLevel.level as keyof typeof profileLevelNames] || profileLevel.level;
                  
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

// Цвета для уровней компетенций
const getLevelColor = (level: number, isCorporate: boolean) => {
  if (isCorporate) {
    // Корпоративные компетенции - оттенки голубого/cyan
    switch (level) {
      case 1: return "bg-cyan-200 dark:bg-cyan-900";
      case 2: return "bg-cyan-300 dark:bg-cyan-800";
      case 3: return "bg-cyan-400 dark:bg-cyan-700";
      case 4: return "bg-cyan-500 dark:bg-cyan-600";
      case 5: return "bg-cyan-600 dark:bg-cyan-500";
      default: return "bg-cyan-300 dark:bg-cyan-800";
    }
  } else {
    // Профессиональные компетенции - оттенки фиолетового/purple
    switch (level) {
      case 1: return "bg-purple-200 dark:bg-purple-900";
      case 2: return "bg-purple-300 dark:bg-purple-800";
      case 3: return "bg-purple-400 dark:bg-purple-700";
      case 4: return "bg-purple-500 dark:bg-purple-600";
      case 5: return "bg-purple-600 dark:bg-purple-500";
      default: return "bg-purple-300 dark:bg-purple-800";
    }
  }
};

export default function TeamPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    departmentIds: string[];
    profileIds: string[];
    additionalProfileIds: string[];
    levelNames: string[];
  }>({
    departmentIds: [],
    profileIds: [],
    additionalProfileIds: [],
    levelNames: [],
  });
  const [competenceFilterDialogOpen, setCompetenceFilterDialogOpen] = useState(false);
  const [competenceFilters, setCompetenceFilters] = useState<{
    competenceTypes: string[];
    competenceIds: string[];
  }>({
    competenceTypes: [],
    competenceIds: [],
  });
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isProfileInfoDialogOpen, setIsProfileInfoDialogOpen] = useState(false);
  const [selectedProfileForInfo, setSelectedProfileForInfo] = useState<Profile | null>(null);
  const [memberSkills, setMemberSkills] = useState<Record<string, Record<string, number>>>(mockMemberSkills);
  // Самооценка сотрудников (в реальном приложении это будет из API)
  const [memberSelfAssessments, setMemberSelfAssessments] = useState<Record<string, Record<string, number>>>({
    "member-1": { "comp-1": 2, "comp-2": 3, "comp-3": 1 },
    "member-2": { "comp-4": 4, "comp-5": 2 },
    "member-3": { "comp-1": 3, "comp-2": 4, "comp-3": 3 },
    "member-4": { "comp-6": 1, "comp-7": 2 },
    "member-5": {}, // Для Помыткина используем userProfile.skills
  });

  // Загружаем профиль пользователя один раз при монтировании
  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUserProfile(profile);
    }
  }, []);

  // Обновляем профиль Помыткина на основе профиля пользователя
  const teamMembers = useMemo(() => {
    return mockTeamMembers.map((member) => {
      // Если это Помыткин и у пользователя есть профиль, используем его профиль
      if (member.id === "member-5" && userProfile?.mainProfileId) {
        return {
          ...member,
          mainProfileId: userProfile.mainProfileId,
          additionalProfileIds: userProfile.additionalProfileIds || [],
        };
      }
      return member;
    });
  }, [userProfile]);

  // Выбираем первого члена команды по умолчанию
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedMember) {
      setSelectedMember(teamMembers[0]);
    }
  }, [teamMembers.length, selectedMember]);

  const getInitials = (member: TeamMember) => {
    // Используем фамилию и имя для инициалов
    return `${member.lastName[0]}${member.firstName[0]}`.toUpperCase();
  };

  const getFullName = (member: TeamMember) => {
    // Формат: Фамилия Имя Отчество
    return member.middleName 
      ? `${member.lastName} ${member.firstName} ${member.middleName}`
      : `${member.lastName} ${member.firstName}`;
  };

  // Вычисляем соответствие профилей и уровень для каждого члена команды
  const membersWithMatch = useMemo(() => {
    if (!userProfile?.mainProfileId) {
      return teamMembers.map((member) => ({
        member,
        mainProfileMatch: 0,
        isSameProfile: false,
        levelName: null as string | null,
      }));
    }

    const userMainProfile = getProfileById(userProfile.mainProfileId);
    if (!userMainProfile) {
      return teamMembers.map((member) => ({
        member,
        mainProfileMatch: 0,
        isSameProfile: false,
        levelName: null as string | null,
      }));
    }

    return teamMembers.map((member) => {
      const memberMainProfile = getProfileById(member.mainProfileId);
      const isSameProfile = member.mainProfileId === userProfile.mainProfileId;
      
      // Вычисляем соответствие основного профиля
      let mainProfileMatch = 0;
      // Для Помыткина используем навыки из userProfile, если они есть
      const skillsForMatch = member.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
        ? userProfile.skills.reduce((acc, skill) => {
            acc[skill.competenceId] = skill.selfAssessment;
            return acc;
          }, {} as Record<string, number>)
        : memberSkills[member.id];
      
      if (memberMainProfile && skillsForMatch) {
        mainProfileMatch = calculateProfileMatch(
          skillsForMatch as Record<string, SkillLevel>,
          memberMainProfile.requiredCompetences
        );
      }

      // Вычисляем уровень сотрудника
      let levelName: string | null = null;
      // Для Помыткина используем навыки из userProfile, если они есть
      const skillsToUse = member.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
        ? userProfile.skills.reduce((acc, skill) => {
            acc[skill.competenceId] = skill.selfAssessment;
            return acc;
          }, {} as Record<string, number>)
        : memberSkills[member.id];
      
      if (memberMainProfile && skillsToUse) {
        const careerTrack = getCareerTrackByProfileId(member.mainProfileId);
        if (careerTrack) {
          // Создаем временный UserProfile для расчета уровня
          const tempUserProfile: UserProfile = {
            userId: member.id,
            mainProfileId: member.mainProfileId,
            additionalProfileIds: member.additionalProfileIds,
            skills: Object.entries(skillsToUse).map(([competenceId, level]) => ({
              competenceId,
              selfAssessment: level as SkillLevel,
              lastUpdated: new Date(),
            })),
          };
          
          const progress = calculateCareerTrackProgress(tempUserProfile, careerTrack);
          if (progress.currentLevel > 0) {
            const level = careerTrack.levels.find(l => l.level === progress.currentLevel);
            if (level) {
              levelName = level.name;
            }
          }
        }
      }

      return {
        member,
        mainProfileMatch,
        isSameProfile,
        levelName,
      };
    });
  }, [teamMembers, userProfile, memberSkills]);

  // Фильтрация и сортировка членов команды
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = membersWithMatch;

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = membersWithMatch.filter(({ member }) => {
        // Формируем полное ФИО для поиска
        const fullName = member.middleName 
          ? `${member.lastName} ${member.firstName} ${member.middleName}`.toLowerCase()
          : `${member.lastName} ${member.firstName}`.toLowerCase();
        const email = member.email.toLowerCase();
        const mainProfile = getProfileById(member.mainProfileId);
        const profileName = mainProfile?.name.toLowerCase() || "";
        
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          profileName.includes(query)
        );
      });
    }

    // Фильтрация по подразделениям
    if (filters.departmentIds.length > 0) {
      filtered = filtered.filter(({ member }) => {
        const memberWithDept = member as TeamMember & { departmentId?: string };
        return memberWithDept.departmentId && filters.departmentIds.includes(memberWithDept.departmentId);
      });
    }

    // Фильтрация по профилям
    if (filters.profileIds.length > 0) {
      filtered = filtered.filter(({ member }) => {
        return filters.profileIds.includes(member.mainProfileId);
      });
    }

    // Фильтрация по дополнительным профилям
    if (filters.additionalProfileIds.length > 0) {
      filtered = filtered.filter(({ member }) => {
        if (!member.additionalProfileIds || member.additionalProfileIds.length === 0) {
          return false;
        }
        return member.additionalProfileIds.some((profileId) => 
          filters.additionalProfileIds.includes(profileId)
        );
      });
    }

    // Фильтрация по уровням
    if (filters.levelNames.length > 0) {
      filtered = filtered.filter(({ levelName }) => {
        return levelName && filters.levelNames.includes(levelName);
      });
    }

    // Сортировка: сначала с таким же профилем, затем по соответствию
    return filtered.sort((a, b) => {
      if (a.isSameProfile && !b.isSameProfile) return -1;
      if (!a.isSameProfile && b.isSameProfile) return 1;
      return b.mainProfileMatch - a.mainProfileMatch;
    });
  }, [membersWithMatch, searchQuery, filters]);

  const selectedMemberData = selectedMember
    ? membersWithMatch.find(({ member }) => member.id === selectedMember.id)
    : null;

  // Построение иерархии подразделений
  const departmentHierarchy = useMemo(() => {
    type DeptWithData = Department & { 
      children: DeptWithData[]; 
      members: Array<{ member: TeamMember & { departmentId?: string }; isSameProfile: boolean; levelName: string | null }> 
    };
    
    const deptMap = new Map<string, DeptWithData>();
    
    // Инициализируем все подразделения
    mockDepartments.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [], members: [] });
    });

    // Строим дерево
    const rootDepartments: DeptWithData[] = [];
    deptMap.forEach((dept) => {
      if (dept.parentId) {
        const parent = deptMap.get(dept.parentId);
        if (parent) {
          parent.children.push(dept);
        }
      } else {
        rootDepartments.push(dept);
      }
    });

    // Распределяем членов команды по подразделениям
    filteredAndSortedMembers.forEach(({ member, isSameProfile, levelName }) => {
      if (member.departmentId) {
        const dept = deptMap.get(member.departmentId);
        if (dept) {
          dept.members.push({ member, isSameProfile, levelName });
        }
      }
    });

    return rootDepartments;
  }, [filteredAndSortedMembers]);

  const toggleDepartment = (deptId: string) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Моя команда</h1>
        <p className="text-muted-foreground">
          Просмотр участников команды и их профилей
        </p>
      </div>

      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Оценка сотрудников</span>
          </TabsTrigger>
          <TabsTrigger value="competences-members" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Компетенции команды (сотрудники)</span>
          </TabsTrigger>
          <TabsTrigger value="competences-competences" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Компетенции команды (компетенции)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по ФИО, email или профилю..."
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

          {/* Основной контент - двухколоночный макет */}
      {filteredAndSortedMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Члены команды не найдены</p>
            <p className="text-sm text-muted-foreground text-center">
              В команде пока нет участников
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 min-h-[calc(100vh-280px)]">
          {/* Левая колонка - список членов команды (25%) */}
          <div className="w-[25%] min-w-[250px] flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
            <div className="p-2 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Состав команды</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {departmentHierarchy.map((dept) => {
                  const isExpanded = expandedDepartments.has(dept.id);
                  const hasChildren = dept.children.length > 0;
                  
                  // Подсчитываем общее количество участников (включая дочерние подразделения)
                  const countMembers = (dept: typeof departmentHierarchy[0]): number => {
                    let count = dept.members.length;
                    dept.children.forEach(child => {
                      count += countMembers(child);
                    });
                    return count;
                  };
                  const totalMembers = countMembers(dept);

                  return (
                    <div key={dept.id} className="space-y-1">
                      {/* Подразделение */}
                      <div
                        onClick={() => hasChildren && toggleDepartment(dept.id)}
                        className={cn(
                          "p-1.5 rounded-md transition-colors flex items-center gap-1.5",
                          hasChildren && "cursor-pointer hover:bg-muted/50"
                        )}
                      >
                        {hasChildren && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDepartment(dept.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        {!hasChildren && <div className="w-4" />}
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm flex-1 min-w-0 truncate">
                          {dept.name}
                        </span>
                        {totalMembers > 0 && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shrink-0">
                            {totalMembers}
                          </Badge>
                        )}
                      </div>

                      {/* Дочерние подразделения и члены команды */}
                      {isExpanded && (
                        <div className="ml-4 space-y-1 border-l border-muted pl-2">
                          {/* Дочерние подразделения */}
                          {dept.children.map((childDept) => {
                            const childIsExpanded = expandedDepartments.has(childDept.id);
                            const childMembers = childDept.members;

          return (
                              <div key={childDept.id} className="space-y-1">
                                <div
                                  onClick={() => toggleDepartment(childDept.id)}
                                  className="p-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDepartment(childDept.id);
                                    }}
                                  >
                                    {childIsExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="font-medium text-sm flex-1 min-w-0 truncate">
                                    {childDept.name}
                                  </span>
                                  {childMembers.length > 0 && (
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shrink-0">
                                      {childMembers.length}
                                    </Badge>
                                  )}
                                </div>

                                {/* Члены дочернего подразделения */}
                                {childIsExpanded && (
                                  <div className="ml-4 space-y-1 border-l border-muted pl-2">
                                    {childMembers.map(({ member, isSameProfile, levelName }) => {
                                      const mainProfile = getProfileById(member.mainProfileId);
                                      const memberData = filteredAndSortedMembers.find(m => m.member.id === member.id);
                                      const displayLevelName = memberData?.levelName || levelName;
                                      return (
                                        <div
                                          key={member.id}
                                          onClick={() => setSelectedMember(member)}
                                          className={cn(
                                            "p-1.5 rounded-md cursor-pointer transition-colors",
                                            selectedMember?.id === member.id
                                              ? "bg-primary text-primary-foreground"
                                              : "hover:bg-muted"
                                          )}
                                        >
                                          <div className="flex items-start gap-1.5">
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                              <div
                                                className={cn(
                                                  "font-medium text-sm",
                                                  selectedMember?.id === member.id &&
                                                    "text-primary-foreground"
                                                )}
                                              >
                                                {getFullName(member)}
                                              </div>
                                              <div
                                                className={cn(
                                                  "text-xs",
                                                  selectedMember?.id === member.id
                                                    ? "text-accent-foreground/80"
                                                    : "text-muted-foreground"
                                                )}
                                              >
                                                {member.position}
                                              </div>
                                              {mainProfile && (
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-[10px] px-1.5 py-0.5 mt-0.5",
                                                    selectedMember?.id === member.id
                                                      ? "border-accent-foreground/30 text-accent-foreground/90"
                                                      : ""
                                                  )}
                                                >
                                                  {mainProfile.name}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Члены текущего подразделения */}
                          {dept.members.map(({ member, isSameProfile, levelName }) => {
                            const mainProfile = getProfileById(member.mainProfileId);
                            const memberData = filteredAndSortedMembers.find(m => m.member.id === member.id);
                            const displayLevelName = memberData?.levelName || levelName;
                            return (
                              <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className={cn(
                                  "p-1.5 rounded-md cursor-pointer transition-colors",
                                  selectedMember?.id === member.id
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-muted"
                                )}
                              >
                                <div className="flex items-start gap-1.5">
                                  <div className="flex-1 min-w-0 space-y-0.5">
                                    <div
                                      className={cn(
                                        "font-medium text-sm",
                                        selectedMember?.id === member.id &&
                                          "text-primary-foreground"
                                      )}
                                    >
                                      {getFullName(member)}
                                    </div>
                                    <div
                                      className={cn(
                                        "text-xs",
                                        selectedMember?.id === member.id
                                          ? "text-primary-foreground/80"
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      {member.position}
                                    </div>
                                    {mainProfile && (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-[10px] px-1.5 py-0.5 mt-0.5",
                                          selectedMember?.id === member.id
                                            ? "border-primary-foreground/30 text-primary-foreground/90"
                                            : ""
                                        )}
                                      >
                                        {mainProfile.name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Участники без подразделения */}
                {(() => {
                  const membersWithoutDept = filteredAndSortedMembers.filter(
                    ({ member }) => !member.departmentId
                  );
                  
                  if (membersWithoutDept.length === 0) return null;
                  
                  return (
                    <div className="space-y-1 mt-2 pt-2 border-t">
                      {membersWithoutDept.map(({ member, isSameProfile, levelName }) => {
                        const mainProfile = getProfileById(member.mainProfileId);
                        const memberData = filteredAndSortedMembers.find(m => m.member.id === member.id);
                        const displayLevelName = memberData?.levelName || levelName;
                        return (
                          <div
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className={cn(
                              "p-1.5 rounded-md cursor-pointer transition-colors",
                              selectedMember?.id === member.id
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            <div className="flex items-start gap-1.5">
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div
                                  className={cn(
                                    "font-medium text-sm",
                                    selectedMember?.id === member.id &&
                                      "text-primary-foreground"
                                  )}
                                >
                                  {getFullName(member)}
                                </div>
                                <div
                                  className={cn(
                                    "text-xs",
                                    selectedMember?.id === member.id
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {member.position}
                                </div>
                                {mainProfile && (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] px-1.5 py-0.5 mt-0.5",
                                      selectedMember?.id === member.id
                                        ? "border-primary-foreground/30 text-primary-foreground/90"
                                        : ""
                                    )}
                                  >
                                    {mainProfile.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Правая колонка - детальная информация (75%) */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-280px)]">
            {selectedMember && selectedMemberData ? (
              <Card className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-20 w-20 shrink-0">
                          {selectedMember.avatar && (
                            <AvatarImage src={selectedMember.avatar} alt={getFullName(selectedMember)} />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {getInitials(selectedMember)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <CardTitle className="text-xl break-words">{getFullName(selectedMember)}</CardTitle>
                          <CardDescription className="text-sm break-words">
                            {selectedMember.position}
                          </CardDescription>
                          <CardDescription className="text-sm flex items-center gap-1 break-words">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="break-all">{selectedMember.email}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Основной профиль */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Основной профиль:
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAssessmentDialogOpen(true)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Оценить
                        </Button>
                      </div>
                      {(() => {
                        const mainProfile = getProfileById(selectedMember.mainProfileId);
                        if (!mainProfile) {
                          return (
                            <div className="p-3 border rounded-lg bg-muted/20">
                              <p className="text-sm text-muted-foreground">Профиль не выбран</p>
                            </div>
                          );
                        }

                        // Вычисляем уровни на основе самооценки и оценки руководителя
                        const managerSkills = memberSkills[selectedMember.id] || {};
                        const selfSkills = selectedMember.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
                          ? userProfile.skills.reduce((acc, skill) => {
                              acc[skill.competenceId] = skill.selfAssessment;
                              return acc;
                            }, {} as Record<string, number>)
                          : memberSelfAssessments[selectedMember.id] || {};
                        
                        const careerTrack = getCareerTrackByProfileId(selectedMember.mainProfileId);
                        
                        // Функция для вычисления уровня на основе skills
                        const calculateLevel = (skills: Record<string, number>): number => {
                          if (!careerTrack) return 0;
                          
                          const sortedLevels = [...careerTrack.levels].sort((a, b) => b.level - a.level);
                          
                          for (const trackLevel of sortedLevels) {
                            let levelMatch = 0;
                            let totalRequired = 0;
                            
                            for (const [competenceId, requiredLevel] of Object.entries(trackLevel.requiredSkills)) {
                              const userLevel = skills[competenceId] || 0;
                              levelMatch += Math.min(userLevel, requiredLevel);
                              totalRequired += requiredLevel;
                            }
                            
                            const matchPercentage = totalRequired > 0 ? Math.round((levelMatch / totalRequired) * 100) : 0;
                            
                            if (matchPercentage >= trackLevel.minMatchPercentage) {
                              return trackLevel.level;
                            }
                          }
                          
                          return 0;
                        };
                        
                        const selfLevel = calculateLevel(selfSkills);
                        const managerLevel = calculateLevel(managerSkills);
                        
                        return (
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Badge variant="default" className="text-sm truncate">
                                    {mainProfile.name}
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => {
                                      setSelectedProfileForInfo(mainProfile);
                                      setIsProfileInfoDialogOpen(true);
                                    }}
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              {mainProfile.description && (
                                <p className="text-xs text-muted-foreground mt-2 break-words">
                                  {mainProfile.description}
                                </p>
                              )}
                              
                              {/* Уровни самооценки и оценки руководителя */}
                              <div className="mt-3 space-y-2">
                                {/* Уровень самооценки */}
                                {selfLevel > 0 && (
                                  <div className="flex items-center justify-between gap-2 p-2 bg-background rounded-md border">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <Star className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="text-sm font-medium truncate">Самооценка:</span>
                                    </div>
                                    <Badge variant="secondary" className="text-sm shrink-0">
                                      {selfLevel} - {levelNames[selfLevel - 1]}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Уровень оценки руководителя */}
                                {managerLevel > 0 && (
                                  <div className="flex items-center justify-between gap-2 p-2 bg-background rounded-md border">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <Edit className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="text-sm font-medium truncate">Оценка руководителя:</span>
                                    </div>
                                    <Badge variant="secondary" className="text-sm shrink-0">
                                      {managerLevel} - {levelNames[managerLevel - 1]}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Если нет оценок */}
                                {selfLevel === 0 && managerLevel === 0 && (
                                  <div className="text-xs text-muted-foreground text-center py-2">
                                    Оценки не проведены
                                  </div>
                                )}
                  </div>
                </div>

                            {/* Оценки компетенций основного профиля */}
                            {(() => {
                              const managerSkills = memberSkills[selectedMember.id] || {};
                              const selfSkills = selectedMember.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
                                ? userProfile.skills.reduce((acc, skill) => {
                                    acc[skill.competenceId] = skill.selfAssessment;
                                    return acc;
                                  }, {} as Record<string, number>)
                                : memberSelfAssessments[selectedMember.id] || {};
                              const mainProfile = getProfileById(selectedMember.mainProfileId);
                              if (!mainProfile || mainProfile.requiredCompetences.length === 0) return null;

                              // Собираем все компетенции, которые оценены либо руководителем, либо самим сотрудником
                              const assessedCompetences = mainProfile.requiredCompetences.filter(
                                (reqComp) => 
                                  (managerSkills[reqComp.competenceId] && managerSkills[reqComp.competenceId] > 0) ||
                                  (selfSkills[reqComp.competenceId] && selfSkills[reqComp.competenceId] > 0)
                              );

                              if (assessedCompetences.length === 0) return null;

                              // Разделяем на профессиональные и корпоративные
                              const professionalCompetences = assessedCompetences.filter((reqComp) => {
                                const comp = getCompetenceById(reqComp.competenceId);
                                return comp && comp.type !== "корпоративные компетенции";
                              });

                              const corporateCompetences = assessedCompetences.filter((reqComp) => {
                                const comp = getCompetenceById(reqComp.competenceId);
                                return comp && comp.type === "корпоративные компетенции";
                              });

                              return (
                                <div className="space-y-2 mt-3">
                                  <Label className="text-sm font-medium text-muted-foreground">
                                    Оценки компетенций:
                                  </Label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Первый столбец - Профессиональные компетенции */}
                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold text-muted-foreground">Профессиональные компетенции</Label>
                                      <div className="space-y-3">
                                        {professionalCompetences.map((reqComp) => {
                                          const comp = getCompetenceById(reqComp.competenceId);
                                          if (!comp) return null;
                                          const managerLevel = managerSkills[reqComp.competenceId] || 0;
                                          const selfLevel = selfSkills[reqComp.competenceId] || 0;
                                          const hasDifference = managerLevel > 0 && selfLevel > 0 && managerLevel !== selfLevel;
                                          const displayLevel = managerLevel > 0 ? managerLevel : selfLevel;
                                          const levelName = levelNames[displayLevel - 1];
                                          const isCorporate = comp.type === "корпоративные компетенции";
                                          const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";
                                          const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";
                                          const tagColor = isCorporate ? corporateColor : professionalColor;

                                          const difference = managerLevel - selfLevel;
                                          
                                          return (
                                            <div
                                              key={reqComp.competenceId}
                                              className="p-2.5 border rounded-md bg-card space-y-2"
                                            >
                                              {/* Заголовок компетенции */}
                                              <div>
                                                <div className="font-semibold text-sm mb-0.5 break-words">{comp.name}</div>
                                              </div>
                                              
                                              {/* Оценки в виде горизонтальных баров */}
                                              <div className="space-y-2">
                                                {/* Самооценка */}
                                                {selfLevel > 0 && (
                                                  <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                      <span className="text-xs font-medium text-muted-foreground truncate">Самооценка</span>
                                                      <span className="text-xs font-semibold text-muted-foreground shrink-0">{levelNames[selfLevel - 1]}</span>
                                                    </div>
                                                    <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                      <div
                                                        className={cn(
                                                          "h-full rounded-full transition-all",
                                                          getLevelColor(selfLevel, isCorporate),
                                                          "opacity-70"
                                                        )}
                                                        style={{ width: `${(selfLevel / 5) * 100}%` }}
                                                      />
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {/* Оценка руководителя */}
                                                {managerLevel > 0 && (
                                                  <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                      <span className="text-xs font-medium text-muted-foreground truncate">Руководитель</span>
                                                      <span className="text-xs font-semibold text-muted-foreground shrink-0">{levelName}</span>
                                                    </div>
                                                    <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                      <div
                                                        className={cn(
                                                          "h-full rounded-full transition-all",
                                                          getLevelColor(managerLevel, isCorporate)
                                                        )}
                                                        style={{ width: `${(managerLevel / 5) * 100}%` }}
                                                      />
                                                    </div>
                                                  </div>
                  )}
                </div>

                                              {/* Разница */}
                                              {hasDifference && (
                                                <div className={cn(
                                                  "p-1.5 rounded border",
                                                  difference > 0 
                                                    ? "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-800"
                                                    : "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-800"
                                                )}>
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                      <TrendingUp className={cn(
                                                        "h-3 w-3",
                                                        difference > 0 ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300 rotate-180"
                                                      )} />
                                                      <span className="text-xs font-semibold">
                                                        {difference > 0 ? "Руководитель выше" : "Самооценка выше"}
                                                      </span>
                                                    </div>
                                                    <Badge 
                                                      variant="outline" 
                                                      className={cn(
                                                        "text-xs font-bold px-1.5 py-0.5",
                                                        difference > 0
                                                          ? "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-700"
                                                          : "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700"
                                                      )}
                                                    >
                                                      {difference > 0 ? '+' : ''}{difference}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Совпадение */}
                                              {!hasDifference && managerLevel > 0 && selfLevel > 0 && (
                                                <div className="p-1.5 rounded bg-green-50 border border-green-300 dark:bg-green-950 dark:border-green-800">
                                                  <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                                                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                                      Оценки совпадают
                                                    </span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Второй столбец - Корпоративные компетенции */}
                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold text-muted-foreground">Корпоративные компетенции</Label>
                                      <div className="space-y-3">
                                        {corporateCompetences.map((reqComp) => {
                                        const comp = getCompetenceById(reqComp.competenceId);
                                        if (!comp) return null;
                                        const managerLevel = managerSkills[reqComp.competenceId] || 0;
                                        const selfLevel = selfSkills[reqComp.competenceId] || 0;
                                        const hasDifference = managerLevel > 0 && selfLevel > 0 && managerLevel !== selfLevel;
                                        const displayLevel = managerLevel > 0 ? managerLevel : selfLevel;
                                        const levelName = levelNames[displayLevel - 1];
                                        const isCorporate = comp.type === "корпоративные компетенции";
                                        const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";
                                        const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";
                                        const tagColor = isCorporate ? corporateColor : professionalColor;

                                        const difference = managerLevel - selfLevel;
                                        
                                        return (
                                          <div
                                            key={reqComp.competenceId}
                                            className="p-2.5 border rounded-md bg-card space-y-2"
                                          >
                                            {/* Заголовок компетенции */}
                  <div>
                                              <div className="font-semibold text-sm mb-0.5">{comp.name}</div>
                                            </div>
                                            
                                            {/* Оценки в виде горизонтальных баров */}
                                            <div className="space-y-2">
                                              {/* Самооценка */}
                                              {selfLevel > 0 && (
                                                <div className="space-y-1">
                                                  <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">Самооценка</span>
                                                      <span className="text-xs font-semibold text-muted-foreground">{levelNames[selfLevel - 1]}</span>
                                                  </div>
                                                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                      className={cn(
                                                        "h-full rounded-full transition-all",
                                                        getLevelColor(selfLevel, isCorporate),
                                                        "opacity-70"
                                                      )}
                                                      style={{ width: `${(selfLevel / 5) * 100}%` }}
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Оценка руководителя */}
                                              {managerLevel > 0 && (
                                                <div className="space-y-1">
                                                  <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">Руководитель</span>
                                                      <span className="text-xs font-semibold text-muted-foreground">{levelName}</span>
                                                  </div>
                                                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                      className={cn(
                                                        "h-full rounded-full transition-all",
                                                        getLevelColor(managerLevel, isCorporate)
                                                      )}
                                                      style={{ width: `${(managerLevel / 5) * 100}%` }}
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Разница */}
                                            {hasDifference && (
                                              <div className={cn(
                                                "p-1.5 rounded border",
                                                difference > 0 
                                                  ? "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-800"
                                                  : "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-800"
                                              )}>
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-1.5">
                                                    <TrendingUp className={cn(
                                                      "h-3 w-3",
                                                      difference > 0 ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300 rotate-180"
                                                    )} />
                                                    <span className="text-xs font-semibold">
                                                      {difference > 0 ? "Руководитель выше" : "Самооценка выше"}
                                                    </span>
                                                  </div>
                                                  <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                      "text-xs font-bold px-1.5 py-0.5",
                                                      difference > 0
                                                        ? "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-700"
                                                        : "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700"
                                                    )}
                                                  >
                                                    {difference > 0 ? '+' : ''}{difference}
                                                  </Badge>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Совпадение */}
                                            {!hasDifference && managerLevel > 0 && selfLevel > 0 && (
                                              <div className="p-1.5 rounded bg-green-50 border border-green-300 dark:bg-green-950 dark:border-green-800">
                                                <div className="flex items-center gap-1.5">
                                                  <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                                                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                                    Оценки совпадают
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Дополнительные профили */}
                    {selectedMember.additionalProfileIds.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Дополнительные профили:
                          </h3>
                          <div className="space-y-2">
                            {selectedMember.additionalProfileIds.map((profileId) => {
                              const profile = getProfileById(profileId);
                              if (!profile) return null;

                              const managerSkills = memberSkills[selectedMember.id] || {};
                              const selfSkills = selectedMember.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
                                ? userProfile.skills.reduce((acc, skill) => {
                                    acc[skill.competenceId] = skill.selfAssessment;
                                    return acc;
                                  }, {} as Record<string, number>)
                                : memberSelfAssessments[selectedMember.id] || {};
                              
                              const assessedCompetences = profile.requiredCompetences.filter(
                                (reqComp) => 
                                  (managerSkills[reqComp.competenceId] && managerSkills[reqComp.competenceId] > 0) ||
                                  (selfSkills[reqComp.competenceId] && selfSkills[reqComp.competenceId] > 0)
                              );

                              return (
                                <div
                                  key={profileId}
                                  className="p-3 border rounded-lg bg-muted/20"
                                >
                                  <Badge variant="secondary" className="text-sm mb-2">
                                    {profile.name}
                                  </Badge>
                                  {profile.description && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {profile.description}
                                    </p>
                                  )}
                                  {/* Оценки компетенций дополнительного профиля */}
                                  {assessedCompetences.length > 0 && (() => {
                                    // Разделяем на профессиональные и корпоративные
                                    const professionalCompetences = assessedCompetences.filter((reqComp) => {
                                      const comp = getCompetenceById(reqComp.competenceId);
                                      return comp && comp.type !== "корпоративные компетенции";
                                    });

                                    const corporateCompetences = assessedCompetences.filter((reqComp) => {
                                      const comp = getCompetenceById(reqComp.competenceId);
                                      return comp && comp.type === "корпоративные компетенции";
                                    });

                                    return (
                                      <div className="space-y-2 mt-3 pt-3 border-t">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Оценки компетенций:
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {/* Первый столбец - Профессиональные компетенции */}
                                          <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-muted-foreground">Профессиональные компетенции</Label>
                                            <div className="space-y-3">
                                              {professionalCompetences.map((reqComp) => {
                                              const comp = getCompetenceById(reqComp.competenceId);
                                              if (!comp) return null;
                                              const managerLevel = managerSkills[reqComp.competenceId] || 0;
                                              const selfLevel = selfSkills[reqComp.competenceId] || 0;
                                              const hasDifference = managerLevel > 0 && selfLevel > 0 && managerLevel !== selfLevel;
                                              const displayLevel = managerLevel > 0 ? managerLevel : selfLevel;
                                              const levelName = levelNames[displayLevel - 1];
                                              const isCorporate = comp.type === "корпоративные компетенции";
                                              const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";
                                              const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";
                                              const tagColor = isCorporate ? corporateColor : professionalColor;

                                              const difference = managerLevel - selfLevel;
                                              
                                              return (
                                            <div
                                              key={reqComp.competenceId}
                                              className="p-2.5 border rounded-md bg-card space-y-2"
                                            >
                                              {/* Заголовок компетенции */}
                                              <div>
                                                <div className="font-semibold text-sm mb-0.5">{comp.name}</div>
                                              </div>
                                              
                                          {/* Оценки в виде горизонтальных баров */}
                                          <div className="space-y-2">
                                            {/* Самооценка */}
                                            {selfLevel > 0 && (
                                              <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">Самооценка</span>
                                                      <span className="text-xs font-semibold text-muted-foreground">{levelNames[selfLevel - 1]}</span>
                                                </div>
                                                <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                  <div
                                                    className={cn(
                                                      "h-full rounded-full transition-all",
                                                      getLevelColor(selfLevel, isCorporate),
                                                      "opacity-70"
                                                    )}
                                                    style={{ width: `${(selfLevel / 5) * 100}%` }}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Оценка руководителя */}
                                            {managerLevel > 0 && (
                                              <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">Руководитель</span>
                                                      <span className="text-xs font-semibold text-muted-foreground">{levelName}</span>
                                                </div>
                                                <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                  <div
                                                    className={cn(
                                                      "h-full rounded-full transition-all",
                                                      getLevelColor(managerLevel, isCorporate)
                                                    )}
                                                    style={{ width: `${(managerLevel / 5) * 100}%` }}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                              
                                              {/* Разница */}
                                              {hasDifference && (
                                                <div className={cn(
                                                  "p-1.5 rounded border",
                                                  difference > 0 
                                                    ? "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-800"
                                                    : "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-800"
                                                )}>
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                      <TrendingUp className={cn(
                                                        "h-3 w-3",
                                                        difference > 0 ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300 rotate-180"
                                                      )} />
                                                      <span className="text-xs font-semibold">
                                                        {difference > 0 ? "Руководитель выше" : "Самооценка выше"}
                                                      </span>
                                                    </div>
                                                    <Badge 
                                                      variant="outline" 
                                                      className={cn(
                                                        "text-xs font-bold px-1.5 py-0.5",
                                                        difference > 0
                                                          ? "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-700"
                                                          : "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700"
                                                      )}
                                                    >
                                                      {difference > 0 ? '+' : ''}{difference}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Совпадение */}
                                              {!hasDifference && managerLevel > 0 && selfLevel > 0 && (
                                                <div className="p-1.5 rounded bg-green-50 border border-green-300 dark:bg-green-950 dark:border-green-800">
                                                  <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                                                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                                      Оценки совпадают
                                                    </span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                              })}
                                            </div>
                                          </div>

                                          {/* Второй столбец - Корпоративные компетенции */}
                                          <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-muted-foreground">Корпоративные компетенции</Label>
                                            <div className="space-y-3">
                                              {corporateCompetences.map((reqComp) => {
                                            const comp = getCompetenceById(reqComp.competenceId);
                                            if (!comp) return null;
                                            const managerLevel = managerSkills[reqComp.competenceId] || 0;
                                            const selfLevel = selfSkills[reqComp.competenceId] || 0;
                                            const hasDifference = managerLevel > 0 && selfLevel > 0 && managerLevel !== selfLevel;
                                            const displayLevel = managerLevel > 0 ? managerLevel : selfLevel;
                                            const levelName = levelNames[displayLevel - 1];
                                            const isCorporate = comp.type === "корпоративные компетенции";
                                            const professionalColor = "bg-purple-50 text-purple-700 border-purple-300";
                                            const corporateColor = "bg-cyan-50 text-cyan-700 border-cyan-300";
                                            const tagColor = isCorporate ? corporateColor : professionalColor;

                                            const difference = managerLevel - selfLevel;
                                            
                                            return (
                                              <div
                                                key={reqComp.competenceId}
                                                className="p-2.5 border rounded-md bg-card space-y-2"
                                              >
                                                {/* Заголовок компетенции */}
                                                <div>
                                                  <div className="font-semibold text-sm mb-0.5">{comp.name}</div>
                                                </div>
                                                
                                                {/* Оценки в виде горизонтальных баров */}
                                                <div className="space-y-2">
                                                  {/* Самооценка */}
                                                  {selfLevel > 0 && (
                                                    <div className="space-y-1">
                                                      <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">Самооценка</span>
                                                      <span className="text-xs font-semibold text-muted-foreground">{levelNames[selfLevel - 1]}</span>
                                                      </div>
                                                      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                          className={cn(
                                                            "h-full rounded-full transition-all",
                                                            tagColor,
                                                            "opacity-70"
                                                          )}
                                                          style={{ width: `${(selfLevel / 5) * 100}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {/* Оценка руководителя */}
                                                  {managerLevel > 0 && (
                                                    <div className="space-y-1">
                                                      <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">Руководитель</span>
                                                      <span className="text-xs font-semibold text-muted-foreground">{levelName}</span>
                                                      </div>
                                                      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                          className={cn(
                                                            "h-full rounded-full transition-all",
                                                            tagColor
                                                          )}
                                                          style={{ width: `${(managerLevel / 5) * 100}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                {/* Разница */}
                                                {hasDifference && (
                                                  <div className={cn(
                                                    "p-1.5 rounded border",
                                                    difference > 0 
                                                      ? "bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-800"
                                                      : "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-800"
                                                  )}>
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-1.5">
                                                        <TrendingUp className={cn(
                                                          "h-3 w-3",
                                                          difference > 0 ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300 rotate-180"
                                                        )} />
                                                        <span className="text-xs font-semibold">
                                                          {difference > 0 ? "Руководитель выше" : "Самооценка выше"}
                                                        </span>
                                                      </div>
                                                      <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                          "text-xs font-bold px-1.5 py-0.5",
                                                          difference > 0
                                                            ? "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-700"
                                                            : "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700"
                                                        )}
                                                      >
                                                        {difference > 0 ? '+' : ''}{difference}
                        </Badge>
                    </div>
                  </div>
                )}

                                                {/* Совпадение */}
                                                {!hasDifference && managerLevel > 0 && selfLevel > 0 && (
                                                  <div className="p-1.5 rounded bg-green-50 border border-green-300 dark:bg-green-950 dark:border-green-800">
                                                    <div className="flex items-center gap-1.5">
                                                      <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                                                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                                        Оценки совпадают
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            })}
                          </div>
                    </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">Выберите участника команды</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Нажмите на участника в списке слева для просмотра детальной информации
                  </p>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="competences-members" className="space-y-4">
          {/* Поиск и фильтрация */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО, email или профилю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                  {(filters.departmentIds.length > 0 || filters.profileIds.length > 0 || filters.additionalProfileIds.length > 0 || filters.levelNames.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.departmentIds.length + filters.profileIds.length + filters.additionalProfileIds.length + filters.levelNames.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader className="pb-3">
                  <DialogTitle className="text-lg">Фильтры</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Фильтр по подразделениям */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Подразделения</Label>
                    <MultiSelect
                      options={mockDepartments.map((department) => ({
                        value: department.id,
                        label: department.name,
                      }))}
                      selected={filters.departmentIds}
                      onChange={(selected) => {
                        setFilters({
                          ...filters,
                          departmentIds: selected,
                        });
                      }}
                      placeholder="Выберите подразделения..."
                    />
                  </div>

                  {/* Фильтр по профилям */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Основные профили</Label>
                    <MultiSelect
                      options={getProfiles().map((profile) => ({
                        value: profile.id,
                        label: profile.name,
                      }))}
                      selected={filters.profileIds}
                      onChange={(selected) => {
                        setFilters({
                          ...filters,
                          profileIds: selected,
                        });
                      }}
                      placeholder="Выберите основные профили..."
                    />
                  </div>

                  {/* Фильтр по дополнительным профилям */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Дополнительные профили</Label>
                    <MultiSelect
                      options={getProfiles().map((profile) => ({
                        value: profile.id,
                        label: profile.name,
                      }))}
                      selected={filters.additionalProfileIds}
                      onChange={(selected) => {
                        setFilters({
                          ...filters,
                          additionalProfileIds: selected,
                        });
                      }}
                      placeholder="Выберите дополнительные профили..."
                    />
                  </div>

                  {/* Фильтр по уровням */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Уровни карьерного трека</Label>
                    <MultiSelect
                      options={(() => {
                        // Собираем все уникальные уровни из всех карьерных треков
                        const allLevels = new Map<string, string>();
                        getCareerTracks().forEach((track) => {
                          track.levels.forEach((level) => {
                            allLevels.set(level.name, level.name);
                          });
                        });
                        return Array.from(allLevels.entries()).map(([value, label]) => ({
                          value,
                          label,
                        }));
                      })()}
                      selected={filters.levelNames}
                      onChange={(selected) => {
                        setFilters({
                          ...filters,
                          levelNames: selected,
                        });
                      }}
                      placeholder="Выберите уровни..."
                    />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ 
                        departmentIds: [], 
                        profileIds: [], 
                        additionalProfileIds: [],
                        levelNames: [],
                      });
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button size="sm" onClick={() => setFilterDialogOpen(false)}>
                    Применить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Компетенции команды (сотрудники)</CardTitle>
              <CardDescription>
                Анализ компетенций всей команды и выявление пробелов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAndSortedMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">Члены команды не найдены</p>
                  <p className="text-sm text-muted-foreground text-center">
                    В команде пока нет участников или не найдено совпадений по поисковому запросу
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[1400px]">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="min-w-[180px] px-4 whitespace-normal">Сотрудник</TableHead>
                        <TableHead className="min-w-[200px] px-4 whitespace-normal">Должность / Подразделение</TableHead>
                        <TableHead className="min-w-[150px] px-4 whitespace-normal">Профиль</TableHead>
                        <TableHead className="min-w-[150px] px-4 whitespace-normal">Уровень профиля</TableHead>
                        <TableHead className="min-w-[180px] px-4 whitespace-normal">Дополнительные профили</TableHead>
                        <TableHead className="min-w-[250px] px-4 whitespace-normal">Профессиональные компетенции</TableHead>
                        <TableHead className="min-w-[250px] px-4 whitespace-normal">Корпоративные компетенции</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredAndSortedMembers.map(({ member, levelName }) => {
                      const profile = getProfileById(member.mainProfileId);
                      const department = mockDepartments.find((d) => d.id === member.departmentId);
                      
                      // Получаем самооценку сотрудника
                      const selfAssessmentToUse = member.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
                        ? userProfile.skills.reduce((acc, skill) => {
                            acc[skill.competenceId] = skill.selfAssessment;
                            return acc;
                          }, {} as Record<string, number>)
                        : memberSelfAssessments[member.id] || {};
                      
                      // Получаем оценку руководителя
                      const managerAssessment = memberSkills[member.id] || {};
                      
                      // Собираем все компетенции (из обеих оценок)
                      const allCompetenceIds = new Set([
                        ...Object.keys(selfAssessmentToUse),
                        ...Object.keys(managerAssessment),
                      ]);
                      
                      // Разделяем компетенции на профессиональные и корпоративные
                      const professionalCompetences: Array<{ 
                        competence: ReturnType<typeof getCompetenceById>; 
                        selfLevel: number | null;
                        managerLevel: number | null;
                      }> = [];
                      const corporateCompetences: Array<{ 
                        competence: ReturnType<typeof getCompetenceById>; 
                        selfLevel: number | null;
                        managerLevel: number | null;
                      }> = [];
                      
                      allCompetenceIds.forEach((competenceId) => {
                        const competence = getCompetenceById(competenceId);
                        if (competence) {
                          const selfLevel = competenceId in selfAssessmentToUse ? selfAssessmentToUse[competenceId] : null;
                          const managerLevel = competenceId in managerAssessment ? managerAssessment[competenceId] : null;
                          
                          const competenceData = {
                            competence,
                            selfLevel,
                            managerLevel,
                          };
                          
                          if (competence.type === "профессиональные компетенции") {
                            professionalCompetences.push(competenceData);
                          } else if (competence.type === "корпоративные компетенции") {
                            corporateCompetences.push(competenceData);
                          }
                        }
                      });
                      
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="px-4 whitespace-normal">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                {member.avatar ? (
                                  <AvatarImage src={member.avatar} alt={getFullName(member)} />
                                ) : null}
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                  {getInitials(member)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium">{getFullName(member)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{member.position}</span>
                              {department && (
                                <div className="text-sm text-muted-foreground">
                                  {department.name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {profile && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="default" className="w-fit">
                                    {profile.name}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <div className="space-y-2">
                                    <p className="font-semibold">{profile.name}</p>
                                    {profile.description && (
                                      <p className="text-sm">{profile.description}</p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {levelName ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="w-fit">
                                    {levelName}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <div className="space-y-2">
                                    <p className="font-semibold">{levelName}</p>
                                    {(() => {
                                      const careerTrack = getCareerTrackByProfileId(member.mainProfileId);
                                      if (careerTrack) {
                                        const level = careerTrack.levels.find(l => l.name === levelName);
                                        if (level?.description) {
                                          return <p className="text-sm">{level.description}</p>;
                                        }
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {member.additionalProfileIds && member.additionalProfileIds.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {member.additionalProfileIds.map((profileId) => {
                                  const additionalProfile = getProfileById(profileId);
                                  return additionalProfile ? (
                                    <Tooltip key={profileId}>
                                      <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="w-fit text-xs">
                                          {additionalProfile.name}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        <div className="space-y-2">
                                          <p className="font-semibold">{additionalProfile.name}</p>
                                          {additionalProfile.description && (
                                            <p className="text-sm">{additionalProfile.description}</p>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {professionalCompetences.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {professionalCompetences.map(({ competence, selfLevel, managerLevel }) => {
                                  const displayText = selfLevel !== null && managerLevel !== null
                                    ? `${competence.name} ${selfLevel}/${managerLevel}`
                                    : selfLevel !== null
                                    ? `${competence.name} ${selfLevel}/—`
                                    : managerLevel !== null
                                    ? `${competence.name} —/${managerLevel}`
                                    : competence.name;
                                  
                                  const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                                  
                                  return (
                                    <Tooltip key={competence.id}>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                                        >
                                          {displayText}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        <div className="space-y-2">
                                          <p className="font-semibold">{competence.name}</p>
                                          {competence.description && (
                                            <p className="text-sm">{competence.description}</p>
                                          )}
                                          <div className="space-y-1 text-sm">
                                            {selfLevel !== null && (
                                              <p>
                                                <span className="font-medium">Самооценка:</span> {selfLevel} - {levelNames[selfLevel - 1]}
                                              </p>
                                            )}
                                            {managerLevel !== null && (
                                              <p>
                                                <span className="font-medium">Оценка руководителя:</span> {managerLevel} - {levelNames[managerLevel - 1]}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            {corporateCompetences.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {corporateCompetences.map(({ competence, selfLevel, managerLevel }) => {
                                  const displayText = selfLevel !== null && managerLevel !== null
                                    ? `${competence.name} ${selfLevel}/${managerLevel}`
                                    : selfLevel !== null
                                    ? `${competence.name} ${selfLevel}/—`
                                    : managerLevel !== null
                                    ? `${competence.name} —/${managerLevel}`
                                    : competence.name;
                                  
                                  const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                                  
                                  return (
                                    <Tooltip key={competence.id}>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800"
                                        >
                                          {displayText}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        <div className="space-y-2">
                                          <p className="font-semibold">{competence.name}</p>
                                          {competence.description && (
                                            <p className="text-sm">{competence.description}</p>
                                          )}
                                          <div className="space-y-1 text-sm">
                                            {selfLevel !== null && (
                                              <p>
                                                <span className="font-medium">Самооценка:</span> {selfLevel} - {levelNames[selfLevel - 1]}
                                              </p>
                                            )}
                                            {managerLevel !== null && (
                                              <p>
                                                <span className="font-medium">Оценка руководителя:</span> {managerLevel} - {levelNames[managerLevel - 1]}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competences-competences" className="space-y-4">
          {/* Поиск и фильтрация */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по компетенциям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Dialog open={competenceFilterDialogOpen} onOpenChange={setCompetenceFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                  {(competenceFilters.competenceTypes.length > 0 || competenceFilters.competenceIds.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {competenceFilters.competenceTypes.length + competenceFilters.competenceIds.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader className="pb-3">
                  <DialogTitle className="text-lg">Фильтры</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Фильтр по типам компетенций */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Типы компетенций</Label>
                    <MultiSelect
                      options={[
                        { value: "профессиональные компетенции", label: "Профессиональные компетенции" },
                        { value: "корпоративные компетенции", label: "Корпоративные компетенции" },
                      ]}
                      selected={competenceFilters.competenceTypes}
                      onChange={(selected) => {
                        setCompetenceFilters({
                          ...competenceFilters,
                          competenceTypes: selected,
                        });
                      }}
                      placeholder="Выберите типы компетенций..."
                    />
                  </div>

                  {/* Фильтр по компетенциям */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Компетенции</Label>
                    <MultiSelect
                      options={getCompetences().map((competence) => ({
                        value: competence.id,
                        label: competence.name,
                      }))}
                      selected={competenceFilters.competenceIds}
                      onChange={(selected) => {
                        setCompetenceFilters({
                          ...competenceFilters,
                          competenceIds: selected,
                        });
                      }}
                      placeholder="Выберите компетенции..."
                    />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCompetenceFilters({ 
                        competenceTypes: [],
                        competenceIds: [],
                      });
                    }}
                  >
                    Сбросить
                  </Button>
                  <Button size="sm" onClick={() => setCompetenceFilterDialogOpen(false)}>
                    Применить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Компетенции команды (компетенции)</CardTitle>
              <CardDescription>
                Анализ компетенций, сгруппированных по типам компетенций
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAndSortedMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">Члены команды не найдены</p>
                  <p className="text-sm text-muted-foreground text-center">
                    В команде пока нет участников или не найдено совпадений по поисковому запросу
                  </p>
                </div>
              ) : (() => {
                // Собираем все уникальные компетенции из всех сотрудников
                const allCompetenceIds = new Set<string>();
                
                filteredAndSortedMembers.forEach(({ member }) => {
                  // Получаем самооценку сотрудника
                  const selfAssessmentToUse = member.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
                    ? userProfile.skills.reduce((acc, skill) => {
                        acc[skill.competenceId] = skill.selfAssessment;
                        return acc;
                      }, {} as Record<string, number>)
                    : memberSelfAssessments[member.id] || {};
                  
                  // Получаем оценку руководителя
                  const managerAssessment = memberSkills[member.id] || {};
                  
                  // Добавляем все компетенции
                  Object.keys(selfAssessmentToUse).forEach(id => allCompetenceIds.add(id));
                  Object.keys(managerAssessment).forEach(id => allCompetenceIds.add(id));
                });
                
                // Преобразуем в массив и получаем данные компетенций
                const allCompetences = Array.from(allCompetenceIds)
                  .map((competenceId) => {
                    const competence = getCompetenceById(competenceId);
                    if (!competence) return null;
                    
                    // Фильтрация по типам компетенций
                    if (competenceFilters.competenceTypes.length > 0) {
                      if (!competenceFilters.competenceTypes.includes(competence.type)) {
                        return null;
                      }
                    }
                    
                    // Фильтрация по конкретным компетенциям
                    if (competenceFilters.competenceIds.length > 0) {
                      if (!competenceFilters.competenceIds.includes(competenceId)) {
                        return null;
                      }
                    }
                    
                    // Фильтрация по поисковому запросу
                    if (searchQuery.trim()) {
                      const query = searchQuery.toLowerCase();
                      if (!competence.name.toLowerCase().includes(query) && 
                          !(competence.description?.toLowerCase().includes(query) ?? false)) {
                        return null;
                      }
                    }
                    
                    return { competenceId, competence };
                  })
                  .filter((item): item is { competenceId: string; competence: NonNullable<ReturnType<typeof getCompetenceById>> } => item !== null)
                  .sort((a, b) => {
                    // Сначала профессиональные, потом корпоративные
                    if (a.competence.type !== b.competence.type) {
                      if (a.competence.type === "профессиональные компетенции") return -1;
                      return 1;
                    }
                    // Затем по названию
                    return a.competence.name.localeCompare(b.competence.name);
                  });
                
                const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                
                if (allCompetences.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Target className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-semibold mb-2">Компетенции не найдены</p>
                      <p className="text-sm text-muted-foreground text-center">
                        Компетенции команды отсутствуют или не найдено совпадений по поисковому запросу
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="min-w-[250px] px-4 whitespace-normal">Компетенция</TableHead>
                          <TableHead className="min-w-[120px] px-4 whitespace-normal">Тип</TableHead>
                          <TableHead className="min-w-[400px] px-4 whitespace-normal">Сотрудники</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allCompetences.map(({ competenceId, competence }) => {
                          const isCorporate = competence.type === "корпоративные компетенции";
                          const badgeColor = isCorporate 
                            ? "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800"
                            : "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800";
                          
                          // Собираем сотрудников с оценками для этой компетенции
                          const membersWithAssessments = filteredAndSortedMembers
                            .map(({ member }) => {
                              // Получаем самооценку сотрудника
                              const selfAssessmentToUse = member.id === "member-5" && userProfile?.skills && userProfile.skills.length > 0
                                ? userProfile.skills.reduce((acc, skill) => {
                                    acc[skill.competenceId] = skill.selfAssessment;
                                    return acc;
                                  }, {} as Record<string, number>)
                                : memberSelfAssessments[member.id] || {};
                              
                              // Получаем оценку руководителя
                              const managerAssessment = memberSkills[member.id] || {};
                              
                              const selfLevel = competenceId in selfAssessmentToUse ? selfAssessmentToUse[competenceId] : null;
                              const managerLevel = competenceId in managerAssessment ? managerAssessment[competenceId] : null;
                              
                              const hasAssessment = selfLevel !== null || managerLevel !== null;
                              
                              if (!hasAssessment) return null;
                              
                              return {
                                member,
                                selfLevel,
                                managerLevel,
                              };
                            })
                            .filter((item): item is { member: TeamMember; selfLevel: number | null; managerLevel: number | null } => item !== null);
                          
                          return (
                            <TableRow key={competenceId}>
                              <TableCell className="px-4 whitespace-normal">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="font-medium">{competence.name}</div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md">
                                    <div className="space-y-2">
                                      <p className="font-semibold">{competence.name}</p>
                                      {competence.description && (
                                        <p className="text-sm">{competence.description}</p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="px-4 whitespace-normal">
                                <Badge variant="outline" className={`text-xs ${badgeColor}`}>
                                  {competence.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 whitespace-normal">
                                {membersWithAssessments.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {membersWithAssessments.map(({ member, selfLevel, managerLevel }) => (
                                      <Tooltip key={member.id}>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-2 p-2 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                                            <Avatar className="h-6 w-6 shrink-0">
                                              {member.avatar ? (
                                                <AvatarImage src={member.avatar} alt={getFullName(member)} />
                                              ) : null}
                                              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                                {getInitials(member)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-1 min-w-0">
                                              <span className="font-medium text-xs">{getFullName(member)}</span>
                                              {(selfLevel !== null || managerLevel !== null) && (
                                                <Badge variant="secondary" className="text-[10px] px-1 py-0 w-fit">
                                                  {selfLevel !== null && managerLevel !== null
                                                    ? `С: ${selfLevel} / Р: ${managerLevel}`
                                                    : selfLevel !== null
                                                    ? `С: ${selfLevel}`
                                                    : `Р: ${managerLevel}`}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <div className="space-y-2">
                                            <p className="font-semibold">{competence.name}</p>
                                            {competence.description && (
                                              <p className="text-sm">{competence.description}</p>
                                            )}
                                            <div className="space-y-2 pt-2 border-t">
                                              <p className="font-medium text-sm">{getFullName(member)}</p>
                                              <p className="text-xs text-muted-foreground">{member.position}</p>
                                              <div className="space-y-1 text-sm">
                                                {selfLevel !== null && (
                                                  <p>
                                                    <span className="font-medium">Самооценка:</span> {selfLevel} - {levelNames[selfLevel - 1]}
                                                  </p>
                                                )}
                                                {managerLevel !== null && (
                                                  <p>
                                                    <span className="font-medium">Оценка руководителя:</span> {managerLevel} - {levelNames[managerLevel - 1]}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Модальное окно для оценки сотрудника */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto overflow-x-hidden max-w-[95vw] sm:max-w-[95vw] md:max-w-[1600px] lg:max-w-[1600px] xl:max-w-[1600px] 2xl:max-w-[1600px] w-[95vw]"
        >
          <DialogHeader>
            <DialogTitle>Оценка компетенций сотрудника</DialogTitle>
            <DialogDescription>
              Оцените уровень владения компетенциями сотрудника {selectedMember ? getFullName(selectedMember) : ""} от 1 до 5
            </DialogDescription>
          </DialogHeader>
          {selectedMember ? (
            <div className="overflow-x-hidden w-full">
              <SkillAssessment
                userProfile={{
                  userId: selectedMember.id,
                  mainProfileId: selectedMember.mainProfileId,
                  additionalProfileIds: selectedMember.additionalProfileIds,
                  skills: Object.entries(memberSkills[selectedMember.id] || {}).map(([competenceId, level]) => ({
                    competenceId,
                    selfAssessment: level as SkillLevel,
                    lastUpdated: new Date(),
                  })),
                }}
                onSkillUpdate={(skills) => {
                  // Сохраняем оценки для выбранного сотрудника
                  const updatedSkills: Record<string, number> = {};
                  skills.forEach((skill) => {
                    updatedSkills[skill.competenceId] = skill.selfAssessment;
                  });
                  setMemberSkills((prev) => ({
                    ...prev,
                    [selectedMember.id]: {
                      ...prev[selectedMember.id],
                      ...updatedSkills,
                    },
                  }));
                  setIsAssessmentDialogOpen(false);
                }}
                onClose={() => setIsAssessmentDialogOpen(false)}
              />
            </div>
          ) : (
            <div className="py-6">
              <p className="text-muted-foreground text-center">
                Выберите сотрудника для оценки
              </p>
      </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно для информации о профиле */}
      <Dialog open={isProfileInfoDialogOpen} onOpenChange={setIsProfileInfoDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedProfileForInfo?.name}</DialogTitle>
            <DialogDescription>
              Подробная информация о профиле из справочника
            </DialogDescription>
          </DialogHeader>
          {selectedProfileForInfo && (
            <div className="overflow-x-hidden w-full">
              <ProfileTooltipContent profile={selectedProfileForInfo} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
