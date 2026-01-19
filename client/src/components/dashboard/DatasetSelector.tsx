import { useAuth } from "@/hooks/useAuth";
import { datasetsApi, type DatasetRecord } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

type DatasetSelectorProps = {
  onDatasetChange?: (datasetId: string | null) => void | Promise<void>;
};

const DatasetSelector = ({ onDatasetChange }: DatasetSelectorProps) => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManage = user?.role === "ADMIN";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [list, active] = await Promise.all([
          datasetsApi.list(),
          datasetsApi.getActive(),
        ]);
        setDatasets(list || []);
        setActiveId(active.dataset_id || null);
      } catch (err) {
        setError("Unable to load datasets.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, DatasetRecord[]> = {};
    datasets.forEach((dataset) => {
      const category = dataset.category || "General";
      if (!groups[category]) groups[category] = [];
      groups[category].push(dataset);
    });
    return groups;
  }, [datasets]);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value || null;
    setActiveId(value);
    if (!value) return;
    try {
      await datasetsApi.setActive(value);
      if (onDatasetChange) {
        await onDatasetChange(value);
      }
    } catch (err) {
      setError("Unable to set active dataset.");
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-blue">Dataset Selector</h3>
          <p className="text-xs text-slate-500">
            Select an uploaded dataset to power all dashboards.
          </p>
        </div>
        <div className="w-full md:w-72">
          <select
            value={activeId || ""}
            onChange={handleChange}
            disabled={loading}
            className="w-full text-xs border border-blue-100 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm"
          >
            {loading ? (
              <option value="">Loading datasets...</option>
            ) : datasets.length === 0 ? (
              <option value="">No datasets available</option>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </option>
                  ))}
                </optgroup>
              ))
            )}
          </select>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-brand-orange">{error}</p> : null}
    </div>
  );
};

export default DatasetSelector;