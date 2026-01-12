"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
// 1. IMPORT
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <title>Commently - Gestionnaire YouTube IA</title>
        <meta name="description" content="Gérez vos commentaires YouTube 10x plus vite avec l'IA." />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          {/* 2. COMPOSANT ANALYTICS */}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}