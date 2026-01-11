// Fichier: types/next-auth.d.ts
import NextAuth from "next-auth";

// On dit à TypeScript : "Ajoute accessToken à la Session"
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

// On dit à TypeScript : "Ajoute accessToken au Token JWT"
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}