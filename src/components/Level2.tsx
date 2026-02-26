import { useState, useEffect, useCallback, useRef } from "react";

interface LevelProps {
  onComplete: () => void;
  onNext: () => void;
}

const MINERALS = [
  { id: "lithium", name: "Lithium", emoji: "🔋", color: "from-green-400 to-green-600", target: "Batterie", desc: "Pour la batterie Li-ion" },
  { id: "neodyme", name: "Néodyme", emoji: "🧲", color: "from-purple-400 to-purple-600", target: "Haut-parleur", desc: "Pour les aimants" },
  { id: "or", name: "Or", emoji: "✨", color: "from-yellow-400 to-yellow-600", target: "Circuit imprimé", desc: "Pour les circuits" },
];

// Stick figure SVG component
function StickFigure({ action, className = "" }: { action: "idle" | "throwing" | "recycling" | "sad" | "happy"; className?: string }) {
  const baseClass = `transition-all duration-700 ${className}`;

  if (action === "throwing") {
    return (
      <svg viewBox="0 0 100 140" className={baseClass} width="80" height="112">
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="none" stroke="#f59e0b" strokeWidth="3" />
        {/* Sad face */}
        <circle cx="45" cy="18" r="2" fill="#f59e0b" />
        <circle cx="55" cy="18" r="2" fill="#f59e0b" />
        <path d="M 43 27 Q 50 23 57 27" fill="none" stroke="#f59e0b" strokeWidth="2" />
        {/* Body */}
        <line x1="50" y1="32" x2="50" y2="80" stroke="#f59e0b" strokeWidth="3" />
        {/* Arms - throwing motion */}
        <line x1="50" y1="50" x2="20" y2="40" stroke="#f59e0b" strokeWidth="3" />
        <line x1="50" y1="50" x2="80" y2="30" stroke="#f59e0b" strokeWidth="3" />
        {/* Legs */}
        <line x1="50" y1="80" x2="30" y2="120" stroke="#f59e0b" strokeWidth="3" />
        <line x1="50" y1="80" x2="70" y2="120" stroke="#f59e0b" strokeWidth="3" />
        {/* Phone being thrown */}
        <rect x="78" y="18" width="12" height="18" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="1">
          <animateTransform attributeName="transform" type="translate" values="0,0; 30,60; 60,120" dur="1.5s" fill="freeze" />
          <animate attributeName="opacity" values="1;1;0.3" dur="1.5s" fill="freeze" />
        </rect>
      </svg>
    );
  }

  if (action === "recycling") {
    return (
      <svg viewBox="0 0 100 140" className={baseClass} width="80" height="112">
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="none" stroke="#22c55e" strokeWidth="3" />
        {/* Happy face */}
        <circle cx="45" cy="18" r="2" fill="#22c55e" />
        <circle cx="55" cy="18" r="2" fill="#22c55e" />
        <path d="M 43 25 Q 50 30 57 25" fill="none" stroke="#22c55e" strokeWidth="2" />
        {/* Body */}
        <line x1="50" y1="32" x2="50" y2="80" stroke="#22c55e" strokeWidth="3" />
        {/* Arms - holding/presenting */}
        <line x1="50" y1="50" x2="25" y2="60" stroke="#22c55e" strokeWidth="3" />
        <line x1="50" y1="50" x2="75" y2="60" stroke="#22c55e" strokeWidth="3" />
        {/* Hands holding recycling symbol */}
        <text x="65" y="68" fontSize="18" className="animate-spin" style={{ transformOrigin: "74px 60px" }}>♻️</text>
        {/* Legs */}
        <line x1="50" y1="80" x2="30" y2="120" stroke="#22c55e" strokeWidth="3" />
        <line x1="50" y1="80" x2="70" y2="120" stroke="#22c55e" strokeWidth="3" />
      </svg>
    );
  }

  if (action === "sad") {
    return (
      <svg viewBox="0 0 100 140" className={baseClass} width="70" height="100">
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="none" stroke="#ef4444" strokeWidth="3" />
        {/* Sad face */}
        <circle cx="45" cy="17" r="2" fill="#ef4444" />
        <circle cx="55" cy="17" r="2" fill="#ef4444" />
        <path d="M 42 28 Q 50 22 58 28" fill="none" stroke="#ef4444" strokeWidth="2" />
        {/* Tear */}
        <circle cx="58" cy="22" r="1.5" fill="#60a5fa">
          <animate attributeName="cy" values="22;30;22" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Body - slouched */}
        <path d="M 50 32 Q 48 55 50 80" fill="none" stroke="#ef4444" strokeWidth="3" />
        {/* Arms - drooping */}
        <line x1="48" y1="50" x2="25" y2="70" stroke="#ef4444" strokeWidth="3" />
        <line x1="50" y1="50" x2="75" y2="70" stroke="#ef4444" strokeWidth="3" />
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="120" stroke="#ef4444" strokeWidth="3" />
        <line x1="50" y1="80" x2="65" y2="120" stroke="#ef4444" strokeWidth="3" />
      </svg>
    );
  }

  if (action === "happy") {
    return (
      <svg viewBox="0 0 100 140" className={baseClass} width="70" height="100">
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="none" stroke="#22c55e" strokeWidth="3" />
        {/* Happy face */}
        <circle cx="45" cy="17" r="2" fill="#22c55e" />
        <circle cx="55" cy="17" r="2" fill="#22c55e" />
        <path d="M 42 24 Q 50 32 58 24" fill="none" stroke="#22c55e" strokeWidth="2" />
        {/* Body */}
        <line x1="50" y1="32" x2="50" y2="80" stroke="#22c55e" strokeWidth="3" />
        {/* Arms - raised in celebration */}
        <line x1="50" y1="48" x2="25" y2="30" stroke="#22c55e" strokeWidth="3" />
        <line x1="50" y1="48" x2="75" y2="30" stroke="#22c55e" strokeWidth="3" />
        {/* Stars around hands */}
        <text x="15" y="28" fontSize="10">✨</text>
        <text x="72" y="28" fontSize="10">✨</text>
        {/* Legs - wide stance */}
        <line x1="50" y1="80" x2="28" y2="120" stroke="#22c55e" strokeWidth="3" />
        <line x1="50" y1="80" x2="72" y2="120" stroke="#22c55e" strokeWidth="3" />
      </svg>
    );
  }

  // idle
  return (
    <svg viewBox="0 0 100 140" className={baseClass} width="70" height="100">
      <circle cx="50" cy="20" r="12" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="45" cy="18" r="2" fill="#94a3b8" />
      <circle cx="55" cy="18" r="2" fill="#94a3b8" />
      <line x1="43" y1="26" x2="57" y2="26" stroke="#94a3b8" strokeWidth="2" />
      <line x1="50" y1="32" x2="50" y2="80" stroke="#94a3b8" strokeWidth="3" />
      <line x1="50" y1="50" x2="25" y2="65" stroke="#94a3b8" strokeWidth="3" />
      <line x1="50" y1="50" x2="75" y2="65" stroke="#94a3b8" strokeWidth="3" />
      <line x1="50" y1="80" x2="30" y2="120" stroke="#94a3b8" strokeWidth="3" />
      <line x1="50" y1="80" x2="70" y2="120" stroke="#94a3b8" strokeWidth="3" />
    </svg>
  );
}

// Animated Landfill Scene
function LandfillScene({ animStep }: { animStep: number }) {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-gray-600 via-gray-800 to-amber-950 transition-all duration-700">
      {/* Polluted sky - darkens with steps */}
      <div className="absolute inset-0 transition-all duration-1000"
        style={{ background: `rgba(127, 29, 29, ${animStep * 0.15})` }} />

      {/* Smoke rising from the ground */}
      {animStep >= 2 && (
        <>
          <div className="absolute bottom-24 left-[25%] w-3 h-10 bg-gradient-to-t from-gray-500/40 to-transparent rounded-full animate-pulse" />
          <div className="absolute bottom-28 left-[60%] w-4 h-12 bg-gradient-to-t from-yellow-700/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: "0.7s" }} />
          <div className="absolute bottom-20 left-[45%] w-2 h-8 bg-gradient-to-t from-gray-400/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: "1.2s" }} />
        </>
      )}

      {/* Toxic drip effects on ground */}
      {animStep >= 2 && (
        <>
          <div className="absolute bottom-14 left-[20%] w-2 h-6 bg-green-500/60 rounded-full animate-pulse" />
          <div className="absolute bottom-12 left-[50%] w-2 h-8 bg-green-400/50 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-16 left-[75%] w-1.5 h-5 bg-yellow-500/50 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        </>
      )}

      {/* Ground layer with trash pile */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-900 to-yellow-900/40 rounded-t-lg" />

      {/* Trash pile - grows progressively */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1 max-w-xs">
        {animStep >= 1 && (
          <>
            <span className="text-2xl transform rotate-12 transition-all duration-500">📱</span>
            <span className="text-xl transform -rotate-12">🔩</span>
          </>
        )}
        {animStep >= 2 && (
          <>
            <span className="text-xl transform rotate-[-20deg]">🔌</span>
            <span className="text-lg transform rotate-45">🪫</span>
            <span className="text-xl">📱</span>
          </>
        )}
        {animStep >= 3 && (
          <>
            <span className="text-2xl">📱</span>
            <span className="text-lg transform -rotate-30">🖥️</span>
            <span className="text-xl transform rotate-12">⌨️</span>
          </>
        )}
      </div>

      {/* Dead/dying trees */}
      {animStep >= 1 && (
        <span className="absolute bottom-16 left-[8%] text-2xl opacity-50 grayscale transition-all duration-700">🌲</span>
      )}
      {animStep >= 2 && (
        <>
          <span className="absolute bottom-16 right-[8%] text-2xl opacity-25 grayscale transition-all duration-700">🌳</span>
          <span className="absolute bottom-16 left-[85%] text-xl opacity-20 grayscale transition-all duration-700">🌲</span>
        </>
      )}

      {/* Danger symbols */}
      {animStep >= 3 && (
        <div className="absolute top-3 right-3 flex gap-2 animate-pulse">
          <span className="text-xl">☠️</span>
          <span className="text-xl">⚠️</span>
        </div>
      )}

      {/* Polluted water at bottom */}
      {animStep >= 2 && (
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-green-800/60 via-yellow-800/60 to-green-800/60 animate-pulse" />
      )}

      {/* Contamination label */}
      {animStep >= 3 && (
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className="bg-red-900/80 text-red-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            ☢️ Contamination des nappes phréatiques
          </span>
        </div>
      )}
    </div>
  );
}

// Animated Recycling Scene
function RecyclingScene({ animStep }: { animStep: number }) {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-700 via-emerald-900 to-green-800 transition-all duration-700">
      {/* Clean sky with sun */}
      {animStep >= 2 && (
        <div className="absolute top-2 right-4 text-3xl transition-all duration-1000" style={{ opacity: animStep >= 3 ? 1 : 0.5 }}>☀️</div>
      )}

      {/* Conveyor belt / processing area */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {animStep === 1 && (
          <div className="flex items-center gap-3 transition-all duration-700 bg-slate-800/60 rounded-xl px-4 py-2">
            <span className="text-2xl">📱</span>
            <span className="text-lg">→</span>
            <span className="text-xl animate-spin" style={{ animationDuration: "2s" }}>⚙️</span>
            <span className="text-lg">→</span>
            <span className="text-lg">?</span>
          </div>
        )}
        {animStep >= 2 && (
          <div className="flex items-center gap-4 transition-all duration-700 bg-slate-800/60 rounded-xl px-4 py-2">
            <div className="flex flex-col items-center">
              <span className="text-xl">🔋</span>
              <span className="text-[10px] text-green-300 font-bold">Li</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl">🧲</span>
              <span className="text-[10px] text-green-300 font-bold">Nd</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl">✨</span>
              <span className="text-[10px] text-green-300 font-bold">Au</span>
            </div>
          </div>
        )}
      </div>

      {/* Recovery progress bars */}
      {animStep >= 3 && (
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6 bg-slate-800/50 rounded-xl px-5 py-3">
          {MINERALS.map((m, i) => (
            <div key={m.id} className="text-center">
              <span className="text-sm font-bold text-green-300">{m.name}</span>
              <div className="w-14 bg-slate-700 rounded-full h-2.5 mt-1">
                <div className="h-full bg-green-400 rounded-full transition-all duration-1000" style={{ width: "80%", transitionDelay: `${i * 300}ms` }} />
              </div>
              <span className="text-[10px] text-green-300 font-bold mt-0.5 block">80%</span>
            </div>
          ))}
        </div>
      )}

      {/* Healthy ground with trees regrowing */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-700 to-transparent" />
      <div className="absolute bottom-3 flex justify-around w-full px-6">
        {animStep >= 2 && <span className="text-2xl transition-all duration-700">🌲</span>}
        {animStep >= 2 && <span className="text-2xl transition-all duration-700" style={{ transitionDelay: "200ms" }}>🌳</span>}
        {animStep >= 3 && <span className="text-lg transition-all duration-700" style={{ transitionDelay: "400ms" }}>🌱</span>}
        {animStep >= 3 && <span className="text-2xl transition-all duration-700" style={{ transitionDelay: "600ms" }}>🌲</span>}
        {animStep >= 3 && <span className="text-lg transition-all duration-700" style={{ transitionDelay: "800ms" }}>🌿</span>}
        {animStep >= 3 && <span className="text-xl transition-all duration-700" style={{ transitionDelay: "1000ms" }}>🌻</span>}
      </div>

      {/* Success badge */}
      {animStep >= 3 && (
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className="bg-green-900/80 text-green-300 px-3 py-1 rounded-full text-xs font-bold">
            ✅ Matériaux récupérés : économie circulaire
          </span>
        </div>
      )}
    </div>
  );
}

export function Level2({ onComplete, onNext }: LevelProps) {
  const [phase, setPhase] = useState(1);
  const [extraction, setExtraction] = useState({ lithium: 0, neodyme: 0, or: 0 });
  const [envDamage, setEnvDamage] = useState(0);
  const [assembled, setAssembled] = useState({ lithium: false, neodyme: false, or: false });
  const [co2, setCo2] = useState(0);
  const [endChoice, setEndChoice] = useState<"none" | "jeter" | "recycler" | "both">("none");
  const [jeterAnimStep, setJeterAnimStep] = useState(0);
  const [recyclerAnimStep, setRecyclerAnimStep] = useState(0);
  const [showJeterResult, setShowJeterResult] = useState(false);
  const [showRecyclerResult, setShowRecyclerResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [readyForPhase3, setReadyForPhase3] = useState(false);
  const [co2Counting, setCo2Counting] = useState(false);
  const co2Ref = useRef(false);

  const allExtracted = extraction.lithium >= 100 && extraction.neodyme >= 100 && extraction.or >= 100;
  const allAssembled = assembled.lithium && assembled.neodyme && assembled.or;

  const extract = useCallback((mineral: string) => {
    setExtraction(prev => {
      const key = mineral as keyof typeof prev;
      if (prev[key] >= 100) return prev;
      const newVal = Math.min(100, prev[key] + 8 + Math.random() * 7);
      return { ...prev, [key]: newVal };
    });
    setEnvDamage(prev => Math.min(100, prev + 1.5));
  }, []);

  // CO2 counting animation when all assembled (but only when triggered)
  useEffect(() => {
    if (co2Counting && !co2Ref.current) {
      co2Ref.current = true;
      const interval = setInterval(() => {
        setCo2(prev => {
          if (prev >= 70) {
            clearInterval(interval);
            setReadyForPhase3(true);
            return 70;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [co2Counting]);

  // Trigger CO2 counting once all assembled
  useEffect(() => {
    if (allAssembled && phase === 2 && !co2Counting) {
      setCo2Counting(true);
    }
  }, [allAssembled, phase, co2Counting]);

  const handleDrop = useCallback((target: string) => {
    if (!draggedItem) return;
    const mineral = MINERALS.find(m => m.id === draggedItem);
    if (mineral && mineral.target === target) {
      setAssembled(prev => ({ ...prev, [draggedItem]: true }));
      setCo2(prev => prev + 8);
    }
    setDraggedItem(null);
  }, [draggedItem]);

  const handleJeter = () => {
    setEndChoice("jeter");
    setShowJeterResult(true);
    // Start animation steps with delays
    setJeterAnimStep(1);
    setTimeout(() => setJeterAnimStep(2), 1000);
    setTimeout(() => setJeterAnimStep(3), 2200);
  };

  const handleRecycler = () => {
    if (endChoice === "none") {
      setEndChoice("recycler");
    } else {
      setEndChoice("both");
    }
    setShowRecyclerResult(true);
    setShowJeterResult(false);
    // Start recycling animation steps
    setRecyclerAnimStep(1);
    setTimeout(() => setRecyclerAnimStep(2), 1000);
    setTimeout(() => {
      setRecyclerAnimStep(3);
      if (!completed) {
        setCompleted(true);
        onComplete();
      }
    }, 2200);
  };

  // Landscape colors based on damage
  const skyColor = envDamage < 30 ? "#1e3a5f" : envDamage < 60 ? "#3d3530" : "#2a1a1a";
  const riverColor = envDamage < 30 ? "#3b82f6" : envDamage < 60 ? "#8B7355" : "#3a2a1a";
  const groundColor = envDamage < 30 ? "#22c55e" : envDamage < 60 ? "#8B8000" : "#5a4a3a";

  const TOTAL_TREES = 12;
  const treeData = [
    { emoji: "🌲", left: 3 },
    { emoji: "🌳", left: 11 },
    { emoji: "🌲", left: 20 },
    { emoji: "🌳", left: 28 },
    { emoji: "🌲", left: 36 },
    { emoji: "🌳", left: 44 },
    { emoji: "🌲", left: 52 },
    { emoji: "🌳", left: 60 },
    { emoji: "🌲", left: 68 },
    { emoji: "🌳", left: 76 },
    { emoji: "🌲", left: 84 },
    { emoji: "🌳", left: 92 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🧪 Niveau 2 : Le Chimiste / Écologiste</h2>
        <p className="text-slate-400 text-lg">Le Cycle de Vie de la Matière</p>
        <div className="flex justify-center gap-4 mt-3">
          {[1, 2, 3].map(p => (
            <div key={p} className={`px-3 py-1 rounded-full text-sm font-medium ${
              p === phase ? "bg-cyan-600 text-white" : p < phase ? "bg-green-600/30 text-green-300" : "bg-slate-700 text-slate-500"
            }`}>
              Phase {p}: {p === 1 ? "Extraction" : p === 2 ? "Fabrication" : "Fin de vie"}
            </div>
          ))}
        </div>
      </div>

      {/* Phase 1: Extraction */}
      {phase === 1 && (
        <div className="space-y-6">
          {/* Landscape */}
          <div className="relative rounded-2xl overflow-hidden h-48 transition-all duration-500" style={{ backgroundColor: skyColor }}>
            {/* Mountains */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 800 200" className="w-full">
                <polygon points="0,200 100,80 200,150 300,60 400,120 500,40 600,100 700,70 800,200" fill="#4a5568" opacity="0.5" />
                <rect x="0" y="150" width="800" height="50" fill={groundColor} className="transition-all duration-500" />
                <rect x="0" y="170" width="800" height="30" fill={riverColor} className="transition-all duration-500" opacity="0.8" />
              </svg>
            </div>
            {/* Trees - disappear one by one as damage increases */}
            <div className="absolute bottom-12 left-0 right-0">
              {treeData.map((tree, i) => {
                const threshold = (i + 1) * (90 / TOTAL_TREES);
                const visible = envDamage < threshold;
                const fading = envDamage >= threshold - 8 && envDamage < threshold;
                return (
                  <span
                    key={i}
                    className="absolute text-3xl transition-all duration-700"
                    style={{
                      left: `${tree.left}%`,
                      bottom: 0,
                      opacity: visible ? (fading ? 0.4 : 1) : 0,
                      transform: visible ? "scale(1) translateY(0)" : "scale(0.3) translateY(20px)",
                    }}
                  >
                    {tree.emoji}
                  </span>
                );
              })}
            </div>
            {envDamage > 40 && (
              <div className="absolute inset-0 bg-orange-900/20 transition-all duration-500" />
            )}
            <div className="absolute top-3 right-3 bg-red-900/80 text-red-300 px-3 py-1 rounded-lg text-sm font-bold">
              ⚠️ Dégâts: {Math.round(envDamage)}%
            </div>
          </div>

          {/* Extraction buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MINERALS.map(mineral => (
              <div key={mineral.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{mineral.emoji}</span>
                  <div>
                    <h4 className="font-bold text-white">{mineral.name}</h4>
                    <p className="text-xs text-slate-400">{mineral.desc}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 mb-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${mineral.color} rounded-full transition-all duration-300`}
                    style={{ width: `${extraction[mineral.id as keyof typeof extraction]}%` }} />
                </div>
                <button
                  onClick={() => extract(mineral.id)}
                  disabled={extraction[mineral.id as keyof typeof extraction] >= 100}
                  className={`w-full py-2 rounded-lg font-bold transition-all active:scale-95 ${
                    extraction[mineral.id as keyof typeof extraction] >= 100
                      ? "bg-green-600/30 text-green-300 cursor-not-allowed"
                      : "bg-gradient-to-r " + mineral.color + " text-white hover:opacity-90 cursor-pointer"
                  }`}
                >
                  {extraction[mineral.id as keyof typeof extraction] >= 100 ? "✓ Extrait" : "⛏️ Extraire"}
                </button>
              </div>
            ))}
          </div>

          {allExtracted && (
            <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-5 text-center space-y-4">
              <p className="text-amber-300 text-sm leading-relaxed">
                💡 L'extraction d'une tonne de lithium nécessite <strong>2 millions de litres d'eau</strong>.
                Les mines de cobalt emploient souvent des enfants dans des conditions dangereuses.
              </p>
              <button
                onClick={() => setPhase(2)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl
                  hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                  shadow-lg shadow-cyan-500/30 active:scale-95 cursor-pointer"
              >
                Phase suivante : Fabrication →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phase 2: Assembly */}
      {phase === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Components to drag */}
            <div className="flex lg:flex-col gap-3">
              {MINERALS.map(mineral => (
                <div
                  key={mineral.id}
                  draggable={!assembled[mineral.id as keyof typeof assembled]}
                  onDragStart={() => setDraggedItem(mineral.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                    assembled[mineral.id as keyof typeof assembled]
                      ? "bg-green-900/30 border-green-500/30 opacity-50"
                      : "bg-slate-800 border-slate-600 hover:border-cyan-500"
                  }`}
                >
                  <span className="text-xl">{mineral.emoji}</span>
                  <span className="text-sm font-medium text-white">{mineral.name}</span>
                </div>
              ))}
            </div>

            {/* Phone silhouette */}
            <div className="relative">
              <div className="w-56 h-80 bg-slate-800 rounded-3xl border-2 border-slate-600 flex flex-col items-center justify-center gap-4 p-4">
                <h4 className="text-slate-400 text-sm font-medium mb-2">📱 Téléphone</h4>
                {[
                  { target: "Batterie", emoji: "🔋", mineral: "lithium" },
                  { target: "Haut-parleur", emoji: "🔊", mineral: "neodyme" },
                  { target: "Circuit imprimé", emoji: "💾", mineral: "or" },
                ].map(slot => (
                  <div
                    key={slot.target}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(slot.target)}
                    className={`w-full py-3 rounded-lg border-2 border-dashed text-center text-sm font-medium transition-all ${
                      assembled[slot.mineral as keyof typeof assembled]
                        ? "border-green-500 bg-green-900/30 text-green-300"
                        : "border-slate-500 text-slate-500 hover:border-cyan-400"
                    }`}
                  >
                    {assembled[slot.mineral as keyof typeof assembled]
                      ? `${slot.emoji} ${slot.target} ✓`
                      : `${slot.emoji} ${slot.target}`}
                  </div>
                ))}

                {/* Mobile touch: tap to place */}
                <div className="lg:hidden text-xs text-slate-500 mt-2">
                  Glissez les matériaux, ou cliquez ci-dessous :
                </div>
                <div className="lg:hidden flex gap-2">
                  {MINERALS.filter(m => !assembled[m.id as keyof typeof assembled]).map(mineral => (
                    <button
                      key={mineral.id}
                      onClick={() => {
                        setAssembled(prev => ({ ...prev, [mineral.id]: true }));
                        setCo2(prev => prev + 8);
                      }}
                      className="px-2 py-1 bg-cyan-700 rounded text-xs text-white cursor-pointer"
                    >
                      + {mineral.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CO2 Counter */}
            <div className="text-center">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6">
                <div className="text-4xl mb-2">🏭</div>
                <h4 className="text-slate-400 text-sm mb-2">Émissions CO₂</h4>
                <div className="text-3xl font-bold text-orange-400">{Math.round(co2)} kg</div>
                <p className="text-xs text-slate-500 mt-2">de CO₂ émis</p>
              </div>
            </div>
          </div>

          {readyForPhase3 && (
            <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-5 text-center space-y-4">
              <p className="text-amber-300 text-sm leading-relaxed">
                💡 La fabrication d'un téléphone ≈ <strong>70 kg de CO₂</strong>.
                80% de l'empreinte carbone d'un téléphone provient de sa fabrication, pas de son utilisation.
              </p>
              <button
                onClick={() => setPhase(3)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl
                  hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                  shadow-lg shadow-cyan-500/30 active:scale-95 cursor-pointer"
              >
                Phase suivante : Fin de vie →
              </button>
            </div>
          )}

          {allAssembled && !readyForPhase3 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm animate-pulse">
                🏭 Calcul des émissions de CO₂ en cours...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Phase 3: End of Life */}
      {phase === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            {/* Initial choice - phone + stick figure + buttons */}
            {!showJeterResult && !showRecyclerResult && (
              <div className="space-y-6 text-center">
                <div className="flex items-end justify-center gap-6">
                  <StickFigure action="idle" />
                  <div className="w-24 h-36 bg-gradient-to-b from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center text-3xl border-2 border-slate-500">
                    📱
                  </div>
                </div>
                <p className="text-slate-300 text-lg font-medium">
                  Votre téléphone a atteint sa fin de vie. Que faites-vous ?
                </p>
                <div className="flex gap-6 justify-center">
                  <button
                    onClick={handleJeter}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold rounded-xl
                      hover:from-red-500 hover:to-red-700 transform hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    🗑️ Jeter
                  </button>
                  <button
                    onClick={handleRecycler}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-lg font-bold rounded-xl
                      hover:from-green-500 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    ♻️ Recycler
                  </button>
                </div>
              </div>
            )}

            {/* JETER - Result with animated scene */}
            {showJeterResult && !showRecyclerResult && (
              <div className="space-y-6 max-w-2xl w-full">
                {/* Stick figure + landfill scene side-by-side */}
                <div className="flex items-stretch gap-4">
                  {/* Stick figure column */}
                  <div className="flex flex-col items-center justify-center gap-2 min-w-[90px]">
                    {jeterAnimStep >= 1 && <StickFigure action="throwing" />}
                    {jeterAnimStep >= 2 && <StickFigure action="sad" />}
                  </div>
                  {/* Scene column - takes most space */}
                  <div className="flex-1">
                    <LandfillScene animStep={jeterAnimStep} />
                  </div>
                </div>
                
                {/* Info that reveals as animation progresses */}
                {jeterAnimStep >= 2 && (
                  <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-6 text-center transition-all duration-700">
                    <h4 className="text-red-400 text-xl font-bold mb-3">🏚️ Décharge à ciel ouvert</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Les métaux lourds contaminent les sols et les nappes phréatiques pendant des <strong>centaines d'années</strong>.
                      Le lithium, le mercure et le plomb s'infiltrent dans les écosystèmes, affectant la faune, la flore et la santé humaine.
                    </p>
                  </div>
                )}

                {jeterAnimStep >= 3 && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 text-center">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🌍</div>
                        <p className="text-xs text-red-300">50M de tonnes de déchets électroniques par an</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">💧</div>
                        <p className="text-xs text-red-300">Contamination des eaux souterraines</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">🫁</div>
                        <p className="text-xs text-red-300">Fumées toxiques inhalées par les populations</p>
                      </div>
                    </div>
                  </div>
                )}

                {jeterAnimStep >= 3 && (
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-3 italic">
                      Et si on essayait autrement ?
                    </p>
                    <button
                      onClick={handleRecycler}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl
                        hover:from-green-500 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      ♻️ Recommencer en recyclant
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* RECYCLER - Result with animated scene */}
            {showRecyclerResult && (
              <div className="space-y-6 max-w-2xl w-full">
                {/* Stick figure + recycling scene side-by-side */}
                <div className="flex items-stretch gap-4">
                  {/* Stick figure column */}
                  <div className="flex flex-col items-center justify-center gap-2 min-w-[90px]">
                    <StickFigure action="recycling" />
                    {recyclerAnimStep >= 3 && <StickFigure action="happy" />}
                  </div>
                  {/* Scene column */}
                  <div className="flex-1">
                    <RecyclingScene animStep={recyclerAnimStep} />
                  </div>
                </div>
                
                {recyclerAnimStep >= 2 && (
                  <div className="bg-green-900/40 border border-green-500/30 rounded-2xl p-6 text-center transition-all duration-700">
                    <h4 className="text-green-400 text-xl font-bold mb-3">♻️ Recyclage en cours...</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Le téléphone est démonté. Les matériaux précieux sont séparés et récupérés.
                    </p>
                  </div>
                )}

                {recyclerAnimStep >= 3 && (
                  <div className="bg-green-900/30 border border-green-500/20 rounded-xl p-4 text-center transition-all duration-700">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">⛏️</div>
                        <p className="text-xs text-green-300">80% des métaux précieux récupérés</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">🏙️</div>
                        <p className="text-xs text-green-300">« Mines urbaines » : plus d'or par tonne que les mines</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">🔄</div>
                        <p className="text-xs text-green-300">Économie circulaire : réduire, réutiliser, recycler</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Le recyclage permet de récupérer jusqu'à <strong>80% des métaux précieux</strong>.
                      On parle de « mines urbaines » : nos tiroirs contiennent plus d'or par tonne que les mines traditionnelles !
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comparison & completion */}
          {completed && recyclerAnimStep >= 3 && (
            <div className="mt-6 text-center">
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/80 border border-slate-600 rounded-2xl p-6 inline-block max-w-2xl">
                <h3 className="text-xl font-bold text-white mb-4">📊 Comparaison des scénarios</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/20">
                    <h4 className="text-red-400 font-bold mb-2">🗑️ Jeter</h4>
                    <ul className="text-sm text-slate-300 space-y-1 text-left">
                      <li>• Contamination des sols</li>
                      <li>• Pollution de l'eau</li>
                      <li>• 0% de récupération</li>
                      <li>• Extraction de nouvelles ressources</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/20">
                    <h4 className="text-green-400 font-bold mb-2">♻️ Recycler</h4>
                    <ul className="text-sm text-slate-300 space-y-1 text-left">
                      <li>• 80% de métaux récupérés</li>
                      <li>• Réduction du CO₂</li>
                      <li>• Protection des écosystèmes</li>
                      <li>• Économie circulaire</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={onNext}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl
                    hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                    shadow-lg shadow-cyan-500/30 active:scale-95 cursor-pointer"
                >
                  Niveau suivant →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
