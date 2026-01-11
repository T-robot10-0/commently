"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AutomationRule {
  id: string;
  category: 'basic' | 'moderation';
  title: string;
  description: string;
  active: boolean;
}

export default function AutomationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // États
  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false); // LE NOUVEAU MODE AUTO
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "auto_reply_thanks",
      category: 'basic',
      title: "Répondre aux \"Merci\"",
      description: "Répondre 'Avec plaisir !' si le commentaire est juste 'Merci'",
      active: true,
    },
    {
      id: "hide_spam_links",
      category: 'moderation',
      title: "Masquer les Liens (Spam)",
      description: "Masquer si contient 'http://', 'https://' ou 'www.'",
      active: true,
    },
    {
      id: "block_insults",
      category: 'moderation',
      title: "Masquer les insultes (Blacklist)",
      description: "Masquer les mots de la liste interdite",
      active: true,
    },
  ]);

  const [blacklistWords, setBlacklistWords] = useState<string[]>([
    "arnaque", "connard", "merde", "scam", "telegram", "crypto"
  ]);
  const [newWord, setNewWord] = useState("");

  // Initialisation
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    const savedRules = localStorage.getItem("automationRules_v3");
    const savedBlacklist = localStorage.getItem("blacklistWords_v3");
    if (savedRules) setRules(JSON.parse(savedRules));
    if (savedBlacklist) setBlacklistWords(JSON.parse(savedBlacklist));
  }, [status, router]);

  // --- GESTION DU MODE AUTO (BOUCLE) ---
  useEffect(() => {
    if (autoMode) {
      // Lancer tout de suite
      runAutomation();
      // Puis toutes les 60 secondes
      intervalRef.current = setInterval(() => {
        runAutomation();
      }, 60000); // 60000 ms = 1 minute
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoMode]);

  function toggleRule(id: string) {
    const updatedRules = rules.map(rule => rule.id === id ? { ...rule, active: !rule.active } : rule);
    setRules(updatedRules);
    localStorage.setItem("automationRules_v3", JSON.stringify(updatedRules));
  }

  function addBlacklistWord() {
    if (newWord.trim()) {
      const updated = [...blacklistWords, newWord.trim().toLowerCase()];
      setBlacklistWords(updated);
      localStorage.setItem("blacklistWords_v3", JSON.stringify(updated));
      setNewWord("");
    }
  }

  function removeBlacklistWord(word: string) {
    const updated = blacklistWords.filter(w => w !== word);
    setBlacklistWords(updated);
    localStorage.setItem("blacklistWords_v3", JSON.stringify(updated));
  }

  // --- LE MOTEUR ---
  async function runAutomation() {
    if (running) return; // Évite les doubles clics
    setRunning(true);
    
    try {
      const response = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules: rules.filter(r => r.active).map(r => r.id),
          blacklist: blacklistWords
        }),
      });
      const data = await response.json();
      
      const time = new Date().toLocaleTimeString();
      setLastRunTime(time);

      if (data.success) {
        setReport(`✅ ${time} : ${data.replied} réponses, ${data.moderated} modérés.`);
      } else {
        setReport(`❌ Erreur : ${data.error || "Problème inconnu"}`);
        // Si erreur grave, on coupe le mode auto par sécurité
        if (autoMode) setAutoMode(false);
      }
    } catch (error) {
      setReport("❌ Erreur de connexion au serveur.");
    } finally {
      setRunning(false);
    }
  }

  if (status === "loading") return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white flex">
      {/* SIDEBAR */}
      <aside className="w-[250px] bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">CommentAI</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"><span>Dashboard</span></Link>
          <Link href="/automation" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-[#8B5CF6] font-medium"><span>Automatisation</span></Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"><span>Paramètres</span></Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 bg-[#F9FAFB] overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pilote Automatique</h1>
              <p className="text-gray-600">Configurez vos règles. Activez le mode auto pour laisser tourner en fond.</p>
            </div>
            
            {/* PANNEAU DE CONTRÔLE */}
            <div className="flex flex-col items-end space-y-3">
              {/* Switch Mode Auto */}
              <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <span className={`text-sm font-bold ${autoMode ? "text-green-600" : "text-gray-500"}`}>
                  {autoMode ? "🟢 MODE AUTO ACTIF" : "⚪ MODE AUTO INACTIF"}
                </span>
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    autoMode ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoMode ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Bouton manuel */}
              <button 
                onClick={runAutomation}
                disabled={running || autoMode}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {running ? "Analyse en cours..." : "▶️ Analyse manuelle (1 fois)"}
              </button>
            </div>
          </div>

          {/* Rapport d'activité */}
          <div className={`mb-6 p-4 rounded-lg font-medium border transition-all ${
            running ? "bg-blue-50 border-blue-100 text-blue-800" :
            report?.includes("❌") ? "bg-red-50 border-red-100 text-red-800" :
            report ? "bg-green-50 border-green-100 text-green-800" : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
            <p>{report || "En attente de la première analyse..."}</p>
            {lastRunTime && <p className="text-xs opacity-70 mt-1">Dernière exécution : {lastRunTime}</p>}
          </div>

          <div className="space-y-6">
            {/* Règles Basiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">⚡ Auto-réponses</h2>
              {rules.filter(r => r.category === 'basic').map(rule => (
                <div key={rule.id} className="flex justify-between items-center py-3 border-b last:border-0 border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{rule.title}</p>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                  </div>
                  <button onClick={() => toggleRule(rule.id)} className={`relative h-6 w-11 rounded-full transition ${rule.active ? "bg-[#8B5CF6]" : "bg-gray-200"}`}>
                    <span className={`block h-4 w-4 bg-white rounded-full transition transform ${rule.active ? "translate-x-6" : "translate-x-1"} mt-1`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Règles Modération */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">🛡️ Modération (Blacklist)</h2>
              {rules.filter(r => r.category === 'moderation').map(rule => (
                <div key={rule.id} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{rule.title}</p>
                      <p className="text-sm text-gray-500">{rule.description}</p>
                    </div>
                    <button onClick={() => toggleRule(rule.id)} className={`relative h-6 w-11 rounded-full transition ${rule.active ? "bg-red-600" : "bg-gray-200"}`}>
                      <span className={`block h-4 w-4 bg-white rounded-full transition transform ${rule.active ? "translate-x-6" : "translate-x-1"} mt-1`} />
                    </button>
                  </div>
                  
                  {rule.id === 'block_insults' && rule.active && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blacklistWords.map(word => (
                          <span key={word} className="px-2 py-1 bg-white border border-red-200 text-red-600 text-sm rounded flex items-center space-x-1">
                            <span>{word}</span>
                            <button onClick={() => removeBlacklistWord(word)} className="font-bold hover:text-red-800">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="Mot interdit..." className="flex-1 border p-2 rounded text-sm text-black" />
                        <button onClick={addBlacklistWord} className="bg-gray-900 text-white px-3 py-2 rounded text-sm">Ajouter</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}