"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson, readAdminError } from "@/lib/admin-fetch";
import { confirmAdminSave } from "@/lib/admin-confirm-save";
import type { MovementLandingCopyDTO } from "@/lib/movement-layout-types";

const inputClass =
  "mt-1 block w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-foreground focus:border-sky-blue focus:outline-none focus:ring-1 focus:ring-sky-blue [font-family:var(--font-body),sans-serif]";
const labelClass = "block text-sm font-medium text-gray [font-family:var(--font-body),sans-serif]";

export default function MovementLandingCopyForm({
  copy,
  triggerClassName,
  triggerLabel,
}: {
  copy: MovementLandingCopyDTO;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    justStartedTagline: copy.justStartedTagline,
    quickieIntro: copy.quickieIntro,
  });

  useEffect(() => {
    setForm({
      justStartedTagline: copy.justStartedTagline,
      quickieIntro: copy.quickieIntro,
    });
  }, [copy.justStartedTagline, copy.quickieIntro]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmAdminSave("Save movement section copy?")) return;
    setSaving(true);
    try {
      const res = await adminJson("/api/admin/movement-landing-copy", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        alert(await readAdminError(res));
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const defaultTrigger =
    "rounded-md border border-sand bg-white px-3 py-1.5 text-sm font-medium text-gray transition hover:border-sky-blue/50 hover:text-sky-blue [font-family:var(--font-body),sans-serif]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTrigger}
      >
        {triggerLabel ?? "Edit section copy"}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-sand bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] [font-family:var(--font-body),sans-serif]"
          >
            <h2 className="text-lg font-semibold text-foreground [font-family:var(--font-headline),sans-serif]">
              Movement section copy
            </h2>
            <p className="mt-1 text-xs text-gray">
              Text under &quot;Just Getting Started&quot; and the Quickie intro paragraph.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Just Getting Started tagline</label>
                <textarea
                  className={`${inputClass} min-h-[72px] resize-y`}
                  value={form.justStartedTagline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, justStartedTagline: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Quickie intro</label>
                <textarea
                  className={`${inputClass} min-h-[96px] resize-y`}
                  value={form.quickieIntro}
                  onChange={(e) => setForm((f) => ({ ...f, quickieIntro: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-sand bg-white px-4 py-2 text-sm font-medium text-gray hover:bg-sunset-peach/40"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
