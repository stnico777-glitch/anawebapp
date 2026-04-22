import CommunityAdminClient from "./CommunityAdminClient";

export const metadata = {
  title: "Prayer & Praise · Admin · awake + align",
};

export default function AdminCommunityPage() {
  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]">
          Prayer &amp; Praise
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray md:text-base">
          Moderate the community wall. Posts aren&apos;t loaded automatically — pick a range below to
          pull them in, then delete anything that shouldn&apos;t stay. Deleting a post also removes its
          prays, celebrations, and comments.
        </p>
      </header>
      <CommunityAdminClient />
    </div>
  );
}
