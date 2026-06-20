import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = join(__dirname, "..", ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

export interface WpMcpConfig {
  siteUrl: string;
  token: string;
  dryRun: boolean;
  safeMode: boolean;
}

export function getConfig(): WpMcpConfig {
  const siteUrl = process.env.WP_MCP_SITE_URL?.replace(/\/$/, "");
  const token = process.env.WP_MCP_TOKEN;

  if (!siteUrl) {
    throw new Error("WP_MCP_SITE_URL environment variable is required");
  }
  if (!token) {
    throw new Error("WP_MCP_TOKEN environment variable is required");
  }

  return {
    siteUrl,
    token,
    dryRun: parseBool(process.env.WP_MCP_DRY_RUN, false),
    safeMode: parseBool(process.env.WP_MCP_SAFE_MODE, true),
  };
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
