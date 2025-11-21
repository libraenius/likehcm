"use client";

import { useState, useEffect } from "react";
import {
  getCompetences,
  createCompetence,
  updateCompetence,
  deleteCompetence,
} from "@/lib/reference-data";
import type { Competence } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, AlertCircle, TrendingUp, ChevronLeft, ChevronsLeft, ChevronsRight, Search, Filter, X, BookOpen, Video, GraduationCap, ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const competenceTypes = [
  "профессиональные компетенции",
  "корпоративные компетенции",
] as const;

function CompetenceTableRow({
  competence,
  onEdit,
  onDelete,
}: {
  competence: Competence;
  onEdit: (competence: Competence) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Определяем цветовую схему в зависимости от типа компетенции
  const isCorporate = competence.type === "корпоративные компетенции";
  const getLevelColors = (level: number) => {
    if (level === 1) {
      return {
        circle: "bg-slate-100 text-slate-700",
        badge: "bg-slate-50 text-slate-700 border-slate-300",
      };
    }
    if (isCorporate) {
      // Синий градиент для корпоративных
      const colors = [
        { circle: "bg-cyan-50 text-cyan-400", badge: "bg-cyan-50 text-cyan-400 border-cyan-200" },
        { circle: "bg-cyan-100 text-cyan-500", badge: "bg-cyan-100 text-cyan-500 border-cyan-300" },
        { circle: "bg-cyan-200 text-cyan-600", badge: "bg-cyan-200 text-cyan-600 border-cyan-400" },
        { circle: "bg-cyan-300 text-cyan-700", badge: "bg-cyan-300 text-cyan-700 border-cyan-500" },
      ];
      return colors[level - 2];
    } else {
      // Фиолетовый градиент для профессиональных
      const colors = [
        { circle: "bg-purple-50 text-purple-400", badge: "bg-purple-50 text-purple-400 border-purple-200" },
        { circle: "bg-purple-100 text-purple-500", badge: "bg-purple-100 text-purple-500 border-purple-300" },
        { circle: "bg-purple-200 text-purple-600", badge: "bg-purple-200 text-purple-600 border-purple-400" },
        { circle: "bg-purple-300 text-purple-700", badge: "bg-purple-300 text-purple-700 border-purple-500" },
      ];
      return colors[level - 2];
    }
  };

  const borderColor = isCorporate 
    ? "border-l-cyan-500" 
    : "border-l-purple-500";
  
  // Цвет прогресс-бара в зависимости от типа компетенции
  const progressBarClass = isCorporate 
    ? "[&>div]:bg-cyan-500" 
    : "[&>div]:bg-purple-500";

  return (
    <>
      <TableRow 
        className={`cursor-pointer transition-colors ${
          isExpanded ? `bg-muted/50 border-l-4 ${borderColor}` : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="font-medium w-[250px]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {competence.name}
          </div>
        </TableCell>
        <TableCell className="w-[120px]">
          <Badge 
            variant="outline" 
            className={`whitespace-nowrap ${
              competence.type === "профессиональные компетенции"
                ? "bg-purple-50 text-purple-700 border-purple-300"
                : "bg-cyan-50 text-cyan-700 border-cyan-300"
            }`}
          >
            {competence.type.charAt(0).toUpperCase() + competence.type.slice(1)}
          </Badge>
        </TableCell>
        <TableCell className="w-[400px]">
          <div className="truncate" title={competence.description}>
            {competence.description}
          </div>
        </TableCell>
        <TableCell className="text-right w-[150px]">
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(competence)}
              title="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(competence.id)}
              title="Удалить"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/40">
          <TableCell colSpan={4} className={`p-4 w-full max-w-full border-l-4 ${borderColor}`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Уровни владения:</Label>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 w-full max-w-full" style={{ width: '100%' }}>
                {/* Уровень 1 */}
                <div className="relative rounded-lg border bg-card p-4 space-y-3 min-w-0 w-full max-w-full box-border" style={{ width: '100%', maxWidth: '100%' }}>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex-shrink-0">
                        1
                      </div>
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-center whitespace-nowrap flex-shrink-0">
                        Начальный
                      </Badge>
                    </div>
                    <Progress value={20} className={`h-1.5 w-16 flex-shrink-0 ${progressBarClass}`} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed w-full max-w-full box-border" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', wordWrap: 'break-word', whiteSpace: 'normal', overflow: 'visible', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {competence.levels?.level1 || "Не указано"}
                  </p>
                </div>

                {/* Уровень 2 */}
                <div className="relative rounded-lg border bg-card p-4 space-y-3 min-w-0 w-full max-w-full box-border" style={{ width: '100%', maxWidth: '100%' }}>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${getLevelColors(2).circle}`}>
                        2
                      </div>
                      <Badge variant="outline" className={`${getLevelColors(2).badge} text-center whitespace-nowrap flex-shrink-0`}>
                        Базовый
                      </Badge>
                    </div>
                    <Progress value={40} className={`h-1.5 w-16 flex-shrink-0 ${progressBarClass}`} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed w-full max-w-full box-border" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', wordWrap: 'break-word', whiteSpace: 'normal', overflow: 'visible', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {competence.levels?.level2 || "Не указано"}
                  </p>
                </div>

                {/* Уровень 3 */}
                <div className="relative rounded-lg border bg-card p-4 space-y-3 min-w-0 w-full max-w-full box-border" style={{ width: '100%', maxWidth: '100%' }}>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${getLevelColors(3).circle}`}>
                        3
                      </div>
                      <Badge variant="outline" className={`${getLevelColors(3).badge} text-center whitespace-nowrap flex-shrink-0`}>
                        Средний
                      </Badge>
                    </div>
                    <Progress value={60} className={`h-1.5 w-16 flex-shrink-0 ${progressBarClass}`} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed w-full max-w-full box-border" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', wordWrap: 'break-word', whiteSpace: 'normal', overflow: 'visible', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {competence.levels?.level3 || "Не указано"}
                  </p>
                </div>

                {/* Уровень 4 */}
                <div className="relative rounded-lg border bg-card p-4 space-y-3 min-w-0 w-full max-w-full box-border" style={{ width: '100%', maxWidth: '100%' }}>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${getLevelColors(4).circle}`}>
                        4
                      </div>
                      <Badge variant="outline" className={`${getLevelColors(4).badge} text-center whitespace-nowrap flex-shrink-0`}>
                        Продвинутый
                      </Badge>
                    </div>
                    <Progress value={80} className={`h-1.5 w-16 flex-shrink-0 ${progressBarClass}`} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed w-full max-w-full box-border" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', wordWrap: 'break-word', whiteSpace: 'normal', overflow: 'visible', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {competence.levels?.level4 || "Не указано"}
                  </p>
                </div>

                {/* Уровень 5 */}
                <div className="relative rounded-lg border bg-card p-4 space-y-3 min-w-0 w-full max-w-full box-border" style={{ width: '100%', maxWidth: '100%' }}>
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${getLevelColors(5).circle}`}>
                        5
                      </div>
                      <Badge variant="outline" className={`${getLevelColors(5).badge} text-center whitespace-nowrap flex-shrink-0`}>
                        Экспертный
                      </Badge>
                    </div>
                    <Progress value={100} className={`h-1.5 w-16 flex-shrink-0 ${progressBarClass}`} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed w-full max-w-full box-border" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', wordWrap: 'break-word', whiteSpace: 'normal', overflow: 'visible', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {competence.levels?.level5 || "Не указано"}
                  </p>
                </div>
              </div>

              {/* Рекомендуемые ресурсы */}
              {((competence.resources?.literature && Array.isArray(competence.resources.literature) && competence.resources.literature.length > 0) || 
                (competence.resources?.videos && Array.isArray(competence.resources.videos) && competence.resources.videos.length > 0) || 
                (competence.resources?.courses && Array.isArray(competence.resources.courses) && competence.resources.courses.length > 0)) && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">Рекомендуемые ресурсы:</Label>
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full max-w-full">
                    {/* Литература */}
                    {competence.resources?.literature && Array.isArray(competence.resources.literature) && competence.resources.literature.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          Литература
                        </Label>
                        <ul className="space-y-1 text-sm">
                          {competence.resources.literature.map((item, index) => {
                            const resource = typeof item === 'string' ? { name: item, level: 2 as const } : item;
                            const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                            const isCorporate = competence.type === "корпоративные компетенции";
                            const levelColors = [
                              "bg-slate-50 text-slate-700 border-slate-300",
                              isCorporate ? "bg-cyan-50 text-cyan-700 border-cyan-300" : "bg-purple-50 text-purple-700 border-purple-300",
                              isCorporate ? "bg-cyan-100 text-cyan-700 border-cyan-400" : "bg-purple-100 text-purple-700 border-purple-400",
                              isCorporate ? "bg-cyan-200 text-cyan-700 border-cyan-500" : "bg-purple-200 text-purple-700 border-purple-500",
                              isCorporate ? "bg-cyan-300 text-cyan-700 border-cyan-600" : "bg-purple-300 text-purple-700 border-purple-600",
                            ];
                            return (
                              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                <span>• {resource.name}</span>
                                <Badge variant="outline" className={`text-xs ${levelColors[resource.level - 1]}`}>
                                  {levelNames[resource.level - 1]}
                                </Badge>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Видео */}
                    {competence.resources?.videos && Array.isArray(competence.resources.videos) && competence.resources.videos.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          Видео
                        </Label>
                        <ul className="space-y-1 text-sm">
                          {competence.resources.videos.map((item, index) => {
                            const resource = typeof item === 'string' ? { name: item, level: 2 as const } : item;
                            const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                            const isCorporate = competence.type === "корпоративные компетенции";
                            const levelColors = [
                              "bg-slate-50 text-slate-700 border-slate-300",
                              isCorporate ? "bg-cyan-50 text-cyan-700 border-cyan-300" : "bg-purple-50 text-purple-700 border-purple-300",
                              isCorporate ? "bg-cyan-100 text-cyan-700 border-cyan-400" : "bg-purple-100 text-purple-700 border-purple-400",
                              isCorporate ? "bg-cyan-200 text-cyan-700 border-cyan-500" : "bg-purple-200 text-purple-700 border-purple-500",
                              isCorporate ? "bg-cyan-300 text-cyan-700 border-cyan-600" : "bg-purple-300 text-purple-700 border-purple-600",
                            ];
                            return (
                              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                <span>• {resource.name}</span>
                                <Badge variant="outline" className={`text-xs ${levelColors[resource.level - 1]}`}>
                                  {levelNames[resource.level - 1]}
                                </Badge>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Курсы */}
                    {competence.resources?.courses && Array.isArray(competence.resources.courses) && competence.resources.courses.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          Курсы
                        </Label>
                        <ul className="space-y-1 text-sm">
                          {competence.resources.courses.map((item, index) => {
                            const resource = typeof item === 'string' ? { name: item, level: 2 as const } : item;
                            const levelNames = ["Начальный", "Базовый", "Средний", "Продвинутый", "Экспертный"];
                            const isCorporate = competence.type === "корпоративные компетенции";
                            const levelColors = [
                              "bg-slate-50 text-slate-700 border-slate-300",
                              isCorporate ? "bg-cyan-50 text-cyan-700 border-cyan-300" : "bg-purple-50 text-purple-700 border-purple-300",
                              isCorporate ? "bg-cyan-100 text-cyan-700 border-cyan-400" : "bg-purple-100 text-purple-700 border-purple-400",
                              isCorporate ? "bg-cyan-200 text-cyan-700 border-cyan-500" : "bg-purple-200 text-purple-700 border-purple-500",
                              isCorporate ? "bg-cyan-300 text-cyan-700 border-cyan-600" : "bg-purple-300 text-purple-700 border-purple-600",
                            ];
                            return (
                              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                <span>• {resource.name}</span>
                                <Badge variant="outline" className={`text-xs ${levelColors[resource.level - 1]}`}>
                                  {levelNames[resource.level - 1]}
                                </Badge>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function CompetencesPage() {
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompetence, setEditingCompetence] = useState<Competence | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [competenceToDelete, setCompetenceToDelete] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    type: string[];
  }>({
    type: [],
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "профессиональные компетенции" as "профессиональные компетенции" | "корпоративные компетенции",
    levels: {
      level1: "",
      level2: "",
      level3: "",
      level4: "",
      level5: "",
    },
    resources: {
      literature: [] as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>,
      videos: [] as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>,
      courses: [] as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>,
    },
  });

  useEffect(() => {
    loadCompetences();
  }, []);

  const loadCompetences = () => {
    setCompetences(getCompetences());
  };

  // Функция для получения цветов уровней в форме в зависимости от типа компетенции
  const getFormLevelColors = (level: number) => {
    const isCorporate = formData.type === "корпоративные компетенции";
    if (level === 1) {
      return {
        bg: "bg-slate-50/50",
        circle: "bg-slate-200 text-slate-700",
      };
    }
    if (isCorporate) {
      // Синий градиент для корпоративных
      const colors = [
        { bg: "bg-cyan-50/50", circle: "bg-cyan-200 text-cyan-700" },
        { bg: "bg-cyan-100/50", circle: "bg-cyan-300 text-cyan-800" },
        { bg: "bg-cyan-200/50", circle: "bg-cyan-400 text-cyan-900" },
        { bg: "bg-cyan-300/50 border-2 border-cyan-400/20", circle: "bg-cyan-400/20 text-cyan-700" },
      ];
      return colors[level - 2];
    } else {
      // Фиолетовый градиент для профессиональных
      const colors = [
        { bg: "bg-purple-50/50", circle: "bg-purple-200 text-purple-700" },
        { bg: "bg-purple-100/50", circle: "bg-purple-300 text-purple-800" },
        { bg: "bg-purple-200/50", circle: "bg-purple-400 text-purple-900" },
        { bg: "bg-purple-300/50 border-2 border-purple-400/20", circle: "bg-purple-500 text-purple-950" },
      ];
      return colors[level - 2];
    }
  };

  const handleCreate = () => {
    setEditingCompetence(null);
    setFormData({
      name: "",
      description: "",
      type: "профессиональные компетенции",
      levels: {
        level1: "",
        level2: "",
        level3: "",
        level4: "",
        level5: "",
      },
      resources: {
        literature: [] as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>,
        videos: [] as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>,
        courses: [] as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>,
      },
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (competence: Competence) => {
    setEditingCompetence(competence);
    
    // Функция для конвертации старого формата (строки) в новый (объекты)
    const convertResources = (resources: any) => {
      if (!resources) return { literature: [], videos: [], courses: [] };
      
      const convertArray = (arr: any[]): Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }> => {
        if (!arr || arr.length === 0) return [];
        // Если это уже новый формат (объекты), возвращаем как есть
        if (typeof arr[0] === 'object' && arr[0].name !== undefined) {
          return arr;
        }
        // Если это старый формат (строки), конвертируем в объекты с уровнем 2 по умолчанию
        return arr.map((item: string) => ({ name: item, level: 2 as 1 | 2 | 3 | 4 | 5 }));
      };
      
      return {
        literature: convertArray(resources.literature || []),
        videos: convertArray(resources.videos || []),
        courses: convertArray(resources.courses || []),
      };
    };
    
    setFormData({
      name: competence.name,
      description: competence.description,
      type: competence.type,
      levels: competence.levels || {
        level1: "",
        level2: "",
        level3: "",
        level4: "",
        level5: "",
      },
      resources: convertResources(competence.resources),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompetenceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (competenceToDelete) {
      deleteCompetence(competenceToDelete);
      loadCompetences();
      setDeleteDialogOpen(false);
      setCompetenceToDelete(null);
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
    if (!formData.name || !formData.description || !formData.type) {
      setErrorAlert("Пожалуйста, заполните название, описание и тип");
      return;
    }

    // Проверяем, что все уровни заполнены
    if (!formData.levels.level1 || !formData.levels.level2 || !formData.levels.level3 || 
        !formData.levels.level4 || !formData.levels.level5) {
      setErrorAlert("Пожалуйста, заполните все 5 уровней владения");
      return;
    }

    // Фильтруем пустые строки из ресурсов
    const filteredResources = {
      literature: formData.resources.literature.filter(item => item.name.trim() !== ""),
      videos: formData.resources.videos.filter(item => item.name.trim() !== ""),
      courses: formData.resources.courses.filter(item => item.name.trim() !== ""),
    };

    const dataToSave = {
      ...formData,
      resources: filteredResources,
    };

    if (editingCompetence) {
      updateCompetence(editingCompetence.id, dataToSave);
    } else {
      createCompetence(dataToSave);
    }

    setIsDialogOpen(false);
    setErrorAlert(null);
    loadCompetences();
  };

  // Фильтруем и ищем компетенции
  const filteredCompetences = competences.filter((comp) => {
    // Поиск по названию и описанию
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        comp.name.toLowerCase().includes(query) ||
        comp.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Фильтр по типу
    if (filters.type.length > 0) {
      if (!filters.type.includes(comp.type)) return false;
    }

    return true;
  });

  // Функция для определения, является ли символ кириллическим
  const isCyrillic = (char: string): boolean => {
    if (!char || char.length === 0) return false;
    const code = char.charCodeAt(0);
    // Основной диапазон кириллицы: 0x0400-0x04FF (включая русский алфавит 0x0410-0x044F)
    return (code >= 0x0400 && code <= 0x04FF) || (code >= 0x0500 && code <= 0x052F);
  };

  // Функция сортировки по названию с приоритетом кириллицы
  const sortByName = (a: Competence, b: Competence): number => {
    const nameA = a.name.trim();
    const nameB = b.name.trim();
    
    if (nameA.length === 0 && nameB.length === 0) return 0;
    if (nameA.length === 0) return 1;
    if (nameB.length === 0) return -1;
    
    // Проверяем первый символ исходной строки (до toLowerCase)
    const firstCharA = nameA[0];
    const firstCharB = nameB[0];
    
    const isCyrillicA = isCyrillic(firstCharA);
    const isCyrillicB = isCyrillic(firstCharB);
    
    // Если один кириллический, а другой латинский - кириллический идет первым
    if (isCyrillicA && !isCyrillicB) return sortOrder === "asc" ? -1 : 1;
    if (!isCyrillicA && isCyrillicB) return sortOrder === "asc" ? 1 : -1;
    
    // Если оба одного типа (оба кириллические или оба латинские), сортируем по алфавиту
    const comparison = nameA.localeCompare(nameB, "ru", { sensitivity: "base", caseFirst: "upper" });
    return sortOrder === "asc" ? comparison : -comparison;
  };

  // Сортируем компетенции по названию
  const sortedCompetences = [...filteredCompetences].sort(sortByName);

  // Вычисляем пагинацию
  const totalPages = Math.ceil(sortedCompetences.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompetences = sortedCompetences.slice(startIndex, endIndex);

  // Сбрасываем на первую страницу при изменении количества элементов, поиска, фильтров или сортировки
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery, filters, sortOrder]);

  return (
    <div className="space-y-6">
      {errorAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{errorAlert}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Компетенции</h1>
          <p className="text-muted-foreground">
            Справочник всех доступных компетенций в системе
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить компетенцию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingCompetence ? "Редактировать компетенцию" : "Создать компетенцию"}
              </DialogTitle>
              <DialogDescription>
                {editingCompetence
                  ? "Внесите изменения в компетенцию и её уровни владения"
                  : "Заполните информацию о компетенции и опишите все 5 уровней владения"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Основная информация */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Название компетенции <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например: JavaScript, Коммуникация, Лидерство"
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Краткое название компетенции, которое будет отображаться в справочнике
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-sm font-semibold">
                    Тип компетенции <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "профессиональные компетенции" | "корпоративные компетенции" })}
                  >
                    <SelectTrigger id="type" className="text-base">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {competenceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Профессиональные — технические компетенции (hard skills), Корпоративные — личностные компетенции (soft skills)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Описание <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание компетенции, её назначение и область применения"
                    rows={3}
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Подробное описание компетенции, которое поможет понять её суть
                  </p>
                </div>
              </div>

              {/* Уровни владения */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Уровни владения <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Опишите характеристики каждого из 5 уровней владения компетенцией
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Уровень 1 */}
                  <div className="space-y-2 p-3 rounded-lg border bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                        1
                      </div>
                      <Label htmlFor="level1" className="text-sm font-semibold">
                        Уровень 1 — Начальный
                      </Label>
                    </div>
                    <Textarea
                      id="level1"
                      value={formData.levels.level1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          levels: { ...formData.levels, level1: e.target.value },
                        })
                      }
                      placeholder="Опишите начальный уровень владения компетенцией..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Уровень 2 */}
                  <div className={`space-y-2 p-3 rounded-lg border ${getFormLevelColors(2).bg}`}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getFormLevelColors(2).circle}`}>
                        2
                      </div>
                      <Label htmlFor="level2" className="text-sm font-semibold">
                        Уровень 2 — Базовый
                      </Label>
                    </div>
                    <Textarea
                      id="level2"
                      value={formData.levels.level2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          levels: { ...formData.levels, level2: e.target.value },
                        })
                      }
                      placeholder="Опишите базовый уровень владения компетенцией..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Уровень 3 */}
                  <div className={`space-y-2 p-3 rounded-lg border ${getFormLevelColors(3).bg}`}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getFormLevelColors(3).circle}`}>
                        3
                      </div>
                      <Label htmlFor="level3" className="text-sm font-semibold">
                        Уровень 3 — Средний
                      </Label>
                    </div>
                    <Textarea
                      id="level3"
                      value={formData.levels.level3}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          levels: { ...formData.levels, level3: e.target.value },
                        })
                      }
                      placeholder="Опишите средний уровень владения компетенцией..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Уровень 4 */}
                  <div className={`space-y-2 p-3 rounded-lg border ${getFormLevelColors(4).bg}`}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getFormLevelColors(4).circle}`}>
                        4
                      </div>
                      <Label htmlFor="level4" className="text-sm font-semibold">
                        Уровень 4 — Продвинутый
                      </Label>
                    </div>
                    <Textarea
                      id="level4"
                      value={formData.levels.level4}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          levels: { ...formData.levels, level4: e.target.value },
                        })
                      }
                      placeholder="Опишите продвинутый уровень владения компетенцией..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Уровень 5 */}
                  <div className={`space-y-2 p-3 rounded-lg ${getFormLevelColors(5).bg}`}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${getFormLevelColors(5).circle}`}>
                        5
                      </div>
                      <Label htmlFor="level5" className="text-sm font-semibold">
                        Уровень 5 — Экспертный
                      </Label>
                    </div>
                    <Textarea
                      id="level5"
                      value={formData.levels.level5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          levels: { ...formData.levels, level5: e.target.value },
                        })
                      }
                      placeholder="Опишите экспертный уровень владения компетенцией..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Рекомендуемые ресурсы */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Рекомендуемые ресурсы
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Добавьте полезные ресурсы для изучения компетенции
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Литература */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Литература
                    </Label>
                    <div className="space-y-2">
                      {formData.resources.literature.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newLiterature = [...formData.resources.literature];
                              newLiterature[index] = { ...newLiterature[index], name: e.target.value };
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  literature: newLiterature,
                                },
                              });
                            }}
                            placeholder="Название книги или статьи"
                            className="flex-1"
                          />
                          <Select
                            value={item.level.toString()}
                            onValueChange={(value) => {
                              const newLiterature = [...formData.resources.literature];
                              newLiterature[index] = { ...newLiterature[index], level: Number(value) as 1 | 2 | 3 | 4 | 5 };
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  literature: newLiterature,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Начальный</SelectItem>
                              <SelectItem value="2">Базовый</SelectItem>
                              <SelectItem value="3">Средний</SelectItem>
                              <SelectItem value="4">Продвинутый</SelectItem>
                              <SelectItem value="5">Экспертный</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newLiterature = formData.resources.literature.filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  literature: newLiterature,
                                },
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            resources: {
                              ...formData.resources,
                              literature: [...formData.resources.literature, { name: "", level: 2 }],
                            },
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить литературу
                      </Button>
                    </div>
                  </div>

                  {/* Видео */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      Видео
                    </Label>
                    <div className="space-y-2">
                      {formData.resources.videos.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newVideos = [...formData.resources.videos];
                              newVideos[index] = { ...newVideos[index], name: e.target.value };
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  videos: newVideos,
                                },
                              });
                            }}
                            placeholder="Название видео или ссылка"
                            className="flex-1"
                          />
                          <Select
                            value={item.level.toString()}
                            onValueChange={(value) => {
                              const newVideos = [...formData.resources.videos];
                              newVideos[index] = { ...newVideos[index], level: Number(value) as 1 | 2 | 3 | 4 | 5 };
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  videos: newVideos,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Начальный</SelectItem>
                              <SelectItem value="2">Базовый</SelectItem>
                              <SelectItem value="3">Средний</SelectItem>
                              <SelectItem value="4">Продвинутый</SelectItem>
                              <SelectItem value="5">Экспертный</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newVideos = formData.resources.videos.filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  videos: newVideos,
                                },
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            resources: {
                              ...formData.resources,
                              videos: [...formData.resources.videos, { name: "", level: 2 }],
                            },
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить видео
                      </Button>
                    </div>
                  </div>

                  {/* Курсы */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Курсы
                    </Label>
                    <div className="space-y-2">
                      {formData.resources.courses.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newCourses = [...formData.resources.courses];
                              newCourses[index] = { ...newCourses[index], name: e.target.value };
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  courses: newCourses,
                                },
                              });
                            }}
                            placeholder="Название курса или ссылка"
                            className="flex-1"
                          />
                          <Select
                            value={item.level.toString()}
                            onValueChange={(value) => {
                              const newCourses = [...formData.resources.courses];
                              newCourses[index] = { ...newCourses[index], level: Number(value) as 1 | 2 | 3 | 4 | 5 };
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  courses: newCourses,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Начальный</SelectItem>
                              <SelectItem value="2">Базовый</SelectItem>
                              <SelectItem value="3">Средний</SelectItem>
                              <SelectItem value="4">Продвинутый</SelectItem>
                              <SelectItem value="5">Экспертный</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newCourses = formData.resources.courses.filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                resources: {
                                  ...formData.resources,
                                  courses: newCourses,
                                },
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            resources: {
                              ...formData.resources,
                              courses: [...formData.resources.courses, { name: "", level: 2 }],
                            },
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить курс
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                {editingCompetence ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Поиск и фильтрация */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или описанию..."
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
              {filters.type.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.type.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-lg">Фильтры</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Тип компетенции</Label>
                <div className="space-y-1.5">
                  {competenceTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-type-${type}`}
                        checked={filters.type.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({
                              ...filters,
                              type: [...filters.type, type],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              type: filters.type.filter((t) => t !== type),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`filter-type-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ type: [] });
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

      <div className="rounded-md border">
        <Table className="table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px] font-bold text-base text-foreground">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-bold hover:bg-transparent"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      <div className="flex items-center gap-2">
                        Название
                        {sortOrder === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] font-bold text-base text-foreground">Тип</TableHead>
                  <TableHead className="w-[400px] font-bold text-base text-foreground">Описание</TableHead>
                  <TableHead className="w-[150px] text-right font-bold text-base text-foreground">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompetences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Нет компетенций. Создайте первую компетенцию.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCompetences.map((comp) => (
                    <CompetenceTableRow
                      key={comp.id}
                      competence={comp}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
      </div>

      {/* Пагинация */}
      {sortedCompetences.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page" className="text-sm text-muted-foreground">
              Показать:
            </Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger id="items-per-page" className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              из {sortedCompetences.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Страница {currentPage} из {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту компетенцию? Это действие также удалит её из всех профилей и карьерных треков.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
