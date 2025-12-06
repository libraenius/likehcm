import type { Stream, KPI } from "@/types/goals-kold";
import { calculateKPIMetrics } from "./utils";

export class GoalsKoldService {
  static initializeKPIData(
    streamId: string,
    mockStreamKPIs: Record<string, KPI[]>,
    mockQuarterlyKPIs: Record<string, Record<string, KPI[]>>,
    mockITLeaderKPIs: Record<string, Record<string, KPI[]>>
  ) {
    const annualKPIs: Record<string, Record<string, KPI[]>> = {};
    const quarterlyKPIs: Record<string, Record<string, KPI[]>> = {};
    const itLeaderKPIs: Record<string, Record<string, KPI[]>> = {};

    // Инициализация годовых КПЭ
    if (mockStreamKPIs[streamId]) {
      annualKPIs[streamId] = {
        "2025": mockStreamKPIs[streamId].map((kpi, index) => ({
          ...kpi,
          number: index + 1,
        })),
      };
    }

    // Инициализация квартальных КПЭ
    if (mockQuarterlyKPIs[streamId]) {
      quarterlyKPIs[streamId] = {};
      Object.keys(mockQuarterlyKPIs[streamId]).forEach(quarter => {
        quarterlyKPIs[streamId][quarter] = mockQuarterlyKPIs[streamId][quarter].map((kpi, index) => ({
          ...kpi,
          number: index + 1,
        }));
      });
    }

    // Инициализация КПЭ ИТ лидера
    if (mockITLeaderKPIs[streamId]) {
      itLeaderKPIs[streamId] = {};
      Object.keys(mockITLeaderKPIs[streamId]).forEach(quarter => {
        itLeaderKPIs[streamId][quarter] = mockITLeaderKPIs[streamId][quarter].map((kpi, index) => ({
          ...kpi,
          number: index + 1,
        }));
      });
    }

    return { annualKPIs, quarterlyKPIs, itLeaderKPIs };
  }

  static calculateIntegralKPI(kpis: KPI[]): number {
    return kpis.reduce((sum, kpi) => sum + kpi.evaluationPercent, 0);
  }

  static updateKPIMetrics(kpi: KPI): KPI {
    const metrics = calculateKPIMetrics(kpi.plan, kpi.fact, kpi.weight);
    return { ...kpi, ...metrics };
  }

  static renumberKPIs(kpis: KPI[]): KPI[] {
    return kpis.map((kpi, index) => ({ ...kpi, number: index + 1 }));
  }
}

