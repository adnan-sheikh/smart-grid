import { ColumnMap, UploadResponse, ValidationResult } from "../types";

// Analyze file contents using AI (this would be a real API call)
export const analyzeFileContents = async (
  file: File
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/bulk-upload/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to analyze file");
  }

  return response.json();
};

// Validate data against schema
export const validateData = async (
  data: Record<string, unknown>[],
  columnMapping: ColumnMap[]
): Promise<ValidationResult> => {
  const response = await fetch("/api/bulk-upload/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, columnMapping }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to validate data");
  }

  return response.json();
};

// Save validated data
export const saveData = async (
  data: Record<string, unknown>[],
  columnMapping: ColumnMap[]
): Promise<{ success: boolean; message: string; ids?: string[] }> => {
  const response = await fetch("/api/bulk-upload/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, columnMapping }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save data");
  }

  return response.json();
};
