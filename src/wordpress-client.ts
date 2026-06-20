import type { WpMcpConfig } from "./config.js";

export class WordPressApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "WordPressApiError";
  }
}

export class WordPressClient {
  private baseUrl: string;

  constructor(private config: WpMcpConfig) {
    this.baseUrl = `${config.siteUrl}/wp-json/wp-mcp/v1`;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-WP-MCP-Dry-Run": this.config.dryRun ? "true" : "false",
      "X-WP-MCP-Safe-Mode": this.config.safeMode ? "true" : "false",
    };
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalized}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, unknown>
  ): Promise<T> {
    const url = this.buildUrl(path, method === "GET" ? { ...query, ...((body as Record<string, unknown>) ?? {}) } : query);

    const init: RequestInit = {
      method,
      headers: this.headers(),
    };

    if (body !== undefined && method !== "GET") {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);
    const text = await response.text();

    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      const err = data as { code?: string; message?: string; data?: { status?: number } };
      throw new WordPressApiError(
        err.message ?? `HTTP ${response.status}`,
        err.code ?? "http_error",
        err.data?.status ?? response.status,
        data
      );
    }

    return data as T;
  }

  get<T = unknown>(path: string, query?: Record<string, unknown>): Promise<T> {
    return this.request<T>("GET", path, undefined, query);
  }

  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("DELETE", path, body);
  }
}
