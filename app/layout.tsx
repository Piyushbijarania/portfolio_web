import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piyush Choudhary | Full-Stack & AI Developer",
  description: "Portfolio of Piyush Choudhary, a Full-Stack & AI Developer specializing in TypeScript, Next.js, FastAPI, Solidity, EVM oracles, and modern LLM ecosystems. Contributor to GSoC 2026.",
  authors: [{ name: "Piyush Choudhary" }],
  keywords: ["Piyush Choudhary", "Portfolio", "Full-Stack Developer", "AI Developer", "GSoC", "Google Summer of Code", "AOSSIE", "Next.js", "FastAPI", "Solidity", "Web3", "Ethereum", "Smart Contracts", "Foundry"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Remixicon CDN */}
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
