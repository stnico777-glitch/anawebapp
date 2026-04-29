"use client";

import type { CommunityFeedItem } from "@/lib/community-feed";
import CommunityBulletinBanner from "./CommunityBulletinBanner";

export default function CommunityBloomScrollIsland({
  items,
  defaultCommentName,
  locked = false,
  isGuest = false,
}: {
  items: CommunityFeedItem[];
  defaultCommentName?: string;
  locked?: boolean;
  isGuest?: boolean;
}) {
  return (
    <CommunityBulletinBanner
      items={items}
      defaultCommentName={defaultCommentName}
      locked={locked}
      isGuest={isGuest}
    />
  );
}
