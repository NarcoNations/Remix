import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { BrandThemeProvider } from "@/components/BrandThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Simulate.ai — Pick your AI experts. Pressure-test decisions.",
  description: "Assemble personas, stream a debate, get a decision-ready brief.",
  metadataBase: new URL("https://simulate.ai"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebas.variable} font-sans`}>
        <BrandThemeProvider>{children}</BrandThemeProvider>
      </body>
    </html>
  );
}
