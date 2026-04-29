import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import SubmitFeedbackCard from "./SubmitFeedbackCard";
import KatLetterDetails from "./KatLetterDetails";

export const metadata: Metadata = {
  title: "More | awake + align",
  description:
    "FAQs, ways to connect, ambassador info, the Awake & Align book, and meet founder Kathryn Jackson.",
};

const CARD_SHELL =
  "rounded-none border border-sand bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] [font-family:var(--font-body),sans-serif]";

const DETAILS_CLASS =
  "group border-b border-sand py-4 first:pt-0 last:border-b-0 [font-family:var(--font-body),sans-serif]";

/** Italic scripture quote shown beneath a FAQ answer. Sky-blue accent rule on the left ties
 *  the verse styling into the rest of the page palette without competing with the answer copy. */
function Verse({ children, reference }: { children: ReactNode; reference: string }) {
  return (
    <blockquote className="mt-3 border-l-2 border-sky-blue/50 pl-3 text-sm italic leading-relaxed text-gray/90 [font-family:var(--font-body),sans-serif]">
      &ldquo;{children}&rdquo;{" "}
      <span className="not-italic text-gray/70">— {reference}</span>
    </blockquote>
  );
}

const faqItems: { q: string; a: ReactNode }[] = [
  {
    q: "How do I get the most out of this membership?",
    a: (
      <>
        <p>
          Show up daily, stay on track with the schedule. The schedule is designed for you to grow optimally
          both spiritually and physically in under 30 min a day.
        </p>
        <Verse reference="James 4:8">Draw near to God, and He will draw near to you.</Verse>
      </>
    ),
  },
  {
    q: "Why Pilates?",
    a: (
      <>
        <p>
          Pilates helps you move with intention, build strength, and honor your body, without any spiritual
          roots like yoga. Here, we simply pair movement with Jesus.
        </p>
        <Verse reference="1 Corinthians 6:19">Your body is a temple of the Holy Spirit&hellip;</Verse>
      </>
    ),
  },
  {
    q: "Why is there no workout on Sunday?",
    a: (
      <>
        <p>Sunday is a Sabbath rhythm, a day to rest, worship, and be still with God.</p>
        <Verse reference="Genesis 2:3">Then God blessed the seventh day and made it holy.</Verse>
      </>
    ),
  },
  {
    q: "I’m new here. How do I start?",
    a: "Start with the Beginner Week to learn breath and foundational Pilates movements. Then build consistency by following the daily rhythm of movement, scripture, and prayer.",
  },
  {
    q: "Props or no props?",
    a: "Props are optional but can help deepen your workout when used. Most sessions are designed with just your bodyweight and a mat.",
  },
  {
    q: "What is Awake & Align?",
    a: "A consistent way to seek the Lord daily, blending movement, prayer, and scripture into an achievable routine in under 30 min a day. Everything you need to grow as a confident daughter of Christ.",
  },
  {
    q: "How does my subscription work?",
    a: "Members get full access to the weekly schedule, movement library, prayer audio, prayer journal, and Prayer & Praise. Start with a 7-day free trial from the homepage, then choose the plan that fits you.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes—every new member gets a 7-day free trial to explore the full experience. No hidden charges; you can cancel anytime before the trial ends and you won't be billed.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Open your account settings, tap Subscription, and select Cancel. You'll keep full access through the end of your current billing period, then the account shifts to a free preview with limited content.",
  },
  {
    q: "Do I need any special equipment?",
    a: "Props are optional, but helpful for added resistance. Most workouts only require your bodyweight and a mat.",
  },
  {
    q: "Are the workouts beginner-friendly?",
    a: "Yes, every session includes modifications you can follow at your own pace. You can always return to the Beginner Week to build confidence.",
  },
  {
    q: "Can I use the app on more than one device?",
    a: "Yes. Sign in with the same account on phone, tablet, or desktop—your progress, journal, and favorites stay with you.",
  },
  {
    q: "Is there a mobile app?",
    a: "Our iOS and Android apps use the same account as the website. Sign in once and everything syncs—workouts watched, prayers completed, journal entries, all of it.",
  },
  {
    q: "How often is new content added?",
    a: "New encouragement videos each week alongside the schedule, and we refresh the movement and prayer audio libraries throughout the year. Follow @awakeandalign_ for drop announcements.",
  },
  {
    q: "Where do I go for prayer and encouragement?",
    a: "Use the Community tab to share prayer requests and celebrate answered prayers. Your private Prayer Journal is always available for personal time with God.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: "On the sign-in screen tap Forgot password and we'll email you a reset link. If it doesn't arrive, check spam and then reach out through Contact so we can help directly.",
  },
  {
    q: "Who can I contact for help?",
    a: (
      <>
        For support, email{" "}
        <a
          href="mailto:kat@awakeandalign.fit"
          className="font-medium text-sky-blue underline-offset-4 hover:underline"
        >
          kat@awakeandalign.fit
        </a>{" "}
        and we will get back to you. We look at all messages!
      </>
    ),
  },
];

export default async function MorePage() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin === true;
  const isGuest = !session?.user?.id;

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
        {isAdmin ? (
          <aside
            className="mb-8 rounded-lg border border-amber-200 bg-amber-50/90 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 md:mb-10 md:p-5"
            aria-label="Content management"
          >
            <p className="text-sm font-semibold text-amber-950 dark:text-amber-100 [font-family:var(--font-headline),sans-serif]">
              Master account — edit content
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-950/85 dark:text-amber-100/85 [font-family:var(--font-body),sans-serif]">
              Open the CMS to manage the weekly schedule (dates, images, prayer & movement), movement library, prayer
              audio, and verse of the day. You’ll also see <strong className="font-semibold">CMS</strong>{" "}
              in the top navigation.
            </p>
            <Link
              href="/admin"
              className="mt-3 inline-flex rounded-md bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              Open CMS →
            </Link>
          </aside>
        ) : null}
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-gray [font-family:var(--font-body),sans-serif] md:mb-4 md:text-base">
          Everything else you might need—questions, community, the book, and the heart behind the Movement.
        </p>
        <p className="mb-10 text-xs lowercase tracking-[0.14em] text-gray/90 [font-family:var(--font-body),sans-serif] md:mb-12 md:text-[0.8125rem]">
          discover · connect · grow
        </p>

        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl [font-family:var(--font-headline),sans-serif]">
            More
          </h1>
        </header>

        {/* Thematic strip — wide Submit feedback banner; opens a feature-request modal. */}
        <div className="mb-10 md:mb-12">
          <SubmitFeedbackCard isGuest={isGuest} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <section className={`${CARD_SHELL} lg:col-span-2`} aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-lg font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]"
            >
              Frequently asked questions
            </h2>
            <div className="mt-2">
              {faqItems.map(({ q, a }) => (
                <details key={q} className={DETAILS_CLASS}>
                  <summary className="cursor-pointer list-none pr-2 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden [&::after]:float-right [&::after]:text-sky-blue [&::after]:content-['+'] group-open:[&::after]:content-['−']">
                    {q}
                  </summary>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray">{a}</div>
                </details>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-8">
            <section className={CARD_SHELL} aria-labelledby="connect-heading">
              <h2
                id="connect-heading"
                className="text-lg font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]"
              >
                How to get connected
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray">
                <li className="flex gap-2">
                  <span className="text-sky-blue" aria-hidden>
                    ·
                  </span>
                  <span>
                    <Link
                      href="/community"
                      prefetch={false}
                      className="font-medium text-foreground underline-offset-4 hover:text-sky-blue hover:underline"
                    >
                      Prayer & Praise
                    </Link>{" "}
                    — share requests and celebrations with the community.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-blue" aria-hidden>
                    ·
                  </span>
                  <span>
                    <a
                      href="https://instagram.com/awakeandalign_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground underline-offset-4 hover:text-sky-blue hover:underline"
                    >
                      Instagram @awakeandalign_
                    </a>{" "}
                    — daily encouragement and behind-the-scenes.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-blue" aria-hidden>
                    ·
                  </span>
                  <span>
                    Join the email list from the footer for letters from the team—we don’t flood your inbox.
                  </span>
                </li>
              </ul>
            </section>

            <section className={CARD_SHELL} aria-labelledby="ambassador-heading">
              <h2
                id="ambassador-heading"
                className="text-lg font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]"
              >
                Become an ambassador
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray">
                If you love sharing awake + align with your church, studio, or friend group, we’d love to hear from you.
                Ambassadors help others find rhythm and rest—and get early access to new content and perks as we grow.
              </p>
              <a
                href="https://instagram.com/awakeandalign_"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-sky-blue underline-offset-4 hover:underline"
              >
                Message us on Instagram to start the conversation →
              </a>
            </section>
          </div>
        </div>

        <section
          className={`${CARD_SHELL} mt-10 max-w-md border-t-2 border-t-accent-amber/50 lg:mt-12`}
          aria-labelledby="book-heading"
        >
          <h2
            id="book-heading"
            className="text-lg font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]"
          >
            The Awake &amp; Align book
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray">
            Go deeper with the book—story, Scripture, and the same gentle discipline you practice in the app. Perfect
            for your nightstand or small group.
          </p>
          <p className="mt-3 text-sm text-gray">
            Ask for the purchase link on{" "}
            <a
              href="https://instagram.com/awakeandalign_"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-blue underline-offset-4 hover:underline"
            >
              Instagram
            </a>{" "}
            or via{" "}
            <Link href="/contact" className="font-medium text-sky-blue underline-offset-4 hover:underline">
              Contact
            </Link>
            — we&rsquo;ll point you to the right edition.
          </p>
        </section>

        <div className="mt-8 md:mt-10">
          <section
            className={`${CARD_SHELL} relative overflow-hidden border-t-2 border-t-sky-blue/50`}
            aria-labelledby="founder-heading"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pastel-blue-light/80 blur-2xl"
              aria-hidden
            />
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-gray/80 [font-family:var(--font-body),sans-serif]">
                Meet the founder
              </p>
              <h2
                id="founder-heading"
                className="mt-1 text-xl font-semibold tracking-tight text-foreground md:text-2xl [font-family:var(--font-headline),sans-serif]"
              >
                Kathryn Jackson
              </h2>
            </div>
            <div className="mx-auto mt-6 grid max-w-[520px] grid-cols-2 gap-5 md:gap-6">
              {/* Gallery-mat frame — warm cream matte + amber hairline + amber-tinted
                  soft shadow. Picks up the `accent-amber` tokens used by the daily
                  verse card so this section sits in the same visual family.
                  Subtle lift + stronger glow on hover to invite interaction. */}
              <figure className="group relative rounded-sm bg-background p-2.5 shadow-[0_4px_18px_rgba(238,169,104,0.18)] ring-1 ring-accent-amber/35 transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_8px_24px_rgba(238,169,104,0.26)] motion-reduce:transition-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-sand ring-1 ring-accent-amber/20">
                  <Image
                    src="/founder-kat.png"
                    alt="Kathryn Jackson, founder of awake + align"
                    fill
                    sizes="(max-width: 640px) 44vw, 260px"
                    className="object-cover object-center"
                    priority={false}
                  />
                </div>
              </figure>
              <figure className="group relative rounded-sm bg-background p-2.5 shadow-[0_4px_18px_rgba(238,169,104,0.18)] ring-1 ring-accent-amber/35 transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_8px_24px_rgba(238,169,104,0.26)] motion-reduce:transition-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-sand ring-1 ring-accent-amber/20">
                  <Image
                    src="/founder-kat-2-v2.png"
                    alt="Kathryn Jackson on a yoga mat with wrist weights"
                    fill
                    sizes="(max-width: 640px) 44vw, 260px"
                    className="object-cover object-center"
                    priority={false}
                  />
                </div>
              </figure>
            </div>

            {/* Thin amber divider ties this block back to the brand palette. */}
            <div
              className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-accent-amber/60 to-transparent"
              aria-hidden
            />

            <p className="mx-auto mt-4 max-w-xl text-center text-sm italic leading-relaxed text-gray [font-family:var(--font-body),sans-serif]">
              A personal letter from Kat — how awake + align started, the shift that built it, and the prayer behind
              every session.
            </p>

            <KatLetterDetails />
          </section>
        </div>
      </div>
    </div>
  );
}
