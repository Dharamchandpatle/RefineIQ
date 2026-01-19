/**
 * Dashboard Page
 * Main control center with KPIs, charts, alerts, and recommendations
 */

import AIChatbot from "@/components/chatbot/AIChatbot";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import EnergyChart from "@/components/dashboard/EnergyChart";
import KPICard from "@/components/dashboard/KPICard";
import RecommendationsPanel from "@/components/dashboard/RecommendationsPanel";
import Sidebar from "@/components/layout/Sidebar";
import BackgroundComponent from "@/components/ui/background-components";
import {
    anomaliesApi,
    forecastsApi,
    kpiApi,
    recommendationsApi,
    type AlertRecord,
    type RecommendationRecord,
} from "@/services/api";
import { motion } from "framer-motion";
import {
    Factory,
    Gauge,
    Leaf,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const kpiIcons = {
  "Average SEC": Zap,
  "Average Energy": Gauge,
  "Total Energy": Factory,
  "Anomaly Rate": Leaf,
};

const kpiColors = {
  "Average SEC": "primary" as const,
  "Average Energy": "secondary" as const,
  "Total Energy": "accent" as const,
  "Anomaly Rate": "warning" as const,
};

type DashboardKpi = {
  name: keyof typeof kpiIcons;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
};

const Dashboard = () => {
  const [kpis, setKpis] = useState<DashboardKpi[]>([]);
  const [energyData, setEnergyData] = useState<
    { date: string; totalEnergy: number; totalProduction?: number | null }[]
  >([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiSummary, forecastData, alertData, recData] = await Promise.all([
          kpiApi.getSummary(),
          forecastsApi.getForecast("energy", 30),
          anomaliesApi.getAlerts(100),
          recommendationsApi.getAll(20),
        ]);

        setKpis([
          {
            name: "Average SEC",
            value: kpiSummary.avg_sec ?? 0,
            unit: "MWh/bbl",
            trend: "stable",
            changePercent: 0,
          },
          {
            name: "Average Energy",
            value: kpiSummary.avg_energy ?? 0,
            unit: "MWh",
            trend: "stable",
            changePercent: 0,
          },
          {
            name: "Total Energy",
            value: kpiSummary.total_energy ?? 0,
            unit: "MWh",
            trend: "stable",
            changePercent: 0,
          },
          {
            name: "Anomaly Rate",
            value: kpiSummary.anomaly_rate ?? 0,
            unit: "%",
            trend: "stable",
            changePercent: 0,
          },
        ]);

        setEnergyData(
          (forecastData || []).map((item, index) => ({
            date: item.timestamp || `T${index + 1}`,
            totalEnergy: item.value || 0,
          }))
        );
        setAlerts(alertData || []);
        setRecommendations(recData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="flex min-h-screen" style={{ backgroundColor: '#FFFBEA' }}>
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
            <AlertsPanel alerts={alerts} />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recommendations Panel */}
          <div className="lg:col-span-1 lg:col-start-3">
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
