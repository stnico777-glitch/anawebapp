export const COMMUNITY_VISITOR_COOKIE = "community_vid";

/** Set by middleware on `/community` requests so RSC can read visitor id before Set-Cookie round-trip. */
export const COMMUNITY_VID_HEADER = "x-community-vid";

export function participantKeyFromViewer(
  userId: string | null | undefined,
  visitorId: string | null | undefined,
): string | null {
  const u = typeof userId === "string" ? userId.trim() : "";
  if (u.length > 0) return `user:${u}`;
  const v = typeof visitorId === "string" ? visitorId.trim() : "";
  if (v.length > 0) return `v:${v}`;
  return null;
}

/** Parse `user:{id}` / `v:{uuid}` for debugging; not used in hot paths. */
export function parseParticipantKey(key: string): { type: "user" | "visitor"; id: string } | null {
  if (key.startsWith("user:"))
    return { type: "user", id: key.slice("user:".length) };
  if (key.startsWith("v:"))
    return { type: "visitor", id: key.slice("v:".length) };
  return null;
}

export function newVisitorId(): string {
  return crypto.randomUUID();
}
