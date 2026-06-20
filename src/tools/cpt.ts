import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

const statusEnum = z.enum(["publish", "draft", "pending", "private", "trash", "any"]).optional();

const postFieldsSchema = {
  title: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["publish", "draft", "pending", "private", "future"]).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  parent: z.number().int().optional(),
  featured_media: z.number().int().optional(),
  meta: z.record(z.unknown()).optional(),
  scheduled_date: z
    .string()
    .optional()
    .describe("ISO or parseable date string to schedule publication"),
};

export function registerCptTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_post_types",
    {
      description: "List allowed custom post types available via MCP",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/post-types") }))
  );

  server.registerTool(
    "wp_list_cpt_items",
    {
      description: "List items of a custom post type with optional filters",
      inputSchema: {
        post_type: z.string().describe("Post type slug"),
        status: statusEnum,
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
      },
    },
    async ({ post_type, ...args }) =>
      safeTool(async () => ({ data: await client.get(`/post-types/${post_type}`, args) }))
  );

  server.registerTool(
    "wp_get_cpt_item",
    {
      description: "Get a single custom post type item by ID",
      inputSchema: {
        post_type: z.string(),
        id: z.number().int(),
      },
    },
    async ({ post_type, id }) =>
      safeTool(async () => ({ data: await client.get(`/post-types/${post_type}/${id}`) }))
  );

  server.registerTool(
    "wp_create_cpt_item",
    {
      description: "Create a new item in a custom post type",
      inputSchema: {
        post_type: z.string(),
        title: z.string(),
        slug: z.string().optional(),
        status: z.enum(["publish", "draft", "pending", "private", "future"]).optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        parent: z.number().int().optional(),
        featured_media: z.number().int().optional(),
        meta: z.record(z.unknown()).optional(),
        scheduled_date: z
          .string()
          .optional()
          .describe("ISO or parseable date string to schedule publication"),
      },
    },
    async ({ post_type, ...body }) =>
      safeTool(async () => ({ data: await client.post(`/post-types/${post_type}`, body) }))
  );

  server.registerTool(
    "wp_update_cpt_item",
    {
      description: "Update an existing custom post type item (creates snapshot before update)",
      inputSchema: {
        post_type: z.string(),
        id: z.number().int(),
        ...postFieldsSchema,
      },
    },
    async ({ post_type, id, ...body }) =>
      safeTool(async () => ({ data: await client.put(`/post-types/${post_type}/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_cpt_item",
    {
      description: "Delete a custom post type item (moves to trash by default)",
      inputSchema: {
        post_type: z.string(),
        id: z.number().int(),
        force: z.boolean().optional().describe("Permanently delete instead of trash"),
        confirm: z.boolean().describe("Must be true to confirm deletion"),
      },
    },
    async ({ post_type, id, force, confirm }) =>
      safeTool(async () => ({
        data: await client.delete(`/post-types/${post_type}/${id}`, { force, confirm }),
      }))
  );

  server.registerTool(
    "wp_list_taxonomies",
    {
      description: "List all public WordPress taxonomies with object types",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/taxonomies") }))
  );

  server.registerTool(
    "wp_list_taxonomy_terms",
    {
      description: "List terms for a taxonomy",
      inputSchema: {
        taxonomy: z.string(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
      },
    },
    async ({ taxonomy, ...args }) =>
      safeTool(async () => ({ data: await client.get(`/taxonomies/${taxonomy}/terms`, args) }))
  );

  server.registerTool(
    "wp_create_taxonomy_term",
    {
      description: "Create a term in a taxonomy",
      inputSchema: {
        taxonomy: z.string(),
        name: z.string(),
        slug: z.string().optional(),
        description: z.string().optional(),
        parent: z.number().int().optional().describe("Parent term ID (categories only)"),
      },
    },
    async ({ taxonomy, ...body }) =>
      safeTool(async () => ({ data: await client.post(`/taxonomies/${taxonomy}/terms`, body) }))
  );
}
