import AlertTable from "@/components/AlertTable";
import EnergyChart from "@/components/EnergyChart";
import KpiCard from "@/components/KpiCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import DatasetSelector from "@/components/dashboard/DatasetSelector";
import FluidLoader from "@/components/ui/FluidLoader";
import {
  dashboardApi,
  type AlertRecord,
  type RecommendationRecord,
} from "@/services/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const OperatorDashboard = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [energyTrend, setEnergyTrend] = useState<{ label: string; value: number }[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [summary, setSummary] = useState({
    totalActiveAnomalies: 0,
    highSeverityAlerts: 0,
    currentSEC: null as number | null,
    predictedEnergyNextDay: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const lastAlertKey = useRef<string | null>(null);

  const loadData = async (datasetId?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardApi.getOperator(datasetId);

      setSummary({
        totalActiveAnomalies: data.totalActiveAnomalies ?? 0,
        highSeverityAlerts: data.highSeverityAlerts ?? 0,
        currentSEC: data.currentSEC ?? null,
        predictedEnergyNextDay: data.predictedEnergyNextDay ?? null,
      });

      setAlerts(
        (data.alerts || []).map((alert, index) => ({
          id: `${index}`,
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.timestamp,
          source: alert.unit,
        }))
      );

      setRecommendations(
        (data.recommendations || []).map((rec, index) => ({
          id: `${index}`,
          title: rec,
        }))
      );

      setEnergyTrend(
        (data.energyTrend || []).map((item, index) => ({
          label: item.date ? new Date(item.date).toLocaleDateString() : `T${index + 1}`,
          value: item.value || 0,
        }))
      );
    } catch (err) {
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[0];
    const key = `${latest.message}-${latest.timestamp}-${latest.severity}`;
    if (lastAlertKey.current === key) return;
    lastAlertKey.current = key;

    const severity = latest.severity?.toLowerCase();
    const title = "Latest alert detected";
    const description = latest.message || "Anomaly detected in refinery operations.";
    if (severity === "critical" || severity === "high") {
      toast.error(title, { description });
    } else if (severity === "medium") {
      toast.warning(title, { description });
    } else {
      toast.info(title, { description });
    }
  }, [alerts]);

  const highSeverity = summary.highSeverityAlerts;

  const predictedEnergy = summary.predictedEnergyNextDay ?? null;

  const deriveUnit = (source?: string | null) => {
    if (!source) return "Unknown";
    return source;
  };

  const unitOptions = useMemo(() => {
    const values = new Set<string>();
    alerts.forEach((alert) => values.add(deriveUnit(alert.source)));
    return ["all", ...Array.from(values).filter((value) => value !== "Unknown")];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const now = new Date();
    const getStartDate = () => {
      if (dateFilter === "today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return start;
      }
      if (dateFilter === "week") {
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      if (dateFilter === "month") {
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (dateFilter === "year") {
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }
      return null;
    };

    const startDate = getStartDate();

    return alerts
      .map((alert) => ({
        ...alert,
        unit: deriveUnit(alert.source),
      }))
      .filter((alert) => {
        if (unitFilter !== "all" && alert.unit !== unitFilter) return false;
        if (!startDate) return true;
        if (!alert.timestamp) return true;
        const alertDate = new Date(alert.timestamp);
        if (Number.isNaN(alertDate.getTime())) return true;
        return alertDate >= startDate;
      });
  }, [alerts, unitFilter, dateFilter]);

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

      <DatasetSelector onDatasetChange={loadData} />

      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Active Anomalies" value={summary.totalActiveAnomalies} />
        <KpiCard label="High Severity Alerts" value={highSeverity} />
        <KpiCard label="Current SEC" value={summary.currentSEC ? summary.currentSEC.toFixed(4) : "N/A"} unit="MWh/bbl" />
        <KpiCard
          label="Predicted Energy (Next Day)"
          value={predictedEnergy !== null ? predictedEnergy.toFixed(2) : "N/A"}
          unit="MWh"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EnergyChart title="Energy Trend (Recent)" data={energyTrend} />
        <RecommendationPanel recommendations={recommendations.slice(0, 4)} title="Recommendations" />
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-brand-blue">Live Anomaly Alerts</h3>
            <p className="text-xs text-slate-500">Filter by unit and time window.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={unitFilter}
              onChange={(event) => setUnitFilter(event.target.value)}
              className="text-xs border border-blue-100 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm"
            >
              <option value="all">All Units</option>
              {unitOptions.filter((option) => option !== "all").map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="text-xs border border-blue-100 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        <AlertTable alerts={filteredAlerts} />
      </div>
    </div>
  );
};

export default OperatorDashboard;
