import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ExecutiveDashboard } from "./pages/ExecutiveDashboard";
import { HistoricalShipmentAnalytics } from "./pages/HistoricalShipmentAnalytics";
import { ProfitabilityMatrix } from "./pages/ProfitabilityMatrix";
import { SeasonalCalendar } from "./pages/SeasonalCalendar";
import { ForecastPlanning } from "./pages/ForecastPlanning";
import { CashFlowAnalysis } from "./pages/CashFlowAnalysis";
import { ScenarioSimulator } from "./pages/ScenarioSimulator";
import { RiskOverview } from "./pages/RiskOverview";
import { KPIDashboard } from "./pages/KPIDashboard";
import { BreakevenCalculator } from "./pages/BreakevenCalculator";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ExecutiveDashboard },
      { path: "historical-analytics", Component: HistoricalShipmentAnalytics },
      { path: "profitability-matrix", Component: ProfitabilityMatrix },
      { path: "seasonal-calendar", Component: SeasonalCalendar },
      { path: "forecast-planning", Component: ForecastPlanning },
      { path: "cash-flow", Component: CashFlowAnalysis },
      { path: "scenario-simulator", Component: ScenarioSimulator },
      { path: "risk-overview", Component: RiskOverview },
      { path: "kpi-dashboard", Component: KPIDashboard },
      { path: "breakeven-calculator", Component: BreakevenCalculator },
      { path: "settings", Component: Settings },
    ],
  },
]);
