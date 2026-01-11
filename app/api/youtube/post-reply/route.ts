import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { commentId, replyText } = await req.json();

    if (!commentId || !replyText) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Poster la réponse
    await youtube.comments.insert({
      part: ["snippet"],
      requestBody: {
        snippet: {
          parentId: commentId,
          textOriginal: replyText,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Réponse postée avec succès !" });
  } catch (error: any) {
    console.error("Erreur post réponse:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}