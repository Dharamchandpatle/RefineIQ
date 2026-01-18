export type UserRole = "ADMIN" | "OPERATOR";

export interface KPISummary {
  total_energy?: number | null;
  avg_energy?: number | null;
  avg_sec?: number | null;
  anomaly_rate?: number | null;
  last_updated?: string;
}

export interface AlertRecord {
  id?: string | null;
  message: string;
  severity: string;
  timestamp?: string | null;
  source?: string | null;
}

export interface ForecastRecord {
  timestamp?: string | null;
  value?: number | null;
  metric?: string | null;
}

export interface RecommendationRecord {
  id?: string | null;
  title: string;
  description?: string | null;
  impact?: string | null;
  timestamp?: string | null;
}

const TOKEN_KEY = "refineryiq_token";
const ROLE_KEY = "refineryiq_role";
const USER_KEY = "refineryiq_user";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const buildUrl = (path: string) => `${API_BASE}${path}`;

const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || response.statusText;
    const error = new Error(errorMessage);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
};

const fetchWithFallback = async <T>(urls: string[], options?: RequestInit): Promise<T> => {
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      return await fetchJson<T>(url, options);
    } catch (error) {
      lastError = error as Error;
      const status = (error as Error & { status?: number }).status;
      if (status && status !== 404) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Failed to fetch data");
};

export const authApi = {
  login: async (email: string, password: string) => {
    const data = await fetchJson<{ access_token: string; expires_in?: number; role?: UserRole; user?: { email?: string; name?: string; role?: UserRole } }>(
      buildUrl("/auth/login"),
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    const role = data.role || data.user?.role || "OPERATOR";
    const user = {
      email,
      name: data.user?.name || email.split("@")[0],
      role,
    };

    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { token: data.access_token, user };
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: () => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as { email: string; name: string; role: UserRole };
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },
};

export const kpiApi = {
  getSummary: async (): Promise<KPISummary> => {
    return fetchWithFallback<KPISummary>([
      buildUrl("/api/kpis"),
      buildUrl("/kpis/summary"),
    ], {
      headers: getAuthHeader(),
    });
  },
};

export const anomaliesApi = {
  getAlerts: async (): Promise<AlertRecord[]> => {
    return fetchWithFallback<AlertRecord[]>([
      buildUrl("/api/anomalies"),
      buildUrl("/anomalies/alerts"),
    ], {
      headers: getAuthHeader(),
    });
  },
};

export const forecastsApi = {
  getForecast: async (metric: "energy" | "sec" = "energy"): Promise<ForecastRecord[]> => {
    const apiQuery = metric === "sec" ? "?metric=sec" : "";
    const fallbackQuery = metric === "sec" ? "?forecast_type=sec" : "?forecast_type=energy";

    return fetchWithFallback<ForecastRecord[]>([
      buildUrl(`/api/forecast${apiQuery}`),
      buildUrl(`/forecasts${fallbackQuery}`),
    ], {
      headers: getAuthHeader(),
    });
  },
};

export const recommendationsApi = {
  getAll: async (): Promise<RecommendationRecord[]> => {
    return fetchWithFallback<RecommendationRecord[]>([
      buildUrl("/api/recommendations"),
      buildUrl("/recommendations"),
    ], {
      headers: getAuthHeader(),
    });
  },
};

export const chatbotApi = {
  query: async (message: string, context?: Record<string, unknown>) => {
    return fetchWithFallback<{ reply: string }>([
      buildUrl("/api/chatbot"),
      buildUrl("/chatbot"),
    ], {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ message, context }),
    });
  },
};
