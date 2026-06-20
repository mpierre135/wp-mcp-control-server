import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

export function registerWebhookTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_webhook_topics",
    {
      description: "List available custom MCP webhook event topics (content, WC, forms, cache, etc.)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/webhooks/topics") }))
  );

  server.registerTool(
    "wp_list_custom_webhooks",
    {
      description: "List custom MCP outbound webhooks configured on the site",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/webhooks") }))
  );

  server.registerTool(
    "wp_get_custom_webhook",
    {
      description: "Get a custom MCP webhook by ID",
      inputSchema: {
        id: z.number().int().describe("Webhook ID"),
      },
    },
    async ({ id }) => safeTool(async () => ({ data: await client.get(`/webhooks/${id}`) }))
  );

  server.registerTool(
    "wp_create_custom_webhook",
    {
      description:
        "Create a custom MCP outbound webhook. Secret is returned once on create. confirm:true required when safe mode is on.",
      inputSchema: {
        name: z.string().describe("Webhook name"),
        url: z.string().url().describe("HTTPS delivery URL"),
        topics: z.array(z.string()).describe("Event topics to subscribe to"),
        enabled: z.boolean().optional().describe("Enable webhook (default true)"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async (args) =>
      safeTool(async () => ({ data: await client.post("/webhooks", args) }))
  );

  server.registerTool(
    "wp_update_custom_webhook",
    {
      description: "Update a custom MCP webhook (name, url, topics, enabled)",
      inputSchema: {
        id: z.number().int().describe("Webhook ID"),
        name: z.string().optional(),
        url: z.string().url().optional(),
        topics: z.array(z.string()).optional(),
        enabled: z.boolean().optional(),
      },
    },
    async ({ id, ...body }) =>
      safeTool(async () => ({ data: await client.put(`/webhooks/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_custom_webhook",
    {
      description: "Delete a custom MCP webhook. confirm:true required when safe mode is on.",
      inputSchema: {
        id: z.number().int().describe("Webhook ID"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ id, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/webhooks/${id}`, { confirm }) }))
  );

  server.registerTool(
    "wp_test_custom_webhook",
    {
      description: "Send a test ping to a custom MCP webhook and return delivery result. confirm:true required when safe mode is on.",
      inputSchema: {
        id: z.number().int().describe("Webhook ID"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ id, confirm }) =>
      safeTool(async () => ({ data: await client.post(`/webhooks/${id}/test`, { confirm }) }))
  );

  server.registerTool(
    "wp_list_webhook_deliveries",
    {
      description: "List delivery log entries for a custom MCP webhook",
      inputSchema: {
        id: z.number().int().describe("Webhook ID"),
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
      },
    },
    async ({ id, ...args }) =>
      safeTool(async () => ({ data: await client.get(`/webhooks/${id}/deliveries`, args) }))
  );

  server.registerTool(
    "wp_list_woocommerce_webhooks",
    {
      description: "List WooCommerce native webhooks (product/order topics)",
      inputSchema: {},
    },
    async () => safeTool(async () => ({ data: await client.get("/woocommerce/webhooks") }))
  );

  server.registerTool(
    "wp_get_woocommerce_webhook",
    {
      description: "Get a WooCommerce native webhook by ID",
      inputSchema: {
        id: z.number().int().describe("WooCommerce webhook ID"),
      },
    },
    async ({ id }) =>
      safeTool(async () => ({ data: await client.get(`/woocommerce/webhooks/${id}`) }))
  );

  server.registerTool(
    "wp_create_woocommerce_webhook",
    {
      description:
        "Create a WooCommerce native webhook. Secret returned once. confirm:true required when safe mode is on.",
      inputSchema: {
        name: z.string().describe("Webhook name"),
        delivery_url: z.string().url().describe("Delivery URL"),
        topic: z
          .string()
          .describe("WC topic e.g. order.created, order.updated, product.created"),
        status: z.enum(["active", "paused", "disabled"]).optional(),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async (args) =>
      safeTool(async () => ({ data: await client.post("/woocommerce/webhooks", args) }))
  );

  server.registerTool(
    "wp_update_woocommerce_webhook",
    {
      description: "Update a WooCommerce native webhook",
      inputSchema: {
        id: z.number().int().describe("WooCommerce webhook ID"),
        name: z.string().optional(),
        delivery_url: z.string().url().optional(),
        topic: z.string().optional(),
        status: z.enum(["active", "paused", "disabled"]).optional(),
      },
    },
    async ({ id, ...body }) =>
      safeTool(async () => ({ data: await client.put(`/woocommerce/webhooks/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_woocommerce_webhook",
    {
      description: "Delete a WooCommerce native webhook. confirm:true required when safe mode is on.",
      inputSchema: {
        id: z.number().int().describe("WooCommerce webhook ID"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ id, confirm }) =>
      safeTool(async () => ({
        data: await client.delete(`/woocommerce/webhooks/${id}`, { confirm }),
      }))
  );

  server.registerTool(
    "wp_list_form_webhooks",
    {
      description: "List Ninja Forms webhook actions on a form (requires Ninja Forms)",
      inputSchema: {
        form_id: z.number().int().describe("Ninja Form ID"),
      },
    },
    async ({ form_id }) =>
      safeTool(async () => ({ data: await client.get(`/forms/${form_id}/webhooks`) }))
  );

  server.registerTool(
    "wp_create_form_webhook",
    {
      description: "Create a Ninja Forms webhook action on a form",
      inputSchema: {
        form_id: z.number().int().describe("Ninja Form ID"),
        url: z.string().url().describe("Webhook URL"),
        label: z.string().optional(),
        method: z.string().optional().describe("HTTP method (default POST)"),
        active: z.boolean().optional(),
        headers: z.record(z.string()).optional(),
      },
    },
    async ({ form_id, ...body }) =>
      safeTool(async () => ({ data: await client.post(`/forms/${form_id}/webhooks`, body) }))
  );

  server.registerTool(
    "wp_update_form_webhook",
    {
      description: "Update a Ninja Forms webhook action",
      inputSchema: {
        form_id: z.number().int().describe("Ninja Form ID"),
        action_id: z.number().int().describe("Webhook action ID"),
        url: z.string().url().optional(),
        label: z.string().optional(),
        method: z.string().optional(),
        active: z.boolean().optional(),
        headers: z.record(z.string()).optional(),
      },
    },
    async ({ form_id, action_id, ...body }) =>
      safeTool(async () => ({
        data: await client.put(`/forms/${form_id}/webhooks/${action_id}`, body),
      }))
  );

  server.registerTool(
    "wp_delete_form_webhook",
    {
      description: "Delete a Ninja Forms webhook action",
      inputSchema: {
        form_id: z.number().int().describe("Ninja Form ID"),
        action_id: z.number().int().describe("Webhook action ID"),
      },
    },
    async ({ form_id, action_id }) =>
      safeTool(async () => ({
        data: await client.delete(`/forms/${form_id}/webhooks/${action_id}`),
      }))
  );
}
