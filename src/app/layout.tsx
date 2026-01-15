import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Runtime from "@/core/runtime";
import { SocketBanner } from "@/shared/components/common/socket-banner";
import { GlobalSocketErrorHandler } from "@/shared/components/common/global-socket-errors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-smono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next App",
  description: "A modern, crisp Next.js app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketBanner />
        <GlobalSocketErrorHandler />
        <Runtime>{children}</Runtime>
      </body>
    </html>
  );
}
