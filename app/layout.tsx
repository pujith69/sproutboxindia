import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import ConsentBanner from "@/components/ConsentBanner";
import { allAssignmentsWithFlags } from "@/lib/experiments/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SproutBox — Fresh Microgreens, Delivered to Your Kitchen",
  description:
    "SproutBox connects restaurants to a network of local home growers. Demand-driven microgreens, harvested same-day and delivered to your kitchen.",
  keywords: ["SproutBox", "microgreens", "agriculture", "supply chain", "farm to table"],
  openGraph: {
    title: "SproutBox — Fresh Microgreens, Delivered to Your Kitchen",
    description:
      "Demand-driven microgreens from local home growers, delivered to restaurant kitchens.",
    type: "website",
    // TODO(owner): provide an OG image (public/og-image.jpg or similar) and uncomment:
    // images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "SproutBox microgreens" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const visitorId = h.get("x-sb-vid") ?? "unknown";
  const isBot = h.get("x-sb-bot") === "1";
  const assignmentsWithFlags = isBot ? {} : await allAssignmentsWithFlags();
  const assignments = Object.fromEntries(
    Object.entries(assignmentsWithFlags).map(([k, v]) => [k, v.variant])
  );

  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full`}>
      <body className="grain min-h-full flex flex-col antialiased bg-background text-foreground">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3S2T96R14P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-3S2T96R14P');
          `}
        </Script>
        <AnalyticsProvider
          visitorId={visitorId}
          assignments={assignments}
          lang="en"
        />
        <ConsentBanner />
        {children}
      </body>
    </html>
  );
}
