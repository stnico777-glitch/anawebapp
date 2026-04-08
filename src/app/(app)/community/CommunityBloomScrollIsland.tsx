"use client";

import dynamic from "next/dynamic";
import type { CommunityFeedItem } from "@/lib/community-feed";

const CommunityBulletinBanner = dynamic(() => import("./CommunityBulletinBanner"), {
  ssr: false,
  loading: () => (
    <div
      className="mb-8 min-h-[200px] w-full border-y border-[#C4B49A] bg-[#C9B896]/80"
      aria-busy
      aria-label="Loading community highlights"
    />
  ),
});

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
