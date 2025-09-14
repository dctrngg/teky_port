import "./globals.css";
import { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-serif" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${playfair.variable}`} style={{ fontFamily: "var(--font-sans)" }}>
        {children}
      </body>
    </html>
  );
}
