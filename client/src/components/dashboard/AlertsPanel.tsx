/**
 * Alerts Panel Component
 * Displays real-time alerts with severity indicators
 */

import { cn } from "@/lib/utils";
import { type AlertRecord } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";

interface AlertsPanelProps {
  alerts: AlertRecord[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const normalizeSeverity = (severity?: string) => {
    const normalized = severity?.toLowerCase();
    if (normalized === "critical") return "critical";
    if (normalized === "high") return "warning";
    if (normalized === "medium") return "warning";
    if (normalized === "low") return "info";
    return "info";
  };

  const getAlertIcon = (severity?: string) => {
    switch (normalizeSeverity(severity)) {
      case "critical":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const getAlertStyles = (severity?: string) => {
    switch (normalizeSeverity(severity)) {
      case "critical":
        return {
          bg: "bg-destructive/10 border-destructive/30",
          icon: "text-destructive",
          glow: "shadow-[0_0_15px_hsl(0_84%_60%/0.3)]",
        };
      case "warning":
        return {
          bg: "bg-warning/10 border-warning/30",
          icon: "text-warning",
          glow: "shadow-[0_0_15px_hsl(38_92%_50%/0.3)]",
        };
      case "info":
      default:
        return {
          bg: "bg-secondary/10 border-secondary/30",
          icon: "text-secondary",
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
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { critical: 0, warning: 1, info: 2 } as const;
    const aType = normalizeSeverity(a.severity);
    const bType = normalizeSeverity(b.severity);
    if (priority[aType] !== priority[bType]) {
      return priority[aType] - priority[bType];
    }
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-[#0F172A]">Active Alerts</h3>
            <p className="text-sm text-[#64748B]">
              {alerts.length} total alerts
            </p>
          </div>
        </div>

        {/* Pulsing indicator for critical alerts */}
        {alerts.some((a) => normalizeSeverity(a.severity) === "critical") && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-destructive glow-destructive"
          />
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {sortedAlerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.severity);
            const styles = getAlertStyles(alert.severity);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "relative p-4 rounded-lg border transition-all",
                  styles.bg,
                  styles.glow
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5", styles.icon)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm uppercase tracking-wide">
                        {alert.source || "SYSTEM"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp ? formatTime(alert.timestamp) : "-"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Critical alert animation */}
                {normalizeSeverity(alert.severity) === "critical" && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-destructive pointer-events-none"
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AlertsPanel;
