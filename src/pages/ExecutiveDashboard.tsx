import { useEffect, useState } from "react";
import { KPICard } from "../components/KPICard";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ShoppingCart, Loader2 } from "lucide-react";
import { api } from "../services/api";
import type { YearlyTotal, PersonYearData, MonthlyMargin, ProductData, OriginData, KpiSummary } from "../types/api";

const MONTHS_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Safe array normalizer ────────────────────────────────────────────────────
// The FastAPI backend may return arrays wrapped in an envelope object, e.g.:
//   { monthly: [...] }  |  { data: [...] }  |  { items: [...] }  |  [...]
// This helper unwraps any of those shapes and always returns a plain array.
function toArray<T>(
  raw: unknown,
  keys = ['monthly', 'data', 'items', 'results', 'records'],
): T[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === 'object') {
    for (const key of keys) {
      const val = (raw as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as T[];
    }
  }
  console.warn('[toArray] unexpected response shape — could not extract array:', raw);
  return [];
}

const PERSON_COLORS: Record<string, string> = {
  Chiru: "#0d5c3d",
  Madhu: "#10b981",
  Mahendra: "#34d399",
  Unmesh: "#6ee7b7",
};

const fmt = (n: number) =>
  n >= 1_000_000
    ? `€${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `€${(n / 1_000).toFixed(0)}K`
    : `€${n.toLocaleString()}`;

const pct = (n: number | null | undefined, pos?: boolean) =>
  n == null ? "—" : `${n > 0 ? "+" : ""}${n}%`;

export function ExecutiveDashboard() {
  const [kpi,         setKpi]         = useState<KpiSummary | null>(null);
  const [yearlyTotals,setYearlyTotals]= useState<YearlyTotal[]>([]);
  const [personData,  setPersonData]  = useState<PersonYearData[]>([]);
  const [monthly,     setMonthly]     = useState<MonthlyMargin[]>([]); // always an array
  const [products,    setProducts]    = useState<ProductData[]>([]);
  const [origins,     setOrigins]     = useState<OriginData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    const year = 2025;
    Promise.all([
      api.summary(year),
      api.yearlyTotals(),
      api.personYearData(),
      api.monthlyMargins(year),
      api.products(year),
      api.origins(year),
    ])
      .then(([k, yt, pyd, mm, pr, or_]) => {
        // 🔍 Temporary: inspect raw API response shapes in DevTools console
        console.log('[API raw] /dashboard/kpi         →', k);
        console.log('[API raw] /kpi/full               →', yt);
        console.log('[API raw] /dashboard/trader-performance →', pyd);
        console.log('[API raw] /dashboard/revenue-trend →', mm);
        console.log('[API raw] /analytics/products     →', pr);
        console.log('[API raw] /analytics/origins      →', or_);

        setKpi(k);
        // Normalize: safely unwrap arrays regardless of envelope shape
        setYearlyTotals(toArray<YearlyTotal>(yt));
        setPersonData(toArray<PersonYearData>(pyd));
        // Explicit guard: handles [], { data:[] }, { monthly:[] }, or null
        setMonthly(
          Array.isArray(mm)
            ? mm
            : (mm as any)?.data || (mm as any)?.monthly || []
        );
        setProducts(toArray<ProductData>(pr));
        setOrigins(toArray<OriginData>(or_));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading dashboard…</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">
      <p>Failed to load data: {error}</p>
    </div>
  );

  // ── Derived chart data ────────────────────────────────────────────────────

  // Monthly cash flow preview for selected year
  // Guard: handles array | { monthly:[] } | { data:[] } | null/undefined
  console.log("monthly =", monthly);
  const monthlyData: MonthlyMargin[] = Array.isArray(monthly)
    ? monthly
    : Array.isArray((monthly as any)?.monthly)
    ? (monthly as any).monthly
    : Array.isArray((monthly as any)?.data)
    ? (monthly as any).data
    : [];
  console.log("monthlyData =", monthlyData);

  const cashFlowPreview = monthlyData.map((m, i) => ({
    month: MONTHS_ABBR[i],
    cashFlow: m.margin,
  }));

  // Yearly profit margin line chart
  const yearlyProfitMargin = yearlyTotals.map(y => ({
    year: String(y.year),
    margin: y.marginPct,
  }));

  // Stacked bar: margin per trader per year
  const years = [...new Set(personData.map(p => String(p.year)))].sort();
  const persons = [...new Set(personData.map(p => p.person))];
  const personStackedData = years.map(year => {
    const row: Record<string, string | number> = { year };
    personData
      .filter(p => String(p.year) === year)
      .forEach(p => { row[p.person] = p.margin; });
    return row;
  });

  const cur = kpi!;
  const latestYear = yearlyTotals.length ? yearlyTotals[yearlyTotals.length - 1] : null;
  const prevYear   = yearlyTotals.length > 1 ? yearlyTotals[yearlyTotals.length - 2] : null;
  const expenseYoY = latestYear && prevYear && prevYear.expense
    ? +(((latestYear.expense - prevYear.expense) / prevYear.expense) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Executive Dashboard</h1>
        <p className="text-[#6b6b6b]">
          Comprehensive overview of financial performance ({yearlyTotals.map(y => y.year).join("–")})
        </p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue (2025)"
          value={fmt(cur.totalRevenue)}
          trend={{ value: cur.revenueYoY != null ? `${pct(cur.revenueYoY)} YoY` : "—", isPositive: (cur.revenueYoY ?? 0) >= 0 }}
        />
        <KPICard
          title="Total Expenses (2025)"
          value={fmt(cur.totalExpense)}
          trend={{ value: expenseYoY != null ? `${pct(expenseYoY)} YoY` : "—", isPositive: false }}
        />
        <KPICard
          title="Margin %"
          value={`${cur.marginPct}%`}
          trend={{ value: cur.marginYoY != null ? `${pct(cur.marginYoY)} YoY` : "—", isPositive: (cur.marginYoY ?? 0) >= 0 }}
        />
        <KPICard
          title="Net Margin (2025)"
          value={fmt(cur.totalMargin)}
          trend={{ value: cur.marginYoY != null ? `${pct(cur.marginYoY)} YoY` : "—", isPositive: (cur.marginYoY ?? 0) >= 0 }}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <KPICard
          title="Total Transactions"
          value={cur.transactions.toLocaleString()}
          subtitle="Across all traders in 2025"
        />
        <KPICard
          title="Best Product"
          value={cur.topProduct}
          subtitle="Highest revenue in 2025"
        />
        <KPICard
          title="Best Origin"
          value={cur.topOrigin}
          subtitle="Highest cumulative margin"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue vs Expense 3-year */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Revenue vs Expense (Multi-Year Trend)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyTotals.map(y => ({ ...y, year: String(y.year) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={(v) => `€${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#0d5c3d" name="Revenue (€)" />
              <Bar dataKey="expense" fill="#10b981" name="Expense (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Margin % trend */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Profit Margin % Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyProfitMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="margin" stroke="#0d5c3d" strokeWidth={3} name="Margin %" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Margin by Trader (stacked bar) */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Margin by Trader per Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={personStackedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={(v) => `€${(v / 1_000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              {persons.map(person => (
                <Bar key={person} dataKey={person} stackId="a" fill={PERSON_COLORS[person] || "#10b981"} name={person} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Net Cash Flow */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Monthly Net Cash Flow 2025</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowPreview}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={(v) => `€${(v / 1_000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="cashFlow" stroke="#10b981" fill="#a7f3d0" name="Net Margin (€)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products by Margin */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Top Products by Margin</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={products.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke="#6b6b6b" tickFormatter={(v) => `€${(v / 1_000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="product" stroke="#6b6b6b" width={110} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Bar dataKey="margin" fill="#0d5c3d" name="Total Margin (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Origins by Margin */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Top Origins by Margin</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={origins.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke="#6b6b6b" tickFormatter={(v) => `€${(v / 1_000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="origin" stroke="#6b6b6b" width={110} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Bar dataKey="margin" fill="#10b981" name="Total Margin (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-[#0d5c3d] to-[#10b981] rounded-xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Performance Summary &amp; Outlook</h3>
            <p className="text-white/90 mb-4">
              2025 revenue {cur.revenueYoY != null ? `${pct(cur.revenueYoY)} YoY` : "grew"} to {fmt(cur.totalRevenue)} across {cur.transactions.toLocaleString()} transactions.
              Net margin at {cur.marginPct}%. {cur.topProduct} and {cur.topOrigin} remain the top performers.
            </p>
            <div className="grid grid-cols-4 gap-8 mt-6">
              <div>
                <div className="text-white/70 text-sm mb-1">2025 Revenue</div>
                <div className="text-2xl font-semibold">{fmt(cur.totalRevenue)}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">2025 Net Margin</div>
                <div className="text-2xl font-semibold">{fmt(cur.totalMargin)}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Transactions</div>
                <div className="text-2xl font-semibold">{cur.transactions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Margin %</div>
                <div className="text-2xl font-semibold">{cur.marginPct}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
