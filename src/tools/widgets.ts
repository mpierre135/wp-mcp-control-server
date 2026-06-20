import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerWidgetTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_sidebars",
    {
      description: "List registered WordPress widget sidebars",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/widgets/sidebars") }))
  );

  server.registerTool(
    "wp_list_widget_instances",
    {
      description:
        "List widget instances across sidebars (text and custom_html widgets are editable)",
      inputSchema: {
        sidebar: z.string().optional().describe("Filter by sidebar ID"),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/widgets/instances", args) }))
  );

  server.registerTool(
    "wp_update_widget_instance",
    {
      description: "Update a text or custom_html widget instance by widget ID",
      inputSchema: {
        id: z.string().describe("Widget instance ID (e.g. text-2, custom_html-3)"),
        title: z.string().optional(),
        text: z.string().optional().describe("Content for text widgets"),
        content: z.string().optional().describe("HTML content for custom_html widgets"),
      },
    },
    async ({ id, ...body }) =>
      safeTool(async () => ({ data: await client.put(`/widgets/instances/${id}`, body) }))
  );
}
