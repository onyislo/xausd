import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ProductionGuard from "@/components/ProductionGuard";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AuScope — Advanced XAU/USD Intelligence Terminal",
  description: "Real-time gold market analytics, AI-powered trade signals, and geopolitical intelligence for professional XAU/USD traders.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ProductionGuard>
          {children}
        </ProductionGuard>
      </body>
    </html>
  );
}
