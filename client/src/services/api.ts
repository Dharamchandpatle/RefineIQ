/**
 * API Service Layer
 * Simulates backend API calls with mock data
 * In production, these would connect to actual backend endpoints
 */

import {
  alerts,
  generateEnergyData,
  generatePredictions,
  kpis,
  mockUsers,
  recommendations,
  refineryUnits,
  type Alert,
  type EnergyData,
  type KPIData,
  type Prediction,
  type Recommendation,
  type RefineryUnit
} from "@/data/mockData";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// JWT token storage
const TOKEN_KEY = "refineryiq_token";
const USER_KEY = "refineryiq_user";

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login with email and password
   * Returns JWT token on success
   */
  login: async (email: string, password: string) => {
    await delay(800); // Simulate network latency

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Generate mock JWT token
    const token = btoa(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    );

    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },

  /**
   * Logout - Clear stored credentials
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  },
};

/**
 * Energy Data API
 */
export const energyApi = {
  /**
   * Get all energy data
   */
  getData: async (): Promise<EnergyData[]> => {
    await delay(500);
    return generateEnergyData();
  },

  /**
   * Get energy data for specific unit
   */
  getUnitData: async (unitId: string): Promise<EnergyData[]> => {
    await delay(400);
    const allData = generateEnergyData();
    return allData.filter((d) => d.unitId === unitId);
  },

  /**
   * Get aggregated daily totals
   */
  getDailyTotals: async (): Promise<
    { date: string; totalEnergy: number; totalProduction: number }[]
  > => {
    await delay(600);
    const allData = generateEnergyData();

    // Group by date and sum
    const grouped = allData.reduce(
      (acc, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = { energy: 0, production: 0 };
        }
        acc[curr.date].energy += curr.energy;
        acc[curr.date].production += curr.production;
        return acc;
      },
      {} as Record<string, { energy: number; production: number }>
    );

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        totalEnergy: data.energy,
        totalProduction: data.production,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};

/**
 * KPI API
 */
export const kpiApi = {
  /**
   * Get all KPIs
   */
  getAll: async (): Promise<KPIData[]> => {
    await delay(300);
    return kpis;
  },

  /**
   * Calculate SEC for all units
   */
  getSEC: async (): Promise<{ unitId: string; sec: number }[]> => {
    await delay(400);
    return refineryUnits.map((unit) => ({
      unitId: unit.unitId,
      sec: parseFloat((Math.random() * 0.05 + 0.07).toFixed(4)),
    }));
  },
};

/**
 * Alerts API
 */
export const alertsApi = {
  /**
   * Get all alerts
   */
  getAll: async (): Promise<Alert[]> => {
    await delay(200);
    return alerts;
  },

  /**
   * Get unacknowledged alerts
   */
  getActive: async (): Promise<Alert[]> => {
    await delay(200);
    return alerts.filter((a) => !a.acknowledged);
  },

  /**
   * Acknowledge an alert
   */
  acknowledge: async (alertId: string): Promise<void> => {
    await delay(300);
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  },
};

/**
 * Units API
 */
export const unitsApi = {
  /**
   * Get all refinery units
   */
  getAll: async (): Promise<RefineryUnit[]> => {
    await delay(400);
    return refineryUnits;
  },

  /**
   * Get specific unit details
   */
  getUnit: async (unitId: string): Promise<RefineryUnit | undefined> => {
    await delay(300);
    return refineryUnits.find((u) => u.unitId === unitId);
  },
};

/**
 * Predictions API
 */
export const predictionsApi = {
  /**
   * Get energy predictions
   */
  getPredictions: async (): Promise<Prediction[]> => {
    await delay(700);
    return generatePredictions();
  },
};

/**
 * Recommendations API
 */
export const recommendationsApi = {
  /**
   * Get all optimization recommendations
   */
  getAll: async (): Promise<Recommendation[]> => {
    await delay(500);
    return recommendations;
  },

  /**
   * Get recommendations by priority
   */
  getByPriority: async (priority: string): Promise<Recommendation[]> => {
    await delay(400);
    return recommendations.filter((r) => r.priority === priority);
  },
};

/**
 * Chatbot API
 * Simulates AI-powered responses
 */
export const chatbotApi = {
  /**
   * Send query to AI chatbot
   */
  query: async (
    message: string
  ): Promise<{ response: string; data?: unknown }> => {
    await delay(1000);

    const lowerMessage = message.toLowerCase();

    // Pattern matching for different query types
    if (lowerMessage.includes("sec") || lowerMessage.includes("energy consumption")) {
      return {
        response: `The current overall Specific Energy Consumption (SEC) is 0.0842 MWh/bbl, which is 2.3% lower than last week. The CDU has the best SEC at 0.072 MWh/bbl, while the FCC is showing elevated SEC at 0.095 MWh/bbl due to catalyst regeneration issues.`,
        data: kpis.find((k) => k.name === "Overall SEC"),
      };
    }

    if (lowerMessage.includes("alert") || lowerMessage.includes("alarm")) {
      const activeAlerts = alerts.filter((a) => !a.acknowledged);
      return {
        response: `There are currently ${activeAlerts.length} active alerts. The most critical is the pressure fluctuation in CDU Column 3, which was detected 5 minutes ago. I recommend immediate investigation by the control room operator.`,
        data: activeAlerts,
      };
    }

    if (lowerMessage.includes("recommendation") || lowerMessage.includes("optimize")) {
      return {
        response: `I have ${recommendations.length} optimization recommendations. The top priority is to optimize the FCC regenerator temperature, which could save $125,000 annually. Would you like me to explain the implementation steps?`,
        data: recommendations.slice(0, 3),
      };
    }

    if (lowerMessage.includes("prediction") || lowerMessage.includes("forecast")) {
      const predictions = generatePredictions();
      return {
        response: `Based on historical patterns and current operating conditions, I predict the plant will consume approximately ${predictions[0].predictedEnergy} MWh tomorrow with a production of ${predictions[0].predictedProduction} barrels. Confidence level is ${(predictions[0].confidence * 100).toFixed(0)}%.`,
        data: predictions,
      };
    }

    if (lowerMessage.includes("efficiency") || lowerMessage.includes("performance")) {
      return {
        response: `The current plant efficiency is 91.4%, up 1.2% from last week. The best performing unit is the ISO (Isomerization) at 95.2% efficiency, while the FCC is currently underperforming at 87.8% due to ongoing catalyst issues.`,
        data: refineryUnits.map((u) => ({ unitId: u.unitId, efficiency: u.efficiency })),
      };
    }

    if (lowerMessage.includes("unit") || lowerMessage.includes("cdu") || lowerMessage.includes("fcc")) {
      return {
        response: `The refinery has 8 major processing units. Currently, 6 units are online, 1 is in maintenance (HDS), and 1 has warnings (FCC). The total processing capacity is 470,000 bbl/day with current utilization at 91%.`,
        data: refineryUnits,
      };
    }

    // Default response
    return {
      response: `I can help you with information about energy consumption, SEC metrics, alerts, optimization recommendations, predictions, and unit performance. Please ask me about any of these topics, or be more specific about what you'd like to know.`,
    };
  },
};
