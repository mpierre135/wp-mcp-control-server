import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerCommentTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_comments",
    {
      description: "List WordPress comments with optional status and post filters",
      inputSchema: {
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        status: z.string().optional().describe("Comment status filter"),
        post_id: z.number().int().optional().describe("Filter by post ID"),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/comments", args) }))
  );

  server.registerTool(
    "wp_moderate_comment",
    {
      description:
        "Moderate a comment: approve, hold, spam, or trash. confirm required for spam/trash in safe mode.",
      inputSchema: {
        id: z.number().int().describe("Comment ID"),
        status: z.enum(["approve", "hold", "spam", "trash"]).describe("Moderation action"),
        confirm: z.boolean().optional().describe("Required for spam/trash when safe mode is enabled"),
      },
    },
    async ({ id, status, confirm }) =>
      safeTool(async () => ({
        data: await client.put(`/comments/${id}`, { status, confirm }),
      }))
  );

  server.registerTool(
    "wp_reply_to_comment",
    {
      description: "Reply to a comment as the site admin",
      inputSchema: {
        id: z.number().int().describe("Parent comment ID"),
        content: z.string().describe("Reply content (HTML allowed)"),
      },
    },
    async ({ id, content }) =>
      safeTool(async () => ({
        data: await client.post(`/comments/${id}/reply`, { content }),
      }))
  );
}
