/** Your EmbedSocial widget ref – used when env isn’t available (e.g. cache). */
const DEFAULT_EMBED_REF = "6570de7fa6c720ed12478546c956912d16ee11d5";

/**
 * Server-only: Instagram embed config. Prefer env; fallback so the widget shows.
 */
export function getInstagramEmbedConfig() {
  const embedIframeUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL?.trim() || null;
  const embedRef =
    process.env.NEXT_PUBLIC_INSTAGRAM_EMBED_REF?.trim() ||
    (!embedIframeUrl ? DEFAULT_EMBED_REF : null);
  return { embedRef, embedIframeUrl };
}
