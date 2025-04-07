import { setupWorker } from "msw/browser";
import { todoHandlers } from "../../features/todos/mocks";
import { postHandlers } from "../../features/posts/mocks";
import { aiFilterHandler } from "./ai-filter-handler";
import { bulkUploadHandlers } from "./bulkUploadHandlers";

// Combine all handlers
const handlers = [
  ...todoHandlers,
  ...postHandlers,
  ...bulkUploadHandlers,
  aiFilterHandler,
];

// Create the MSW worker
export const worker = setupWorker(...handlers);

// Initialize MSW for development
export async function setupMocks() {
  if (import.meta.env.MODE === "development") {
    await worker.start({
      onUnhandledRequest: "warn",
    });

    console.log("🔶 Mock Service Worker initialized");
  }
}
