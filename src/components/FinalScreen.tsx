import { useState, useEffect } from "react";

interface FinalScreenProps {
  level3Scores: { without: number; with: number } | null;
  onRestart: () => void;
}

export function FinalScreen({ level3Scores, onRestart }: FinalScreenProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
      <div className={`max-w-3xl w-full transition-all duration-1000 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Certificate */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-tl-full" />

          <div className="text-center relative z-10">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2">
              Certificat de Réussite
            </h1>
            <p className="text-slate-400 text-sm mb-6">Les Secrets du Téléphone</p>

            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6" />

            <p className="text-xl text-white mb-8">
              Félicitations ! Vous avez complété les <span className="text-cyan-400 font-bold">5 niveaux</span> du jeu éducatif.
            </p>

            {/* Summary of learnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left">
              {[
                { icon: "📜", title: "Histoire", desc: "150 ans d'évolution, du fil de cuivre à la 5G" },
                { icon: "🧪", title: "Chimie / Écologie", desc: "L'impact environnemental et l'importance du recyclage" },
                { icon: "🧠", title: "Psychologie", desc: "L'algorithme contre le cerveau : dopamine et bien-être" },
                { icon: "🔧", title: "Ingénierie", desc: "Les 10 composants essentiels d'un smartphone" },
                { icon: "📡", title: "Physique", desc: "Les ondes micro-ondes et la communication cellulaire" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/50 flex gap-3 items-start">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="text-white font-bold text-sm">{item.title}</h4>
                    <p className="text-slate-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Level 3 scores if available */}
            {level3Scores && (
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-4 mb-6">
                <h4 className="text-purple-400 font-bold text-sm mb-2">🧠 Vos résultats : L'Algorithme contre le Cerveau</h4>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-emerald-400 font-bold">{level3Scores.without}%</span>
                    <span className="text-slate-400 ml-1">bien-être final</span>
                  </div>
                  <div>
                    <span className="text-pink-400 font-bold">{level3Scores.with}%</span>
                    <span className="text-slate-400 ml-1">dopamine finale</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-slate-300 text-sm leading-relaxed">
                Le téléphone est bien plus qu'un simple objet : c'est un concentré d'histoire, de science, 
                d'ingénierie et de psychologie. Utilisez-le de manière responsable et consciente ! 🌟
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={onRestart}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl
                  hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                  shadow-lg shadow-cyan-500/30 active:scale-95"
              >
                🔄 Recommencer l'aventure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
