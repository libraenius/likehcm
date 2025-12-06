"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    types: Array<"продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный">;
  };
  onFiltersChange: (filters: {
    types: Array<"продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный">;
  }) => void;
}

export function FilterDialog({ open, onOpenChange, filters, onFiltersChange }: FilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Фильтры
          {filters.types.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filters.types.length}
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
            <Label className="text-sm font-medium">Тип стрима</Label>
            <div className="space-y-1.5">
              {(["продуктовый", "канальный", "сегментный", "платформенный", "сервисный"] as const).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-type-${type}`}
                    checked={filters.types.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFiltersChange({
                          ...filters,
                          types: [...filters.types, type],
                        });
                      } else {
                        onFiltersChange({
                          ...filters,
                          types: filters.types.filter((t) => t !== type),
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
              onFiltersChange({ types: [] });
            }}
          >
            Сбросить
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

