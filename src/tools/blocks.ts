import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerBlockTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_get_block_structure",
    {
      description:
        "Get full Gutenberg block structure for a page/post including editor type, block count, and flat block index",
      inputSchema: {
        page_id: z.number().int().describe("WordPress page or post ID"),
      },
    },
    async ({ page_id }) =>
      safeTool(async () => ({ data: await client.get(`/blocks/pages/${page_id}`) }))
  );

  server.registerTool(
    "wp_list_blocks",
    {
      description:
        "List Gutenberg blocks on a page/post as a flat index with blockName, path, and attributes preview",
      inputSchema: {
        page_id: z.number().int().describe("WordPress page or post ID"),
      },
    },
    async ({ page_id }) =>
      safeTool(async () => ({ data: await client.get(`/blocks/pages/${page_id}`) }))
  );

  server.registerTool(
    "wp_update_block",
    {
      description:
        "Update Gutenberg block attributes by path or by finding block_name with optional match_text",
      inputSchema: {
        page_id: z.number().int(),
        path: z.string().optional().describe("Block path from wp_list_blocks (e.g. 0.1.2)"),
        block_name: z.string().optional().describe("Block name to find when path is omitted"),
        match_text: z.string().optional().describe("Text to match when finding by block_name"),
        attrs: z.record(z.unknown()).describe("Block attributes to merge"),
      },
    },
    async ({ page_id, path, block_name, match_text, attrs }) =>
      safeTool(async () => ({
        data: await client.put(`/blocks/pages/${page_id}`, { path, block_name, match_text, attrs }),
      }))
  );

  server.registerTool(
    "wp_insert_block_pattern",
    {
      description: "Insert a Gutenberg block pattern preset (hero, faq, columns) into a page/post",
      inputSchema: {
        page_id: z.number().int(),
        preset: z.enum(["hero", "faq", "columns"]).describe("Built-in block pattern preset"),
      },
    },
    async ({ page_id, preset }) =>
      safeTool(async () => ({
        data: await client.post(`/blocks/pages/${page_id}/patterns`, { preset }),
      }))
  );
}
