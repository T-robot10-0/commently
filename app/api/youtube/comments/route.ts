import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const channelsResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channelId = channelsResponse.data.items?.[0]?.id;

    if (!channelId) {
      return NextResponse.json({ error: "Aucune chaîne trouvée" }, { status: 404 });
    }

    const commentsResponse = await youtube.commentThreads.list({
      part: ["snippet"],
      allThreadsRelatedToChannelId: channelId,
      maxResults: 50,
      order: "time",
    });

    // Récupérer les IDs uniques des vidéos
    const videoIds = [...new Set(
      commentsResponse.data.items?.map(
        (item) => item.snippet?.topLevelComment?.snippet?.videoId
      ).filter(Boolean) || []
    )];

    // Récupérer les infos des vidéos
    const videosResponse = await youtube.videos.list({
      part: ["snippet"],
      id: videoIds as string[],
    });

    const videosMap: Record<string, any> = {};
    videosResponse.data.items?.forEach((video) => {
      if (video.id) {
        videosMap[video.id] = {
          title: video.snippet?.title,
          thumbnail: video.snippet?.thumbnails?.default?.url,
        };
      }
    });

    const comments = commentsResponse.data.items?.map((item) => {
      const snippet = item.snippet?.topLevelComment?.snippet;
      const topLevelCommentId = item.snippet?.topLevelComment?.id;
      const videoId = snippet?.videoId || "";
      
      return {
        id: topLevelCommentId || item.id, // Utiliser l'ID du commentaire, pas du thread
        threadId: item.id, // Garder aussi l'ID du thread si nécessaire
        author: snippet?.authorDisplayName,
        authorImage: snippet?.authorProfileImageUrl,
        text: snippet?.textDisplay,
        publishedAt: snippet?.publishedAt,
        videoId: videoId,
        videoTitle: videosMap[videoId]?.title || "Vidéo inconnue",
        videoThumbnail: videosMap[videoId]?.thumbnail,
        likeCount: snippet?.likeCount || 0,
      };
    }) || [];

    // Trier par vidéo puis par date
    comments.sort((a, b) => {
      if (a.videoTitle !== b.videoTitle) {
        return a.videoTitle.localeCompare(b.videoTitle);
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Erreur YouTube:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}