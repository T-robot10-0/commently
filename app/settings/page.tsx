"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [defaultTone, setDefaultTone] = useState("amical");
  const [customInstructions, setCustomInstructions] = useState("");
  const [saved, setSaved] = useState(false);

  // Liste complète des tons
  const tones = [
    { value: "amical", label: "Amical" },
    { value: "professionnel", label: "Professionnel" },
    { value: "fun", label: "Fun" },
    { value: "educatif", label: "Éducatif" },
    { value: "motivant", label: "Motivant" },
    { value: "humoristique", label: "Humoristique" },
  ];

  useEffect(() => {
    const savedTone = localStorage.getItem("defaultTone") || "amical";
    const savedInstructions = localStorage.getItem("customInstructions") || "";
    setDefaultTone(savedTone);
    setCustomInstructions(savedInstructions);
  }, []);

  const handleSave = () => {
    localStorage.setItem("defaultTone", defaultTone);
    localStorage.setItem("customInstructions", customInstructions);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white flex">
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
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span>Dashboard</span>
          </Link>
          
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-[#8B5CF6] font-medium relative">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B5CF6] rounded-r"></div>
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

      <div className="flex-1 max-w-2xl mx-auto w-full p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">⚙️ Paramètres de l'IA</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Ton par défaut</label>
            <div className="grid grid-cols-3 gap-3">
              {tones.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setDefaultTone(tone.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                    defaultTone === tone.value ? "bg-[#8B5CF6] text-white border-[#8B5CF6]" : "bg-white text-gray-700 hover:border-purple-300"
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Instructions personnalisées (Prompt Système)</label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Ex: Signe toujours par 'L'équipe Squeezie'."
              className="w-full h-32 px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B5CF6] outline-none resize-none placeholder-gray-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {saved ? <span className="text-green-600 font-medium animate-fadeIn">✅ Sauvegardé !</span> : <span></span>}
            <button onClick={handleSave} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}