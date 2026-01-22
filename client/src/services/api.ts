export type UserRole = "ADMIN" | "OPERATOR";

export interface KPISummary {
  total_energy?: number | null;
  avg_energy?: number | null;
  avg_sec?: number | null;
  anomaly_rate?: number | null;
  total_anomalies?: number | null;
  high_severity_count?: number | null;
  predicted_energy_next_day?: number | null;
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
  raw?: Record<string, unknown>;
}

export interface RecommendationRecord {
  id?: string | null;
  title: string;
  description?: string | null;
  impact?: string | null;
  timestamp?: string | null;
}

export interface OperatorDashboardResponse {
  totalActiveAnomalies: number;
  highSeverityAlerts: number;
  currentSEC: number | null;
  predictedEnergyNextDay: number | null;
  energyTrend: { date: string | null; value: number | null }[];
  alerts: { severity: string; message: string; unit: string; timestamp: string | null }[];
  recommendations: string[];
}

export interface AdminDashboardResponse {
  totalAnomaliesOverall: number;
  averageSEC: number | null;
  forecastedEnergy: number | null;
  optimizationImpact: number | null;
  energyForecast: { date: string | null; value: number | null }[];
  secForecast: { date: string | null; value: number | null }[];
  recommendations: string[];
}

export interface UserRecord {
  id?: string | null;
  email: string;
  full_name?: string | null;
  role?: UserRole;
  created_at?: string | null;
}

export interface DatasetRecord {
  id: string;
  name: string;
  category?: string | null;
  status?: string | null;
  created_at?: string | null;
}

export interface ChatbotQueryResponse {
  answer: string;
  sources: string[];
  confidence: "high" | "medium" | "low";
}

const TOKEN_KEY = "refineryiq_token";
const ROLE_KEY = "refineryiq_role";
const USER_KEY = "refineryiq_user";

const normalizeRole = (role?: string | null): UserRole => (role?.toUpperCase() === "ADMIN" ? "ADMIN" : "OPERATOR");

export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "");

export const buildUrl = (path: string) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestJson = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
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

export const apiGet = <T>(path: string, options?: RequestInit) =>
  requestJson<T>(path, { method: "GET", ...options });

export const apiPost = <T>(path: string, body?: unknown, options?: RequestInit) =>
  requestJson<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

export const apiUpload = async (path: string, formData: FormData, options?: RequestInit) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    ...options,
    headers: {
      ...(options?.headers || {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || response.statusText;
    throw new Error(errorMessage);
  }
};

export const authApi = {
  register: async (payload: {
    email: string;
    full_name?: string | null;
    role?: UserRole;
    password: string;
  }) => {
    return apiPost<{
      id?: string | null;
      email: string;
      full_name?: string | null;
      role?: UserRole;
      created_at?: string;
    }>("/auth/register", payload);
  },
  login: async (email: string, password: string) => {
    const data = await apiPost<{
      access_token: string;
      expires_in?: number;
      role?: UserRole;
      user?: { email?: string; name?: string; role?: UserRole };
    }>("/auth/login", { email, password });

    const role = normalizeRole(data.role || data.user?.role || "OPERATOR");
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
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getCurrentUser: () => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as { email: string; name: string; role?: string };
      return {
        email: parsed.email,
        name: parsed.name,
        role: normalizeRole(parsed.role),
      } as { email: string; name: string; role: UserRole };
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
  getSummary: async (): Promise<KPISummary> =>
    apiGet<KPISummary>("/api/kpis", { headers: getAuthHeader() }),
};

export const anomaliesApi = {
  getAlerts: async (limit = 100): Promise<AlertRecord[]> =>
    apiGet<AlertRecord[]>(`/api/anomalies?limit=${limit}`, {
      headers: getAuthHeader(),
    }),
};

export const forecastsApi = {
  getForecast: async (type: "energy" | "sec" = "energy", limit = 100): Promise<ForecastRecord[]> =>
    apiGet<ForecastRecord[]>(`/api/forecast?type=${type}&metric=${type}&limit=${limit}`, {
      headers: getAuthHeader(),
    }),
};

export const recommendationsApi = {
  getAll: async (limit = 50): Promise<RecommendationRecord[]> =>
    apiGet<RecommendationRecord[]>(`/api/recommendations?limit=${limit}`, {
      headers: getAuthHeader(),
    }),
};

export const chatbotApi = {
  query: async (payload: { dataset_id: string; user_role: "admin" | "operator"; question: string }) => {
    return apiPost<ChatbotQueryResponse>("/api/chatbot/query", payload, {
      headers: getAuthHeader(),
    });
  },
};

export const usersApi = {
  getAll: async (): Promise<UserRecord[]> =>
    apiGet<UserRecord[]>("/auth/users", { headers: getAuthHeader() }),
};

export const datasetsApi = {
  list: async (): Promise<DatasetRecord[]> =>
    apiGet<DatasetRecord[]>("/api/datasets", { headers: getAuthHeader() }),
  getActive: async (): Promise<{ dataset_id: string | null }> =>
    apiGet<{ dataset_id: string | null }>("/api/datasets/active", { headers: getAuthHeader() }),
  setActive: async (datasetId: string): Promise<{ dataset_id: string }> =>
    apiPost<{ dataset_id: string }>(`/api/datasets/active/${datasetId}`, undefined, {
      headers: getAuthHeader(),
    }),
  delete: async (datasetId: string): Promise<{ success: boolean; message: string }> =>
    requestJson<{ success: boolean; message: string }>(`/api/datasets/${datasetId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    }),
};

export const dashboardApi = {
  getOperator: async (datasetId?: string | null): Promise<OperatorDashboardResponse> => {
    const query = datasetId ? `?dataset_id=${datasetId}` : "";
    return apiGet<OperatorDashboardResponse>(`/api/dashboard/operator${query}`, {
      headers: getAuthHeader(),
    });
  },
  getAdmin: async (datasetId?: string | null): Promise<AdminDashboardResponse> => {
    const query = datasetId ? `?dataset_id=${datasetId}` : "";
    return apiGet<AdminDashboardResponse>(`/api/dashboard/admin${query}`, {
      headers: getAuthHeader(),
    });
  },
};
