import { RecommendationRecord } from "@/services/api";

interface RecommendationPanelProps {
  recommendations: RecommendationRecord[];
  title?: string;
}

const RecommendationPanel = ({ recommendations, title = "Recommendations" }: RecommendationPanelProps) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm">
    <h3 className="text-sm font-semibold text-brand-blue mb-4">{title}</h3>
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <p className="text-sm text-slate-500">No recommendations available.</p>
      ) : (
        recommendations.map((rec, index) => (
          <div key={`${rec.id}-${index}`} className="border border-slate-200 dark:border-slate-800 rounded-md p-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rec.title}</p>
            {rec.description ? (
              <p className="text-xs text-slate-500 mt-1">{rec.description}</p>
            ) : null}
            {rec.impact ? (
              <p className="text-xs text-brand-orange mt-2">{rec.impact}</p>
            ) : null}
          </div>
        ))
      )}
    </div>
  </div>
);

export default RecommendationPanel;
