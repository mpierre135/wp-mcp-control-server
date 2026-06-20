import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerAuditTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_get_site_blueprint",
    {
      description:
        "Get site blueprint for agent discovery: theme, menus, adapters, Elementor/WooCommerce status, allowed post types",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/blueprint") }))
  );

  server.registerTool(
    "wp_site_audit",
    {
      description:
        "Run site content audit: empty pages, missing alt text, redirect loops, draft backlog, SEO issues",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/audit") }))
  );

  server.registerTool(
    "wp_security_posture",
    {
      description:
        "Get security posture: safe mode, dry run, rate limits, IP allowlist, token age, CORS settings",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/audit/security") }))
  );

  server.registerTool(
    "wp_purge_cache",
    {
      description:
        "Purge site cache (LiteSpeed, WP Rocket, W3TC, etc.). confirm:true required when safe mode is enabled.",
      inputSchema: {
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ confirm }) =>
      safeTool(async () => ({ data: await client.post("/cache/purge", { confirm }) }))
  );
}
