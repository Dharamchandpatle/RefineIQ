import AlertTable from "@/components/AlertTable";
import EnergyChart from "@/components/EnergyChart";
import KpiCard from "@/components/KpiCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import FluidLoader from "@/components/ui/FluidLoader";
import {
    anomaliesApi,
    forecastsApi,
    kpiApi,
    recommendationsApi,
    type AlertRecord,
    type RecommendationRecord,
} from "@/services/api";
import { useEffect, useMemo, useState } from "react";

const OperatorDashboard = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [energyTrend, setEnergyTrend] = useState<{ label: string; value: number }[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [summary, setSummary] = useState({ avg_sec: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryData, alertData, forecastData, recs] = await Promise.all([
          kpiApi.getSummary(),
          anomaliesApi.getAlerts(),
          forecastsApi.getForecast("energy"),
          recommendationsApi.getAll(),
        ]);

        setSummary({ avg_sec: summaryData.avg_sec || 0 });
        setAlerts(alertData || []);
        setRecommendations(recs || []);
        setEnergyTrend(
          (forecastData || []).slice(-14).map((item, index) => ({
            label: item.timestamp ? new Date(item.timestamp).toLocaleDateString() : `T${index + 1}`,
            value: item.value || 0,
          }))
        );
      } catch (err) {
        setError("Unable to load operator dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const highSeverity = useMemo(
    () => alerts.filter((alert) => alert.severity?.toLowerCase() === "high").length,
    [alerts]
  );

  const predictedEnergy = useMemo(() => {
    if (energyTrend.length === 0) return "N/A";
    return `${energyTrend[energyTrend.length - 1].value.toFixed(2)}`;
  }, [energyTrend]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <FluidLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-brand-blue">Operator Dashboard</h2>
        <p className="text-sm text-slate-500">Real-time monitoring and operational actions.</p>
      </header>

      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Active Anomalies" value={alerts.length} />
        <KpiCard label="High Severity Alerts" value={highSeverity} />
        <KpiCard label="Current SEC" value={summary.avg_sec ? summary.avg_sec.toFixed(4) : "N/A"} unit="MWh/bbl" />
        <KpiCard label="Predicted Energy (Next Day)" value={predictedEnergy} unit="MWh" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EnergyChart title="Energy Trend (Recent)" data={energyTrend} />
        <RecommendationPanel recommendations={recommendations.slice(0, 4)} title="Recommendations" />
      </div>

      <AlertTable alerts={alerts} />
    </div>
  );
};

export default OperatorDashboard;
