import { Button } from "@/components/ui/button";
import { useState } from "react";
import { uploadDataset } from "../../services/uploadService";

type DatasetUploadProps = {
  onSuccess?: () => void | Promise<void>;
};

type StatusState = "idle" | "uploading" | "processing" | "success" | "error";

const DatasetUpload = ({ onSuccess }: DatasetUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusState>("idle");
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setMessage("");
    setStatus("idle");

    if (!selected) {
      setFile(null);
      return;
    }

    const isCsv = selected.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setFile(null);
      setStatus("error");
      setMessage("Invalid file format. Please upload a .csv file.");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a CSV file before uploading.");
      return;
    }

    try {
      setStatus("uploading");
      setMessage("Uploading dataset...");
      await uploadDataset(file);
      setStatus("processing");
      setMessage("Processing AI analysis...");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus("success");
      setMessage("Dataset processed successfully");
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      const err = error as Error;
      setStatus("error");
      setMessage(err.message || "Upload failed. Please try again.");
    }
  };

  const isBusy = status === "uploading" || status === "processing";

  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-brand-blue">Upload Refinery Dataset</h3>
        <p className="text-sm text-slate-500">
          Upload a CSV dataset for AI analysis and KPI refresh.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full md:flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
        />
        <Button
          variant="primary"
          className="w-full md:w-auto bg-brand-orange text-white"
          onClick={handleUpload}
          disabled={isBusy}
        >
          {isBusy ? "Uploading..." : "Upload Dataset"}
        </Button>
      </div>

      {message ? (
        <p
          className={`text-sm ${
            status === "error" ? "text-brand-orange" : "text-slate-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default DatasetUpload;
