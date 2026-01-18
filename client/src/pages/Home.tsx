/**
 * Home Page
 * Landing page for RefineryIQ platform
 * Features: Hero section with typewriter animation, features showcase, modern UI
 */

import AIChatbot from "@/components/chatbot/AIChatbot";
import { FeatureCard } from "@/components/home/FeatureCard";
import { TypewriterText } from "@/components/home/TypewriterText";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import BackgroundComponent from "@/components/ui/background-components";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Activity,
    ArrowRight,
    Brain,
    Shield,
    Zap
} from "lucide-react";
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

const Home = () => {
  const navigate = useNavigate();

  return (
    <BackgroundComponent>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Hero Section */}
        <main className="flex-1">
          <section className="container px-4 md:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
            <div className="max-w-5xl mx-auto">
              {/* Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center space-y-8"
              >
                {/* Main Title with Typewriter Effect */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block"
                  >
                    <span className="inline-block px-4 py-2 rounded-full bg-[#F37021]/10 border border-[#F37021]/20 text-[#F37021] text-sm font-medium mb-6">
                      <Zap className="w-4 h-4 inline-block mr-2" />
                      IOCL Guwahati Refinery
                    </span>
                  </motion.div>

                  <h1 className="font-orbitron font-bold text-4xl md:text-6xl lg:text-7xl leading-tight">
                    <TypewriterText
                      text="RefineIQ"
                      className="text-gradient-primary"
                    />
                  </h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
                  >
                    AI-Driven Smart Refinery Energy & Safety Intelligence
                    Platform
                  </motion.p>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.8 }}
                  className="space-y-4 max-w-3xl mx-auto"
                >
                  <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
                    An AI-powered platform for refinery energy efficiency and
                    safety intelligence.
                  </p>
                  <p className="text-base md:text-lg text-gray-500 dark:text-gray-400">
                    Analyze, predict, optimize, and make data-driven decisions
                    with confidence.
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                >
                  <Button
                    variant="primary"
                    onClick={() => navigate("/login")}
                    className="text-lg group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="brandOutline"
                    onClick={() =>
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-lg"
                  >
                    Explore Features
                  </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3, duration: 0.8 }}
                  className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16"
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-[#003A8F]">
                      8+
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Processing Units
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-[#F37021]">
                      24/7
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Real-time Monitoring
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-[#003A8F]">
                      AI
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Powered Insights
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 md:py-32 bg-muted/30">
            <div className="container px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-4 text-[#003A8F]">
                  Platform Features
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                  Comprehensive tools for energy optimization and safety
                  management in refinery operations
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 md:py-32">
            <div className="container px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto text-center space-y-8 glass-card p-8 md:p-12 rounded-2xl"
              >
                <h2 className="font-orbitron font-bold text-3xl md:text-4xl text-[#003A8F]">
                  Ready to Optimize Your Refinery?
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                  Join the future of refinery operations with AI-powered energy
                  intelligence and safety monitoring.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/login")}
                  className="text-lg"
                >
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
      
      {/* AI Chatbot */}
      <AIChatbot />
    </BackgroundComponent>
  );
};

export default Home;
