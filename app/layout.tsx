"use client"; // On passe tout en mode Client pour ne pas avoir besoin de fichier externe

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Le changement de nom ici */}
        <title>Commently - Gestionnaire YouTube IA</title>
        <meta name="description" content="Gérez vos commentaires YouTube 10x plus vite avec l'IA." />
      </head>
      <body className={inter.className}>
        {/* On met le Provider directement ici, sans fichier séparé */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}