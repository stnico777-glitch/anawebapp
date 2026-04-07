import type { Metadata } from "next";
import { Poppins, Open_Sans, Geist, Geist_Mono, Lora, Caveat, Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import SunRaysSection from "@/components/SunRaysSection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  title: "awake+align",
  description:
    "Structured daily faith + fitness routines, guided schedules, prayer, movement, prayer journal, and prayer & praise.",
  openGraph: {
    title: "awake+align",
    description:
      "Structured daily faith + fitness routines, guided schedules, prayer, movement, prayer journal, and prayer & praise.",
    images: [
      {
        url: "/awake-align-preview.png",
        alt: "awake + align — power love sound mind",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "awake+align",
    description:
      "Structured daily faith + fitness routines, guided schedules, prayer, movement, prayer journal, and prayer & praise.",
    images: ["/awake-align-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* next/font variables on <html> so :root can resolve --font-poppins when building --font-headline (avoids generic sans fallback). */
  const fontVars = `${geistSans.variable} ${poppins.variable} ${openSans.variable} ${geistMono.variable} ${lora.variable} ${caveat.variable} ${orbitron.variable}`;

  return (
    <html lang="en" className={fontVars}>
      <body className="bg-background antialiased">
        <div className="relative">
          <SunRaysSection />
          <div className="relative z-10">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
