// ─── Shared base types ───────────────────────────────────────────────────────

export interface YearlyTotal {
  year: number;
  revenue: number;
  expense: number;
  margin: number;
  marginPct: number;
  transactions: number;
}

export interface PersonYearData {
  person: string;
  year: number;
  revenue: number;
  margin: number;
  transactions: number;
}

export interface MonthlyMargin {
  month: number;   // 1–12
  margin: number;
  revenue: number;
}

export interface ProductData {
  product: string;
  revenue: number;
  margin: number;
  transactions: number;
  marginPct: number;
}

export interface OriginData {
  origin: string;
  revenue: number;
  margin: number;
  transactions: number;
  marginPct: number;
}

export interface HistoricalShipment {
  year: number;
  product: string;
  origin: string;
  transactions: number;
  boxes: number;
  revenue: number;
  margin: number;
  marginPct: number;
}

// ─── Cash Flow ───────────────────────────────────────────────────────────────

export interface CashFlowMonth {
  month: string;
  inflows: number;
  outflows: number;
  net: number;
  cumulative: number;
}

export interface CashFlowScenarios {
  conservative: CashFlowMonth[];
  realistic: CashFlowMonth[];
  aggressive: CashFlowMonth[];
}

// ─── KPI Summary ─────────────────────────────────────────────────────────────

export interface KpiSummary {
  totalRevenue: number;
  totalExpense: number;
  totalMargin: number;
  marginPct: number;
  transactions: number;
  revenueYoY: number | null;
  marginYoY: number | null;
  topProduct: string;
  topOrigin: string;
}

// ─── Profitability Matrix ─────────────────────────────────────────────────────

export interface ProfitabilityRow {
  product: string;
  origin: string;
  kgs: number;
  cost: number;
  revenue: number;
  grossMargin: number;
}

// ─── Risk ────────────────────────────────────────────────────────────────────

export interface LowMarginProduct {
  product: string;
  origin: string;
  margin: number;
  transactions: number;
}

export interface VolatileProduct {
  product: string;
  volatility: number;
  avg_margin: number;
  active_months: number;
}

export interface CurrencyExposure {
  currency: string;
  exposure: number;
}

export interface RiskData {
  lowMarginProducts: LowMarginProduct[];
  highVolatilityProducts: VolatileProduct[];
  currencyExposure: CurrencyExposure[];
}

// ─── Seasonal ────────────────────────────────────────────────────────────────

export interface SeasonalMonthData {
  month: number;
  avg_revenue: number;
  avg_margin: number;
  avg_margin_pct: number;
  total_boxes: number;
  transaction_count: number;
}

// ─── Forecast ────────────────────────────────────────────────────────────────

export interface ForecastPoint {
  year: string;
  actual: number | null;
  forecast: number | null;
}

export interface ForecastValuePoint {
  year: string;
  value: number;
}

export interface ForecastData {
  revenueData: ForecastPoint[];
  expenseData: ForecastPoint[];
  ebitdaData: ForecastValuePoint[];
  profitData: ForecastValuePoint[];
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: number;
  trader: string;
  year: number;
  month: number | null;
  transaction_type: string;
  origin: string | null;
  customer: string | null;
  customer_country: string | null;
  product: string | null;
  num_boxes: number | null;
  weight_kg: number | null;
  revenue_eur: number;
  margin: number;
  sales_invoice_date: string | null;
  sales_invoice_number: string | null;
  source_file: string | null;
}
