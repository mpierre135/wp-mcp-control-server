import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerMenuTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_menus",
    {
      description: "List WordPress navigation menus and theme locations",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/menus") }))
  );

  server.registerTool(
    "wp_get_menu_items",
    {
      description: "Get items for a specific navigation menu",
      inputSchema: {
        menu_id: z.number().int().describe("Menu term ID"),
      },
    },
    async ({ menu_id }) => safeTool(async () => ({ data: await client.get(`/menus/${menu_id}/items`) }))
  );

  server.registerTool(
    "wp_create_menu_item",
    {
      description: "Add an item to a navigation menu",
      inputSchema: {
        menu_id: z.number().int(),
        title: z.string(),
        url: z.string().optional(),
        type: z.enum(["custom", "post_type", "taxonomy"]).optional().default("custom"),
        object_id: z.number().int().optional(),
        object: z.string().optional(),
        parent_id: z.number().int().optional(),
        position: z.number().int().optional(),
      },
    },
    async ({ menu_id, ...body }) =>
      safeTool(async () => ({ data: await client.post(`/menus/${menu_id}/items`, body) }))
  );

  server.registerTool(
    "wp_update_menu_item",
    {
      description: "Update a navigation menu item",
      inputSchema: {
        item_id: z.number().int(),
        title: z.string().optional(),
        url: z.string().optional(),
        parent_id: z.number().int().optional(),
      },
    },
    async ({ item_id, ...body }) =>
      safeTool(async () => ({ data: await client.put(`/menus/items/${item_id}`, body) }))
  );

  server.registerTool(
    "wp_delete_menu_item",
    {
      description: "Delete a navigation menu item",
      inputSchema: {
        item_id: z.number().int(),
        confirm: z.boolean(),
      },
    },
    async ({ item_id, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/menus/items/${item_id}`, { confirm }) }))
  );

  server.registerTool(
    "wp_assign_menu_location",
    {
      description: "Assign menus to theme navigation locations",
      inputSchema: {
        locations: z.record(z.number().int()).describe("Map of location slug to menu ID"),
      },
    },
    async ({ locations }) =>
      safeTool(async () => ({ data: await client.put("/menus/locations", { locations }) }))
  );
}
