/**
 * API Service Layer
 * All HTTP calls to the backend in one place.
 * Base URL is read from VITE_API_BASE_URL env var (defaults to /api for the Vite proxy).
 */
import type {
  YearlyTotal, PersonYearData, MonthlyMargin,
  ProductData, OriginData, HistoricalShipment,
  CashFlowScenarios, KpiSummary, ProfitabilityRow,
  RiskData, SeasonalMonthData, ForecastData, Transaction,
} from '../types/api';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} → ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

export const api = {
  health: () =>
    get<{ status: string }>('/health'),

  /** All years' aggregated totals */
  yearlyTotals: () =>
    get<YearlyTotal[]>('/yearly-totals'),

  /** KPI summary for a single year (includes YoY comparisons) */
  summary: (year: number) =>
    get<KpiSummary>('/summary', { year }),

  /** Per-person per-year aggregations */
  personYearData: () =>
    get<PersonYearData[]>('/person-year-data'),

  /** Per-trader summary for a given year */
  traders: (year?: number) =>
    get<PersonYearData[]>('/traders', { year }),

  /** 12-element array of monthly margin+revenue for a year */
  monthlyMargins: (year: number) =>
    get<MonthlyMargin[]>('/monthly-margins', { year }),

  /** Product-level aggregations */
  products: (year?: number) =>
    get<ProductData[]>('/products', { year }),

  /** Origin-level aggregations */
  origins: (year?: number) =>
    get<OriginData[]>('/origins', { year }),

  /** Historical shipments grouped by year+product+origin */
  historicalShipments: () =>
    get<HistoricalShipment[]>('/historical-shipments'),

  /** Cash flow scenarios (conservative / realistic / aggressive) */
  cashFlow: (year: number) =>
    get<CashFlowScenarios>('/cash-flow', { year }),

  /** Profitability matrix (product × origin combinations) */
  profitability: (year?: number) =>
    get<ProfitabilityRow[]>('/profitability', { year }),

  /** Risk overview data */
  risk: (year?: number) =>
    get<RiskData>('/risk', { year }),

  /** Seasonal monthly patterns */
  seasonal: () =>
    get<SeasonalMonthData[]>('/seasonal'),

  /** Forecast projection data */
  forecast: () =>
    get<ForecastData>('/forecast'),

  /** Distinct product names (for dropdowns) */
  productList: () =>
    get<string[]>('/product-list'),

  /** Distinct origin names (for dropdowns) */
  originList: () =>
    get<string[]>('/origin-list'),

  /** Raw transactions with optional filters */
  transactions: (filters?: {
    year?: number;
    trader?: string;
    product?: string;
    origin?: string;
    limit?: number;
  }) =>
    get<Transaction[]>('/transactions', filters),

  /** Trigger Excel re-ingestion */
  ingest: (dir?: string) =>
    fetch(`${BASE}/ingest`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(dir ? { dir } : {}),
    }).then(r => r.json()),
};
