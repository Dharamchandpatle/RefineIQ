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

const EnergyChart = ({ title, data, color = "#003A8F" }: EnergyChartProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
    <h3 className="text-sm font-semibold text-brand-blue mb-4">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0" }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#energyFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default EnergyChart;
