import { useMemo } from "react";
import { z } from "zod";
import { generateDynamicSchema } from "../schemas/validationSchema";
import { ColumnMap, ValidationError, ValidationResult } from "../types";

/**
 * Custom hook to validate data based on column mapping
 */
export const useDataValidation = () => {
  // Client-side validation (this complements the server-side validation)
  const validateData = (
    data: Record<string, unknown>[],
    columnMapping: ColumnMap[]
  ): ValidationResult => {
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

        // Validate with zod
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

    return {
      isValid: errors.length === 0,
      errors,
      data: validatedData,
    };
  };

  return {
    validateData,
  };
};

/**
 * Group validation errors by row
 */
export const useGroupedValidationErrors = (errors: ValidationError[] = []) => {
  const groupedErrors = useMemo(() => {
    const grouped: Record<number, ValidationError[]> = {};

    errors.forEach((error) => {
      if (!grouped[error.row]) {
        grouped[error.row] = [];
      }
      grouped[error.row].push(error);
    });

    return grouped;
  }, [errors]);

  return groupedErrors;
};
