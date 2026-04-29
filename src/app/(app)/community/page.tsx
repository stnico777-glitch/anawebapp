import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import {
  COMMUNITY_VISITOR_COOKIE,
  COMMUNITY_VID_HEADER,
} from "@/lib/community-participant";
import { getCommunityFeed } from "@/lib/community-feed";
import CommunityBloomScrollIsland from "./CommunityBloomScrollIsland";
import PrayerPraiseComposer from "./PrayerPraiseComposer";
import PrayerPraiseFeed from "./PrayerPraiseFeed";

export const dynamic = "force-dynamic";

/** Avoid default name `CommunityPage` — devtools `performance.measure` can throw on that label. */
export default async function PrayerPraiseCommunityRoute() {
  const [session, cookieStore, h] = await Promise.all([auth(), cookies(), headers()]);
  const userId = session?.user?.id ?? null;
  const isSubscriber = session?.user?.isSubscriber ?? false;
  const isAdmin = session?.user?.isAdmin ?? false;
  const isGuest = !userId;
  const locked = isGuest || (!isSubscriber && !isAdmin);
  const visitorId =
    h.get(COMMUNITY_VID_HEADER) ??
    cookieStore.get(COMMUNITY_VISITOR_COOKIE)?.value ??
    null;
  const items = await getCommunityFeed(userId, visitorId);

  const defaultDisplayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0]?.trim() ||
    "";

  return (
    <div className="py-6 md:py-8">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-medium text-foreground [font-family:var(--font-headline),sans-serif]">
            Prayer &amp; Praise
          </h1>
        </header>
      </div>

      <CommunityBloomScrollIsland items={items} locked={locked} isGuest={isGuest} />

      <div className="mx-auto mt-6 max-w-6xl px-4">
        <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
          <PrayerPraiseFeed items={items} locked={locked} isGuest={isGuest} />
        </div>
      </div>

      <PrayerPraiseComposer
        defaultDisplayName={defaultDisplayName || undefined}
        isGuest={isGuest}
        locked={locked}
      />
    </div>
  );
}
