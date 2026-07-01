import type { Metadata } from "next";
import { Fraunces, Outfit, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
  metadataBase: new URL("https://raelearn.byraeform.com"),
  title: {
    default: "RaeLearn by RAEFORM — Practical training for VAs, founders & nonprofit leaders",
    template: "%s · RaeLearn by RAEFORM",
  },
  description:
    "RaeLearn by RAEFORM offers practical online courses for virtual assistants, nonprofit leaders, founders, and small teams — covering operations, admin systems, websites, compliance, and more.",
  openGraph: {
    type: "website",
    siteName: "RaeLearn by RAEFORM",
    title: "RaeLearn by RAEFORM — Practical training for VAs, founders & nonprofit leaders",
    description:
      "Practical online courses for VAs, nonprofit leaders, founders, and small teams. Learn operations, admin systems, websites, compliance, and more.",
    url: "https://raelearn.byraeform.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RaeLearn by RAEFORM",
    description:
      "Practical online courses for VAs, nonprofit leaders, founders, and small teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
