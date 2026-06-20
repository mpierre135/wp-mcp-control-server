import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

const statusEnum = z.enum(["publish", "draft", "pending", "private", "trash", "any"]).optional();

export function registerPostTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_posts",
    {
      description: "List WordPress posts with optional filters",
      inputSchema: {
        status: statusEnum,
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/posts", args) }))
  );

  server.registerTool(
    "wp_get_post",
    {
      description: "Get full WordPress post data including content, categories, and tags",
      inputSchema: {
        id: z.number().int().describe("Post ID"),
      },
    },
    async ({ id }) => safeTool(async () => ({ data: await client.get(`/posts/${id}`) }))
  );

  server.registerTool(
    "wp_create_post",
    {
      description: "Create a new WordPress post",
      inputSchema: {
        title: z.string(),
        slug: z.string().optional(),
        status: z.enum(["publish", "draft", "pending", "private"]).optional().default("draft"),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        categories: z.array(z.number().int()).optional(),
        tags: z.array(z.number().int()).optional(),
        featured_media: z.number().int().optional(),
        sticky: z.boolean().optional(),
        meta: z.record(z.unknown()).optional(),
        scheduled_date: z
          .string()
          .optional()
          .describe("ISO or parseable date string to schedule publication"),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/posts", args) }))
  );

  server.registerTool(
    "wp_update_post",
    {
      description: "Update an existing WordPress post (creates snapshot before update)",
      inputSchema: {
        id: z.number().int(),
        title: z.string().optional(),
        slug: z.string().optional(),
        status: z.enum(["publish", "draft", "pending", "private", "trash"]).optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        categories: z.array(z.number().int()).optional(),
        tags: z.array(z.number().int()).optional(),
        featured_media: z.number().int().optional(),
        sticky: z.boolean().optional(),
        meta: z.record(z.unknown()).optional(),
        scheduled_date: z
          .string()
          .optional()
          .describe("ISO or parseable date string to schedule publication"),
      },
    },
    async ({ id, ...body }) => safeTool(async () => ({ data: await client.put(`/posts/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_post",
    {
      description: "Delete a WordPress post (moves to trash by default)",
      inputSchema: {
        id: z.number().int(),
        force: z.boolean().optional(),
        confirm: z.boolean().describe("Must be true to confirm deletion"),
      },
    },
    async ({ id, force, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/posts/${id}`, { force, confirm }) }))
  );
}
