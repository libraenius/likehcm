"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function GoalsKoldPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Целеполагание КОЛД</h1>
          <p className="text-muted-foreground">
            Управление целеполаганием для КОЛД (Колл-центр)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Целеполагание КОЛД
          </CardTitle>
          <CardDescription>
            Раздел находится в разработке
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал целеполагания для КОЛД будет добавлен в ближайшее время.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

