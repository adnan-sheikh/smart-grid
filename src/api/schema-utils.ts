import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define entity property interface for AI interactions
export interface EntityProperty {
  name: string;
  type: string;
  description: string;
  required: boolean;
  example?: string;
  possibleValues?: string[];
}

// Interface for entity metadata needed for AI
export interface EntityMetadata {
  entityName: string;
  entityDescription?: string;
  properties: EntityProperty[];
  filterSchema: object; // JSON Schema representation
  sortSchema: object; // JSON Schema representation
}

// Extract metadata from Zod schema
export function generateMetadataFromSchema(
  entitySchema: z.ZodObject<any>,
  filterSchema: z.ZodObject<any>,
  options: {
    entityName: string;
    entityDescription?: string;
    sortSchema?: z.ZodObject<any>;
    propertyDescriptions?: Record<string, string>;
    propertyExamples?: Record<string, string>;
  }
): EntityMetadata {
  // Extract properties from schema
  const properties = generatePropertiesFromSchema(
    entitySchema,
    options.entityName,
    options.propertyDescriptions,
    options.propertyExamples
  );

  // Default sort schema if not provided
  const sortSchema =
    options.sortSchema ||
    z.object({
      field: z.string(),
      order: z.enum(["asc", "desc"]),
    });

  return {
    entityName: options.entityName,
    entityDescription: options.entityDescription,
    properties,
    filterSchema: zodToJsonSchema(filterSchema),
    sortSchema: zodToJsonSchema(sortSchema),
  };
}

// Extract properties from Zod schema
export function generatePropertiesFromSchema(
  schema: z.ZodObject<any>,
  entityName: string,
  customDescriptions: Record<string, string> = {},
  customExamples: Record<string, string> = {}
): EntityProperty[] {
  const properties: EntityProperty[] = [];

  // Extract shape from the schema
  const shape = schema._def.shape();

  // Generate a singular entity name for descriptions
  const singularName = entityName.endsWith("s")
    ? entityName.slice(0, -1)
    : entityName;

  // Process each property in the schema
  for (const [key, zodType] of Object.entries(shape)) {
    // Skip id fields for filters
    if (key === "id") continue;

    const isOptional = zodType instanceof z.ZodOptional;
    const baseType = isOptional ? zodType._def.innerType : zodType;

    let type = "unknown";
    let possibleValues: string[] | undefined = undefined;

    // Use custom description if available, otherwise generate one
    let description =
      customDescriptions[key] ||
      `The ${key} of the ${singularName.toLowerCase()}`;

    // Extract type information
    if (baseType instanceof z.ZodString) {
      type = "string";
    } else if (baseType instanceof z.ZodNumber) {
      type = "number";
    } else if (baseType instanceof z.ZodBoolean) {
      type = "boolean";
      possibleValues = ["true", "false"];
    } else if (baseType instanceof z.ZodDate) {
      type = "date";
      if (key === "createdAt") {
        description = "When the item was created";
      } else if (key === "updatedAt") {
        description = "When the item was last updated";
      }
    } else if (baseType instanceof z.ZodEnum) {
      type = "enum";
      possibleValues = baseType._def.values;
    }

    properties.push({
      name: key,
      type,
      description,
      required: !isOptional,
      example: customExamples[key],
      possibleValues,
    });
  }

  return properties;
}
