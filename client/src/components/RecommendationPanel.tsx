import { RecommendationRecord } from "@/services/api";

interface RecommendationPanelProps {
  recommendations: RecommendationRecord[];
  title?: string;
}

const RecommendationPanel = ({ recommendations, title = "Recommendations" }: RecommendationPanelProps) => {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm shadow-sm p-5 dark:border-slate-700 dark:bg-slate-900/70">
      <h3 className="text-sm font-semibold text-brand-blue mb-4 dark:text-[#8DB5FF]">{title}</h3>
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-blue-100 bg-white/70 backdrop-blur-sm p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
            No recommendations available from the backend.
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <div key={`${rec.id}-${index}`} className="rounded-xl border border-blue-100 bg-white/70 backdrop-blur-sm p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rec.title}</p>
              {rec.description ? (
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{rec.description}</p>
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
};

export default RecommendationPanel;
