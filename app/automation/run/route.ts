import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
// CORRECTION ICI : ../../ au lieu de ../../../
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  console.log("🚀 API Automation: Démarrage..."); // Log pour vérifier que ça se lance

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      console.log("❌ Erreur: Pas de session ou accessToken manquant");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { rules, blacklist } = body;
    console.log("📋 Règles reçues:", rules);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // 1. ID de la chaîne
    const channelsResponse = await youtube.channels.list({ part: ["id"], mine: true });
    const channelId = channelsResponse.data.items?.[0]?.id;
    
    if (!channelId) {
      console.log("❌ Erreur: Impossible de trouver le Channel ID");
      return NextResponse.json({ error: "Chaîne introuvable" }, { status: 404 });
    }

    // 2. Commentaires
    const commentsResponse = await youtube.commentThreads.list({
      part: ["snippet"],
      allThreadsRelatedToChannelId: channelId,
      maxResults: 20, 
    });

    let repliedCount = 0;
    let moderatedCount = 0;
    const items = commentsResponse.data.items || [];
    console.log(`🔍 Analyse de ${items.length} commentaires...`);

    for (const item of items) {
      const topLevel = item.snippet?.topLevelComment?.snippet;
      if (!topLevel) continue;

      const commentId = item.id; 
      const specificCommentId = item.snippet?.topLevelComment?.id;
      const text = topLevel.textDisplay?.toLowerCase() || "";
      const authorId = topLevel.authorChannelId?.value;

      if (authorId === channelId) continue; // Ignorer mes commentaires

      // Règle Merci
      if (rules.includes("auto_reply_thanks")) {
        const cleanText = text.replace(/[^a-z0-9]/g, "").trim();
        if (["merci", "thanks", "cimer", "top", "super"].includes(cleanText)) {
          try {
            await youtube.comments.insert({
              part: ["snippet"],
              requestBody: {
                snippet: { parentId: commentId, textOriginal: "Avec plaisir ! 😊" },
              },
            });
            repliedCount++;
            console.log(`✅ Répondu à : ${text}`);
          } catch (e) { /* ignoré */ }
        }
      }

      // Règle Spam
      let shouldHide = false;
      if (rules.includes("hide_spam_links") && (text.includes("http") || text.includes("www."))) shouldHide = true;
      if (rules.includes("block_insults") && blacklist?.some((w: string) => text.includes(w.toLowerCase()))) shouldHide = true;

      if (shouldHide && specificCommentId) {
        try {
          await youtube.comments.setModerationStatus({
            id: specificCommentId,
            moderationStatus: "rejected",
          });
          moderatedCount++;
          console.log(`🛡️ Masqué : ${text}`);
        } catch (e) {
          console.error("Erreur modération:", e);
        }
      }
    }

    return NextResponse.json({ success: true, replied: repliedCount, moderated: moderatedCount });

  } catch (error: any) {
    console.error("❌ CRASH API:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur interne" }, { status: 500 });
  }
}