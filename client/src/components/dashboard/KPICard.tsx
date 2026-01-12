/**
 * KPI Card Component
 * Displays key performance indicators with trend indicators
 */

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  name: string;
  value: number | string;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  icon: LucideIcon;
  delay?: number;
  color?: "primary" | "secondary" | "accent" | "success" | "warning";
}

export const KPICard = ({
  name,
  value,
  unit,
  trend,
  changePercent,
  icon: Icon,
  delay = 0,
  color = "primary",
}: KPICardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const isPositiveTrend =
    (trend === "down" && name.toLowerCase().includes("cost")) ||
    (trend === "down" && name.toLowerCase().includes("emission")) ||
    (trend === "down" && name.toLowerCase().includes("sec")) ||
    (trend === "up" && !name.toLowerCase().includes("cost"));

  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/30",
    accent: "from-accent/20 to-accent/5 border-accent/30",
    success: "from-success/20 to-success/5 border-success/30",
    warning: "from-warning/20 to-warning/5 border-warning/30",
  };

  const iconColorClasses = {
    primary: "bg-primary/20 text-primary glow-primary",
    secondary: "bg-secondary/20 text-secondary glow-secondary",
    accent: "bg-accent/20 text-accent glow-accent",
    success: "bg-success/20 text-success glow-success",
    warning: "bg-warning/20 text-warning",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        "glass-card p-5 bg-gradient-to-br border",
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconColorClasses[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isPositiveTrend
              ? "bg-success/20 text-success"
              : trend === "stable"
                ? "bg-muted text-muted-foreground"
                : "bg-destructive/20 text-destructive"
          )}
        >
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(changePercent)}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{name}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-orbitron font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* Subtle animated bar at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: delay + 0.3 }}
      />
    </motion.div>
  );
};

export default KPICard;
