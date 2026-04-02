import { NextResponse } from "next/server";

/**
 * Live Instagram feed via Graph API.
 * Requires Instagram Business or Creator account linked to a Facebook Page.
 *
 * Set in .env:
 *   INSTAGRAM_ACCESS_TOKEN=...  (long-lived User or Page token with instagram_basic, pages_read_engagement)
 *   INSTAGRAM_USER_ID=...       (IG User ID from Page's instagram_business_account)
 */
const FIELDS = "id,media_type,media_url,permalink,thumbnail_url,caption,timestamp";
const API_VERSION = "v21.0";
const CACHE_SECONDS = 3600; // 1 hour

export const dynamic = "force-dynamic";

type IgMedia = {
  id: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp?: string;
};

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return NextResponse.json(
      { posts: [], message: "Instagram feed not configured" },
      { status: 200 }
    );
  }

  try {
    const url = new URL(`https://graph.instagram.com/${API_VERSION}/${userId}/media`);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "25");

    const res = await fetch(url.toString(), {
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Instagram Graph API error:", res.status, err);
      return NextResponse.json(
        { posts: [], error: "Instagram API error" },
        { status: 200 }
      );
    }

    const data = (await res.json()) as { data?: IgMedia[] };
    const list = data.data ?? [];

    const posts = list
      .filter((m) => m.media_url || m.thumbnail_url)
      .map((m) => ({
        id: m.id,
        imageUrl: m.media_type === "VIDEO" && m.thumbnail_url ? m.thumbnail_url : (m.media_url ?? m.thumbnail_url ?? ""),
        linkUrl: m.permalink ?? `https://instagram.com/p/${m.id}`,
        alt: m.caption ? m.caption.slice(0, 200) : null,
      }))
      .slice(0, 12);

    return NextResponse.json({ posts });
  } catch (e) {
    console.error("Instagram feed fetch failed:", e);
    return NextResponse.json(
      { posts: [], error: "Fetch failed" },
      { status: 200 }
    );
  }
}
