import EnergyChart from "@/components/EnergyChart";
import KpiCard from "@/components/KpiCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import UserOverview from "@/components/UserOverview";
import DatasetUpload from "@/components/admin/DatasetUpload";
import FluidLoader from "@/components/ui/FluidLoader";
import {
    forecastsApi,
    kpiApi,
    recommendationsApi,
    type RecommendationRecord,
} from "@/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({ avg_sec: 0, total_energy: 0, anomaly_rate: 0 });
  const [energyForecast, setEnergyForecast] = useState<{ label: string; value: number }[]>([]);
  const [secForecast, setSecForecast] = useState<{ label: string; value: number }[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, energyData, secData, recs] = await Promise.all([
        kpiApi.getSummary(),
        forecastsApi.getForecast("energy"),
        forecastsApi.getForecast("sec"),
        recommendationsApi.getAll(),
      ]);

      setSummary({
        avg_sec: summaryData.avg_sec || 0,
        total_energy: summaryData.total_energy || 0,
        anomaly_rate: summaryData.anomaly_rate || 0,
      });

      setEnergyForecast(
        (energyData || []).slice(-30).map((item, index) => ({
          label: item.timestamp ? new Date(item.timestamp).toLocaleDateString() : `T${index + 1}`,
          value: item.value || 0,
        }))
      );

      setSecForecast(
        (secData || []).slice(-30).map((item, index) => ({
          label: item.timestamp ? new Date(item.timestamp).toLocaleDateString() : `T${index + 1}`,
          value: item.value || 0,
        }))
      );

      setRecommendations(recs || []);
    } catch (err) {
      setError("Unable to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const forecastedEnergy = useMemo(() => {
    if (energyForecast.length === 0) return "N/A";
    return `${energyForecast[energyForecast.length - 1].value.toFixed(2)}`;
  }, [energyForecast]);

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
        <h2 className="text-2xl font-semibold text-brand-blue">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">Analysis, optimization, and system-wide control.</p>
      </header>

      <DatasetUpload onSuccess={loadData} />

      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Anomalies (overall)" value={summary.anomaly_rate ? `${summary.anomaly_rate.toFixed(2)}%` : "N/A"} />
        <KpiCard label="Average SEC Trend" value={summary.avg_sec ? summary.avg_sec.toFixed(4) : "N/A"} unit="MWh/bbl" />
        <KpiCard label="Forecasted Energy Consumption" value={forecastedEnergy} unit="MWh" />
        <KpiCard label="Optimization Impact / Estimated Savings" value={recommendations.length ? `${recommendations.length} initiatives` : "N/A"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EnergyChart title="Historical Energy Forecast" data={energyForecast} />
        <EnergyChart title="Historical SEC Forecast" data={secForecast} color="#F37021" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecommendationPanel title="Recommendation Analysis" recommendations={recommendations} />
        <UserOverview />
      </div>
    </div>
  );
};

export default AdminDashboard;
