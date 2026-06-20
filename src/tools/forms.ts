import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerFormTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_forms",
    {
      description: "List Ninja Forms on the site (requires Ninja Forms plugin)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/forms") }))
  );

  server.registerTool(
    "wp_get_form",
    {
      description: "Get Ninja Form details including fields and notification actions",
      inputSchema: {
        id: z.number().int().describe("Form ID"),
      },
    },
    async ({ id }) => safeTool(async () => ({ data: await client.get(`/forms/${id}`) }))
  );

  server.registerTool(
    "wp_update_form_notifications",
    {
      description: "Update Ninja Form notification actions (email recipients, subject, message, etc.)",
      inputSchema: {
        id: z.number().int().describe("Form ID"),
        actions: z
          .array(z.record(z.unknown()))
          .describe("Notification action updates keyed by action ID or settings"),
      },
    },
    async ({ id, actions }) =>
      safeTool(async () => ({
        data: await client.put(`/forms/${id}/notifications`, { actions }),
      }))
  );

  server.registerTool(
    "wp_list_form_submissions",
    {
      description: "List submissions for a Ninja Form",
      inputSchema: {
        id: z.number().int().describe("Form ID"),
        per_page: z.number().int().optional(),
        page: z.number().int().optional(),
      },
    },
    async ({ id, ...args }) =>
      safeTool(async () => ({ data: await client.get(`/forms/${id}/submissions`, args) }))
  );
}
