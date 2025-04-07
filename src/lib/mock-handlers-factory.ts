import { http, HttpResponse, delay } from "msw";
import { Entity, FilterParams } from "./schema";
import { MockEntityDatabase } from "./mock-db";

// Network delay to simulate real API latency
const DEFAULT_DELAY_MS = 300;

export interface MockHandlerConfig {
  baseUrl: string;
  delayMs?: number;
}

// Create MSW handlers for CRUD operations
export function createMockHandlers<
  T extends Entity,
  CreateDTO = Omit<T, "id" | "createdAt" | "updatedAt">,
  UpdateDTO = Partial<CreateDTO>
>(
  entityName: string,
  db: MockEntityDatabase<T, CreateDTO, UpdateDTO>,
  config: MockHandlerConfig
) {
  const { baseUrl, delayMs = DEFAULT_DELAY_MS } = config;
  const endpoint = `${baseUrl}/${entityName}`;

  return [
    // GET - List with pagination, filtering, and sorting
    http.get(endpoint, async ({ request }) => {
      await delay(delayMs);

      const url = new URL(request.url);

      // Parse pagination parameters
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);

      // Parse sort parameters
      const sortField = url.searchParams.get("sort") || "createdAt";
      const sortOrder = url.searchParams.get("order") || "desc";

      // Build filter object from remaining params
      const filters: FilterParams = {};
      url.searchParams.forEach((value, key) => {
        if (!["page", "limit", "sort", "order"].includes(key)) {
          // Convert 'true'/'false' strings to booleans
          if (value === "true") {
            filters[key] = true;
          } else if (value === "false") {
            filters[key] = false;
          } else {
            filters[key] = value;
          }
        }
      });

      const result = db.getList(
        { page, limit },
        Object.keys(filters).length > 0 ? filters : undefined,
        { field: sortField, order: sortOrder as "asc" | "desc" }
      );

      return HttpResponse.json(result);
    }),

    // GET - Single item by ID
    http.get(`${endpoint}/:id`, async ({ params }) => {
      await delay(delayMs);

      const { id } = params;
      const item = db.getById(id as string);

      if (!item) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(item);
    }),

    // POST - Create new item
    http.post(endpoint, async ({ request }) => {
      await delay(delayMs);

      const data = (await request.json()) as CreateDTO;
      const newItem = db.create(data);

      return HttpResponse.json(newItem, { status: 201 });
    }),

    // PATCH - Update an item
    http.patch(`${endpoint}/:id`, async ({ params, request }) => {
      await delay(delayMs);

      const { id } = params;
      const data = (await request.json()) as UpdateDTO;
      const updatedItem = db.update(id as string, data);

      if (!updatedItem) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(updatedItem);
    }),

    // DELETE - Remove an item
    http.delete(`${endpoint}/:id`, async ({ params }) => {
      await delay(delayMs);

      const { id } = params;
      const success = db.delete(id as string);

      if (!success) {
        return new HttpResponse(null, { status: 404 });
      }

      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
