import { delay, http, HttpResponse } from "msw";
import { z } from "zod";
import { generateDynamicSchema } from "../../features/bulk-upload/schemas/validationSchema";
import {
  ValidationError,
  ValidationResult,
  ColumnMap,
} from "../../features/bulk-upload/types";

// Mock AI analysis of Excel file
export const analyzeFileHandler = http.post(
  "/api/bulk-upload/analyze",
  async ({ request: req }) => {
    // In a real implementation, this would use AI to analyze the file
    // For mock purposes, we just return the file as-is

    // Check if the request has FormData with a file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return HttpResponse.json(
        {
          status: "error",
          message: "No file provided",
        },
        { status: 400 }
      );
    }

    // In a real implementation, we would extract the columns and data from the file
    // For mock purposes, just simulate a successful response
    await delay(1500);
    return HttpResponse.json(
      {
        id: "mock-upload-" + Date.now(),
        status: "success",
        message: "File analyzed successfully",
        columns: [],
        data: [],
      },
      { status: 200 }
    );
  }
);

// Mock validation of data against schema
export const validateDataHandler = http.post(
  "/api/bulk-upload/validate",
  async ({ request: req }) => {
    const { data, columnMapping } = (await req.json()) as {
      data: Record<string, unknown>[];
      columnMapping: ColumnMap[];
    };

    if (!data || !columnMapping) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Missing data or column mapping",
        },
        { status: 400 }
      );
    }

    try {
      // Generate schema based on column mapping
      const schema = generateDynamicSchema(columnMapping);
      const errors: ValidationError[] = [];
      const validatedData: Record<string, unknown>[] = [];

      // Validate each row
      data.forEach((row, rowIndex) => {
        try {
          // Transform data based on column mapping
          const transformedRow: Record<string, unknown> = {};

          columnMapping.forEach((mapping) => {
            if (mapping.sourceColumn && mapping.targetColumn) {
              transformedRow[mapping.targetColumn] = row[mapping.sourceColumn];
            }
          });

          // Attempt validation
          const validatedRow = schema.parse(transformedRow);
          validatedData.push(validatedRow);
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              errors.push({
                row: rowIndex + 1, // +1 for human-readable row numbers (1-based)
                column: err.path.join("."),
                message: err.message,
              });
            });
          }
        }
      });

      // Create validation result
      const validationResult: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        data: validatedData.length > 0 ? validatedData : data, // Fallback to original data if all validation fails
      };

      await delay(1000);
      return HttpResponse.json(validationResult, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          status: "error",
          message:
            "Error validating data: " +
            (error instanceof Error ? error.message : "Unknown error"),
        },
        { status: 500 }
      );
    }
  }
);

// Mock saving of validated data
export const saveDataHandler = http.post(
  "/api/bulk-upload/save",
  async ({ request: req }) => {
    const { data, columnMapping } = (await req.json()) as {
      data: Record<string, unknown>[];
      columnMapping: ColumnMap[];
    };

    if (!data || !columnMapping) {
      return HttpResponse.json(
        {
          status: "error",
          message: "Missing data or column mapping",
        },
        { status: 400 }
      );
    }

    // In a real implementation, we would save the data to the database
    // For mock purposes, just simulate a successful response
    const savedIds = data.map(
      () => "record-" + Math.random().toString(36).substring(2, 15)
    );

    await delay(1000);
    return HttpResponse.json(
      {
        success: true,
        message: `Successfully saved ${data.length} records`,
        ids: savedIds,
      },
      { status: 200 }
    );
  }
);

export const bulkUploadHandlers = [
  analyzeFileHandler,
  validateDataHandler,
  saveDataHandler,
];
