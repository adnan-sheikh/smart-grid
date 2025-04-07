import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  PaginationParams,
  SortParams,
  FilterParams,
  PaginatedResponse,
} from "./schema";

export class MockEntityDatabase<
  T extends Entity,
  CreateDTO = Omit<T, "id" | "createdAt" | "updatedAt">,
  UpdateDTO = Partial<CreateDTO>
> {
  private items: T[] = [];

  constructor(initialItems: T[] = []) {
    this.items = [...initialItems];
  }

  // Generic sort function
  protected sortItems(items: T[], sort: SortParams): T[] {
    return [...items].sort((a, b) => {
      const field = sort.field as keyof T;
      const valueA = a[field];
      const valueB = b[field];

      // Handle different data types
      if (valueA instanceof Date && valueB instanceof Date) {
        return sort.order === "asc"
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sort.order === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === "boolean" && typeof valueB === "boolean") {
        return sort.order === "asc"
          ? valueA === valueB
            ? 0
            : valueA
            ? 1
            : -1
          : valueA === valueB
          ? 0
          : valueA
          ? -1
          : 1;
      }

      // Default comparison for numbers and other types
      if (valueA > valueB) return sort.order === "asc" ? 1 : -1;
      if (valueA < valueB) return sort.order === "asc" ? -1 : 1;
      return 0;
    });
  }

  // Filter items based on filter parameters
  protected filterItems(items: T[], filters?: FilterParams): T[] {
    if (!filters || Object.keys(filters).length === 0) {
      return items;
    }

    return items.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // Skip undefined filters
        if (value === undefined) return true;

        // Handle string-based search across all string properties
        if (key === "search" && typeof value === "string") {
          const searchTerm = value.toLowerCase();

          // Search in string properties
          return Object.entries(item).some(([, propValue]) => {
            if (typeof propValue === "string") {
              return propValue.toLowerCase().includes(searchTerm);
            }
            return false;
          });
        }

        // Default equality check
        const itemValue = item[key as keyof T];
        return itemValue === value;
      });
    });
  }

  // Get paginated list with filtering and sorting
  getList(
    pagination: PaginationParams = { page: 1, limit: 10 },
    filters?: FilterParams,
    sort: SortParams = { field: "createdAt", order: "desc" }
  ): PaginatedResponse<T> {
    // Apply filters
    const filteredItems = this.filterItems(this.items, filters);

    // Apply sorting
    const sortedItems = this.sortItems(filteredItems, sort);

    // Apply pagination
    const { page, limit } = pagination;
    const total = sortedItems.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // Get a single item by ID
  getById(id: string): T | null {
    return this.items.find((item) => item.id === id) || null;
  }

  // Create a new item
  create(data: CreateDTO): T {
    const now = new Date();
    // First create the base item with required Entity properties plus the DTO data
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    // Use type assertion to tell TypeScript this object matches type T
    const typedItem = newItem as unknown as T;
    this.items.push(typedItem);
    return typedItem;
  }

  // Update an existing item
  update(id: string, data: UpdateDTO): T | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    // Create updated item by merging existing item, update data, and new updatedAt
    const updatedItem = {
      ...this.items[index],
      ...data,
      updatedAt: new Date(),
    };

    // Use type assertion for the updated item
    const typedItem = updatedItem as unknown as T;
    this.items[index] = typedItem;
    return typedItem;
  }

  // Delete an item
  delete(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  // Reset or replace all items
  resetItems(items: T[] = []) {
    this.items = [...items];
  }

  // Get all items (for testing)
  getAllItems(): T[] {
    return [...this.items];
  }
}
