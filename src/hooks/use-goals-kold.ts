import { useState, useMemo, useCallback } from "react";
import type { Stream, Team, KPI } from "@/types/goals-kold";
import { calculateKPIMetrics } from "@/lib/goals-kold/utils";

export function useGoalsKoldState(initialStreams: Stream[]) {
  const [streams, setStreams] = useState<Stream[]>(initialStreams);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{
    types: Array<"продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный">;
  }>({ types: [] });

  const filteredStreams = useMemo(() => {
    if (filters.types.length === 0) return streams;
    return streams.filter(stream => stream.type && filters.types.includes(stream.type));
  }, [streams, filters]);

  return {
    streams,
    setStreams,
    selectedStream,
    setSelectedStream,
    selectedTeam,
    setSelectedTeam,
    expandedStreams,
    setExpandedStreams,
    filters,
    setFilters,
    filteredStreams,
  };
}

export function useKPIManagement() {
  const [annualKPIs, setAnnualKPIs] = useState<Record<string, Record<string, KPI[]>>>({});
  const [quarterlyKPIs, setQuarterlyKPIs] = useState<Record<string, Record<string, KPI[]>>>({});
  const [itLeaderKPIs, setITLeaderKPIs] = useState<Record<string, Record<string, KPI[]>>>({});
  const [isAnnualExpanded, setIsAnnualExpanded] = useState(false);
  const [isQuarterlyExpanded, setIsQuarterlyExpanded] = useState(false);
  const [isITLeaderExpanded, setIsITLeaderExpanded] = useState(false);
  const [isEditModeAnnual, setIsEditModeAnnual] = useState(false);
  const [isEditModeQuarterly, setIsEditModeQuarterly] = useState<Record<string, boolean>>({});
  const [isEditModeITLeader, setIsEditModeITLeader] = useState<Record<string, boolean>>({});
  const [selectedAnnualYear, setSelectedAnnualYear] = useState("2025");
  const [selectedQuarterlyYear, setSelectedQuarterlyYear] = useState("2025");
  const [selectedITLeaderYear, setSelectedITLeaderYear] = useState("2025");
  const [draggedKPIId, setDraggedKPIId] = useState<string | null>(null);
  const [draggedKPIQuarter, setDraggedKPIQuarter] = useState<string | null>(null);

  return {
    annualKPIs,
    setAnnualKPIs,
    quarterlyKPIs,
    setQuarterlyKPIs,
    itLeaderKPIs,
    setITLeaderKPIs,
    isAnnualExpanded,
    setIsAnnualExpanded,
    isQuarterlyExpanded,
    setIsQuarterlyExpanded,
    isITLeaderExpanded,
    setIsITLeaderExpanded,
    isEditModeAnnual,
    setIsEditModeAnnual,
    isEditModeQuarterly,
    setIsEditModeQuarterly,
    isEditModeITLeader,
    setIsEditModeITLeader,
    selectedAnnualYear,
    setSelectedAnnualYear,
    selectedQuarterlyYear,
    setSelectedQuarterlyYear,
    selectedITLeaderYear,
    setSelectedITLeaderYear,
    draggedKPIId,
    setDraggedKPIId,
    draggedKPIQuarter,
    setDraggedKPIQuarter,
  };
}

/**
 * Тип для источника KPI данных
 */
type KPISource = "annual" | "quarterly" | "itLeader";

/**
 * Тип для контекста KPI операций
 */
type KPIContext = {
  type: "annual" | "quarterly";
  quarter?: string;
  source?: "stream" | "itLeader";
};

/**
 * Получить текущие KPI и сеттер на основе контекста
 */
function getKPIData(
  context: KPIContext,
  streamId: string,
  annualKPIs: Record<string, Record<string, KPI[]>>,
  quarterlyKPIs: Record<string, Record<string, KPI[]>>,
  itLeaderKPIs: Record<string, Record<string, KPI[]>>
): { kpis: KPI[]; period: string } {
  if (context.type === "annual") {
    const year = "2025";
    return {
      kpis: annualKPIs[streamId]?.[year] || [],
      period: year,
    };
  }

  const period = context.quarter || "";
  if (context.source === "itLeader") {
    return {
      kpis: itLeaderKPIs[streamId]?.[period] || [],
      period,
    };
  }

  return {
    kpis: quarterlyKPIs[streamId]?.[period] || [],
    period,
  };
}

/**
 * Обновить KPI данные в соответствующем хранилище
 */
function updateKPIData(
  context: KPIContext,
  streamId: string,
  period: string,
  updatedKPIs: KPI[],
  annualKPIs: Record<string, Record<string, KPI[]>>,
  quarterlyKPIs: Record<string, Record<string, KPI[]>>,
  itLeaderKPIs: Record<string, Record<string, KPI[]>>,
  setAnnualKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void,
  setQuarterlyKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void,
  setITLeaderKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void
): void {
  if (context.type === "annual") {
    setAnnualKPIs({
      ...annualKPIs,
      [streamId]: {
        ...(annualKPIs[streamId] || {}),
        [period]: updatedKPIs,
      },
    });
    return;
  }

  if (context.source === "itLeader") {
    setITLeaderKPIs({
      ...itLeaderKPIs,
      [streamId]: {
        ...(itLeaderKPIs[streamId] || {}),
        [period]: updatedKPIs,
      },
    });
    return;
  }

  setQuarterlyKPIs({
    ...quarterlyKPIs,
    [streamId]: {
      ...(quarterlyKPIs[streamId] || {}),
      [period]: updatedKPIs,
    },
  });
}

/**
 * Пересчитать номера KPI после изменений
 */
function renumberKPIs(kpis: KPI[]): KPI[] {
  return kpis.map((kpi, index) => ({ ...kpi, number: index + 1 }));
}

export function useKPIOperations(
  annualKPIs: Record<string, Record<string, KPI[]>>,
  quarterlyKPIs: Record<string, Record<string, KPI[]>>,
  itLeaderKPIs: Record<string, Record<string, KPI[]>>,
  setAnnualKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void,
  setQuarterlyKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void,
  setITLeaderKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void
) {
  const addKPI = useCallback((
    streamId: string,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    const context: KPIContext = { type, quarter, source };
    const { kpis: currentKPIs, period } = getKPIData(
      context,
      streamId,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs
    );

    const newKPI: KPI = {
      id: `kpi-${Date.now()}`,
      number: currentKPIs.length + 1,
      name: "",
      weight: 0,
      type: "Количественный",
      unit: "",
      plan: 0,
      fact: 0,
      completionPercent: 0,
      evaluationPercent: 0,
    };

    const updatedKPIs = [...currentKPIs, newKPI];
    updateKPIData(
      context,
      streamId,
      period,
      updatedKPIs,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs,
      setAnnualKPIs,
      setQuarterlyKPIs,
      setITLeaderKPIs
    );
  }, [annualKPIs, quarterlyKPIs, itLeaderKPIs, setAnnualKPIs, setQuarterlyKPIs, setITLeaderKPIs]);

  const deleteKPI = useCallback((
    streamId: string,
    kpiId: string,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    const context: KPIContext = { type, quarter, source };
    const { kpis: currentKPIs, period } = getKPIData(
      context,
      streamId,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs
    );

    const updatedKPIs = renumberKPIs(
      currentKPIs.filter(kpi => kpi.id !== kpiId)
    );

    updateKPIData(
      context,
      streamId,
      period,
      updatedKPIs,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs,
      setAnnualKPIs,
      setQuarterlyKPIs,
      setITLeaderKPIs
    );
  }, [annualKPIs, quarterlyKPIs, itLeaderKPIs, setAnnualKPIs, setQuarterlyKPIs, setITLeaderKPIs]);

  const moveKPI = useCallback((
    streamId: string,
    dragIndex: number,
    dropIndex: number,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    const context: KPIContext = { type, quarter, source };
    const { kpis: currentKPIs, period } = getKPIData(
      context,
      streamId,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs
    );

    const reorderedKPIs = [...currentKPIs];
    const [movedKPI] = reorderedKPIs.splice(dragIndex, 1);
    reorderedKPIs.splice(dropIndex, 0, movedKPI);

    const updatedKPIs = renumberKPIs(reorderedKPIs);

    updateKPIData(
      context,
      streamId,
      period,
      updatedKPIs,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs,
      setAnnualKPIs,
      setQuarterlyKPIs,
      setITLeaderKPIs
    );
  }, [annualKPIs, quarterlyKPIs, itLeaderKPIs, setAnnualKPIs, setQuarterlyKPIs, setITLeaderKPIs]);

  const updateKPI = useCallback((
    streamId: string,
    kpiId: string,
    field: keyof KPI | string,
    value: string | number,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    const context: KPIContext = { type, quarter, source };
    const { kpis: currentKPIs, period } = getKPIData(
      context,
      streamId,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs
    );

    const updatedKPIs = currentKPIs.map(kpi => {
      if (kpi.id !== kpiId) {
        return kpi;
      }

      const updatedKpi = { ...kpi, [field]: value };
      
      if (field === "plan" || field === "fact") {
        const metrics = calculateKPIMetrics(
          updatedKpi.plan,
          updatedKpi.fact,
          updatedKpi.weight
        );
        return { ...updatedKpi, ...metrics };
      }

      return updatedKpi;
    });

    updateKPIData(
      context,
      streamId,
      period,
      updatedKPIs,
      annualKPIs,
      quarterlyKPIs,
      itLeaderKPIs,
      setAnnualKPIs,
      setQuarterlyKPIs,
      setITLeaderKPIs
    );
  }, [annualKPIs, quarterlyKPIs, itLeaderKPIs, setAnnualKPIs, setQuarterlyKPIs, setITLeaderKPIs]);

  return {
    addKPI,
    deleteKPI,
    moveKPI,
    updateKPI,
  };
}

