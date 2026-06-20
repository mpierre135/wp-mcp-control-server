# WP MCP Control — MCP Server

TypeScript MCP server that connects Cursor, Claude Desktop, and other MCP clients to the [WP MCP Control](https://github.com/mpierre135/wp-mcp-control) WordPress plugin.

## Quick Install (new computer)

```bash
git clone https://github.com/mpierre135/wp-mcp-control-server.git
cd wp-mcp-control-server
npm install
npm run build
cp .env.example .env
# Edit .env with your site URL and token
```

Then add to Claude Desktop or Cursor (see below).

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run build
npm start
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WP_MCP_SITE_URL` | Yes | — | WordPress site URL (no trailing slash) |
| `WP_MCP_TOKEN` | Yes | — | API token from plugin settings |
| `WP_MCP_SAFE_MODE` | No | `true` | Block destructive operations |
| `WP_MCP_DRY_RUN` | No | `false` | Validate without making changes |

## Claude Desktop Config

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wp-mcp-control": {
      "command": "node",
      "args": ["/absolute/path/to/wp-mcp-control-server/dist/index.js"],
      "env": {
        "WP_MCP_SITE_URL": "https://example.com",
        "WP_MCP_TOKEN": "your-token",
        "WP_MCP_SAFE_MODE": "true",
        "WP_MCP_DRY_RUN": "false"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

## Cursor Config

```json
{
  "mcpServers": {
    "wp-mcp-control": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "WP_MCP_SITE_URL": "https://example.com",
        "WP_MCP_TOKEN": "your-token",
        "WP_MCP_SAFE_MODE": "true",
        "WP_MCP_DRY_RUN": "false"
      }
    }
  }
}
```

## Development

```bash
npm run dev    # Watch mode
npm run build  # Compile to dist/
```

## Tool Catalog

### Site
- `wp_health_check` — Health and status
- `wp_get_site_info` — Site metadata
- `wp_list_themes` / `wp_list_plugins` — Read-only inventory
- `wp_get_settings` / `wp_update_settings` — Safe settings

### Pages
- `wp_list_pages`, `wp_get_page`, `wp_create_page`, `wp_update_page`, `wp_delete_page`
- `wp_create_landing_page` — Structured landing page builder

### Posts
- `wp_list_posts`, `wp_get_post`, `wp_create_post`, `wp_update_post`, `wp_delete_post`

### Media
- `wp_list_media`, `wp_get_media`
- `wp_upload_media_from_url`, `wp_upload_media_from_base64`
- `wp_update_media_metadata`, `wp_delete_media`

### Taxonomies
- `wp_list_categories`, `wp_create_category`, `wp_update_category`, `wp_delete_category`
- `wp_list_tags`, `wp_create_tag`, `wp_update_tag`, `wp_delete_tag`

### Menus
- `wp_list_menus`, `wp_get_menu_items`
- `wp_create_menu_item`, `wp_update_menu_item`, `wp_delete_menu_item`
- `wp_assign_menu_location`

### Other
- `wp_search_content` — Unified search
- `wp_batch_operations` — Batch API calls
- `wp_get_activity_log`, `wp_restore_snapshot`
- `wp_list_redirects`, `wp_create_redirect`, `wp_update_redirect`, `wp_delete_redirect`
- `wp_export_site_structure`, `wp_generate_sitemap`

### Elementor (Phase 1–3)
- `wp_elementor_get_widget_catalog` — Widget catalog with editable settings
- `wp_elementor_get_structure` — Full Elementor element tree
- `wp_elementor_list_elements` — Flat list of widgets with text previews
- `wp_elementor_find_widgets` — Filter by widget_type
- `wp_elementor_update_element` — Update catalog-editable widget by element ID
- `wp_elementor_update_text` — Find widget by text and replace
- `wp_elementor_update_button` — Update button text/URL by match_text
- `wp_elementor_update_image` — Update image by element_id or match_url
- `wp_elementor_insert_widget` — Add widget to column/container
- `wp_elementor_insert_section` — Add section (hero/cta/features presets)
- `wp_elementor_remove_element` — Delete element by ID
- `wp_elementor_clone_element` — Clone subtree with new IDs
- `wp_elementor_duplicate_page` — Clone Elementor page as draft
- `wp_elementor_find_parent` — Find column/container for insert
- `wp_elementor_regenerate_css` — Regenerate Elementor CSS cache

### v2.0 — Discovery and diagnostics
- `wp_get_site_blueprint`, `wp_site_audit`, `wp_security_posture`, `wp_purge_cache`

### v2.0 — Gutenberg, CPT, meta
- `wp_get_block_structure`, `wp_list_blocks`, `wp_update_block`, `wp_insert_block_pattern`
- `wp_list_post_types`, `wp_list_cpt_items`, `wp_get_cpt_item`, `wp_create_cpt_item`, `wp_update_cpt_item`, `wp_delete_cpt_item`
- `wp_list_taxonomies`, `wp_list_taxonomy_terms`, `wp_create_taxonomy_term`
- `wp_get_meta_catalog`, `wp_get_acf_fields`, `wp_update_acf_fields`

### v2.0 — SEO and WooCommerce
- `wp_get_page_seo`, `wp_update_page_seo`, `wp_audit_seo`
- `wp_list_products`, `wp_get_product`, `wp_create_product`, `wp_update_product`, `wp_delete_product`, `wp_update_product_price`
- `wp_list_orders`, `wp_get_order`, `wp_update_order`, `wp_add_order_note`, `wp_refund_order`
- `wp_list_booking_products`, `wp_get_booking`

### v2.0 — Forms, users, comments, widgets
- `wp_list_forms`, `wp_get_form`, `wp_update_form_notifications`, `wp_list_form_submissions`
- `wp_list_users`, `wp_get_user`, `wp_list_roles`, `wp_create_user`
- `wp_list_comments`, `wp_moderate_comment`, `wp_reply_to_comment`
- `wp_list_sidebars`, `wp_list_widget_instances`, `wp_update_widget_instance`

### v2.0 — Revisions, plugins, cron
- `wp_list_revisions`, `wp_get_revision`, `wp_get_revision_diff`, `wp_restore_revision`, `wp_get_snapshot_diff`
- `wp_get_plugin_conflicts`, `wp_get_plugin_updates`, `wp_activate_plugin`, `wp_deactivate_plugin`
- `wp_list_cron_events`

**Server version:** 2.0.0 — 100+ tools total

## Headers Sent to WordPress

Every request includes:
- `Authorization: Bearer <token>`
- `X-WP-MCP-Dry-Run: true|false`
- `X-WP-MCP-Safe-Mode: true|false`

These override plugin defaults when set in MCP env vars.
