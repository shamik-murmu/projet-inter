import { useState, useCallback, useEffect } from "react";

interface LevelProps {
  onComplete: () => void;
  onNext: () => void;
}

interface PhoneComponent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  desc: string;
  // Position inside the phone (percentages)
  top: number;
  left: number;
  width: number;
  height: number;
  shape: "rect" | "circle" | "oval" | "strip";
}

// Components with realistic positions inside a phone
const COMPONENTS: PhoneComponent[] = [
  {
    id: "camera",
    name: "Caméra arrière",
    emoji: "📷",
    color: "border-purple-500",
    bgColor: "bg-purple-600/30",
    desc: "Capture la lumière et la convertit en image numérique.",
    top: 3, left: 30, width: 14, height: 8,
    shape: "circle",
  },
  {
    id: "antenna",
    name: "Antenne",
    emoji: "📡",
    color: "border-red-500",
    bgColor: "bg-red-600/30",
    desc: "Émet et reçoit les ondes radio pour la communication.",
    top: 2, left: 55, width: 40, height: 5,
    shape: "strip",
  },
  {
    id: "cpu",
    name: "Processeur (SoC)",
    emoji: "⚡",
    color: "border-blue-500",
    bgColor: "bg-blue-600/30",
    desc: "Exécute les calculs. Contient CPU, GPU et modem.",
    top: 14, left: 30, width: 22, height: 12,
    shape: "rect",
  },
  {
    id: "ram",
    name: "Mémoire (RAM)",
    emoji: "💾",
    color: "border-amber-500",
    bgColor: "bg-amber-600/30",
    desc: "Stocke les données temporaires (RAM) et permanentes (stockage).",
    top: 14, left: 56, width: 20, height: 12,
    shape: "rect",
  },
  {
    id: "wifi",
    name: "Wi-Fi / Bluetooth",
    emoji: "📶",
    color: "border-cyan-500",
    bgColor: "bg-cyan-600/30",
    desc: "Permet la communication sans fil à courte portée.",
    top: 28, left: 56, width: 18, height: 10,
    shape: "rect",
  },
  {
    id: "pcb",
    name: "Carte mère (PCB)",
    emoji: "🟩",
    color: "border-emerald-500",
    bgColor: "bg-emerald-600/20",
    desc: "Le « cerveau » du téléphone. Connecte tous les composants.",
    top: 30, left: 8, width: 44, height: 18,
    shape: "rect",
  },
  {
    id: "screen",
    name: "Écran (OLED)",
    emoji: "📺",
    color: "border-indigo-500",
    bgColor: "bg-indigo-600/15",
    desc: "Affiche les images grâce à des millions de pixels.",
    top: 3, left: 3, width: 94, height: 94,
    shape: "rect",
  },
  {
    id: "battery",
    name: "Batterie (Li-ion)",
    emoji: "🔋",
    color: "border-green-500",
    bgColor: "bg-green-600/20",
    desc: "Stocke l'énergie électrique. Composée de lithium.",
    top: 58, left: 8, width: 84, height: 26,
    shape: "rect",
  },
  {
    id: "speaker",
    name: "Haut-parleur",
    emoji: "🔊",
    color: "border-orange-500",
    bgColor: "bg-orange-600/30",
    desc: "Convertit les signaux électriques en ondes sonores.",
    top: 87, left: 15, width: 28, height: 8,
    shape: "oval",
  },
  {
    id: "mic",
    name: "Microphone",
    emoji: "🎤",
    color: "border-pink-500",
    bgColor: "bg-pink-600/30",
    desc: "Capte les ondes sonores et les convertit en signaux électriques.",
    top: 87, left: 60, width: 10, height: 8,
    shape: "circle",
  },
];

// Shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Level4({ onComplete, onNext }: LevelProps) {
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [errorSlot, setErrorSlot] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [phoneOn, setPhoneOn] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shuffledComponents] = useState(() => shuffleArray(COMPONENTS));

  const placedCount = Object.values(placed).filter(Boolean).length;

  useEffect(() => {
    if (placedCount === 10 && !completed) {
      setCompleted(true);
      setTimeout(() => setPhoneOn(true), 500);
      onComplete();
    }
  }, [placedCount, completed, onComplete]);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDrop = useCallback((slotId: string) => {
    const activeId = draggedId || selectedId;
    if (!activeId) return;
    if (activeId === slotId) {
      setPlaced(prev => ({ ...prev, [activeId]: true }));
      setDraggedId(null);
      setSelectedId(null);
    } else {
      setErrorSlot(slotId);
      setTimeout(() => setErrorSlot(null), 600);
      setDraggedId(null);
    }
  }, [draggedId, selectedId]);

  const handleSlotClick = useCallback((slotId: string) => {
    if (selectedId) {
      if (selectedId === slotId) {
        setPlaced(prev => ({ ...prev, [selectedId]: true }));
        setSelectedId(null);
      } else {
        setErrorSlot(slotId);
        setTimeout(() => setErrorSlot(null), 600);
      }
    }
  }, [selectedId]);

  const getSlotRounding = (shape: string) => {
    if (shape === "circle") return "rounded-full";
    if (shape === "oval") return "rounded-full";
    if (shape === "strip") return "rounded-md";
    return "rounded-lg";
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="text-center mb-5">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🔧 Niveau 4 : L'Ingénieur</h2>
        <p className="text-slate-400 text-lg">Assemble le Smartphone</p>
        <div className="mt-3">
          <span className="text-white font-bold text-lg">{placedCount}/10</span>
          <span className="text-slate-400 text-sm ml-2">composants placés</span>
          <div className="w-48 h-2 bg-slate-700 rounded-full mx-auto mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(placedCount / 10) * 100}%` }} />
          </div>
        </div>
      </div>

      {selectedId && (
        <div className="text-center mb-3">
          <span className="inline-block px-4 py-1.5 bg-cyan-900/50 border border-cyan-500/40 rounded-full text-cyan-300 text-sm font-medium animate-pulse">
            🔧 Sélectionné : {COMPONENTS.find(c => c.id === selectedId)?.emoji} {COMPONENTS.find(c => c.id === selectedId)?.name} — Cliquez sur l'emplacement correct
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Components panel - scattered grid layout */}
        <div className="lg:w-80 w-full">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">📦 Composants disponibles</h3>
          <div className="grid grid-cols-2 gap-2">
            {shuffledComponents.map(comp => {
              if (placed[comp.id]) return (
                <div key={comp.id} className="px-3 py-2 bg-green-900/20 border border-green-500/20 rounded-lg opacity-40 text-sm flex items-center gap-2">
                  <span className="text-lg">{comp.emoji}</span>
                  <span className="text-green-300 line-through text-xs">{comp.name}</span>
                </div>
              );
              return (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={() => handleDragStart(comp.id)}
                  onClick={() => setSelectedId(selectedId === comp.id ? null : comp.id)}
                  onMouseEnter={() => setHoveredComponent(comp.id)}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className={`relative px-3 py-2.5 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all text-sm flex items-center gap-2 ${
                    selectedId === comp.id
                      ? "border-cyan-400 bg-cyan-900/40 shadow-lg shadow-cyan-500/20 scale-105"
                      : "border-slate-600 bg-slate-800 hover:border-cyan-500 hover:bg-slate-700/80"
                  }`}
                >
                  <span className="text-xl">{comp.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium text-xs block truncate">{comp.name}</span>
                  </div>
                  {/* Tooltip */}
                  {hoveredComponent === comp.id && (
                    <div className="absolute left-full ml-2 top-0 z-30 bg-slate-900 border border-slate-600 rounded-lg p-3 w-52 shadow-xl pointer-events-none">
                      <p className="text-xs text-cyan-300 font-bold mb-1">{comp.name}</p>
                      <p className="text-xs text-slate-300">{comp.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phone assembly area — realistic layout */}
        <div className="flex-1 flex justify-center">
          <div className={`relative transition-all duration-1000 ${phoneOn ? "scale-95" : ""}`}>
            {/* Phone chassis */}
            <div className={`relative w-72 md:w-80 rounded-[2.5rem] border-4 transition-all duration-500 overflow-hidden ${
              phoneOn ? "border-cyan-400 shadow-2xl shadow-cyan-500/30" : "border-slate-500"
            }`}>
              {phoneOn ? (
                /* Phone ON screen */
                <div className="bg-gradient-to-b from-cyan-900 to-blue-950 p-6 flex flex-col items-center justify-center" style={{ height: 540 }}>
                  <div className="text-6xl mb-4 animate-bounce">📱</div>
                  <div className="text-white text-xl font-bold mb-1">Smartphone Activé !</div>
                  <div className="text-cyan-300 text-sm mb-4">12:00</div>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <div className="flex flex-col items-center"><span className="text-2xl">📞</span><span className="text-[10px] text-slate-400">Téléphone</span></div>
                    <div className="flex flex-col items-center"><span className="text-2xl">📧</span><span className="text-[10px] text-slate-400">Messages</span></div>
                    <div className="flex flex-col items-center"><span className="text-2xl">📷</span><span className="text-[10px] text-slate-400">Caméra</span></div>
                    <div className="flex flex-col items-center"><span className="text-2xl">🌐</span><span className="text-[10px] text-slate-400">Internet</span></div>
                  </div>
                  <div className="mt-8 w-28 h-1 bg-white/30 rounded-full" />
                </div>
              ) : (
                /* Internal view with realistic slot positions */
                <div className="relative bg-slate-800" style={{ height: 540 }}>
                  {/* Header label */}
                  <div className="absolute top-0 left-0 right-0 z-10 text-center pt-1">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Vue interne</span>
                  </div>

                  {/* Circuit trace decorations */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 320 540">
                    <line x1="160" y1="0" x2="160" y2="540" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="270" x2="320" y2="270" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="80" y1="0" x2="80" y2="540" stroke="#22d3ee" strokeWidth="0.3" strokeDasharray="2 6" />
                    <line x1="240" y1="0" x2="240" y2="540" stroke="#22d3ee" strokeWidth="0.3" strokeDasharray="2 6" />
                    {/* circuit traces */}
                    <path d="M 40 100 L 40 200 L 160 200 L 160 300 L 280 300" fill="none" stroke="#22d3ee" strokeWidth="0.3" />
                    <path d="M 280 80 L 200 80 L 200 160 L 120 160" fill="none" stroke="#22d3ee" strokeWidth="0.3" />
                  </svg>

                  {/* Render screen slot first (background layer) then other slots on top */}
                  {(() => {
                    const screenComp = COMPONENTS.find(c => c.id === "screen")!;
                    const otherComps = COMPONENTS.filter(c => c.id !== "screen");
                    const renderSlot = (comp: PhoneComponent, zClass: string) => {
                      const isPlaced = placed[comp.id];
                      const isError = errorSlot === comp.id;
                      const isScreen = comp.id === "screen";
                      return (
                        <div
                          key={comp.id}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDrop(comp.id)}
                          onClick={() => handleSlotClick(comp.id)}
                          className={`absolute transition-all duration-300 flex items-center justify-center cursor-pointer ${zClass}
                            ${getSlotRounding(comp.shape)}
                            ${isPlaced
                              ? isScreen
                                ? "border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-950/60 to-slate-900/60 border-solid"
                                : `border-2 ${comp.color} ${comp.bgColor} border-solid`
                              : isError
                              ? "border-2 border-dashed border-red-500 bg-red-900/30 animate-[shake_0.3s_ease-in-out]"
                              : isScreen
                              ? "border-2 border-dashed border-indigo-400/30 bg-indigo-900/5 hover:border-indigo-400/60 hover:bg-indigo-900/15"
                              : selectedId
                              ? "border-2 border-dashed border-slate-500 hover:border-cyan-400 hover:bg-cyan-900/10 bg-slate-700/30"
                              : "border-2 border-dashed border-slate-600 bg-slate-700/20 hover:border-slate-400"
                            }`}
                          style={{
                            top: `${comp.top}%`,
                            left: `${comp.left}%`,
                            width: `${comp.width}%`,
                            height: `${comp.height}%`,
                          }}
                          title={comp.desc}
                        >
                          {isPlaced ? (
                            isScreen ? (
                              <div className="flex flex-col items-center justify-center text-center opacity-30">
                                <span className="text-2xl">📺</span>
                                <span className="text-[10px] text-indigo-300 font-medium mt-1">Écran (OLED)</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center px-1">
                                <span className="text-sm md:text-base">{comp.emoji}</span>
                                <span className="text-[8px] md:text-[9px] text-white/80 font-medium leading-tight mt-0.5">{comp.name}</span>
                              </div>
                            )
                          ) : isError ? (
                            <span className="text-xs text-red-400 font-bold">❌</span>
                          ) : isScreen ? (
                            <span className="text-xs text-indigo-400/50 text-center px-1 leading-tight">Écran (glissez ici)</span>
                          ) : (
                            <span className="text-[9px] text-slate-500 text-center px-1 leading-tight">{comp.name}</span>
                          )}
                        </div>
                      );
                    };
                    return (
                      <>
                        {renderSlot(screenComp, "z-0")}
                        {otherComps.map(comp => renderSlot(comp, "z-10"))}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shake animation keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>

      {/* Completion */}
      {completed && phoneOn && (
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl p-6 inline-block max-w-2xl">
            <h3 className="text-2xl font-bold text-green-400 mb-3">🎉 Bravo !</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vous avez assemblé un smartphone fonctionnel ! Chaque composant joue un rôle essentiel dans le fonctionnement 
              de cet appareil complexe qui contient plus de puissance de calcul que les ordinateurs qui ont envoyé l'homme sur la Lune.
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
