import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

const widgetChildSchema = z.object({
  widget_type: z.string().describe("Elementor widget type, e.g. heading, button, icon-box"),
  settings: z.record(z.unknown()).optional().describe("Widget settings per catalog"),
});

const sectionPresets: Record<string, z.infer<typeof widgetChildSchema>[]> = {
  hero: [
    { widget_type: "heading", settings: { title: "Hero Headline", header_size: "h1" } },
    { widget_type: "text-editor", settings: { editor: "<p>Supporting text goes here.</p>" } },
    { widget_type: "button", settings: { text: "Get Started", link: { url: "#" } } },
  ],
  cta: [
    { widget_type: "heading", settings: { title: "Ready to get started?", header_size: "h2" } },
    { widget_type: "button", settings: { text: "Contact Us", link: { url: "#" } } },
  ],
  features: [
    { widget_type: "icon-box", settings: { title_text: "Feature One", description_text: "Description" } },
    { widget_type: "icon-box", settings: { title_text: "Feature Two", description_text: "Description" } },
    { widget_type: "icon-box", settings: { title_text: "Feature Three", description_text: "Description" } },
  ],
};

export function registerElementorTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_elementor_get_widget_catalog",
    {
      description: "Get the Elementor widget catalog with editable settings per widget type.",
      inputSchema: {},
    },
    async () =>
      safeTool(async () => ({ data: await client.get("/elementor/widgets") }))
  );

  server.registerTool(
    "wp_elementor_get_structure",
    {
      description:
        "Get full Elementor page structure including element tree JSON. Page must be built with Elementor.",
      inputSchema: {
        page_id: z.number().int().describe("WordPress page ID"),
      },
    },
    async ({ page_id }) =>
      safeTool(async () => ({ data: await client.get(`/elementor/pages/${page_id}`) }))
  );

  server.registerTool(
    "wp_elementor_list_elements",
    {
      description:
        "List all Elementor elements on a page as a flat index with id, widgetType, text preview, and is_editable flag",
      inputSchema: {
        page_id: z.number().int().describe("WordPress page ID"),
      },
    },
    async ({ page_id }) =>
      safeTool(async () => ({ data: await client.get(`/elementor/pages/${page_id}/elements`) }))
  );

  server.registerTool(
    "wp_elementor_find_widgets",
    {
      description: "Find widgets on a page filtered by widget_type (e.g. button, image, raven-heading)",
      inputSchema: {
        page_id: z.number().int(),
        widget_type: z.string().describe("Widget type to filter by"),
      },
    },
    async ({ page_id, widget_type }) =>
      safeTool(async () => ({
        data: await client.get(`/elementor/pages/${page_id}/widgets`, { widget_type }),
      }))
  );

  server.registerTool(
    "wp_elementor_update_element",
    {
      description:
        "Update an Elementor widget by element ID. Supports all catalog-editable widgets (heading, text-editor, button, image, icon-box, icon-list, raven-*).",
      inputSchema: {
        page_id: z.number().int(),
        element_id: z.string().describe("Elementor element ID from wp_elementor_list_elements"),
        settings: z
          .record(z.unknown())
          .describe("Widget settings to merge — use wp_elementor_get_widget_catalog for allowed keys"),
      },
    },
    async ({ page_id, element_id, settings }) =>
      safeTool(async () => ({
        data: await client.put(`/elementor/pages/${page_id}/elements/${element_id}`, { settings }),
      }))
  );

  server.registerTool(
    "wp_elementor_update_text",
    {
      description:
        "Find a heading or text-editor widget by matching existing text and replace it. Creates a snapshot before updating.",
      inputSchema: {
        page_id: z.number().int(),
        widget_type: z
          .string()
          .default("heading")
          .describe("Widget type: heading, text-editor, or raven-heading"),
        match_text: z.string().describe("Existing text to find (partial match supported)"),
        new_text: z.string().describe("Replacement text"),
      },
    },
    async ({ page_id, widget_type, match_text, new_text }) =>
      safeTool(async () => ({
        data: await client.put(`/elementor/pages/${page_id}/text`, {
          widget_type,
          match_text,
          new_text,
        }),
      }))
  );

  server.registerTool(
    "wp_elementor_update_button",
    {
      description:
        "Find a button (or raven-button) by matching button text and update text and/or URL.",
      inputSchema: {
        page_id: z.number().int(),
        match_text: z.string().describe("Existing button text to find"),
        new_text: z.string().optional().describe("New button label"),
        url: z.string().optional().describe("New button URL"),
      },
    },
    async ({ page_id, match_text, new_text, url }) =>
      safeTool(async () => ({
        data: await client.put(`/elementor/pages/${page_id}/button`, {
          match_text,
          new_text,
          url,
        }),
      }))
  );

  server.registerTool(
    "wp_elementor_update_image",
    {
      description: "Update an image widget by element_id or match_url. Set image_id, image_url, and/or caption.",
      inputSchema: {
        page_id: z.number().int(),
        element_id: z.string().optional().describe("Target element ID (preferred)"),
        match_url: z.string().optional().describe("Find image by current URL substring"),
        image_id: z.number().int().optional().describe("WordPress attachment ID"),
        image_url: z.string().optional().describe("Image URL"),
        caption: z.string().optional(),
      },
    },
    async ({ page_id, element_id, match_url, image_id, image_url, caption }) =>
      safeTool(async () => ({
        data: await client.put(`/elementor/pages/${page_id}/image`, {
          element_id,
          match_url,
          image_id,
          image_url,
          caption,
        }),
      }))
  );

  server.registerTool(
    "wp_elementor_insert_widget",
    {
      description:
        "Insert a widget into a column or container. Requires parent_id from wp_elementor_list_elements. Use confirm:true when safe mode is on.",
      inputSchema: {
        page_id: z.number().int(),
        parent_id: z.string().describe("Parent column or container element ID"),
        widget_type: z.string().describe("Widget type from catalog"),
        settings: z.record(z.unknown()).optional(),
        confirm: z.boolean().optional().describe("Required when safe mode is enabled"),
      },
    },
    async ({ page_id, parent_id, widget_type, settings, confirm }) =>
      safeTool(async () => ({
        data: await client.post(`/elementor/pages/${page_id}/elements`, {
          parent_id,
          widget_type,
          settings,
          confirm,
        }),
      }))
  );

  server.registerTool(
    "wp_elementor_insert_section",
    {
      description:
        "Insert a section scaffold (section+column or container) with widgets. Use preset hero/cta/features or custom children. confirm:true required in safe mode.",
      inputSchema: {
        page_id: z.number().int(),
        preset: z
          .enum(["hero", "cta", "features"])
          .optional()
          .describe("Built-in section preset"),
        children: z
          .array(widgetChildSchema)
          .optional()
          .describe("Custom widget list (overrides preset)"),
        position: z.enum(["start", "end"]).default("end"),
        confirm: z.boolean().optional(),
      },
    },
    async ({ page_id, preset, children, position, confirm }) => {
      const widgets = children ?? (preset ? sectionPresets[preset] : undefined);
      if (!widgets?.length) {
        throw new Error("Provide preset (hero, cta, features) or children array");
      }
      return safeTool(async () => ({
        data: await client.post(`/elementor/pages/${page_id}/sections`, {
          position,
          children: widgets,
          confirm,
        }),
      }));
    }
  );

  server.registerTool(
    "wp_elementor_remove_element",
    {
      description:
        "Remove a widget, section, or container by element ID. confirm:true required when safe mode is on.",
      inputSchema: {
        page_id: z.number().int(),
        element_id: z.string(),
        confirm: z.boolean().optional(),
      },
    },
    async ({ page_id, element_id, confirm }) =>
      safeTool(async () => ({
        data: await client.delete(`/elementor/pages/${page_id}/elements/${element_id}`, {
          confirm,
        }),
      }))
  );

  server.registerTool(
    "wp_elementor_clone_element",
    {
      description:
        "Clone a widget, section, or container subtree with new IDs. confirm:true required when safe mode is on.",
      inputSchema: {
        page_id: z.number().int(),
        element_id: z.string(),
        confirm: z.boolean().optional(),
      },
    },
    async ({ page_id, element_id, confirm }) =>
      safeTool(async () => ({
        data: await client.post(`/elementor/pages/${page_id}/elements/${element_id}/clone`, {
          confirm,
        }),
      }))
  );

  server.registerTool(
    "wp_elementor_duplicate_page",
    {
      description:
        "Duplicate an Elementor page as a new draft with remapped element IDs. confirm:true required when safe mode is on.",
      inputSchema: {
        source_id: z.number().int().describe("Source page ID to clone"),
        title: z.string().optional(),
        slug: z.string().optional(),
        status: z.enum(["draft", "publish", "pending", "private"]).default("draft"),
        confirm: z.boolean().optional(),
      },
    },
    async ({ source_id, title, slug, status, confirm }) =>
      safeTool(async () => ({
        data: await client.post("/elementor/pages/duplicate", {
          source_id,
          title,
          slug,
          status,
          confirm,
        }),
      }))
  );
}
