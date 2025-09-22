import type { Metadata } from "next";
import "./globals.css";
import { BrandThemeProvider } from "@/components/BrandThemeProvider";

export const metadata: Metadata = {
  title: "Simulate.ai — Pick your AI experts. Pressure-test decisions.",
  description: "Assemble personas, stream a debate, get a decision-ready brief.",
  metadataBase: new URL("https://simulate.ai"),
  openGraph: {
    title: "Simulate.ai — Multiplayer persona debate studio",
    description: "Assemble personas, stream a debate, get a decision-ready brief.",
    url: "https://simulate.ai",
    siteName: "Simulate.ai",
    images: [
      {
        url: "https://simulate.ai/og.png",
        width: 1200,
        height: 630,
        alt: "Simulate.ai studio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulate.ai — Pick your AI experts.",
    description: "Assemble personas, stream a debate, get a decision-ready brief.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans bg-bg text-fg">
        <BrandThemeProvider>{children}</BrandThemeProvider>
      </body>
    </html>
  );
}
