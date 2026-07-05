import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AliveMap — Карта повітряних загроз України в реальному часі",
  description: "Моніторинг повітряного простору України у реальному часі. Відстеження шахедів, ракет, балістики, авіації та повітряних тривог.",
  keywords: ["AliveMap", "карта тривог", "повітряна тривога", "Україна", "шахеди", "ракети", "моніторинг"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
