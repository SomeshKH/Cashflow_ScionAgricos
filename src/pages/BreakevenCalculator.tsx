import { useState, useEffect } from "react";
import { Calculator, CheckCircle, Loader2 } from "lucide-react";
import { api } from "../services/api";

export function BreakevenCalculator() {
  const [productList, setProductList] = useState<string[]>([]);
  const [originList,  setOriginList]  = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [product,           setProduct]           = useState("");
  const [origin,            setOrigin]            = useState("");
  const [costPerKg,         setCostPerKg]         = useState(4.2);
  const [freightCost,       setFreightCost]       = useState(12000);
  const [containerCapacity, setContainerCapacity] = useState(18000);
  const [overheadPercent,   setOverheadPercent]   = useState(8);
  const [targetMargin,      setTargetMargin]      = useState(15);

  useEffect(() => {
    Promise.all([api.productList(), api.originList()])
      .then(([prods, origs]) => {
        setProductList(prods);
        setOriginList(origs);
        if (prods.length) setProduct(prods[0]);
        if (origs.length) setOrigin(origs[0]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-[#0d5c3d]" />
      <span className="ml-3 text-[#6b6b6b]">Loading product & origin data…</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 text-red-500">Failed to load: {error}</div>
  );

  const calculate = () => {
    const totalProductCost = costPerKg * containerCapacity;
    const totalFreightCost = freightCost;
    const overheadCost     = (totalProductCost + totalFreightCost) * (overheadPercent / 100);
    const totalCost        = totalProductCost + totalFreightCost + overheadCost;

    const breakevenRevenue    = totalCost;
    const breakevenPricePerKg = breakevenRevenue / containerCapacity;

    const targetRevenue    = totalCost / (1 - targetMargin / 100);
    const targetPricePerKg = targetRevenue / containerCapacity;

    return {
      totalProductCost,
      totalFreightCost,
      overheadCost,
      totalCost,
      breakevenRevenue,
      breakevenPricePerKg,
      targetRevenue,
      targetPricePerKg,
    };
  };

  const results = calculate();

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">Break-even Calculator</h1>
        <p className="text-[#6b6b6b]">Calculate break-even pricing and target margins per container</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="col-span-2 space-y-6">
          {/* Product & Origin Selection */}
          <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Product & Origin</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Product</label>
                <select
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-[#f0faf6] text-[#1a1a1a]"
                >
                  {productList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Origin</label>
                <select
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg bg-[#f0faf6] text-[#1a1a1a]"
                >
                  {originList.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cost Inputs */}
          <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Cost Inputs</h3>
            <div className="space-y-4">
              {[
                { label: "Cost per Kg (€)", value: costPerKg, step: 0.1, setter: setCostPerKg },
                { label: "Freight Cost per Container (€)", value: freightCost, step: 100, setter: setFreightCost },
                { label: "Container Capacity (Kg)", value: containerCapacity, step: 1000, setter: setContainerCapacity },
                { label: "Overhead %", value: overheadPercent, step: 1, setter: setOverheadPercent },
                { label: "Target Margin %", value: targetMargin, step: 1, setter: setTargetMargin },
              ].map(({ label, value, step, setter }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#1a1a1a]">{label}</label>
                    <input
                      type="number" step={step} value={value}
                      onChange={e => setter(Number(e.target.value))}
                      className="w-32 px-3 py-1 border border-[#e0e0e0] rounded-lg text-right text-[#1a1a1a] bg-[#f0faf6]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0]">
                <span className="text-sm text-[#6b6b6b]">Product Cost</span>
                <span className="text-sm font-semibold text-[#1a1a1a]">€{fmt(results.totalProductCost)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0]">
                <span className="text-sm text-[#6b6b6b]">Freight Cost</span>
                <span className="text-sm font-semibold text-[#1a1a1a]">€{fmt(results.totalFreightCost)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0]">
                <span className="text-sm text-[#6b6b6b]">Overhead Cost</span>
                <span className="text-sm font-semibold text-[#1a1a1a]">€{fmt(results.overheadCost)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-[#f5f5f5] -mx-6 px-6 rounded-lg">
                <span className="font-semibold text-[#1a1a1a]">Total Cost per Container</span>
                <span className="text-lg font-semibold text-[#0d5c3d]">€{fmt(results.totalCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-6">
          {/* Break-even Results */}
          <div className="bg-gradient-to-br from-[#0d5c3d] to-[#10b981] rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#f0faf6]/20 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Break-even Analysis</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-white/70 text-sm mb-1">Break-even Price per Kg</div>
                <div className="text-3xl font-semibold">€{results.breakevenPricePerKg.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Break-even Revenue per Container</div>
                <div className="text-3xl font-semibold">€{fmt(results.breakevenRevenue)}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Required Margin %</div>
                <div className="text-3xl font-semibold">0%</div>
                <div className="text-sm text-white/90 mt-1">To break even</div>
              </div>
            </div>
          </div>

          {/* Target Margin Results */}
          <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#e8f5f0] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#0d5c3d]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Target Margin Analysis</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-[#6b6b6b] mb-1">Target Price per Kg</div>
                <div className="text-3xl font-semibold text-[#0d5c3d]">€{results.targetPricePerKg.toFixed(2)}</div>
                <div className="text-xs text-[#6b6b6b] mt-1">
                  +€{(results.targetPricePerKg - results.breakevenPricePerKg).toFixed(2)} above break-even
                </div>
              </div>
              <div>
                <div className="text-sm text-[#6b6b6b] mb-1">Target Revenue per Container</div>
                <div className="text-3xl font-semibold text-[#0d5c3d]">€{fmt(results.targetRevenue)}</div>
                <div className="text-xs text-[#6b6b6b] mt-1">To achieve {targetMargin}% margin</div>
              </div>
              <div>
                <div className="text-sm text-[#6b6b6b] mb-1">Profit per Container</div>
                <div className="text-3xl font-semibold text-[#10b981]">
                  €{fmt(results.targetRevenue - results.totalCost)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#f0faf6] rounded-xl p-6 border border-[#e0e0e0]">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b6b6b]">Cost per Kg (all-in)</span>
                <span className="font-medium text-[#1a1a1a]">€{(results.totalCost / containerCapacity).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b6b6b]">Revenue per Kg (Target)</span>
                <span className="font-medium text-[#1a1a1a]">€{results.targetPricePerKg.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b6b6b]">Profit per Kg</span>
                <span className="font-medium text-[#10b981]">
                  €{(results.targetPricePerKg - results.totalCost / containerCapacity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
