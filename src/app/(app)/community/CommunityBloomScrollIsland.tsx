"use client";

import type { CommunityFeedItem } from "@/lib/community-feed";
import CommunityBulletinBanner from "./CommunityBulletinBanner";

export default function CommunityBloomScrollIsland({
  items,
  locked = false,
  isGuest = false,
}: {
  items: CommunityFeedItem[];
  locked?: boolean;
  isGuest?: boolean;
}) {
  return (
    <CommunityBulletinBanner items={items} locked={locked} isGuest={isGuest} />
  );
}
