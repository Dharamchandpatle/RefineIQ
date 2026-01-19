import { AlertRecord } from "@/services/api";

type AlertWithUnit = AlertRecord & { unit?: string };

interface AlertTableProps {
  alerts: AlertWithUnit[];
}

const AlertTable = ({ alerts }: AlertTableProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
      <h3 className="text-sm font-semibold text-brand-blue">Live Anomaly Alerts</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-white text-slate-600">
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
              <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                No active alerts.
              </td>
            </tr>
          ) : (
            alerts.map((alert, index) => (
              <tr key={`${alert.id}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                <td className="px-5 py-4">
                  <span className={
                    alert.severity?.toLowerCase() === "high"
                      ? "text-brand-orange font-semibold"
                      : "text-slate-700"
                  }>
                    {alert.severity || "N/A"}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-700">{alert.message}</td>
                <td className="px-5 py-4 text-slate-500">{alert.unit || "-"}</td>
                <td className="px-5 py-4 text-slate-500">{alert.source || "-"}</td>
                <td className="px-5 py-4 text-slate-500">
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
