/**
 * Компонент карточки ключевой позиции
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  getRiskColor, 
  getRiskLabel, 
  getCriticalityColor, 
  getCriticalityLabel 
} from "@/lib/succession/calculations";
import type { KeyPosition, Successor } from "@/types/succession";
import { AlertCircle, Users, Edit, Trash2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyPositionCardProps {
  position: KeyPosition;
  successors: Successor[];
  onEdit?: (position: KeyPosition) => void;
  onDelete?: (positionId: string) => void;
  onAddSuccessor?: (positionId: string) => void;
  onViewDetails?: (position: KeyPosition) => void;
}

export function KeyPositionCard({
  position,
  successors,
  onEdit,
  onDelete,
  onAddSuccessor,
  onViewDetails,
}: KeyPositionCardProps) {
  const riskColor = getRiskColor(position.riskLevel);
  const criticalityColor = getCriticalityColor(position.criticality);
  
  const bestSuccessor = successors.length > 0
    ? successors.reduce((best, current) => 
        current.readinessLevel > best.readinessLevel ? current : best
      )
    : null;

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
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1">
              {position.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {position.departmentName || position.departmentId}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(position)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(position.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Текущий держатель */}
        {position.currentHolderName && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(position.currentHolderName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {position.currentHolderName}
              </p>
              <p className="text-xs text-muted-foreground">Текущий держатель</p>
            </div>
          </div>
        )}

        {/* Критичность и риск */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={criticalityColor}>
            {getCriticalityLabel(position.criticality)}
          </Badge>
          <Badge variant="outline" className={riskColor}>
            <AlertCircle className="h-3 w-3 mr-1" />
            Риск: {getRiskLabel(position.riskLevel)}
          </Badge>
        </div>

        {/* Преемники */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Преемники: {successors.length}</span>
            </div>
            {onAddSuccessor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSuccessor(position.id)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            )}
          </div>

          {successors.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Преемники не назначены
            </p>
          ) : (
            <div className="space-y-2">
              {bestSuccessor && (
                <div className="p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {bestSuccessor.employeeName || "Преемник"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {bestSuccessor.readinessPercentage}%
                    </Badge>
                  </div>
                  <Progress
                    value={bestSuccessor.readinessPercentage}
                    className="h-1.5"
                  />
                </div>
              )}
              {successors.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  +{successors.length - 1} еще
                </p>
              )}
            </div>
          )}
        </div>

        {/* Профиль */}
        {position.profileName && (
          <div className="text-xs text-muted-foreground">
            Профиль: {position.profileName}
          </div>
        )}

        {/* Кнопка просмотра деталей */}
        {onViewDetails && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onViewDetails(position)}
          >
            Подробнее
          </Button>
        )}
      </CardContent>
    </Card>
  );
}






