import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { parseExcelFile } from "../utils/excelParser";
import {
  analyzeFileContents,
  validateData as validateDataService,
  saveData as saveDataService,
} from "../services/uploadService";
import { BulkUploadState, ColumnMap, ValidationResult } from "../types";

export const useFileUpload = () => {
  const [state, setState] = useState<BulkUploadState>({
    file: null,
    columns: [],
    data: [],
    columnMapping: [],
    validationResult: null,
    uploadSummary: null,
    status: "idle",
  });

  // File upload and parsing
  const handleFileSelect = async (file: File) => {
    setState((prev) => ({
      ...prev,
      file,
      status: "uploading",
      error: undefined,
    }));

    try {
      // First, parse the Excel file client-side
      const parsedData = await parseExcelFile(file);

      setState((prev) => ({
        ...prev,
        columns: parsedData.columns,
        data: parsedData.data,
        status: "mapping",
      }));

      // Trigger the server analysis
      analyzeFileMutation.mutate(file);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to parse file",
      }));
    }
  };

  // API call to analyze the file (AI-powered on backend)
  const analyzeFileMutation = useMutation({
    mutationFn: analyzeFileContents,
    onSuccess: (data) => {
      // Auto-generate column mapping based on AI analysis
      const columnMapping: ColumnMap[] = data.columns.map((column) => ({
        sourceColumn: column,
        targetColumn: column,
        required: false,
        validationType: "string",
      }));

      setState((prev) => ({
        ...prev,
        columnMapping,
        status: "mapping",
      }));
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to analyze file",
      }));
    },
  });

  // Update column mapping
  const updateColumnMapping = (newMapping: ColumnMap[]) => {
    setState((prev) => ({
      ...prev,
      columnMapping: newMapping,
    }));
  };

  // Validate data based on column mapping
  const validateMutation = useMutation({
    mutationFn: ({
      data,
      columnMapping,
    }: {
      data: Record<string, unknown>[];
      columnMapping: ColumnMap[];
    }) => validateDataService(data, columnMapping),
    onSuccess: (validationResult: ValidationResult) => {
      const uploadSummary = {
        totalRows: state.data.length,
        validRows: state.data.length - validationResult.errors.length,
        invalidRows: validationResult.errors.length,
        errors: validationResult.errors,
      };

      setState((prev) => ({
        ...prev,
        validationResult,
        uploadSummary,
        status: validationResult.isValid ? "ready" : "validating",
      }));
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to validate data",
      }));
    },
  });

  // Trigger validation
  const validateData = () => {
    setState((prev) => ({
      ...prev,
      status: "validating",
    }));

    validateMutation.mutate({
      data: state.data,
      columnMapping: state.columnMapping,
    });
  };

  // Save validated data
  const saveMutation = useMutation({
    mutationFn: ({
      data,
      columnMapping,
    }: {
      data: Record<string, unknown>[];
      columnMapping: ColumnMap[];
    }) => saveDataService(data, columnMapping),
    onSuccess: () => {
      setState((prev) => ({
        ...prev,
        status: "complete",
      }));
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to save data",
      }));
    },
  });

  // Save the data
  const saveData = () => {
    if (!state.validationResult?.isValid) {
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "saving",
    }));

    saveMutation.mutate({
      data: state.validationResult.data,
      columnMapping: state.columnMapping,
    });
  };

  // Go back to mapping step
  const backToMapping = () => {
    setState((prev) => ({
      ...prev,
      status: "mapping",
    }));
  };

  // Reset the upload process
  const resetUpload = () => {
    setState({
      file: null,
      columns: [],
      data: [],
      columnMapping: [],
      validationResult: null,
      uploadSummary: null,
      status: "idle",
    });
  };

  return {
    state,
    handleFileSelect,
    updateColumnMapping,
    validateData,
    saveData,
    resetUpload,
    backToMapping,
    isAnalyzing: analyzeFileMutation.isPending,
    isValidating: validateMutation.isPending,
    isSaving: saveMutation.isPending,
  };
};
