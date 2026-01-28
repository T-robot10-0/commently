"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { YouTubeComment } from "@/types";

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  // --- ÉTATS ---
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  
  // Nouveaux états pour la gestion de l'édition
  const [viewMode, setViewMode] = useState<'setup' | 'list' | 'editor'>('setup');
  const [draftReply, setDraftReply] = useState(""); // Le texte en cours d'édition
  
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("amical");
  const [customInstructions, setCustomInstructions] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'prioritaires' | 'normal' | 'spam'>('normal');
  const [searchQuery, setSearchQuery] = useState("");

  // 1. GESTION SESSION
  useEffect(() => {
    if (status === "authenticated") {
      fetchComments();
      loadSettings();
      loadLikedComments();
    }
  }, [status]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  // 3. LANDING PAGE (Non connecté)
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white selection:bg-purple-100 selection:text-purple-900 font-sans">
        {/* HEADER */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
                  <span className="text-white font-bold text-lg">Co</span>
                </div>
                <span className="text-gray-900 font-bold text-xl tracking-tight">Commently</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => signIn("google")}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-md"
                >
                  Connexion
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm border border-purple-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="text-sm font-medium text-purple-900">Propulsé par Groq</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
              Ne manquez plus jamais <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-indigo-600">une réponse.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
              Commently analyse vos commentaires YouTube et génère 3 suggestions de réponse instantanément grâce à l'IA.
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <button onClick={() => signIn("google")} className="flex items-center gap-3 bg-[#FF0000] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#cc0000] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>Connexion avec YouTube</span>
              </button>
              <div className="text-sm text-gray-500 font-medium mt-2">🔒 Via l'API Officielle YouTube</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // --- LOGIQUE METIER ---

  function loadLikedComments() {
    try {
      const storedLikes = localStorage.getItem("likedComments");
      if (storedLikes) setLikedComments(new Set(JSON.parse(storedLikes)));
    } catch (error) { console.error(error); }
  }

  function loadSettings() {
    setSelectedTone(localStorage.getItem("defaultTone") || "amical");
    setCustomInstructions(localStorage.getItem("customInstructions") || "");
  }

  async function fetchComments() {
    try {
      const response = await fetch("/api/youtube/comments");
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
        const videos = getUniqueVideos(data.comments);
        if (videos.length > 0 && !selectedVideo) setSelectedVideo(videos[0].title);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  function getUniqueVideos(comments: any[]) {
    const videoMap = new Map();
    comments.forEach(comment => {
      if (!videoMap.has(comment.videoTitle)) {
        videoMap.set(comment.videoTitle, { title: comment.videoTitle, thumbnail: comment.videoThumbnail, comments: [] });
      }
      videoMap.get(comment.videoTitle).comments.push(comment);
    });
    return Array.from(videoMap.values());
  }

  function getCommentsForVideo(videoTitle: string) {
    return comments.filter(c => c.videoTitle === videoTitle);
  }

  function getCommentCategory(comment: any): string {
    const text = comment.text.toLowerCase();
    const priorityKeywords = ['question', 'help', 'problème', 'bug', 'erreur', '?'];
    const spamKeywords = ['spam', 'promo', 'http', 'www.', 'lien'];
    if (priorityKeywords.some(kw => text.includes(kw))) return 'URGENT';
    if (spamKeywords.some(kw => text.includes(kw))) return 'SPAM';
    return 'NORMAL';
  }

  function getFilteredComments(videoComments: any[]) {
    return videoComments.filter(comment => {
      const category = getCommentCategory(comment);
      if (filterType === 'all') return true;
      if (filterType === 'prioritaires') return category === 'URGENT';
      if (filterType === 'normal') return category === 'NORMAL';
      if (filterType === 'spam') return category === 'SPAM';
      return true;
    });
  }

  // --- ACTIONS MODAL ---

  function openModal(comment: any) {
    setSelectedComment(comment);
    setReplies([]);
    setDraftReply("");
    setViewMode('setup'); // On commence par la config
    setSelectedTone(localStorage.getItem("defaultTone") || "amical");
    setCustomInstructions(localStorage.getItem("customInstructions") || "");
  }

  function closeModal() {
    setSelectedComment(null);
    setReplies([]);
    setDraftReply("");
    setViewMode('setup');
  }

  // 1. Générer
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
        setViewMode('list'); // On passe à la liste des résultats
        setToast({ message: "✨ Réponses générées !", type: 'success' });
      }
    } catch (error) {
      setToast({ message: "❌ Erreur génération", type: 'error' });
    } finally { setGenerating(false); }
  }

  // 2. Préparer l'édition (Clic sur "Modifier" ou "Écrire soi-même")
  function startEditing(text: string = "") {
    setDraftReply(text);
    setViewMode('editor');
  }

  // 3. Poster la réponse finale
  async function postReply() {
    if (!selectedComment || !draftReply) return;
    setPosting(true);
    try {
      const response = await fetch("/api/youtube/post-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: selectedComment.id, replyText: draftReply }),
      });
      const data = await response.json();
      if (data.success) {
        setToast({ message: "✅ Réponse postée !", type: 'success' });
        closeModal();
      } else {
        setToast({ message: "❌ Erreur : " + data.error, type: 'error' });
      }
    } catch (error) {
      setToast({ message: "❌ Erreur réseau", type: 'error' });
    } finally { setPosting(false); }
  }

  // --- RENDU ---

  const videos = getUniqueVideos(comments);
  const selectedVideoComments = selectedVideo ? getCommentsForVideo(selectedVideo) : [];
  const filteredComments = getFilteredComments(selectedVideoComments);
  const countByCategory = {
    prioritaires: selectedVideoComments.filter(c => getCommentCategory(c) === 'URGENT').length,
    normal: selectedVideoComments.filter(c => getCommentCategory(c) === 'NORMAL').length,
    spam: selectedVideoComments.filter(c => getCommentCategory(c) === 'SPAM').length,
    all: selectedVideoComments.length
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* SIDEBAR */}
      <aside className="w-[250px] bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Co</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">Commently</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-[#8B5CF6] font-medium relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B5CF6] rounded-r"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span>Dashboard</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>Paramètres</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center space-x-3">
            <img src={session?.user?.image || "https://via.placeholder.com/40"} alt="User" className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name || "User"}</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium">
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MILIEU & DROITE */}
      <aside className="w-[380px] bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mes Vidéos</h2>
            <button onClick={fetchComments} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          <input type="text" placeholder="Chercher une vidéo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] text-gray-900" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {videos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase())).map((video, index) => {
              const isActive = selectedVideo === video.title;
              return (
                <button key={index} onClick={() => setSelectedVideo(video.title)} className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${isActive ? 'bg-purple-50' : ''}`}>
                  <div className="flex space-x-3">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-20 h-14 rounded object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-900'}`}>{video.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{new Date(video.comments[0]?.publishedAt || Date.now()).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </aside>

      <main className="flex-1 bg-white overflow-y-auto">
        {selectedVideo ? (
          <>
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo}</h1>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Tous {countByCategory.all}</button>
                <button onClick={() => setFilterType('prioritaires')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'prioritaires' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Prioritaires {countByCategory.prioritaires}</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <img src={comment.authorImage} alt={comment.author} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">{new Date(comment.publishedAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{comment.text}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button onClick={() => openModal(comment)} className="flex items-center space-x-2 px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors text-sm font-medium"><span>✨ Générer réponse</span></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500"><p>Sélectionnez une vidéo</p></div>
        )}
      </main>

      {/* MODAL AVANCÉ */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">✨ Générateur de réponse IA</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Commentaire reçu (Toujours visible) */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Commentaire reçu</p>
                <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                  <img src={selectedComment.authorImage} alt={selectedComment.author} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 mb-1">{selectedComment.author}</p>
                    <p className="text-gray-700 italic">"{selectedComment.text}"</p>
                  </div>
                </div>
              </div>

              {/* VUE 1 : CONFIGURATION (Choix du ton) */}
              {viewMode === 'setup' && !generating && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Choisir le ton</p>
                    <Link href="/settings" className="text-xs text-purple-600 hover:text-purple-700">Paramètres ⌄</Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[{ v: "amical", l: "Amical", i: "😊" }, { v: "professionnel", l: "Professionnel", i: "💼" }, { v: "fun", l: "Fun", i: "🎉" }, { v: "educatif", l: "Éducatif", i: "📚" }].map((t) => (
                      <button key={t.v} onClick={() => setSelectedTone(t.v)} className={`${selectedTone === t.v ? "bg-[#8B5CF6] text-white border-[#8B5CF6]" : "bg-white text-gray-700 border-gray-300"} border-2 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-1 transition-all`}>
                        <span>{t.i}</span><span>{t.l}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => startEditing("")} 
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:border-gray-400 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>✏️</span><span>Écrire soi-même</span>
                    </button>
                    <button 
                      onClick={generateReplies} 
                      className="flex-[2] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <span>✨</span><span>Générer 3 suggestions</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VUE CHARGEMENT */}
              {generating && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
                  <p className="text-gray-600">L'IA rédige vos réponses...</p>
                </div>
              )}

              {/* VUE 2 : LISTE DES SUGGESTIONS */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Suggestions générées</p>
                  {replies.map((reply, index) => (
                    <div key={index} onClick={() => startEditing(reply)} className="group border-2 border-gray-200 rounded-lg p-4 hover:border-[#8B5CF6] cursor-pointer transition-all relative">
                      <p className="text-gray-800 pr-8">{reply}</p>
                      <div className="absolute top-4 right-4 text-gray-400 group-hover:text-[#8B5CF6]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <div className="mt-2 text-xs text-[#8B5CF6] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Cliquez pour modifier
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setViewMode('setup')} className="w-full mt-2 text-gray-500 hover:text-gray-800 text-sm py-2">
                    🔄 Changer de ton / Recommencer
                  </button>
                </div>
              )}

              {/* VUE 3 : ÉDITEUR MANUEL */}
              {viewMode === 'editor' && (
                <div className="animate-fadeIn">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Votre réponse</p>
                  <textarea
                    value={draftReply}
                    onChange={(e) => setDraftReply(e.target.value)}
                    className="w-full h-32 p-4 border-2 border-[#8B5CF6] rounded-xl focus:outline-none text-gray-800 text-base shadow-sm resize-none"
                    placeholder="Écrivez votre réponse ici..."
                    autoFocus
                  />
                  
                  {replies.length > 0 && (
                    <button onClick={() => setViewMode('list')} className="text-sm text-gray-500 hover:text-[#8B5CF6] mt-2 underline">
                      Choisir une autre suggestion
                    </button>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => replies.length > 0 ? setViewMode('list') : setViewMode('setup')}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={postReply}
                      disabled={posting || !draftReply.trim()}
                      className="px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {posting ? (
                        <><span>Envoi...</span></>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span>Valider la réponse</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl border animate-fadeIn ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <p className="font-bold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}