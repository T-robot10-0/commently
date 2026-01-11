import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: "ID commentaire manquant" }, { status: 400 });
    }

    // Note importante : L'API YouTube Data API v3 ne permet PAS de liker directement
    // un commentaire via une méthode publique. C'est une limitation de l'API YouTube.
    // 
    // Solutions possibles :
    // 1. Stocker les likes localement (localStorage) - implémenté côté client
    // 2. Utiliser l'API YouTube Comments API (requiert des permissions spéciales et accès limité)
    // 
    // Pour l'instant, on retourne simplement un succès pour que l'interface fonctionne.
    // Les likes seront stockés localement dans le navigateur.

    return NextResponse.json({ success: true, message: "Commentaire liké (localement) !" });
  } catch (error: any) {
    console.error("Erreur like:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}