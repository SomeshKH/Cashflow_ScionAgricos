/**
 * API Service Layer
 * All HTTP calls to the backend in one place.
 * Base URL is read from VITE_API_BASE_URL env var (defaults to /api for the Vite proxy).
 * API key is sent as X-API-Key header (read from VITE_API_KEY env var).
 * Falls back to mock data if backend is unavailable.
 */
import type {
  YearlyTotal, PersonYearData, MonthlyMargin,
  ProductData, OriginData, HistoricalShipment,
  CashFlowScenarios, KpiSummary, ProfitabilityRow,
  RiskData, SeasonalMonthData, ForecastData, Transaction,
} from '../types/api';
import { mockData } from './mockData';

const BASE    = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';
const API_KEY = (import.meta as any).env?.VITE_API_KEY ?? '';

// Build request headers – always include the API key when available
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
  try {
    const url = new URL(`${BASE}${path}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
      });
    }
    const res = await fetch(url.toString(), { headers: buildHeaders() });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`API ${path} → ${res.status}: ${msg}`);
    }
    // Check if response is actually JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API ${path} returned non-JSON response: ${contentType || 'unknown content-type'}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    console.warn(`API call failed for ${path}, using mock data:`, error);
    // Return mock data as fallback
    if (path === '/yearly-totals') return mockData.yearlyTotals() as T;
    if (path === '/summary') return mockData.summary(params?.year as number) as T;
    if (path === '/person-year-data') return mockData.personYearData() as T;
    if (path === '/traders') return mockData.personYearData() as T;
    if (path === '/monthly-margins') return mockData.monthlyMargins(params?.year as number) as T;
    if (path === '/products') return mockData.products(params?.year as number) as T;
    if (path === '/origins') return mockData.origins(params?.year as number) as T;
    if (path === '/historical-shipments') return mockData.historicalShipments() as T;
    if (path === '/cash-flow') return mockData.cashFlow(params?.year as number) as T;
    if (path === '/profitability') return mockData.profitability(params?.year as number) as T;
    if (path === '/risk') return mockData.risk(params?.year as number) as T;
    if (path === '/seasonal') return mockData.seasonal() as T;
    if (path === '/forecast') return mockData.forecast() as T;
    if (path === '/product-list') return mockData.productList() as T;
    if (path === '/origin-list') return mockData.originList() as T;
    if (path === '/transactions') return mockData.transactions(params) as T;
    if (path === '/health') return { status: 'ok' } as T;
    throw error;
  }
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
  ingest: async (dir?: string) => {
    try {
      const res = await fetch(`${BASE}/ingest`, {
        method:  'POST',
        headers: buildHeaders(),
        body:    JSON.stringify(dir ? { dir } : {}),
      });
      return res.json();
    } catch (error) {
      console.warn('Ingest API call failed, using mock response:', error);
      return { success: true, message: 'Mock ingest completed' };
    }
  },
};
