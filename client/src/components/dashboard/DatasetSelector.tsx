import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { datasetsApi, type DatasetRecord } from "@/services/api";
import { useEffect, useMemo, useRef, useState } from "react";

type DatasetSelectorProps = {
  onDatasetChange?: (datasetId: string | null) => void | Promise<void>;
};

const DatasetSelector = ({ onDatasetChange }: DatasetSelectorProps) => {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DatasetRecord | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadDatasets = async () => {
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

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const grouped = useMemo(() => {
    const groups: Record<string, DatasetRecord[]> = {};
    datasets.forEach((dataset) => {
      const category = dataset.category || "General";
      if (!groups[category]) groups[category] = [];
      groups[category].push(dataset);
    });
    return groups;
  }, [datasets]);

  const handleSelect = async (datasetId: string | null) => {
    setActiveId(datasetId);
    setOpen(false);
    if (!datasetId) return;
    try {
      await datasetsApi.setActive(datasetId);
      if (onDatasetChange) {
        await onDatasetChange(datasetId);
      }
    } catch (err) {
      setError("Unable to set active dataset.");
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setError("");
    try {
      await datasetsApi.delete(pendingDelete.id);
      await loadDatasets();

      if (pendingDelete.id === activeId) {
        const remaining = datasets.filter((dataset) => dataset.id !== pendingDelete.id);
        const next = remaining[0]?.id || null;
        if (next) {
          await datasetsApi.setActive(next);
        }
        setActiveId(next);
        if (onDatasetChange) {
          await onDatasetChange(next);
        }
      }
    } catch (err) {
      setError("Unable to delete dataset.");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm shadow-sm p-4 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-blue dark:text-[#8DB5FF]">Dataset Selector</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select an uploaded dataset to power all dashboards.
          </p>
        </div>
        <div className="w-full md:w-72" ref={dropdownRef}>
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen((prev) => !prev)}
            className="w-full text-left text-xs border border-blue-100 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
          >
            {loading
              ? "Loading datasets..."
              : datasets.length === 0
                ? "No datasets available"
                : datasets.find((dataset) => dataset.id === activeId)?.name || "Select dataset"}
          </button>
          {open && !loading && datasets.length > 0 ? (
            <div className="mt-2 w-full rounded-md border border-blue-100 bg-white/90 shadow-sm backdrop-blur-sm text-xs max-h-64 overflow-y-auto dark:border-slate-700 dark:bg-slate-900/90">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {category}
                  </div>
                  <div>
                    {items.map((dataset) => (
                      <div
                        key={dataset.id}
                        className="group flex items-center justify-between px-3 py-2 hover:bg-blue-50/60 dark:hover:bg-slate-800/70 cursor-pointer"
                        onClick={() => handleSelect(dataset.id)}
                      >
                        <span className="text-slate-700 dark:text-slate-200">{dataset.name}</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPendingDelete(dataset);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition text-[10px]"
                          aria-label={`Delete ${dataset.name}`}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-brand-orange">{error}</p> : null}
      <AlertDialog open={!!pendingDelete} onOpenChange={(value) => !value && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dataset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dataset?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatasetSelector;