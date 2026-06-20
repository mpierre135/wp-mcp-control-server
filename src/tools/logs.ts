import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerLogTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_get_activity_log",
    {
      description: "Get MCP activity log with optional filters",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        per_page: z.number().int().min(1).max(100).optional(),
        action: z.string().optional(),
        object_type: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/activity-log", args) }))
  );

  server.registerTool(
    "wp_restore_snapshot",
    {
      description: "Restore a previous content snapshot before an update/delete",
      inputSchema: {
        snapshot_id: z.number().int().describe("Snapshot ID from activity log"),
        confirm: z.boolean().describe("Must be true to confirm restore"),
      },
    },
    async ({ snapshot_id, confirm }) =>
      safeTool(async () => ({ data: await client.post("/restore", { snapshot_id, confirm }) }))
  );
}
