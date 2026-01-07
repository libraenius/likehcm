/**
 * Хук для выполнения миграции данных при загрузке приложения
 * 
 * Выполняет миграцию данных один раз при монтировании компонента.
 * Не возвращает значение, так как миграция выполняется синхронно.
 */
import { useEffect } from "react";
import { migrateData } from "@/lib/storage";

export function useDataMigration(): void {
  useEffect(() => {
    const migration = migrateData();
    if (migration.migrated && process.env.NODE_ENV === "development") {
      console.log("Data migration completed successfully");
    }
  }, []);
}
