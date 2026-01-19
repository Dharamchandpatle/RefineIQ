import { useTheme } from "next-themes";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface EnergyChartProps {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
}

const EnergyChart = ({ title, data, color = "#003A8F" }: EnergyChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const lineColor = isDark && color === "#003A8F" ? "#7FB0FF" : color;
  const gridColor = isDark ? "#1f2a44" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#94a3b8";
  const tooltipStyle = {
    borderRadius: 8,
    borderColor: isDark ? "#1f2a44" : "#e2e8f0",
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    color: isDark ? "#e2e8f0" : "#0f172a",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 dark:border-slate-700 dark:bg-slate-900/70">
      <h3 className="text-sm font-semibold text-brand-blue mb-4 dark:text-[#8DB5FF]">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={axisColor} />
            <YAxis tick={{ fontSize: 11 }} stroke={axisColor} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} fill="url(#energyFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyChart;
