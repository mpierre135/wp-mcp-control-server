import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerMediaTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_media",
    {
      description: "List WordPress media library items",
      inputSchema: {
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/media", args) }))
  );

  server.registerTool(
    "wp_get_media",
    {
      description: "Get a single media item with metadata",
      inputSchema: {
        id: z.number().int(),
      },
    },
    async ({ id }) => safeTool(async () => ({ data: await client.get(`/media/${id}`) }))
  );

  server.registerTool(
    "wp_upload_media_from_url",
    {
      description: "Upload media to WordPress from a remote URL",
      inputSchema: {
        url: z.string().url().describe("Image or file URL to upload"),
        title: z.string().optional(),
        alt: z.string().optional().describe("Alt text for images"),
        caption: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/media/upload-url", args) }))
  );

  server.registerTool(
    "wp_upload_media_from_base64",
    {
      description: "Upload media to WordPress from base64-encoded data",
      inputSchema: {
        data: z.string().describe("Base64-encoded file data"),
        filename: z.string().optional().default("upload.jpg"),
        title: z.string().optional(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/media/upload-base64", args) }))
  );

  server.registerTool(
    "wp_update_media_metadata",
    {
      description: "Update media title, alt text, caption, or description",
      inputSchema: {
        id: z.number().int(),
        title: z.string().optional(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        description: z.string().optional(),
      },
    },
    async ({ id, ...body }) => safeTool(async () => ({ data: await client.put(`/media/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_media",
    {
      description: "Delete a media item (moves to trash by default)",
      inputSchema: {
        id: z.number().int(),
        force: z.boolean().optional(),
        confirm: z.boolean(),
      },
    },
    async ({ id, force, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/media/${id}`, { force, confirm }) }))
  );
}
