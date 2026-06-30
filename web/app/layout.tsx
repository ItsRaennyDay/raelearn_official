import type { Metadata } from "next";
import { Fraunces, Outfit, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Outfit = closest free substitute for Gilroy (same clean geometric proportions)
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RaeLearn — Practical training for VAs, founders & nonprofit leaders",
  description:
    "RaeLearn gives VAs, founders, nonprofit leaders, and small teams practical courses on operations, admin systems, websites, compliance awareness, donor support, and workflow setup.",
  metadataBase: new URL("https://raelearn.byraeform.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={[
        fraunces.variable,
        outfit.variable,
        jetbrains.variable,
        caveat.variable,
      ].join(" ")}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
