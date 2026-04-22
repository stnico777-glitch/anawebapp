import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import SubmitFeedbackCard from "./SubmitFeedbackCard";

export const metadata: Metadata = {
  title: "More | awake + align",
  description:
    "FAQs, ways to connect, ambassador info, the Awake & Align book, and meet founder Kat Jackson.",
};

const CARD_SHELL =
  "rounded-none border border-sand bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] [font-family:var(--font-body),sans-serif]";

const DETAILS_CLASS =
  "group border-b border-sand py-4 first:pt-0 last:border-b-0 [font-family:var(--font-body),sans-serif]";

const faqItems: { q: string; a: string }[] = [
  {
    q: "What is awake + align?",
    a: "A faith-forward rhythm for your week—prayer, movement, and rest—with audio, guided sessions, and community so you can remember, return, and rejoice.",
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
    q: "Do I need any special equipment for the movement sessions?",
    a: "Not at all. Most sessions use only a mat and bodyweight. A few optional add-ons (light weights, resistance band, a small pilates ball) are mentioned when useful but never required.",
  },
  {
    q: "Are the workouts beginner-friendly?",
    a: "Yes. Every session has modification cues, and the library is tagged by intensity so you can choose a gentle recovery flow or a stronger strength day. If something feels too much, swap to an easier day on the schedule.",
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
    a: "Open Prayer & Praise from the nav to share requests and celebrate answered prayer with the community. Your private prayer journal lives under Prayer journal.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: "On the sign-in screen tap Forgot password and we'll email you a reset link. If it doesn't arrive, check spam and then reach out through Contact so we can help directly.",
  },
  {
    q: "Who can I contact for help?",
    a: "Use the Submit feedback tile above, the Contact link in the site footer, or message us on Instagram @awakeandalign_—we read every note.",
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
                  <p className="mt-3 text-sm leading-relaxed text-gray">{a}</p>
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
                Kat Jackson
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
                    alt="Kat Jackson, founder of awake + align"
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
                    alt="Kat Jackson on a yoga mat with wrist weights"
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

            {/* Collapsed by default. Sky-blue summary matches the FAQ toggle + general accent.
                `group-open:*` swaps label + chevron direction when expanded. */}
            <details className="group mt-4 text-center [font-family:var(--font-body),sans-serif]">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-sky-blue/30 bg-white px-4 py-2 text-sm font-semibold text-sky-blue shadow-[0_1px_2px_rgba(120,130,135,0.06)] transition hover:border-sky-blue/50 hover:bg-sky-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden marker:content-none">
                <span className="group-open:hidden">Read Kat&rsquo;s letter</span>
                <span className="hidden group-open:inline">Hide letter</span>
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="mx-auto mt-6 max-w-2xl space-y-3 text-left text-sm leading-relaxed text-gray motion-safe:animate-[fade-in-up_220ms_ease-out_both] motion-reduce:animate-none">
                <p>
                  I created Awake + Align out of obedience in my heart to help women grow closer to God—both
                  spiritually and physically.
                </p>
                <p>
                  I grew up as a Christian, and Jesus and movement have always been central to my life. After moving
                  to Miami, I found myself getting caught up in the pull of the world and drifting from what I knew
                  was true. When Jesus restored my life, everything shifted.
                </p>
                <p>
                  From that moment, I made it my mission to create spaces where women could encounter God through
                  movement, worship, and community. I started in Miami hosting packed rooftop events with hundreds
                  of girls and quickly realized this wasn&rsquo;t just needed in person, but online as well.
                </p>
                <p>
                  As I stepped into Pilates and movement culture, I noticed much of it leaned into New Age
                  practices—meditations focused on the universe instead of Jesus, the true source of transformation
                  in my life and the foundation of everything I now build my life on.
                </p>
                <p>
                  After rededicating my life to Christ, I fully surrendered every area of my life to Jesus. As I
                  replaced old habits with worship, prayer, and intentional rhythm, I began to see my body and life
                  differently and learned to love my vessel the way God created it.
                </p>
                <p>
                  This app was created to help women find wholeness and confidence in their God-given identity. It
                  takes the guesswork out of searching everywhere and gives practical, faith-based tools in one
                  place. Through daily verses, movement, and scripture-based meditations, it helps you build a
                  consistent rhythm—physically and spiritually—and pour into every area of your life.
                </p>
                <p>
                  I love you and I pray over you and this community daily. My hope is that this app helps you
                  understand and embody power, love, and a sound mind. (2 Timothy 1:7)
                </p>
                <p className="pt-2 text-center text-base italic text-foreground [font-family:var(--font-headline),sans-serif]">
                  Love, Kat
                </p>
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
}
