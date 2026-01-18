import { AlertRecord } from "@/services/api";

interface AlertTableProps {
  alerts: AlertRecord[];
}

const AlertTable = ({ alerts }: AlertTableProps) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-brand-blue">Live Anomaly Alerts</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Severity</th>
            <th className="text-left px-4 py-2 font-medium">Message</th>
            <th className="text-left px-4 py-2 font-medium">Source</th>
            <th className="text-left px-4 py-2 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                No active alerts.
              </td>
            </tr>
          ) : (
            alerts.map((alert, index) => (
              <tr key={`${alert.id}-${index}`} className={index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"}>
                <td className="px-4 py-3">
                  <span className={
                    alert.severity?.toLowerCase() === "high"
                      ? "text-brand-orange font-semibold"
                      : "text-slate-700 dark:text-slate-200"
                  }>
                    {alert.severity || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{alert.message}</td>
                <td className="px-4 py-3 text-slate-500">{alert.source || "-"}</td>
                <td className="px-4 py-3 text-slate-500">
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
