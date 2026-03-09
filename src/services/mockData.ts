/**
 * Mock API Data - Fallback when backend is unavailable
 */
import type {
  YearlyTotal, PersonYearData, MonthlyMargin,
  ProductData, OriginData, HistoricalShipment,
  CashFlowScenarios, KpiSummary, ProfitabilityRow,
  RiskData, SeasonalMonthData, ForecastData, Transaction,
  CashFlowMonth, ForecastPoint, ForecastValuePoint,
} from '../types/api';

export const mockData = {
  yearlyTotals: (): YearlyTotal[] => [
    { year: 2023, revenue: 2400000, expense: 1800000, margin: 600000, marginPct: 25, transactions: 1250 },
    { year: 2024, revenue: 3100000, expense: 2170000, margin: 930000, marginPct: 30, transactions: 1540 },
    { year: 2025, revenue: 3850000, expense: 2419000, margin: 1431000, marginPct: 37, transactions: 1890 },
  ],

  summary: (year: number): KpiSummary => ({
    totalRevenue: 3850000,
    totalExpense: 2419000,
    totalMargin: 1431000,
    marginPct: 37,
    transactions: 1890,
    revenueYoY: 24.2,
    marginYoY: 53.8,
    topProduct: 'Fresh Produce',
    topOrigin: 'Brazil',
  }),

  personYearData: (): PersonYearData[] => [
    { person: 'Chiru', year: 2025, revenue: 960000, margin: 356000, transactions: 470 },
    { person: 'Madhu', year: 2025, revenue: 1040000, margin: 385000, transactions: 510 },
    { person: 'Mahendra', year: 2025, revenue: 890000, margin: 330000, transactions: 435 },
    { person: 'Unmesh', year: 2025, revenue: 960000, margin: 360000, transactions: 475 },
  ],

  monthlyMargins: (year: number): MonthlyMargin[] => [
    { month: 1, margin: 115000, revenue: 310000 },
    { month: 2, margin: 102000, revenue: 285000 },
    { month: 3, margin: 125000, revenue: 335000 },
    { month: 4, margin: 118000, revenue: 320000 },
    { month: 5, margin: 132000, revenue: 355000 },
    { month: 6, margin: 128000, revenue: 345000 },
    { month: 7, margin: 140000, revenue: 375000 },
    { month: 8, margin: 135000, revenue: 365000 },
    { month: 9, margin: 122000, revenue: 330000 },
    { month: 10, margin: 138000, revenue: 370000 },
    { month: 11, margin: 125000, revenue: 340000 },
    { month: 12, margin: 151000, revenue: 420000 },
  ],

  products: (year?: number): ProductData[] => [
    { product: 'Fresh Produce', revenue: 1540000, margin: 540000, transactions: 620, marginPct: 35 },
    { product: 'Spices', revenue: 980000, margin: 380000, transactions: 380, marginPct: 39 },
    { product: 'Grains', revenue: 750000, margin: 275000, transactions: 410, marginPct: 37 },
    { product: 'Processed Foods', revenue: 580000, margin: 236000, transactions: 480, marginPct: 41 },
  ],

  origins: (year?: number): OriginData[] => [
    { origin: 'Brazil', revenue: 1200000, margin: 420000, transactions: 450, marginPct: 35 },
    { origin: 'Argentina', revenue: 950000, margin: 380000, transactions: 420, marginPct: 40 },
    { origin: 'Peru', revenue: 880000, margin: 340000, transactions: 550, marginPct: 39 },
    { origin: 'Colombia', revenue: 820000, margin: 291000, transactions: 470, marginPct: 35 },
  ],

  historicalShipments: (): HistoricalShipment[] => [
    { year: 2023, product: 'Fresh Produce', origin: 'Brazil', transactions: 180, boxes: 3600, revenue: 450000, margin: 135000, marginPct: 30 },
    { year: 2024, product: 'Fresh Produce', origin: 'Brazil', transactions: 220, boxes: 4400, revenue: 580000, margin: 174000, marginPct: 30 },
    { year: 2025, product: 'Fresh Produce', origin: 'Brazil', transactions: 260, boxes: 5200, revenue: 650000, margin: 227500, marginPct: 35 },
  ],

  cashFlow: (year: number): CashFlowScenarios => ({
    conservative: [
      { month: 'Jan', inflows: 310000, outflows: 215000, net: 95000, cumulative: 95000 },
      { month: 'Feb', inflows: 285000, outflows: 197000, net: 88000, cumulative: 183000 },
      { month: 'Mar', inflows: 335000, outflows: 233000, net: 102000, cumulative: 285000 },
      { month: 'Apr', inflows: 320000, outflows: 215000, net: 105000, cumulative: 390000 },
      { month: 'May', inflows: 355000, outflows: 245000, net: 110000, cumulative: 500000 },
      { month: 'Jun', inflows: 345000, outflows: 233000, net: 112000, cumulative: 612000 },
      { month: 'Jul', inflows: 375000, outflows: 257000, net: 118000, cumulative: 730000 },
      { month: 'Aug', inflows: 365000, outflows: 250000, net: 115000, cumulative: 845000 },
      { month: 'Sep', inflows: 330000, outflows: 222000, net: 108000, cumulative: 953000 },
      { month: 'Oct', inflows: 370000, outflows: 255000, net: 115000, cumulative: 1068000 },
      { month: 'Nov', inflows: 340000, outflows: 230000, net: 110000, cumulative: 1178000 },
      { month: 'Dec', inflows: 420000, outflows: 292000, net: 128000, cumulative: 1306000 },
    ] as CashFlowMonth[],
    realistic: [
      { month: 'Jan', inflows: 310000, outflows: 195000, net: 115000, cumulative: 115000 },
      { month: 'Feb', inflows: 285000, outflows: 183000, net: 102000, cumulative: 217000 },
      { month: 'Mar', inflows: 335000, outflows: 210000, net: 125000, cumulative: 342000 },
      { month: 'Apr', inflows: 320000, outflows: 202000, net: 118000, cumulative: 460000 },
      { month: 'May', inflows: 355000, outflows: 223000, net: 132000, cumulative: 592000 },
      { month: 'Jun', inflows: 345000, outflows: 217000, net: 128000, cumulative: 720000 },
      { month: 'Jul', inflows: 375000, outflows: 235000, net: 140000, cumulative: 860000 },
      { month: 'Aug', inflows: 365000, outflows: 230000, net: 135000, cumulative: 995000 },
      { month: 'Sep', inflows: 330000, outflows: 208000, net: 122000, cumulative: 1117000 },
      { month: 'Oct', inflows: 370000, outflows: 232000, net: 138000, cumulative: 1255000 },
      { month: 'Nov', inflows: 340000, outflows: 215000, net: 125000, cumulative: 1380000 },
      { month: 'Dec', inflows: 420000, outflows: 269000, net: 151000, cumulative: 1531000 },
    ] as CashFlowMonth[],
    aggressive: [
      { month: 'Jan', inflows: 310000, outflows: 170000, net: 140000, cumulative: 140000 },
      { month: 'Feb', inflows: 285000, outflows: 160000, net: 125000, cumulative: 265000 },
      { month: 'Mar', inflows: 335000, outflows: 185000, net: 150000, cumulative: 415000 },
      { month: 'Apr', inflows: 320000, outflows: 178000, net: 142000, cumulative: 557000 },
      { month: 'May', inflows: 355000, outflows: 197000, net: 158000, cumulative: 715000 },
      { month: 'Jun', inflows: 345000, outflows: 190000, net: 155000, cumulative: 870000 },
      { month: 'Jul', inflows: 375000, outflows: 210000, net: 165000, cumulative: 1035000 },
      { month: 'Aug', inflows: 365000, outflows: 205000, net: 160000, cumulative: 1195000 },
      { month: 'Sep', inflows: 330000, outflows: 182000, net: 148000, cumulative: 1343000 },
      { month: 'Oct', inflows: 370000, outflows: 208000, net: 162000, cumulative: 1505000 },
      { month: 'Nov', inflows: 340000, outflows: 188000, net: 152000, cumulative: 1657000 },
      { month: 'Dec', inflows: 420000, outflows: 240000, net: 180000, cumulative: 1837000 },
    ] as CashFlowMonth[],
  }),

  profitability: (year?: number): ProfitabilityRow[] => [
    { product: 'Fresh Produce', origin: 'Brazil', kgs: 5200, cost: 422500, revenue: 650000, grossMargin: 35 },
    { product: 'Spices', origin: 'Peru', kgs: 2000, cost: 162250, revenue: 275000, grossMargin: 41 },
    { product: 'Grains', origin: 'Argentina', kgs: 3000, cost: 126000, revenue: 210000, grossMargin: 40 },
  ],

  risk: (year?: number): RiskData => ({
    lowMarginProducts: [
      { product: 'Processed Foods', origin: 'Colombia', margin: 236000, transactions: 480 },
    ],
    highVolatilityProducts: [
      { product: 'Fresh Produce', volatility: 0.42, avg_margin: 540000, active_months: 12 },
      { product: 'Spices', volatility: 0.38, avg_margin: 380000, active_months: 12 },
    ],
    currencyExposure: [
      { currency: 'BRL', exposure: 1200000 },
      { currency: 'ARS', exposure: 950000 },
      { currency: 'PEN', exposure: 880000 },
    ],
  }),

  seasonal: (): SeasonalMonthData[] => [
    { month: 1, avg_revenue: 310000, avg_margin: 115000, avg_margin_pct: 37, total_boxes: 4700, transaction_count: 470 },
    { month: 2, avg_revenue: 285000, avg_margin: 102000, avg_margin_pct: 36, total_boxes: 4200, transaction_count: 420 },
    { month: 3, avg_revenue: 335000, avg_margin: 125000, avg_margin_pct: 37, total_boxes: 5100, transaction_count: 510 },
    { month: 4, avg_revenue: 320000, avg_margin: 118000, avg_margin_pct: 37, total_boxes: 4850, transaction_count: 485 },
    { month: 5, avg_revenue: 355000, avg_margin: 132000, avg_margin_pct: 37, total_boxes: 5400, transaction_count: 540 },
    { month: 6, avg_revenue: 345000, avg_margin: 128000, avg_margin_pct: 37, total_boxes: 5250, transaction_count: 525 },
    { month: 7, avg_revenue: 375000, avg_margin: 140000, avg_margin_pct: 37, total_boxes: 5750, transaction_count: 575 },
    { month: 8, avg_revenue: 365000, avg_margin: 135000, avg_margin_pct: 37, total_boxes: 5600, transaction_count: 560 },
    { month: 9, avg_revenue: 330000, avg_margin: 122000, avg_margin_pct: 37, total_boxes: 5050, transaction_count: 505 },
    { month: 10, avg_revenue: 370000, avg_margin: 138000, avg_margin_pct: 37, total_boxes: 5700, transaction_count: 570 },
    { month: 11, avg_revenue: 340000, avg_margin: 125000, avg_margin_pct: 37, total_boxes: 5200, transaction_count: 520 },
    { month: 12, avg_revenue: 420000, avg_margin: 151000, avg_margin_pct: 36, total_boxes: 6400, transaction_count: 640 },
  ],

  forecast: (): ForecastData => ({
    revenueData: [
      { year: '2023', actual: 2400000, forecast: null },
      { year: '2024', actual: 3100000, forecast: null },
      { year: '2025', actual: 3850000, forecast: null },
      { year: '2026', actual: null, forecast: 4700000 },
    ] as ForecastPoint[],
    expenseData: [
      { year: '2023', actual: 1800000, forecast: null },
      { year: '2024', actual: 2170000, forecast: null },
      { year: '2025', actual: 2419000, forecast: null },
      { year: '2026', actual: null, forecast: 2820000 },
    ] as ForecastPoint[],
    ebitdaData: [
      { year: '2023', value: 600000 },
      { year: '2024', value: 930000 },
      { year: '2025', value: 1431000 },
      { year: '2026', value: 1880000 },
    ] as ForecastValuePoint[],
    profitData: [
      { year: '2023', value: 480000 },
      { year: '2024', value: 744000 },
      { year: '2025', value: 1144800 },
      { year: '2026', value: 1504000 },
    ] as ForecastValuePoint[],
  }),

  productList: (): string[] => ['Fresh Produce', 'Spices', 'Grains', 'Processed Foods'],
  originList: (): string[] => ['Brazil', 'Argentina', 'Peru', 'Colombia'],

  transactions: (filters?: any): Transaction[] => [
    { 
      id: 1, trader: 'Chiru', year: 2025, month: 3, transaction_type: 'Sale', origin: 'Brazil', 
      customer: 'Buyer1', customer_country: 'Germany', product: 'Fresh Produce', num_boxes: 500, 
      weight_kg: 5000, revenue_eur: 45000, margin: 13500, sales_invoice_date: '2025-03-01', 
      sales_invoice_number: 'INV-001', source_file: 'data.xlsx' 
    },
    { 
      id: 2, trader: 'Madhu', year: 2025, month: 3, transaction_type: 'Sale', origin: 'Peru', 
      customer: 'Buyer2', customer_country: 'France', product: 'Spices', num_boxes: 200, 
      weight_kg: 2000, revenue_eur: 28000, margin: 12320, sales_invoice_date: '2025-03-02', 
      sales_invoice_number: 'INV-002', source_file: 'data.xlsx' 
    },
    { 
      id: 3, trader: 'Mahendra', year: 2025, month: 3, transaction_type: 'Sale', origin: 'Argentina', 
      customer: 'Buyer3', customer_country: 'Spain', product: 'Grains', num_boxes: 300, 
      weight_kg: 3000, revenue_eur: 21000, margin: 8400, sales_invoice_date: '2025-03-03', 
      sales_invoice_number: 'INV-003', source_file: 'data.xlsx' 
    },
  ] as Transaction[],
};
