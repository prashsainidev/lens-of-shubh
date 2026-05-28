import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, DM_Sans } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal"],
  variable: "--font-cormorant",
  display: "swap",
});

const cormorantItalic = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic"],
  variable: "--font-cormorant-italic",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lens of Shubh | Professional Photography",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LS Admin",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  description:
    "Capturing the poetry of human emotion through weddings, portraits, and moments that deserve to live forever. Professional creative photography by Shubham Singh, based in Aligarh and available worldwide.",
  keywords: [
    "lens of shubh",
    "shubham singh photography",
    "wedding photographer aligarh",
    "professional photographer aligarh",
    "portrait photographer aligarh",
    "pre wedding shoot aligarh",
    "cinematic wedding videos",
    "aligarh photographer",
    "best photographer in aligarh",
  ].join(", "),
  openGraph: {
    title: "Lens of Shubh | Professional Photography",
    description:
      "Capturing the poetry of human emotion through weddings, portraits, and moments that deserve to live forever. Professional creative photography based in Aligarh, available worldwide.",
    url: "https://lens-of-shubh.vercel.app",
    siteName: "Lens of Shubh",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Lens of Shubh Photography Showcase",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lens of Shubh | Professional Photography",
    description:
      "Capturing the poetry of human emotion through weddings, portraits, and moments that deserve to live forever.",
    images: ["https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${cormorantItalic.variable} ${dmSans.variable} ${dmMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
