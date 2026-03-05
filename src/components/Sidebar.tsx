import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Grid3x3,
  Calendar,
  LineChart,
  Wallet,
  Sliders,
  AlertTriangle,
  Target,
  Calculator,
  Settings as SettingsIcon,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Executive Dashboard", icon: LayoutDashboard },
  { path: "/historical-analytics", label: "Historical Shipment Analytics", icon: TrendingUp },
  { path: "/profitability-matrix", label: "Profitability Matrix", icon: Grid3x3 },
  { path: "/seasonal-calendar", label: "Seasonal Calendar", icon: Calendar },
  { path: "/forecast-planning", label: "Forecast Planning", icon: LineChart },
  { path: "/cash-flow", label: "Cash Flow Analysis", icon: Wallet },
  { path: "/scenario-simulator", label: "Scenario Simulator", icon: Sliders },
  { path: "/risk-overview", label: "Risk Overview", icon: AlertTriangle },
  { path: "/kpi-dashboard", label: "KPI Dashboard", icon: Target },
  { path: "/breakeven-calculator", label: "Break-even Calculator", icon: Calculator },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-[#e0e0e0] flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[#e0e0e0]">
        <h1 className="text-xl font-semibold text-[#0d5c3d]">ScionAgricos</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-[#e8f5f0] text-[#0d5c3d] border-r-2 border-[#0d5c3d]"
                  : "text-[#6b6b6b] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={isActive ? "font-medium" : ""}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
