import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerSeoTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_get_page_seo",
    {
      description:
        "Get SEO metadata for a page/post via All in One SEO (title, description, schema, etc.)",
      inputSchema: {
        page_id: z.number().int().describe("WordPress page or post ID"),
      },
    },
    async ({ page_id }) =>
      safeTool(async () => ({ data: await client.get(`/seo/pages/${page_id}`) }))
  );

  server.registerTool(
    "wp_update_page_seo",
    {
      description: "Update SEO fields for a page/post via All in One SEO (creates snapshot before update)",
      inputSchema: {
        page_id: z.number().int(),
        fields: z
          .record(z.unknown())
          .describe("SEO field key/value pairs — use wp_get_page_seo catalog for allowed keys"),
      },
    },
    async ({ page_id, fields }) =>
      safeTool(async () => ({ data: await client.put(`/seo/pages/${page_id}`, { fields }) }))
  );

  server.registerTool(
    "wp_audit_seo",
    {
      description: "Run SEO audit across published content (missing titles, descriptions, etc.)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/seo/audit") }))
  );
}
