import { z } from "zod";

// Generic schema factory
export const createValidationSchema = (
  columnMap: Record<string, z.ZodTypeAny>
) => {
  return z.object(columnMap);
};

// Common validation types
export const validationTypes = {
  string: z.string(),
  email: z.string().email(),
  url: z.string().url(),
  number: z.number(),
  integer: z.number().int(),
  boolean: z.boolean(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
};

// Create dynamic schema based on column mapping
export const generateDynamicSchema = (
  columns: {
    sourceColumn: string;
    targetColumn: string;
    required: boolean;
    validationType: string;
  }[]
) => {
  const schemaMap: Record<string, z.ZodTypeAny> = {};

  columns.forEach((column) => {
    const validationType =
      validationTypes[column.validationType as keyof typeof validationTypes] ||
      validationTypes.string;

    // Handle required vs optional fields
    schemaMap[column.targetColumn] = column.required
      ? validationType
      : validationType.optional();
  });

  return createValidationSchema(schemaMap);
};
