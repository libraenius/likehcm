"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Eye, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Star,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EvaluationDialog } from "@/components/internships/evaluation-dialog";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import type { 
  Internship, 
  InternshipApplication, 
  InternshipStatus, 
  ApplicationStatus,
  InternshipStudent,
  InternshipEvaluation,
} from "@/types/internships";
import { 
  mockInternships, 
  mockApplications, 
  mockStudents,
} from "@/lib/internships/mock-data";
import {
  canChangeApplicationStatus,
  calculateConversionRate,
} from "@/lib/internships/business-logic";
import type { InternshipStatistics } from "@/types/internships";

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { setCustomLabel } = useBreadcrumb();
  const internshipId = params.id as string;

  const [internships] = useState<Internship[]>(mockInternships);
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>(mockApplications);
  const [internshipStudents] = useState<InternshipStudent[]>(mockStudents);
  const [evaluations, setEvaluations] = useState<InternshipEvaluation[]>([]);
  const [selectedInternshipApplication, setSelectedInternshipApplication] = useState<InternshipApplication | null>(null);
  const [isInternshipApplicationDialogOpen, setIsInternshipApplicationDialogOpen] = useState(false);
  const [isInternshipStatisticsDialogOpen, setIsInternshipStatisticsDialogOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [evaluationApplicationId, setEvaluationApplicationId] = useState<string | null>(null);

  const selectedInternship = useMemo(() => {
    return internships.find(i => i.id === internshipId) || null;
  }, [internships, internshipId]);

  // Устанавливаем название стажировки в breadcrumbs
  useEffect(() => {
    if (selectedInternship) {
      setCustomLabel(selectedInternship.title);
    }
    // Очищаем при размонтировании
    return () => {
      setCustomLabel(null);
    };
  }, [selectedInternship, setCustomLabel]);

  const currentInternshipApplications = useMemo(() => {
    if (!selectedInternship) return [];
    return internshipApplications.filter(app => app.internshipId === selectedInternship.id);
  }, [internshipApplications, selectedInternship]);

  // Расчет статистики для дэшборда
  const internshipStatistics = useMemo((): InternshipStatistics | null => {
    if (!selectedInternship) return null;
    
    const apps = currentInternshipApplications;
    const total = apps.length;
    const pending = apps.filter(a => a.status === 'pending').length;
    const approved = apps.filter(a => ['approved', 'confirmed', 'active', 'completed'].includes(a.status)).length;
    const rejected = apps.filter(a => a.status === 'rejected').length;
    const confirmed = apps.filter(a => ['confirmed', 'active', 'completed'].includes(a.status)).length;
    const active = apps.filter(a => a.status === 'active').length;
    const completed = apps.filter(a => a.status === 'completed').length;
    
    const avgMatchScore = apps.length > 0
      ? apps.reduce((sum, a) => sum + (a.matchScore || 0), 0) / apps.length
      : 0;
    
    const universityMap = new Map<string, { universityName: string; applicationsCount: number; approvedCount: number }>();
    apps.forEach(app => {
      const existing = universityMap.get(app.universityId) || { universityName: app.universityName, applicationsCount: 0, approvedCount: 0 };
      existing.applicationsCount++;
      if (['approved', 'confirmed', 'active', 'completed'].includes(app.status)) {
        existing.approvedCount++;
      }
      universityMap.set(app.universityId, existing);
    });
    
    const topUniversities = Array.from(universityMap.entries())
      .map(([id, data]) => ({ universityId: id, ...data }))
      .sort((a, b) => b.applicationsCount - a.applicationsCount)
      .slice(0, 5);
    
    const conversion = calculateConversionRate(apps);
    
    return {
      internshipId: selectedInternship.id,
      totalApplications: total,
      pendingApplications: pending,
      approvedApplications: approved,
      rejectedApplications: rejected,
      confirmedApplications: confirmed,
      activeStudents: active,
      completedStudents: completed,
      averageMatchScore: Math.round(avgMatchScore),
      topUniversities,
      topSkills: [],
      conversionRate: conversion,
    };
  }, [selectedInternship, currentInternshipApplications]);

  const getInternshipStatusText = (status: InternshipStatus | ApplicationStatus) => {
    const statusMap: Record<string, string> = {
      planned: "План",
      recruiting: "Набор",
      active: "Активна",
      completed: "Завершена",
      pending: "На рассмотрении",
      approved: "Одобрено",
      rejected: "Отклонено",
      withdrawn: "Отозвано",
      confirmed: "Подтверждено",
    };
    return statusMap[status] || status;
  };

  // Использует централизованные цвета из badge-colors.ts
  const getInternshipStatusColor = (status: InternshipStatus | ApplicationStatus) => {
    return getStatusBadgeColor(status);
  };

  const handleApproveInternshipApplication = useCallback((applicationId: string) => {
    const app = internshipApplications.find(a => a.id === applicationId);
    if (!app) return;
    
    const check = canChangeApplicationStatus(app.status, 'approved', app);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    
    setInternshipApplications(prev => prev.map(a => 
      a.id === applicationId
        ? { 
            ...a, 
            status: 'approved' as ApplicationStatus,
            reviewedAt: new Date(),
            reviewerId: 'user-1',
            reviewerName: 'HR Менеджер',
          }
        : a
    ));
  }, [internshipApplications]);

  const handleRejectInternshipApplication = useCallback((applicationId: string, reason: string) => {
    const app = internshipApplications.find(a => a.id === applicationId);
    if (!app) return;
    
    const check = canChangeApplicationStatus(app.status, 'rejected', app);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    
    setInternshipApplications(prev => prev.map(a => 
      a.id === applicationId
        ? { 
            ...a, 
            status: 'rejected' as ApplicationStatus,
            reviewedAt: new Date(),
            reviewerId: 'user-1',
            reviewerName: 'HR Менеджер',
            rejectionReason: reason,
          }
        : a
    ));
  }, [internshipApplications]);

  const handleConfirmInternshipApplication = useCallback((applicationId: string) => {
    const app = internshipApplications.find(a => a.id === applicationId);
    if (!app) return;
    
    const check = canChangeApplicationStatus(app.status, 'confirmed', app);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    
    setInternshipApplications(prev => prev.map(a => 
      a.id === applicationId
        ? { 
            ...a, 
            status: 'confirmed' as ApplicationStatus,
            confirmedAt: new Date(),
          }
        : a
    ));
  }, [internshipApplications]);

  const handleSaveInternshipEvaluation = useCallback((evaluationData: Omit<InternshipEvaluation, 'id' | 'evaluationDate'>) => {
    const newEvaluation: InternshipEvaluation = {
      ...evaluationData,
      id: `eval-${Date.now()}`,
      evaluationDate: new Date(),
      internshipId: selectedInternship?.id || '',
      studentId: internshipApplications.find(a => a.id === evaluationData.applicationId)?.studentId || '',
    };
    
    setEvaluations(prev => {
      const existing = prev.findIndex(e => 
        e.applicationId === evaluationData.applicationId && 
        e.period === evaluationData.period
      );
      if (existing >= 0) {
        return prev.map((e, idx) => idx === existing ? newEvaluation : e);
      }
      return [...prev, newEvaluation];
    });
    
    if (evaluationData.period === 'final') {
      setInternshipApplications(prev => prev.map(a => 
        a.id === evaluationData.applicationId
          ? { ...a, finalRating: evaluationData.overallRating }
          : a
      ));
    }
  }, [selectedInternship, internshipApplications]);

  if (!selectedInternship) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium mb-2">Стажировка не найдена</p>
        <Button onClick={() => router.push('/services/universities')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к списку стажировок
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/services/universities?tab=internships')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedInternship.title}</h1>
            <p className="text-muted-foreground">
              {selectedInternship.universityName} • {selectedInternship.startDate.toLocaleDateString('ru-RU')} - {selectedInternship.endDate.toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInternshipStatisticsDialogOpen(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Статистика
          </Button>
          <Badge variant="outline" className={cn(getInternshipStatusColor(selectedInternship.status))}>
            {getInternshipStatusText(selectedInternship.status)}
          </Badge>
        </div>
      </div>

      {/* Табы */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="info">
            Информация о стажировке
          </TabsTrigger>
          <TabsTrigger value="students">
            Студенты ({currentInternshipApplications.filter(a => ['confirmed', 'active', 'completed'].includes(a.status)).length})
          </TabsTrigger>
          <TabsTrigger value="dashboard">Дэшборд</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-4 space-y-4">
          {/* Информация о стажировке */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Описание</Label>
                  <p className="text-sm">{selectedInternship.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Формат</Label>
                  <p className="text-sm">
                    {selectedInternship.location === 'remote' ? 'Удаленно' : 
                     selectedInternship.location === 'office' ? 'Офис' : 'Гибридно'}
                  </p>
                </div>
                {selectedInternship.city && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Город</Label>
                    <p className="text-sm">{selectedInternship.city}</p>
                  </div>
                )}
                {selectedInternship.salary && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Зарплата</Label>
                    <p className="text-sm">{selectedInternship.salary.toLocaleString('ru-RU')} ₽</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Участники</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Текущее количество</span>
                    <span className="font-medium">{selectedInternship.currentParticipants} / {selectedInternship.maxParticipants}</span>
                  </div>
                  <Progress 
                    value={(selectedInternship.currentParticipants / selectedInternship.maxParticipants) * 100} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Заявки */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Заявки</h3>
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                На рассмотрении: {currentInternshipApplications.filter(a => a.status === 'pending').length}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                Одобрено: {currentInternshipApplications.filter(a => a.status === 'approved').length}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                Подтверждено: {currentInternshipApplications.filter(a => a.status === 'confirmed').length}
              </Badge>
            </div>
          </div>
          
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold text-base text-foreground">Студент</TableHead>
                  <TableHead className="font-bold text-base text-foreground">ВУЗ</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Курс</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Релевантность</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Статус</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Дата подачи</TableHead>
                  <TableHead className="text-right font-bold text-base text-foreground">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInternshipApplications
                  .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                  .map((application) => {
                    const student = internshipStudents.find(s => s.id === application.studentId);
                    return (
                      <TableRow key={application.id}>
                        <TableCell className="break-words whitespace-normal">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                {application.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium break-words">{application.studentName}</div>
                              <div className="text-xs text-muted-foreground break-words">{application.studentEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">{application.universityName}</TableCell>
                        <TableCell className="break-words whitespace-normal">{application.course} курс</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={application.matchScore || 0} className="w-20 h-2" />
                            <span className="text-sm font-medium">{application.matchScore || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">
                          <Badge variant="outline" className={cn(getInternshipStatusColor(application.status), "whitespace-nowrap")}>
                            {getInternshipStatusText(application.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">
                          {application.appliedAt.toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInternshipApplication(application);
                                setIsInternshipApplicationDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApproveInternshipApplication(application.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    const reason = prompt('Причина отклонения:');
                                    if (reason) {
                                      handleRejectInternshipApplication(application.id, reason);
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {application.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmInternshipApplication(application.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {(application.status === 'active' || application.status === 'confirmed') && selectedInternship?.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEvaluationApplicationId(application.id);
                                  setIsEvaluationDialogOpen(true);
                                }}
                                title="Оценить студента"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                Подтверждено: {currentInternshipApplications.filter(a => a.status === 'confirmed').length}
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">
                Активно: {currentInternshipApplications.filter(a => a.status === 'active').length}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                Завершено: {currentInternshipApplications.filter(a => a.status === 'completed').length}
              </Badge>
            </div>
          </div>
          
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold text-base text-foreground">Студент</TableHead>
                  <TableHead className="font-bold text-base text-foreground">ВУЗ</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Курс</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Средний балл</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Релевантность</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Статус</TableHead>
                  <TableHead className="font-bold text-base text-foreground">Дата подтверждения</TableHead>
                  <TableHead className="text-right font-bold text-base text-foreground">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInternshipApplications
                  .filter(a => ['confirmed', 'active', 'completed'].includes(a.status))
                  .sort((a, b) => {
                    const statusOrder = { 'active': 0, 'confirmed': 1, 'completed': 2 };
                    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
                  })
                  .map((application) => {
                    const student = internshipStudents.find(s => s.id === application.studentId);
                    return (
                      <TableRow key={application.id}>
                        <TableCell className="break-words whitespace-normal">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                {application.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium break-words">{application.studentName}</div>
                              <div className="text-xs text-muted-foreground break-words">{application.studentEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">{application.universityName}</TableCell>
                        <TableCell className="break-words whitespace-normal">{application.course} курс</TableCell>
                        <TableCell className="break-words whitespace-normal">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{application.gpa}</span>
                          </div>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">
                          <div className="flex items-center gap-2">
                            <Progress value={application.matchScore || 0} className="w-20 h-2" />
                            <span className="text-sm font-medium">{application.matchScore || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">
                          <Badge variant="outline" className={cn(getInternshipStatusColor(application.status), "whitespace-nowrap")}>
                            {application.status === 'confirmed' ? 'Подтверждено' :
                             application.status === 'active' ? 'Активно' :
                             application.status === 'completed' ? 'Завершено' : application.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">
                          {application.confirmedAt 
                            ? application.confirmedAt.toLocaleDateString('ru-RU')
                            : application.appliedAt.toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInternshipApplication(application);
                                setIsInternshipApplicationDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(application.status === 'active' || application.status === 'confirmed') && selectedInternship?.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEvaluationApplicationId(application.id);
                                  setIsEvaluationDialogOpen(true);
                                }}
                                title="Оценить студента"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {currentInternshipApplications.filter(a => ['confirmed', 'active', 'completed'].includes(a.status)).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Нет студентов, участвующих в стажировке
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          {internshipStatistics && (
            <div className="space-y-6">
              {/* Основные метрики */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.totalApplications}</div>
                    <p className="text-xs text-muted-foreground mt-1">Всего заявок</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.pendingApplications}</div>
                    <p className="text-xs text-muted-foreground mt-1">На рассмотрении</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.approvedApplications}</div>
                    <p className="text-xs text-muted-foreground mt-1">Одобрено</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.confirmedApplications}</div>
                    <p className="text-xs text-muted-foreground mt-1">Подтверждено</p>
                  </CardContent>
                </Card>
              </div>

              {/* Дополнительные метрики */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.activeStudents}</div>
                    <p className="text-xs text-muted-foreground mt-1">Активных студентов</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.completedStudents}</div>
                    <p className="text-xs text-muted-foreground mt-1">Завершивших</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{internshipStatistics.averageMatchScore}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Средняя релевантность</p>
                  </CardContent>
                </Card>
              </div>

              {/* Конверсия */}
              {internshipStatistics.conversionRate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Конверсия</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Заявки → Одобрено</span>
                          <span className="font-medium">{internshipStatistics.conversionRate.applicationsToApproved}%</span>
                        </div>
                        <Progress value={internshipStatistics.conversionRate.applicationsToApproved} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Одобрено → Подтверждено</span>
                          <span className="font-medium">{internshipStatistics.conversionRate.approvedToConfirmed}%</span>
                        </div>
                        <Progress value={internshipStatistics.conversionRate.approvedToConfirmed} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Подтверждено → Завершено</span>
                          <span className="font-medium">{internshipStatistics.conversionRate.confirmedToCompleted}%</span>
                        </div>
                        <Progress value={internshipStatistics.conversionRate.confirmedToCompleted} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Топ ВУЗы */}
              {internshipStatistics.topUniversities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Топ ВУЗы по заявкам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {internshipStatistics.topUniversities.map((univ, index) => (
                        <div key={univ.universityId} className="flex items-center justify-between">
                          <span className="text-sm">{index + 1}. {univ.universityName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{univ.applicationsCount}</span>
                            <span className="text-xs text-muted-foreground">заявок</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог деталей заявки стажировки */}
      <Dialog open={isInternshipApplicationDialogOpen} onOpenChange={setIsInternshipApplicationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заявка студента</DialogTitle>
            <DialogDescription>
              {selectedInternshipApplication?.studentName} • {selectedInternshipApplication?.universityName}
            </DialogDescription>
          </DialogHeader>
          {selectedInternshipApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Курс</Label>
                  <p className="text-sm font-medium">{selectedInternshipApplication.course} курс</p>
                </div>
                {selectedInternshipApplication.gpa && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Средний балл</Label>
                    <p className="text-sm font-medium">{selectedInternshipApplication.gpa}</p>
                  </div>
                )}
              </div>
              {selectedInternshipApplication.matchScore !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Релевантность</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedInternshipApplication.matchScore} className="flex-1" />
                    <span className="text-sm font-medium">{selectedInternshipApplication.matchScore}%</span>
                  </div>
                </div>
              )}
              {selectedInternshipApplication.motivationLetter && (
                <div>
                  <Label className="text-xs text-muted-foreground">Мотивационное письмо</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {selectedInternshipApplication.motivationLetter}
                  </p>
                </div>
              )}
              {selectedInternshipApplication.rejectionReason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Причина отклонения</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-300">
                    {selectedInternshipApplication.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInternshipApplicationDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог оценки студента */}
      {evaluationApplicationId && (
        <EvaluationDialog
          open={isEvaluationDialogOpen}
          onOpenChange={setIsEvaluationDialogOpen}
          applicationId={evaluationApplicationId}
          application={internshipApplications.find(a => a.id === evaluationApplicationId)}
          onSave={handleSaveInternshipEvaluation}
        />
      )}
    </div>
  );
}
