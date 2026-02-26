import { useState, useEffect } from "react";

interface LevelProps {
  onComplete: () => void;
  onNext: () => void;
}

const TIMELINE = [
  {
    year: "1876", name: "Téléphone de Bell", emoji: "📞",
    desc: "Premier appareil téléphonique inventé par Alexander Graham Bell. La voix est transmise électriquement via un fil de cuivre. Construit en bois et métal, il nécessite des opératrices manuelles pour connecter les appels. Une révolution dans la communication humaine.",
    color: "from-amber-700 to-amber-900",
  },
  {
    year: "1920s", name: "Téléphone à cadran rotatif", emoji: "☎️",
    desc: "L'expansion massive des réseaux filaires transforme la société. Les commutateurs automatiques remplacent les opératrices. Le cadran rotatif en bakélite noire devient un symbole de modernité. Les foyers s'équipent progressivement.",
    color: "from-amber-600 to-amber-800",
  },
  {
    year: "1960s", name: "Téléphone à touches (Touch-Tone)", emoji: "📟",
    desc: "Le cadran rotatif cède sa place aux touches, rendant la composition plus rapide. Le système utilise des tonalités DTMF (Dual-Tone Multi-Frequency). Chaque touche émet une combinaison unique de deux fréquences. Le design se modernise avec des couleurs variées.",
    color: "from-teal-600 to-teal-800",
  },
  {
    year: "1983", name: "Motorola DynaTAC 8000X", emoji: "📱",
    desc: "Le premier téléphone portable analogique au monde ! Pesant environ 800g avec une autonomie limitée à 30 minutes de conversation, il coûtait l'équivalent de 10 000$ actuels. Réservé à l'élite professionnelle, il symbolise le début de la révolution mobile.",
    color: "from-blue-600 to-blue-800",
  },
  {
    year: "1992", name: "Nokia 1011 (GSM 2G)", emoji: "📲",
    desc: "Le passage au numérique révolutionne les télécommunications. Le signal analogique est remplacé par des données numériques, améliorant la qualité et la sécurité. L'apparition du SMS change notre façon de communiquer. Les téléphones deviennent plus petits et légers.",
    color: "from-indigo-600 to-indigo-800",
  },
  {
    year: "2000", name: "Nokia 3310", emoji: "🐍",
    desc: "Un véritable phénomène culturel ! Réputé pour sa robustesse légendaire, il introduit le jeu Snake qui captive des millions de joueurs. Le SMS devient omniprésent. Le téléphone se transforme en objet personnel et intime, reflet de l'identité de son propriétaire.",
    color: "from-violet-600 to-violet-800",
  },
  {
    year: "2007", name: "iPhone (1re génération)", emoji: "🍎",
    desc: "Steve Jobs révolutionne l'industrie avec le premier iPhone. L'écran tactile multipoint remplace le clavier physique. Les applications transforment le téléphone en véritable ordinateur de poche. Internet mobile 3G, musique, photos : la convergence multimédia est née.",
    color: "from-pink-600 to-pink-800",
  },
  {
    year: "2012", name: "Téléphone intelligent 4G", emoji: "🌐",
    desc: "La vidéo en continu, la visioconférence et les réseaux sociaux explosent grâce au réseau 4G. L'appareil photo haute résolution remplace les appareils dédiés. Le téléphone intelligent remplace progressivement le GPS, le réveil, la calculatrice, le lecteur MP3 et même le portefeuille.",
    color: "from-orange-500 to-orange-700",
  },
  {
    year: "2020+", name: "Téléphone intelligent 5G", emoji: "🚀",
    desc: "Débits très élevés et faible latence ouvrent la porte à la réalité augmentée, aux objets connectés et au paiement mobile. Le téléphone devient une extension de notre identité numérique. Le futur : montres connectées, lunettes de réalité augmentée, intelligence artificielle embarquée.",
    color: "from-cyan-500 to-cyan-700",
  },
];

export function Level1({ onComplete, onNext }: LevelProps) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowInfo(true), 300);
  }, []);

  const handleUpgrade = () => {
    if (animating || step >= TIMELINE.length - 1) return;
    setAnimating(true);
    setShowInfo(false);
    setTimeout(() => {
      setStep(s => s + 1);
      setAnimating(false);
      setTimeout(() => setShowInfo(true), 200);
    }, 500);
  };

  useEffect(() => {
    if (step === TIMELINE.length - 1 && !completed) {
      setCompleted(true);
      onComplete();
    }
  }, [step, completed, onComplete]);

  const current = TIMELINE[step];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">📜 Niveau 1 : L'Historien</h2>
        <p className="text-slate-400 text-lg">L'Évolution du Téléphone</p>
      </div>

      {/* Main phone display */}
      <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
        {/* Phone visual */}
        <div className="flex-1 flex flex-col items-center">
          <div className={`transition-all duration-500 ${animating ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"}`}>
            <div className={`w-48 h-64 rounded-3xl bg-gradient-to-b ${current.color} flex flex-col items-center justify-center shadow-2xl border-2 border-white/20 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/5"></div>
              <span className="text-7xl mb-2 relative z-10">{current.emoji}</span>
              <span className="text-2xl font-bold text-white relative z-10">{current.year}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mt-4">{current.name}</h3>
          
          {/* Upgrade button */}
          {step < TIMELINE.length - 1 ? (
            <button
              onClick={handleUpgrade}
              disabled={animating}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-xl
                hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300
                shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              ⬆ Mise à jour
            </button>
          ) : (
            <div className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-lg font-bold rounded-xl shadow-lg">
              ✨ Dernière évolution atteinte !
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className={`flex-1 transition-all duration-500 ${showInfo ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{current.emoji}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{current.name}</h3>
                <span className="text-cyan-400 text-sm font-medium">{current.year}</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-base">{current.desc}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 overflow-visible">
        <div className="flex items-center overflow-x-auto py-3 px-2" style={{ overflow: 'visible' }}>
          {TIMELINE.map((item, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                i <= step ? "opacity-100" : "opacity-30"
              } ${i === step ? "scale-125" : "scale-100"}`}
                onClick={() => { if (i <= step) { setShowInfo(false); setTimeout(() => { setStep(i); setShowInfo(true); }, 200); } }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                  i === step ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-slate-800" :
                  i < step ? "border-green-400 bg-green-500/20" : "border-slate-600 bg-slate-800"
                }`}>
                  {i < step ? "✓" : item.emoji}
                </div>
                <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i === step ? "text-cyan-400" : i < step ? "text-green-400" : "text-slate-500"}`}>
                  {item.year}
                </span>
              </div>
              {i < TIMELINE.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 transition-all ${i < step ? "bg-green-500" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completion message */}
      {completed && (
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl p-6 inline-block max-w-2xl">
            <h3 className="text-2xl font-bold text-green-400 mb-3">🎉 Félicitations !</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              En 150 ans, le téléphone est passé d'une invention expérimentale à une extension naturelle de notre quotidien.
              De simple outil de communication vocale, il est devenu un ordinateur de poche indispensable qui concentre des dizaines de fonctions.
            </p>
            <button
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl
                hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                shadow-lg shadow-cyan-500/30 active:scale-95"
            >
              Niveau suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
