import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerAcfTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_get_meta_catalog",
    {
      description:
        "Get unified meta field catalog across ACF, AIOSEO, and other registered adapters",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/meta/catalog") }))
  );

  server.registerTool(
    "wp_get_acf_fields",
    {
      description: "Get ACF field values and catalog for a post/page (requires ACF plugin)",
      inputSchema: {
        post_id: z.number().int().describe("WordPress post or page ID"),
      },
    },
    async ({ post_id }) =>
      safeTool(async () => ({ data: await client.get(`/acf/posts/${post_id}`) }))
  );

  server.registerTool(
    "wp_update_acf_fields",
    {
      description: "Update ACF field values on a post/page (creates snapshot before update)",
      inputSchema: {
        post_id: z.number().int(),
        fields: z.record(z.unknown()).describe("ACF field key/value pairs to update"),
      },
    },
    async ({ post_id, fields }) =>
      safeTool(async () => ({ data: await client.put(`/acf/posts/${post_id}`, { fields }) }))
  );
}
