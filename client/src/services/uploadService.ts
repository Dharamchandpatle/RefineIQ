import { buildUrl, getAuthHeader } from "./api";

export const uploadDataset = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", buildUrl("/api/upload-dataset"));

    const authHeader = getAuthHeader();
    if (authHeader.Authorization) {
      xhr.setRequestHeader("Authorization", authHeader.Authorization);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress?.(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        try {
          const payload = JSON.parse(xhr.responseText || "{}");
          reject(new Error(payload?.detail || "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.send(formData);
  });
};
