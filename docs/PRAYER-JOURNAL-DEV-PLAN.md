# Dev plan: Prayer journal & daily scripture (Journal tab + home flow)

**Product north star:** A *prayer-first* journal experience (inspired by [5-Minute Journal](https://www.intelligentchange.com/products/the-five-minute-journal-app) patterns: quick entries, photos, reminders, easy sharing), separate from open-ended “general” journaling. Scripture on the home path nudges users *prayer → scripture → workout* without feeling heavy.

**Current codebase anchor:** `/journaling` is prompt-based daily entries (`JournalEntry`, one entry per user per `entryDate`). Community already has prayer requests / praise. This plan either **evolves** that route into prayer-journal-first or **splits** routes (see Phase 0).

---

## Phase 0 — Product & IA decisions (short, blocking)

| Decision | Options | Notes |
|----------|---------|--------|
| Tab scope | Rename/refocus “Journal” vs split “Prayer journal” + hide general journal | Align nav copy with Kat’s “prayer @ 10:53” focus. |
| Data model | Extend `JournalEntry` vs new `PrayerJournalEntry` | Extension risks conflating types; new model is clearer if general journal stays. |
| Sharing | Deep link only vs image card (OG/social) vs export-to-instagram story size | Drives engineering (CDN, templates, `next/og` or client canvas). |
| Reminders | Email vs push (PWA) vs calendar export | Push may be out of scope v1; start with in-app + optional email. |

**Exit criteria:** Chosen path for model + URL (`/journaling` vs `/prayer-journal`) and v1 sharing format.

---

## Phase 1 — Prayer journal MVP (Journal tab)

**User stories**

1. Log a prayer (text) with optional **intention tags** (person, topic) and **status**: active / answered / paused.
2. Attach **optional photo(s)** per entry (storage: align with existing upload pattern or new S3/blob; validate size/type).
3. **Reminders:** “remind me to pray for X” on a schedule (daily/weekly/custom); surface in-app list + email if enabled.
4. **Answered prayers:** toggle or flow to mark answered + optional reflection note; filter/list “answered” for encouragement.
5. **Share (optional):** share as link or graphic; optional handoff to **community prayer wall** (reuse `PrayerRequest` flows where it fits policy).

**Technical sketch**

- **Schema:** e.g. `PrayerJournalEntry` with `userId`, `title`/`body`, `photos` (JSON array of URLs or related `PrayerJournalPhoto` rows), `reminderRule` (or separate `PrayerReminder` table), `status`, `answeredAt`, `sharedToCommunityId` nullable FK, timestamps.
- **API:** CRUD + list with filters (active/answered/date).
- **UI:** List + detail; “5-Minute” style quick capture (minimal fields first tap; expand for photo/reminder).
- **Admin (if needed):** moderation hooks if public/community-linked content grows.

**Exit criteria:** Subscribers can create entries, photos, reminders, mark answered; data persists and is scoped per user.

---

## Phase 2 — Daily verse on home screen flow

**User stories**

1. Home (or post-login landing) shows **verse/reference + short reading** for “today.”
2. Actions: **Read** (expand), **Share** (same pipeline as prayer share), dismiss/continue.
3. **Placement:** Before workout CTA so narrative is *scripture → workout* or *scripture → prayer nudge → workout* depending on final storyboard.

**Technical sketch**

- **Content source:** Admin-managed table `DailyVerse` (date, reference, text, translation) or static JSON seeded by admin UI.
- **API:** `GET /api/daily-verse?date=YYYY-MM-DD` (TZ: user or America/* as product decides).
- **UI:** Small card on `page.tsx` (or schedule first screen) with share affordance.

**Exit criteria:** Verse changes daily; share produces a coherent preview or image.

---

## Phase 3 — Flow polish & “not overwhelming”

- **Progressive disclosure:** One primary action per screen; advanced options behind “Add photo” / “Set reminder.”
- **Cross-links:** From verse → “Pray this” opens pre-filled journal entry; from journal → today’s schedule/workout.
- **Empty states:** Short, warm copy; single CTA.
- **Accessibility:** Alt text for images; reminder UX without relying on color alone for status.

**Exit criteria:** Lightweight first-run path tested with 3–5 tasks (log prayer, see verse, start workout) without dead ends.

---

## Phase 4 — Growth / evangelism (organic)

- **Share surfaces:** Verse card + answered-prayer milestone + “prayer request” card (with branding watermark optional).
- **Attribution:** UTM or short links for shared URLs; avoid PII in default share text.
- **Policy:** What’s public vs link-only vs private; align with community guidelines.

**Exit criteria:** Shared links load a branded landing or open app with context; analytics event fired (privacy-preserving).

---

## Dependencies & risks

- **Storage & cost** for user photos.
- **Reminder delivery** reliability (email provider, spam).
- **Timezone** for “verse of the day” and daily journal date (already sensitive in `JournalEntry`).
- **Overlap with community:** Clarify when a journal entry becomes a `PrayerRequest` vs stays private.

---

## Suggested build order

1. Phase 0 decisions + schema migration(s).  
2. Phase 1 backend + minimal UI on Journal tab.  
3. Phase 2 verse endpoint + home card.  
4. Phase 3 linking & simplification.  
5. Phase 4 share templates + landing/analytics.

---

## Reference

- **Structure analog:** **5-Minute Journal app** — photos, reminders, share-friendly, low-friction entries (per meeting notes @ ~25:42 scripture/sharing; prayer focus @ ~10:53).
