/**
 * Alerts Page
 * Comprehensive view of all system alerts
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Bell,
  BellOff,
} from "lucide-react";
import BackgroundComponent from "@/components/ui/background-components";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/chatbot/AIChatbot";
import { Button } from "@/components/ui/button";
import { alertsApi } from "@/services/api";
import { type Alert } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertsApi.getAll();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getAlertConfig = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return {
          icon: AlertCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          glow: "shadow-[0_0_20px_hsl(0_84%_60%/0.3)]",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/30",
          glow: "shadow-[0_0_20px_hsl(38_92%_50%/0.3)]",
        };
      case "info":
        return {
          icon: Info,
          color: "text-secondary",
          bg: "bg-secondary/10",
          border: "border-secondary/30",
          glow: "",
        };
      default:
        return {
          icon: Info,
          color: "text-muted-foreground",
          bg: "bg-muted",
          border: "border-muted",
          glow: "",
        };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return date.toLocaleString();
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    await alertsApi.acknowledge(alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const filteredAlerts = alerts
    .filter((alert) => !typeFilter || alert.type === typeFilter)
    .filter((alert) => showAcknowledged || !alert.acknowledged)
    .sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      if (priority[a.type] !== priority[b.type]) {
        return priority[a.type] - priority[b.type];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const alertCounts = alerts.reduce(
    (acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      if (!alert.acknowledged) {
        acc.unacknowledged = (acc.unacknowledged || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-orbitron font-bold text-3xl mb-2">
                  System Alerts
                </h1>
                <p className="text-muted-foreground">
                  Monitor and manage all system notifications
                </p>
              </div>

              {alertCounts.unacknowledged > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/20 border border-destructive/30 rounded-lg"
                >
                  <Bell className="w-5 h-5 text-destructive" />
                  <span className="font-medium text-destructive">
                    {alertCounts.unacknowledged} unacknowledged
                  </span>
                </motion.div>
              )}
            </div>
          </motion.header>

          {/* Alert type filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(["critical", "warning", "info"] as const).map((type, index) => {
              const config = getAlertConfig(type);
              const Icon = config.icon;

              return (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() =>
                    setTypeFilter(typeFilter === type ? null : type)
                  }
                  className={cn(
                    "glass-card p-4 text-left transition-all",
                    typeFilter === type && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-5 h-5", config.color)} />
                    <span className="text-sm text-muted-foreground capitalize">
                      {type}
                    </span>
                  </div>
                  <p className="font-orbitron font-bold text-2xl">
                    {alertCounts[type] || 0}
                  </p>
                </motion.button>
              );
            })}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              className={cn(
                "glass-card p-4 text-left transition-all",
                !showAcknowledged && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {showAcknowledged ? (
                  <Bell className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <BellOff className="w-5 h-5 text-primary" />
                )}
                <span className="text-sm text-muted-foreground">
                  {showAcknowledged ? "All" : "Active Only"}
                </span>
              </div>
              <p className="font-orbitron font-bold text-2xl">
                {showAcknowledged ? alerts.length : alertCounts.unacknowledged || 0}
              </p>
            </motion.button>
          </div>

          {/* Filter indicator */}
          {(typeFilter || !showAcknowledged) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6"
            >
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilter(null);
                  setShowAcknowledged(true);
                }}
                className="border-white/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </motion.div>
          )}

          {/* Alerts list */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => {
                const config = getAlertConfig(alert.type);
                const Icon = config.icon;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "glass-card p-5 border-l-4 transition-all",
                      config.border,
                      !alert.acknowledged && config.glow,
                      alert.acknowledged && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          config.bg
                        )}
                      >
                        <Icon className={cn("w-6 h-6", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium uppercase border",
                              config.bg,
                              config.border,
                              config.color
                            )}
                          >
                            {alert.type}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">
                            {alert.unitId}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>

                        <p className="text-foreground mb-2">{alert.message}</p>

                        {alert.acknowledged ? (
                          <div className="flex items-center gap-2 text-sm text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span>Acknowledged</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                            className="border-success/30 text-success hover:bg-success/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                      </div>

                      {/* Critical alert pulse */}
                      {alert.type === "critical" && !alert.acknowledged && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 rounded-full bg-destructive glow-destructive"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredAlerts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="font-orbitron text-xl mb-2">All Clear!</h3>
              <p className="text-muted-foreground">
                No alerts matching your current filters
              </p>
            </motion.div>
          )}
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Alerts;
