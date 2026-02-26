import { useState, useEffect } from "react";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-8">
      <div className={`max-w-2xl text-center transition-all duration-1000 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Animated phone icon */}
        <div className="text-8xl mb-8 animate-bounce">📱</div>
        
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Les Secrets du Téléphone
        </h1>
        
        <p className="text-xl text-slate-300 mb-4 leading-relaxed">
          Découvrez les mystères qui se cachent derrière l'objet que vous utilisez chaque jour.
        </p>
        
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          À travers <span className="text-cyan-400 font-semibold">5 niveaux interactifs</span>, explorez l'histoire, 
          la chimie, la psychologie, l'ingénierie et la physique du téléphone cellulaire. 
          Chaque niveau vous plonge dans une discipline scientifique différente avec des mini-jeux éducatifs.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: "📜", label: "Histoire" },
            { icon: "🧪", label: "Chimie" },
            { icon: "🧠", label: "Psychologie" },
            { icon: "🔧", label: "Ingénierie" },
            { icon: "📡", label: "Physique" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-2xl 
            hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 
            shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95"
        >
          🚀 Commencer l'aventure
        </button>
        
        <p className="text-sm text-slate-500 mt-6">Un jeu éducatif interactif</p>
      </div>
    </div>
  );
}
