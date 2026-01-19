import { AlertRecord } from "@/services/api";

type AlertWithUnit = AlertRecord & { unit?: string };

interface AlertTableProps {
  alerts: AlertWithUnit[];
}

const AlertTable = ({ alerts }: AlertTableProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900/70">
    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70">
      <h3 className="text-sm font-semibold text-brand-blue dark:text-[#8DB5FF]">Live Anomaly Alerts</h3>
    </div>
    <div className="overflow-x-auto overflow-y-auto max-h-[400px] h-[400px]">
      <table className="w-full text-sm">
        <thead className="bg-white text-slate-600 sticky top-0 z-10 dark:bg-slate-900/90 dark:text-slate-300">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Severity</th>
            <th className="text-left px-5 py-3 font-medium">Message</th>
            <th className="text-left px-5 py-3 font-medium">Unit</th>
            <th className="text-left px-5 py-3 font-medium">Source</th>
            <th className="text-left px-5 py-3 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                No active alerts.
              </td>
            </tr>
          ) : (
            alerts.map((alert, index) => (
              <tr key={`${alert.id}-${index}`} className={index % 2 === 0 ? "bg-white dark:bg-slate-900/70" : "bg-slate-50/60 dark:bg-slate-800/60"}>
                <td className="px-5 py-4">
                  <span className={
                    alert.severity?.toLowerCase() === "high"
                      ? "text-brand-orange font-semibold"
                      : "text-slate-700 dark:text-slate-200"
                  }>
                    {alert.severity || "N/A"}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700 dark:text-slate-200">{alert.message}</td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{alert.unit || "-"}</td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{alert.source || "-"}</td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default AlertTable;
