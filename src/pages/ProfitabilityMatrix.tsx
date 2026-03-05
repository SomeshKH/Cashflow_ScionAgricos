import { useState, useEffect } from "react";
import { ArrowUpDown, Search, Loader2 } from "lucide-react";
import { api } from "../services/api";
import type { ProfitabilityRow } from "../types/api";

export function ProfitabilityMatrix() {
  const [data,         setData]         = useState<ProfitabilityRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [sortField,    setSortField]    = useState<string | null>(null);
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("desc");
  const [showHeatmap,  setShowHeatmap]  = useState(true);

  useEffect(() => {
    api.profitability(2025)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const getMarginColor = (value: number) => {
    if (!showHeatmap) return "";
    if (value >= 15)  return "bg-[#d1fae5]";
    if (value >= 8)   return "bg-[#e8f5f0]";
    if (value >= 4)   return "bg-[#f0fdf4]";
    return "bg-[#fef2f2]";
  };

  let filtered = data.filter(row =>
    row.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.origin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      const av = Number((a as any)[sortField] ?? 0);
      const bv = Number((b as any)[sortField] ?? 0);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }

  const avgGrossMargin = filtered.length
    ? (filtered.reduce((s, r) => s + Number(r.grossMargin), 0) / filtered.length).toFixed(1)
    : "—";
  const bestRow = filtered.reduce<ProfitabilityRow | null>((best, r) =>
    !best || Number(r.grossMargin) > Number(best.grossMargin) ? r : best, null);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading profitability matrix…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-2 hover:text-[#0d5c3d] ml-auto">
      {label}<ArrowUpDown className="w-4 h-4" />
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Profitability Matrix</h1>
        <p className="text-[#6b6b6b]">Comprehensive margin analysis by product × origin (2025 data)</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b6b6b]" />
              <input
                type="text"
                placeholder="Search product or origin..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#e0e0e0] rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6b6b6b]">Heatmap</span>
            <button
              onClick={() => setShowHeatmap(h => !h)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showHeatmap ? "bg-[#0d5c3d]" : "bg-[#e0e0e0]"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showHeatmap ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#e0e0e0]">
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#1a1a1a]">
                  <button onClick={() => handleSort("product")} className="flex items-center gap-2 hover:text-[#0d5c3d]">Product <ArrowUpDown className="w-4 h-4" /></button>
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#1a1a1a]">
                  <button onClick={() => handleSort("origin")} className="flex items-center gap-2 hover:text-[#0d5c3d]">Origin <ArrowUpDown className="w-4 h-4" /></button>
                </th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]"><SortButton field="kgs" label="Kgs" /></th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]"><SortButton field="cost" label="Cost (€)" /></th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]"><SortButton field="revenue" label="Revenue (€)" /></th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-[#1a1a1a]"><SortButton field="grossMargin" label="Gross Margin %" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                  <td className="py-4 px-4 text-sm font-medium">{row.product}</td>
                  <td className="py-4 px-4 text-sm text-[#6b6b6b]">{row.origin}</td>
                  <td className="py-4 px-4 text-sm text-right">{Number(row.kgs).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-right">€{Number(row.cost).toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-right font-medium">€{Number(row.revenue).toLocaleString()}</td>
                  <td className={`py-4 px-4 text-sm text-right font-semibold ${getMarginColor(Number(row.grossMargin))}`}>
                    {row.grossMargin}%
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-[#6b6b6b] text-sm">No records match the search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">Avg Gross Margin</div>
          <div className="text-3xl font-semibold text-[#0d5c3d]">{avgGrossMargin}%</div>
          <div className="text-xs text-[#6b6b6b] mt-1">Across {filtered.length} product-origin pairs</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">Highest Margin Combo</div>
          <div className="text-lg font-semibold text-[#1a1a1a]">{bestRow ? `${bestRow.product}` : "—"}</div>
          <div className="text-sm text-[#10b981]">{bestRow ? `${bestRow.origin} – ${bestRow.grossMargin}%` : ""}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="text-sm text-[#6b6b6b] mb-2">Total Revenue (filtered)</div>
          <div className="text-3xl font-semibold text-[#0d5c3d]">
            €{(filtered.reduce((s, r) => s + Number(r.revenue), 0) / 1_000_000).toFixed(2)}M
          </div>
        </div>
      </div>
    </div>
  );
}
