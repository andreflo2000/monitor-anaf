import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monitor ANAF Pro — Monitorizare automată parteneri fiscali",
  description: "Fii primul care știe când un partener pierde TVA-ul, devine inactiv sau acumulează datorii.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="h-full">
      <body className={`${inter.className} min-h-full`}>{children}</body>
    </html>
  );
}
