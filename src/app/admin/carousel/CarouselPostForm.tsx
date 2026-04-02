"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CarouselPost {
  id: string;
  imageUrl: string;
  linkUrl: string;
  alt: string | null;
  sortOrder: number;
}

export default function CarouselPostForm({ post }: { post?: CarouselPost }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    imageUrl: post?.imageUrl ?? "",
    linkUrl: post?.linkUrl ?? "https://instagram.com/awakeandalign_",
    alt: post?.alt ?? "",
    sortOrder: post?.sortOrder ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = post
        ? `/api/admin/carousel/${post.id}`
        : "/api/admin/carousel";
      const method = post ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          alt: form.alt || undefined,
          sortOrder: parseInt(String(form.sortOrder), 10) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post || !confirm("Remove this post from the carousel?")) return;
    const res = await fetch(`/api/admin/carousel/${post.id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      >
        {post ? "Edit" : "Add post"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-stone-900">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {post ? "Edit carousel post" : "Add carousel post"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  placeholder="https://... or /day-previews/foo.png"
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Link URL *
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkUrl: e.target.value }))
                  }
                  placeholder="https://instagram.com/..."
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Alt text (optional)
                </label>
                <input
                  type="text"
                  value={form.alt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, alt: e.target.value }))
                  }
                  placeholder="Describe the image for accessibility"
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Order
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : post ? "Save" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                {post && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="ml-auto rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
