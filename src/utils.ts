export function jsonResponse(obj: Record<string, unknown>, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

export async function safeTool(fn: () => Promise<Record<string, unknown>>) {
  try {
    const result = await fn();
    return jsonResponse({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const extra: Record<string, unknown> = { success: false, error: message };

    if (err && typeof err === "object" && "code" in err) {
      extra.code = (err as { code: string }).code;
    }
    if (err && typeof err === "object" && "status" in err) {
      extra.status = (err as { status: number }).status;
    }

    return jsonResponse(extra, true);
  }
}
