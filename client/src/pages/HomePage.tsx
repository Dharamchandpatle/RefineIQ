import FeatureCard from "@/components/home/FeatureCard";
import { TypewriterText } from "@/components/home/TypewriterText";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Brain, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Home Page
 * Content restored; background is handled globally by AppBackground.
 */

const features = [
  {
    icon: Activity,
    title: "Energy Analytics",
    description:
      "Real-time monitoring and analysis of unit-wise energy consumption with SEC metrics and efficiency trends.",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description:
      "Machine learning-powered forecasts for energy usage and production optimization with high confidence.",
  },
  {
    icon: Shield,
    title: "Anomaly Detection",
    description:
      "Proactive safety monitoring with intelligent alert systems to identify abnormal operational patterns.",
  },
  {
    icon: Zap,
    title: "Smart Recommendations",
    description:
      "Data-driven optimization suggestions to reduce energy costs and improve operational efficiency.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/60 p-10 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#F37021] bg-[#F37021]/10 px-3 py-1 rounded-full">
            IOCL Guwahati Refinery
          </div>
          <h1 className="font-orbitron font-bold text-4xl md:text-6xl leading-tight">
            <TypewriterText text="RefineIQ" className="text-gradient-primary" />
          </h1>
          <p className="text-lg md:text-2xl text-slate-700">
            AI-Driven Smart Refinery Energy & Safety Intelligence Platform
          </p>
          <p className="text-base md:text-lg text-slate-600">
            Analyze, predict, optimize, and make data-driven decisions with confidence.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" onClick={() => navigate("/login")}>
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="brandOutline" onClick={() => navigate("/dashboard")}>
              View Dashboard
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl text-[#003A8F]">
            Platform Features
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Comprehensive tools for energy optimization and safety management in refinery operations.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
