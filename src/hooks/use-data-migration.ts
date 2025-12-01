/**
 * Хук для выполнения миграции данных при загрузке приложения
 * 
 * @returns {boolean} true если миграция была выполнена успешно
 */
import { useEffect, useState } from "react";
import { migrateData } from "@/lib/storage";

export function useDataMigration(): boolean {
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const migration = migrateData();
    if (migration.migrated) {
      setMigrated(true);
      if (process.env.NODE_ENV === "development") {
        console.log("Data migration completed successfully");
      }
    }
  }, []);

  return migrated;
}
