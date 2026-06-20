import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerUserTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_users",
    {
      description: "List WordPress users with optional role and search filters",
      inputSchema: {
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
        role: z.string().optional(),
        include_email: z.boolean().optional().describe("Include email addresses in response"),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/users", args) }))
  );

  server.registerTool(
    "wp_get_user",
    {
      description: "Get a WordPress user by ID",
      inputSchema: {
        id: z.number().int(),
        include_email: z.boolean().optional(),
      },
    },
    async ({ id, include_email }) =>
      safeTool(async () => ({ data: await client.get(`/users/${id}`, { include_email }) }))
  );

  server.registerTool(
    "wp_list_roles",
    {
      description: "List WordPress roles and their capabilities",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/roles") }))
  );

  server.registerTool(
    "wp_create_user",
    {
      description:
        "Create a WordPress user. confirm:true required in safe mode. Administrator role requires explicit confirm.",
      inputSchema: {
        username: z.string(),
        email: z.string().email(),
        role: z
          .enum(["administrator", "editor", "author", "contributor", "subscriber"])
          .optional()
          .default("author"),
        password: z.string().optional().describe("Auto-generated if omitted"),
        display_name: z.string().optional(),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/users", args) }))
  );
}
