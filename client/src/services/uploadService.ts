const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const buildUrl = (path: string) => `${API_BASE}${path}`;

const getAuthHeader = () => {
  const token = localStorage.getItem("refineryiq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadDataset = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildUrl("/api/upload-dataset"), {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || response.statusText;
    throw new Error(errorMessage);
  }
};
