/**
 * Dashboard Page
 * Main control center with KPIs, charts, alerts, and recommendations
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Gauge,
  Factory,
  DollarSign,
  Leaf,
  Clock,
} from "lucide-react";
import BackgroundComponent from "@/components/ui/background-components";
import Sidebar from "@/components/layout/Sidebar";
import KPICard from "@/components/dashboard/KPICard";
import EnergyChart from "@/components/dashboard/EnergyChart";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import RecommendationsPanel from "@/components/dashboard/RecommendationsPanel";
import UnitStatusGrid from "@/components/dashboard/UnitStatusGrid";
import AIChatbot from "@/components/chatbot/AIChatbot";
import {
  energyApi,
  kpiApi,
  alertsApi,
  unitsApi,
  recommendationsApi,
} from "@/services/api";
import {
  type KPIData,
  type Alert,
  type RefineryUnit,
  type Recommendation,
} from "@/data/mockData";

const kpiIcons = {
  "Overall SEC": Zap,
  "Plant Efficiency": Gauge,
  "Total Production": Factory,
  "Energy Cost": DollarSign,
  "CO2 Emissions": Leaf,
  Uptime: Clock,
};

const kpiColors = {
  "Overall SEC": "primary" as const,
  "Plant Efficiency": "secondary" as const,
  "Total Production": "accent" as const,
  "Energy Cost": "warning" as const,
  "CO2 Emissions": "success" as const,
  Uptime: "primary" as const,
};

const Dashboard = () => {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [energyData, setEnergyData] = useState<
    { date: string; totalEnergy: number; totalProduction: number }[]
  >([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [units, setUnits] = useState<RefineryUnit[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiData, energy, alertData, unitData, recData] =
          await Promise.all([
            kpiApi.getAll(),
            energyApi.getDailyTotals(),
            alertsApi.getAll(),
            unitsApi.getAll(),
            recommendationsApi.getAll(),
          ]);

        setKpis(kpiData);
        setEnergyData(energy);
        setAlerts(alertData);
        setUnits(unitData);
        setRecommendations(recData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAcknowledgeAlert = async (alertId: string) => {
    await alertsApi.acknowledge(alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  if (isLoading) {
    return (
      <BackgroundComponent>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </BackgroundComponent>
    );
  }

  return (
    <BackgroundComponent>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 ml-[280px] p-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-orbitron font-bold text-3xl mb-2">
              Operations Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and AI-powered insights for refinery
              operations
            </p>
          </motion.header>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {kpis.map((kpi, index) => (
              <KPICard
                key={kpi.name}
                name={kpi.name}
                value={kpi.value}
                unit={kpi.unit}
                trend={kpi.trend}
                changePercent={kpi.changePercent}
                icon={kpiIcons[kpi.name as keyof typeof kpiIcons] || Zap}
                color={kpiColors[kpi.name as keyof typeof kpiColors] || "primary"}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Energy Chart - spans 2 columns */}
            <div className="lg:col-span-2">
              <EnergyChart data={energyData} />
            </div>

            {/* Alerts Panel */}
            <div className="lg:col-span-1">
              <AlertsPanel
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
              />
            </div>
          </div>

          {/* Bottom grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Unit Status Grid - spans 2 columns */}
            <div className="lg:col-span-2">
              <UnitStatusGrid units={units} />
            </div>

            {/* Recommendations Panel */}
            <div className="lg:col-span-1">
              <RecommendationsPanel recommendations={recommendations} />
            </div>
          </div>
        </main>

        {/* AI Chatbot */}
        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Dashboard;
