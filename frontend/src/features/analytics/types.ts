export interface AnalyticsSummary {
  totalIncidents: number;
  criticalIncidents: number;
  resolvedIncidents: number;
  averageRiskScore: number;
}

export interface CategoryStat {
  label: string;
  value: number;
}

export interface SeverityStat {
  label: string;
  value: number;
}

export interface RiskTrendPoint {
  label: string;
  value: number;
}
