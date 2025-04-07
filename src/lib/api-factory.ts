import axios from "axios";
import {
  Entity,
  PaginationParams,
  SortParams,
  FilterParams,
  PaginatedResponse,
} from "./schema";

// Type for the API config options
interface ApiConfig {
  baseUrl: string;
  entityName: string;
}

// Type for date fields that need conversion
type DateField = "createdAt" | "updatedAt" | string;

// Function to create API methods for an entity type
export function createApi<
  T extends Entity,
  CreateDTO = Omit<T, "id" | "createdAt" | "updatedAt">,
  UpdateDTO = Partial<CreateDTO>
>(config: ApiConfig, dateFields: DateField[] = ["createdAt", "updatedAt"]) {
  const { baseUrl, entityName } = config;
  const endpoint = `${baseUrl}/${entityName}`;

  // Helper to convert date strings to Date objects
  const parseDates = (item: any): T => {
    const result = { ...item };
    dateFields.forEach((field) => {
      if (result[field]) {
        result[field] = new Date(result[field]);
      }
    });
    return result as T;
  };

  return {
    // Get paginated list with filtering and sorting
    getList: async (
      pagination?: PaginationParams,
      filters?: FilterParams,
      sort?: SortParams
    ): Promise<PaginatedResponse<T>> => {
      const params = new URLSearchParams();

      // Add pagination parameters
      if (pagination) {
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());
      }

      // Add filter parameters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      // Add sort parameters
      if (sort) {
        params.append("sort", sort.field);
        params.append("order", sort.order);
      }

      // Make the request
      const response = await axios.get<PaginatedResponse<T>>(
        `${endpoint}?${params.toString()}`
      );

      // Process dates
      const data = response.data.data.map(parseDates);

      return {
        data,
        meta: response.data.meta,
      };
    },

    // Get a single entity by ID
    getById: async (id: string): Promise<T | null> => {
      try {
        const response = await axios.get<T>(`${endpoint}/${id}`);
        return parseDates(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },

    // Create a new entity
    create: async (data: CreateDTO): Promise<T> => {
      const response = await axios.post<T>(endpoint, data);
      return parseDates(response.data);
    },

    // Update an entity
    update: async (id: string, data: UpdateDTO): Promise<T> => {
      const response = await axios.patch<T>(`${endpoint}/${id}`, data);
      return parseDates(response.data);
    },

    // Delete an entity
    delete: async (id: string): Promise<void> => {
      await axios.delete(`${endpoint}/${id}`);
    },
  };
}
