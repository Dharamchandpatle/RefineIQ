import { apiUpload, getAuthHeader } from "./api";

export const uploadDataset = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await apiUpload("/api/upload-dataset", formData, {
    headers: {
      ...getAuthHeader(),
    },
  });
};
