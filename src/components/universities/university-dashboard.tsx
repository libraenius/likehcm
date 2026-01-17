"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { 
  GraduationCap, 
  FileText, 
  Users, 
  Calendar, 
  Building2, 
  TrendingUp,
  MapPin,
  Handshake,
  Trophy,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";

// Типы для компонента
interface Contract {
  id: string;
  type: "cooperation" | "scholarship" | "internship" | "bankDepartment";
  hasContract: boolean;
  period?: { start: string; end: string };
}

interface Event {
  id: string;
  type: "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication";
  date: string;
  status: "planned" | "in_progress" | "completed";
}

interface Intern {
  id: string;
  status: "active" | "dismissed";
}

interface Practitioner {
  id: string;
  practiceStatus?: "not_meets" | "meets" | "exceeds";
}

interface CaseChampionshipParticipant {
  id: string;
  status: "registered" | "participated" | "winner" | "prize_winner";
}

interface CooperationLineRecord {
  id: string;
  line: "drp" | "bko" | "cntr";
  year: number;
}

interface BankDepartment {
  id: string;
  name: string;
}

interface CNTRProjectItem {
  id: string;
  fundingAmount?: number;
}

interface BKOData {
  salaryProject?: {
    students?: boolean;
    employees?: boolean;
  };
  transactionalProducts?: {
    ie?: boolean;
    te?: boolean;
    sbp?: boolean;
    adm?: boolean;
  };
  limit?: boolean;
  ukGpbFundsCk?: boolean;
}

interface University {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  cooperationStartYear?: number;
  cooperationLines?: CooperationLineRecord[];
  contracts?: Contract[];
  bankDepartments?: BankDepartment[];
  events?: Event[];
  allEmployees?: number;
  internList?: Intern[];
  practitionerList?: Practitioner[];
  caseChampionshipParticipants?: CaseChampionshipParticipant[];
  cntrProjects?: CNTRProjectItem[];
  bkoData?: BKOData;
}

interface UniversityDashboardProps {
  universities: University[];
}

export function UniversityDashboard({ universities }: UniversityDashboardProps) {
  // Расчет метрик
  const metrics = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Общее количество ВУЗов
    const totalUniversities = universities.length;
    
    // Договоры
    const allContracts = universities.flatMap(u => u.contracts || []);
    const activeContracts = allContracts.filter(c => {
      if (!c.period?.end) return c.hasContract;
      return new Date(c.period.end) > today;
    });
    const expiringContracts = allContracts.filter(c => {
      if (!c.period?.end) return false;
      const endDate = new Date(c.period.end);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
    });
    const expiredContracts = allContracts.filter(c => {
      if (!c.period?.end) return false;
      return new Date(c.period.end) < today;
    });
    
    // Стажеры и практиканты
    const allInterns = universities.flatMap(u => u.internList || []);
    const activeInterns = allInterns.filter(i => i.status === "active");
    const allPractitioners = universities.flatMap(u => u.practitionerList || []);
    
    // Оценка практикантов
    const practitionersByStatus = {
      exceeds: allPractitioners.filter(p => p.practiceStatus === "exceeds").length,
      meets: allPractitioners.filter(p => p.practiceStatus === "meets").length,
      notMeets: allPractitioners.filter(p => p.practiceStatus === "not_meets").length,
    };
    
    // Мероприятия за текущий год
    const allEvents = universities.flatMap(u => u.events || []);
    const currentYearEvents = allEvents.filter(e => {
      const eventYear = new Date(e.date).getFullYear();
      return eventYear === currentYear;
    });
    const eventsByType = {
      careerDays: currentYearEvents.filter(e => e.type === "careerDays").length,
      expertParticipation: currentYearEvents.filter(e => e.type === "expertParticipation").length,
      caseChampionships: currentYearEvents.filter(e => e.type === "caseChampionships").length,
      meeting: currentYearEvents.filter(e => e.type === "meeting").length,
      communication: currentYearEvents.filter(e => e.type === "communication").length,
    };
    const eventsByStatus = {
      planned: currentYearEvents.filter(e => e.status === "planned").length,
      inProgress: currentYearEvents.filter(e => e.status === "in_progress").length,
      completed: currentYearEvents.filter(e => e.status === "completed").length,
    };
    
    // Линии сотрудничества
    const linesCounts = { drp: 0, bko: 0, cntr: 0 };
    universities.forEach(u => {
      const lines = new Set(u.cooperationLines?.map(cl => cl.line) || []);
      if (lines.has("drp")) linesCounts.drp++;
      if (lines.has("bko")) linesCounts.bko++;
      if (lines.has("cntr")) linesCounts.cntr++;
    });
    
    // Кафедры банка
    const totalBankDepartments = universities.reduce((sum, u) => sum + (u.bankDepartments?.length || 0), 0);
    
    // ЦНТР
    const allProjects = universities.flatMap(u => u.cntrProjects || []);
    const totalFunding = allProjects.reduce((sum, p) => sum + (p.fundingAmount || 0), 0);
    
    // Кейс-чемпионаты
    const allParticipants = universities.flatMap(u => u.caseChampionshipParticipants || []);
    const caseResults = {
      winners: allParticipants.filter(p => p.status === "winner").length,
      prizeWinners: allParticipants.filter(p => p.status === "prize_winner").length,
      participated: allParticipants.filter(p => p.status === "participated").length,
    };
    
    // Топ ВУЗов по сотрудникам
    const topUniversitiesByEmployees = [...universities]
      .filter(u => u.allEmployees && u.allEmployees > 0)
      .sort((a, b) => (b.allEmployees || 0) - (a.allEmployees || 0))
      .slice(0, 5);
    
    // Распределение по городам
    const cityCounts: Record<string, number> = {};
    universities.forEach(u => {
      cityCounts[u.city] = (cityCounts[u.city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Динамика партнерств по годам
    const partnershipsByYear: Record<number, number> = {};
    universities.forEach(u => {
      if (u.cooperationStartYear) {
        partnershipsByYear[u.cooperationStartYear] = (partnershipsByYear[u.cooperationStartYear] || 0) + 1;
      }
    });
    const yearsData = Object.entries(partnershipsByYear)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
    
    // BKO охват
    const bkoStats = {
      salaryStudents: universities.filter(u => u.bkoData?.salaryProject?.students).length,
      salaryEmployees: universities.filter(u => u.bkoData?.salaryProject?.employees).length,
      ie: universities.filter(u => u.bkoData?.transactionalProducts?.ie).length,
      te: universities.filter(u => u.bkoData?.transactionalProducts?.te).length,
      sbp: universities.filter(u => u.bkoData?.transactionalProducts?.sbp).length,
      adm: universities.filter(u => u.bkoData?.transactionalProducts?.adm).length,
    };
    
    return {
      totalUniversities,
      activeContracts: activeContracts.length,
      expiringContracts: expiringContracts.length,
      expiredContracts: expiredContracts.length,
      totalInterns: allInterns.length,
      activeInterns: activeInterns.length,
      totalPractitioners: allPractitioners.length,
      practitionersByStatus,
      totalEvents: currentYearEvents.length,
      eventsByType,
      eventsByStatus,
      linesCounts,
      totalBankDepartments,
      totalProjects: allProjects.length,
      totalFunding,
      caseResults,
      topUniversitiesByEmployees,
      topCities,
      yearsData,
      bkoStats,
    };
  }, [universities]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} млн ₽`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} тыс ₽`;
    }
    return `${amount} ₽`;
  };

  const maxEmployees = Math.max(...metrics.topUniversitiesByEmployees.map(u => u.allEmployees || 0), 1);
  const maxEvents = Math.max(...Object.values(metrics.eventsByType), 1);
  const totalPractitionersWithStatus = metrics.practitionersByStatus.exceeds + metrics.practitionersByStatus.meets + metrics.practitionersByStatus.notMeets;

  // Данные для линий сотрудничества
  const lineData = useMemo(() => {
    const drpUniversities = universities.filter(u => 
      u.cooperationLines?.some(cl => cl.line === "drp")
    );
    const bkoUniversities = universities.filter(u => 
      u.cooperationLines?.some(cl => cl.line === "bko")
    );
    const cntrUniversities = universities.filter(u => 
      u.cooperationLines?.some(cl => cl.line === "cntr")
    );

    // ДРП метрики
    const drpInterns = drpUniversities.flatMap(u => u.internList || []);
    const drpPractitioners = drpUniversities.flatMap(u => u.practitionerList || []);
    const drpEvents = drpUniversities.flatMap(u => u.events || []);
    const drpEmployees = drpUniversities.reduce((sum, u) => sum + (u.allEmployees || 0), 0);
    
    // БКО метрики
    const bkoStats = {
      total: bkoUniversities.length,
      withSalaryStudents: bkoUniversities.filter(u => u.bkoData?.salaryProject?.students).length,
      withSalaryEmployees: bkoUniversities.filter(u => u.bkoData?.salaryProject?.employees).length,
      withIE: bkoUniversities.filter(u => u.bkoData?.transactionalProducts?.ie).length,
      withTE: bkoUniversities.filter(u => u.bkoData?.transactionalProducts?.te).length,
      withSBP: bkoUniversities.filter(u => u.bkoData?.transactionalProducts?.sbp).length,
      withADM: bkoUniversities.filter(u => u.bkoData?.transactionalProducts?.adm).length,
      withLimit: bkoUniversities.filter(u => u.bkoData?.limit).length,
    };
    
    // ЦНТР метрики
    const cntrProjects = cntrUniversities.flatMap(u => u.cntrProjects || []);
    const cntrInfrastructure = cntrUniversities.flatMap(u => u.cntrInfrastructure || []);
    const cntrFunding = cntrProjects.reduce((sum, p) => sum + (p.fundingAmount || 0), 0);
    const cntrAgreements = cntrUniversities.filter(u => u.cntrAgreementItems && u.cntrAgreementItems.length > 0).length;

    return {
      drp: {
        universities: drpUniversities.length,
        interns: drpInterns.length,
        activeInterns: drpInterns.filter(i => i.status === "active").length,
        practitioners: drpPractitioners.length,
        events: drpEvents.length,
        employees: drpEmployees,
        topUniversities: drpUniversities
          .filter(u => u.allEmployees && u.allEmployees > 0)
          .sort((a, b) => (b.allEmployees || 0) - (a.allEmployees || 0))
          .slice(0, 5),
        practitionersByStatus: {
          exceeds: drpPractitioners.filter(p => p.practiceStatus === "exceeds").length,
          meets: drpPractitioners.filter(p => p.practiceStatus === "meets").length,
          notMeets: drpPractitioners.filter(p => p.practiceStatus === "not_meets").length,
        },
        eventsByType: {
          careerDays: drpEvents.filter(e => e.type === "careerDays").length,
          expertParticipation: drpEvents.filter(e => e.type === "expertParticipation").length,
          caseChampionships: drpEvents.filter(e => e.type === "caseChampionships").length,
        },
      },
      bko: bkoStats,
      cntr: {
        universities: cntrUniversities.length,
        projects: cntrProjects.length,
        infrastructure: cntrInfrastructure.length,
        funding: cntrFunding,
        agreements: cntrAgreements,
        projectsByFormat: cntrProjects.reduce((acc, p) => {
          const format = p.supportFormat || "other";
          acc[format] = (acc[format] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        topProjects: cntrProjects
          .filter(p => p.fundingAmount && p.fundingAmount > 0)
          .sort((a, b) => (b.fundingAmount || 0) - (a.fundingAmount || 0))
          .slice(0, 5),
      },
    };
  }, [universities]);

  const [activeLineTab, setActiveLineTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Вкладки по линиям сотрудничества */}
      <Tabs value={activeLineTab} onValueChange={setActiveLineTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Общий</TabsTrigger>
          <TabsTrigger value="drp">ДРП</TabsTrigger>
          <TabsTrigger value="bko">БКО</TabsTrigger>
          <TabsTrigger value="cntr">ЦНТР</TabsTrigger>
        </TabsList>

        {/* Общий дашборд */}
        <TabsContent value="overview" className="space-y-6 mt-6">
      {/* Основные метрики - первый ряд */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ВУЗов-партнеров</p>
                <p className="text-3xl font-bold">{metrics.totalUniversities}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активных договоров</p>
                <p className="text-3xl font-bold">{metrics.activeContracts}</p>
                {metrics.expiringContracts > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    {metrics.expiringContracts} истекают в течение 90 дней
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Стажеров (всего)</p>
                <p className="text-3xl font-bold">{metrics.totalInterns}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Активных: {metrics.activeInterns}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Практикантов</p>
                <p className="text-3xl font-bold">{metrics.totalPractitioners}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Второй ряд метрик */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Мероприятий за год</p>
                <p className="text-3xl font-bold">{metrics.totalEvents}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                    {metrics.eventsByStatus.completed} завершено
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                    {metrics.eventsByStatus.planned} план
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Кафедр банка</p>
                <p className="text-3xl font-bold">{metrics.totalBankDepartments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Проектов ЦНТР</p>
                <p className="text-3xl font-bold">{metrics.totalProjects}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Финансирование ЦНТР</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.totalFunding)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Handshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики и детальная информация */}
      <div className="grid grid-cols-2 gap-6">
        {/* Распределение по линиям сотрудничества */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Распределение по линиям сотрудничества</CardTitle>
            <CardDescription>Количество ВУЗов по каждой линии</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: "ДРП", value: metrics.linesCounts.drp, color: "#8b9dc3" },
                    { name: "БКО", value: metrics.linesCounts.bko, color: "#86c5a8" },
                    { name: "ЦНТР", value: metrics.linesCounts.cntr, color: "#b5a7d6" },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { color: "#8b9dc3" },
                    { color: "#86c5a8" },
                    { color: "#b5a7d6" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Мероприятия по типам */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Мероприятия по типам</CardTitle>
            <CardDescription>За текущий год</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { name: "Дни карьеры", value: metrics.eventsByType.careerDays },
                { name: "Экспертное участие", value: metrics.eventsByType.expertParticipation },
                { name: "Кейс-чемпионаты", value: metrics.eventsByType.caseChampionships },
                { name: "Встречи", value: metrics.eventsByType.meeting },
                { name: "Коммуникации", value: metrics.eventsByType.communication },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b9dc3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Топ ВУЗов по сотрудникам */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Топ-5 ВУЗов по сотрудникам</CardTitle>
            <CardDescription>Количество сотрудников из ВУЗа</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topUniversitiesByEmployees.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart 
                  data={metrics.topUniversitiesByEmployees.map(uni => ({
                    name: uni.shortName || uni.name,
                    employees: uni.allEmployees || 0,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="employees" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Нет данных о сотрудниках</p>
            )}
          </CardContent>
        </Card>

        {/* Статусы договоров */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Статусы договоров</CardTitle>
            <CardDescription>Обзор состояния договорной базы</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Действующие", value: metrics.activeContracts, color: "#86c5a8" },
                    { name: "Истекают", value: metrics.expiringContracts, color: "#d4a574" },
                    { name: "Просрочены", value: metrics.expiredContracts, color: "#c97f7f" },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#86c5a8" />
                  <Cell fill="#d4a574" />
                  <Cell fill="#c97f7f" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Оценка практикантов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Оценка практикантов</CardTitle>
            <CardDescription>Распределение по статусу соответствия</CardDescription>
          </CardHeader>
          <CardContent>
            {totalPractitionersWithStatus > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Превосходит", value: metrics.practitionersByStatus.exceeds, color: "#86c5a8" },
                      { name: "Соответствует", value: metrics.practitionersByStatus.meets, color: "#8b9dc3" },
                      { name: "Не соответствует", value: metrics.practitionersByStatus.notMeets, color: "#c97f7f" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#86c5a8" />
                    <Cell fill="#8b9dc3" />
                    <Cell fill="#c97f7f" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Нет данных об оценках</p>
            )}
          </CardContent>
        </Card>

        {/* Результаты кейс-чемпионатов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Результаты кейс-чемпионатов</CardTitle>
            <CardDescription>Статистика участников</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { name: "Победители", value: metrics.caseResults.winners },
                { name: "Призёры", value: metrics.caseResults.prizeWinners },
                { name: "Участники", value: metrics.caseResults.participated },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill={(entry, index) => {
                    const colors = ["#d4c88f", "#d4a574", "#8b9dc3"];
                    return colors[index % colors.length];
                  }}
                >
                  {[
                    { fill: "#d4c88f" },
                    { fill: "#d4a574" },
                    { fill: "#8b9dc3" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* География и BKO */}
      <div className="grid grid-cols-2 gap-6">
        {/* География партнерств */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">География партнерств</CardTitle>
            <CardDescription>Топ-5 городов по количеству ВУЗов</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topCities.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={metrics.topCities.map(([city, count]) => ({ city, count }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="city" 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Нет данных о городах</p>
            )}
          </CardContent>
        </Card>

        {/* Охват BKO продуктами */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Охват BKO продуктами</CardTitle>
            <CardDescription>Количество ВУЗов с подключенными продуктами</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { name: "ЗП студенты", value: metrics.bkoStats.salaryStudents },
                { name: "ЗП сотрудники", value: metrics.bkoStats.salaryEmployees },
                { name: "ИЭ", value: metrics.bkoStats.ie },
                { name: "ТЭ", value: metrics.bkoStats.te },
                { name: "СБП", value: metrics.bkoStats.sbp },
                { name: "АДМ", value: metrics.bkoStats.adm },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#86c5a8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Динамика партнерств */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Динамика партнерств по годам</CardTitle>
          <CardDescription>Количество новых партнерств по году начала сотрудничества</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.yearsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.yearsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b9dc3" 
                  strokeWidth={2}
                  dot={{ fill: "#8b9dc3", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Новых партнерств"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full flex items-center justify-center h-[300px]">
              <p className="text-sm text-muted-foreground">Нет данных о годах начала сотрудничества</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Вкладка ДРП */}
        <TabsContent value="drp" className="space-y-6 mt-6">
          {/* Метрики ДРП */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ВУЗов с ДРП</p>
                    <p className="text-3xl font-bold">{lineData.drp.universities}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Стажеров</p>
                    <p className="text-3xl font-bold">{lineData.drp.interns}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Активных: {lineData.drp.activeInterns}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Практикантов</p>
                    <p className="text-3xl font-bold">{lineData.drp.practitioners}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Мероприятий</p>
                    <p className="text-3xl font-bold">{lineData.drp.events}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Графики ДРП */}
          <div className="grid grid-cols-2 gap-6">
            {/* Топ ВУЗов по сотрудникам */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Топ-5 ВУЗов по сотрудникам (ДРП)</CardTitle>
                <CardDescription>Количество сотрудников из ВУЗов с линией ДРП</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.drp.topUniversities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={lineData.drp.topUniversities.map(uni => ({
                        name: uni.shortName || uni.name,
                        employees: uni.allEmployees || 0,
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="employees" fill="#8b9dc3" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
                )}
              </CardContent>
            </Card>

            {/* Оценка практикантов ДРП */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Оценка практикантов (ДРП)</CardTitle>
                <CardDescription>Распределение по статусу соответствия</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.drp.practitioners > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Превосходит", value: lineData.drp.practitionersByStatus.exceeds, color: "#86c5a8" },
                          { name: "Соответствует", value: lineData.drp.practitionersByStatus.meets, color: "#8b9dc3" },
                          { name: "Не соответствует", value: lineData.drp.practitionersByStatus.notMeets, color: "#c97f7f" },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#86c5a8" />
                        <Cell fill="#8b9dc3" />
                        <Cell fill="#c97f7f" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
                )}
              </CardContent>
            </Card>

            {/* Мероприятия по типам (ДРП) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Мероприятия по типам (ДРП)</CardTitle>
                <CardDescription>Распределение мероприятий по типам</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { name: "Дни карьеры", value: lineData.drp.eventsByType.careerDays },
                    { name: "Экспертное участие", value: lineData.drp.eventsByType.expertParticipation },
                    { name: "Кейс-чемпионаты", value: lineData.drp.eventsByType.caseChampionships },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      className="text-xs"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b9dc3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Статистика по стажерам и практикантам */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Кадровые показатели (ДРП)</CardTitle>
                <CardDescription>Стажеры и практиканты</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm">Всего стажеров</span>
                    <span className="font-bold text-blue-600">{lineData.drp.interns}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm">Активных стажеров</span>
                    <span className="font-bold text-green-600">{lineData.drp.activeInterns}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm">Всего практикантов</span>
                    <span className="font-bold text-purple-600">{lineData.drp.practitioners}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <span className="text-sm">Сотрудников всего</span>
                    <span className="font-bold text-gray-600">{lineData.drp.employees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка БКО */}
        <TabsContent value="bko" className="space-y-6 mt-6">
          {/* Метрики БКО */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ВУЗов с БКО</p>
                    <p className="text-3xl font-bold">{lineData.bko.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ЗП студенты</p>
                    <p className="text-3xl font-bold">{lineData.bko.withSalaryStudents}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lineData.bko.total > 0 ? Math.round((lineData.bko.withSalaryStudents / lineData.bko.total) * 100) : 0}% охват
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ЗП сотрудники</p>
                    <p className="text-3xl font-bold">{lineData.bko.withSalaryEmployees}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lineData.bko.total > 0 ? Math.round((lineData.bko.withSalaryEmployees / lineData.bko.total) * 100) : 0}% охват
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Транзакционные</p>
                    <p className="text-3xl font-bold">
                      {lineData.bko.withIE + lineData.bko.withTE + lineData.bko.withSBP + lineData.bko.withADM}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">ВУЗов</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Графики БКО */}
          <div className="grid grid-cols-2 gap-6">
            {/* Охват продуктами */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Охват продуктами БКО</CardTitle>
                <CardDescription>Количество ВУЗов с подключенными продуктами</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { name: "ЗП студенты", value: lineData.bko.withSalaryStudents },
                    { name: "ЗП сотрудники", value: lineData.bko.withSalaryEmployees },
                    { name: "ИЭ", value: lineData.bko.withIE },
                    { name: "ТЭ", value: lineData.bko.withTE },
                    { name: "СБП", value: lineData.bko.withSBP },
                    { name: "АДМ", value: lineData.bko.withADM },
                    { name: "Лимит", value: lineData.bko.withLimit },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      className="text-xs"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#86c5a8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Распределение по типам продуктов */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Распределение продуктов БКО</CardTitle>
                <CardDescription>Процент охвата по категориям</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.bko.total > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Зарплатные проекты", value: lineData.bko.withSalaryStudents + lineData.bko.withSalaryEmployees, color: "#86c5a8" },
                          { name: "Транзакционные", value: lineData.bko.withIE + lineData.bko.withTE + lineData.bko.withSBP + lineData.bko.withADM, color: "#8b9dc3" },
                          { name: "Другие", value: lineData.bko.total - (lineData.bko.withSalaryStudents + lineData.bko.withSalaryEmployees + lineData.bko.withIE + lineData.bko.withTE + lineData.bko.withSBP + lineData.bko.withADM), color: "#b5a7d6" },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#86c5a8" />
                        <Cell fill="#8b9dc3" />
                        <Cell fill="#b5a7d6" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка ЦНТР */}
        <TabsContent value="cntr" className="space-y-6 mt-6">
          {/* Метрики ЦНТР */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ВУЗов с ЦНТР</p>
                    <p className="text-3xl font-bold">{lineData.cntr.universities}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Проектов</p>
                    <p className="text-3xl font-bold">{lineData.cntr.projects}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Инфраструктура</p>
                    <p className="text-3xl font-bold">{lineData.cntr.infrastructure}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Финансирование</p>
                    <p className="text-3xl font-bold">{formatCurrency(lineData.cntr.funding)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Handshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Графики ЦНТР */}
          <div className="grid grid-cols-2 gap-6">
            {/* Топ проектов по финансированию */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Топ-5 проектов по финансированию</CardTitle>
                <CardDescription>Проекты с наибольшим объемом финансирования</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.cntr.topProjects.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={lineData.cntr.topProjects.map(p => ({
                        name: (p.projectName || "Проект").substring(0, 20),
                        funding: p.fundingAmount || 0,
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="funding" fill="#b5a7d6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных о проектах с финансированием</p>
                )}
              </CardContent>
            </Card>

            {/* Проекты по формату поддержки */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Проекты по формату поддержки</CardTitle>
                <CardDescription>Распределение проектов по форматам</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(lineData.cntr.projectsByFormat).length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={Object.entries(lineData.cntr.projectsByFormat).map(([format, count]) => {
                          const formatNames: Record<string, string> = {
                            "grant-cofinancing": "Грант/софинансирование",
                            "ordered-rd-center-lift": "Заказной НИОКР",
                            "targeted-charity": "Целевая благотв.",
                            "other": "Другое",
                          };
                          return {
                            name: formatNames[format] || format,
                            value: count,
                          };
                        })}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(lineData.cntr.projectsByFormat).map((_, index) => {
                          const colors = ["#b5a7d6", "#86c5a8", "#8b9dc3", "#d4c88f"];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных о форматах поддержки</p>
                )}
              </CardContent>
            </Card>

            {/* Общая статистика ЦНТР */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистика ЦНТР</CardTitle>
                <CardDescription>Общие показатели по линии ЦНТР</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <span className="text-sm">Всего проектов</span>
                    <span className="font-bold text-teal-600">{lineData.cntr.projects}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <span className="text-sm">Элементов инфраструктуры</span>
                    <span className="font-bold text-indigo-600">{lineData.cntr.infrastructure}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="text-sm">Всего финансирования</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(lineData.cntr.funding)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm">Соглашений</span>
                    <span className="font-bold text-purple-600">{lineData.cntr.agreements}</span>
                  </div>
                  {lineData.cntr.projects > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <span className="text-sm">Средний размер проекта</span>
                      <span className="font-bold text-gray-600">
                        {formatCurrency(Math.round(lineData.cntr.funding / lineData.cntr.projects))}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Распределение финансирования */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Распределение финансирования</CardTitle>
                <CardDescription>Объем финансирования по проектам</CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.cntr.topProjects.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={lineData.cntr.topProjects.map(p => ({
                      name: (p.projectName || "Проект").substring(0, 15),
                      funding: p.fundingAmount || 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        className="text-xs"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}М`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}К`;
                          return value.toString();
                        }}
                      />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="funding" fill="#b5a7d6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет данных о финансировании</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
