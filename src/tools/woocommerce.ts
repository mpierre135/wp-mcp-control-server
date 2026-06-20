import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

const productFieldsSchema = {
  name: z.string().optional(),
  slug: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  regular_price: z.string().optional(),
  sale_price: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.number().int().optional(),
  manage_stock: z.boolean().optional(),
  stock_status: z.string().optional(),
  featured: z.boolean().optional(),
};

export function registerWooCommerceTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_products",
    {
      description: "List WooCommerce products with optional filters",
      inputSchema: {
        status: z.string().optional().describe("Product status or 'any'"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/woocommerce/products", args) }))
  );

  server.registerTool(
    "wp_get_product",
    {
      description: "Get full WooCommerce product details",
      inputSchema: {
        id: z.number().int().describe("Product ID"),
      },
    },
    async ({ id }) =>
      safeTool(async () => ({ data: await client.get(`/woocommerce/products/${id}`) }))
  );

  server.registerTool(
    "wp_create_product",
    {
      description: "Create a new WooCommerce simple product",
      inputSchema: {
        name: z.string().describe("Product name"),
        slug: z.string().optional(),
        status: z.string().optional(),
        description: z.string().optional(),
        short_description: z.string().optional(),
        regular_price: z.string().optional(),
        sale_price: z.string().optional(),
        sku: z.string().optional(),
        stock_quantity: z.number().int().optional(),
        manage_stock: z.boolean().optional(),
        stock_status: z.string().optional(),
        featured: z.boolean().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/woocommerce/products", args) }))
  );

  server.registerTool(
    "wp_update_product",
    {
      description: "Update a WooCommerce product (creates snapshot before update)",
      inputSchema: {
        id: z.number().int(),
        ...productFieldsSchema,
      },
    },
    async ({ id, ...body }) =>
      safeTool(async () => ({ data: await client.put(`/woocommerce/products/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_product",
    {
      description: "Delete a WooCommerce product (moves to trash by default)",
      inputSchema: {
        id: z.number().int(),
        force: z.boolean().optional(),
        confirm: z.boolean().describe("Must be true to confirm deletion"),
      },
    },
    async ({ id, force, confirm }) =>
      safeTool(async () => ({
        data: await client.delete(`/woocommerce/products/${id}`, { force, confirm }),
      }))
  );

  server.registerTool(
    "wp_update_product_price",
    {
      description: "Update WooCommerce product pricing (regular_price, sale_price, or price alias)",
      inputSchema: {
        id: z.number().int(),
        regular_price: z.string().optional(),
        sale_price: z.string().optional(),
        price: z.string().optional().describe("Alias for regular_price"),
      },
    },
    async ({ id, ...body }) =>
      safeTool(async () => ({
        data: await client.put(`/woocommerce/products/${id}/price`, body),
      }))
  );

  server.registerTool(
    "wp_list_orders",
    {
      description: "List WooCommerce orders with optional filters",
      inputSchema: {
        status: z.string().optional().describe("Order status or 'any'"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/woocommerce/orders", args) }))
  );

  server.registerTool(
    "wp_get_order",
    {
      description: "Get full WooCommerce order details including line items and addresses",
      inputSchema: {
        id: z.number().int().describe("Order ID"),
      },
    },
    async ({ id }) =>
      safeTool(async () => ({ data: await client.get(`/woocommerce/orders/${id}`) }))
  );

  server.registerTool(
    "wp_update_order",
    {
      description:
        "Update WooCommerce order status, addresses, or line items. confirm:true required when safe mode is enabled.",
      inputSchema: {
        id: z.number().int(),
        status: z.string().optional(),
        customer_note: z.string().optional(),
        billing: z.record(z.string()).optional(),
        shipping: z.record(z.string()).optional(),
        line_items: z
          .array(z.object({ id: z.number().int(), quantity: z.number().int().optional() }))
          .optional(),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ id, confirm, ...body }) =>
      safeTool(async () => ({
        data: await client.put(`/woocommerce/orders/${id}`, { ...body, confirm }),
      }))
  );

  server.registerTool(
    "wp_add_order_note",
    {
      description: "Add an admin or customer-visible note to a WooCommerce order",
      inputSchema: {
        id: z.number().int().describe("Order ID"),
        note: z.string().describe("Note text"),
        customer_note: z.boolean().optional().describe("Make note visible to customer"),
      },
    },
    async ({ id, note, customer_note }) =>
      safeTool(async () => ({
        data: await client.post(`/woocommerce/orders/${id}/notes`, { note, customer_note }),
      }))
  );

  server.registerTool(
    "wp_refund_order",
    {
      description:
        "Create a WooCommerce order refund. confirm:true required. Requires wp_mcp_allow_wc_refunds setting.",
      inputSchema: {
        id: z.number().int().describe("Order ID"),
        amount: z.string().optional().describe("Refund amount (defaults to order total)"),
        reason: z.string().optional(),
        restock: z.boolean().optional().describe("Restock refunded items"),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ id, confirm, ...body }) =>
      safeTool(async () => ({
        data: await client.post(`/woocommerce/orders/${id}/refund`, { ...body, confirm }),
      }))
  );

  server.registerTool(
    "wp_list_booking_products",
    {
      description: "List WooCommerce Bookings products (requires WooCommerce Bookings plugin)",
      inputSchema: {},
    },
    async () =>
      safeTool(async () => ({ data: await client.get("/woocommerce/bookings/products") }))
  );

  server.registerTool(
    "wp_get_booking",
    {
      description: "Get a WooCommerce Booking by ID (requires WooCommerce Bookings plugin)",
      inputSchema: {
        id: z.number().int().describe("Booking ID"),
      },
    },
    async ({ id }) =>
      safeTool(async () => ({ data: await client.get(`/woocommerce/bookings/${id}`) }))
  );
}
