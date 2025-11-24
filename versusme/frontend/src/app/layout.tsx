import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Antonio, Noto_Sans, Roboto_Mono } from 'next/font/google'
import "leaflet/dist/leaflet.css";
import { Russo_One } from "next/font/google";

const russo = Russo_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-russo",
});



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const antonio = Antonio({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-antonio'
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto'
});

export const metadata: Metadata = {
  title: "VersusMe",
  description: "Descubre retos deportivos en Lima",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable}
          ${antonio.variable}
          ${notoSans.variable}
          ${robotoMono.variable}
          antialiased
          min-h-screen
          bg-background
          text-foreground
        `}
      >
        {children}
      </body>
    </html>
  );
}
