/**
 * Predictions Page
 * AI-powered energy and production forecasts
 */

import AIChatbot from "@/components/chatbot/AIChatbot";
import Sidebar from "@/components/layout/Sidebar";
import BackgroundComponent from "@/components/ui/background-components";
import { cn } from "@/lib/utils";
import { forecastsApi, type ForecastRecord } from "@/services/api";
import { motion } from "framer-motion";
import {
    Brain,
    Calendar,
    Target,
    TrendingUp,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const Predictions = () => {
  const [energyForecast, setEnergyForecast] = useState<ForecastRecord[]>([]);
  const [secForecast, setSecForecast] = useState<ForecastRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [energyData, secData] = await Promise.all([
          forecastsApi.getForecast("energy", 90),
          forecastsApi.getForecast("sec", 90),
        ]);

        setEnergyForecast(energyData || []);
        setSecForecast(secData || []);
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const latestEnergy = energyForecast[energyForecast.length - 1]?.value ?? 0;
  const latestSec = secForecast[secForecast.length - 1]?.value ?? 0;

  const energySeries = energyForecast.map((item, index) => ({
    date: item.timestamp || `T${index + 1}`,
    energy: item.value ?? 0,
  }));

  const secSeries = secForecast.map((item, index) => ({
    date: item.timestamp || `T${index + 1}`,
    sec: item.value ?? 0,
  }));

  const tableRows = energySeries.map((item, index) => ({
    date: item.date,
    energy: item.energy,
    sec: secSeries[index]?.sec ?? 0,
  }));

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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-3xl">
                  AI Predictions
                </h1>
                <p className="text-muted-foreground">
                  7-day energy and production forecast
                </p>
              </div>
            </div>
          </motion.header>

          {/* Forecast summary cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Latest Energy Forecast",
                value: `${(latestEnergy / 1000).toFixed(1)}k MWh`,
                icon: Zap,
                color: "primary",
              },
              {
                label: "Latest SEC Forecast",
                value: `${latestSec.toFixed(4)} MWh/bbl`,
                icon: Target,
                color: "secondary",
              },
              {
                label: "Forecast Points",
                value: `${energyForecast.length}`,
                icon: TrendingUp,
                color: "accent",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      item.color === "primary"
                        ? "bg-primary/20"
                        : item.color === "secondary"
                          ? "bg-secondary/20"
                          : "bg-accent/20"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5",
                        item.color === "primary"
                          ? "text-primary"
                          : item.color === "secondary"
                            ? "text-secondary"
                            : "text-accent"
                      )}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-orbitron font-bold text-2xl">
                    {item.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Energy forecast chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg">
                  Energy Forecast (Backend)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Energy forecast from backend API
                </p>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energySeries}>
                  <defs>
                    <linearGradient
                      id="energyHistGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(54 100% 78%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(54 100% 78%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="energyPredGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(186 100% 50%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(186 100% 50%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(222 30% 20%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(215 20% 65%)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    stroke="hsl(215 20% 65%)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 10%)",
                      border: "1px solid hsl(54 100% 78% / 0.3)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} MWh`,
                      "Energy",
                    ]}
                  />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="hsl(54 100% 78%)"
                      strokeWidth={2}
                      fill="url(#energyHistGradient)"
                    />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Daily predictions table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg">
                  Forecast Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Day-by-day forecast values from backend
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Energy Forecast
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      SEC Forecast
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, index) => (
                    <motion.tr
                      key={`${row.date}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-b border-white/5 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium">
                          {new Date(row.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-primary font-medium">
                          {row.energy.toLocaleString()} MWh
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-secondary font-medium">
                          {row.sec.toFixed(4)} MWh/bbl
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Predictions;
