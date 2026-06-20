#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getConfig } from "./config.js";
import { WordPressClient } from "./wordpress-client.js";
import { registerSiteTools } from "./tools/site.js";
import { registerPageTools } from "./tools/pages.js";
import { registerPostTools } from "./tools/posts.js";
import { registerMediaTools } from "./tools/media.js";
import { registerTaxonomyTools } from "./tools/taxonomies.js";
import { registerMenuTools } from "./tools/menus.js";
import { registerSearchTools } from "./tools/search.js";
import { registerBatchTools } from "./tools/batch.js";
import { registerLogTools } from "./tools/logs.js";
import { registerRedirectTools } from "./tools/redirects.js";
import { registerExportTools } from "./tools/export.js";
import { registerElementorTools } from "./tools/elementor.js";

const config = getConfig();
const client = new WordPressClient(config);

const server = new McpServer({
  name: "wp-mcp-control",
  version: "1.0.0",
});

registerSiteTools(server, client);
registerPageTools(server, client);
registerPostTools(server, client);
registerMediaTools(server, client);
registerTaxonomyTools(server, client);
registerMenuTools(server, client);
registerSearchTools(server, client);
registerBatchTools(server, client);
registerLogTools(server, client);
registerRedirectTools(server, client);
registerExportTools(server, client);
registerElementorTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[wp-mcp-control] MCP server connected");
console.error(`[wp-mcp-control] Site: ${config.siteUrl}`);
console.error(`[wp-mcp-control] Safe mode: ${config.safeMode}, Dry run: ${config.dryRun}`);
