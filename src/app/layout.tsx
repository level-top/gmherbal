import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackgroundSpinner } from "@/app/_components/BackgroundSpinner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gmherbal",
  description: "Herbal products by gmherbal",
  icons: {
    // Browsers choose the best match based on type/size.
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/fav.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
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
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <BackgroundSpinner />
        {children}
      </body>
    </html>
  );
}
