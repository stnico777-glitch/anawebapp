import { Caveat } from "next/font/google";

/** Handwritten accents on prayer/praise cards — loaded only for community routes to reduce global font payload. */
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <div className={`min-w-0 ${caveat.variable}`}>{children}</div>;
}
