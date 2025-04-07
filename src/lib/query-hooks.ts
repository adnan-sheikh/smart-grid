import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  Entity,
  PaginationParams,
  SortParams,
  FilterParams,
  PaginatedResponse,
} from "./schema";

// Define the API methods shape that our hook factory expects
interface EntityApi<T extends Entity, CreateDTO, UpdateDTO> {
  getList: (
    pagination?: PaginationParams,
    filters?: FilterParams,
    sort?: SortParams
  ) => Promise<PaginatedResponse<T>>;
  getById: (id: string) => Promise<T | null>;
  create: (data: CreateDTO) => Promise<T>;
  update: (id: string, data: UpdateDTO) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

// Create hooks for entity CRUD operations
export function createEntityHooks<
  T extends Entity,
  CreateDTO = Omit<T, "id" | "createdAt" | "updatedAt">,
  UpdateDTO = Partial<CreateDTO>
>(entityName: string, api: EntityApi<T, CreateDTO, UpdateDTO>) {
  // Query keys for this entity type
  const keys = {
    all: [entityName] as const,
    lists: () => [...keys.all, "list"] as const,
    list: (params: {
      page?: number;
      limit?: number;
      filters?: FilterParams;
      sort?: SortParams;
      instanceId?: string;
    }) => [...keys.lists(), params] as const,
    details: () => [...keys.all, "detail"] as const,
    detail: (id: string) => [...keys.details(), id] as const,
  };

  // Hook for getting a paginated list
  const useList = (
    page: number = 1,
    limit: number = 10,
    filters?: FilterParams,
    sort?: SortParams,
    instanceId: string = "default",
    options?: UseQueryOptions<PaginatedResponse<T>>
  ) => {
    return useQuery({
      queryKey: keys.list({ page, limit, filters, sort, instanceId }),
      queryFn: () => api.getList({ page, limit }, filters, sort),
      ...options,
    });
  };

  // Hook for getting a single item by ID
  const useById = (id: string, options?: UseQueryOptions<T | null>) => {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: () => api.getById(id),
      enabled: !!id,
      ...options,
    });
  };

  // Hook for creating an item
  const useCreate = (options?: UseMutationOptions<T, Error, CreateDTO>) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateDTO) => api.create(data),
      onSuccess: (data, variables, context) => {
        // Invalidate all list queries
        queryClient.invalidateQueries({ queryKey: keys.lists() });

        // Call the original onSuccess if provided
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      ...options,
    });
  };

  // Hook for updating an item
  const useUpdate = (
    options?: UseMutationOptions<T, Error, { id: string; data: UpdateDTO }>
  ) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateDTO }) =>
        api.update(id, data),
      onSuccess: (data, variables, context) => {
        // Invalidate all list queries and the specific item query
        queryClient.invalidateQueries({ queryKey: keys.lists() });
        queryClient.invalidateQueries({ queryKey: keys.detail(data.id) });

        // Call the original onSuccess if provided
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      ...options,
    });
  };

  // Hook for deleting an item
  const useDelete = (options?: UseMutationOptions<void, Error, string>) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => api.delete(id),
      onSuccess: (data, variables, context) => {
        // Invalidate all list queries and remove the specific item query
        queryClient.invalidateQueries({ queryKey: keys.lists() });
        queryClient.removeQueries({ queryKey: keys.detail(variables) });

        // Call the original onSuccess if provided
        if (options?.onSuccess) {
          options.onSuccess(data, variables, context);
        }
      },
      ...options,
    });
  };

  return {
    useList,
    useById,
    useCreate,
    useUpdate,
    useDelete,
    keys,
  };
}
