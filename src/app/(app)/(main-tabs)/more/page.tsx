import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  DAY_CARD_IMAGE_HOVER,
  DAY_CARD_SHELL_HOVER,
  SABBATH_CARD_SHADOW_RING,
  SABBATH_CARD_SUBTITLE_CLASS,
  SABBATH_CARD_TITLE_CLASS,
} from "@/constants/dayCardVisual";

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
    a: "A faith-forward rhythm for your week—prayer, movement, and rest—with audio, workouts, and community so you can remember, return, and rejoice.",
  },
  {
    q: "How does my subscription work?",
    a: "Members get full access to the weekly schedule, workout library, prayer audio, prayer journal, and Prayer & Praise. Start with a free trial from the homepage, then choose the plan that fits you.",
  },
  {
    q: "Can I use the app on more than one device?",
    a: "Yes. Sign in with the same account on phone, tablet, or desktop—your progress and journal stay with you.",
  },
  {
    q: "Where do I go for prayer and encouragement?",
    a: "Open Prayer & Praise from the nav to share requests and praise. Your private prayer journal lives under Prayer journal.",
  },
  {
    q: "Who can I contact for help?",
    a: "Use Contact Us in the site footer or message us on Instagram @awakeandalign_—we read every note.",
  },
];

const DAY_TILE_FRAME =
  "group relative z-0 w-full aspect-[4/3.92] max-w-[min(100%,240px)] overflow-hidden rounded-none bg-transparent";

export default function MorePage() {
  return (
    <div className="min-h-screen bg-app-surface">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:px-6 md:pt-14 md:pb-16">
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

        {/* Thematic strip — Sunday Sabbath tile + journal-style birds */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 md:mb-12 lg:gap-6">
          <div
            className={`${DAY_TILE_FRAME} mx-auto sm:mx-0 ${SABBATH_CARD_SHADOW_RING} ${DAY_CARD_SHELL_HOVER}`}
            aria-label="Sunday Sabbath"
          >
            <div className="absolute inset-0 bg-sand">
              <Image
                src="/sabbath-birds.png"
                alt=""
                fill
                sizes="240px"
                className={DAY_CARD_IMAGE_HOVER}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-2.5 pt-1 md:px-3.5 md:pb-3">
              <p className={SABBATH_CARD_TITLE_CLASS}>Sunday</p>
              <p className={SABBATH_CARD_SUBTITLE_CLASS}>Sabbath · Rest · Reflect · Worship</p>
            </div>
          </div>

          <div
            className={`relative mx-auto flex h-[min(200px,42vw)] w-full max-w-[240px] flex-col justify-end overflow-hidden rounded-none bg-sunset-peach ring-1 ring-accent-amber/45 ${DAY_CARD_SHELL_HOVER} sm:mx-0 sm:h-52 sm:max-w-none`}
            aria-hidden
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 88% at 50% 38%, rgb(255 206 168 / 0.45) 0%, rgb(255 228 208 / 0.18) 50%, transparent 72%)",
              }}
            />
            <div className="relative flex flex-1 items-center justify-center pt-6">
              <div className="relative h-24 w-[6.1rem] shrink-0 origin-[center_40%] scale-110 sm:h-28 sm:w-[7rem]">
                <Image
                  src="/sabbath-birds.png"
                  alt=""
                  fill
                  className="object-contain object-center"
                  sizes="120px"
                />
              </div>
            </div>
            <div className="relative z-10 border-t border-accent-amber/25 bg-white/35 px-3 py-2.5 backdrop-blur-[2px] md:px-3.5">
              <p className="text-sm font-light tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]">
                Same rhythm, same rest
              </p>
              <p className={`${SABBATH_CARD_SUBTITLE_CLASS} !mt-0.5 opacity-90`}>
                Peach wash & birds — like your journal band
              </p>
            </div>
          </div>
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
                    <Link href="/community" className="font-medium text-foreground underline-offset-4 hover:text-sky-blue hover:underline">
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

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10 lg:mt-12">
          <section
            className={`${CARD_SHELL} border-t-2 border-t-accent-amber/50`}
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
              — we’ll point you to the right edition.
            </p>
          </section>

          <section
            className={`${CARD_SHELL} relative overflow-hidden border-t-2 border-t-sky-blue/50`}
            aria-labelledby="founder-heading"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pastel-blue-light/80 blur-2xl"
              aria-hidden
            />
            <h2
              id="founder-heading"
              className="text-lg font-semibold tracking-tight text-foreground [font-family:var(--font-headline),sans-serif]"
            >
              Meet the founder — Kat Jackson
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray">
              Kat founded awake + align to make faith-filled wellness feel doable—not performative. She believes in
              showing up honestly: prayer before perfection, movement as worship, and Sunday as a real pause. You’ll
              hear that same voice in prompts, audio, and the community.
            </p>
            <p className="mt-3 text-sm italic text-gray">
              “We’re not chasing hustle culture—we’re chasing Jesus, in rhythm.”
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
