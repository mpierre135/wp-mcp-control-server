import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerRedirectTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_redirects",
    {
      description: "List built-in URL redirects managed by WP MCP Control",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/redirects") }))
  );

  server.registerTool(
    "wp_create_redirect",
    {
      description: "Create a URL redirect",
      inputSchema: {
        source_path: z.string().describe("Source path e.g. /old-page"),
        target_url: z.string().url().describe("Target URL"),
        status_code: z.enum(["301", "302", "307", "308"]).optional().default("301"),
        enabled: z.boolean().optional().default(true),
      },
    },
    async (args) =>
      safeTool(async () => ({
        data: await client.post("/redirects", {
          ...args,
          status_code: parseInt(args.status_code, 10),
        }),
      }))
  );

  server.registerTool(
    "wp_update_redirect",
    {
      description: "Update an existing redirect",
      inputSchema: {
        id: z.number().int(),
        source_path: z.string().optional(),
        target_url: z.string().url().optional(),
        status_code: z.enum(["301", "302", "307", "308"]).optional(),
        enabled: z.boolean().optional(),
      },
    },
    async ({ id, status_code, ...body }) =>
      safeTool(async () => ({
        data: await client.put(`/redirects/${id}`, {
          ...body,
          ...(status_code ? { status_code: parseInt(status_code, 10) } : {}),
        }),
      }))
  );

  server.registerTool(
    "wp_delete_redirect",
    {
      description: "Delete a redirect",
      inputSchema: {
        id: z.number().int(),
        confirm: z.boolean(),
      },
    },
    async ({ id, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/redirects/${id}`, { confirm }) }))
  );
}
