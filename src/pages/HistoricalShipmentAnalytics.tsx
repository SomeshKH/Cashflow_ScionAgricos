import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Loader2 } from "lucide-react";
import { api } from "../services/api";
import type { HistoricalShipment, YearlyTotal, ProductData, OriginData, PersonYearData } from "../types/api";

const COLORS = ["#0d5c3d","#10b981","#34d399","#6ee7b7","#a7f3d0","#d1fae5","#065f46","#047857"];
const PERSON_COLORS = ["#0d5c3d","#10b981","#34d399","#6ee7b7"];

export function HistoricalShipmentAnalytics() {
  const [shipments,    setShipments]    = useState<HistoricalShipment[]>([]);
  const [yearlyTotals, setYearlyTotals] = useState<YearlyTotal[]>([]);
  const [products,     setProducts]     = useState<ProductData[]>([]);
  const [origins,      setOrigins]      = useState<OriginData[]>([]);
  const [personData,   setPersonData]   = useState<PersonYearData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const [selectedYear,    setSelectedYear]    = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedOrigin,  setSelectedOrigin]  = useState("all");

  // ─── IMPORTANT: All hooks MUST be called before any conditional returns ─────

  // Derived filter options
  const uniqueYears    = useMemo(() => [...new Set(shipments.map(r => String(r.year)))].sort(), [shipments]);
  const uniqueProducts = useMemo(() => [...new Set(shipments.map(r => r.product))].sort(), [shipments]);
  const uniqueOrigins  = useMemo(() => [...new Set(shipments.map(r => r.origin))].sort(), [shipments]);

  // Filtered table data
  // Filtered table data
const filtered = useMemo(() =>
  shipments.filter(r =>
    (selectedYear === "all" || String(r.year) === selectedYear) &&
    (selectedProduct === "all" || r.product === selectedProduct) &&
    (selectedOrigin === "all" || r.origin === selectedOrigin)
  ),
  [shipments, selectedYear, selectedProduct, selectedOrigin]
);

  const totalRevenue = useMemo(() => filtered.reduce((s, r) => s + Number(r.revenue), 0), [filtered]);
  const totalMargin  = useMemo(() => filtered.reduce((s, r) => s + Number(r.margin),  0), [filtered]);
  const totalTx      = useMemo(() => filtered.reduce((s, r) => s + Number(r.transactions), 0), [filtered]);
  const avgMarginPct = useMemo(() => totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : "—", [totalRevenue, totalMargin]);

  // Chart data
  const revenueData   = useMemo(() => yearlyTotals.map(y => ({ year: String(y.year), revenue: Number(y.revenue) })), [yearlyTotals]);
  const costData      = useMemo(() => yearlyTotals.map(y => ({ year: String(y.year), cost:    Number(y.expense) })), [yearlyTotals]);
  const profitPctData = useMemo(() => yearlyTotals.map(y => ({ year: String(y.year), profit:  Number(y.marginPct) })), [yearlyTotals]);

  const revenueByProduct = useMemo(() => products.slice(0, 8).map(p => ({ product: p.product, revenue: Number(p.revenue) })), [products]);
  const revenueByOrigin  = useMemo(() => origins.slice(0, 8).map(o  => ({ origin:  o.origin,  revenue: Number(o.revenue) })), [origins]);

  const years       = useMemo(() => [...new Set(personData.map(p => String(p.year)))].sort(), [personData]);
  const personNames = useMemo(() => [...new Set(personData.map(p => p.person))], [personData]);

  const personComparisonData = useMemo(() => years.map(year => {
    const row: Record<string, string | number> = { year };
    personNames.forEach(p => {
      const found = personData.find(d => d.person === p && String(d.year) === year);
      row[p] = found ? Number(found.margin) : 0;
    });
    return row;
  }), [years, personNames, personData]);

  // ─── Now we can have conditional returns ───────────────────────────────────

  useEffect(() => {
    Promise.all([
      api.historicalShipments(),
      api.yearlyTotals(),
      api.products(),
      api.origins(),
      api.personYearData(),
    ])
      .then(([sh, yt, pr, or_, pyd]) => {
        setShipments(sh);
        setYearlyTotals(yt);
        setProducts(pr);
        setOrigins(or_);
        setPersonData(pyd);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading analytics…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Historical Shipment Analytics</h1>
        <p className="text-[#6b6b6b]">
          {uniqueYears.join(", ")} — comprehensive data across all traders and products
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Filters</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Year",    value: selectedYear,    options: uniqueYears,    setter: setSelectedYear    },
            { label: "Product", value: selectedProduct, options: uniqueProducts, setter: setSelectedProduct },
            { label: "Origin",  value: selectedOrigin,  options: uniqueOrigins,  setter: setSelectedOrigin  },
          ].map(({ label, value, options, setter }) => (
            <div key={label}>
              <label className="block text-sm text-[#6b6b6b] mb-2">{label}</label>
              <select
                value={value}
                onChange={e => setter(e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-white"
              >
                <option value="all">All {label}s</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: "Revenue",      value: `€${totalRevenue.toLocaleString()}` },
            { label: "Net Margin",   value: `€${totalMargin.toLocaleString()}` },
            { label: "Margin %",     value: `${avgMarginPct}%` },
            { label: "Transactions", value: totalTx.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#f5f5f5] rounded-lg p-4">
              <div className="text-xs text-[#6b6b6b] mb-1">{label}</div>
              <div className="text-xl font-semibold text-[#0d5c3d]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Revenue Trend (€)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0d5c3d" strokeWidth={3} name="Revenue (€)" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Cost Trend (€)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} name="Cost (€)" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Margin % Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={profitPctData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#0d5c3d" strokeWidth={3} name="Margin %" dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Revenue by Product (Top 8)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={revenueByProduct}
                dataKey="revenue"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ product, percent }: any) => `${product} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {revenueByProduct.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Revenue by Origin</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByOrigin} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000_000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="origin" stroke="#6b6b6b" width={100} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#0d5c3d" name="Revenue (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Margin by Trader per Year</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={personComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#6b6b6b" />
              <YAxis stroke="#6b6b6b" tickFormatter={v => `€${(v / 1_000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend />
              {personNames.map((p, i) => (
                <Bar key={p} dataKey={p} stackId="a" fill={PERSON_COLORS[i % PERSON_COLORS.length]} name={p} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">
          Shipment Records Table
          <span className="ml-2 text-sm font-normal text-[#6b6b6b]">
            ({filtered.length} record{filtered.length !== 1 ? "s" : ""} shown)
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e0e0e0]">
                {["Year","Product","Origin","Tx","Revenue","Net Margin","Margin %"].map(h => (
                  <th key={h} className={`py-3 px-4 text-sm font-medium text-[#6b6b6b] ${h==="Year"||h==="Product"||h==="Origin" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                  <td className="py-3 px-4 text-sm">{row.year}</td>
                  <td className="py-3 px-4 text-sm">{row.product}</td>
                  <td className="py-3 px-4 text-sm">{row.origin}</td>
                  <td className="py-3 px-4 text-sm text-right">{row.transactions}</td>
                  <td className="py-3 px-4 text-sm text-right">€{Number(row.revenue).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right text-[#10b981] font-medium">€{Number(row.margin).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-[#0d5c3d]">{row.marginPct}%</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-[#6b6b6b] text-sm">No records match the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
