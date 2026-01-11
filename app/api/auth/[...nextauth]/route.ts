import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// LISTE DES EMAILS AUTORISÉS (TA WHITELIST)
const ALLOWED_EMAILS = [
  "t0robot10@gmail.com",
  "beta.testeur1@gmail.com",
  "beta.testeur2@gmail.com",
  // Ajoute les emails de tes testeurs ici
];

// Si tu veux ouvrir à tout le monde plus tard, mets ça sur false
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
      if (IS_BETA_CLOSED) {
        // Vérifie si l'email est dans la liste
        if (user.email && ALLOWED_EMAILS.includes(user.email)) {
          return true; // Autoriser
        } else {
          return false; // Bloquer (Redirige vers page d'erreur)
        }
      }
      return true; // Si Bêta ouverte, tout le monde passe
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
  pages: {
    error: '/auth/error', // Page d'erreur personnalisée si besoin
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };