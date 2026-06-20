import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerCronTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_cron_events",
    {
      description: "List scheduled WordPress cron events (read-only)",
      inputSchema: {
        hook: z.string().optional().describe("Filter by cron hook name"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/cron/events", args) }))
  );
}
