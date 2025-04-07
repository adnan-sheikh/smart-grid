import { AIFilterResponse, aiFilterResponseSchema } from "../lib/schema";
import { EntityMetadata } from "./schema-utils";

// Environment variables would be used in a real backend
const API_KEY = import.meta.env.VITE_OPEN_AI_API_KEY || "sk-your-api-key";

// Function to call LLM for filtering
export async function callLLM(
  prompt: string,
  metadata: EntityMetadata
): Promise<AIFilterResponse> {
  try {
    // Create system prompt with schema information
    const systemPrompt = `
You are an AI assistant that helps users filter and sort data based on natural language queries.
You have access to a collection of ${
      metadata.entityName
    } with the following properties:

${metadata.properties
  .map(
    (prop) =>
      `- ${prop.name} (${prop.type}): ${prop.description}${
        prop.possibleValues
          ? ` Possible values: ${prop.possibleValues.join(", ")}`
          : ""
      }${prop.example ? ` Example: ${prop.example}` : ""}`
  )
  .join("\n")}

${
  metadata.entityDescription
    ? `\nDescription: ${metadata.entityDescription}`
    : ""
}

Based on the user's query, respond with a JSON object that contains appropriate filter and sort parameters.
The filter must conform to this JSON Schema:
${JSON.stringify(metadata.filterSchema, null, 2)}

The sort must conform to this JSON Schema:
${JSON.stringify(metadata.sortSchema, null, 2)}

Your response should have this format:
{
  "filters": { property-based filters matching the user's intent, following the filter schema },
  "sort": { "field": "propertyName", "order": "asc" or "desc" },
  "explanation": "A user-friendly explanation of the filters being applied"
}

Only include filters and sort if you can confidently determine them from the user's query.
Always return valid JSON with double quotes around property names.
`;

    console.log(
      "System prompt for LLM:",
      systemPrompt.substring(0, 500) + "..."
    );

    // Make API call to OpenAI
    const response = await fetch(import.meta.env.VITE_OPEN_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "Public/OpenAI.chatgpt-4o-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    // Parse the response
    const result = await response.json();

    if (!result.choices || result.choices.length === 0) {
      throw new Error("No response from OpenAI API");
    }

    // Extract and parse the JSON response
    const content = result.choices[0].message.content;
    const aiResponse = JSON.parse(content);

    // Validate response against our schema
    try {
      const validatedResponse = aiFilterResponseSchema.parse(aiResponse);
      return validatedResponse;
    } catch (validationError) {
      console.error("AI response validation error:", validationError);

      // Return a fallback response
      return {
        explanation:
          "Received an invalid response format from AI. Please try a different query.",
      };
    }
  } catch (error) {
    console.error("Error calling LLM:", error);
    return {
      explanation: "Sorry, there was an error processing your request.",
    };
  }
}
