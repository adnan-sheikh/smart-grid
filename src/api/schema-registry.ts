import { z } from "zod";
import {
  todoSchema,
  todoFiltersSchema,
  postSchema,
  postFiltersSchema,
} from "../schema";

// Define the schema info interface
export interface SchemaInfo {
  entitySchema: z.ZodObject<any>;
  filterSchema: z.ZodObject<any>;
  displayName: string;
  entityDescription?: string;
}

// Central registry of schemas
export class SchemaRegistry {
  private static schemas: Record<string, SchemaInfo> = {};

  // Register a new entity schema
  static register<T extends z.ZodObject<any>, F extends z.ZodObject<any>>(
    entityType: string,
    entitySchema: T,
    filterSchema: F,
    options: {
      displayName?: string;
      entityDescription?: string;
    } = {}
  ): void {
    this.schemas[entityType] = {
      entitySchema,
      filterSchema,
      displayName: options.displayName || entityType,
      entityDescription: options.entityDescription,
    };
  }

  // Get schema info by entity type
  static getSchemaInfo(entityType: string): SchemaInfo {
    const schema = this.schemas[entityType];
    if (!schema) {
      throw new Error(`No schema registered for entity type: ${entityType}`);
    }
    return schema;
  }

  // List all registered entity types
  static getEntityTypes(): string[] {
    return Object.keys(this.schemas);
  }
}

// Register our schemas
SchemaRegistry.register("todos", todoSchema, todoFiltersSchema, {
  displayName: "Todos",
  entityDescription: "A todo item representing a task to be completed",
});

SchemaRegistry.register("posts", postSchema, postFiltersSchema, {
  displayName: "Posts",
  entityDescription:
    "A blog post or article with content and author information",
});
