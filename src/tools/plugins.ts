import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerPluginTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_get_plugin_conflicts",
    {
      description: "Detect conflicting active plugins (SEO, cache, redirect groups)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/plugins/conflicts") }))
  );

  server.registerTool(
    "wp_get_plugin_updates",
    {
      description: "List available plugin updates from WordPress.org",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/plugins/updates") }))
  );

  server.registerTool(
    "wp_activate_plugin",
    {
      description:
        "Activate a plugin by slug (e.g. litespeed-cache/litespeed-cache.php). Must be on MCP allowlist. confirm required in safe mode.",
      inputSchema: {
        slug: z.string().describe("Plugin file path relative to wp-content/plugins/"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ slug, confirm }) =>
      safeTool(async () => ({
        data: await client.post(`/plugins/${slug}/activate`, { confirm }),
      }))
  );

  server.registerTool(
    "wp_deactivate_plugin",
    {
      description:
        "Deactivate a plugin by slug. confirm:true required when safe mode is enabled.",
      inputSchema: {
        slug: z.string().describe("Plugin file path relative to wp-content/plugins/"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ slug, confirm }) =>
      safeTool(async () => ({
        data: await client.post(`/plugins/${slug}/deactivate`, { confirm }),
      }))
  );
}
