import { z } from "zod";

// Base entity schema
export const entitySchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Sort parameters schema
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]),
});

// Filter parameters schema
export const filterSchema = z.record(z.any());

// Pagination parameters schema
export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

// Paginated response schema
export const createPaginatedResponseSchema = <T extends z.ZodType>(
  itemSchema: T
) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

// AI filter response schema
export const aiFilterResponseSchema = z.object({
  filters: z.record(z.any()).optional(),
  sort: sortSchema.optional(),
  explanation: z.string(),
});

// Export derived types
export type Entity = z.infer<typeof entitySchema>;
export type SortParams = z.infer<typeof sortSchema>;
export type FilterParams = z.infer<typeof filterSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type AIFilterResponse = z.infer<typeof aiFilterResponseSchema>;
export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof createPaginatedResponseSchema<z.ZodType<T>>>
>;
