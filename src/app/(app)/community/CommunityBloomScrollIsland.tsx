"use client";

import type { CommunityFeedItem } from "@/lib/community-feed";
import CommunityBulletinBanner from "./CommunityBulletinBanner";

export default function CommunityBloomScrollIsland({
  items,
  defaultCommentName,
}: {
  items: CommunityFeedItem[];
  defaultCommentName?: string;
}) {
  return (
    <CommunityBulletinBanner items={items} defaultCommentName={defaultCommentName} />
  );
}
