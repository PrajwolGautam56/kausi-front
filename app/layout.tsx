import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Hotel Kausi | Boutique Hotel in Pokhara Lakeside", template: "%s | Hotel Kausi" },
  description: "A modern four-star boutique hotel in Lakeside, Pokhara, with balcony rooms, mountain views, restaurant, rooftop events and warm Nepali hospitality.",
  keywords: ["Hotel Kausi", "Pokhara hotel", "Lakeside hotel", "hotel near Phewa Lake", "Pokhara accommodation"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Hotel Kausi — A modern boutique experience in Pokhara",
    description: "Stay close to Phewa Lake and wake up to mountain views at Hotel Kausi, Lakeside-6, Pokhara.",
    images: [{ url: "/images/hotel-exterior-night.jpg", width: 1024, height: 683, alt: "Hotel Kausi at night" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
