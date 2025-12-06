"use client";

import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Building2, Search, X, ArrowUp, ArrowDown, ChevronLeft, ChevronsLeft, ChevronsRight, ChevronRight } from "lucide-react";
import type { MeasurementUnit, Formula, Stream } from "@/types/goals-kold";
import { mockMeasurementUnits, mockFormulas, mockStreams } from "./mock-data";

type ReferenceType = "units" | "formulas" | "streams";

export default function GoalsKoldReferencePage() {
  const [selectedType, setSelectedType] = useState<ReferenceType>("units");
  
  // Единицы измерения
  const [units, setUnits] = useState<MeasurementUnit[]>(mockMeasurementUnits);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);
  const [unitFormData, setUnitFormData] = useState({ name: "", abbreviation: "", description: "" });
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [unitSortOrder, setUnitSortOrder] = useState<"asc" | "desc">("asc");
  const [unitCurrentPage, setUnitCurrentPage] = useState(1);
  const [unitItemsPerPage, setUnitItemsPerPage] = useState(10);

  // Формулы
  const [formulas, setFormulas] = useState<Formula[]>(mockFormulas);
  const [formulaDialogOpen, setFormulaDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [formulaFormData, setFormulaFormData] = useState({ name: "", formula: "", description: "" });
  const [formulaSearchQuery, setFormulaSearchQuery] = useState("");
  const [formulaSortOrder, setFormulaSortOrder] = useState<"asc" | "desc">("asc");
  const [formulaCurrentPage, setFormulaCurrentPage] = useState(1);
  const [formulaItemsPerPage, setFormulaItemsPerPage] = useState(10);

  // Стримы
  const [streams, setStreams] = useState<Stream[]>(mockStreams);
  const [streamSearchQuery, setStreamSearchQuery] = useState("");
  const [streamSortOrder, setStreamSortOrder] = useState<"asc" | "desc">("asc");
  const [streamCurrentPage, setStreamCurrentPage] = useState(1);
  const [streamItemsPerPage, setStreamItemsPerPage] = useState(10);

  // Удаление
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: ReferenceType; id: string } | null>(null);

  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === "units") {
      setUnits(units.filter(u => u.id !== itemToDelete.id));
    } else if (itemToDelete.type === "formulas") {
      setFormulas(formulas.filter(f => f.id !== itemToDelete.id));
    } else if (itemToDelete.type === "streams") {
      setStreams(streams.filter(s => s.id !== itemToDelete.id));
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Целеполагание</h1>
        <p className="text-muted-foreground">
          Справочник единиц измерения, формул и стримов
        </p>
      </div>

      {/* Выпадающий список для выбора типа справочника */}
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium whitespace-nowrap">Тип справочника:</Label>
        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ReferenceType)}>
          <SelectTrigger className="w-[280px] h-11 border-2 border-border bg-background shadow-sm hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
            <SelectValue placeholder="Выберите тип справочника" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="units">Единицы измерения</SelectItem>
            <SelectItem value="formulas">Формулы</SelectItem>
            <SelectItem value="streams">Стримы</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Контент в зависимости от выбранного типа */}
      {selectedType === "units" && (
        <UnitsSection
          units={units}
          setUnits={setUnits}
          unitDialogOpen={unitDialogOpen}
          setUnitDialogOpen={setUnitDialogOpen}
          editingUnit={editingUnit}
          setEditingUnit={setEditingUnit}
          unitFormData={unitFormData}
          setUnitFormData={setUnitFormData}
          unitSearchQuery={unitSearchQuery}
          setUnitSearchQuery={setUnitSearchQuery}
          unitSortOrder={unitSortOrder}
          setUnitSortOrder={setUnitSortOrder}
          unitCurrentPage={unitCurrentPage}
          setUnitCurrentPage={setUnitCurrentPage}
          unitItemsPerPage={unitItemsPerPage}
          setUnitItemsPerPage={setUnitItemsPerPage}
          onDelete={(id: string) => {
            setItemToDelete({ type: "units", id });
            setDeleteDialogOpen(true);
          }}
        />
      )}

      {selectedType === "formulas" && (
        <FormulasSection
          formulas={formulas}
          setFormulas={setFormulas}
          formulaDialogOpen={formulaDialogOpen}
          setFormulaDialogOpen={setFormulaDialogOpen}
          editingFormula={editingFormula}
          setEditingFormula={setEditingFormula}
          formulaFormData={formulaFormData}
          setFormulaFormData={setFormulaFormData}
          formulaSearchQuery={formulaSearchQuery}
          setFormulaSearchQuery={setFormulaSearchQuery}
          formulaSortOrder={formulaSortOrder}
          setFormulaSortOrder={setFormulaSortOrder}
          formulaCurrentPage={formulaCurrentPage}
          setFormulaCurrentPage={setFormulaCurrentPage}
          formulaItemsPerPage={formulaItemsPerPage}
          setFormulaItemsPerPage={setFormulaItemsPerPage}
          onDelete={(id: string) => {
            setItemToDelete({ type: "formulas", id });
            setDeleteDialogOpen(true);
          }}
        />
      )}

      {selectedType === "streams" && (
        <StreamsSection
          streams={streams}
          streamSearchQuery={streamSearchQuery}
          setStreamSearchQuery={setStreamSearchQuery}
          streamSortOrder={streamSortOrder}
          setStreamSortOrder={setStreamSortOrder}
          streamCurrentPage={streamCurrentPage}
          setStreamCurrentPage={setStreamCurrentPage}
          streamItemsPerPage={streamItemsPerPage}
          setStreamItemsPerPage={setStreamItemsPerPage}
          onDelete={(id) => {
            setItemToDelete({ type: "streams", id });
            setDeleteDialogOpen(true);
          }}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Компонент для секции единиц измерения будет добавлен в следующем сообщении
function UnitsSection({ /* параметры */ }: any) {
  return <div>Единицы измерения - в разработке</div>;
}

function FormulasSection({ /* параметры */ }: any) {
  return <div>Формулы - в разработке</div>;
}

interface StreamsSectionProps {
  streams: Stream[];
  streamSearchQuery: string;
  setStreamSearchQuery: (query: string) => void;
  streamSortOrder: "asc" | "desc";
  setStreamSortOrder: (order: "asc" | "desc") => void;
  streamCurrentPage: number;
  setStreamCurrentPage: (page: number) => void;
  streamItemsPerPage: number;
  setStreamItemsPerPage: (items: number) => void;
  onDelete: (id: string) => void;
}

function StreamsSection({
  streams,
  streamSearchQuery,
  setStreamSearchQuery,
  streamSortOrder,
  setStreamSortOrder,
  streamCurrentPage,
  setStreamCurrentPage,
  streamItemsPerPage,
  setStreamItemsPerPage,
  onDelete,
}: StreamsSectionProps) {
  // Фильтрация и сортировка стримов
  const filteredAndSortedStreams = useMemo(() => {
    let filtered = streams;

    // Поиск
    if (streamSearchQuery.trim()) {
      const query = streamSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (stream) =>
          stream.name.toLowerCase().includes(query) ||
          stream.description?.toLowerCase().includes(query) ||
          stream.type?.toLowerCase().includes(query) ||
          stream.businessType?.toLowerCase().includes(query)
      );
    }

    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, "ru");
      return streamSortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [streams, streamSearchQuery, streamSortOrder]);

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedStreams.length / streamItemsPerPage);
  const paginatedStreams = useMemo(() => {
    const startIndex = (streamCurrentPage - 1) * streamItemsPerPage;
    return filteredAndSortedStreams.slice(startIndex, startIndex + streamItemsPerPage);
  }, [filteredAndSortedStreams, streamCurrentPage, streamItemsPerPage]);

  const handleSort = () => {
    setStreamSortOrder(streamSortOrder === "asc" ? "desc" : "asc");
    setStreamCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию, описанию, типу или виду..."
          value={streamSearchQuery}
          onChange={(e) => {
            setStreamSearchQuery(e.target.value);
            setStreamCurrentPage(1);
          }}
          className="pl-10 pr-10"
        />
        {streamSearchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setStreamSearchQuery("");
              setStreamCurrentPage(1);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Таблица стримов */}
      <Card>
        <CardHeader>
          <CardTitle>Стримы</CardTitle>
          <CardDescription>
            Справочник стримов ({filteredAndSortedStreams.length} из {streams.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedStreams.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {streamSearchQuery ? "Стримы не найдены" : "Нет стримов"}
              </h3>
              <p className="text-muted-foreground">
                {streamSearchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "Стримы будут отображаться здесь"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 -ml-3 hover:bg-transparent"
                          onClick={handleSort}
                        >
                          Название
                          {streamSortOrder === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Вид</TableHead>
                      <TableHead>Тип бизнеса</TableHead>
                      <TableHead className="w-[100px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStreams.map((stream) => (
                      <TableRow key={stream.id}>
                        <TableCell className="font-medium">{stream.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {stream.description || "—"}
                        </TableCell>
                        <TableCell>
                          {stream.type ? (
                            <Badge variant="outline">{stream.type}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {stream.businessType ? (
                            <Badge variant="outline">{stream.businessType}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(stream.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Строк на странице:</Label>
                    <Select
                      value={streamItemsPerPage.toString()}
                      onValueChange={(value) => {
                        setStreamItemsPerPage(Number(value));
                        setStreamCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[80px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Страница {streamCurrentPage} из {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setStreamCurrentPage(1)}
                        disabled={streamCurrentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setStreamCurrentPage(streamCurrentPage - 1)}
                        disabled={streamCurrentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setStreamCurrentPage(streamCurrentPage + 1)}
                        disabled={streamCurrentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setStreamCurrentPage(totalPages)}
                        disabled={streamCurrentPage === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

