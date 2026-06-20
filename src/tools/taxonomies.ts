import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerTaxonomyTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_categories",
    {
      description: "List WordPress categories",
      inputSchema: {
        per_page: z.number().int().optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/categories", args) }))
  );

  server.registerTool(
    "wp_create_category",
    {
      description: "Create a WordPress category",
      inputSchema: {
        name: z.string(),
        slug: z.string().optional(),
        description: z.string().optional(),
        parent: z.number().int().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/categories", args) }))
  );

  server.registerTool(
    "wp_update_category",
    {
      description: "Update a WordPress category",
      inputSchema: {
        id: z.number().int(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        parent: z.number().int().optional(),
      },
    },
    async ({ id, ...body }) => safeTool(async () => ({ data: await client.put(`/categories/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_category",
    {
      description: "Delete a WordPress category",
      inputSchema: {
        id: z.number().int(),
        confirm: z.boolean(),
      },
    },
    async ({ id, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/categories/${id}`, { confirm }) }))
  );

  server.registerTool(
    "wp_list_tags",
    {
      description: "List WordPress tags",
      inputSchema: {
        per_page: z.number().int().optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/tags", args) }))
  );

  server.registerTool(
    "wp_create_tag",
    {
      description: "Create a WordPress tag",
      inputSchema: {
        name: z.string(),
        slug: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/tags", args) }))
  );

  server.registerTool(
    "wp_update_tag",
    {
      description: "Update a WordPress tag",
      inputSchema: {
        id: z.number().int(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async ({ id, ...body }) => safeTool(async () => ({ data: await client.put(`/tags/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_tag",
    {
      description: "Delete a WordPress tag",
      inputSchema: {
        id: z.number().int(),
        confirm: z.boolean(),
      },
    },
    async ({ id, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/tags/${id}`, { confirm }) }))
  );
}
