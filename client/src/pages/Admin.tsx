/**
 * Admin Panel Page
 * Backend-driven configuration and data management
 */

import DatasetUpload from "@/components/admin/DatasetUpload";
import AIChatbot from "@/components/chatbot/AIChatbot";
import Sidebar from "@/components/layout/Sidebar";
import BackgroundComponent from "@/components/ui/background-components";
import { kpiApi, type KPISummary } from "@/services/api";
import { motion } from "framer-motion";
import { Activity, Database, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const Admin = () => {
  const [summary, setSummary] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await kpiApi.getSummary();
        setSummary(data);
      } catch (err) {
        setError("Unable to load KPI summary from backend.");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-3xl">Admin Panel</h1>
                <p className="text-muted-foreground">
                  System configuration and data management
                </p>
              </div>
            </div>
          </motion.header>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg">Current KPI Snapshot</h3>
                  <p className="text-sm text-muted-foreground">
                    Latest KPIs from backend
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading KPI summary...</p>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Total Energy</p>
                    <p className="font-orbitron font-bold text-xl">
                      {summary?.total_energy?.toFixed(2) ?? "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Avg Energy</p>
                    <p className="font-orbitron font-bold text-xl">
                      {summary?.avg_energy?.toFixed(2) ?? "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Avg SEC</p>
                    <p className="font-orbitron font-bold text-xl">
                      {summary?.avg_sec?.toFixed(4) ?? "N/A"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Anomaly Rate</p>
                    <p className="font-orbitron font-bold text-xl">
                      {summary?.anomaly_rate ? `${(summary.anomaly_rate * 100).toFixed(2)}%` : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg">Dataset Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload refinery datasets to refresh KPIs and AI outputs
                  </p>
                </div>
              </div>

              <DatasetUpload />
            </motion.div>
          </div>
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Admin;
