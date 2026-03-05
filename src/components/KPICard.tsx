import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function KPICard({ title, value, trend, subtitle }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#e0e0e0] hover:shadow-lg transition-shadow">
      <div className="text-sm text-[#6b6b6b] mb-2">{title}</div>
      <div className="text-3xl font-semibold text-[#1a1a1a] mb-2">{value}</div>
      {trend && (
        <div className="flex items-center gap-2">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#ef4444]" />
          )}
          <span
            className={`text-sm ${
              trend.isPositive ? "text-[#10b981]" : "text-[#ef4444]"
            }`}
          >
            {trend.value}
          </span>
        </div>
      )}
      {subtitle && <div className="text-xs text-[#6b6b6b] mt-2">{subtitle}</div>}
    </div>
  );
}
