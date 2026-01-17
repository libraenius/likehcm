"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCooperationLineBadgeColor } from "@/lib/badge-colors";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  Search, 
  Filter,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  FileCheck,
  Calendar,
  Users,
  Building2,
  Briefcase,
  Upload,
  X,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight
} from "lucide-react";

// Типы
interface Contract {
  id: string;
  type: "cooperation" | "scholarship" | "internship" | "bankDepartment";
  hasContract: boolean;
  number?: string;
  date?: string;
  period?: { start: string; end: string };
  contractBranch?: string;
  asddLink?: string;
}

interface Event {
  id: string;
  type: "careerDays" | "expertParticipation" | "caseChampionships" | "meeting" | "communication";
  date: string;
  endDate: string;
  status: "planned" | "in_progress" | "completed";
  responsiblePerson: string[];
  comments?: string;
}

interface Intern {
  id: string;
  employeeName: string;
  age: number;
  position: string;
  department: string;
  hireDate: string;
  status: "active" | "dismissed";
  dismissalDate?: string;
}

interface Practitioner {
  id: string;
  employeeName: string;
  age: number;
  position: string;
  department: string;
  practiceStartDate: string;
  practiceEndDate: string;
  practiceSupervisor?: string;
  practiceStatus?: "not_meets" | "meets" | "exceeds";
}

interface CaseChampionshipParticipant {
  id: string;
  employeeName: string;
  eventId: string;
  status: "registered" | "participated" | "winner" | "prize_winner";
}

interface CooperationLineRecord {
  id: string;
  line: "drp" | "bko" | "cntr";
  year: number;
  responsible: string[];
}

interface BankDepartment {
  id: string;
  name: string;
}

interface CNTRProjectItem {
  id: string;
  projectName: string;
  date: string;
  branch?: string;
  fundingAmount?: number;
  supportFormat?: "grant-cofinancing" | "ordered-rd-center-lift" | "targeted-charity";
}

interface CNTRInfrastructureItem {
  id: string;
  developmentType: "financing" | "endowment" | "endowment-fund";
  date: string;
  branch?: string;
  description?: string;
}

interface CNTRAgreementItem {
  id: string;
  date: string;
  branch?: string;
  status?: "in-progress" | "signed";
}

interface BKOData {
  salaryProject?: {
    students?: boolean;
    employees?: boolean;
  };
  transactionalProducts?: {
    ie?: boolean;
    te?: boolean;
    sbp?: boolean;
    adm?: boolean;
  };
  limit?: boolean;
  ukGpbFundsCk?: boolean;
  comment?: string;
}

interface BranchCurator {
  id: string;
  city: string;
  branch: string;
  cooperationLines?: CooperationLineRecord[];
}

interface University {
  id: string;
  name: string;
  shortName?: string;
  inn?: string;
  city: string;
  branch?: string[];
  cooperationStartYear?: number;
  cooperationLines?: CooperationLineRecord[];
  initiatorBlock?: string;
  initiatorName?: string;
  branchCurators?: BranchCurator[];
  contracts?: Contract[];
  bankDepartments?: BankDepartment[];
  events?: Event[];
  allEmployees?: number;
  internList?: Intern[];
  practitionerList?: Practitioner[];
  caseChampionshipParticipants?: CaseChampionshipParticipant[];
  cntrProjects?: CNTRProjectItem[];
  cntrInfrastructure?: CNTRInfrastructureItem[];
  cntrAgreementItems?: CNTRAgreementItem[];
  bkoData?: BKOData;
}

interface UniversityReportingProps {
  universities: University[];
}

export function UniversityReporting({ universities }: UniversityReportingProps) {
  const [activeTab, setActiveTab] = useState("universities");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    cities: string[];
    lines: ("drp" | "bko" | "cntr")[];
  }>({
    cities: [],
    lines: [],
  });
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [contractsPage, setContractsPage] = useState(1);
  const [contractsItemsPerPage, setContractsItemsPerPage] = useState(10);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsItemsPerPage, setEventsItemsPerPage] = useState(10);
  const [internsPage, setInternsPage] = useState(1);
  const [internsItemsPerPage, setInternsItemsPerPage] = useState(10);
  const [practitionersPage, setPractitionersPage] = useState(1);
  const [practitionersItemsPerPage, setPractitionersItemsPerPage] = useState(10);
  const [cntrPage, setCntrPage] = useState(1);
  const [cntrItemsPerPage, setCntrItemsPerPage] = useState(10);
  const [bkoPage, setBkoPage] = useState(1);
  const [bkoItemsPerPage, setBkoItemsPerPage] = useState(10);

  // Фильтры для вкладок
  const [contractsFiltersDialogOpen, setContractsFiltersDialogOpen] = useState(false);
  const [contractsFilters, setContractsFilters] = useState<{
    types: string[];
    statuses: string[];
  }>({
    types: [],
    statuses: [],
  });

  const [eventsFiltersDialogOpen, setEventsFiltersDialogOpen] = useState(false);
  const [eventsFilters, setEventsFilters] = useState<{
    types: string[];
    statuses: string[];
  }>({
    types: [],
    statuses: [],
  });

  const [internsFiltersDialogOpen, setInternsFiltersDialogOpen] = useState(false);
  const [internsFilters, setInternsFilters] = useState<{
    statuses: string[];
  }>({
    statuses: [],
  });

  const [practitionersFiltersDialogOpen, setPractitionersFiltersDialogOpen] = useState(false);
  const [practitionersFilters, setPractitionersFilters] = useState<{
    statuses: string[];
  }>({
    statuses: [],
  });

  // Получение уникальных городов
  const uniqueCities = useMemo(() => {
    return [...new Set(universities.map(u => u.city))].sort();
  }, [universities]);

  // Фильтрация университетов
  const filteredUniversities = useMemo(() => {
    return universities.filter(u => {
      const matchesSearch = !searchQuery || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.shortName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCity = filters.cities.length === 0 || filters.cities.includes(u.city);
      
      const matchesLine = filters.lines.length === 0 || 
        u.cooperationLines?.some(cl => filters.lines.includes(cl.line));
      
      return matchesSearch && matchesCity && matchesLine;
    });
  }, [universities, searchQuery, filters]);

  const [contractsSearchQuery, setContractsSearchQuery] = useState("");
  const [eventsSearchQuery, setEventsSearchQuery] = useState("");
  const [internsSearchQuery, setInternsSearchQuery] = useState("");
  const [practitionersSearchQuery, setPractitionersSearchQuery] = useState("");
  
  // Все договоры
  const allContracts = useMemo(() => {
    const today = new Date();
    return universities.flatMap(u => 
      (u.contracts || []).map(c => {
        let status = "unknown";
        if (c.period?.end) {
          const endDate = new Date(c.period.end);
          const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry < 0) status = "expired";
          else if (daysUntilExpiry <= 90) status = "expiring";
          else status = "active";
        } else if (c.hasContract) {
          status = "active";
        }
        return { ...c, universityId: u.id, universityName: u.shortName || u.name, status };
      })
    ).filter(c => {
      const matchesSearch = !contractsSearchQuery || 
        c.universityName.toLowerCase().includes(contractsSearchQuery.toLowerCase()) ||
        c.number?.toLowerCase().includes(contractsSearchQuery.toLowerCase());
      const matchesType = contractsFilters.types.length === 0 || contractsFilters.types.includes(c.type);
      const matchesStatus = contractsFilters.statuses.length === 0 || contractsFilters.statuses.includes(c.status);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [universities, contractsFilters, contractsSearchQuery]);

  // Все мероприятия
  const allEvents = useMemo(() => {
    return universities.flatMap(u => 
      (u.events || []).map(e => ({
        ...e,
        universityId: u.id,
        universityName: u.shortName || u.name,
      }))
    ).filter(e => {
      const matchesSearch = !eventsSearchQuery || 
        e.universityName.toLowerCase().includes(eventsSearchQuery.toLowerCase()) ||
        e.comments?.toLowerCase().includes(eventsSearchQuery.toLowerCase());
      const matchesType = eventsFilters.types.length === 0 || eventsFilters.types.includes(e.type);
      const matchesStatus = eventsFilters.statuses.length === 0 || eventsFilters.statuses.includes(e.status);
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [universities, eventsFilters, eventsSearchQuery]);

  // Все стажеры
  const allInterns = useMemo(() => {
    return universities.flatMap(u => 
      (u.internList || []).map(i => ({
        ...i,
        universityId: u.id,
        universityName: u.shortName || u.name,
      }))
    ).filter(i => {
      const matchesSearch = !internsSearchQuery || 
        i.employeeName.toLowerCase().includes(internsSearchQuery.toLowerCase()) ||
        i.universityName.toLowerCase().includes(internsSearchQuery.toLowerCase());
      const matchesStatus = internsFilters.statuses.length === 0 || internsFilters.statuses.includes(i.status);
      return matchesSearch && matchesStatus;
    });
  }, [universities, internsFilters, internsSearchQuery]);

  // Все практиканты
  const allPractitioners = useMemo(() => {
    return universities.flatMap(u => 
      (u.practitionerList || []).map(p => ({
        ...p,
        universityId: u.id,
        universityName: u.shortName || u.name,
      }))
    ).filter(p => {
      const matchesSearch = !practitionersSearchQuery || 
        p.employeeName.toLowerCase().includes(practitionersSearchQuery.toLowerCase()) ||
        p.universityName.toLowerCase().includes(practitionersSearchQuery.toLowerCase());
      const matchesStatus = practitionersFilters.statuses.length === 0 || 
        (p.practiceStatus && practitionersFilters.statuses.includes(p.practiceStatus));
      return matchesSearch && matchesStatus;
    });
  }, [universities, practitionersFilters, practitionersSearchQuery]);

  // Все проекты ЦНТР
  const allCntrProjects = useMemo(() => {
    return universities.flatMap(u => 
      (u.cntrProjects || []).map(p => ({
        ...p,
        universityId: u.id,
        universityName: u.shortName || u.name,
      }))
    );
  }, [universities]);

  // BKO данные
  const bkoData = useMemo(() => {
    return universities.filter(u => u.bkoData).map(u => ({
      id: u.id,
      name: u.shortName || u.name,
      city: u.city,
      salaryStudents: u.bkoData?.salaryProject?.students || false,
      salaryEmployees: u.bkoData?.salaryProject?.employees || false,
      ie: u.bkoData?.transactionalProducts?.ie || false,
      te: u.bkoData?.transactionalProducts?.te || false,
      sbp: u.bkoData?.transactionalProducts?.sbp || false,
      adm: u.bkoData?.transactionalProducts?.adm || false,
      limit: u.bkoData?.limit || false,
      ukGpbFundsCk: u.bkoData?.ukGpbFundsCk || false,
      comment: u.bkoData?.comment,
    }));
  }, [universities]);

  const getContractTypeName = (type: string) => {
    const types: Record<string, string> = {
      cooperation: "Сотрудничество",
      scholarship: "Стипендия",
      internship: "Стажировка",
      bankDepartment: "Кафедра банка",
    };
    return types[type] || type;
  };

  const getEventTypeName = (type: string) => {
    const types: Record<string, string> = {
      careerDays: "Дни карьеры",
      expertParticipation: "Экспертное участие",
      caseChampionships: "Кейс-чемпионат",
      meeting: "Встреча",
      communication: "Коммуникация",
    };
    return types[type] || type;
  };

  const getEventStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      planned: "Запланировано",
      in_progress: "В процессе",
      completed: "Завершено",
    };
    return statuses[status] || status;
  };

  const getCooperationLineLabel = (line: "drp" | "bko" | "cntr"): string => {
    if (line === "drp") return "ДРП";
    if (line === "bko") return "БКО";
    if (line === "cntr") return "ЦНТР";
    return "";
  };

  const getPracticeStatusName = (status?: string) => {
    const statuses: Record<string, string> = {
      not_meets: "Не соответствует",
      meets: "Соответствует",
      exceeds: "Превосходит",
    };
    return status ? statuses[status] || status : "—";
  };

  const getSupportFormatName = (format?: string) => {
    const formats: Record<string, string> = {
      "grant-cofinancing": "Грант/софинансирование",
      "ordered-rd-center-lift": "Заказной НИОКР / Центр-лифт",
      "targeted-charity": "Целевая благотворительность",
    };
    return format ? formats[format] || format : "—";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  };

  // Функция экспорта (заглушка)
  const handleExport = (format: "xlsx" | "csv" | "pdf") => {
    alert(`Экспорт в ${format.toUpperCase()} будет реализован`);
  };

  return (
    <div className="space-y-6">
      {/* Вкладки отчетов */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Реестр ВУЗов
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Договоры
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Мероприятия
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Кадры
          </TabsTrigger>
          <TabsTrigger value="bko" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            БКО
          </TabsTrigger>
          <TabsTrigger value="cntr" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            ЦНТР
          </TabsTrigger>
        </TabsList>

        {/* Реестр ВУЗов */}
        <TabsContent value="universities" className="mt-4 space-y-4">
          {/* Поиск и кнопки действий */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт Excel
              </Button>
              <Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                    {(filters.cities.length > 0 || filters.lines.length > 0) && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.cities.length + filters.lines.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-3">
                    <DialogTitle className="text-lg">Фильтры</DialogTitle>
                    <DialogDescription>
                      Выберите фильтры для отображения ВУЗов
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {/* Фильтр по городам */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Город</Label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {uniqueCities.map((city) => (
                          <div key={city} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-city-${city}`}
                              checked={filters.cities.includes(city)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({
                                    ...filters,
                                    cities: [...filters.cities, city],
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    cities: filters.cities.filter((c) => c !== city),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-city-${city}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {city}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Фильтр по линиям сотрудничества */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Линии сотрудничества</Label>
                      <div className="space-y-1.5">
                        {[
                          { value: "drp" as const, label: "ДРП (Развитие персонала)" },
                          { value: "bko" as const, label: "БКО (Банковские продукты)" },
                          { value: "cntr" as const, label: "ЦНТР (Научно-техническое)" },
                        ].map((line) => (
                          <div key={line.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-line-${line.value}`}
                              checked={filters.lines.includes(line.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({
                                    ...filters,
                                    lines: [...filters.lines, line.value],
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    lines: filters.lines.filter((l) => l !== line.value),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-line-${line.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {line.label}
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
                        setFilters({
                          cities: [],
                          lines: [],
                        });
                        setCurrentPage(1);
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button size="sm" onClick={() => {
                      setFiltersDialogOpen(false);
                      setCurrentPage(1);
                    }}>
                      Применить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Активные фильтры */}
          {(() => {
            const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
            
            // Фильтр по городам
            filters.cities.forEach((city) => {
              activeFilters.push({
                label: `Город: ${city}`,
                onRemove: () => {
                  setFilters({
                    ...filters,
                    cities: filters.cities.filter((c) => c !== city),
                  });
                  setCurrentPage(1);
                },
              });
            });
            
            // Фильтр по линиям
            filters.lines.forEach((line) => {
              const lineLabels: Record<"drp" | "bko" | "cntr", string> = {
                drp: "ДРП",
                bko: "БКО",
                cntr: "ЦНТР",
              };
              activeFilters.push({
                label: `Линия: ${lineLabels[line]}`,
                onRemove: () => {
                  setFilters({
                    ...filters,
                    lines: filters.lines.filter((l) => l !== line),
                  });
                  setCurrentPage(1);
                },
              });
            });
            
            if (activeFilters.length === 0) return null;
            
            return (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-sm">{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.onRemove}
                      className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Удалить фильтр"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            );
          })()}

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Название</TableHead>
                  <TableHead className="w-[150px]">Краткое</TableHead>
                  <TableHead className="w-[120px]">ИНН</TableHead>
                  <TableHead className="w-[150px]">Город</TableHead>
                  <TableHead className="w-[120px]">Год начала</TableHead>
                  <TableHead className="w-[200px]">Линии</TableHead>
                  <TableHead className="w-[120px]">Сотрудников</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Логика пагинации
                  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  const paginatedUniversities = filteredUniversities.slice(startIndex, endIndex);
                  
                  if (paginatedUniversities.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Нет данных
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return paginatedUniversities.map(uni => (
                    <TableRow key={uni.id}>
                      <TableCell className="px-4 whitespace-normal">{uni.name}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{uni.shortName || "—"}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{uni.inn || "—"}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{uni.city}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{uni.cooperationStartYear || "—"}</TableCell>
                      <TableCell className="px-4 whitespace-normal">
                        <div className="flex items-center gap-1 flex-wrap">
                          {uni.cooperationLines?.map((cl, idx) => (
                            <Badge 
                              key={cl.id || idx} 
                              variant="outline" 
                              className={cn("text-xs", getCooperationLineBadgeColor(cl.line))}
                            >
                              {getCooperationLineLabel(cl.line)}
                            </Badge>
                          ))}
                          {(!uni.cooperationLines || uni.cooperationLines.length === 0) && "—"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal">{uni.allEmployees || "—"}</TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {(() => {
            const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
            
            if (totalPages <= 1 && filteredUniversities.length <= 10) {
              return null;
            }
            
            return (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="universities-items-per-page" className="text-sm text-muted-foreground">
                    Показать:
                  </Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger id="universities-items-per-page" className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    из {filteredUniversities.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Страница {currentPage} из {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Договоры */}
        <TabsContent value="contracts" className="mt-4 space-y-4">
          {/* Поиск и кнопки действий */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={contractsSearchQuery}
                onChange={(e) => {
                  setContractsSearchQuery(e.target.value);
                  setContractsPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт Excel
              </Button>
              <Dialog open={contractsFiltersDialogOpen} onOpenChange={setContractsFiltersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                    {(contractsFilters.types.length > 0 || contractsFilters.statuses.length > 0) && (
                      <Badge variant="secondary" className="ml-2">
                        {contractsFilters.types.length + contractsFilters.statuses.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-3">
                    <DialogTitle className="text-lg">Фильтры договоров</DialogTitle>
                    <DialogDescription>
                      Выберите фильтры для отображения договоров
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {/* Фильтр по типам */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Тип договора</Label>
                      <div className="space-y-1.5">
                        {[
                          { value: "cooperation", label: "Сотрудничество" },
                          { value: "scholarship", label: "Стипендия" },
                          { value: "internship", label: "Стажировка" },
                          { value: "bankDepartment", label: "Кафедра банка" },
                        ].map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-contract-type-${type.value}`}
                              checked={contractsFilters.types.includes(type.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setContractsFilters({
                                    ...contractsFilters,
                                    types: [...contractsFilters.types, type.value],
                                  });
                                } else {
                                  setContractsFilters({
                                    ...contractsFilters,
                                    types: contractsFilters.types.filter((t) => t !== type.value),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-contract-type-${type.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Фильтр по статусам */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Статус</Label>
                      <div className="space-y-1.5">
                        {[
                          { value: "active", label: "Действующие" },
                          { value: "expiring", label: "Истекающие" },
                          { value: "expired", label: "Просроченные" },
                        ].map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-contract-status-${status.value}`}
                              checked={contractsFilters.statuses.includes(status.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setContractsFilters({
                                    ...contractsFilters,
                                    statuses: [...contractsFilters.statuses, status.value],
                                  });
                                } else {
                                  setContractsFilters({
                                    ...contractsFilters,
                                    statuses: contractsFilters.statuses.filter((s) => s !== status.value),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-contract-status-${status.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {status.label}
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
                        setContractsFilters({
                          types: [],
                          statuses: [],
                        });
                        setContractsPage(1);
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button size="sm" onClick={() => {
                      setContractsFiltersDialogOpen(false);
                      setContractsPage(1);
                    }}>
                      Применить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Активные фильтры */}
          {(() => {
            const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
            
            contractsFilters.types.forEach((type) => {
              activeFilters.push({
                label: `Тип: ${getContractTypeName(type)}`,
                onRemove: () => {
                  setContractsFilters({
                    ...contractsFilters,
                    types: contractsFilters.types.filter((t) => t !== type),
                  });
                  setContractsPage(1);
                },
              });
            });
            
            contractsFilters.statuses.forEach((status) => {
              const statusLabels: Record<string, string> = {
                active: "Действующие",
                expiring: "Истекающие",
                expired: "Просроченные",
              };
              activeFilters.push({
                label: `Статус: ${statusLabels[status] || status}`,
                onRemove: () => {
                  setContractsFilters({
                    ...contractsFilters,
                    statuses: contractsFilters.statuses.filter((s) => s !== status),
                  });
                  setContractsPage(1);
                },
              });
            });
            
            if (activeFilters.length === 0) return null;
            
            return (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-sm">{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.onRemove}
                      className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Удалить фильтр"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            );
          })()}

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">ВУЗ</TableHead>
                  <TableHead className="w-[150px]">Тип</TableHead>
                  <TableHead className="w-[120px]">Номер</TableHead>
                  <TableHead className="w-[120px]">Дата</TableHead>
                  <TableHead className="w-[250px]">Период</TableHead>
                  <TableHead className="w-[150px]">Филиал/ГО</TableHead>
                  <TableHead className="w-[130px]">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const totalPages = Math.ceil(allContracts.length / contractsItemsPerPage);
                  const startIndex = (contractsPage - 1) * contractsItemsPerPage;
                  const endIndex = startIndex + contractsItemsPerPage;
                  const paginatedContracts = allContracts.slice(startIndex, endIndex);
                  
                  if (paginatedContracts.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Нет данных
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return paginatedContracts.map(contract => (
                    <TableRow key={`${contract.universityId}-${contract.id}`}>
                      <TableCell className="px-4 whitespace-normal">{contract.universityName}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{getContractTypeName(contract.type)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{contract.number || "—"}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{formatDate(contract.date)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">
                        {contract.period ? `${formatDate(contract.period.start)} — ${formatDate(contract.period.end)}` : "—"}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal">{contract.contractBranch || "—"}</TableCell>
                      <TableCell className="px-4 whitespace-normal">
                        <Badge variant="outline" className={
                          contract.status === "active" ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700" :
                          contract.status === "expiring" ? "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-700" :
                          contract.status === "expired" ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700" : ""
                        }>
                          {contract.status === "active" ? "Действующий" :
                           contract.status === "expiring" ? "Истекает" :
                           contract.status === "expired" ? "Просрочен" : "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {(() => {
            const totalPages = Math.ceil(allContracts.length / contractsItemsPerPage);
            
            if (totalPages <= 1 && allContracts.length <= 10) {
              return null;
            }
            
            return (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="contracts-items-per-page" className="text-sm text-muted-foreground">
                    Показать:
                  </Label>
                  <Select
                    value={contractsItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setContractsItemsPerPage(Number(value));
                      setContractsPage(1);
                    }}
                  >
                    <SelectTrigger id="contracts-items-per-page" className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    из {allContracts.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Страница {contractsPage} из {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setContractsPage(1)}
                      disabled={contractsPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setContractsPage(contractsPage - 1)}
                      disabled={contractsPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setContractsPage(contractsPage + 1)}
                      disabled={contractsPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setContractsPage(totalPages)}
                      disabled={contractsPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Мероприятия */}
        <TabsContent value="events" className="mt-4 space-y-4">
          {/* Поиск и кнопки действий */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={eventsSearchQuery}
                onChange={(e) => {
                  setEventsSearchQuery(e.target.value);
                  setEventsPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт Excel
              </Button>
              <Dialog open={eventsFiltersDialogOpen} onOpenChange={setEventsFiltersDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                    {(eventsFilters.types.length > 0 || eventsFilters.statuses.length > 0) && (
                      <Badge variant="secondary" className="ml-2">
                        {eventsFilters.types.length + eventsFilters.statuses.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-3">
                    <DialogTitle className="text-lg">Фильтры мероприятий</DialogTitle>
                    <DialogDescription>
                      Выберите фильтры для отображения мероприятий
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    {/* Фильтр по типам */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Тип мероприятия</Label>
                      <div className="space-y-1.5">
                        {[
                          { value: "careerDays", label: "Дни карьеры" },
                          { value: "expertParticipation", label: "Экспертное участие" },
                          { value: "caseChampionships", label: "Кейс-чемпионаты" },
                          { value: "meeting", label: "Встречи" },
                          { value: "communication", label: "Коммуникации" },
                        ].map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-event-type-${type.value}`}
                              checked={eventsFilters.types.includes(type.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEventsFilters({
                                    ...eventsFilters,
                                    types: [...eventsFilters.types, type.value],
                                  });
                                } else {
                                  setEventsFilters({
                                    ...eventsFilters,
                                    types: eventsFilters.types.filter((t) => t !== type.value),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-event-type-${type.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Фильтр по статусам */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Статус</Label>
                      <div className="space-y-1.5">
                        {[
                          { value: "planned", label: "Запланировано" },
                          { value: "in_progress", label: "В процессе" },
                          { value: "completed", label: "Завершено" },
                        ].map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-event-status-${status.value}`}
                              checked={eventsFilters.statuses.includes(status.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEventsFilters({
                                    ...eventsFilters,
                                    statuses: [...eventsFilters.statuses, status.value],
                                  });
                                } else {
                                  setEventsFilters({
                                    ...eventsFilters,
                                    statuses: eventsFilters.statuses.filter((s) => s !== status.value),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`filter-event-status-${status.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {status.label}
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
                        setEventsFilters({
                          types: [],
                          statuses: [],
                        });
                        setEventsPage(1);
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button size="sm" onClick={() => {
                      setEventsFiltersDialogOpen(false);
                      setEventsPage(1);
                    }}>
                      Применить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Активные фильтры */}
          {(() => {
            const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
            
            eventsFilters.types.forEach((type) => {
              activeFilters.push({
                label: `Тип: ${getEventTypeName(type)}`,
                onRemove: () => {
                  setEventsFilters({
                    ...eventsFilters,
                    types: eventsFilters.types.filter((t) => t !== type),
                  });
                  setEventsPage(1);
                },
              });
            });
            
            eventsFilters.statuses.forEach((status) => {
              activeFilters.push({
                label: `Статус: ${getEventStatusName(status)}`,
                onRemove: () => {
                  setEventsFilters({
                    ...eventsFilters,
                    statuses: eventsFilters.statuses.filter((s) => s !== status),
                  });
                  setEventsPage(1);
                },
              });
            });
            
            if (activeFilters.length === 0) return null;
            
            return (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-sm">{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.onRemove}
                      className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Удалить фильтр"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            );
          })()}

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">ВУЗ</TableHead>
                  <TableHead className="w-[150px]">Тип</TableHead>
                  <TableHead className="w-[120px]">Дата начала</TableHead>
                  <TableHead className="w-[120px]">Дата окончания</TableHead>
                  <TableHead className="w-[130px]">Статус</TableHead>
                  <TableHead>Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const totalPages = Math.ceil(allEvents.length / eventsItemsPerPage);
                  const startIndex = (eventsPage - 1) * eventsItemsPerPage;
                  const endIndex = startIndex + eventsItemsPerPage;
                  const paginatedEvents = allEvents.slice(startIndex, endIndex);
                  
                  if (paginatedEvents.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Нет данных
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return paginatedEvents.map(event => (
                    <TableRow key={`${event.universityId}-${event.id}`}>
                      <TableCell className="px-4 whitespace-normal">{event.universityName}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{getEventTypeName(event.type)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{formatDate(event.date)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{formatDate(event.endDate)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">
                        <Badge variant="outline" className={
                          event.status === "completed" ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700" :
                          event.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700" :
                          "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-200 dark:border-gray-700"
                        }>
                          {getEventStatusName(event.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal">{event.comments || "—"}</TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {(() => {
            const totalPages = Math.ceil(allEvents.length / eventsItemsPerPage);
            
            if (totalPages <= 1 && allEvents.length <= 10) {
              return null;
            }
            
            return (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="events-items-per-page" className="text-sm text-muted-foreground">
                    Показать:
                  </Label>
                  <Select
                    value={eventsItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setEventsItemsPerPage(Number(value));
                      setEventsPage(1);
                    }}
                  >
                    <SelectTrigger id="events-items-per-page" className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    из {allEvents.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Страница {eventsPage} из {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEventsPage(1)}
                      disabled={eventsPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEventsPage(eventsPage - 1)}
                      disabled={eventsPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEventsPage(eventsPage + 1)}
                      disabled={eventsPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEventsPage(totalPages)}
                      disabled={eventsPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Кадры */}
        <TabsContent value="staff" className="mt-4 space-y-4">
          <Tabs defaultValue="interns" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="interns">Стажеры ({allInterns.length})</TabsTrigger>
              <TabsTrigger value="practitioners">Практиканты ({allPractitioners.length})</TabsTrigger>
            </TabsList>

            {/* Стажеры */}
            <TabsContent value="interns" className="mt-4 space-y-4">
              {/* Поиск и кнопки действий */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={internsSearchQuery}
                    onChange={(e) => {
                      setInternsSearchQuery(e.target.value);
                      setInternsPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт Excel
                  </Button>
                  <Dialog open={internsFiltersDialogOpen} onOpenChange={setInternsFiltersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Фильтры
                        {internsFilters.statuses.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {internsFilters.statuses.length}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-3">
                        <DialogTitle className="text-lg">Фильтры стажеров</DialogTitle>
                        <DialogDescription>
                          Выберите фильтры для отображения стажеров
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        {/* Фильтр по статусам */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Статус</Label>
                          <div className="space-y-1.5">
                            {[
                              { value: "active", label: "Работает" },
                              { value: "dismissed", label: "Уволен" },
                            ].map((status) => (
                              <div key={status.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`filter-intern-status-${status.value}`}
                                  checked={internsFilters.statuses.includes(status.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setInternsFilters({
                                        ...internsFilters,
                                        statuses: [...internsFilters.statuses, status.value],
                                      });
                                    } else {
                                      setInternsFilters({
                                        ...internsFilters,
                                        statuses: internsFilters.statuses.filter((s) => s !== status.value),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`filter-intern-status-${status.value}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {status.label}
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
                            setInternsFilters({
                              statuses: [],
                            });
                            setInternsPage(1);
                          }}
                        >
                          Сбросить
                        </Button>
                        <Button size="sm" onClick={() => {
                          setInternsFiltersDialogOpen(false);
                          setInternsPage(1);
                        }}>
                          Применить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Активные фильтры */}
              {(() => {
                const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                
                internsFilters.statuses.forEach((status) => {
                  activeFilters.push({
                    label: `Статус: ${status === "active" ? "Работает" : "Уволен"}`,
                    onRemove: () => {
                      setInternsFilters({
                        ...internsFilters,
                        statuses: internsFilters.statuses.filter((s) => s !== status),
                      });
                      setInternsPage(1);
                    },
                  });
                });
                
                if (activeFilters.length === 0) return null;
                
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    {activeFilters.map((filter, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <span className="text-sm">{filter.label}</span>
                        <button
                          type="button"
                          onClick={filter.onRemove}
                          className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label="Удалить фильтр"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                );
              })()}

              {/* Таблица */}
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">ВУЗ</TableHead>
                      <TableHead className="w-[200px]">ФИО</TableHead>
                      <TableHead className="w-[80px]">Возраст</TableHead>
                      <TableHead className="w-[200px]">Должность</TableHead>
                      <TableHead className="w-[250px]">Подразделение</TableHead>
                      <TableHead className="w-[120px]">Дата приема</TableHead>
                      <TableHead className="w-[120px]">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const totalPages = Math.ceil(allInterns.length / internsItemsPerPage);
                      const startIndex = (internsPage - 1) * internsItemsPerPage;
                      const endIndex = startIndex + internsItemsPerPage;
                      const paginatedInterns = allInterns.slice(startIndex, endIndex);
                      
                      if (paginatedInterns.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Нет данных
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      return paginatedInterns.map(intern => (
                        <TableRow key={`${intern.universityId}-${intern.id}`}>
                          <TableCell className="px-4 whitespace-normal">{intern.universityName}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{intern.employeeName}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{intern.age}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{intern.position}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{intern.department}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{formatDate(intern.hireDate)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <Badge variant="outline" className={
                              intern.status === "active" ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700" :
                              "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700"
                            }>
                              {intern.status === "active" ? "Работает" : "Уволен"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {(() => {
                const totalPages = Math.ceil(allInterns.length / internsItemsPerPage);
                
                if (totalPages <= 1 && allInterns.length <= 10) {
                  return null;
                }
                
                return (
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="interns-items-per-page" className="text-sm text-muted-foreground">
                        Показать:
                      </Label>
                      <Select
                        value={internsItemsPerPage.toString()}
                        onValueChange={(value) => {
                          setInternsItemsPerPage(Number(value));
                          setInternsPage(1);
                        }}
                      >
                        <SelectTrigger id="interns-items-per-page" className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        из {allInterns.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Страница {internsPage} из {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setInternsPage(1)}
                          disabled={internsPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setInternsPage(internsPage - 1)}
                          disabled={internsPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setInternsPage(internsPage + 1)}
                          disabled={internsPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setInternsPage(totalPages)}
                          disabled={internsPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>

            {/* Практиканты */}
            <TabsContent value="practitioners" className="mt-4 space-y-4">
              {/* Поиск и кнопки действий */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={practitionersSearchQuery}
                    onChange={(e) => {
                      setPractitionersSearchQuery(e.target.value);
                      setPractitionersPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт Excel
                  </Button>
                  <Dialog open={practitionersFiltersDialogOpen} onOpenChange={setPractitionersFiltersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Фильтры
                        {practitionersFilters.statuses.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {practitionersFilters.statuses.length}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-3">
                        <DialogTitle className="text-lg">Фильтры практикантов</DialogTitle>
                        <DialogDescription>
                          Выберите фильтры для отображения практикантов
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        {/* Фильтр по оценкам */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Оценка</Label>
                          <div className="space-y-1.5">
                            {[
                              { value: "exceeds", label: "Превосходит" },
                              { value: "meets", label: "Соответствует" },
                              { value: "not_meets", label: "Не соответствует" },
                            ].map((status) => (
                              <div key={status.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`filter-practitioner-status-${status.value}`}
                                  checked={practitionersFilters.statuses.includes(status.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setPractitionersFilters({
                                        ...practitionersFilters,
                                        statuses: [...practitionersFilters.statuses, status.value],
                                      });
                                    } else {
                                      setPractitionersFilters({
                                        ...practitionersFilters,
                                        statuses: practitionersFilters.statuses.filter((s) => s !== status.value),
                                      });
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`filter-practitioner-status-${status.value}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {status.label}
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
                            setPractitionersFilters({
                              statuses: [],
                            });
                            setPractitionersPage(1);
                          }}
                        >
                          Сбросить
                        </Button>
                        <Button size="sm" onClick={() => {
                          setPractitionersFiltersDialogOpen(false);
                          setPractitionersPage(1);
                        }}>
                          Применить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Активные фильтры */}
              {(() => {
                const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
                
                practitionersFilters.statuses.forEach((status) => {
                  activeFilters.push({
                    label: `Оценка: ${getPracticeStatusName(status)}`,
                    onRemove: () => {
                      setPractitionersFilters({
                        ...practitionersFilters,
                        statuses: practitionersFilters.statuses.filter((s) => s !== status),
                      });
                      setPractitionersPage(1);
                    },
                  });
                });
                
                if (activeFilters.length === 0) return null;
                
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    {activeFilters.map((filter, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <span className="text-sm">{filter.label}</span>
                        <button
                          type="button"
                          onClick={filter.onRemove}
                          className="ml-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label="Удалить фильтр"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                );
              })()}

              {/* Таблица */}
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">ВУЗ</TableHead>
                      <TableHead className="w-[200px]">ФИО</TableHead>
                      <TableHead className="w-[200px]">Должность</TableHead>
                      <TableHead className="w-[250px]">Период практики</TableHead>
                      <TableHead className="w-[200px]">Руководитель</TableHead>
                      <TableHead className="w-[150px]">Оценка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const totalPages = Math.ceil(allPractitioners.length / practitionersItemsPerPage);
                      const startIndex = (practitionersPage - 1) * practitionersItemsPerPage;
                      const endIndex = startIndex + practitionersItemsPerPage;
                      const paginatedPractitioners = allPractitioners.slice(startIndex, endIndex);
                      
                      if (paginatedPractitioners.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Нет данных
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      return paginatedPractitioners.map(pract => (
                        <TableRow key={`${pract.universityId}-${pract.id}`}>
                          <TableCell className="px-4 whitespace-normal">{pract.universityName}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{pract.employeeName}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{pract.position}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{formatDate(pract.practiceStartDate)} — {formatDate(pract.practiceEndDate)}</TableCell>
                          <TableCell className="px-4 whitespace-normal">{pract.practiceSupervisor || "—"}</TableCell>
                          <TableCell className="px-4 whitespace-normal">
                            <Badge variant="outline" className={
                              pract.practiceStatus === "exceeds" ? "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700" :
                              pract.practiceStatus === "meets" ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-700" :
                              pract.practiceStatus === "not_meets" ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700" : ""
                            }>
                              {getPracticeStatusName(pract.practiceStatus)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {(() => {
                const totalPages = Math.ceil(allPractitioners.length / practitionersItemsPerPage);
                
                if (totalPages <= 1 && allPractitioners.length <= 10) {
                  return null;
                }
                
                return (
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="practitioners-items-per-page" className="text-sm text-muted-foreground">
                        Показать:
                      </Label>
                      <Select
                        value={practitionersItemsPerPage.toString()}
                        onValueChange={(value) => {
                          setPractitionersItemsPerPage(Number(value));
                          setPractitionersPage(1);
                        }}
                      >
                        <SelectTrigger id="practitioners-items-per-page" className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        из {allPractitioners.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Страница {practitionersPage} из {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPractitionersPage(1)}
                          disabled={practitionersPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPractitionersPage(practitionersPage - 1)}
                          disabled={practitionersPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPractitionersPage(practitionersPage + 1)}
                          disabled={practitionersPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPractitionersPage(totalPages)}
                          disabled={practitionersPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* БКО */}
        <TabsContent value="bko" className="mt-4 space-y-4">
          {/* Поиск и кнопки действий */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт Excel
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">ВУЗ</TableHead>
                  <TableHead className="w-[150px]">Город</TableHead>
                  <TableHead className="w-[120px] text-center">ЗП студ.</TableHead>
                  <TableHead className="w-[120px] text-center">ЗП сотр.</TableHead>
                  <TableHead className="w-[100px] text-center">ИЭ</TableHead>
                  <TableHead className="w-[100px] text-center">ТЭ</TableHead>
                  <TableHead className="w-[100px] text-center">СБП</TableHead>
                  <TableHead className="w-[100px] text-center">АДМ</TableHead>
                  <TableHead className="w-[100px] text-center">Лимит</TableHead>
                  <TableHead className="w-[120px] text-center">УК ГПБ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const totalPages = Math.ceil(bkoData.length / bkoItemsPerPage);
                  const startIndex = (bkoPage - 1) * bkoItemsPerPage;
                  const endIndex = startIndex + bkoItemsPerPage;
                  const paginatedBko = bkoData.slice(startIndex, endIndex);
                  
                  if (paginatedBko.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          Нет данных о БКО
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return paginatedBko.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 whitespace-normal">{row.name}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{row.city}</TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.salaryStudents ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.salaryEmployees ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.ie ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.te ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.sbp ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.adm ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.limit ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="px-4 whitespace-normal text-center">
                        {row.ukGpbFundsCk ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {(() => {
            const totalPages = Math.ceil(bkoData.length / bkoItemsPerPage);
            
            if (totalPages <= 1 && bkoData.length <= 10) {
              return null;
            }
            
            return (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="bko-items-per-page" className="text-sm text-muted-foreground">
                    Показать:
                  </Label>
                  <Select
                    value={bkoItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setBkoItemsPerPage(Number(value));
                      setBkoPage(1);
                    }}
                  >
                    <SelectTrigger id="bko-items-per-page" className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    из {bkoData.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Страница {bkoPage} из {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setBkoPage(1)}
                      disabled={bkoPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setBkoPage(bkoPage - 1)}
                      disabled={bkoPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setBkoPage(bkoPage + 1)}
                      disabled={bkoPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setBkoPage(totalPages)}
                      disabled={bkoPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ЦНТР */}
        <TabsContent value="cntr" className="mt-4 space-y-4">
          {/* Поиск и кнопки действий */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт Excel
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">ВУЗ</TableHead>
                  <TableHead>Название проекта</TableHead>
                  <TableHead className="w-[120px]">Дата</TableHead>
                  <TableHead className="w-[150px]">Филиал</TableHead>
                  <TableHead className="w-[150px]">Сумма</TableHead>
                  <TableHead className="w-[200px]">Формат поддержки</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const totalPages = Math.ceil(allCntrProjects.length / cntrItemsPerPage);
                  const startIndex = (cntrPage - 1) * cntrItemsPerPage;
                  const endIndex = startIndex + cntrItemsPerPage;
                  const paginatedProjects = allCntrProjects.slice(startIndex, endIndex);
                  
                  if (paginatedProjects.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Нет данных о проектах ЦНТР
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return paginatedProjects.map(project => (
                    <TableRow key={`${project.universityId}-${project.id}`}>
                      <TableCell className="px-4 whitespace-normal">{project.universityName}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{project.projectName}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{formatDate(project.date)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{project.branch || "—"}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{formatCurrency(project.fundingAmount)}</TableCell>
                      <TableCell className="px-4 whitespace-normal">{getSupportFormatName(project.supportFormat)}</TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {(() => {
            const totalPages = Math.ceil(allCntrProjects.length / cntrItemsPerPage);
            
            if (totalPages <= 1 && allCntrProjects.length <= 10) {
              return null;
            }
            
            return (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="cntr-items-per-page" className="text-sm text-muted-foreground">
                    Показать:
                  </Label>
                  <Select
                    value={cntrItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setCntrItemsPerPage(Number(value));
                      setCntrPage(1);
                    }}
                  >
                    <SelectTrigger id="cntr-items-per-page" className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    из {allCntrProjects.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Страница {cntrPage} из {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCntrPage(1)}
                      disabled={cntrPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCntrPage(cntrPage - 1)}
                      disabled={cntrPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCntrPage(cntrPage + 1)}
                      disabled={cntrPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCntrPage(totalPages)}
                      disabled={cntrPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
