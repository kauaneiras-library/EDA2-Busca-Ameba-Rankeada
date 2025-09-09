import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jogo da Ameba Rankeada",
  description: "Neon Runner com Next.js, React e TypeScript",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
