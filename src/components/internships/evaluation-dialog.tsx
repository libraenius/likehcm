"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { InternshipEvaluation } from "@/types/internships";

interface EvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  studentName: string;
  internshipTitle: string;
  onSubmit: (evaluation: Omit<InternshipEvaluation, 'id' | 'evaluationDate'>) => void;
  existingEvaluation?: InternshipEvaluation;
}

export function EvaluationDialog({
  open,
  onOpenChange,
  applicationId,
  studentName,
  internshipTitle,
  onSubmit,
  existingEvaluation,
}: EvaluationDialogProps) {
  const [formData, setFormData] = useState({
    period: existingEvaluation?.period || ('weekly' as 'weekly' | 'bi-weekly' | 'monthly' | 'final'),
    technicalSkills: existingEvaluation?.technicalSkills || 3,
    communication: existingEvaluation?.communication || 3,
    initiative: existingEvaluation?.initiative || 3,
    teamwork: existingEvaluation?.teamwork || 3,
    overallRating: existingEvaluation?.overallRating || 3,
    comments: existingEvaluation?.comments || '',
    recommendations: existingEvaluation?.recommendations || '',
  });

  const handleSubmit = () => {
    onSubmit({
      applicationId,
      internshipId: '',
      studentId: '',
      evaluatorId: 'user-1',
      evaluatorName: 'Наставник',
      period: formData.period,
      technicalSkills: formData.technicalSkills,
      communication: formData.communication,
      initiative: formData.initiative,
      teamwork: formData.teamwork,
      overallRating: formData.overallRating,
      comments: formData.comments,
      recommendations: formData.recommendations,
    });
    onOpenChange(false);
  };

  const RatingSelector = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm">{label}</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className={`
                p-2 rounded-md transition-colors
                ${value >= rating 
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              <Star className={`h-5 w-5 ${value >= rating ? 'fill-current' : ''}`} />
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">{value}/5</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Оценка студента</DialogTitle>
          <DialogDescription>
            {studentName} • {internshipTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Период оценки</Label>
            <Select 
              value={formData.period} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, period: v as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Еженедельная</SelectItem>
                <SelectItem value="bi-weekly">Раз в две недели</SelectItem>
                <SelectItem value="monthly">Ежемесячная</SelectItem>
                <SelectItem value="final">Финальная</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <RatingSelector
              label="Технические навыки"
              value={formData.technicalSkills}
              onChange={(v) => setFormData(prev => ({ ...prev, technicalSkills: v }))}
            />
            <RatingSelector
              label="Коммуникация"
              value={formData.communication}
              onChange={(v) => setFormData(prev => ({ ...prev, communication: v }))}
            />
            <RatingSelector
              label="Инициативность"
              value={formData.initiative}
              onChange={(v) => setFormData(prev => ({ ...prev, initiative: v }))}
            />
            <RatingSelector
              label="Работа в команде"
              value={formData.teamwork}
              onChange={(v) => setFormData(prev => ({ ...prev, teamwork: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Общая оценка</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, overallRating: rating }))}
                  className={`
                    p-3 rounded-md transition-colors
                    ${formData.overallRating >= rating 
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  <Star className={`h-6 w-6 ${formData.overallRating >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="text-lg font-medium ml-4">{formData.overallRating}/5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Комментарии</Label>
            <Textarea
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Опишите работу студента, его сильные стороны и области для улучшения..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Рекомендации</Label>
            <Textarea
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Рекомендации для дальнейшего развития или трудоустройства..."
              rows={3}
            />
          </div>

          {existingEvaluation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Предыдущая оценка</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Дата:</span>
                    <span>{existingEvaluation.evaluationDate.toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Общая оценка:</span>
                    <Badge>{existingEvaluation.overallRating}/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            {existingEvaluation ? 'Обновить оценку' : 'Сохранить оценку'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
