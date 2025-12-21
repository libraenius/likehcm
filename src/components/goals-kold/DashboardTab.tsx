"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Target, TrendingUp, Users, Award, Activity } from "lucide-react";
import type { Stream, KPI } from "@/types/goals-kold";
import { useMemo } from "react";

interface DashboardTabProps {
  streams: Stream[];
  annualKPIs: Record<string, Record<string, KPI[]>>;
  quarterlyKPIs: Record<string, Record<string, KPI[]>>;
  itLeaderKPIs: Record<string, Record<string, KPI[]>>;
}

export function DashboardTab({
  streams,
  annualKPIs,
  quarterlyKPIs,
  itLeaderKPIs,
}: DashboardTabProps) {
  // Статистика по стримам
  const streamStats = useMemo(() => {
    const totalStreams = streams.length;
    const totalTeams = streams.reduce((sum, s) => sum + s.teams.length, 0);
    const streamTypes = streams.reduce((acc, s) => {
      const type = s.type || "не указан";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStreams,
      totalTeams,
      streamTypes,
    };
  }, [streams]);

  // Данные для графика выполнения KPI по стримам
  const streamKPIData = useMemo(() => {
    return streams.map((stream) => {
      const annual = annualKPIs[stream.id]?.["2025"] || [];
      const avgEvaluation = annual.length > 0
        ? annual.reduce((sum, kpi) => sum + kpi.evaluationPercent, 0) / annual.length
        : 0;
      
      return {
        name: stream.name.length > 15 ? stream.name.substring(0, 15) + "..." : stream.name,
        fullName: stream.name,
        evaluation: Math.round(avgEvaluation * 10) / 10,
        kpiCount: annual.length,
      };
    }).filter(s => s.kpiCount > 0);
  }, [streams, annualKPIs]);

  // Данные для графика выполнения KPI по кварталам
  const quarterlyKPIData = useMemo(() => {
    const quarters = ["q1-2025", "q2-2025", "q3-2025", "q4-2025"];
    return quarters.map((quarter) => {
      let totalEvaluation = 0;
      let count = 0;
      
      Object.values(quarterlyKPIs).forEach((streamQuarters) => {
        const kpis = streamQuarters[quarter] || [];
        if (kpis.length > 0) {
          totalEvaluation += kpis.reduce((sum, kpi) => sum + kpi.evaluationPercent, 0) / kpis.length;
          count++;
        }
      });

      return {
        quarter: quarter.replace("q", "Q").replace("-2025", ""),
        avgEvaluation: count > 0 ? Math.round((totalEvaluation / count) * 10) / 10 : 0,
      };
    });
  }, [quarterlyKPIs]);

  // Распределение типов стримов
  const streamTypeData = useMemo(() => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];
    return Object.entries(streamStats.streamTypes).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [streamStats.streamTypes]);

  // Динамика выполнения KPI по месяцам (моковые данные на основе кварталов)
  const monthlyTrendData = useMemo(() => {
    return [
      { month: "Янв", план: 85, факт: 78 },
      { month: "Фев", план: 85, факт: 82 },
      { month: "Мар", план: 90, факт: 88 },
      { month: "Апр", план: 90, факт: 87 },
      { month: "Май", план: 95, факт: 91 },
      { month: "Июн", план: 95, факт: 94 },
    ];
  }, []);

  // Статистика по КПЭ
  const kpiStats = useMemo(() => {
    let totalAnnual = 0;
    let totalQuarterly = 0;
    let totalITLeader = 0;
    let avgAnnualEvaluation = 0;
    let avgQuarterlyEvaluation = 0;

    Object.values(annualKPIs).forEach((years) => {
      Object.values(years).forEach((kpis) => {
        totalAnnual += kpis.length;
        if (kpis.length > 0) {
          avgAnnualEvaluation += kpis.reduce((sum, kpi) => sum + kpi.evaluationPercent, 0) / kpis.length;
        }
      });
    });

    Object.values(quarterlyKPIs).forEach((quarters) => {
      Object.values(quarters).forEach((kpis) => {
        totalQuarterly += kpis.length;
        if (kpis.length > 0) {
          avgQuarterlyEvaluation += kpis.reduce((sum, kpi) => sum + kpi.evaluationPercent, 0) / kpis.length;
        }
      });
    });

    Object.values(itLeaderKPIs).forEach((quarters) => {
      Object.values(quarters).forEach((kpis) => {
        totalITLeader += kpis.length;
      });
    });

    return {
      totalAnnual,
      totalQuarterly,
      totalITLeader,
      avgAnnualEvaluation: totalAnnual > 0 ? Math.round((avgAnnualEvaluation / totalAnnual) * 10) / 10 : 0,
      avgQuarterlyEvaluation: totalQuarterly > 0 ? Math.round((avgQuarterlyEvaluation / totalQuarterly) * 10) / 10 : 0,
    };
  }, [annualKPIs, quarterlyKPIs, itLeaderKPIs]);

  const statsCards = [
    {
      title: "Всего стримов",
      value: streamStats.totalStreams.toString(),
      icon: Target,
      description: "Активных стримов в системе",
    },
    {
      title: "Всего команд",
      value: streamStats.totalTeams.toString(),
      icon: Users,
      description: "Команд в стримах",
    },
    {
      title: "Годовых KPI",
      value: kpiStats.totalAnnual.toString(),
      icon: Award,
      description: `Средняя оценка: ${kpiStats.avgAnnualEvaluation}%`,
    },
    {
      title: "Квартальных KPI",
      value: kpiStats.totalQuarterly.toString(),
      icon: Activity,
      description: `Средняя оценка: ${kpiStats.avgQuarterlyEvaluation}%`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Статистические карточки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* График выполнения KPI по стримам */}
      <Card>
        <CardHeader>
          <CardTitle>Выполнение KPI по стримам</CardTitle>
          <CardDescription>Средняя оценка выполнения годовых KPI по каждому стриму</CardDescription>
        </CardHeader>
        <CardContent>
          {streamKPIData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={streamKPIData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 120]} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Оценка"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="evaluation" fill="#8884d8" name="Оценка выполнения, %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Распределение типов стримов */}
        <Card>
          <CardHeader>
            <CardTitle>Распределение типов стримов</CardTitle>
            <CardDescription>Количество стримов по типам</CardDescription>
          </CardHeader>
          <CardContent>
            {streamTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={streamTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {streamTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        {/* Выполнение KPI по кварталам */}
        <Card>
          <CardHeader>
            <CardTitle>Выполнение KPI по кварталам</CardTitle>
            <CardDescription>Средняя оценка выполнения квартальных KPI</CardDescription>
          </CardHeader>
          <CardContent>
            {quarterlyKPIData.some(d => d.avgEvaluation > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={quarterlyKPIData}>
                  <defs>
                    <linearGradient id="colorEvaluation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 120]} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Средняя оценка"]} />
                  <Area
                    type="monotone"
                    dataKey="avgEvaluation"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorEvaluation)"
                    name="Средняя оценка, %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Динамика выполнения KPI */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика выполнения KPI</CardTitle>
          <CardDescription>Сравнение плановых и фактических показателей по месяцам</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="план"
                stroke="#8884d8"
                strokeWidth={2}
                name="План, %"
              />
              <Line
                type="monotone"
                dataKey="факт"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Факт, %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

