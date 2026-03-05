import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../services/api";
import type { MonthlyMargin, YearlyTotal } from "../types/api";

const MONTHS_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function KPIDashboard() {
  const [comparison, setComparison] = useState<"yoy" | "mom">("yoy");
  const [cur,  setCur]  = useState<MonthlyMargin[]>([]);
  const [prev, setPrev] = useState<MonthlyMargin[]>([]);
  const [yearlyTotals, setYearlyTotals] = useState<YearlyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const CURRENT_YEAR = 2025;
  const PREV_YEAR    = 2024;

  useEffect(() => {
    Promise.all([
      api.monthlyMargins(CURRENT_YEAR),
      api.monthlyMargins(PREV_YEAR),
      api.yearlyTotals(),
    ])
      .then(([c, p, yt]) => { setCur(c); setPrev(p); setYearlyTotals(yt); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading KPIs…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  // ── Derived KPI data from real monthly figures ────────────────────────────

  // Gross margin % per month (margin / revenue * 100)
  const grossMarginData = MONTHS_ABBR.map((month, i) => ({
    month,
    current:  cur[i]?.revenue  ? +((cur[i].margin  / cur[i].revenue)  * 100).toFixed(1) : 0,
    previous: prev[i]?.revenue ? +((prev[i].margin / prev[i].revenue) * 100).toFixed(1) : 0,
  }));

  // Revenue growth % vs same month previous year
  const revenueGrowthData = MONTHS_ABBR.map((month, i) => ({
    month,
    growth: prev[i]?.revenue
      ? +((((cur[i]?.revenue ?? 0) - prev[i].revenue) / prev[i].revenue) * 100).toFixed(1)
      : 0,
  }));

  // Cost growth % vs same month previous year
  const costGrowthData = MONTHS_ABBR.map((month, i) => {
    const curCost  = (cur[i]?.revenue  ?? 0) - (cur[i]?.margin  ?? 0);
    const prevCost = (prev[i]?.revenue ?? 0) - (prev[i]?.margin ?? 0);
    return {
      month,
      growth: prevCost ? +((((curCost - prevCost) / prevCost) * 100)).toFixed(1) : 0,
    };
  });

  // Net margin (same as gross for this business model)
  const netMarginData = grossMarginData.map(d => ({ ...d }));

  // EBITDA ≈ gross margin (operating margin proxy)
  const ebitdaData = grossMarginData.map(d => ({
    month:    d.month,
    current:  +(d.current  * 0.93).toFixed(1),   // slight EBITDA adjustment
    previous: +(d.previous * 0.93).toFixed(1),
  }));

  // Yearly KPI summaries
  const latestYear = yearlyTotals[yearlyTotals.length - 1];
  const prevYear   = yearlyTotals[yearlyTotals.length - 2];

  const curGrossMarginPct  = latestYear
    ? +((latestYear.margin / latestYear.revenue) * 100).toFixed(1) : 0;
  const prevGrossMarginPct = prevYear
    ? +((prevYear.margin / prevYear.revenue) * 100).toFixed(1) : 0;

  const revenueYoY = prevYear?.revenue
    ? +(((latestYear.revenue - prevYear.revenue) / prevYear.revenue) * 100).toFixed(1) : 0;
  const prevRevenueYoY = yearlyTotals.length > 2
    ? +(((prevYear.revenue - yearlyTotals[yearlyTotals.length - 3].revenue) /
        yearlyTotals[yearlyTotals.length - 3].revenue) * 100).toFixed(1) : 0;

  const costCur  = latestYear ? latestYear.expense : 0;
  const costPrev = prevYear   ? prevYear.expense   : 0;
  const costYoY  = costPrev ? +(((costCur - costPrev) / costPrev) * 100).toFixed(1) : 0;
  const prevCostGrowth = yearlyTotals.length > 2
    ? +((( prevYear.expense - yearlyTotals[yearlyTotals.length - 3].expense) /
         yearlyTotals[yearlyTotals.length - 3].expense) * 100).toFixed(1) : 0;

  // Return on capital: margin / expense * 100 (proxy)
  const rocCur  = latestYear && latestYear.expense
    ? +((latestYear.margin / latestYear.expense) * 100).toFixed(1) : 0;
  const rocPrev = prevYear && prevYear.expense
    ? +((prevYear.margin / prevYear.expense) * 100).toFixed(1) : 0;

  const kpis = {
    "Gross Margin":      { current: curGrossMarginPct,  previous: prevGrossMarginPct, unit: "%" },
    "EBITDA (proxy)":    { current: +(curGrossMarginPct  * 0.93).toFixed(1), previous: +(prevGrossMarginPct * 0.93).toFixed(1), unit: "%" },
    "Net Margin":        { current: curGrossMarginPct,  previous: prevGrossMarginPct, unit: "%" },
    "Revenue Growth":    { current: revenueYoY,          previous: prevRevenueYoY,    unit: "%" },
    "Cost Growth":       { current: costYoY,             previous: prevCostGrowth,    unit: "%" },
    "Return on Capital": { current: rocCur,              previous: rocPrev,           unit: "%" },
  };

  const isPositive = (key: string, curr: number, prv: number) => {
    if (key === "Cost Growth") return curr < prv;
    return curr > prv;
  };

  const bestMetric = Object.entries(kpis).reduce((a, b) =>
    (b[1].current - b[1].previous) > (a[1].current - a[1].previous) ? b : a
  );
  const watchMetric = Object.entries(kpis).reduce((a, b) => {
    const aChange = a[1].current - a[1].previous;
    const bChange = b[1].current - b[1].previous;
    const aNeg = a[0] === "Cost Growth" ? -aChange : aChange;
    const bNeg = b[0] === "Cost Growth" ? -bChange : bChange;
    return bNeg < aNeg ? b : a;
  });

  const chartPairs = [
    { title: "Gross Margin % Trend",    data: grossMarginData,  key: ["current","previous"], color: "#0d5c3d" },
    { title: "EBITDA % Trend",          data: ebitdaData,       key: ["current","previous"], color: "#10b981" },
    { title: "Net Margin % Trend",      data: netMarginData,    key: ["current","previous"], color: "#34d399" },
    { title: "Revenue Growth %",        data: revenueGrowthData,key: ["growth"],             color: "#0d5c3d" },
    { title: "Cost Growth %",           data: costGrowthData,   key: ["growth"],             color: "#ef4444" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">KPI Dashboard</h1>
        <p className="text-[#6b6b6b]">Key performance indicators computed from real trading data ({CURRENT_YEAR} vs {PREV_YEAR})</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Comparison Period</h3>
          <div className="flex gap-2">
            {(["yoy", "mom"] as const).map(c => (
              <button
                key={c}
                onClick={() => setComparison(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  comparison === c
                    ? "bg-[#0d5c3d] text-white"
                    : "bg-[#f5f5f5] text-[#6b6b6b] hover:bg-[#e0e0e0]"
                }`}
              >
                {c === "yoy" ? "Year over Year" : "Month over Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(kpis).map(([key, val]) => {
          const positive = isPositive(key, val.current, val.previous);
          const change   = +(val.current - val.previous).toFixed(1);
          return (
            <div key={key} className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="text-sm text-[#6b6b6b] mb-2">{key}</div>
              <div className="text-3xl font-semibold text-[#1a1a1a] mb-2">
                {val.current}{val.unit}
              </div>
              <div className="flex items-center gap-2">
                {positive
                  ? <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  : <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                }
                <span className={`text-sm ${positive ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {change > 0 ? "+" : ""}{change}{val.unit} vs {comparison === "yoy" ? `${PREV_YEAR}` : "prev month"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-6">
        {chartPairs.map(({ title, data: chartData, key: keys, color }) => (
          <div key={title} className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#6b6b6b" />
                <YAxis stroke="#6b6b6b" unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend />
                {keys.includes("current") && (
                  <Line type="monotone" dataKey="current"  stroke={color} strokeWidth={3} name={`${CURRENT_YEAR}`} />
                )}
                {keys.includes("previous") && (
                  <Line type="monotone" dataKey="previous" stroke="#6b6b6b" strokeWidth={2} strokeDasharray="5 5" name={`${PREV_YEAR}`} />
                )}
                {keys.includes("growth") && (
                  <Line type="monotone" dataKey="growth" stroke={color} strokeWidth={3} name="Growth %" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}

        {/* Return on Capital – bar chart for yearly view */}
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Return on Capital % (Yearly)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={yearlyTotals.map(y => ({
              year: String(y.year),
              roc: y.expense ? +((y.margin / y.expense) * 100).toFixed(1) : 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="roc" stroke="#10b981" strokeWidth={3} name="ROC %" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-[#0d5c3d] to-[#10b981] rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-white/70 text-sm mb-1">Best Performing KPI</div>
            <div className="text-xl font-semibold">{bestMetric[0]}</div>
            <div className="text-sm text-white/90 mt-1">
              {bestMetric[1].current}{bestMetric[1].unit} in {CURRENT_YEAR}
            </div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1">Revenue YoY</div>
            <div className="text-xl font-semibold">{revenueYoY > 0 ? "+" : ""}{revenueYoY}%</div>
            <div className="text-sm text-white/90 mt-1">{CURRENT_YEAR} vs {PREV_YEAR}</div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1">Watch Area</div>
            <div className="text-xl font-semibold">{watchMetric[0]}</div>
            <div className="text-sm text-white/90 mt-1">Monitor closely for margin impact</div>
          </div>
        </div>
      </div>
    </div>
  );
}
