import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ProductionGuard from '@/components/ProductionGuard';
import InstallPWA from "@/components/InstallPWA";
import NotificationManager from "@/components/NotificationManager";
import { ThemeProvider } from "@/lib/ThemeContext";


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
  title: "Globard",
  description: "Real-time gold market analytics, AI-powered trade insights, and geopolitical intelligence for professional XAU/USD traders.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Globard",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <ProductionGuard>
            {children}
          </ProductionGuard>
          <InstallPWA />
          <NotificationManager />
        </ThemeProvider>
      </body>
    </html>
  );
}
