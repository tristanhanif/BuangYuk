import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuangYuk - Platform Pengolahan & Daur Ulang Sampah Terintegrasi",
  description: "Platform terintegrasi untuk pengolahan dan daur ulang sampah dengan tracking dampak karbon real-time",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}