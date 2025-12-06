import { useState, useMemo } from "react";
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

export function useKPIOperations(
  annualKPIs: Record<string, Record<string, KPI[]>>,
  quarterlyKPIs: Record<string, Record<string, KPI[]>>,
  itLeaderKPIs: Record<string, Record<string, KPI[]>>,
  setAnnualKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void,
  setQuarterlyKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void,
  setITLeaderKPIs: (kpis: Record<string, Record<string, KPI[]>>) => void
) {
  const addKPI = (
    streamId: string,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    const newKPI: KPI = {
      id: `kpi-${Date.now()}`,
      number: 1,
      name: "",
      weight: 0,
      type: "Количественный",
      unit: "",
      plan: 0,
      fact: 0,
      completionPercent: 0,
      evaluationPercent: 0,
    };

    if (type === "annual") {
      const year = "2025";
      const currentKPIs = annualKPIs[streamId]?.[year] || [];
      newKPI.number = currentKPIs.length + 1;
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: [...currentKPIs, newKPI],
        },
      });
    } else if (quarter) {
      const currentKPIs = source === "itLeader"
        ? (itLeaderKPIs[streamId]?.[quarter] || [])
        : (quarterlyKPIs[streamId]?.[quarter] || []);
      newKPI.number = currentKPIs.length + 1;
      
      if (source === "itLeader") {
        setITLeaderKPIs({
          ...itLeaderKPIs,
          [streamId]: {
            ...(itLeaderKPIs[streamId] || {}),
            [quarter]: [...currentKPIs, newKPI],
          },
        });
      } else {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [streamId]: {
            ...(quarterlyKPIs[streamId] || {}),
            [quarter]: [...currentKPIs, newKPI],
          },
        });
      }
    }
  };

  const deleteKPI = (
    streamId: string,
    kpiId: string,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    if (type === "annual") {
      const year = "2025";
      const currentKPIs = annualKPIs[streamId]?.[year] || [];
      const updatedKPIs = currentKPIs
        .filter(kpi => kpi.id !== kpiId)
        .map((kpi, index) => ({ ...kpi, number: index + 1 }));
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: updatedKPIs,
        },
      });
    } else if (quarter) {
      if (source === "itLeader") {
        const currentKPIs = itLeaderKPIs[streamId]?.[quarter] || [];
        const updatedKPIs = currentKPIs
          .filter(kpi => kpi.id !== kpiId)
          .map((kpi, index) => ({ ...kpi, number: index + 1 }));
        setITLeaderKPIs({
          ...itLeaderKPIs,
          [streamId]: {
            ...(itLeaderKPIs[streamId] || {}),
            [quarter]: updatedKPIs,
          },
        });
      } else {
        const currentKPIs = quarterlyKPIs[streamId]?.[quarter] || [];
        const updatedKPIs = currentKPIs
          .filter(kpi => kpi.id !== kpiId)
          .map((kpi, index) => ({ ...kpi, number: index + 1 }));
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [streamId]: {
            ...(quarterlyKPIs[streamId] || {}),
            [quarter]: updatedKPIs,
          },
        });
      }
    }
  };

  const moveKPI = (
    streamId: string,
    dragIndex: number,
    dropIndex: number,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    if (type === "annual") {
      const year = "2025";
      const currentKPIs = [...(annualKPIs[streamId]?.[year] || [])];
      const [movedKPI] = currentKPIs.splice(dragIndex, 1);
      currentKPIs.splice(dropIndex, 0, movedKPI);
      const updatedKPIs = currentKPIs.map((kpi, index) => ({ ...kpi, number: index + 1 }));
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: updatedKPIs,
        },
      });
    } else if (quarter) {
      if (source === "itLeader") {
        const currentKPIs = [...(itLeaderKPIs[streamId]?.[quarter] || [])];
        const [movedKPI] = currentKPIs.splice(dragIndex, 1);
        currentKPIs.splice(dropIndex, 0, movedKPI);
        const updatedKPIs = currentKPIs.map((kpi, index) => ({ ...kpi, number: index + 1 }));
        setITLeaderKPIs({
          ...itLeaderKPIs,
          [streamId]: {
            ...(itLeaderKPIs[streamId] || {}),
            [quarter]: updatedKPIs,
          },
        });
      } else {
        const currentKPIs = [...(quarterlyKPIs[streamId]?.[quarter] || [])];
        const [movedKPI] = currentKPIs.splice(dragIndex, 1);
        currentKPIs.splice(dropIndex, 0, movedKPI);
        const updatedKPIs = currentKPIs.map((kpi, index) => ({ ...kpi, number: index + 1 }));
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [streamId]: {
            ...(quarterlyKPIs[streamId] || {}),
            [quarter]: updatedKPIs,
          },
        });
      }
    }
  };

  const updateKPI = (
    streamId: string,
    kpiId: string,
    field: keyof KPI | string,
    value: string | number,
    type: "annual" | "quarterly",
    quarter?: string,
    source?: "stream" | "itLeader"
  ) => {
    if (type === "annual") {
      const year = "2025";
      const currentKPIs = annualKPIs[streamId]?.[year] || [];
      const updatedKPIs = currentKPIs.map(kpi => {
        if (kpi.id === kpiId) {
          const updatedKpi = { ...kpi, [field]: value };
          if (field === "plan" || field === "fact") {
            const metrics = calculateKPIMetrics(updatedKpi.plan, updatedKpi.fact, updatedKpi.weight);
            return { ...updatedKpi, ...metrics };
          }
          return updatedKpi;
        }
        return kpi;
      });
      setAnnualKPIs({
        ...annualKPIs,
        [streamId]: {
          ...(annualKPIs[streamId] || {}),
          [year]: updatedKPIs,
        },
      });
    } else if (quarter) {
      if (source === "itLeader") {
        const currentKPIs = itLeaderKPIs[streamId]?.[quarter] || [];
        const updatedKPIs = currentKPIs.map(kpi => {
          if (kpi.id === kpiId) {
            const updatedKpi = { ...kpi, [field]: value };
            if (field === "plan" || field === "fact") {
              const metrics = calculateKPIMetrics(updatedKpi.plan, updatedKpi.fact, updatedKpi.weight);
              return { ...updatedKpi, ...metrics };
            }
            return updatedKpi;
          }
          return kpi;
        });
        setITLeaderKPIs({
          ...itLeaderKPIs,
          [streamId]: {
            ...(itLeaderKPIs[streamId] || {}),
            [quarter]: updatedKPIs,
          },
        });
      } else {
        const currentKPIs = quarterlyKPIs[streamId]?.[quarter] || [];
        const updatedKPIs = currentKPIs.map(kpi => {
          if (kpi.id === kpiId) {
            const updatedKpi = { ...kpi, [field]: value };
            if (field === "plan" || field === "fact") {
              const metrics = calculateKPIMetrics(updatedKpi.plan, updatedKpi.fact, updatedKpi.weight);
              return { ...updatedKpi, ...metrics };
            }
            return updatedKpi;
          }
          return kpi;
        });
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [streamId]: {
            ...(quarterlyKPIs[streamId] || {}),
            [quarter]: updatedKPIs,
          },
        });
      }
    }
  };

  return {
    addKPI,
    deleteKPI,
    moveKPI,
    updateKPI,
  };
}

