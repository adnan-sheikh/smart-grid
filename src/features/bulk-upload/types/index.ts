export interface UploadResponse {
  id: string;
  columns: string[];
  data: Record<string, unknown>[];
  status: "success" | "error";
  message?: string;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data: Record<string, unknown>[];
}

export interface ColumnMap {
  sourceColumn: string;
  targetColumn: string;
  required: boolean;
  validationType: string;
}

export interface UploadSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
}

export interface BulkUploadState {
  file: File | null;
  columns: string[];
  data: Record<string, unknown>[];
  columnMapping: ColumnMap[];
  validationResult: ValidationResult | null;
  uploadSummary: UploadSummary | null;
  status:
    | "idle"
    | "uploading"
    | "mapping"
    | "validating"
    | "ready"
    | "saving"
    | "complete"
    | "error";
  error?: string;
}
