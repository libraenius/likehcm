/**
 * Компонент для отображения индикатора готовности преемника
 */

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getReadinessColor, getReadinessLabel } from "@/lib/succession/calculations";
import type { Successor } from "@/types/succession";

interface ReadinessIndicatorProps {
  successor: Successor;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ReadinessIndicator({
  successor,
  showPercentage = true,
  showLabel = true,
  size = "md",
}: ReadinessIndicatorProps) {
  const colorClass = getReadinessColor(successor.readinessLevel);
  const label = getReadinessLabel(successor.readinessLevel);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`${colorClass} ${sizeClasses[size]}`}>
          {showLabel && <span className="mr-1">{label}</span>}
          {showPercentage && (
            <span className="font-semibold">{successor.readinessPercentage}%</span>
          )}
        </Badge>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((level) => {
            const isActive = level <= successor.readinessLevel;
            const colorMap: Record<number, string> = {
              5: "bg-green-500",
              4: "bg-blue-500",
              3: "bg-yellow-500",
              2: "bg-orange-500",
              1: "bg-red-500",
            };
            return (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  isActive
                    ? colorMap[successor.readinessLevel] || "bg-gray-500"
                    : "bg-muted"
                }`}
              />
            );
          })}
        </div>
      </div>
      <Progress
        value={successor.readinessPercentage}
        className="h-2"
      />
    </div>
  );
}

