/**
 * Unit Status Grid Component
 * Displays status cards for all refinery units
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Factory,
    Gauge,
    Wrench,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnitStatusGridProps {
  units: RefineryUnit[];
}

export interface RefineryUnit {
  unitId: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance" | "warning";
  efficiency: number;
  capacity: number;
  currentLoad: number;
}

export const UnitStatusGrid = ({ units }: UnitStatusGridProps) => {
  const navigate = useNavigate();

  const getStatusConfig = (status: RefineryUnit["status"]) => {
    switch (status) {
      case "online":
        return {
          icon: CheckCircle,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/30",
          label: "Online",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/30",
          label: "Warning",
        };
      case "maintenance":
        return {
          icon: Wrench,
          color: "text-secondary",
          bg: "bg-secondary/10",
          border: "border-secondary/30",
          label: "Maintenance",
        };
      case "offline":
        return {
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          label: "Offline",
        };
      default:
        return {
          icon: Activity,
          color: "text-muted-foreground",
          bg: "bg-muted",
          border: "border-muted",
          label: "Unknown",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Factory className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-orbitron font-bold text-lg text-[#0F172A]">Unit Status</h3>
          <p className="text-sm text-[#64748B]">
            {units.filter((u) => u.status === "online").length} of {units.length}{" "}
            units online
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {units.map((unit, index) => {
          const status = getStatusConfig(unit.status);
          const StatusIcon = status.icon;
          const loadPercent = (unit.currentLoad / unit.capacity) * 100;

          return (
            <motion.div
              key={unit.unitId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -3 }}
              onClick={() => navigate(`/units/${unit.unitId}`)}
              className={cn(
                "relative p-4 rounded-lg border cursor-pointer group",
                status.bg,
                status.border
              )}
            >
              {/* Status indicator */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-orbitron font-bold text-sm">
                  {unit.unitId}
                </span>
                <StatusIcon className={cn("w-4 h-4", status.color)} />
              </div>

              {/* Unit name */}
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                {unit.name}
              </p>

              {/* Efficiency gauge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    Efficiency
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      unit.efficiency >= 90
                        ? "text-success"
                        : unit.efficiency >= 80
                          ? "text-warning"
                          : "text-destructive"
                    )}
                  >
                    {unit.efficiency.toFixed(1)}%
                  </span>
                </div>

                {/* Load bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${unit.status === "maintenance" ? 0 : loadPercent}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={cn(
                      "h-full rounded-full",
                      loadPercent >= 90
                        ? "bg-warning"
                        : loadPercent >= 70
                          ? "bg-success"
                          : "bg-secondary"
                    )}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Load</span>
                  <span>{loadPercent.toFixed(0)}%</span>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UnitStatusGrid;
