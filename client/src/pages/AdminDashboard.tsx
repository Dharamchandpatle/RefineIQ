import EnergyChart from "@/components/EnergyChart";
import KpiCard from "@/components/KpiCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import UserOverview from "@/components/UserOverview";
import DatasetUpload from "@/components/admin/DatasetUpload";
import DatasetSelector from "@/components/dashboard/DatasetSelector";
import FluidLoader from "@/components/ui/FluidLoader";
import {
    dashboardApi,
    type RecommendationRecord,
} from "@/services/api";
import { useCallback, useEffect, useState } from "react";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalAnomaliesOverall: 0,
    averageSEC: null as number | null,
    forecastedEnergy: null as number | null,
    optimizationImpact: null as number | null,
  });
  const [energyForecast, setEnergyForecast] = useState<{ label: string; value: number }[]>([]);
  const [secForecast, setSecForecast] = useState<{ label: string; value: number }[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async (datasetId?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardApi.getAdmin(datasetId);

      setSummary({
        totalAnomaliesOverall: data.totalAnomaliesOverall ?? 0,
        averageSEC: data.averageSEC ?? null,
        forecastedEnergy: data.forecastedEnergy ?? null,
        optimizationImpact: data.optimizationImpact ?? null,
      });

      setEnergyForecast(
        (data.energyForecast || []).map((item, index) => ({
          label: item.date ? new Date(item.date).toLocaleDateString() : `T${index + 1}`,
          value: item.value || 0,
        }))
      );

      setSecForecast(
        (data.secForecast || []).map((item, index) => ({
          label: item.date ? new Date(item.date).toLocaleDateString() : `T${index + 1}`,
          value: item.value || 0,
        }))
      );

      setRecommendations(
        (data.recommendations || []).map((rec, index) => ({
          id: `${index}`,
          title: rec,
        }))
      );
    } catch (err) {
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const forecastedEnergy = summary.forecastedEnergy ?? null;

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

      <DatasetSelector onDatasetChange={loadData} />

      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Anomalies (overall)" value={summary.totalAnomaliesOverall ?? "N/A"} />
        <KpiCard label="Average SEC Trend" value={summary.averageSEC ? summary.averageSEC.toFixed(4) : "N/A"} unit="MWh/bbl" />
        <KpiCard
          label="Forecasted Energy Consumption"
          value={forecastedEnergy !== null ? forecastedEnergy.toFixed(2) : "N/A"}
          unit="MWh"
        />
        <KpiCard label="Optimization Impact / Estimated Savings" value={recommendations.length ? `${recommendations.length} initiatives` : "N/A"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EnergyChart title="Historical Energy Forecast" data={energyForecast} />
        <EnergyChart title="Historical SEC Forecast" data={secForecast} color="#F37021" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="max-h-[400px] overflow-y-auto">
          <RecommendationPanel title="Recommendation Analysis" recommendations={recommendations} />
        </div>
        <UserOverview />
      </div>
    </div>
  );
};

export default AdminDashboard;
