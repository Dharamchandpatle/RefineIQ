/**
 * Unit Details Page
 * Backend-driven alert and forecast view for a source
 */

import AIChatbot from "@/components/chatbot/AIChatbot";
import Sidebar from "@/components/layout/Sidebar";
import BackgroundComponent from "@/components/ui/background-components";
import { Button } from "@/components/ui/button";
import { anomaliesApi, forecastsApi, type AlertRecord, type ForecastRecord } from "@/services/api";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const UnitDetails = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [energyForecast, setEnergyForecast] = useState<ForecastRecord[]>([]);
  const [secForecast, setSecForecast] = useState<ForecastRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertData, energyData, secData] = await Promise.all([
          anomaliesApi.getAlerts(200),
          forecastsApi.getForecast("energy", 60),
          forecastsApi.getForecast("sec", 60),
        ]);

        setAlerts(alertData || []);
        setEnergyForecast(energyData || []);
        setSecForecast(secData || []);
      } catch (error) {
        console.error("Failed to fetch unit details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sourceAlerts = useMemo(() => {
    if (!unitId) return alerts;
    return alerts.filter((alert) => (alert.source || "unknown") === unitId);
  }, [alerts, unitId]);

  const energySeries = energyForecast.map((item, index) => ({
    date: item.timestamp || `T${index + 1}`,
    value: item.value ?? 0,
  }));

  const secSeries = secForecast.map((item, index) => ({
    date: item.timestamp || `T${index + 1}`,
    value: item.value ?? 0,
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

  if (!unitId) {
    return (
      <BackgroundComponent>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[280px] p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
              <h2 className="font-orbitron text-2xl mb-2">Missing Source</h2>
              <p className="text-muted-foreground mb-4">
                The requested source identifier is missing.
              </p>
              <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>
          </main>
        </div>
      </BackgroundComponent>
    );
  }

  return (
    <BackgroundComponent>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 ml-[280px] p-6">
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

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-3xl">{unitId}</h1>
                <p className="text-muted-foreground">Backend alert source</p>
              </div>
            </div>
          </motion.header>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-orbitron font-bold text-lg mb-4">Energy Forecast</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energySeries}>
                    <defs>
                      <linearGradient id="energyDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(54 100% 78%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(54 100% 78%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(215 20% 65%)"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(54 100% 78% / 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(54 100% 78%)" strokeWidth={2} fill="url(#energyDetail)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-orbitron font-bold text-lg mb-4">SEC Forecast</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={secSeries}>
                    <defs>
                      <linearGradient id="secDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(186 100% 50%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(186 100% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(215 20% 65%)"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 10%)",
                        border: "1px solid hsl(186 100% 50% / 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(186 100% 50%)" strokeWidth={2} fill="url(#secDetail)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-orbitron font-bold text-lg mb-4">Alerts for {unitId}</h3>
            {sourceAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts available for this source.</p>
            ) : (
              <ul className="space-y-3">
                {sourceAlerts.slice(0, 20).map((alert, index) => (
                  <li key={`${alert.id}-${index}`} className="rounded-lg border border-white/10 p-4">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.severity?.toUpperCase() || "UNKNOWN"} · {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "-"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default UnitDetails;
