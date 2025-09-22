"use client";
import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

type Brand = "default" | "narconations" | string;

type ThemeTokens = Record<string, string>;

const THEMES: Record<string, ThemeTokens> = {
  default: {
    "--bg": "#ffffff",
    "--fg": "#0b0f15",
    "--primary": "#4f46e5",
    "--panel": "#f8fafc",
    "--ring": "#111827",
  },
  narconations: {
    "--bg": "#0a0a0a",
    "--fg": "#f5f5f5",
    "--primary": "#00ffe7",
    "--panel": "#111318",
    "--ring": "#ffffff",
  },
};

const BrandContext = createContext<{ brand: Brand }>({ brand: "default" });

export function BrandThemeProvider({ brand = "default", children }: { brand?: Brand; children: ReactNode }) {
  const style = useMemo(() => THEMES[brand] ?? THEMES.default, [brand]);

  return (
    <BrandContext.Provider value={{ brand }}>
      <div style={style as CSSProperties} className="min-h-screen bg-bg text-fg">
        {children}
      </div>
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
