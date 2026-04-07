/**
 * Admin API calls from the browser must send session cookies (NextAuth).
 */
export function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "same-origin",
  });
}

export async function adminJson(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return adminFetch(input, { ...init, headers });
}

export async function readAdminError(res: Response): Promise<string> {
  try {
    const j: unknown = await res.json();
    if (j && typeof j === "object" && "error" in j && typeof (j as { error: unknown }).error === "string") {
      return (j as { error: string }).error;
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}
