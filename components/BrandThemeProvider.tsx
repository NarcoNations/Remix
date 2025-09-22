"use client";
import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

type Brand = "default" | "narconations" | string;

const THEMES: Record<string, Record<string, string>> = {
  default: { "--bg":"#ffffff","--fg":"#0b0f15","--primary":"#4f46e5","--panel":"#f8fafc","--ring":"#111827" },
  narconations: { "--bg":"#0a0a0a","--fg":"#f5f5f5","--primary":"#00ffe7","--panel":"#111318","--ring":"#ffffff" },
};

const Ctx = createContext<{ brand: Brand }>({ brand: "default" });

export function BrandThemeProvider({ brand = "default", children }: { brand?: Brand; children: ReactNode }) {
  const style = useMemo(() => THEMES[brand] ?? THEMES.default, [brand]);
  return (
    <Ctx.Provider value={{ brand }}>
      <div style={style as CSSProperties} className="min-h-screen bg-bg text-fg">
        {children}
      </div>
    </Ctx.Provider>
  );
}

export const useBrand = () => useContext(Ctx);
