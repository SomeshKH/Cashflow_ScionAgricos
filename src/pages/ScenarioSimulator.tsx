import { useState, useEffect } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { api } from "../services/api";
import type { KpiSummary } from "../types/api";

const DEFAULT_CONTAINERS = 30;

export function ScenarioSimulator() {
  const [kpi,     setKpi]     = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [containers,   setContainers]   = useState(DEFAULT_CONTAINERS);
  const [costIncrease, setCostIncrease] = useState(0);
  const [priceDecrease,setPriceDecrease]= useState(0);
  const [freightChange,setFreightChange]= useState(0);
  const [seasonDelay,  setSeasonDelay]  = useState(0);

  useEffect(() => {
    api.summary(2025)
      .then(setKpi)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading scenario data…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  const baseRevenue      = kpi!.totalRevenue;
  const baseEbitda       = Math.round(kpi!.totalMargin * 0.93);
  const baseNetProfit    = kpi!.totalMargin;
  const baseCashRequired = kpi!.totalExpense;

  const calculateSimulated = () => {
    const containerMultiplier = containers / DEFAULT_CONTAINERS;
    const revenueMultiplier   = containerMultiplier * (1 - priceDecrease / 100);
    const costMultiplier      = containerMultiplier * (1 + costIncrease / 100) * (1 + freightChange / 100);
    const delayPenalty        = 1 - (seasonDelay * 0.015);

    return {
      revenue:      baseRevenue      * revenueMultiplier * delayPenalty,
      ebitda:       baseEbitda       * revenueMultiplier * delayPenalty * (1 - costIncrease / 200),
      netProfit:    baseNetProfit    * revenueMultiplier * delayPenalty * (1 - costIncrease / 150),
      cashRequired: baseCashRequired * costMultiplier,
    };
  };

  const current  = { revenue: baseRevenue, ebitda: baseEbitda, netProfit: baseNetProfit, cashRequired: baseCashRequired };
  const simulated = calculateSimulated();

  const resetAll = () => {
    setContainers(DEFAULT_CONTAINERS);
    setCostIncrease(0);
    setPriceDecrease(0);
    setFreightChange(0);
    setSeasonDelay(0);
  };

  const getChangePercent = (cur: number, sim: number) =>
    (((sim - cur) / cur) * 100).toFixed(1);

  const getChangeColor = (cur: number, sim: number) =>
    sim - cur >= 0 ? "text-[#10b981]" : "text-[#ef4444]";

  const fmt = (n: number) =>
    n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(2)}M` : `€${(n / 1_000).toFixed(0)}K`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Scenario Simulator</h1>
        <p className="text-[#6b6b6b]">Model different scenarios and assess financial impact (based on 2025 actual data)</p>
      </div>

      {/* Controls */}
      <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Simulation Parameters</h3>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 border border-[#e0e0e0] rounded-lg hover:bg-[#f5f5f5] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Reset All</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Container Count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Container Count</label>
              <span className="text-sm font-semibold text-[#0d5c3d]">{containers} units</span>
            </div>
            <input
              type="range" min="10" max="60" value={containers}
              onChange={e => setContainers(Number(e.target.value))}
              className="w-full h-2 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer accent-[#0d5c3d]"
            />
            <div className="flex justify-between text-xs text-[#6b6b6b] mt-1">
              <span>10</span><span>60</span>
            </div>
          </div>

          {/* Cost Increase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Cost Increase %</label>
              <span className="text-sm font-semibold text-[#ef4444]">+{costIncrease}%</span>
            </div>
            <input
              type="range" min="0" max="30" value={costIncrease}
              onChange={e => setCostIncrease(Number(e.target.value))}
              className="w-full h-2 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer accent-[#ef4444]"
            />
            <div className="flex justify-between text-xs text-[#6b6b6b] mt-1">
              <span>0%</span><span>30%</span>
            </div>
          </div>

          {/* Price Decrease */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Price Decrease %</label>
              <span className="text-sm font-semibold text-[#ef4444]">-{priceDecrease}%</span>
            </div>
            <input
              type="range" min="0" max="25" value={priceDecrease}
              onChange={e => setPriceDecrease(Number(e.target.value))}
              className="w-full h-2 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer accent-[#ef4444]"
            />
            <div className="flex justify-between text-xs text-[#6b6b6b] mt-1">
              <span>0%</span><span>25%</span>
            </div>
          </div>

          {/* Freight Change */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Freight Cost Change %</label>
              <span className={`text-sm font-semibold ${freightChange >= 0 ? "text-[#ef4444]" : "text-[#10b981]"}`}>
                {freightChange >= 0 ? "+" : ""}{freightChange}%
              </span>
            </div>
            <input
              type="range" min="-15" max="30" value={freightChange}
              onChange={e => setFreightChange(Number(e.target.value))}
              className="w-full h-2 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer accent-[#0d5c3d]"
            />
            <div className="flex justify-between text-xs text-[#6b6b6b] mt-1">
              <span>-15%</span><span>+30%</span>
            </div>
          </div>

          {/* Season Delay */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Season Delay (weeks)</label>
              <span className="text-sm font-semibold text-[#ef4444]">{seasonDelay} weeks</span>
            </div>
            <input
              type="range" min="0" max="12" value={seasonDelay}
              onChange={e => setSeasonDelay(Number(e.target.value))}
              className="w-full h-2 bg-[#e0e0e0] rounded-lg appearance-none cursor-pointer accent-[#ef4444]"
            />
            <div className="flex justify-between text-xs text-[#6b6b6b] mt-1">
              <span>0</span><span>12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-6">
        {/* Current */}
        <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">Current Scenario (2025 Actual)</h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-[#6b6b6b] mb-1">Revenue</div>
              <div className="text-3xl font-semibold text-[#1a1a1a]">{fmt(current.revenue)}</div>
            </div>
            <div>
              <div className="text-sm text-[#6b6b6b] mb-1">EBITDA (proxy)</div>
              <div className="text-3xl font-semibold text-[#1a1a1a]">{fmt(current.ebitda)}</div>
            </div>
            <div>
              <div className="text-sm text-[#6b6b6b] mb-1">Net Margin</div>
              <div className="text-3xl font-semibold text-[#1a1a1a]">{fmt(current.netProfit)}</div>
            </div>
            <div>
              <div className="text-sm text-[#6b6b6b] mb-1">Cash Required (Expenses)</div>
              <div className="text-3xl font-semibold text-[#1a1a1a]">{fmt(current.cashRequired)}</div>
            </div>
          </div>
        </div>

        {/* Simulated */}
        <div className="bg-gradient-to-br from-[#0d5c3d] to-[#10b981] rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-6">Simulated Scenario</h3>
          <div className="space-y-6">
            {(["revenue","ebitda","netProfit","cashRequired"] as const).map(key => {
              const labels = { revenue: "Revenue", ebitda: "EBITDA (proxy)", netProfit: "Net Margin", cashRequired: "Cash Required" };
              const sim = simulated[key];
              const cur = current[key];
              const pct = getChangePercent(cur, sim);
              const isGood = key === "cashRequired" ? sim <= cur : sim >= cur;
              return (
                <div key={key}>
                  <div className="text-white/70 text-sm mb-1">{labels[key]}</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-semibold">{fmt(sim)}</div>
                    <div className={`text-sm font-medium ${isGood ? "text-white" : "text-white/70"}`}>
                      ({Number(pct) > 0 ? "+" : ""}{pct}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Impact Summary</h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Revenue Impact",  cur: current.revenue,      sim: simulated.revenue,      goodWhenPos: true  },
            { label: "EBITDA Impact",   cur: current.ebitda,       sim: simulated.ebitda,       goodWhenPos: true  },
            { label: "Profit Impact",   cur: current.netProfit,    sim: simulated.netProfit,    goodWhenPos: true  },
            { label: "Capital Impact",  cur: current.cashRequired, sim: simulated.cashRequired, goodWhenPos: false },
          ].map(({ label, cur, sim, goodWhenPos }) => {
            const pct  = getChangePercent(cur, sim);
            const good = goodWhenPos ? Number(pct) >= 0 : Number(pct) <= 0;
            return (
              <div key={label} className="text-center p-4 bg-[#f5f5f5] rounded-lg">
                <div className="text-sm text-[#6b6b6b] mb-2">{label}</div>
                <div className={`text-2xl font-semibold ${good ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {Number(pct) > 0 ? "+" : ""}{pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
