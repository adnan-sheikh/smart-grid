import React, { useState, useCallback } from "react";
import FileUpload from "./FileUpload";
import ColumnMapping from "./ColumnMapping";
import DataGrid from "./DataGrid";
import ValidationSummary from "./ValidationSummary";
import { useFileUpload } from "../hooks/useFileUpload";

interface BulkUploadContainerProps {
  onComplete?: (data: Record<string, unknown>[]) => void;
  className?: string;
}

const BulkUploadContainer: React.FC<BulkUploadContainerProps> = ({
  onComplete,
  className,
}) => {
  const {
    state,
    handleFileSelect,
    updateColumnMapping,
    validateData,
    saveData,
    resetUpload,
    backToMapping,
    isAnalyzing,
    isValidating,
    isSaving,
  } = useFileUpload();

  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  // Jump to specific row with validation errors
  const handleViewErrors = useCallback((rowIndex: number) => {
    setFocusedRowIndex(rowIndex);
    // Scroll to the data grid and highlight the row
    const dataGridElement = document.getElementById("data-grid-container");
    if (dataGridElement) {
      dataGridElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Handle step navigation
  const renderStep = () => {
    switch (state.status) {
      case "idle":
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bulk Upload
            </h2>
            <p className="text-gray-600 mb-6">
              Upload an Excel file to import data in bulk. The system will
              analyze your file and help you map columns.
            </p>
            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isAnalyzing}
              className="max-w-md mx-auto"
            />
          </div>
        );

      case "uploading":
        return (
          <div className="text-center p-8">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                Analyzing your file...
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                This may take a moment.
              </p>
            </div>
          </div>
        );

      case "mapping":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Column Mapping
            </h2>
            <p className="text-gray-600 mb-6">
              Map the columns from your Excel file to the expected data fields.
              Set validation rules for each column.
            </p>

            <ColumnMapping
              sourceColumns={state.columns}
              columnMapping={state.columnMapping}
              onMappingChange={updateColumnMapping}
              className="mb-6"
            />

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Data Preview
              </h3>
              <DataGrid
                data={state.data.slice(0, 5)}
                columns={state.columns}
                pageSize={5}
              />
              <p className="text-xs text-gray-500 mt-2">
                Showing first 5 rows of {state.data.length} total rows.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={resetUpload}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={validateData}
                disabled={state.columnMapping.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate Data
              </button>
            </div>
          </div>
        );

      case "validating":
        return (
          <div className="text-center p-8">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                Validating Data...
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Checking your data against validation rules.
              </p>
            </div>
          </div>
        );

      case "ready":
      case "error": {
        if (!state.uploadSummary) {
          return null;
        }

        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Review & Save
            </h2>

            <ValidationSummary
              summary={state.uploadSummary}
              onViewErrors={handleViewErrors}
              className="mb-6"
            />

            <div
              id="data-grid-container"
              className="bg-white rounded-lg shadow-sm p-4 mb-6"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Data Preview
              </h3>

              <DataGrid
                data={state.data}
                columns={state.columns}
                errors={state.uploadSummary.errors}
                focusedRowIndex={focusedRowIndex}
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={backToMapping}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Mapping
              </button>
              <div>
                <button
                  type="button"
                  onClick={validateData}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Revalidate
                </button>
                <button
                  type="button"
                  onClick={saveData}
                  disabled={state.uploadSummary.invalidRows > 0 || isSaving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Data"}
                </button>
              </div>
            </div>
          </div>
        );
      }

      case "saving":
        return (
          <div className="text-center p-8">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                Saving Data...
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Creating records in the system.
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Upload Complete!
              </h3>
              <p className="text-gray-600 mt-2 mb-6">
                Successfully imported {state.validationResult?.data.length}{" "}
                records.
              </p>
              <button
                type="button"
                onClick={resetUpload}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Another File
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {renderStep()}
      {state.error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadContainer;
