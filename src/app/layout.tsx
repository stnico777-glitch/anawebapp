import type { Metadata } from "next";
import { Poppins, Open_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Empty `NEXT_PUBLIC_APP_URL` is truthy for `??`, so `new URL("")` would throw at runtime/build. */
function resolveMetadataBase(): URL {
  const fromPublic =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ?? "";
  const vercelHost = process.env.VERCEL_URL?.trim() ?? "";
  const candidates = [
    fromPublic
      ? fromPublic.startsWith("http")
        ? fromPublic
        : `https://${fromPublic}`
      : "",
    vercelHost ? `https://${vercelHost}` : "",
    "http://localhost:3000",
  ].filter(Boolean);

  for (const raw of candidates) {
    try {
      return new URL(raw);
    } catch {
      /* try next candidate */
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  /** Matches `--background` so mobile browser UI / PWA chrome isn’t default white. */
  themeColor: "#FFFCE9",
  title: "awake+align",
  description:
    "Structured daily faith + fitness: weekly schedules, movement, prayer audio, journaling, and Prayer & Praise community.",
  openGraph: {
    type: "website",
    title: "awake+align",
    description:
      "Structured daily faith + fitness: weekly schedules, movement, prayer audio, journaling, and Prayer & Praise community.",
    images: [
      {
        url: "/awake-align-preview.png",
        width: 819,
        height: 1024,
        alt: "awake + align — power love sound mind",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "awake+align",
    description:
      "Structured daily faith + fitness: weekly schedules, movement, prayer audio, journaling, and Prayer & Praise community.",
    images: [
      {
        url: "/awake-align-preview.png",
        width: 819,
        height: 1024,
        alt: "awake + align — power love sound mind",
      },
    ],
  },
  /** Favicons / Apple touch: `app/icon.png` and `app/apple-icon.png` (brand art, same as OG image). */
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* next/font variables on <html> so :root can resolve --font-poppins when building --font-headline (avoids generic sans fallback). */
  const fontVars = `${poppins.variable} ${openSans.variable} ${geistMono.variable}`;

  return (
    <html lang="en" className={`${fontVars} bg-background`}>
      <body className="bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
