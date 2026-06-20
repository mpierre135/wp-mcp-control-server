import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerBatchTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_batch_operations",
    {
      description: "Execute multiple WP MCP operations in a single request (max 20)",
      inputSchema: {
        operations: z
          .array(
            z.object({
              method: z.enum(["GET", "POST", "PUT", "DELETE"]),
              path: z.string().describe("REST path e.g. /pages or /posts/123"),
              body: z.record(z.unknown()).optional(),
            })
          )
          .min(1)
          .max(20),
      },
    },
    async ({ operations }) =>
      safeTool(async () => ({ data: await client.post("/batch", { operations }) }))
  );
}
