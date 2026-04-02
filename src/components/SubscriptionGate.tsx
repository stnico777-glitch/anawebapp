"use client";

import Link from "next/link";

interface SubscriptionGateProps {
  children: React.ReactNode;
  isSubscriber: boolean;
  title?: string;
}

export default function SubscriptionGate({
  children,
  isSubscriber,
  title = "Subscriber content",
}: SubscriptionGateProps) {
  if (isSubscriber) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-md rounded-sm border border-sand bg-white p-8 text-center shadow-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-sand">
        <svg className="h-6 w-6 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-gray">
        Subscribe to unlock full access to workouts, prayer sessions, prayer journal,
        and prayer & praise.
      </p>
      <Link
        href="/subscribe"
        className="mt-6 inline-block rounded-sm bg-sky-blue px-6 py-3 font-medium text-white transition-colors hover:bg-sky-blue/90"
      >
        View subscription plans
      </Link>
    </div>
  );
}
