# Awake & Align — Web App Development Specification

**Project:** Awake & Align Digital Ecosystem
**Product:** Member Web Application (Post-Login Platform)
**Prepared By:** Dev Studio
**Last Updated:** Feb 2026

---

# 1. Product Overview

The Awake & Align Web App is the browser-based member platform where users access faith + fitness content, follow structured weekly routines, journal, and engage with the community.

This platform must maintain **feature parity** with the mobile applications (iOS + Android) where applicable.

---

# 2. Core Product Objectives

• Deliver structured daily faith + fitness routines
• Encourage consistency via guided schedules
• Provide immersive prayer + workout experiences
• Enable journaling + reflection
• Support community engagement
• Sync subscriptions across all platforms

---

# 3. Authentication & User Access

## 3.1 Login / Account System

**Requirements:**

• Email + password authentication
• Password reset flow
• Secure session handling
• Stripe subscription validation

**Future Considerations (Phase 2):**

• Google login
• Apple login

---

## 3.2 User States

**Non-Subscriber**

• Limited preview access
• Locked content
• Subscription prompts

**Active Subscriber**

• Full content access
• Schedule participation
• Journaling + community enabled

---

# 4. Dashboard / Home (Primary Screen)

The dashboard is the **default landing screen post-login**.

---

## 4.1 Weekly Schedule (Core Feature)

This is the central UX driver of the platform.

**Structure:**

• Monday → Saturday layout
• Sunday excluded (Sabbath)
• Daily routine stack includes:

* Prayer session
* Workout session
* Affirmation / encouragement

---

## 4.2 Functional Requirements

• Clickable daily cards
• Completion tracking
• Locked/unlocked states
• Visual progress indicators

---

## 4.3 Admin Controls

Admin must be able to:

• Create weekly schedules
• Duplicate prior weeks
• Assign content to days
• Update schedules dynamically

---

# 5. Navigation Structure (MVP)

Primary navigation tabs:

1. **Schedule (Home)**
2. **Workouts**
3. **Prayer / Audio**
4. **Journaling**
5. **Community**

Navigation visible globally in logged-in state.

---

# 6. Workouts Module

---

## 6.1 Features

• On-demand video playback
• Program categorization
• Duration labels
• Completion tracking

---

## 6.2 Playback Requirements

• Adaptive streaming
• Mobile responsive player
• Fullscreen support

---

## 6.3 Content Structure

Metadata per workout:

• Title
• Instructor
• Duration
• Category / Program
• Scripture tie-in (optional)

---

# 7. Prayer / Audio Module

---

## 7.1 Features

• Streamable prayer audio
• Scripture-led sessions
• Guided devotionals

---

## 7.2 Playback Capabilities

• Background play (browser permitting)
• Progress tracking
• Completion marking

---

# 8. Journaling Module

---

## 8.1 Core Experience

Private reflection space tied to daily routines.

---

## 8.2 Features

• Daily journal entries
• Calendar view
• Prompt-based writing
• Edit + delete entries

---

## 8.3 Privacy & Security

• Entries private by default
• Secure database storage
• No public visibility unless future feature added

---

# 9. Community Module (Phase 1 Lite)

---

## 9.1 MVP Scope

• Community feed
• User posts
• Comments
• Engagement interactions

---

## 9.2 Phase 2 Expansion

• Private groups
• Direct messaging
• Leaderboards
• Event threads

---

# 10. Completion & Share System

Growth + engagement feature.

---

## 10.1 Triggers

• Workout completion
• Prayer completion
• Schedule day completion

---

## 10.2 Outputs

• Shareable completion cards
• Verse overlays
• Branded graphics

Export + social sharing functionality required.

---

# 11. Content Management System (CMS)

Admin dashboard required to manage platform content.

---

## 11.1 Manageable Content

• Workouts
• Prayer audio
• Weekly schedules
• Journal prompts
• Affirmations

---

## 11.2 CMS Capabilities

• Upload media
• Assign to schedules
• Lock/unlock content
• Edit metadata

---

# 12. Payments & Subscription Sync

---

## 12.1 Provider

Stripe (Web)

---

## 12.2 Capabilities

• Monthly subscriptions
• Annual subscriptions
• Trial support (if enabled)

---

## 12.3 Entitlement System

Backend must:

• Validate active subscriptions
• Gate premium content
• Sync with mobile apps

Single source of truth required.

---

# 13. Integrations

---

## 13.1 CRM Integration

Platforms:

• GoHighLevel
• Klaviyo

Use cases:

• User sync
• Subscription triggers
• Lifecycle automations

---

# 14. Performance Requirements

• Fast dashboard load times
• Video compression optimization
• Lazy loading media
• Mobile responsiveness

---

# 15. Security Considerations

• Encrypted authentication
• Secure journal storage
• Subscription validation checks
• GDPR/CCPA readiness (if needed)

---

# 16. Future Architecture Considerations

System should be scalable to support:

• Mobile app parity
• Push notification sync
• Streak tracking
• Live classes
• Event bookings
• Retreat sales

---

# 17. Immediate Development Priorities

1. Auth + subscription gating
2. Weekly schedule system
3. Video + audio playback
4. Journaling database structure
5. CMS admin panel

---

**End of Web App Spec**

---

# Appendix A: Codebase Architecture & Folder Structure Report

**Report Date:** Feb 2026  
**Scope:** Full codebase audit, .next folder analysis, optimization recommendations

---

## 1. Executive Summary

### Key Findings

| Area | Finding | Verdict |
|------|---------|---------|
| **.next folder** | 702 files, ~16MB. Per-route manifest duplication (5 manifests × ~25 routes). | **Expected behavior** — do not modify |
| **Source structure** | 61 source files, clear App Router layout. | **Good** — minor optimizations possible |
| **Duplicates** | No true duplicate source files. .next "duplicates" are build artifacts. | **No action needed** |

### Bottom Line

The **.next folder is 100% auto-generated** by Next.js/Turbopack. The "duplicate" appearance comes from:
- **Per-route manifest files** (build-manifest.json, app-paths-manifest.json, etc.) — one set per route for isolation
- **required-server-files.js + .json** — different formats (executable vs metadata)
- **trace / trace-build / turbopack** — build trace logs

**Do not edit or delete .next** — it is regenerated on every build and is already in `.gitignore`.

---

## 2. .next Folder Deep Dive

### 2.1 Structure Overview

```
.next/
├── build/                 # 788KB – incremental build cache
├── cache/                 # 152KB – config, RSC info, TS build info
├── diagnostics/           # 8KB – build diagnostics
├── node_modules/          # 0B – symlink/placeholder
├── server/                # 14MB – compiled server bundles
│   ├── app/               # Per-route RSC segments + manifests
│   ├── middleware/
│   └── *.manifest.json
├── static/                # 980KB – client chunks, CSS
├── types/                 # 20KB – generated route types
├── BUILD_ID
├── build-manifest.json
├── fallback-build-manifest.json
├── images-manifest.json
├── package.json           # {"type":"commonjs"} – Next.js generated
├── prerender-manifest.json
├── required-server-files.js    # 12KB – server bootstrap
├── required-server-files.json  # 12KB – file trace metadata
├── routes-manifest.json
├── trace                  # 16KB – build trace
├── trace-build            # 4KB – build trace
└── turbopack              # 0B – Turbopack marker
```

### 2.2 "Duplicate" Patterns Explained

| Pattern | Count | Purpose | Duplicate? |
|---------|-------|---------|------------|
| `build-manifest.json` per route | ~25 | Route-specific chunk mapping | **No** — each route has unique `pages` key; shared polyfills repeated by design |
| `app-paths-manifest.json` per route | ~25 | App Router path metadata | **No** — route-specific |
| `react-loadable-manifest.json` per route | ~25 | Lazy-load manifests | **No** — route-specific |
| `*.js` + `*.js.map` + `*.nft.json` | 37 routes | Source + source map + Node File Trace | **No** — different purposes |
| `required-server-files.js` vs `.json` | 1 each | JS = executable, JSON = metadata | **No** — different formats |

### 2.3 Size Breakdown

| Component | Size | % |
|-----------|------|---|
| server/ | 14MB | 87% |
| static/ | 980KB | 6% |
| build/ | 788KB | 5% |
| cache/ | 152KB | 1% |
| Other | ~100KB | <1% |

**Total:** ~16MB — reasonable for a Next.js 16 App Router app with 25+ routes.

---

## 3. Source Code Structure Map

```
anawebapp/
├── docs/
│   └── markdown.md              # Product spec + this report
├── prisma/
│   ├── schema.prisma            # DB schema
│   ├── seed.ts                  # Seed script
│   └── migrations/              # 5 migrations
├── public/                      # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing (/)
│   │   ├── globals.css
│   │   ├── (auth)/              # Route group: unauthenticated
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (app)/               # Route group: main app (auth required)
│   │   │   ├── layout.tsx       # App shell + nav
│   │   │   ├── schedule/page.tsx
│   │   │   ├── workouts/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx + WorkoutPlayer
│   │   │   ├── prayer/page.tsx + PrayerPlayer
│   │   │   ├── journaling/page.tsx + JournalingClient + JournalEntryForm
│   │   │   ├── community/page.tsx
│   │   │   └── subscribe/page.tsx
│   │   ├── admin/               # Admin CMS (isAdmin required)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── workouts/        # + WorkoutForm
│   │   │   ├── prayer/          # + PrayerForm
│   │   │   ├── schedules/       # + SchedulesClient
│   │   │   └── prompts/         # + PromptForm
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── auth/register/route.ts
│   │       ├── journal/route.ts, [id]/route.ts, prompts/route.ts
│   │       ├── schedule/[dayId]/complete/route.ts
│   │       ├── workouts/[id]/complete/route.ts
│   │       ├── prayer/[id]/complete/route.ts
│   │       └── admin/workouts|prayer|schedules|prompts/...
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── Navigation.tsx
│   │   ├── Providers.tsx
│   │   ├── SubscriptionGate.tsx
│   │   ├── ScheduleDayCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── JournalCalendar.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── admin.ts
│   │   ├── schedule.ts
│   │   └── journal.ts
│   ├── auth.ts                  # NextAuth config (Node)
│   ├── auth-edge.ts             # Edge-compatible auth (middleware)
│   └── middleware.ts
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

### 3.1 Route Summary

| Route | Type | Auth |
|-------|------|------|
| `/` | Landing | Public |
| `/login`, `/register`, `/forgot-password` | Auth | Public |
| `/schedule`, `/workouts`, `/prayer`, `/journaling`, `/community`, `/subscribe` | App | Required |
| `/workouts/[id]` | App | Required |
| `/admin/*` | Admin | Admin only |
| `/api/*` | API | Varies |

---

## 4. Optimization Plan

### 4.1 .next Folder — No Changes

**Recommendation:** Leave `.next` as-is. It is:
- Auto-generated and overwritten on every build
- Correctly gitignored
- Sized appropriately (~16MB)
- Following standard Next.js/Turbopack output structure

### 4.2 Build Performance — Add Caching (Recommended)

Enable build caching to speed up rebuilds:

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbo: {
      // Reduce redundant work
    },
  },
  // Turbopack uses .next/cache by default
};
```

### 4.3 Source Structure — Minor Refinements (Optional)

| Change | Benefit |
|--------|---------|
| Add `src/types/` for shared TS types | Cleaner imports |
| Add `src/constants/` for DAY_NAMES, etc. | Reduce magic strings |
| Consider barrel exports in `lib/` | Shorter import paths |

### 4.4 Recommended .gitignore Additions

Ensure these are excluded (already in place):
- `/.next/` ✓
- `/node_modules/` ✓
- `/.env*` ✓

### 4.5 Implementation Priority

1. **Do nothing to .next** — it is correct
2. **Add build cache config** (if rebuilds are slow)
3. **Extract constants** (low effort, improves maintainability)
4. **Document** that .next is generated (this report)

---

## 5. Conclusion

The project has a **sound folder structure** and the `.next` folder contains **expected build artifacts**, not problematic duplicates. No structural changes to `.next` are recommended. Optional refinements to source organization can improve maintainability without affecting runtime behavior.

---

## 6. Implementation Summary (Completed)

The following optimizations were applied:

| Change | Status |
|--------|--------|
| **Build cache** | `turbopackFileSystemCacheForBuild: true` added to `next.config.ts` — speeds up production rebuilds |
| **Shared constants** | `src/constants/schedule.ts` created with `DAY_NAMES` — single source of truth |
| **Deduplicated logic** | `getMonday` and `DAY_NAMES` now imported from `@/lib/schedule` and `@/constants/schedule` in admin API |
| **.next folder** | No changes — left as auto-generated build output |

### Files Modified
- `next.config.ts` — build cache
- `src/constants/schedule.ts` — new file
- `src/lib/schedule.ts` — import DAY_NAMES
- `src/components/ScheduleDayCard.tsx` — import from constants
- `src/app/admin/schedules/SchedulesClient.tsx` — import from constants
- `src/app/api/admin/schedules/route.ts` — import getMonday + DAY_NAMES

---

# Appendix B: Comprehensive Codebase Deep Dive (Feb 2026)

**Report Date:** Feb 13, 2026  
**Scope:** Full efficiency audit, deduplication, theme consistency, and maintainability improvements

---

## 1. Executive Summary

| Category | Finding | Action Taken |
|----------|---------|--------------|
| **Dead code** | `getMonday` and `formatWeekRange` in landing page unused | Removed from `page.tsx` |
| **Duplication** | `formatWeekRange` defined in both `page.tsx` and `schedule/page.tsx` | Centralized in `lib/schedule.ts` |
| **Seed script** | Duplicate `getMonday` and hardcoded `dayNames` in `prisma/seed.ts` | Import from `lib/schedule` + `constants/schedule` |
| **Theme drift** | VideoPlayer, AudioPlayer used old amber/stone palette | Updated to mood board palette (#F8F4ED, #E8DBCF, #AA9578, etc.) |
| **Dark variants** | AudioPlayer had unused dark: classes | Removed (light theme enforced) |

---

## 2. Key Optimizations Applied

### 2.1 Schedule Logic Deduplication

- **`formatWeekRange`** — Moved to `src/lib/schedule.ts` as shared utility. Single implementation used by schedule page.
- **`getMonday`** — Already in `lib/schedule.ts`; removed duplicate from `prisma/seed.ts`.
- **`DAY_NAMES`** — Seed now imports from `src/constants/schedule.ts` instead of hardcoding.

### 2.2 Landing Page Cleanup

- Removed unused `getMonday` and `formatWeekRange` imports and function from `src/app/page.tsx`.
- Landing page only imports `getCurrentWeekSchedule` and `DAY_NAMES`.

### 2.3 Theme Consistency

- **VideoPlayer** — Updated to mood board palette (gold #AA9578, sand #E8DBCF, dark brown #4A4039). Sharp corners (rounded-sm).
- **AudioPlayer** — Same palette updates; removed dark: variants for light-theme consistency.

### 2.4 Prisma Seed

- Imports `getMonday` from `../src/lib/schedule`.
- Imports `DAY_NAMES` from `../src/constants/schedule`.
- Eliminates ~15 lines of duplicate logic.

---

## 3. Architecture Observations

### 3.1 What's Working Well

| Area | Status |
|------|--------|
| **Route structure** | Clean App Router layout: (auth), (app), admin route groups |
| **Constants** | `DAY_NAMES` centralized; color palette in `globals.css` CSS variables |
| **API validation** | Zod used for schedule complete, register; consistent error responses |
| **Prisma** | Single client instance with dev hot-reload guard; SQLite + better-sqlite3 |
| **Middleware** | Auth middleware protects routes; redirects unauthenticated to /login |
| **Build** | Turbopack build cache enabled; build succeeds |

### 3.2 Color Palette (Mood Board)

| Token | Hex | Usage |
|-------|-----|-------|
| Cream | #F8F4ED | Backgrounds |
| Sand | #E8DBCF | Borders, secondary surfaces |
| Gold | #AA9578 | Accents, CTAs, active states |
| Gold hover | #9A8570 | Button hover |
| Taupe | #7F6B58 | Secondary text |
| Dark brown | #4A4039 | Primary text, headings |
| Muted | #A9B8C3 | Placeholder text |

Defined in `globals.css` as `:root` variables and `@theme inline` for Tailwind.

### 3.3 Remaining dark: Variants

Admin pages and some forms still have `dark:` Tailwind classes. These are inert because `@custom-variant dark` is set to `(&:where([data-theme="dark"]))`, which never matches. Consider a future cleanup pass to remove them for smaller CSS output.

---

## 4. Files Modified (This Audit)

| File | Change |
|------|--------|
| `src/lib/schedule.ts` | Added `formatWeekRange()` |
| `src/app/page.tsx` | Removed unused `getMonday`, `formatWeekRange` |
| `src/app/(app)/schedule/page.tsx` | Import `formatWeekRange` from lib |
| `prisma/seed.ts` | Import `getMonday`, `DAY_NAMES`; remove local duplicates |
| `src/components/VideoPlayer.tsx` | Theme colors, sharp corners |
| `src/components/AudioPlayer.tsx` | Theme colors, remove dark variants |

---

## 5. Recommendations for Future

1. **Color utilities** — Replace inline hex (e.g. `bg-[#F8F4ED]`) with Tailwind theme classes (`bg-cream`) where `@theme` defines `--color-cream`. Would simplify theme changes.
2. **DayPreviewCard component** — Landing page schedule/fallback cards are nearly identical; could extract to reduce duplication.
3. **Middleware deprecation** — Next.js 16 warns about middleware → proxy migration; plan for future upgrade.
4. **Admin theme** — Admin pages still use old stone/amber; consider applying mood board palette for consistency.

---

**End of Appendix B**

---

# Appendix C: Product Vision & Brain Dump (Voice Memo — Feb 2026)

**Source:** Voice memo / AI transcript from team (post–Cat brain dump)  
**Context:** Clarifications for Nico on branding, libraries, tabs, push notifications, community, and journal. Not all items need to be decided by Thursday or the next couple weeks—vision for alignment and timelines.

---

## 1. Branding & Visuals (Cat’s Direction)

- **No solid color backgrounds** on the upper web. Cat does not want backgrounds to be “just blue or yellow” or flat color.
- **Backgrounds must be actual visuals:** videos or photos (e.g. clouds, light, etc.).
- **Hex codes / brand colors** are still useful for:
  - **Readability:** shapes (squares, circles) behind text.
- So: background of the site or any background image should never be a single brand color; use real media. Use brand colors for UI elements and text-backing shapes only.

---

## 2. Movement Library (Future Vision)

- **Isolate by workout type**, e.g.:
  - Arms & abs  
  - Full body  
  - Legs  
  - Booty  
  - (etc.)
- **Eventually:** isolate by **skill level** (e.g. Beginner / Advanced) — a filter or tab.
- Build out with this structure in mind so filtering by type and level can be added later.

---

## 3. Audio Library (Future Vision)

- **Three categories** (tabs or filters when you click Audio Library):
  - **Affirmations**
  - **Meditations**
  - **Scripture**
- Web may want more specific audio tabs later; that’s a bigger conversation once the library is more filled out.

---

## 4. App vs Web — Tab Structure

| Platform | Tabs (as of now) |
|----------|-------------------|
| **App**  | Movement · Audio · Journal · Community |
| **Web**  | Movement · Prayer and Meditation · Journal · Community |

- Main difference: on **web**, audio is presented as **Prayer and Meditation** (may be more specific later).
- App uses **Audio** with sub-options (affirmations, meditations, scripture) as above.

---

## 5. Push Notifications (App)

- Cat wants to **get really locked in** on push notifications and has a lot of vision for them.
- **Ask for Thursday:** bring a **general summary of what’s feasible** — ideas, but also **timeline**:  
  - Is it one of the last things we do, or something we start setting up at the beginning?
- This needs to be scoped and sequenced with the rest of the roadmap.

---

## 6. Community Tab — Vision

- **Not traditional chat**, but **distinct spaces** (like themed “rooms”) for different kinds of conversation.
- Examples of spaces:
  - **Let’s pray together**
  - **Let’s praise together**
  - **Let’s celebrate together**
- Use case: e.g. one person posts “celebrating 5 years sober,” another posts “really hard day, my mom just got diagnosed with cancer” — so the product creates **separate spaces** for celebration vs. heavy/prayer needs vs. praise.
- **Needs more thawing out** — but this is the direction for the community tab.

---

## 7. Journal Tab — Prayer List & Monthly Recap

- **Daily prayer list (editable set list):**
  - User has a **reusable list** of things they pray for (e.g. family, job, coworker, someone’s salvation).
  - User can **edit this list anytime**.
  - **Each day:** user can also **add something specific** they want to pray about.
  - Avoids writing the same list out every day.
- **Monthly recap (email or in-app):**
  - Sent at end of month.
  - Highlights things like: “You prayed 40 times this month,” “You said X was your prayer but moved it to praise — we’re praising God for XYZ.”
  - Requires **backend logic / algorithms** to track prayer vs. praise and generate the recap.
- **Answered prayers / praise reports:**
  - A **dedicated area** in the app where the user can **go back and see all answered prayers and praise reports** they’ve recorded.
- These features are a mix of product design and backend; start thinking about data model and algorithms as the journal is built out.

---

## 8. Summary for Nico

- Use this as **vision and clarity** for the broader product and timelines.
- **Not everything** has to be decided or figured out by Thursday or the next couple weeks.
- **Request:** If you have opportunities, thoughts, suggestions, or realities (e.g. feasibility, sequencing), share them so the team can support and get ahead of it.

---

**End of Appendix C**

---

# Next Steps Report (Feb 2026)

**Purpose:** Recommended actions after incorporating the voice-memo brain dump (Appendix C) and existing spec. Prioritized for clarity, feasibility, and Thursday readiness.

---

## 1. For Thursday (Meeting Prep)

| Action | Owner | Notes |
|--------|--------|--------|
| **Push notifications — feasibility summary** | Nico / dev | One-pager: what’s feasible (platform limits, UX), whether to set up infra early vs. do it late, rough timeline. Cat wants to “get really locked in” on this. |
| **Hex codes + branding** | Cat / design | Get final hex codes and any brand guidelines so web can use them for readability shapes (squares/circles behind text) and avoid using them as full backgrounds. |
| **Background visuals** | Design / Nico | Confirm: all upper-web backgrounds are videos/photos (clouds, light, etc.), not solid colors. Plan asset pipeline if not already in place. |

---

## 2. Product / Design (Near Term)

| Area | Recommendation |
|------|----------------|
| **Community spaces** | Thaw out “rooms” (Pray together, Praise together, Celebrate together): define names, purpose of each, and whether they’re filters vs. separate feeds vs. channels. Then align with app if applicable. |
| **Web vs app audio** | Decide how “Prayer and Meditation” on web maps to Affirmations / Meditations / Scripture; document so web and app stay aligned as audio library grows. |
| **Journal data model** | Design schema for: (1) editable daily prayer list, (2) “something specific today,” (3) prayer vs. praise state, (4) monthly recap inputs. Enables backend and monthly recap later. |

---

## 3. Development Priorities (Aligned with Spec + Brain Dump)

| Priority | What | Why |
|----------|------|-----|
| 1 | **Auth + subscription gating** | Unchanged; foundation for everything. |
| 2 | **Weekly schedule system** | Unchanged; core UX. |
| 3 | **Video + audio playback** | Unchanged. When building library UIs, add **movement categories** (arms/abs, full body, legs, booty) and **audio categories** (affirmations, meditations, scripture) in metadata/CMS so filtering can be added later. |
| 4 | **Journal DB + prayer list** | Extend journal spec with reusable prayer list, daily override, and “prayer vs. praise” so monthly recap and “answered prayers” view are feasible. |
| 5 | **Backgrounds = visuals** | Ensure dashboard and key web screens use video/photo backgrounds (or placeholders) and use brand colors only for UI and text-backing shapes. |
| 6 | **CMS** | Admin for workouts (with type + later skill level), audio (with category), schedules, journal prompts. |
| 7 | **Community (Phase 1)** | Feed + posts + comments first; introduce “spaces” (pray/praise/celebrate) in Phase 2 once defined. |
| 8 | **Push notifications** | After Thursday: decide “early infra vs. last” and add to roadmap with clear milestones. |

---

## 4. Backend / Algorithms (Plan Ahead)

- **Monthly recap:** Logic to count prayers, detect “moved to praise,” and generate recap copy (e.g. “You prayed 40 times… we’re praising God for XYZ”). Depends on journal + prayer-list schema.
- **Answered prayers / praise reports:** Stored entries that can be listed and filtered (e.g. “see all my answered prayers”). Needs model and API for “praise report” or “answered prayer” as a first-class type.

---

## 5. What to Defer

- **Movement skill level (beginner/advanced):** After workout type is in place; add as filter/tab when content and taxonomy are ready.
- **Final community “rooms” UX:** Until product thaws out spaces and naming.
- **Heavy push notification implementation:** Until feasibility and sequencing are agreed on Thursday.

---

## 6. Summary

- **Markdown is updated** with the voice-memo content in Appendix C.
- **Thursday:** Bring push-notification feasibility + timeline; confirm hex codes and background-visuals direction.
- **Build:** Keep current priorities; extend journal for prayer list and praise; use real visuals for backgrounds; add movement/audio categories in CMS for future filtering.
- **Product:** Nail community spaces and web/app audio naming so dev can implement without rework.

---

**End of Next Steps Report**
