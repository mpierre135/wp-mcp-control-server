import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerExportTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_export_site_structure",
    {
      description: "Export site structure as JSON tree (pages, posts, menus, taxonomies, redirects)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/export/structure") }))
  );

  server.registerTool(
    "wp_generate_sitemap",
    {
      description: "Generate a sitemap of published pages and posts",
      inputSchema: {
        format: z.enum(["json", "xml"]).optional().default("json"),
      },
    },
    async ({ format }) =>
      safeTool(async () => ({ data: await client.get("/export/sitemap", { format }) }))
  );
}
