import { useEffect, useState } from "react";
import { Upload, TrendingUp, Loader2 } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../services/api";
import type { ForecastData } from "../types/api";

export function ForecastPlanning() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    api.forecast()
      .then(setForecastData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading forecast data…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  const { revenueData, expenseData, ebitdaData, profitData } = forecastData!;

  const fmt = (n: number) => n >= 1_000_000
    ? `€${(n / 1_000_000).toFixed(1)}M`
    : `€${(n / 1_000).toFixed(0)}K`;

  // Last actual vs last forecast for summary cards
  const lastActualRevenue   = revenueData.findLast(d => d.actual != null);
  const lastForecastRevenue = revenueData.findLast(d => d.forecast != null);
  const lastActualExpense   = expenseData.findLast(d => d.actual != null);
  const lastForecastExpense = expenseData.findLast(d => d.forecast != null);
  const lastEbitda          = ebitdaData[ebitdaData.length - 1];
  const lastProfit          = profitData[profitData.length - 1];

  const revenuePct = lastActualRevenue?.actual && lastForecastRevenue?.forecast
    ? +(((lastForecastRevenue.forecast - lastActualRevenue.actual) / lastActualRevenue.actual) * 100).toFixed(0)
    : null;

  const expensePct = lastActualExpense?.actual && lastForecastExpense?.forecast
    ? +(((lastForecastExpense.forecast - lastActualExpense.actual) / lastActualExpense.actual) * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Forecast Planning</h1>
        <p className="text-[#6b6b6b]">Revenue, expense, and profitability projections based on historical growth rates</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Refresh Forecast Data</h3>
            <p className="text-sm text-[#6b6b6b]">Projections auto-calculated from historical Excel data using growth trend analysis</p>
          </div>
          <button
            onClick={() => api.ingest().then(() => api.forecast().then(setForecastData))}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d5c3d] text-white rounded-lg hover:bg-[#0a4a30] transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Re-ingest Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">{lastForecastRevenue?.year} Revenue Forecast</div>
          <div className="text-3xl font-semibold text-[#1a1a1a] mb-2">
            {lastForecastRevenue?.forecast ? fmt(lastForecastRevenue.forecast) : "—"}
          </div>
          {revenuePct != null && (
            <div className="flex items-center gap-2 text-sm text-[#10b981]">
              <TrendingUp className="w-4 h-4" />
              <span>{revenuePct > 0 ? "+" : ""}{revenuePct}% from {lastActualRevenue?.year}</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">{lastForecastExpense?.year} Expense Forecast</div>
          <div className="text-3xl font-semibold text-[#1a1a1a] mb-2">
            {lastForecastExpense?.forecast ? fmt(lastForecastExpense.forecast) : "—"}
          </div>
          {expensePct != null && (
            <div className="flex items-center gap-2 text-sm text-[#ef4444]">
              <TrendingUp className="w-4 h-4" />
              <span>{expensePct > 0 ? "+" : ""}{expensePct}% from {lastActualExpense?.year}</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">{lastEbitda?.year} EBITDA Forecast</div>
          <div className="text-3xl font-semibold text-[#1a1a1a] mb-2">
            {lastEbitda?.value ? fmt(lastEbitda.value) : "—"}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#10b981]">
            <TrendingUp className="w-4 h-4" />
            <span>Projected margin growth</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">{lastProfit?.year} Net Profit Forecast</div>
          <div className="text-3xl font-semibold text-[#1a1a1a] mb-2">
            {lastProfit?.value ? fmt(lastProfit.value) : "—"}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#10b981]">
            <TrendingUp className="w-4 h-4" />
            <span>Based on avg growth trend</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Revenue Projection (€)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="actual"   stroke="#6b6b6b" strokeWidth={2} strokeDasharray="5 5" name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#0d5c3d" strokeWidth={3}  name="Forecast" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Expense Projection (€)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="actual"   stroke="#6b6b6b" strokeWidth={2} strokeDasharray="5 5" name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={3}  name="Forecast" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Margin Projection (€)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ebitdaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#0d5c3d" fill="#e8f5f0" name="Net Margin (€)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Profit Projection (€)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="#a7f3d0" name="Net Profit (€)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Revenue Forecast Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#e0e0e0]">
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Year</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Actual Revenue</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Forecast Revenue</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Net Margin</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((row, i) => (
                <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                  <td className="py-4 px-4 text-sm font-medium">{row.year}</td>
                  <td className="py-4 px-4 text-sm text-right text-[#6b6b6b]">
                    {row.actual != null ? `€${Number(row.actual).toLocaleString()}` : "—"}
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-semibold text-[#0d5c3d]">
                    {row.forecast != null ? `€${Number(row.forecast).toLocaleString()}` : "—"}
                  </td>
                  <td className="py-4 px-4 text-sm text-right text-[#10b981]">
                    {ebitdaData[i]?.value != null ? `€${Number(ebitdaData[i].value).toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
