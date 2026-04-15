"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  Target,
  Users,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JohariWindowData, JohariWindowStats, JohariQuadrant } from "@/types";
import { 
  calculateJohariStats, 
  getJohariRecommendation,
  sortByDevelopmentPriority 
} from "@/lib/johari-window/services";

interface JohariWindowVisualizationProps {
  data: JohariWindowData[];
  showDetails?: boolean;
}

// Конфигурация квадрантов
const quadrantConfig: Record<JohariQuadrant, {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  arena: {
    title: "Открытая область",
    description: "Сильные стороны (высокая самооценка + высокая оценка других)",
    icon: CheckCircle2,
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-300 dark:border-green-700",
  },
  blind_spot: {
    title: "Слепая зона",
    description: "Недооценка способностей (низкая самооценка + высокая оценка других)",
    icon: Eye,
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-300 dark:border-blue-700",
  },
  facade: {
    title: "Скрытая область",
    description: "Переоценка способностей (высокая самооценка + низкая оценка других)",
    icon: AlertCircle,
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-300 dark:border-amber-700",
  },
  unknown: {
    title: "Неизвестная область",
    description: "Зона развития (низкая самооценка + низкая оценка других)",
    icon: Target,
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-50 dark:bg-slate-950",
    borderColor: "border-slate-300 dark:border-slate-700",
  },
};

// Компонент для отображения компетенции
function CompetenceItem({ 
  data, 
  onShowDetails 
}: { 
  data: JohariWindowData;
  onShowDetails: (data: JohariWindowData) => void;
}) {
  const gapAbs = Math.abs(data.gap);
  const gapIcon = data.gap > 0 ? ArrowUp : data.gap < 0 ? ArrowDown : Minus;
  const gapColor = data.gap > 0 
    ? "text-amber-600 dark:text-amber-400" 
    : data.gap < 0 
    ? "text-blue-600 dark:text-blue-400" 
    : "text-slate-600 dark:text-slate-400";

  return (
    <div 
      className="p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onShowDetails(data)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{data.competenceName}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Я:</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {data.selfAssessment}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Др:</span>
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {data.othersAssessment.toFixed(1)}
              </Badge>
            </div>
            {gapAbs >= 0.5 && (
              <div className={cn("flex items-center gap-1", gapColor)}>
                {gapIcon === ArrowUp && <ArrowUp className="h-3 w-3" />}
                {gapIcon === ArrowDown && <ArrowDown className="h-3 w-3" />}
                <span>{gapAbs.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент квадранта
function QuadrantCard({ 
  quadrant, 
  count, 
  percentage,
  competences,
  onShowDetails
}: { 
  quadrant: JohariQuadrant;
  count: number;
  percentage: number;
  competences: JohariWindowData[];
  onShowDetails: (data: JohariWindowData) => void;
}) {
  const config = quadrantConfig[quadrant];
  const Icon = config.icon;

  return (
    <Card className={cn("p-4 border-2", config.borderColor, config.bgColor)}>
      <div className="space-y-3">
        {/* Заголовок */}
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg bg-background/50 shrink-0")}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-sm mb-1", config.color)}>
              {config.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {config.description}
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Компетенций:</span>
            <span className={cn("font-semibold", config.color)}>{count}</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(0)}%</p>
        </div>

        {/* Список компетенций (первые 3) */}
        {competences.length > 0 && (
          <div className="space-y-2">
            {competences.slice(0, 3).map(data => (
              <CompetenceItem 
                key={data.competenceId} 
                data={data}
                onShowDetails={onShowDetails}
              />
            ))}
            {competences.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{competences.length - 3} еще
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function JohariWindowVisualization({ 
  data,
  showDetails = true
}: JohariWindowVisualizationProps) {
  const [selectedCompetence, setSelectedCompetence] = useState<JohariWindowData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Вычисляем статистику
  const stats = useMemo(() => calculateJohariStats(data), [data]);

  // Группируем компетенции по квадрантам
  const groupedData = useMemo(() => {
    const groups: Record<JohariQuadrant, JohariWindowData[]> = {
      arena: [],
      blind_spot: [],
      facade: [],
      unknown: [],
    };

    data.forEach(item => {
      groups[item.quadrant].push(item);
    });

    // Сортируем внутри каждого квадранта по величине разрыва
    Object.keys(groups).forEach(key => {
      const quadrant = key as JohariQuadrant;
      groups[quadrant].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
    });

    return groups;
  }, [data]);

  // Приоритезированный список для развития
  const prioritizedData = useMemo(() => {
    return sortByDevelopmentPriority(data);
  }, [data]);

  const handleShowDetails = (competenceData: JohariWindowData) => {
    setSelectedCompetence(competenceData);
    setIsDetailsOpen(true);
  };

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Недостаточно данных</h3>
        <p className="text-sm text-muted-foreground">
          Для построения окна Джохари необходимы оценки компетенций от вас и других участников
          (руководителя, коллег или подчиненных).
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Общая статистика */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Окно Джохари</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Инструмент для понимания вашего самовосприятия через сравнение самооценки с оценкой окружающих.
            Анализ {stats.total} компетенций.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["arena", "blind_spot", "facade", "unknown"] as JohariQuadrant[]).map(quadrant => {
              const config = quadrantConfig[quadrant];
              const Icon = config.icon;
              const count = stats[quadrant === "blind_spot" ? "blindSpot" : quadrant];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

              return (
                <div 
                  key={quadrant}
                  className={cn(
                    "p-4 rounded-lg border-2",
                    config.borderColor,
                    config.bgColor
                  )}
                >
                  <Icon className={cn("h-5 w-5 mb-2", config.color)} />
                  <p className="text-2xl font-bold mb-1">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.title}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Вкладки с двумя представлениями */}
        <Tabs defaultValue="quadrants" className="w-full">
          <TabsList variant="grid2">
            <TabsTrigger value="quadrants">По квадрантам</TabsTrigger>
            <TabsTrigger value="priority">Приоритет развития</TabsTrigger>
          </TabsList>

          {/* Представление по квадрантам (сетка 2x2) */}
          <TabsContent value="quadrants" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuadrantCard
                quadrant="arena"
                count={stats.arena}
                percentage={stats.total > 0 ? (stats.arena / stats.total) * 100 : 0}
                competences={groupedData.arena}
                onShowDetails={handleShowDetails}
              />
              <QuadrantCard
                quadrant="blind_spot"
                count={stats.blindSpot}
                percentage={stats.total > 0 ? (stats.blindSpot / stats.total) * 100 : 0}
                competences={groupedData.blind_spot}
                onShowDetails={handleShowDetails}
              />
              <QuadrantCard
                quadrant="facade"
                count={stats.facade}
                percentage={stats.total > 0 ? (stats.facade / stats.total) * 100 : 0}
                competences={groupedData.facade}
                onShowDetails={handleShowDetails}
              />
              <QuadrantCard
                quadrant="unknown"
                count={stats.unknown}
                percentage={stats.total > 0 ? (stats.unknown / stats.total) * 100 : 0}
                competences={groupedData.unknown}
                onShowDetails={handleShowDetails}
              />
            </div>
          </TabsContent>

          {/* Представление по приоритету развития */}
          <TabsContent value="priority" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Рекомендуемая последовательность развития</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Компетенции отсортированы по приоритету: сначала области переоценки и недооценки, 
                затем зоны развития.
              </p>
              <div className="space-y-3">
                {prioritizedData.map((item, index) => {
                  const config = quadrantConfig[item.quadrant];
                  const Icon = config.icon;
                  
                  return (
                    <div 
                      key={item.competenceId}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleShowDetails(item)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                          "bg-primary text-primary-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="font-medium">{item.competenceName}</p>
                            <Badge 
                              variant="outline" 
                              className={cn(config.bgColor, config.color, "text-xs")}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {config.title}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Самооценка: <strong>{item.selfAssessment}</strong></span>
                            <span>Оценка других: <strong>{item.othersAssessment.toFixed(1)}</strong></span>
                            <span className={cn(
                              "flex items-center gap-1",
                              item.gap > 0 ? "text-amber-600" : "text-blue-600"
                            )}>
                              Разрыв: <strong>{item.gap.toFixed(1)}</strong>
                              {item.gap > 0 && <TrendingUp className="h-3 w-3" />}
                              {item.gap < 0 && <TrendingDown className="h-3 w-3" />}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Диалог с деталями компетенции */}
      {selectedCompetence && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCompetence.competenceName}
              </DialogTitle>
              <DialogDescription>
                Детальный анализ оценок компетенции
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Квадрант */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Квадрант окна Джохари</span>
                </div>
                <div className={cn(
                  "p-4 rounded-lg border-2",
                  quadrantConfig[selectedCompetence.quadrant].borderColor,
                  quadrantConfig[selectedCompetence.quadrant].bgColor
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const Icon = quadrantConfig[selectedCompetence.quadrant].icon;
                      return <Icon className={cn("h-5 w-5", quadrantConfig[selectedCompetence.quadrant].color)} />;
                    })()}
                    <span className={cn(
                      "font-semibold",
                      quadrantConfig[selectedCompetence.quadrant].color
                    )}>
                      {quadrantConfig[selectedCompetence.quadrant].title}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quadrantConfig[selectedCompetence.quadrant].description}
                  </p>
                </div>
              </div>

              {/* Оценки */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Оценки</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Ваша самооценка</p>
                    <p className="text-3xl font-bold">{selectedCompetence.selfAssessment}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Оценка окружающих</p>
                    <p className="text-3xl font-bold">{selectedCompetence.othersAssessment.toFixed(1)}</p>
                  </div>
                </div>
                <div className={cn(
                  "mt-4 p-4 rounded-lg border-2",
                  selectedCompetence.gap > 0 
                    ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950"
                    : "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Разрыв в оценках</span>
                    <span className={cn(
                      "text-2xl font-bold flex items-center gap-2",
                      selectedCompetence.gap > 0 ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300"
                    )}>
                      {selectedCompetence.gap > 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                      {Math.abs(selectedCompetence.gap).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedCompetence.gap > 0 
                      ? "Вы оцениваете себя выше, чем окружающие"
                      : "Окружающие оценивают вас выше, чем вы сами"}
                  </p>
                </div>
              </div>

              {/* Рекомендации */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Рекомендации</span>
                </div>
                {(() => {
                  const recommendation = getJohariRecommendation(selectedCompetence.quadrant);
                  return (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-semibold mb-2">{recommendation.title}</p>
                        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      </div>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Что делать?
                        </p>
                        <p className="text-sm text-muted-foreground">{recommendation.action}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
