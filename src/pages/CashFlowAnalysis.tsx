import { useEffect, useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../services/api";
import type { CashFlowScenarios, CashFlowMonth, YearlyTotal, MonthlyMargin } from "../types/api";

// Normalize a raw cashflow month object — handles snake_case and missing fields
function normalizeCfMonth(raw: any): CashFlowMonth {
  return {
    month:      raw.month      ?? '',
    inflows:    Number(raw.inflows    ?? raw.cash_in    ?? raw.inflow   ?? 0),
    outflows:   Number(raw.outflows   ?? raw.cash_out   ?? raw.outflow  ?? 0),
    net:        Number(raw.net        ?? raw.net_cash   ?? raw.net_flow ?? 0),
    cumulative: Number(raw.cumulative ?? raw.balance    ?? raw.running_balance ?? 0),
  };
}

function normalizeCfScenarios(raw: any): CashFlowScenarios {
  const norm = (arr: any) => Array.isArray(arr) ? arr.map(normalizeCfMonth) : [];
  return {
    conservative: norm(raw?.conservative ?? []),
    realistic:    norm(raw?.realistic    ?? []),
    aggressive:   norm(raw?.aggressive   ?? []),
  };
}

const MONTHS_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function CashFlowAnalysis() {
  const [scenario,   setScenario]   = useState<"conservative" | "realistic" | "aggressive">("realistic");
  const [yearView,   setYearView]   = useState<"scenario" | "comparison">("scenario");
  const [cfData,     setCfData]     = useState<CashFlowScenarios | null>(null);
  const [yearlyTotals, setYearlyTotals] = useState<YearlyTotal[]>([]);
  const [allMonthly, setAllMonthly] = useState<Record<number, MonthlyMargin[]>>({});
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    const year = 2025;
    Promise.all([
      api.cashFlow(year),
      api.yearlyTotals(),
      // fetch monthly margins for all available years
      api.monthlyMargins(2023),
      api.monthlyMargins(2024),
      api.monthlyMargins(2025),
    ])
      .then(([cf, yt, m23, m24, m25]) => {
        setCfData(normalizeCfScenarios(cf));
        setYearlyTotals(yt);
        setAllMonthly({ 2023: m23, 2024: m24, 2025: m25 });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading cash flow data…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  const data: CashFlowMonth[] = cfData?.[scenario] ?? [];

  const totalInflows  = data.reduce((s, m) => s + m.inflows, 0);
  const totalOutflows = data.reduce((s, m) => s + m.outflows, 0);
  const totalNet      = totalInflows - totalOutflows;
  const endingBalance = data.length ? data[data.length - 1].cumulative : 0;

  // Year-on-year comparison data
  const monthlyComparisonData = MONTHS_ABBR.map((month, i) => ({
    month,
    "2023": allMonthly[2023]?.[i]?.margin ?? 0,
    "2024": allMonthly[2024]?.[i]?.margin ?? 0,
    "2025": allMonthly[2025]?.[i]?.margin ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Cash Flow Analysis</h1>
        <p className="text-[#6b6b6b]">Monthly cash flow tracking based on real trading data</p>
      </div>

      {/* View Switcher */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex gap-4 mb-4">
          {(["scenario", "comparison"] as const).map(v => (
            <button
              key={v}
              onClick={() => setYearView(v)}
              className={`px-5 py-2 rounded-lg border-2 font-semibold transition-colors ${
                yearView === v
                  ? "border-[#0d5c3d] bg-[#e8f5f0] text-[#0d5c3d]"
                  : "border-[#e0e0e0] hover:border-[#0d5c3d]"
              }`}
            >
              {v === "scenario" ? "2025 Scenarios" : "Year-on-Year Comparison"}
            </button>
          ))}
        </div>

        {yearView === "scenario" && (
          <>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Scenario Selection</h3>
            <div className="flex gap-4">
              {(["conservative", "realistic", "aggressive"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    scenario === s
                      ? "border-[#0d5c3d] bg-[#e8f5f0] text-[#0d5c3d]"
                      : "border-[#e0e0e0] hover:border-[#0d5c3d]"
                  }`}
                >
                  <div className="font-semibold capitalize mb-1">{s}</div>
                  <div className="text-xs opacity-80">
                    {s === "conservative" && "85% inflows, 105% costs"}
                    {s === "realistic"    && "Actual trading data"}
                    {s === "aggressive"   && "115% inflows, 97% costs"}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {yearView === "scenario" ? (
        <>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Total Inflows</span>
              </div>
              <div className="text-3xl font-semibold text-[#10b981]">
                €{(totalInflows / 1_000_000).toFixed(2)}M
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-2">
                <TrendingDown className="w-4 h-4" />
                <span>Total Outflows</span>
              </div>
              <div className="text-3xl font-semibold text-[#ef4444]">
                €{(totalOutflows / 1_000_000).toFixed(2)}M
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Net Cash Flow</span>
              </div>
              <div className={`text-3xl font-semibold ${totalNet >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                €{(totalNet / 1_000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="text-sm text-[#6b6b6b] mb-2">Ending Balance</div>
              <div className="text-3xl font-semibold text-[#0d5c3d]">
                €{(endingBalance / 1_000).toFixed(0)}K
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Monthly Inflow vs Outflow</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#6b6b6b" />
                  <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v != null ? `€${v.toLocaleString()}` : '—'} />
                  <Legend />
                  <Line type="monotone" dataKey="inflows"  stroke="#10b981" strokeWidth={3} name="Inflows" />
                  <Line type="monotone" dataKey="outflows" stroke="#ef4444" strokeWidth={3} name="Outflows" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Cumulative Cash Balance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#6b6b6b" />
                  <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v != null ? `€${v.toLocaleString()}` : '—'} />
                  <Legend />
                  <Area type="monotone" dataKey="cumulative" stroke="#0d5c3d" fill="#e8f5f0" name="Cumulative Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0d5c3d] to-[#10b981] rounded-xl p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Capital Summary – {scenario} scenario</h3>
                <p className="text-white/90 mb-4">Based on real trading data with {scenario} adjustment applied</p>
                <div className="grid grid-cols-3 gap-8 mt-6">
                  <div>
                    <div className="text-white/70 text-sm mb-1">Annual Net</div>
                    <div className="text-2xl font-semibold">€{(totalNet / 1_000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Year-End Balance</div>
                    <div className="text-2xl font-semibold">€{(endingBalance / 1_000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Avg Monthly Net</div>
                    <div className="text-2xl font-semibold">€{(totalNet / 12 / 1_000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Monthly Cash Flow Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#e0e0e0]">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Month</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Inflows</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Outflows</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Net Cash</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                      <td className="py-4 px-4 text-sm font-medium">{row.month}</td>
                      <td className="py-4 px-4 text-sm text-right text-[#10b981]">€{(row.inflows ?? 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-right text-[#ef4444]">€{(row.outflows ?? 0).toLocaleString()}</td>
                      <td className={`py-4 px-4 text-sm text-right font-semibold ${(row.net ?? 0) >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        €{(row.net ?? 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-semibold text-[#0d5c3d]">
                        €{(row.cumulative ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6">
            {yearlyTotals.map(yr => (
              <div key={yr.year} className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
                <div className="text-sm text-[#6b6b6b] mb-1">Net Margin {yr.year}</div>
                <div className="text-3xl font-semibold text-[#0d5c3d]">
                  €{(Number(yr.margin) / 1_000).toFixed(0)}K
                </div>
                <div className="text-sm text-[#6b6b6b] mt-1">{yr.marginPct}% margin rate</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">
              Monthly Net Margin — 2023 vs 2024 vs 2025
            </h3>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={monthlyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#6b6b6b" />
                <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="2023" fill="#34d399" name="2023 Margin" />
                <Bar dataKey="2024" fill="#10b981" name="2024 Margin" />
                <Bar dataKey="2025" fill="#0d5c3d" name="2025 Margin" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
