import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerSiteTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_health_check",
    {
      description: "Check WP MCP Control plugin health, REST availability, and security settings",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/health") }))
  );

  server.registerTool(
    "wp_get_site_info",
    {
      description: "Get WordPress site information including theme, plugins, and permalink settings",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/site-info") }))
  );

  server.registerTool(
    "wp_list_themes",
    {
      description: "List installed WordPress themes (read-only)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/themes") }))
  );

  server.registerTool(
    "wp_list_plugins",
    {
      description: "List installed WordPress plugins (read-only)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/plugins") }))
  );

  server.registerTool(
    "wp_get_settings",
    {
      description: "Read safe WordPress site settings",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/settings") }))
  );

  server.registerTool(
    "wp_update_settings",
    {
      description: "Update safe WordPress site settings (title, tagline, posts per page, front page)",
      inputSchema: {
        blogname: z.string().optional().describe("Site title"),
        blogdescription: z.string().optional().describe("Site tagline"),
        posts_per_page: z.number().int().optional(),
        show_on_front: z.enum(["posts", "page"]).optional(),
        page_on_front: z.number().int().optional(),
        page_for_posts: z.number().int().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.put("/settings", args) }))
  );
}
