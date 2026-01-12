/**
 * Units Overview Page
 * Lists all refinery units with status and performance metrics
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Factory,
  Search,
  Filter,
  Activity,
  Gauge,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Wrench,
  XCircle,
} from "lucide-react";
import BackgroundComponent from "@/components/ui/background-components";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/chatbot/AIChatbot";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { unitsApi } from "@/services/api";
import { type RefineryUnit } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Units = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<RefineryUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await unitsApi.getAll();
        setUnits(data);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const getStatusIcon = (status: RefineryUnit["status"]) => {
    switch (status) {
      case "online":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "maintenance":
        return Wrench;
      case "offline":
        return XCircle;
      default:
        return Activity;
    }
  };

  const getStatusStyles = (status: RefineryUnit["status"]) => {
    switch (status) {
      case "online":
        return "bg-success/10 border-success/30 text-success";
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning";
      case "maintenance":
        return "bg-secondary/10 border-secondary/30 text-secondary";
      case "offline":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.unitId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || unit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = units.reduce(
    (acc, unit) => {
      acc[unit.status] = (acc[unit.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
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
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-orbitron font-bold text-3xl mb-2">
              Refinery Units
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage all processing units
            </p>
          </motion.header>

          {/* Status summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(["online", "warning", "maintenance", "offline"] as const).map(
              (status, index) => {
                const StatusIcon = getStatusIcon(status);
                return (
                  <motion.button
                    key={status}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() =>
                      setStatusFilter(statusFilter === status ? null : status)
                    }
                    className={cn(
                      "glass-card p-4 text-left transition-all",
                      statusFilter === status && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon
                        className={cn(
                          "w-5 h-5",
                          status === "online"
                            ? "text-success"
                            : status === "warning"
                              ? "text-warning"
                              : status === "maintenance"
                                ? "text-secondary"
                                : "text-destructive"
                        )}
                      />
                      <span className="text-sm text-muted-foreground capitalize">
                        {status}
                      </span>
                    </div>
                    <p className="font-orbitron font-bold text-2xl">
                      {statusCounts[status] || 0}
                    </p>
                  </motion.button>
                );
              }
            )}
          </div>

          {/* Search and filters */}
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
                placeholder="Search units..."
                className="pl-10 bg-muted/50 border-white/10"
              />
            </div>
            {statusFilter && (
              <Button
                variant="outline"
                onClick={() => setStatusFilter(null)}
                className="border-white/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            )}
          </motion.div>

          {/* Units grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit, index) => {
              const StatusIcon = getStatusIcon(unit.status);
              const loadPercent = (unit.currentLoad / unit.capacity) * 100;

              return (
                <motion.div
                  key={unit.unitId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => navigate(`/units/${unit.unitId}`)}
                  className="glass-card p-5 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Factory className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-lg">
                          {unit.unitId}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {unit.type}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "px-2 py-1 rounded border flex items-center gap-1 text-xs",
                        getStatusStyles(unit.status)
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{unit.status}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {unit.name}
                  </p>

                  <div className="space-y-3">
                    {/* Efficiency */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        Efficiency
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          unit.efficiency >= 90
                            ? "text-success"
                            : unit.efficiency >= 80
                              ? "text-warning"
                              : "text-destructive"
                        )}
                      >
                        {unit.efficiency.toFixed(1)}%
                      </span>
                    </div>

                    {/* Load */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Load</span>
                        <span>{loadPercent.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${unit.status === "maintenance" ? 0 : loadPercent}%`,
                          }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={cn(
                            "h-full rounded-full",
                            loadPercent >= 90
                              ? "bg-warning"
                              : loadPercent >= 70
                                ? "bg-success"
                                : "bg-secondary"
                          )}
                        />
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span>{unit.capacity.toLocaleString()} bbl/day</span>
                    </div>
                  </div>

                  {/* View details arrow */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      View Details
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredUnits.length === 0 && (
            <div className="text-center py-12">
              <Factory className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-orbitron text-xl mb-2">No units found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Units;
