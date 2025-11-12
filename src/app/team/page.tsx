"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkillAssessment } from "@/components/skill-assessment";
import { getProfileById, getUserProfile, getCompetenceById, getCareerTrackByProfileId } from "@/lib/data";
import { calculateProfileMatch, calculateCareerTrackProgress } from "@/lib/calculations";
import { Users, Mail, User, TrendingUp, BookOpen, Info, Briefcase, ChevronDown, ChevronRight, Building2, Search, X, Edit, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMember, UserProfile, SkillLevel } from "@/types";

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
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
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
          skillsForMatch,
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

    // Сортировка: сначала с таким же профилем, затем по соответствию
    return filtered.sort((a, b) => {
      if (a.isSameProfile && !b.isSameProfile) return -1;
      if (!a.isSameProfile && b.isSameProfile) return 1;
      return b.mainProfileMatch - a.mainProfileMatch;
    });
  }, [membersWithMatch, searchQuery]);

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
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-20 w-20">
                          {selectedMember.avatar && (
                            <AvatarImage src={selectedMember.avatar} alt={getFullName(selectedMember)} />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {getInitials(selectedMember)}
                          </AvatarFallback>
                  </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl">{getFullName(selectedMember)}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {selectedMember.position}
                          </CardDescription>
                          <CardDescription className="text-sm flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
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
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="default" className="text-sm">
                                  {mainProfile.name}
                                </Badge>
                              </div>
                              {mainProfile.description && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {mainProfile.description}
                                </p>
                              )}
                              
                              {/* Уровни самооценки и оценки руководителя */}
                              <div className="mt-3 space-y-2">
                                {/* Уровень самооценки */}
                                {selfLevel > 0 && (
                                  <div className="flex items-center justify-between p-2 bg-background rounded-md border">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">Самооценка:</span>
                                    </div>
                                    <Badge variant="secondary" className="text-sm">
                                      {selfLevel} - {levelNames[selfLevel - 1]}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Уровень оценки руководителя */}
                                {managerLevel > 0 && (
                                  <div className="flex items-center justify-between p-2 bg-background rounded-md border">
                                    <div className="flex items-center gap-2">
                                      <Edit className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">Оценка руководителя:</span>
                                    </div>
                                    <Badge variant="secondary" className="text-sm">
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
    </div>
  );
}
