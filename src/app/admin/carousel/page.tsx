import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CarouselPostForm from "./CarouselPostForm";

export default async function AdminCarouselPage() {
  const posts = await prisma.carouselPost.findMany({
    orderBy: { sortOrder: "asc", createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            ← CMS Admin
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
            Instagram / Carousel
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Posts shown in the homepage carousel. Use image URL (or path like
            /day-previews/foo.png) and link to Instagram or any URL.
          </p>
        </div>
        <CarouselPostForm />
      </div>
      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-500 dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-400">
            No carousel posts yet. Add one to show on the homepage.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-stone-200 dark:bg-stone-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl.startsWith("http") ? post.imageUrl : post.imageUrl}
                  alt={post.alt || "Post"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                  {post.linkUrl}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Order: {post.sortOrder}
                  {post.alt ? ` · ${post.alt}` : ""}
                </p>
              </div>
              <CarouselPostForm post={post} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
