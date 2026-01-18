/**
 * Home Page (new)
 * Lightweight landing page for the RefineryIQ app shell.
 */

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-blue-50 border border-slate-100 p-8 md:p-12"
      >
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
            <Sparkles className="h-4 w-4" />
            Smart Refinery Intelligence
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            RefineryIQ Home
          </h1>
          <p className="text-base md:text-lg text-slate-600">
            Monitor energy usage, detect anomalies, and act on AI-driven insights
            with a unified operational view.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/login")} className="group">
              Go to Login
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6 bg-white">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <ShieldCheck className="h-5 w-5 text-brand-blue" />
            Operational Confidence
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Get a clear status snapshot for energy, safety, and production
            readiness across refinery units.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 bg-white">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Sparkles className="h-5 w-5 text-amber-600" />
            AI Recommendations
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Prioritize actions with automated insights designed to reduce
            consumption and improve performance.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
