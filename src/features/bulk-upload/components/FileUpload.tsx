import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isLoading,
  accept = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.ms-excel": [".xls"],
  },
  maxSize = 5242880, // 5MB
  className,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      maxFiles: 1,
      disabled: isLoading,
    });

  // Handle file rejection errors
  React.useEffect(() => {
    if (fileRejections.length > 0) {
      const { errors } = fileRejections[0];
      if (errors[0]?.code === "file-too-large") {
        setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
      } else if (errors[0]?.code === "file-invalid-type") {
        setError(
          "Invalid file type. Please upload an Excel file (.xlsx, .xls)"
        );
      } else {
        setError(errors[0]?.message || "Error uploading file");
      }
    }
  }, [fileRejections, maxSize]);

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} data-testid="file-upload-input" />

        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {isLoading ? (
            <p className="text-gray-500">Processing file...</p>
          ) : isDragActive ? (
            <p className="text-blue-500 font-medium">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium">
                Drag & drop an Excel file here, or click to select
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Supported formats: .xlsx, .xls (max {maxSize / 1024 / 1024}MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          className="mt-2 text-red-500 text-sm"
          data-testid="file-upload-error"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
