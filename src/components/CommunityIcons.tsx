import React from "react";

const iconClass = "h-6 w-6 shrink-0 text-gray";

/** Symmetric heart (Lucide “heart” outline) */
const HEART_PATH =
  "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5";

export function IconPraise() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={HEART_PATH} />
    </svg>
  );
}

export function IconWorkout() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

/** Latin cross — intercession / prayer */
export function IconPrayer({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25v19.5M6.75 8.25h10.5" />
    </svg>
  );
}

/** Heart — care & encouragement (same symmetric shape as IconPraise) */
export function IconEncourage({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={HEART_PATH} />
    </svg>
  );
}

/** Sparkles — rejoicing / celebrating good news (Heroicons outline v2.1.5) */
export function IconCelebrate({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.8132 15.9038L9 18.75L8.1868 15.9038C7.75968 14.4089 6.59112 13.2403 5.09619 12.8132L2.25 12L5.09619 11.1868C6.59113 10.7597 7.75968 9.59112 8.1868 8.09619L9 5.25L9.8132 8.09619C10.2403 9.59113 11.4089 10.7597 12.9038 11.1868L15.75 12L12.9038 12.8132C11.4089 13.2403 10.2403 14.4089 9.8132 15.9038Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.2589 8.71454L18 9.75L17.7411 8.71454C17.4388 7.50533 16.4947 6.56117 15.2855 6.25887L14.25 6L15.2855 5.74113C16.4947 5.43883 17.4388 4.49467 17.7411 3.28546L18 2.25L18.2589 3.28546C18.5612 4.49467 19.5053 5.43883 20.7145 5.74113L21.75 6L20.7145 6.25887C19.5053 6.56117 18.5612 7.50533 18.2589 8.71454Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.8942 20.5673L16.5 21.75L16.1058 20.5673C15.8818 19.8954 15.3546 19.3682 14.6827 19.1442L13.5 18.75L14.6827 18.3558C15.3546 18.1318 15.8818 17.6046 16.1058 16.9327L16.5 15.75L16.8942 16.9327C17.1182 17.6046 17.6454 18.1318 18.3173 18.3558L19.5 18.75L18.3173 19.1442C17.6454 19.3682 17.1182 19.8954 16.8942 20.5673Z"
      />
    </svg>
  );
}

/** Comments — simple speech bubble (reads clearly at action-row size) */
export function IconComment({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
      />
    </svg>
  );
}

export function IconMotivation() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 011.414-1.414L12 8.25l7.5 7.5" />
    </svg>
  );
}

export function IconTestimonies() {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

export function IconPrayerWall() {
  return (
    <svg className="h-7 w-7 shrink-0 text-gray" fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25v19.5M6.75 8.25h10.5" />
    </svg>
  );
}

const GROUP_ICONS: Record<string, () => React.ReactElement> = {
  "praise-reports": IconPraise,
  "workout-recs": IconWorkout,
  "prayer-recs": () => <IconPrayer />,
  motivation: IconMotivation,
  testimonies: IconTestimonies,
};

export function CommunityGroupIcon({ id }: { id: string }) {
  const Icon = GROUP_ICONS[id];
  return Icon ? <Icon /> : null;
}
