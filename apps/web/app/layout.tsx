import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "@/providers";

import "./globals.css";

const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const body = Sora({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "CAMPUS-BANDHU | Smart Campus OS",
  description:
    "AI-powered smart campus ecosystem with verified identity, events, marketplace, networking, and blockchain achievements."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
