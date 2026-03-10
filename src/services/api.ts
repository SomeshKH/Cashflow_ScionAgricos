/**
 * API Service Layer
 * All HTTP calls to the backend in one place.
 *
 * ┌─────────────┐   /api/proxy/*   ┌──────────────────────┐   x-api-key   ┌─────────────────┐
 * │   Browser   │ ───────────────► │  Vercel Serverless   │ ────────────► │  AWS API GW     │
 * │  (React)    │                  │  api/proxy/[...path] │               │  (FastAPI)      │
 * └─────────────┘                  └──────────────────────┘               └─────────────────┘
 *
 * Path convention:
 *   get('/dashboard/kpi')
 *     → fetch('/api/proxy/dashboard/kpi')          [browser → Vercel fn]
 *     → https://…amazonaws.com/prod/api/v1/dashboard/kpi   [Vercel fn → AWS]
 *
 * The AWS API key lives in the Vercel server-side env var AWS_BACKEND_API_KEY only.
 * It is never bundled into the client JS.
 *
 * Falls back to mock data when the backend is unreachable.
 */
import type {
  YearlyTotal, PersonYearData, MonthlyMargin,
  ProductData, OriginData, HistoricalShipment,
  CashFlowScenarios, KpiSummary, ProfitabilityRow,
  RiskData, SeasonalMonthData, ForecastData, Transaction,
} from '../types/api';
import { mockData } from './mockData';

// /api/proxy  in both local dev (Vite proxy rewrites to localhost:8000/api/v1/*)
//             and in production (Vercel serverless fn forwards to AWS with x-api-key)
const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api/proxy';

// ✅ No API key here — injected server-side by api/proxy/[...path].js
function buildHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
}

// ─── Route mapping (old → new) ────────────────────────────────────────────────
//
//  OLD (broke with 500s)        NEW (matches FastAPI routes)
//  ─────────────────────────    ───────────────────────────────────
//  /health                  →   /health
//  /yearly-totals           →   /kpi/full
//  /summary                 →   /dashboard/kpi
//  /person-year-data        →   /dashboard/trader-performance
//  /traders                 →   /dashboard/trader-performance
//  /monthly-margins         →   /dashboard/revenue-trend
//  /products                →   /analytics/products
//  /origins                 →   /analytics/origins
//  /historical-shipments    →   /analytics/shipments
//  /transactions            →   /analytics/shipments  (+ filter params)
//  /cash-flow               →   /cashflow/monthly
//  /profitability           →   /profitability/matrix
//  /risk                    →   /risk
//  /seasonal                →   /seasonal/monthly
//  /forecast                →   /forecast
//  /product-list            →   /filters  (?field=products)
//  /origin-list             →   /filters  (?field=origins)

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function get<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T> {
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
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API ${path} returned non-JSON response: ${contentType ?? 'unknown'}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    console.warn(`[api] ${path} failed — falling back to mock data`, error);
    return resolveMock<T>(path, params);
  }
}

// ─── Mock fallback resolver ───────────────────────────────────────────────────
// Keyed on the NEW backend paths so the switch stays in sync with the api object.

function resolveMock<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): T {
  switch (path) {
    // ── health ──────────────────────────────────────────────────────────────
    case '/health':
      return { status: 'ok' } as T;

    // ── dashboard ───────────────────────────────────────────────────────────
    case '/kpi/full':
      return mockData.yearlyTotals() as T;

    case '/dashboard/kpi':
      return mockData.summary(params?.year as number) as T;

    case '/dashboard/trader-performance':
      return mockData.personYearData() as T;

    case '/dashboard/revenue-trend':
      return mockData.monthlyMargins(params?.year as number) as T;

    // ── analytics ───────────────────────────────────────────────────────────
    case '/analytics/products':
      return mockData.products(params?.year as number) as T;

    case '/analytics/origins':
      return mockData.origins(params?.year as number) as T;

    case '/analytics/shipments':
      // transactions() passes filter params; historicalShipments() passes none
      if (params && (params.trader || params.product || params.origin || params.limit)) {
        return mockData.transactions(params) as T;
      }
      return mockData.historicalShipments() as T;

    // ── cashflow / profitability / risk ─────────────────────────────────────
    case '/cashflow/monthly':
      return mockData.cashFlow(params?.year as number) as T;

    case '/profitability/matrix':
      return mockData.profitability(params?.year as number) as T;

    case '/risk':
      return mockData.risk(params?.year as number) as T;

    // ── seasonal / forecast ─────────────────────────────────────────────────
    case '/seasonal/monthly':
      return mockData.seasonal() as T;

    case '/forecast':
      return mockData.forecast() as T;

    // ── filters (product list + origin list share this endpoint) ────────────
    case '/filters':
      if (params?.field === 'origins') return mockData.originList() as T;
      return mockData.productList() as T; // default + field=products

    default:
      throw new Error(`[api] No mock registered for path: ${path}`);
  }
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

export const api = {
  /** GET /health */
  health: () =>
    get<{ status: string }>('/health'),

  /** GET /kpi/full — aggregated totals across all years */
  yearlyTotals: () =>
    get<YearlyTotal[]>('/kpi/full'),

  /** GET /dashboard/kpi?year= — KPI summary + YoY comparisons */
  summary: (year: number) =>
    get<KpiSummary>('/dashboard/kpi', { year }),

  /** GET /dashboard/trader-performance — per-person per-year aggregations */
  personYearData: () =>
    get<PersonYearData[]>('/dashboard/trader-performance'),

  /** GET /dashboard/trader-performance?year= — per-trader summary */
  traders: (year?: number) =>
    get<PersonYearData[]>('/dashboard/trader-performance', { year }),

  /** GET /dashboard/revenue-trend?year= — 12-month margin + revenue */
  monthlyMargins: (year: number) =>
    get<MonthlyMargin[]>('/dashboard/revenue-trend', { year }),

  /** GET /analytics/products?year= — product-level aggregations */
  products: (year?: number) =>
    get<ProductData[]>('/analytics/products', { year }),

  /** GET /analytics/origins?year= — origin-level aggregations */
  origins: (year?: number) =>
    get<OriginData[]>('/analytics/origins', { year }),

  /** GET /analytics/shipments — historical shipments grouped by year+product+origin */
  historicalShipments: () =>
    get<HistoricalShipment[]>('/analytics/shipments'),

  /** GET /cashflow/monthly?year= — cash flow scenarios */
  cashFlow: (year: number) =>
    get<CashFlowScenarios>('/cashflow/monthly', { year }),

  /** GET /profitability/matrix?year= — product × origin profitability */
  profitability: (year?: number) =>
    get<ProfitabilityRow[]>('/profitability/matrix', { year }),

  /** GET /risk?year= — risk overview */
  risk: (year?: number) =>
    get<RiskData>('/risk', { year }),

  /** GET /seasonal/monthly — seasonal monthly patterns */
  seasonal: () =>
    get<SeasonalMonthData[]>('/seasonal/monthly'),

  /** GET /forecast — forecast projection data */
  forecast: () =>
    get<ForecastData>('/forecast'),

  /** GET /filters?field=products — distinct product names */
  productList: () =>
    get<string[]>('/filters', { field: 'products' }),

  /** GET /filters?field=origins — distinct origin names */
  originList: () =>
    get<string[]>('/filters', { field: 'origins' }),

  /** GET /analytics/shipments — raw transactions with optional filters */
  transactions: (filters?: {
    year?: number;
    trader?: string;
    product?: string;
    origin?: string;
    limit?: number;
  }) =>
    get<Transaction[]>('/analytics/shipments', filters),

  /** POST /ingest — trigger data re-ingestion */
  ingest: async (dir?: string) => {
    try {
      const res = await fetch(`${BASE}/ingest`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(dir ? { dir } : {}),
      });
      return res.json();
    } catch (error) {
      console.warn('[api] ingest failed — returning mock response', error);
      return { success: true, message: 'Mock ingest completed' };
    }
  },
};
