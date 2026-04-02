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

export const metadata: Metadata = {
  title: "awake + align — Faith + Fitness",
  description:
    "Structured daily faith + fitness routines, guided schedules, prayer, workouts, prayer journal, and prayer & praise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${poppins.variable} ${openSans.variable} ${geistMono.variable} ${lora.variable} ${caveat.variable} ${orbitron.variable} bg-background antialiased`}
      >
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
