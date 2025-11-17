"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Upload, FileText, AlertCircle } from "lucide-react";
import { exportAppData, importAppData } from "@/lib/storage";
import { useToast } from "@/contexts/toast-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Компонент для экспорта и импорта данных приложения
 */
export function DataExportImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const handleExport = () => {
    const data = exportAppData();
    if (!data) {
      showError("Не удалось экспортировать данные");
      return;
    }

    // Создаем blob и скачиваем файл
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillmap-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    success("Данные успешно экспортированы");
    setIsOpen(false);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setImportError("Введите данные для импорта");
      return;
    }

    setImportError(null);
    const result = importAppData(importText);

    if (result.success) {
      success("Данные успешно импортированы. Обновите страницу для применения изменений.");
      setImportText("");
      setIsOpen(false);
      // Обновляем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      const errorMessage =
        result.errors.length > 0
          ? result.errors.join(", ")
          : "Ошибка при импорте данных";
      setImportError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportText(text);
      setImportError(null);
    };
    reader.onerror = () => {
      setImportError("Ошибка при чтении файла");
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Экспорт/Импорт
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Экспорт и импорт данных</DialogTitle>
          <DialogDescription>
            Экспортируйте все данные приложения в JSON файл или импортируйте данные из файла.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Экспорт */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Экспорт данных</h3>
            <p className="text-sm text-muted-foreground">
              Скачайте все данные приложения в виде JSON файла для резервного копирования.
            </p>
            <Button onClick={handleExport} variant="default" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Экспортировать данные
            </Button>
          </div>

          <div className="border-t pt-4" />

          {/* Импорт */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Импорт данных</h3>
            <p className="text-sm text-muted-foreground">
              Импортируйте данные из JSON файла. Внимание: это заменит все текущие данные!
            </p>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" type="button" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Выбрать файл
                    </span>
                  </Button>
                </label>
              </div>

              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                placeholder="Вставьте JSON данные или выберите файл..."
                className="w-full min-h-[200px] p-3 border rounded-md font-mono text-sm"
              />

              {importError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ошибка импорта</AlertTitle>
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleImport} disabled={!importText.trim()}>
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

