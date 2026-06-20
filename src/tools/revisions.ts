import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerRevisionTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_revisions",
    {
      description: "List WordPress revisions for a post or page",
      inputSchema: {
        post_id: z.number().int().describe("Post or page ID"),
      },
    },
    async ({ post_id }) =>
      safeTool(async () => ({ data: await client.get(`/revisions/posts/${post_id}`) }))
  );

  server.registerTool(
    "wp_get_revision",
    {
      description: "Get revision content by revision ID",
      inputSchema: {
        revision_id: z.number().int(),
      },
    },
    async ({ revision_id }) =>
      safeTool(async () => ({ data: await client.get(`/revisions/${revision_id}`) }))
  );

  server.registerTool(
    "wp_get_revision_diff",
    {
      description: "Diff a revision against the current post content (title, content, excerpt)",
      inputSchema: {
        revision_id: z.number().int(),
      },
    },
    async ({ revision_id }) =>
      safeTool(async () => ({ data: await client.get(`/revisions/${revision_id}/diff`) }))
  );

  server.registerTool(
    "wp_restore_revision",
    {
      description:
        "Restore a post/page to a previous revision. confirm:true required when safe mode is enabled.",
      inputSchema: {
        revision_id: z.number().int(),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ revision_id, confirm }) =>
      safeTool(async () => ({
        data: await client.post(`/revisions/${revision_id}`, { confirm }),
      }))
  );

  server.registerTool(
    "wp_get_snapshot_diff",
    {
      description: "Diff an MCP snapshot against the current post content",
      inputSchema: {
        snapshot_id: z.number().int().describe("MCP snapshot ID from activity log"),
      },
    },
    async ({ snapshot_id }) =>
      safeTool(async () => ({ data: await client.get(`/snapshots/${snapshot_id}/diff`) }))
  );
}
