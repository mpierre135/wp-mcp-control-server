import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { WordPressClient } from "../wordpress-client.js";
import { safeTool } from "../utils.js";

const statusEnum = z.enum(["publish", "draft", "pending", "private", "trash", "any"]).optional();

export function registerPageTools(server: McpServer, client: WordPressClient) {
  server.registerTool(
    "wp_list_pages",
    {
      description: "List WordPress pages with optional filters",
      inputSchema: {
        status: statusEnum.describe("Filter by post status"),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
        search: z.string().optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.get("/pages", args) }))
  );

  server.registerTool(
    "wp_get_page",
    {
      description: "Get full WordPress page data including raw and rendered HTML content",
      inputSchema: {
        id: z.number().int().describe("Page ID"),
      },
    },
    async ({ id }) => safeTool(async () => ({ data: await client.get(`/pages/${id}`) }))
  );

  server.registerTool(
    "wp_create_page",
    {
      description: "Create a new WordPress page",
      inputSchema: {
        title: z.string().describe("Page title"),
        slug: z.string().optional(),
        status: z.enum(["publish", "draft", "pending", "private"]).optional().default("draft"),
        content: z.string().optional().describe("HTML or Gutenberg block content"),
        excerpt: z.string().optional(),
        parent: z.number().int().optional(),
        template: z.string().optional(),
        featured_media: z.number().int().optional(),
        meta: z.record(z.unknown()).optional(),
      },
    },
    async (args) => safeTool(async () => ({ data: await client.post("/pages", args) }))
  );

  server.registerTool(
    "wp_update_page",
    {
      description: "Update an existing WordPress page (creates snapshot before update)",
      inputSchema: {
        id: z.number().int().describe("Page ID"),
        title: z.string().optional(),
        slug: z.string().optional(),
        status: z.enum(["publish", "draft", "pending", "private", "trash"]).optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        parent: z.number().int().optional(),
        template: z.string().optional(),
        featured_media: z.number().int().optional(),
        meta: z.record(z.unknown()).optional(),
      },
    },
    async ({ id, ...body }) => safeTool(async () => ({ data: await client.put(`/pages/${id}`, body) }))
  );

  server.registerTool(
    "wp_delete_page",
    {
      description: "Delete a WordPress page (moves to trash by default)",
      inputSchema: {
        id: z.number().int().describe("Page ID"),
        force: z.boolean().optional().describe("Permanently delete instead of trash"),
        confirm: z.boolean().describe("Must be true to confirm deletion"),
      },
    },
    async ({ id, force, confirm }) =>
      safeTool(async () => ({ data: await client.delete(`/pages/${id}`, { force, confirm }) }))
  );

  server.registerTool(
    "wp_create_landing_page",
    {
      description: "Create a landing page with structured sections (hero, services, testimonials, FAQ, CTA)",
      inputSchema: {
        title: z.string().describe("Page title"),
        slug: z.string().optional(),
        status: z.enum(["publish", "draft"]).optional().default("draft"),
        sections: z
          .array(
            z.object({
              type: z.enum(["hero", "services", "testimonials", "faq", "cta", "content"]),
              heading: z.string().optional(),
              subheading: z.string().optional(),
              body: z.string().optional(),
              items: z.array(z.string()).optional(),
            })
          )
          .describe("Page sections to compose"),
      },
    },
    async ({ title, slug, status, sections }) => {
      const content = buildLandingPageHtml(sections);
      return safeTool(async () => ({
        data: await client.post("/pages", { title, slug, status, content }),
      }));
    }
  );
}

function buildLandingPageHtml(
  sections: Array<{
    type: string;
    heading?: string;
    subheading?: string;
    body?: string;
    items?: string[];
  }>
): string {
  const blocks: string[] = [];

  for (const section of sections) {
    switch (section.type) {
      case "hero":
        blocks.push(
          `<!-- wp:group {"className":"wp-mcp-hero"} -->
<div class="wp-block-group wp-mcp-hero">
<!-- wp:heading {"level":1} -->
<h1>${escapeHtml(section.heading ?? "Welcome")}</h1>
<!-- /wp:heading -->
${section.subheading ? `<!-- wp:paragraph --><p>${escapeHtml(section.subheading)}</p><!-- /wp:paragraph -->` : ""}
</div>
<!-- /wp:group -->`
        );
        break;
      case "services":
        blocks.push(`<!-- wp:heading {"level":2} --><h2>${escapeHtml(section.heading ?? "Our Services")}</h2><!-- /wp:heading -->`);
        if (section.items?.length) {
          blocks.push("<!-- wp:list --><ul>");
          for (const item of section.items) {
            blocks.push(`<!-- wp:list-item --><li>${escapeHtml(item)}</li><!-- /wp:list-item -->`);
          }
          blocks.push("</ul><!-- /wp:list -->");
        }
        break;
      case "testimonials":
        blocks.push(`<!-- wp:heading {"level":2} --><h2>${escapeHtml(section.heading ?? "Testimonials")}</h2><!-- /wp:heading -->`);
        if (section.body) {
          blocks.push(`<!-- wp:quote --><blockquote class="wp-block-quote"><p>${escapeHtml(section.body)}</p></blockquote><!-- /wp:quote -->`);
        }
        break;
      case "faq":
        blocks.push(`<!-- wp:heading {"level":2} --><h2>${escapeHtml(section.heading ?? "FAQ")}</h2><!-- /wp:heading -->`);
        if (section.items?.length) {
          for (const item of section.items) {
            blocks.push(`<!-- wp:paragraph --><p>${escapeHtml(item)}</p><!-- /wp:paragraph -->`);
          }
        }
        break;
      case "cta":
        blocks.push(
          `<!-- wp:buttons -->
<div class="wp-block-buttons">
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link">${escapeHtml(section.heading ?? "Get Started")}</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->`
        );
        break;
      default:
        if (section.body) {
          blocks.push(`<!-- wp:paragraph --><p>${escapeHtml(section.body)}</p><!-- /wp:paragraph -->`);
        }
    }
  }

  return blocks.join("\n\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
