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

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 2. ÉCRAN DE CHARGEMENT
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

 // 3. LANDING PAGE COMPLÈTE
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white">
        {/* Navbar */}
        <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Co</span>
                </div>
                <span className="text-gray-900 font-bold text-xl">Commently</span>
              </div>
              <button onClick={() => signIn("google")} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                Connexion Bêta
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold mb-6 border border-purple-100">
              🚀 Accès Bêta Privé Disponible
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Vos commentaires YouTube <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-indigo-600">
                gérés par l'IA
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
              Ne perdez plus 2h par jour à répondre. Commently analyse le sentiment, détecte le spam et rédige des réponses authentiques en un clic.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-3 bg-[#111827] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-black transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>Rejoindre la Bêta avec YouTube</span>
              </button>
              <p className="text-sm text-gray-500">🔒 Validé par Google • Aucune CB requise</p>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none opacity-40">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Pourquoi utiliser Commently ?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-2xl">✨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Réponses IA Contextuelles</h3>
                <p className="text-gray-600">L'IA analyse le contexte de la vidéo et du commentaire pour suggérer 3 réponses pertinentes (Fun, Pro, Amical).</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 text-2xl">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Anti-Spam & Insultes</h3>
                <p className="text-gray-600">Masquez automatiquement les arnaques crypto, les liens douteux et les insultes avant que votre communauté ne les voie.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-2xl">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Tri Prioritaire</h3>
                <p className="text-gray-600">Ne ratez plus jamais une question importante ou une opportunité de collab noyée dans la masse.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / Reassurance */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Questions Fréquentes</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h4 className="font-bold text-gray-900 mb-2">Est-ce sécurisé ?</h4>
                <p className="text-gray-600">Oui. Nous utilisons l'API officielle de YouTube vérifiée par Google. Nous n'avons jamais accès à votre mot de passe, seulement la permission de lire et répondre aux commentaires.</p>
              </div>
              <div className="border-b border-gray-100 pb-6">
                <h4 className="font-bold text-gray-900 mb-2">Est-ce que l'IA sonne comme un robot ?</h4>
                <p className="text-gray-600">Non. Vous pouvez régler le ton (Amical, Gen Z, Pro) et donner des instructions personnalisées ("Signe toujours par Squeezie") pour que ça vous ressemble.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gray-50 text-center border-t border-gray-200">
          <p className="text-gray-500 text-sm">© 2024 Commently. Fait avec ❤️ pour les créateurs.</p>
        </footer>
      </div>
    );
  }

        {/* Section Problème (Gris) */}
        <section className="py-24 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Le problème des créateurs</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Plus votre chaîne grandit, plus vous passez de temps à faire du support client au lieu de créer.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { emoji: "😫", title: "La fatigue", desc: "Copier-coller 'Merci !' 50 fois par jour n'apporte aucune valeur." },
                { emoji: "📉", title: "L'engagement", desc: "Ignorer les commentaires tue l'algorithme et déçoit vos fans." },
                { emoji: "🤬", title: "Le spam", desc: "Les bots crypto et les insultes polluent votre espace commentaire." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Features (Blanc) */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Une IA qui parle <span className="text-[#8B5CF6]">comme vous</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { title: "6 Tons différents", desc: "Amical, Professionnel, Fun, Sarcasitque... Choisissez votre style." },
                    { title: "Compréhension du contexte", desc: "L'IA analyse la vidéo et le commentaire pour une réponse pertinente." },
                    { title: "Sécurité avant tout", desc: "Rien n'est posté sans votre validation (pour l'instant)." }
                  ].map((feat, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{feat.title}</h4>
                        <p className="text-gray-500">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Simulation Interface */}
              <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                  <div className="flex space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <div className="w-24 h-3 bg-gray-600 rounded mb-1"></div>
                      <div className="w-48 h-3 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">Super vidéo ! Tu utilises quoi comme caméra ? 🤔</div>
                </div>
                <div className="bg-[#8B5CF6] bg-opacity-20 border border-[#8B5CF6] rounded-xl p-4">
                  <div className="text-[#A78BFA] text-xs font-bold mb-2 uppercase">Suggestion IA (Ton: Éducatif)</div>
                  <div className="text-white text-sm mb-3">Merci ! J'utilise une Sony A7III. C'est le top pour commencer ! 📸</div>
                  <div className="flex justify-end">
                    <button className="bg-[#8B5CF6] text-white px-3 py-1 rounded text-xs font-bold">Poster</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 mb-4">© 2024 Commently. Fait avec ❤️ pour les créateurs.</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-900">Confidentialité</a>
              <a href="#" className="hover:text-gray-900">Conditions</a>
              <a href="#" className="hover:text-gray-900">Twitter</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- LOGIQUE METIER DASHBOARD ---

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

  function openModal(comment: any) {
    setSelectedComment(comment);
    setReplies([]);
    setSelectedTone(localStorage.getItem("defaultTone") || "amical");
    setCustomInstructions(localStorage.getItem("customInstructions") || "");
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
        setToast({ message: "✨ Réponses générées !", type: 'success' });
      }
    } catch (error) {
      setToast({ message: "❌ Erreur génération", type: 'error' });
    } finally { setGenerating(false); }
  }

  async function postReply(replyText: string) {
    if (!selectedComment) return;
    setPosting(true);
    try {
      const response = await fetch("/api/youtube/post-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: selectedComment.id, replyText }),
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

  function closeModal() {
    setSelectedComment(null);
    setReplies([]);
  }

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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MILIEU & DROITE (Inchangés) */}
      <aside className="w-[380px] bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mes Vidéos</h2>
            <button onClick={fetchComments} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          <input type="text" placeholder="Chercher une vidéo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-gray-900" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {videos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase())).map((video, index) => {
              const videoComments = getCommentsForVideo(video.title);
              const urgentCount = videoComments.filter(c => getCommentCategory(c) === 'URGENT').length;
              const isActive = selectedVideo === video.title;
              return (
                <button key={index} onClick={() => setSelectedVideo(video.title)} className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${isActive ? 'bg-purple-50' : ''}`}>
                  <div className="flex space-x-3">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-20 h-14 rounded object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-900'}`}>{video.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{new Date(video.comments[0]?.publishedAt || Date.now()).toLocaleDateString("fr-FR")}</p>
                      {urgentCount > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#FEE2E2] text-red-700">{urgentCount} urgent{urgentCount > 1 ? 's' : ''}</span>}
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo}</h1>
                  <p className="text-sm text-gray-500">{countByCategory.all} Commentaires</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterType('prioritaires')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'prioritaires' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><span>Prioritaires {countByCategory.prioritaires}</span></button>
                <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tous {countByCategory.all}</button>
                <button onClick={() => setFilterType('normal')} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'normal' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><span>Normal {countByCategory.normal}</span></button>
                <button onClick={() => setFilterType('spam')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterType === 'spam' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Spam {countByCategory.spam}</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {filteredComments.map((comment) => {
                const category = getCommentCategory(comment);
                return (
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${category === 'URGENT' ? 'bg-red-100 text-red-700' : category === 'SPAM' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{category}</span>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{comment.text}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1 text-gray-600"><span className="text-sm">❤️ {comment.likeCount || 0}</span></div>
                      <button onClick={() => openModal(comment)} className="flex items-center space-x-2 px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors text-sm font-medium"><span>✨ Générer réponse</span></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500"><p>Sélectionnez une vidéo</p></div>
        )}
      </main>

      {/* MODAL AVEC 6 TONS */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">✨ Générateur de réponse IA</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Commentaire reçu */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Commentaire reçu</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img src={selectedComment.authorImage} alt={selectedComment.author} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 mb-1">{selectedComment.author}</p>
                      <p className="text-gray-700">{selectedComment.text}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choisir le ton (6 TONS) */}
              {replies.length === 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Choisir le ton</p>
                    <Link href="/settings" className="text-xs text-purple-600 hover:text-purple-700">Paramètres →</Link>
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
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-all">
                      <p className="text-gray-800 mb-3">{reply}</p>
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => { navigator.clipboard.writeText(reply); setToast({ message: "📋 Réponse copiée !", type: 'success' }); }} className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1">📋 Copier</button>
                        <button onClick={() => postReply(reply)} disabled={posting} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors">
                          {posting ? "Publication..." : "✅ Poster"}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setReplies([])} className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">
                    🔄 Changer le ton et regénérer
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateReplies}
                  disabled={!selectedTone}
                  className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-300 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>✨</span><span>Générer 3 suggestions</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-800 font-medium">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl border animate-fadeIn ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex items-center space-x-2"><span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span><p className="font-bold">{toast.message}</p></div>
        </div>
      )}
    </div>
  );
}