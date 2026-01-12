/**
 * Admin Panel Page
 * System configuration and management
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Database,
  Users,
  Sliders,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle,
  Factory,
} from "lucide-react";
import BackgroundComponent from "@/components/ui/background-components";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/chatbot/AIChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { refineryUnits } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ThresholdConfig {
  anomalyThreshold: number;
  criticalAlertThreshold: number;
  warningAlertThreshold: number;
  predictionConfidenceMin: number;
}

const Admin = () => {
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    anomalyThreshold: 15,
    criticalAlertThreshold: 95,
    warningAlertThreshold: 85,
    predictionConfidenceMin: 80,
  });

  const [unitSettings, setUnitSettings] = useState(
    refineryUnits.reduce(
      (acc, unit) => ({
        ...acc,
        [unit.unitId]: {
          enabled: unit.status !== "offline",
          alertsEnabled: true,
          predictionsEnabled: true,
        },
      }),
      {} as Record<
        string,
        { enabled: boolean; alertsEnabled: boolean; predictionsEnabled: boolean }
      >
    )
  );

  const handleSaveThresholds = () => {
    toast({
      title: "Settings Saved",
      description: "Threshold configuration has been updated successfully.",
    });
  };

  const handleUploadData = () => {
    toast({
      title: "Upload Started",
      description: "Mock data upload simulation initiated.",
    });
  };

  const handleUnitToggle = (unitId: string, field: string, value: boolean) => {
    setUnitSettings((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: value,
      },
    }));
  };

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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-3xl">Admin Panel</h1>
                <p className="text-muted-foreground">
                  System configuration and management
                </p>
              </div>
            </div>
          </motion.header>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Threshold Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg">
                    Alert Thresholds
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure anomaly detection parameters
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Anomaly Threshold */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Anomaly Detection Sensitivity</Label>
                    <span className="text-sm text-primary font-medium">
                      {thresholds.anomalyThreshold}%
                    </span>
                  </div>
                  <Slider
                    value={[thresholds.anomalyThreshold]}
                    onValueChange={(v) =>
                      setThresholds((prev) => ({
                        ...prev,
                        anomalyThreshold: v[0],
                      }))
                    }
                    min={5}
                    max={30}
                    step={1}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deviation percentage from baseline to trigger anomaly
                  </p>
                </div>

                {/* Critical Alert Threshold */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Critical Alert Threshold</Label>
                    <span className="text-sm text-destructive font-medium">
                      {thresholds.criticalAlertThreshold}%
                    </span>
                  </div>
                  <Slider
                    value={[thresholds.criticalAlertThreshold]}
                    onValueChange={(v) =>
                      setThresholds((prev) => ({
                        ...prev,
                        criticalAlertThreshold: v[0],
                      }))
                    }
                    min={80}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-destructive"
                  />
                </div>

                {/* Warning Alert Threshold */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Warning Alert Threshold</Label>
                    <span className="text-sm text-warning font-medium">
                      {thresholds.warningAlertThreshold}%
                    </span>
                  </div>
                  <Slider
                    value={[thresholds.warningAlertThreshold]}
                    onValueChange={(v) =>
                      setThresholds((prev) => ({
                        ...prev,
                        warningAlertThreshold: v[0],
                      }))
                    }
                    min={60}
                    max={95}
                    step={1}
                    className="[&_[role=slider]]:bg-warning"
                  />
                </div>

                {/* Prediction Confidence */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Minimum Prediction Confidence</Label>
                    <span className="text-sm text-secondary font-medium">
                      {thresholds.predictionConfidenceMin}%
                    </span>
                  </div>
                  <Slider
                    value={[thresholds.predictionConfidenceMin]}
                    onValueChange={(v) =>
                      setThresholds((prev) => ({
                        ...prev,
                        predictionConfidenceMin: v[0],
                      }))
                    }
                    min={50}
                    max={95}
                    step={5}
                    className="[&_[role=slider]]:bg-secondary"
                  />
                </div>

                <Button onClick={handleSaveThresholds} className="w-full mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  Save Threshold Settings
                </Button>
              </div>
            </motion.div>

            {/* Data Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg">
                    Data Management
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage mock data
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop JSON data file here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Or click to browse
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">
                    Current Data Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Units</span>
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {refineryUnits.length} loaded
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Energy Records
                      </span>
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        248 records
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alerts</span>
                      <span className="text-warning flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />5 active
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleUploadData}
                  className="w-full border-white/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Mock Data
                </Button>
              </div>
            </motion.div>

            {/* Unit Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Factory className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg">
                    Unit Management
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure monitoring settings for each unit
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Unit
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Monitoring
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Alerts
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Predictions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {refineryUnits.map((unit, index) => (
                      <motion.tr
                        key={unit.unitId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="border-b border-white/5"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Factory className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{unit.unitId}</p>
                              <p className="text-xs text-muted-foreground">
                                {unit.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {unit.type}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={unitSettings[unit.unitId]?.enabled}
                            onCheckedChange={(v) =>
                              handleUnitToggle(unit.unitId, "enabled", v)
                            }
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={unitSettings[unit.unitId]?.alertsEnabled}
                            onCheckedChange={(v) =>
                              handleUnitToggle(unit.unitId, "alertsEnabled", v)
                            }
                            disabled={!unitSettings[unit.unitId]?.enabled}
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={
                              unitSettings[unit.unitId]?.predictionsEnabled
                            }
                            onCheckedChange={(v) =>
                              handleUnitToggle(
                                unit.unitId,
                                "predictionsEnabled",
                                v
                              )
                            }
                            disabled={!unitSettings[unit.unitId]?.enabled}
                          />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() =>
                    toast({
                      title: "Unit Settings Saved",
                      description:
                        "All unit configurations have been updated.",
                    })
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Unit Settings
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        <AIChatbot />
      </div>
    </BackgroundComponent>
  );
};

export default Admin;
