import { useEffect, useState } from "react";
import { AlertTriangle, TrendingDown, Globe, DollarSign, Loader2 } from "lucide-react";
import { api } from "../services/api";
import type { RiskData, LowMarginProduct, VolatileProduct, CurrencyExposure } from "../types/api";

export function RiskOverview() {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    api.risk(2025)
      .then(setRiskData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading risk overview…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  const lowMargin  = riskData?.lowMarginProducts    ?? [];
  const volatile   = riskData?.highVolatilityProducts ?? [];
  const currencies = riskData?.currencyExposure      ?? [];

  const totalExposure = currencies.reduce((s, c) => s + Number(c.exposure), 0);

  // Compute overall risk score from data
  const avgLowMarginPct = lowMargin.length
    ? lowMargin.reduce((s, p) => s + Number(p.margin), 0) / lowMargin.length
    : 5;
  const overallRiskScore = +(Math.min(10, 10 - (avgLowMarginPct / 2))).toFixed(1);
  const tradeSafetyStatus = overallRiskScore >= 7 ? "Risky" : overallRiskScore >= 4 ? "Moderate" : "Safe";

  const getRiskColor = (level: string) => {
    if (level === "High")   return "text-[#ef4444] bg-[#fef2f2]";
    if (level === "Medium") return "text-[#f59e0b] bg-[#fffbeb]";
    return "text-[#10b981] bg-[#f0fdf4]";
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-[#ef4444]";
    if (score >= 4) return "text-[#f59e0b]";
    return "text-[#10b981]";
  };

  const getSafetyColor = (status: string) => {
    if (status === "Risky")    return "bg-[#ef4444]";
    if (status === "Moderate") return "bg-[#f59e0b]";
    return "bg-[#10b981]";
  };

  // Top product by margin for the recommendation card
  const topLowMarginProduct = lowMargin[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Risk Overview</h1>
        <p className="text-[#6b6b6b]">Real-time risk assessment based on live trading data</p>
      </div>

      {/* Risk Score Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#f5f5f5] rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[#f59e0b]" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[#6b6b6b] mb-1">Overall Risk Score</div>
              <div className={`text-4xl font-semibold ${getScoreColor(overallRiskScore)}`}>
                {overallRiskScore}/10
              </div>
              <div className="text-xs text-[#6b6b6b] mt-1">Derived from live margin data</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f59e0b] rounded-full transition-all"
                style={{ width: `${(overallRiskScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 ${getSafetyColor(tradeSafetyStatus)} rounded-full flex items-center justify-center`}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[#6b6b6b] mb-1">Trade Safety Indicator</div>
              <div className="text-4xl font-semibold text-[#1a1a1a]">{tradeSafetyStatus}</div>
              <div className="text-xs text-[#6b6b6b] mt-1">Market &amp; operational assessment</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {["Safe","Moderate","Risky"].map(s => (
              <div key={s} className={`flex-1 text-center p-2 rounded text-xs ${s === tradeSafetyStatus ? getSafetyColor(s) + " text-white" : "bg-[#f5f5f5]"}`}>
                <span className="font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Margin Products */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-[#ef4444]" />
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Low Margin Products</h3>
        </div>
        <p className="text-sm text-[#6b6b6b] mb-4">Products with margin below 5% in 2025</p>
        {lowMargin.length === 0 ? (
          <p className="text-[#6b6b6b] text-sm py-4">No low-margin products found — great performance!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#e0e0e0]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Origin</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Margin %</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {lowMargin.map((p: LowMarginProduct, i) => (
                  <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                    <td className="py-3 px-4 text-sm font-medium">{p.product}</td>
                    <td className="py-3 px-4 text-sm text-[#6b6b6b]">{p.origin}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-[#ef4444]">{p.margin}%</td>
                    <td className="py-3 px-4 text-sm text-right">{p.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* High Volatility Products */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          <h3 className="text-lg font-semibold text-[#1a1a1a]">High Cost Volatility Products</h3>
        </div>
        <p className="text-sm text-[#6b6b6b] mb-4">Products with high margin variance (stddev of monthly margin)</p>
        {volatile.length === 0 ? (
          <p className="text-[#6b6b6b] text-sm py-4">No high-volatility products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#e0e0e0]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Volatility (σ)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Avg Margin</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#1a1a1a]">Active Months</th>
                </tr>
              </thead>
              <tbody>
                {volatile.map((p: VolatileProduct, i) => (
                  <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f5f5f5]">
                    <td className="py-3 px-4 text-sm font-medium">{p.product}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-[#f59e0b]">€{Number(p.volatility).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right">€{Number(p.avg_margin).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right">{p.active_months}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Currency Exposure */}
      <div className="bg-white rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-[#0d5c3d]" />
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Currency Exposure</h3>
        </div>
        <p className="text-sm text-[#6b6b6b] mb-4">Revenue exposure by billing currency based on origin region</p>
        <div className="space-y-4">
          {currencies.map((c: CurrencyExposure, i) => {
            const pct = totalExposure ? ((Number(c.exposure) / totalExposure) * 100).toFixed(1) : "0";
            return (
              <div key={i} className="p-4 bg-[#f5f5f5] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-[#1a1a1a]">{c.currency}</div>
                    <div className="text-sm text-[#6b6b6b]">€{Number(c.exposure).toLocaleString()} ({pct}% of total)</div>
                  </div>
                </div>
                <div className="h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0d5c3d] rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-[#0d5c3d] to-[#10b981] rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Risk Mitigation Recommendations</h3>
        <ul className="space-y-3">
          {[
            {
              title: "Focus on High-Margin Products",
              body: topLowMarginProduct
                ? `Review pricing for ${topLowMarginProduct.product} (${topLowMarginProduct.margin}% margin) to improve profitability`
                : "All products are performing above the risk threshold — maintain current strategy",
            },
            {
              title: "Monitor Margin Volatility",
              body: volatile.length
                ? `${volatile[0]?.product} shows the highest margin variance — consider forward contracts`
                : "Margin stability is good across all products",
            },
            {
              title: "Currency Risk Management",
              body: `${currencies[0]?.currency ?? "EUR"} is the primary exposure at ${totalExposure ? ((Number(currencies[0]?.exposure ?? 0) / totalExposure) * 100).toFixed(0) : 0}% of revenue — consider hedging strategies`,
            },
          ].map((rec, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold">{i + 1}</span>
              </div>
              <div>
                <div className="font-medium mb-1">{rec.title}</div>
                <div className="text-sm text-white/90">{rec.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
