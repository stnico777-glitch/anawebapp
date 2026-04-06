import Image from "next/image";
import { SUNDAY_WORKOUT_NAME } from "@/constants/schedule";

type ScheduleSabbathTileProps = {
  isToday?: boolean;
};

/**
 * Sunday Sabbath — same outer shape and image proportions as `ScheduleDayCard`,
 * without the interactive checklist (rest day).
 */
export default function ScheduleSabbathTile({ isToday = false }: ScheduleSabbathTileProps) {
  return (
    <article
      className={`relative w-full overflow-hidden rounded-lg border-2 bg-app-surface shadow-[0_1px_2px_rgba(120,130,135,0.06)] transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        isToday ? "border-sky-blue" : "border-sand"
      }`}
      aria-label="Sunday — Sabbath rest"
    >
      {isToday && (
        <span className="absolute right-2 top-2 z-10 rounded-sm bg-sky-blue px-2 py-1 text-xs font-semibold text-white [font-family:var(--font-body),sans-serif]">
          Today
        </span>
      )}

      <div className="relative aspect-[16/13] min-h-[11rem] overflow-hidden bg-sand sm:min-h-[13rem] md:aspect-[16/14] md:min-h-[14rem]">
        <Image
          src="/sabbath-birds.png"
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
          <h3 className="text-lg font-semibold tracking-tight text-white [font-family:var(--font-headline),sans-serif]">
            Sunday
          </h3>
          <p className="mt-0.5 text-sm font-normal text-white/90 [font-family:var(--font-body),sans-serif]">
            {SUNDAY_WORKOUT_NAME}
          </p>
        </div>
      </div>

      <div
        className="px-4 py-4 [font-family:var(--font-body),sans-serif] md:px-5 md:py-5"
        style={{
          backgroundImage: "linear-gradient(135deg, #FFF6E6 0%, #F3E7CC 100%)",
        }}
      >
        <p className="text-center text-sm leading-relaxed text-gray">
          Use this day for rest, reflection, and worship.
        </p>
      </div>
    </article>
  );
}
