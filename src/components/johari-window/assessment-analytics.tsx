"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Users,
  Target,
  Award,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MultiRoleAssessment, SkillLevel } from "@/types";
import { aggregateAssessments, calculateOthersAverageAssessment } from "@/lib/johari-window";
import { getCompetenceById } from "@/lib/data";

interface AssessmentAnalyticsProps {
  multiRoleAssessments: MultiRoleAssessment[];
}

interface CompetenceComparison {
  competenceId: string;
  competenceName: string;
  competenceType: string;
  selfAssessment?: SkillLevel;
  managerAssessment?: SkillLevel;
  avgPeerAssessment?: number;
  avgSubordinateAssessment?: number;
  othersAverage?: number;
  gap: number;
  category: "strength" | "blind_spot" | "overestimate" | "development";
}

export function AssessmentAnalytics({ multiRoleAssessments }: AssessmentAnalyticsProps) {
  // Подготовка данных для сравнения
  const comparisons = useMemo(() => {
    return multiRoleAssessments
      .map(assessment => {
        const aggregated = aggregateAssessments(assessment);
        const othersAverage = calculateOthersAverageAssessment(aggregated);
        const competence = getCompetenceById(assessment.competenceId);

        if (!competence) return null;

        const selfAssessment = aggregated.selfAssessment ?? 0;
        const othersAvg = othersAverage ?? 0;
        const gap = selfAssessment - othersAvg;

        let category: CompetenceComparison["category"];
        if (selfAssessment >= 3.5 && othersAvg >= 3.5) {
          category = "strength";
        } else if (selfAssessment < 3.5 && othersAvg >= 3.5) {
          category = "blind_spot";
        } else if (selfAssessment >= 3.5 && othersAvg < 3.5) {
          category = "overestimate";
        } else {
          category = "development";
        }

        return {
          competenceId: assessment.competenceId,
          competenceName: competence.name,
          competenceType: competence.type,
          selfAssessment: aggregated.selfAssessment,
          managerAssessment: aggregated.managerAssessment,
          avgPeerAssessment: aggregated.avgPeerAssessment,
          avgSubordinateAssessment: aggregated.avgSubordinateAssessment,
          othersAverage,
          gap,
          category,
        } as CompetenceComparison;
      })
      .filter((c): c is CompetenceComparison => c !== null);
  }, [multiRoleAssessments]);

  // Группировка по категориям
  const grouped = useMemo(() => {
    return {
      strength: comparisons.filter(c => c.category === "strength"),
      blind_spot: comparisons.filter(c => c.category === "blind_spot"),
      overestimate: comparisons.filter(c => c.category === "overestimate"),
      development: comparisons.filter(c => c.category === "development"),
    };
  }, [comparisons]);

  // Топ разрывов
  const topGaps = useMemo(() => {
    return [...comparisons]
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 10);
  }, [comparisons]);

  // Статистика
  const stats = useMemo(() => {
    const totalAssessments = comparisons.length;
    const avgSelfAssessment = comparisons.reduce((sum, c) => sum + (c.selfAssessment ?? 0), 0) / totalAssessments;
    const avgOthersAssessment = comparisons.reduce((sum, c) => sum + (c.othersAverage ?? 0), 0) / totalAssessments;
    const avgGap = comparisons.reduce((sum, c) => sum + c.gap, 0) / totalAssessments;

    return {
      totalAssessments,
      avgSelfAssessment: avgSelfAssessment.toFixed(2),
      avgOthersAssessment: avgOthersAssessment.toFixed(2),
      avgGap: avgGap.toFixed(2),
      strengthCount: grouped.strength.length,
      blindSpotCount: grouped.blind_spot.length,
      overestimateCount: grouped.overestimate.length,
      developmentCount: grouped.development.length,
    };
  }, [comparisons, grouped]);

  if (comparisons.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Недостаточно данных для аналитики
          </p>
        </CardContent>
      </Card>
    );
  }

  const categoryConfig = {
    strength: {
      title: "Сильные стороны",
      icon: Award,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-50 dark:bg-green-950",
      description: "Высокие оценки от вас и других",
    },
    blind_spot: {
      title: "Слепые зоны",
      icon: Eye,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      description: "Другие оценивают выше, чем вы",
    },
    overestimate: {
      title: "Зоны переоценки",
      icon: AlertTriangle,
      color: "text-amber-700 dark:text-amber-300",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      description: "Вы оцениваете выше, чем другие",
    },
    development: {
      title: "Зоны развития",
      icon: Target,
      color: "text-slate-700 dark:text-slate-300",
      bgColor: "bg-slate-50 dark:bg-slate-950",
      description: "Низкие оценки от всех",
    },
  };

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Всего оценок</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.totalAssessments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Средняя самооценка</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.avgSelfAssessment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Средняя оценка других</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.avgOthersAssessment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Средний разрыв</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={cn(
              "text-3xl font-bold",
              parseFloat(stats.avgGap) > 0 ? "text-amber-600" : "text-blue-600"
            )}>
              {stats.avgGap}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="categories">По категориям</TabsTrigger>
          <TabsTrigger value="gaps">Топ разрывов</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Распределение по категориям */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение компетенций</CardTitle>
              <CardDescription>
                Категоризация на основе окна Джохари
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const count = stats[`${key}Count` as keyof typeof stats] as number;
                  const percentage = (count / stats.totalAssessments) * 100;
                  const Icon = config.icon;

                  return (
                    <div 
                      key={key}
                      className={cn("p-4 rounded-lg border-2", config.bgColor)}
                    >
                      <Icon className={cn("h-5 w-5 mb-2", config.color)} />
                      <p className="text-2xl font-bold mb-1">{count}</p>
                      <p className="text-xs text-muted-foreground mb-2">{config.title}</p>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Таблица всех компетенций */}
          <Card>
            <CardHeader>
              <CardTitle>Все компетенции</CardTitle>
              <CardDescription>
                Сравнение самооценки с оценками других
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Компетенция</TableHead>
                      <TableHead className="text-center">Самооценка</TableHead>
                      <TableHead className="text-center">Руководитель</TableHead>
                      <TableHead className="text-center">Коллеги</TableHead>
                      <TableHead className="text-center">Подчиненные</TableHead>
                      <TableHead className="text-center">Средняя других</TableHead>
                      <TableHead className="text-center">Разрыв</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisons.map(comp => {
                      const gapIcon = comp.gap > 0.5 ? TrendingUp : comp.gap < -0.5 ? TrendingDown : Minus;
                      const gapColor = comp.gap > 0.5 
                        ? "text-amber-600" 
                        : comp.gap < -0.5 
                        ? "text-blue-600" 
                        : "text-slate-600";

                      return (
                        <TableRow key={comp.competenceId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{comp.competenceName}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {comp.competenceType}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {comp.selfAssessment ? (
                              <Badge variant="outline">{comp.selfAssessment}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {comp.managerAssessment ? (
                              <Badge variant="outline">{comp.managerAssessment}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {comp.avgPeerAssessment ? (
                              <Badge variant="outline">{comp.avgPeerAssessment.toFixed(1)}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {comp.avgSubordinateAssessment ? (
                              <Badge variant="outline">{comp.avgSubordinateAssessment.toFixed(1)}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {comp.othersAverage ? (
                              <Badge variant="outline">{comp.othersAverage.toFixed(1)}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {Math.abs(comp.gap) >= 0.5 ? (
                              <div className={cn("flex items-center justify-center gap-1", gapColor)}>
                                {(() => {
                                  const Icon = gapIcon;
                                  return <Icon className="h-4 w-4" />;
                                })()}
                                <span className="font-semibold">{Math.abs(comp.gap).toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* По категориям */}
        <TabsContent value="categories" className="mt-6 space-y-6">
          {Object.entries(grouped).map(([key, items]) => {
            if (items.length === 0) return null;

            const config = categoryConfig[key as keyof typeof categoryConfig];
            const Icon = config.icon;

            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", config.color)} />
                    {config.title}
                  </CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map(comp => (
                      <div 
                        key={comp.competenceId}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-1">{comp.competenceName}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Я: <strong>{comp.selfAssessment ?? "-"}</strong></span>
                              {comp.managerAssessment && (
                                <span>Руководитель: <strong>{comp.managerAssessment}</strong></span>
                              )}
                              {comp.avgPeerAssessment && (
                                <span>Коллеги: <strong>{comp.avgPeerAssessment.toFixed(1)}</strong></span>
                              )}
                              {comp.othersAverage && (
                                <span>Другие: <strong>{comp.othersAverage.toFixed(1)}</strong></span>
                              )}
                            </div>
                          </div>
                          {Math.abs(comp.gap) >= 0.5 && (
                            <Badge 
                              variant="outline"
                              className={cn(
                                comp.gap > 0 ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-300"
                              )}
                            >
                              {comp.gap > 0 ? "+" : ""}{comp.gap.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Топ разрывов */}
        <TabsContent value="gaps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Топ-10 компетенций с наибольшими разрывами</CardTitle>
              <CardDescription>
                Компетенции с наибольшей разницей между самооценкой и оценкой других
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topGaps.map((comp, index) => {
                  const isPositive = comp.gap > 0;
                  const Icon = isPositive ? TrendingUp : TrendingDown;

                  return (
                    <div 
                      key={comp.competenceId}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-2">{comp.competenceName}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Самооценка: <strong>{comp.selfAssessment ?? "-"}</strong>
                            </span>
                            <span className="text-muted-foreground">
                              Другие: <strong>{comp.othersAverage?.toFixed(1) ?? "-"}</strong>
                            </span>
                            <div className={cn(
                              "flex items-center gap-1 font-semibold",
                              isPositive ? "text-amber-600" : "text-blue-600"
                            )}>
                              <Icon className="h-4 w-4" />
                              <span>{Math.abs(comp.gap).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            {isPositive ? "Переоценка" : "Недооценка"}
                          </p>
                          <Badge 
                            variant="outline"
                            className={cn(
                              isPositive 
                                ? "bg-amber-50 border-amber-300 text-amber-700" 
                                : "bg-blue-50 border-blue-300 text-blue-700"
                            )}
                          >
                            {isPositive ? "+" : ""}{comp.gap.toFixed(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
