import { http, HttpResponse, delay } from "msw";
import { SchemaRegistry } from "../schema-registry";
import { generateMetadataFromSchema } from "../schema-utils";
import { callLLM } from "../llm-service";
import { z } from "zod";
import { sortSchema } from "../../lib/schema";

// Default sort schema
const defaultSortSchema = sortSchema;

// Input schema for the AI filter request
const aiFilterRequestSchema = z.object({
  entityType: z.string(),
  prompt: z.string(),
});

// Create the API handler for AI filtering
export const aiFilterHandler = http.post(
  "https://api.example.com/ai-filter",
  async ({ request }) => {
    await delay(300);

    try {
      // Parse the request body
      const body = await request.json();

      // Validate request
      try {
        aiFilterRequestSchema.parse(body);
      } catch (error) {
        return new HttpResponse(
          JSON.stringify({
            error: "Invalid request format",
            details: error.message,
          }),
          { status: 400 }
        );
      }

      const { entityType, prompt } = body;

      try {
        // Get schema info
        const schemaInfo = SchemaRegistry.getSchemaInfo(entityType);

        // Generate metadata for the LLM
        const metadata = generateMetadataFromSchema(
          schemaInfo.entitySchema,
          schemaInfo.filterSchema,
          {
            entityName: schemaInfo.displayName,
            entityDescription: schemaInfo.entityDescription,
            sortSchema: defaultSortSchema,
          }
        );

        // Call LLM to interpret the prompt
        const filterParams = await callLLM(prompt, metadata);

        // Return the filter parameters and explanation
        return HttpResponse.json({
          result: filterParams,
          success: true,
        });
      } catch (error) {
        console.error("Error processing AI filter request:", error);
        return new HttpResponse(
          JSON.stringify({
            error: "Failed to process AI filter request",
            message: error.message,
          }),
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error parsing request:", error);
      return new HttpResponse(
        JSON.stringify({
          error: "Invalid request",
          message: "Could not parse request body",
        }),
        { status: 400 }
      );
    }
  }
);
