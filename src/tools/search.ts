import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerSearchTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_search_content",
    {
      description: "Search across WordPress pages, posts, media, categories, and tags",
      inputSchema: {
        query: z.string().describe("Search query"),
        post_type: z
          .array(z.string())
          .optional()
          .describe("Types to search: page, post, attachment, category, tag"),
        status: z.string().optional().default("any"),
        date_after: z.string().optional(),
        date_before: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional().default(20),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/search", args) }))
  );
}
