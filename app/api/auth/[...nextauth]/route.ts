import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 1. LISTE DES EMAILS AUTORISÉS (WHITELIST)
// J'ai corrigé la syntaxe (fermeture du tableau) et nettoyé les commentaires
const ALLOWED_EMAILS = [
  "t0robot10@gmail.com",
  "contact@jongregor.com",
  "lenversdudecode@gmail.com",
  "a.quatre44@gmail.com",
  "contact@ytbusiness.fr",
  "william.eliezer.contact@gmail.com",
  "commently.contact@gmail.com"
];

// 2. ACTIVER LE BLOCAGE (Met sur 'false' si tu veux ouvrir à tout le monde plus tard)
const IS_BETA_CLOSED = true; 

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.force-ssl",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Si la bêta est fermée, on vérifie l'email
      if (IS_BETA_CLOSED) {
        // On convertit l'email de l'utilisateur en minuscule pour comparer proprement
        const userEmail = user.email?.toLowerCase();
        
        // Si l'email est dans la liste, on autorise (true), sinon on bloque (false)
        if (userEmail && ALLOWED_EMAILS.includes(userEmail)) {
          return true;
        } else {
          console.log(`Accès refusé pour : ${userEmail}`); // Pour tes logs Vercel
          return false; // Redirige vers une page d'erreur
        }
      }
      // Si la bêta est ouverte (false), tout le monde passe
      return true; 
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };