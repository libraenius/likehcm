/**
 * Компонент карточки преемника
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReadinessIndicator } from "./readiness-indicator";
import type { Successor } from "@/types/succession";
import { Edit, Trash2, FileText, Calendar } from "lucide-react";
// Простая функция форматирования даты
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

interface SuccessorCardProps {
  successor: Successor;
  positionTitle?: string;
  onEdit?: (successor: Successor) => void;
  onDelete?: (successorId: string) => void;
  onViewPlan?: (successorId: string) => void;
}

const statusLabels: Record<string, string> = {
  identified: "Выявлен",
  developing: "В развитии",
  ready: "Готов",
  not_ready: "Не готов",
};

const statusColors: Record<string, string> = {
  identified: "bg-blue-50 text-blue-700 border-blue-200",
  developing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ready: "bg-green-50 text-green-700 border-green-200",
  not_ready: "bg-red-50 text-red-700 border-red-200",
};

export function SuccessorCard({
  successor,
  positionTitle,
  onEdit,
  onDelete,
  onViewPlan,
}: SuccessorCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {getInitials(successor.employeeName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {successor.employeeName || "Неизвестно"}
              </CardTitle>
              <CardDescription className="text-sm truncate">
                {successor.employeePosition || positionTitle}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(successor)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(successor.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Статус */}
        <Badge
          variant="outline"
          className={statusColors[successor.status] || "bg-gray-50 text-gray-700"}
        >
          {statusLabels[successor.status] || successor.status}
        </Badge>

        {/* Индикатор готовности */}
        <ReadinessIndicator successor={successor} />

        {/* Ожидаемая дата готовности */}
        {successor.estimatedReadinessDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Готовность: {formatDate(successor.estimatedReadinessDate)}
            </span>
          </div>
        )}

        {/* План развития */}
        {onViewPlan && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onViewPlan(successor.id)}
          >
            <FileText className="h-4 w-4 mr-2" />
            План развития
          </Button>
        )}

        {/* Заметки */}
        {successor.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {successor.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

