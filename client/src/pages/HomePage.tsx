/**
 * Home Page
 * Attractive landing page with GSAP animated IOCL color background.
 */

import FeatureCard from "@/components/home/FeatureCard";
import { TypewriterText } from "@/components/home/TypewriterText";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Activity, ArrowRight, Brain, Shield, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
  const blobOrangeRef = useRef<HTMLDivElement | null>(null);
  const blobBlueRef = useRef<HTMLDivElement | null>(null);
  const blobAmberRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const orange = blobOrangeRef.current;
    const blue = blobBlueRef.current;
    const amber = blobAmberRef.current;

    if (!orange || !blue || !amber) return;

    gsap.to(orange, {
      x: 60,
      y: -40,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(blue, {
      x: -80,
      y: 50,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(amber, {
      x: 40,
      y: 70,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/60 p-10 md:p-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-[#F37021]/30 blur-3xl" ref={blobOrangeRef} />
          <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-[#003A8F]/25 blur-3xl" ref={blobBlueRef} />
          <div className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-[#FFB74D]/30 blur-3xl" ref={blobAmberRef} />
        </div>

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
