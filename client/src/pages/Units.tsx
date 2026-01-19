/**
 * Units Overview Page
 * Backend-driven overview based on alert sources
 */

import AIChatbot from "@/components/chatbot/AIChatbot";
import Sidebar from "@/components/layout/Sidebar";
import BackgroundComponent from "@/components/ui/background-components";
import { Input } from "@/components/ui/input";
import { anomaliesApi, type AlertRecord } from "@/services/api";
import { motion } from "framer-motion";
import { AlertTriangle, Factory, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const Units = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await anomaliesApi.getAlerts(200);
        setAlerts(data || []);
      } catch (error) {
        console.error("Failed to fetch alert sources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    alerts.forEach((alert) => {
      const source = alert.source || "unknown";
      counts.set(source, (counts.get(source) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([source, count]) => ({ source, count }));
  }, [alerts]);

  const filteredSources = sources.filter((entry) =>
    entry.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <BackgroundComponent>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </BackgroundComponent>
    );
  }

  return (
    <BackgroundComponent>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 ml-[280px] p-6">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-orbitron font-bold text-3xl mb-2">
              Refinery Sources
            </h1>
            <p className="text-muted-foreground">
              Backend-reported alert sources and activity counts
            </p>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alert sources..."
                className="pl-10 bg-muted/50 border-white/10"
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.length === 0 ? (
              <div className="glass-card p-6 text-sm text-muted-foreground">
                No alert sources available from the backend.
              </div>
            ) : (
              filteredSources.map((entry, index) => (
                <motion.div
                  key={entry.source}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Factory className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-lg">
                        {entry.source}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Alert source
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{entry.count} alerts reported</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Units;
