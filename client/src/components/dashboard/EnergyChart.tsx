/**
 * Energy Chart Component
 * Displays energy consumption trends using Recharts
 */

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface ChartDataPoint {
  date: string;
  totalEnergy: number;
  totalProduction?: number | null;
}

interface EnergyChartProps {
  data: ChartDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-primary/30">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.value.toLocaleString()} {entry.name === "Energy" ? "MWh" : "bbl"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EnergyChart = ({
  data,
  title = "Energy Consumption Trend",
}: EnergyChartProps) => {
  const hasProduction = data.some((item) => item.totalProduction !== undefined && item.totalProduction !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-orbitron font-bold text-lg text-[#0F172A]">{title}</h3>
          <p className="text-sm text-[#64748B]">
            Last 30 days performance
          </p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(54 100% 78%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(54 100% 78%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(186 100% 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(186 100% 50%)" stopOpacity={0} />
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
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis
              stroke="hsl(215 20% 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="totalEnergy"
              name="Energy"
              stroke="hsl(54 100% 78%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#energyGradient)"
            />
            {hasProduction && (
              <Area
                type="monotone"
                dataKey="totalProduction"
                name="Production"
                stroke="hsl(186 100% 50%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#productionGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default EnergyChart;
