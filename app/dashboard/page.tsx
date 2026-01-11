"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Nouveaux états pour le design 3 colonnes
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'prioritaires' | 'normal' | 'spam'>('normal');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchComments();
      loadSettings();
      loadLikedComments();
    }
  }, [session]);
  
  function loadLikedComments() {
    try {
      const storedLikes = localStorage.getItem("likedComments");
      if (storedLikes) {
        const parsedLikes = JSON.parse(storedLikes) as string[];
        setLikedComments(new Set(parsedLikes));
      }
    } catch (error) {
      console.error("Erreur chargement likes:", error);
    }
  }

  function loadSettings() {
    const savedTone = localStorage.getItem("defaultTone") || "amical";
    const savedInstructions = localStorage.getItem("customInstructions") || "";
    setSelectedTone(savedTone);
    setCustomInstructions(savedInstructions);
  }

  async function fetchComments() {
    try {
      const response = await fetch("/api/youtube/comments");
      const data = await response.json();
      
      if (data.comments) {
        setComments(data.comments);
        // Sélectionner automatiquement la première vidéo
        const videos = getUniqueVideos(data.comments);
        if (videos.length > 0 && !selectedVideo) {
          setSelectedVideo(videos[0].title);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  function getUniqueVideos(comments: any[]) {
    const videoMap = new Map();
    comments.forEach(comment => {
      if (!videoMap.has(comment.videoTitle)) {
        videoMap.set(comment.videoTitle, {
          title: comment.videoTitle,
          thumbnail: comment.videoThumbnail,
          comments: []
        });
      }
      videoMap.get(comment.videoTitle).comments.push(comment);
    });
    return Array.from(videoMap.values());
  }

  function getCommentsForVideo(videoTitle: string) {
    return comments.filter(c => c.videoTitle === videoTitle);
  }

  function getFilteredComments(videoComments: any[]) {
    // Simuler les catégories pour la démo
    // Dans un vrai système, cela viendrait de l'IA de classification
    return videoComments.filter(comment => {
      if (filterType === 'all') return true;
      if (filterType === 'prioritaires') {
        // Simuler : commentaires avec certains mots-clés sont prioritaires
        const priorityKeywords = ['question', 'help', 'problème', 'bug', 'erreur', '?'];
        return priorityKeywords.some(kw => comment.text.toLowerCase().includes(kw));
      }
      if (filterType === 'normal') {
        const spamKeywords = ['spam', 'promo', 'http', 'www.', 'lien'];
        const priorityKeywords = ['question', 'help', 'problème', 'bug', 'erreur', '?'];
        return !spamKeywords.some(kw => comment.text.toLowerCase().includes(kw)) &&
               !priorityKeywords.some(kw => comment.text.toLowerCase().includes(kw));
      }
      if (filterType === 'spam') {
        const spamKeywords = ['spam', 'promo', 'http', 'www.', 'lien'];
        return spamKeywords.some(kw => comment.text.toLowerCase().includes(kw));
      }
      return true;
    });
  }

  function getCommentCategory(comment: any): string {
    const text = comment.text.toLowerCase();
    const priorityKeywords = ['question', 'help', 'problème', 'bug', 'erreur', '?'];
    const spamKeywords = ['spam', 'promo', 'http', 'www.', 'lien'];
    
    if (priorityKeywords.some(kw => text.includes(kw))) return 'URGENT';
    if (spamKeywords.some(kw => text.includes(kw))) return 'SPAM';
    return 'NORMAL';
  }

  async function likeComment(commentId: string) {
    try {
      const storedLikes = localStorage.getItem("likedComments");
      const parsedLikes = storedLikes ? (JSON.parse(storedLikes) as string[]) : [];
      const likedSet = new Set<string>(parsedLikes);
      
      if (likedSet.has(commentId)) {
        likedSet.delete(commentId);
        setLikedComments(new Set(likedSet));
      } else {
        likedSet.add(commentId);
        setLikedComments(new Set(likedSet));
        setToast({ message: "❤️ Commentaire liké !", type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
      
      localStorage.setItem("likedComments", JSON.stringify([...likedSet]));
    } catch (error) {
      console.error("Erreur like:", error);
      setToast({ message: "❌ Erreur lors du like", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  }

  function openModal(comment: any) {
    setSelectedComment(comment);
    setReplies([]);
    loadSettings();
  }

  async function generateReplies() {
    if (!selectedComment || !selectedTone) return;

    setGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: selectedComment.text,
          tone: selectedTone,
          custom_instructions: customInstructions,
        }),
      });

      const data = await response.json();
      
      if (data.replies) {
        setReplies(data.replies);
        setToast({ message: "✨ Réponses générées avec succès !", type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: "❌ Erreur lors de la génération des réponses", type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setToast({ message: "❌ Erreur lors de la génération", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setGenerating(false);
    }
  }

  async function postReply(replyText: string) {
    if (!selectedComment) return;

    setPosting(true);

    try {
      const response = await fetch("/api/youtube/post-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: selectedComment.id,
          replyText: replyText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: "✅ Réponse postée avec succès sur YouTube !", type: 'success' });
        setTimeout(() => setToast(null), 3000);
        closeModal();
        fetchComments();
      } else {
        setToast({ message: "❌ Erreur : " + (data.error || "Erreur inconnue"), type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setToast({ message: "❌ Erreur lors de la publication", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setPosting(false);
    }
  }

  function closeModal() {
    setSelectedComment(null);
    setReplies([]);
  }

  const videos = getUniqueVideos(comments);
  const selectedVideoComments = selectedVideo ? getCommentsForVideo(selectedVideo) : [];
  const filteredComments = getFilteredComments(selectedVideoComments);
  const selectedVideoData = videos.find(v => v.title === selectedVideo);

  // Compter les commentaires par catégorie
  const countByCategory = {
    prioritaires: selectedVideoComments.filter(c => getCommentCategory(c) === 'URGENT').length,
    normal: selectedVideoComments.filter(c => getCommentCategory(c) === 'NORMAL').length,
    spam: selectedVideoComments.filter(c => getCommentCategory(c) === 'SPAM').length,
    all: selectedVideoComments.length
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* COLONNE GAUCHE : NAVIGATION */}
      <aside className="w-[250px] bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">CommentAI</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-[#8B5CF6] font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>
          
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Automatisation</span>
          </button>
          
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Paramètres</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src={session?.user?.image || "https://via.placeholder.com/40"}
              alt={session?.user?.name || "User"}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.name || "Squeezie Tech"}
              </p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* COLONNE MILIEU : LISTE VIDÉOS */}
      <aside className="w-[380px] bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mes Vidéos</h2>
            <button
              onClick={fetchComments}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {/* Recherche */}
          <input
            type="text"
            placeholder="Chercher une vidéo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
          />
        </div>

        {/* Liste des vidéos */}
        <div className="flex-1 overflow-y-auto">
          {videos
            .filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((video, index) => {
              const videoComments = getCommentsForVideo(video.title);
              const urgentCount = videoComments.filter(c => getCommentCategory(c) === 'URGENT').length;
              const isActive = selectedVideo === video.title;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedVideo(video.title)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                    isActive ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex space-x-3">
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-14 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${
                        isActive ? 'text-[#8B5CF6]' : 'text-gray-900'
                      }`}>
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(video.comments[0]?.publishedAt || Date.now()).toLocaleDateString("fr-FR")}
                      </p>
                      {urgentCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#FEE2E2] text-red-700">
                          {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          
          {videos.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Aucune vidéo trouvée</p>
            </div>
          )}
        </div>
      </aside>

      {/* COLONNE DROITE : COMMENTAIRES */}
      <main className="flex-1 bg-white overflow-y-auto">
        {selectedVideo ? (
          <>
            {/* Header Principal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedVideo}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {countByCategory.all} Commentaires • Publiée le {selectedVideoComments[0] ? new Date(selectedVideoComments[0].publishedAt).toLocaleDateString("fr-FR") : 'Date inconnue'}
                  </p>
                </div>
                
                {/* Dropdown Trier */}
                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]">
                  <option>Trier par : Importance IA</option>
                  <option>Trier par : Date</option>
                  <option>Trier par : Likes</option>
                </select>
              </div>

              {/* Barre de Filtres */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('prioritaires')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterType === 'prioritaires'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                  <span>Prioritaires {countByCategory.prioritaires}</span>
                </button>
                
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tous {countByCategory.all}
                </button>
                
                <button
                  onClick={() => setFilterType('normal')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterType === 'normal'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  <span>Normal {countByCategory.normal}</span>
                </button>
                
                <button
                  onClick={() => setFilterType('spam')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterType === 'spam'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Spam {countByCategory.spam}
                </button>
              </div>
            </div>

            {/* Liste des Commentaires */}
            <div className="p-6 space-y-4">
              {filteredComments.map((comment) => {
                const category = getCommentCategory(comment);
                const isLiked = likedComments.has(comment.id);
                
                return (
                  <div
                    key={comment.id}
                    className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                  >
                    {/* En-tête Carte */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src={comment.authorImage}
                          alt={comment.author}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.publishedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          category === 'URGENT' ? 'bg-red-100 text-red-700' :
                          category === 'SPAM' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {category}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Contenu */}
                    <p className="text-gray-700 mb-4 leading-relaxed">{comment.text}</p>

                    {/* Boîte Analyse IA */}
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-[#8B5CF6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              {category === 'URGENT' ? 'Avis' : category === 'SPAM' ? 'Spam' : 'Emoji'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {category === 'URGENT' 
                              ? 'Commentaire nécessitant une réponse prioritaire.' 
                              : category === 'SPAM'
                              ? 'Commentaire identifié comme spam.'
                              : 'Commentaire standard positif.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pied de page Carte */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="text-sm">{comment.likeCount || 0}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                          Masquer
                        </button>
                        <button
                          onClick={() => openModal(comment)}
                          className="flex items-center space-x-2 px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span>Générer réponse</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredComments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>Aucun commentaire trouvé pour ce filtre</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Sélectionnez une vidéo</p>
              <p className="text-sm">Choisissez une vidéo dans la liste pour voir ses commentaires</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal de génération de réponses */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">✨ Générateur de réponse IA</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Commentaire reçu */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Commentaire reçu
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={selectedComment.authorImage}
                      alt={selectedComment.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 mb-1">
                        {selectedComment.author}
                      </p>
                      <p className="text-gray-700">{selectedComment.text}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choisir le ton */}
              {replies.length === 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Choisir le ton</p>
                    <Link
                      href="/settings"
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Paramètres →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "amical", icon: "😊", label: "Amical" },
                      { value: "professionnel", icon: "💼", label: "Professionnel" },
                      { value: "fun", icon: "🎉", label: "Fun" },
                      { value: "educatif", icon: "📚", label: "Éducatif" },
                      { value: "motivant", icon: "💪", label: "Motivant" },
                      { value: "humoristique", icon: "😂", label: "Humoristique" },
                    ].map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setSelectedTone(tone.value)}
                        className={`${
                          selectedTone === tone.value
                            ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                        } border-2 px-3 py-2 rounded-lg transition-all font-medium text-sm flex items-center justify-center space-x-1`}
                      >
                        <span>{tone.icon}</span>
                        <span>{tone.label}</span>
                      </button>
                    ))}
                  </div>

                  {customInstructions && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-900">
                        <span className="font-semibold text-purple-900">✨ Instructions personnalisées actives :</span>
                        <br />
                        <span className="mt-1 inline-block text-purple-800">{customInstructions}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Réponses générées ou bouton générer */}
              {generating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération en cours...</p>
                </div>
              ) : replies.length > 0 ? (
                <div className="space-y-4">
                  {replies.map((reply, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-all"
                    >
                      <p className="text-gray-800 mb-3">{reply}</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(reply);
                            setToast({ message: "📋 Réponse copiée !", type: 'success' });
                            setTimeout(() => setToast(null), 2000);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1"
                        >
                          📋 Copier
                        </button>
                        <button
                          onClick={() => postReply(reply)}
                          disabled={posting}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          {posting ? "Publication..." : "✅ Poster"}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setReplies([])}
                    className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    🔄 Changer le ton et regénérer
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateReplies}
                  disabled={!selectedTone}
                  className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-300 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>✨</span>
                  <span>Générer 3 suggestions</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Fermer
              </button>
              {replies.length > 0 && !posting && (
                <p className="text-sm text-gray-500">
                  Sélectionnez une réponse ou regénérez
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className={`rounded-xl px-6 py-4 shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span>
              <p className="font-medium">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
