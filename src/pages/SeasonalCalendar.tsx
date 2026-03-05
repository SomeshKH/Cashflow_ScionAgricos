import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../services/api";
import type { SeasonalMonthData } from "../types/api";

// Domain-knowledge metadata per calendar month (season labels, qualitative levels, transit times)
const MONTH_META = [
  { name: "January",   season: "Off-Peak",    export: "Low",    shipping: "Limited",   transit: 28 },
  { name: "February",  season: "Pre-Season",  export: "Low",    shipping: "Available", transit: 25 },
  { name: "March",     season: "Pre-Season",  export: "Medium", shipping: "Available", transit: 25 },
  { name: "April",     season: "Peak Start",  export: "High",   shipping: "High",      transit: 22 },
  { name: "May",       season: "Peak",        export: "High",   shipping: "High",      transit: 22 },
  { name: "June",      season: "Peak",        export: "High",   shipping: "High",      transit: 20 },
  { name: "July",      season: "Peak",        export: "High",   shipping: "Medium",    transit: 22 },
  { name: "August",    season: "Late Peak",   export: "Medium", shipping: "Medium",    transit: 24 },
  { name: "September", season: "Transition",  export: "Medium", shipping: "Available", transit: 26 },
  { name: "October",   season: "Post-Season", export: "Low",    shipping: "Available", transit: 28 },
  { name: "November",  season: "Off-Peak",    export: "Low",    shipping: "Limited",   transit: 30 },
  { name: "December",  season: "Off-Peak",    export: "Low",    shipping: "Limited",   transit: 32 },
];

export function SeasonalCalendar() {
  const [seasonal, setSeasonal] = useState<SeasonalMonthData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    api.seasonal()
      .then(setSeasonal)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading seasonal data…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  // Merge API margins (indexed by month 1–12) into the metadata
  const marginByMonth: Record<number, number> = {};
  seasonal.forEach(d => { marginByMonth[d.month] = Number(d.avg_margin_pct); });

  const monthlyData = MONTH_META.map((meta, i) => ({
    ...meta,
    margin: marginByMonth[i + 1] ?? 0,
  }));

  // Build 52-week view by distributing monthly margins across weeks
  const weeklyData = Array.from({ length: 52 }, (_, i) => {
    const weekNum  = i + 1;
    const monthIdx = Math.min(Math.floor((weekNum - 1) / 4.333), 11); // 0-based
    const margin   = monthlyData[monthIdx]?.margin ?? 0;
    const meta     = MONTH_META[monthIdx];
    return {
      week:     weekNum,
      harvest:  meta.export === "High" ? "High" : meta.export === "Medium" ? "Medium" : "Low",
      supply:   meta.export === "High" ? "Peak" : meta.export === "Medium" ? "Available" : "Low",
      shipping: meta.shipping,
      margin,
    };
  });

  const getExportColor = (level: string) => {
    if (level === "High" || level === "Optimal") return "bg-[#0d5c3d] text-white";
    if (level === "Medium" || level === "Available") return "bg-[#10b981] text-white";
    return "bg-[#e0e0e0] text-[#6b6b6b]";
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 15) return "bg-[#0d5c3d]";
    if (margin >= 10) return "bg-[#10b981]";
    if (margin >= 6)  return "bg-[#34d399]";
    if (margin >= 3)  return "bg-[#6ee7b7]";
    return "bg-[#a7f3d0]";
  };

  const bestMonth   = [...monthlyData].sort((a, b) => b.margin - a.margin)[0];
  const shortestTransit = [...monthlyData].sort((a, b) => a.transit - b.transit)[0];
  const peakMonths  = monthlyData.filter(m => m.export === "High");
  const peakLabel   = peakMonths.length
    ? `${peakMonths[0].name.slice(0,3)} – ${peakMonths[peakMonths.length - 1].name.slice(0,3)}`
    : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Seasonal Calendar</h1>
        <p className="text-[#6b6b6b]">Annual export patterns and margin performance by month (multi-year average)</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e0e0e0]">
        {(["monthly", "weekly"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#0d5c3d] text-[#0d5c3d]"
                : "border-transparent text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
          >
            {tab === "monthly" ? "Monthly View" : "Weekly View (52 Weeks)"}
          </button>
        ))}
      </div>

      {/* Monthly View */}
      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#e0e0e0]">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Month</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Season</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Export Level</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Shipping Window</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Transit Days</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]">Avg Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row, i) => (
                    <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                      <td className="py-4 px-4 text-sm font-medium">{row.name}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className="px-3 py-1 bg-[#e8f5f0] text-[#0d5c3d] rounded-full text-xs font-medium">
                          {row.season}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExportColor(row.export)}`}>
                          {row.export}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExportColor(row.shipping)}`}>
                          {row.shipping}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm">{row.transit} days</td>
                      <td className="py-4 px-4 text-right text-sm font-semibold text-[#0d5c3d]">
                        {row.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="text-sm text-[#6b6b6b] mb-2">Peak Export Season</div>
              <div className="text-2xl font-semibold text-[#1a1a1a] mb-1">{peakLabel}</div>
              <div className="text-sm text-[#10b981]">{peakMonths.length} months optimal window</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="text-sm text-[#6b6b6b] mb-2">Best Margin Month</div>
              <div className="text-2xl font-semibold text-[#1a1a1a] mb-1">{bestMonth?.name ?? "—"}</div>
              <div className="text-sm text-[#10b981]">{bestMonth?.margin.toFixed(1)}% average margin</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
              <div className="text-sm text-[#6b6b6b] mb-2">Shortest Transit</div>
              <div className="text-2xl font-semibold text-[#1a1a1a] mb-1">{shortestTransit?.name ?? "—"}</div>
              <div className="text-sm text-[#10b981]">{shortestTransit?.transit} days average</div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly View */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">52-Week Margin Heatmap</h3>
            <div className="grid grid-cols-13 gap-2">
              {weeklyData.map(week => (
                <div
                  key={week.week}
                  className={`aspect-square rounded flex items-center justify-center text-xs font-medium text-white ${getMarginColor(week.margin)}`}
                  title={`Week ${week.week}: ${week.margin.toFixed(1)}% margin`}
                >
                  {week.week}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Legend</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { color: "bg-[#0d5c3d]", label: "15%+ (Excellent)" },
                { color: "bg-[#10b981]", label: "10–15% (Very Good)" },
                { color: "bg-[#34d399]", label: "6–10% (Good)" },
                { color: "bg-[#6ee7b7]", label: "3–6% (Fair)" },
                { color: "bg-[#a7f3d0]", label: "<3% (Low)" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${color} rounded`} />
                  <span className="text-sm text-[#6b6b6b]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Data Table */}
          <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Weekly Analysis</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-[#e0e0e0]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Week</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Harvest Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Supply Level</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Shipping Window</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map(week => (
                    <tr key={week.week} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                      <td className="py-3 px-4 text-sm font-medium">Week {week.week}</td>
                      <td className="py-3 px-4 text-sm">{week.harvest}</td>
                      <td className="py-3 px-4 text-sm">{week.supply}</td>
                      <td className="py-3 px-4 text-sm">{week.shipping}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-[#0d5c3d]">
                        {week.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
