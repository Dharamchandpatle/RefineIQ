/**
 * Mock Data for RefineryIQ Platform
 * This simulates real refinery data for demonstration purposes
 */

// Unit types in a typical refinery
export interface RefineryUnit {
  unitId: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance" | "warning";
  efficiency: number;
  capacity: number;
  currentLoad: number;
}

export interface EnergyData {
  unitId: string;
  date: string;
  energy: number; // MWh
  production: number; // barrels
  sec: number; // Specific Energy Consumption
  temperature: number;
  pressure: number;
}

export interface Alert {
  id: string;
  unitId: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface KPIData {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

export interface Prediction {
  date: string;
  predictedEnergy: number;
  predictedProduction: number;
  confidence: number;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  potentialSavings: number;
  implementationTime: string;
  unitId?: string;
}

// Mock Refinery Units
export const refineryUnits: RefineryUnit[] = [
  {
    unitId: "CDU",
    name: "Crude Distillation Unit",
    type: "Distillation",
    status: "online",
    efficiency: 94.5,
    capacity: 150000,
    currentLoad: 142500,
  },
  {
    unitId: "VDU",
    name: "Vacuum Distillation Unit",
    type: "Distillation",
    status: "online",
    efficiency: 91.2,
    capacity: 80000,
    currentLoad: 72000,
  },
  {
    unitId: "FCC",
    name: "Fluid Catalytic Cracker",
    type: "Cracking",
    status: "warning",
    efficiency: 87.8,
    capacity: 65000,
    currentLoad: 58500,
  },
  {
    unitId: "HCU",
    name: "Hydrocracking Unit",
    type: "Cracking",
    status: "online",
    efficiency: 92.3,
    capacity: 45000,
    currentLoad: 41850,
  },
  {
    unitId: "CCR",
    name: "Continuous Catalytic Reformer",
    type: "Reforming",
    status: "online",
    efficiency: 89.7,
    capacity: 35000,
    currentLoad: 31500,
  },
  {
    unitId: "HDS",
    name: "Hydro Desulfurization",
    type: "Treatment",
    status: "maintenance",
    efficiency: 0,
    capacity: 50000,
    currentLoad: 0,
  },
  {
    unitId: "ALK",
    name: "Alkylation Unit",
    type: "Conversion",
    status: "online",
    efficiency: 93.1,
    capacity: 25000,
    currentLoad: 23275,
  },
  {
    unitId: "ISO",
    name: "Isomerization Unit",
    type: "Conversion",
    status: "online",
    efficiency: 95.2,
    capacity: 20000,
    currentLoad: 19040,
  },
];

// Generate historical energy data for the past 30 days
export const generateEnergyData = (): EnergyData[] => {
  const data: EnergyData[] = [];
  const today = new Date();

  refineryUnits.forEach((unit) => {
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic fluctuating values
      const baseEnergy = unit.type === "Distillation" ? 1200 : unit.type === "Cracking" ? 800 : 400;
      const baseProduction = unit.currentLoad / 30;

      const energyVariation = (Math.random() - 0.5) * baseEnergy * 0.15;
      const productionVariation = (Math.random() - 0.5) * baseProduction * 0.1;

      const energy = Math.round(baseEnergy + energyVariation);
      const production = Math.round(baseProduction + productionVariation);

      data.push({
        unitId: unit.unitId,
        date: date.toISOString().split("T")[0],
        energy,
        production,
        sec: parseFloat((energy / production).toFixed(3)),
        temperature: Math.round(350 + Math.random() * 100),
        pressure: Math.round(15 + Math.random() * 10),
      });
    }
  });

  return data;
};

// Mock Alerts
export const alerts: Alert[] = [
  {
    id: "ALT001",
    unitId: "FCC",
    type: "warning",
    message: "Catalyst regenerator temperature approaching upper limit",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT002",
    unitId: "HDS",
    type: "info",
    message: "Scheduled maintenance in progress - Expected completion: 6 hours",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    acknowledged: true,
  },
  {
    id: "ALT003",
    unitId: "CDU",
    type: "critical",
    message: "Abnormal pressure fluctuation detected in column 3",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT004",
    unitId: "VDU",
    type: "warning",
    message: "Energy consumption 12% above optimal range",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALT005",
    unitId: "CCR",
    type: "info",
    message: "Catalyst activity within normal parameters",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    acknowledged: true,
  },
];

// Mock KPIs
export const kpis: KPIData[] = [
  {
    name: "Overall SEC",
    value: 0.0842,
    unit: "MWh/bbl",
    trend: "down",
    changePercent: -2.3,
  },
  {
    name: "Plant Efficiency",
    value: 91.4,
    unit: "%",
    trend: "up",
    changePercent: 1.2,
  },
  {
    name: "Total Production",
    value: 428650,
    unit: "bbl/day",
    trend: "stable",
    changePercent: 0.1,
  },
  {
    name: "Energy Cost",
    value: 2.45,
    unit: "M$/day",
    trend: "down",
    changePercent: -3.8,
  },
  {
    name: "CO2 Emissions",
    value: 1856,
    unit: "tons/day",
    trend: "down",
    changePercent: -1.5,
  },
  {
    name: "Uptime",
    value: 98.2,
    unit: "%",
    trend: "stable",
    changePercent: 0.0,
  },
];

// Generate predictions for next 7 days
export const generatePredictions = (): Prediction[] => {
  const predictions: Prediction[] = [];
  const today = new Date();

  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    predictions.push({
      date: date.toISOString().split("T")[0],
      predictedEnergy: Math.round(5200 + Math.random() * 800),
      predictedProduction: Math.round(420000 + Math.random() * 20000),
      confidence: parseFloat((0.85 + Math.random() * 0.1).toFixed(2)),
    });
  }

  return predictions;
};

// Mock Recommendations
export const recommendations: Recommendation[] = [
  {
    id: "REC001",
    priority: "high",
    title: "Optimize FCC Regenerator Temperature",
    description:
      "Reduce regenerator temperature by 15°C to improve catalyst life and reduce energy consumption. Current operating point is suboptimal for the catalyst type in use.",
    potentialSavings: 125000,
    implementationTime: "2-4 hours",
    unitId: "FCC",
  },
  {
    id: "REC002",
    priority: "high",
    title: "Adjust CDU Feed Preheat",
    description:
      "Increase crude preheat temperature by 8°C using waste heat recovery. This will reduce fired heater duty and improve overall energy efficiency.",
    potentialSavings: 89000,
    implementationTime: "1-2 days",
    unitId: "CDU",
  },
  {
    id: "REC003",
    priority: "medium",
    title: "VDU Vacuum System Optimization",
    description:
      "Optimize vacuum ejector steam flow. Current steam consumption is 15% above design value, indicating potential air leaks or inefficient operation.",
    potentialSavings: 45000,
    implementationTime: "4-8 hours",
    unitId: "VDU",
  },
  {
    id: "REC004",
    priority: "medium",
    title: "CCR Hydrogen Recycle Optimization",
    description:
      "Reduce hydrogen recycle ratio by 5% while maintaining catalyst stability. This will reduce compressor duty and improve net hydrogen production.",
    potentialSavings: 67000,
    implementationTime: "2-3 hours",
    unitId: "CCR",
  },
  {
    id: "REC005",
    priority: "low",
    title: "Implement Predictive Maintenance for HCU",
    description:
      "Install vibration monitoring on critical rotating equipment to predict failures before they occur, reducing unplanned downtime.",
    potentialSavings: 150000,
    implementationTime: "1-2 weeks",
    unitId: "HCU",
  },
];

// Mock user for authentication
export const mockUsers = [
  {
    id: "1",
    email: "admin@refineryiq.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "operator@refineryiq.com",
    password: "operator123",
    name: "Operator User",
    role: "operator",
  },
  {
    id: "3",
    email: "engineer@refineryiq.com",
    password: "engineer123",
    name: "Process Engineer",
    role: "engineer",
  },
];

// Export mock data as JSON-like structure
export const mockData = {
  units: refineryUnits,
  energyData: generateEnergyData(),
  alerts,
  kpis,
  predictions: generatePredictions(),
  recommendations,
};
