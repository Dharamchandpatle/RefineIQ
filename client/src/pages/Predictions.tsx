/**
 * Predictions Page
 * AI-powered energy and production forecasts
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Zap,
  Factory,
  Target,
  Brain,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import BackgroundComponent from "@/components/ui/background-components";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/chatbot/AIChatbot";
import { predictionsApi, energyApi } from "@/services/api";
import { type Prediction } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Predictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [historicalData, setHistoricalData] = useState<
    { date: string; totalEnergy: number; totalProduction: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predData, histData] = await Promise.all([
          predictionsApi.getPredictions(),
          energyApi.getDailyTotals(),
        ]);

        setPredictions(predData);
        setHistoricalData(histData.slice(-14)); // Last 14 days
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine historical and prediction data for chart
  const combinedData = [
    ...historicalData.map((d) => ({
      date: d.date,
      energy: d.totalEnergy,
      production: d.totalProduction,
      type: "historical",
    })),
    ...predictions.map((p) => ({
      date: p.date,
      energy: p.predictedEnergy,
      production: p.predictedProduction,
      type: "predicted",
      confidence: p.confidence,
    })),
  ];

  const avgPredictedEnergy =
    predictions.reduce((sum, p) => sum + p.predictedEnergy, 0) /
    predictions.length;
  const avgHistoricalEnergy =
    historicalData.reduce((sum, d) => sum + d.totalEnergy, 0) /
    historicalData.length;
  const energyTrend = ((avgPredictedEnergy - avgHistoricalEnergy) / avgHistoricalEnergy) * 100;

  const avgPredictedProduction =
    predictions.reduce((sum, p) => sum + p.predictedProduction, 0) /
    predictions.length;
  const avgHistoricalProduction =
    historicalData.reduce((sum, d) => sum + d.totalProduction, 0) /
    historicalData.length;
  const productionTrend =
    ((avgPredictedProduction - avgHistoricalProduction) / avgHistoricalProduction) * 100;

  const avgConfidence =
    predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

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

          {/* Prediction summary cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Avg Predicted Energy",
                value: `${(avgPredictedEnergy / 1000).toFixed(1)}k MWh`,
                trend: energyTrend,
                icon: Zap,
                color: "primary",
              },
              {
                label: "Avg Predicted Production",
                value: `${(avgPredictedProduction / 1000).toFixed(0)}k bbl`,
                trend: productionTrend,
                icon: Factory,
                color: "secondary",
              },
              {
                label: "Model Confidence",
                value: `${(avgConfidence * 100).toFixed(1)}%`,
                icon: Target,
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
                  {item.trend !== undefined && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm",
                        item.trend > 0 ? "text-warning" : "text-success"
                      )}
                    >
                      {item.trend > 0 ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(item.trend).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Combined chart */}
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
                  Energy Forecast
                </h3>
                <p className="text-sm text-muted-foreground">
                  Historical data + 7-day prediction
                </p>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
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
                      name === "energy" ? "Energy" : name,
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

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-primary rounded" />
                <span className="text-sm text-muted-foreground">
                  Historical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-primary rounded border-dashed border border-primary" />
                <span className="text-sm text-muted-foreground">Predicted</span>
              </div>
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
                  7-Day Forecast Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Day-by-day predictions with confidence scores
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
                      Predicted Energy
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Predicted Production
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction, index) => (
                    <motion.tr
                      key={prediction.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-b border-white/5 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium">
                          {new Date(prediction.date).toLocaleDateString(
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
                          {prediction.predictedEnergy.toLocaleString()} MWh
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-secondary font-medium">
                          {prediction.predictedProduction.toLocaleString()} bbl
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${prediction.confidence * 100}%`,
                              }}
                              transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                              className={cn(
                                "h-full rounded-full",
                                prediction.confidence >= 0.9
                                  ? "bg-success"
                                  : prediction.confidence >= 0.8
                                    ? "bg-primary"
                                    : "bg-warning"
                              )}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {(prediction.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
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
