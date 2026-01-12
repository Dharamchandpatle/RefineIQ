/**
 * Unit Details Page
 * Detailed view of individual refinery unit performance
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Factory,
  Gauge,
  Thermometer,
  Droplets,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import BackgroundComponent from "@/components/ui/background-components";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/chatbot/AIChatbot";
import { Button } from "@/components/ui/button";
import { unitsApi, energyApi } from "@/services/api";
import { type RefineryUnit, type EnergyData } from "@/data/mockData";
import { cn } from "@/lib/utils";

const UnitDetails = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<RefineryUnit | null>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!unitId) return;

      try {
        const [unitData, energy] = await Promise.all([
          unitsApi.getUnit(unitId),
          energyApi.getUnitData(unitId),
        ]);

        setUnit(unitData || null);
        setEnergyData(energy);
      } catch (error) {
        console.error("Failed to fetch unit data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [unitId]);

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

  if (!unit) {
    return (
      <BackgroundComponent>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[280px] p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl mb-2">Unit Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The requested unit does not exist.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </BackgroundComponent>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-success";
      case "warning":
        return "text-warning";
      case "maintenance":
        return "text-secondary";
      case "offline":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const latestData = energyData[energyData.length - 1];
  const avgEnergy =
    energyData.reduce((sum, d) => sum + d.energy, 0) / energyData.length;
  const avgProduction =
    energyData.reduce((sum, d) => sum + d.production, 0) / energyData.length;

  return (
    <BackgroundComponent>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 ml-[280px] p-6">
          {/* Header with back button */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Factory className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-orbitron font-bold text-3xl">
                      {unit.unitId}
                    </h1>
                    <p className="text-muted-foreground">{unit.name}</p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "px-4 py-2 rounded-lg border flex items-center gap-2",
                  unit.status === "online"
                    ? "bg-success/10 border-success/30"
                    : unit.status === "warning"
                      ? "bg-warning/10 border-warning/30"
                      : unit.status === "maintenance"
                        ? "bg-secondary/10 border-secondary/30"
                        : "bg-destructive/10 border-destructive/30"
                )}
              >
                <Activity className={cn("w-4 h-4", getStatusColor(unit.status))} />
                <span
                  className={cn(
                    "font-medium capitalize",
                    getStatusColor(unit.status)
                  )}
                >
                  {unit.status}
                </span>
              </div>
            </div>
          </motion.header>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Efficiency",
                value: `${unit.efficiency.toFixed(1)}%`,
                icon: Gauge,
                color: "primary",
              },
              {
                label: "Current Load",
                value: `${((unit.currentLoad / unit.capacity) * 100).toFixed(0)}%`,
                icon: Activity,
                color: "secondary",
              },
              {
                label: "Avg Temperature",
                value: `${latestData?.temperature || 0}°C`,
                icon: Thermometer,
                color: "accent",
              },
              {
                label: "Avg Pressure",
                value: `${latestData?.pressure || 0} bar`,
                icon: Droplets,
                color: "warning",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon
                    className={cn(
                      "w-5 h-5",
                      stat.color === "primary"
                        ? "text-primary"
                        : stat.color === "secondary"
                          ? "text-secondary"
                          : stat.color === "accent"
                            ? "text-accent"
                            : "text-warning"
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="font-orbitron font-bold text-2xl">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Energy Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Energy Consumption Trend
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData.slice(-14)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(222 30% 20%)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(215 20% 65%)"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(54 100% 78% / 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="hsl(54 100% 78%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(54 100% 78%)", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* SEC Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-secondary" />
                Daily SEC (Specific Energy Consumption)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={energyData.slice(-14)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(222 30% 20%)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(215 20% 65%)"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(186 100% 50% / 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="sec"
                      fill="hsl(186 100% 50%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Unit specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-orbitron font-bold text-lg mb-4">
              Unit Specifications
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="font-medium">{unit.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                <p className="font-medium">
                  {unit.capacity.toLocaleString()} bbl/day
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Load
                </p>
                <p className="font-medium">
                  {unit.currentLoad.toLocaleString()} bbl/day
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg Daily Energy
                </p>
                <p className="font-medium">{avgEnergy.toFixed(0)} MWh</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Avg Daily Production
                </p>
                <p className="font-medium">{avgProduction.toFixed(0)} bbl</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg SEC</p>
                <p className="font-medium">
                  {(avgEnergy / avgProduction).toFixed(4)} MWh/bbl
                </p>
              </div>
            </div>
          </motion.div>
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default UnitDetails;
