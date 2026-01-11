// Fichier: types/index.ts

// Voici à quoi ressemble un commentaire dans ton application
export interface YouTubeComment {
  id: string;
  threadId: string;
  author: string;
  authorImage: string;
  text: string;
  publishedAt: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail: string;
  likeCount: number;
}

// Voici à quoi ressemble une requête pour l'IA
export interface GenerateReplyRequest {
  comment_text: string;
  tone: string;
  custom_instructions?: string;
}