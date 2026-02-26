import { useState, useEffect, useCallback, useRef } from "react";

interface LevelProps {
  onComplete: () => void;
  onNext: () => void;
  onScores: (scores: { without: number; with: number }) => void;
}

// Activity definitions
interface Activity {
  id: string;
  name: string;
  emoji: string;
  type: "screen" | "real";
  dopamineEffect: number; // instant change
  wellbeingEffect: number; // change over time
  cooldown: number; // seconds before can use again
  description: string;
  clicks: number; // clicks required to activate
}

const SCREEN_ACTIVITIES: Activity[] = [
  {
    id: "social",
    name: "Réseaux sociaux",
    emoji: "📱",
    type: "screen",
    dopamineEffect: 25,
    wellbeingEffect: -8,
    cooldown: 3,
    description: "Défilement infini, mentions « j'aime », dopamine instantanée",
    clicks: 1,
  },
  {
    id: "video",
    name: "Vidéos courtes",
    emoji: "📺",
    type: "screen",
    dopamineEffect: 20,
    wellbeingEffect: -6,
    cooldown: 4,
    description: "Vidéos courtes, contenu rapide et addictif",
    clicks: 1,
  },
  {
    id: "gaming",
    name: "Jeu mobile",
    emoji: "🎮",
    type: "screen",
    dopamineEffect: 30,
    wellbeingEffect: -10,
    cooldown: 5,
    description: "Récompenses instantanées, loot boxes, streaks",
    clicks: 1,
  },
  {
    id: "notifs",
    name: "Checker les notifs",
    emoji: "🔔",
    type: "screen",
    dopamineEffect: 15,
    wellbeingEffect: -4,
    cooldown: 2,
    description: "La boucle compulsive : vérifier, revérifier...",
    clicks: 1,
  },
];

const REAL_ACTIVITIES: Activity[] = [
  {
    id: "walk",
    name: "Marche dehors",
    emoji: "🚶",
    type: "real",
    dopamineEffect: 5,
    wellbeingEffect: 15,
    cooldown: 6,
    description: "Lumière naturelle, mouvement, air frais",
    clicks: 4,
  },
  {
    id: "read",
    name: "Lire un livre",
    emoji: "📖",
    type: "real",
    dopamineEffect: 3,
    wellbeingEffect: 12,
    cooldown: 5,
    description: "Concentration profonde, imagination active",
    clicks: 3,
  },
  {
    id: "friends",
    name: "Voir des amis",
    emoji: "👥",
    type: "real",
    dopamineEffect: 8,
    wellbeingEffect: 18,
    cooldown: 8,
    description: "Connexion humaine authentique, ocytocine",
    clicks: 5,
  },
  {
    id: "sport",
    name: "Faire du sport",
    emoji: "⚽",
    type: "real",
    dopamineEffect: 6,
    wellbeingEffect: 20,
    cooldown: 7,
    description: "Endorphines naturelles, confiance en soi",
    clicks: 4,
  },
  {
    id: "create",
    name: "Créer / Dessiner",
    emoji: "🎨",
    type: "real",
    dopamineEffect: 4,
    wellbeingEffect: 14,
    cooldown: 6,
    description: "Flow créatif, satisfaction durable",
    clicks: 3,
  },
];

const GAME_DURATION = 60; // 1 minute

// Dopamine crash messages
const CRASH_MESSAGES = [
  "💥 Crash de dopamine ! Votre cerveau s'y habitue...",
  "📉 Tolérance accrue, il en faut toujours plus...",
  "😰 Le plaisir diminue, l'anxiété augmente...",
  "🌀 Boucle de dépendance activée...",
];

// Tips that appear during gameplay
const GAMEPLAY_TIPS = [
  "💡 Les activités « écran » donnent beaucoup de dopamine mais font chuter le bien-être !",
  "💡 Les activités « réelles » demandent plus d'effort mais stabilisent votre esprit.",
  "💡 La dopamine chute naturellement : c'est le « sevrage » numérique.",
  "💡 Si la dopamine tombe trop bas, l'écran devient gris, comme votre motivation !",
  "💡 Trouvez l'équilibre : ni trop d'écran, ni zéro plaisir.",
];

export function Level3({ onComplete, onNext, onScores }: LevelProps) {
  const [stage, setStage] = useState<"intro" | "playing" | "results">("intro");
  const [dopamine, setDopamine] = useState(50);
  const [wellbeing, setWellbeing] = useState(70);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [clickProgress, setClickProgress] = useState<Record<string, number>>({});
  const [crashCount, setCrashCount] = useState(0);
  const [screenTime, setScreenTime] = useState(0);
  const [realTime, setRealTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [crashMessage, setCrashMessage] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [dopamineHistory, setDopamineHistory] = useState<number[]>([50]);
  const [wellbeingHistory, setWellbeingHistory] = useState<number[]>([70]);
  const [peakDopamine, setPeakDopamine] = useState(50);
  const [lowestWellbeing, setLowestWellbeing] = useState(70);
  const [completed, setCompleted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const decayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tipRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dopamineRef = useRef(50);

  // Grayscale effect when dopamine is low
  const grayscaleAmount = dopamine < 20 ? Math.min(100, (20 - dopamine) * 5) : 0;
  const isWithdrawal = dopamine < 20;

  // Start game
  const startGame = useCallback(() => {
    setStage("playing");
    setDopamine(50);
    setWellbeing(70);
    setTimeLeft(GAME_DURATION);
    setCooldowns({});
    setClickProgress({});
    setCrashCount(0);
    setScreenTime(0);
    setRealTime(0);
    setCurrentTip(0);
    setDopamineHistory([50]);
    setWellbeingHistory([70]);
    setPeakDopamine(50);
    setLowestWellbeing(70);
  }, []);

  // Game timer
  useEffect(() => {
    if (stage !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage]);

  // Natural dopamine decay + cooldown ticking
  useEffect(() => {
    if (stage !== "playing") return;
    decayRef.current = setInterval(() => {
      // Dopamine naturally decays
      setDopamine(prev => {
        const newVal = Math.max(0, prev - 1.5);
        dopamineRef.current = newVal;
        return newVal;
      });
      // Wellbeing: recovers slowly when dopamine is okay, but DROPS during withdrawal
      setWellbeing(prev => {
        const currentDopamine = dopamineRef.current;
        if (currentDopamine < 20) {
          // Withdrawal: wellbeing drops significantly
          return Math.max(0, prev - 1.2);
        } else if (currentDopamine < 35) {
          // Low dopamine: wellbeing stagnates or drops slightly
          return Math.max(0, prev - 0.3);
        } else {
          // Normal/high dopamine: wellbeing slowly recovers
          return Math.min(100, prev + 0.3);
        }
      });
      // Cooldowns tick down
      setCooldowns(prev => {
        const next: Record<string, number> = {};
        for (const [key, val] of Object.entries(prev)) {
          if (val > 0) next[key] = val - 1;
        }
        return next;
      });
    }, 1000);
    return () => { if (decayRef.current) clearInterval(decayRef.current); };
  }, [stage]);

  // Record history every 5 seconds
  useEffect(() => {
    if (stage !== "playing") return;
    const hist = setInterval(() => {
      setDopamineHistory(prev => [...prev, dopamine]);
      setWellbeingHistory(prev => [...prev, wellbeing]);
    }, 5000);
    return () => clearInterval(hist);
  }, [stage, dopamine, wellbeing]);

  // Track peaks
  useEffect(() => {
    if (dopamine > peakDopamine) setPeakDopamine(dopamine);
    if (wellbeing < lowestWellbeing) setLowestWellbeing(wellbeing);
  }, [dopamine, wellbeing, peakDopamine, lowestWellbeing]);

  // Tips rotation
  useEffect(() => {
    if (stage !== "playing") return;
    tipRef.current = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % GAMEPLAY_TIPS.length);
    }, 12000);
    return () => { if (tipRef.current) clearInterval(tipRef.current); };
  }, [stage]);

  // Random fake notifications to tempt the player
  useEffect(() => {
    if (stage !== "playing") return;
    notifRef.current = setInterval(() => {
      if (Math.random() > 0.5) {
        const notifs = [
          "📩 Nouveau message de Marie !",
          "❤️ 5 likes sur votre story",
          "🎮 Votre énergie est rechargée !",
          "📸 Quelqu'un vous a mentionné",
          "🔥 Streak de 7 jours, ne le perdez pas !",
          "🛒 -70% sur votre wishlist !",
        ];
        setShowNotification(notifs[Math.floor(Math.random() * notifs.length)]);
        setTimeout(() => setShowNotification(null), 3000);
      }
    }, 8000);
    return () => { if (notifRef.current) clearInterval(notifRef.current); };
  }, [stage]);

  // Game over when time runs out
  useEffect(() => {
    if (timeLeft === 0 && stage === "playing" && !completed) {
      setCompleted(true);
      setStage("results");
      // Clean up intervals
      [timerRef, decayRef, tipRef, notifRef].forEach(ref => {
        if (ref.current) clearInterval(ref.current);
      });
      onScores({ without: Math.round(wellbeing), with: Math.round(dopamine) });
      onComplete();
    }
  }, [timeLeft, stage, completed, wellbeing, dopamine, onScores, onComplete]);

  // Handle activity click
  const handleActivityClick = useCallback((activity: Activity) => {
    if ((cooldowns[activity.id] || 0) > 0) return;

    const currentClicks = (clickProgress[activity.id] || 0) + 1;

    if (currentClicks < activity.clicks) {
      // Need more clicks
      setClickProgress(prev => ({ ...prev, [activity.id]: currentClicks }));
      return;
    }

    // Activity activated!
    setClickProgress(prev => ({ ...prev, [activity.id]: 0 }));
    setCooldowns(prev => ({ ...prev, [activity.id]: activity.cooldown }));

    // Apply dopamine effect
    setDopamine(prev => {
      const newVal = Math.min(100, Math.max(0, prev + activity.dopamineEffect));
      dopamineRef.current = newVal;
      // Check for crash: if dopamine was high and now drops suddenly from screen use
      if (activity.type === "screen" && prev > 70) {
        setCrashCount(c => c + 1);
        setCrashMessage(CRASH_MESSAGES[Math.min(crashCount, CRASH_MESSAGES.length - 1)]);
        setTimeout(() => setCrashMessage(null), 3000);
      }
      return newVal;
    });

    // Apply wellbeing effect
    setWellbeing(prev => Math.min(100, Math.max(0, prev + activity.wellbeingEffect)));

    // Track usage
    if (activity.type === "screen") {
      setScreenTime(prev => prev + 1);
    } else {
      setRealTime(prev => prev + 1);
    }
  }, [cooldowns, clickProgress, crashCount]);

  // Dopamine crash effect: if dopamine exceeds 85, schedule a crash
  useEffect(() => {
    if (stage !== "playing") return;
    if (dopamine > 85) {
      const crashTimer = setTimeout(() => {
        setDopamine(prev => {
          const newVal = Math.max(0, prev - 30);
          dopamineRef.current = newVal;
          return newVal;
        });
        setCrashCount(c => c + 1);
        setCrashMessage("💥 Crash de dopamine ! Pic trop élevé, chute brutale");
        setTimeout(() => setCrashMessage(null), 3500);
      }, 3000);
      return () => clearTimeout(crashTimer);
    }
  }, [dopamine > 85, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Determine the outcome rating
  const getOutcome = () => {
    const finalWB = wellbeing;
    if (finalWB >= 60) return { label: "Excellent équilibre !", emoji: "🌟", color: "text-green-400" };
    if (finalWB >= 40) return { label: "Équilibre correct", emoji: "👍", color: "text-yellow-400" };
    if (finalWB >= 20) return { label: "Déséquilibre notable", emoji: "⚠️", color: "text-orange-400" };
    return { label: "Addiction sévère", emoji: "🚨", color: "text-red-400" };
  };

  return (
    <div
      className="p-6 max-w-5xl mx-auto transition-all duration-1000"
      style={{ filter: stage === "playing" ? `grayscale(${grayscaleAmount}%)` : "none" }}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">🧠 Niveau 3 : Le Psychologue</h2>
        <p className="text-slate-400 text-lg">L'Algorithme contre le Cerveau</p>
      </div>

      {/* INTRO */}
      {stage === "intro" && (
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 space-y-6">
            <div className="text-6xl mb-2">🧪</div>
            <h3 className="text-2xl font-bold text-white">L'Algorithme contre le Cerveau</h3>
            <p className="text-slate-300 leading-relaxed">
              Vous avez <strong className="text-cyan-400">1 minute</strong> pour équilibrer deux jauges :
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-pink-900/30 border border-pink-500/30 rounded-xl p-4">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="text-pink-400 font-bold">Dopamine</h4>
                <p className="text-xs text-slate-400 mt-1">Plaisir immédiat. Monte vite avec les écrans, mais chute brutalement.</p>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4">
                <div className="text-3xl mb-2">💚</div>
                <h4 className="text-emerald-400 font-bold">Bien-être</h4>
                <p className="text-xs text-slate-400 mt-1">Santé long terme. Les activités réelles le renforcent durablement.</p>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 text-sm text-slate-300 space-y-2">
              <p>📱 <strong>Activités écran</strong> : 1 clic, beaucoup de dopamine, mais le bien-être chute.</p>
              <p>🌿 <strong>Activités réelles</strong> : plusieurs clics nécessaires, moins de dopamine, mais le bien-être augmente.</p>
              <p>⚠️ Si la dopamine tombe trop bas, l'écran devient <strong>gris</strong>, comme votre motivation lors d'un sevrage numérique.</p>
              <p>💥 Si la dopamine monte trop haut, elle <strong>crash</strong> brutalement : votre cerveau s'y habitue.</p>
            </div>

            <button
              onClick={startGame}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-xl
                hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              🎮 Commencer (1 min)
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {stage === "playing" && (
        <div className="space-y-4 relative">
          {/* Fake notification popup */}
          {showNotification && (
            <div className="fixed top-20 right-6 bg-white text-gray-900 rounded-2xl px-5 py-3 shadow-2xl z-50 animate-bounce max-w-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{showNotification}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Appuyez pour ouvrir</p>
            </div>
          )}

          {/* Crash message */}
          {crashMessage && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-900/90 border-2 border-red-500 rounded-2xl px-8 py-4 text-center shadow-2xl animate-pulse">
              <p className="text-red-300 text-lg font-bold">{crashMessage}</p>
            </div>
          )}

          {/* Withdrawal overlay */}
          {isWithdrawal && (
            <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
              <div className="text-center bg-black/50 rounded-2xl px-6 py-4 backdrop-blur-sm">
                <p className="text-gray-400 text-lg font-bold animate-pulse">
                  😶 Sevrage... Tout semble terne et sans intérêt
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Votre dopamine est trop basse, la motivation s'effondre
                </p>
              </div>
            </div>
          )}

          {/* Timer + gauges header */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4">
            {/* Timer */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span className={`text-2xl font-mono font-bold ${timeLeft <= 30 ? "text-red-400 animate-pulse" : "text-white"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-slate-400">
                <span>📱 Écran: {screenTime}</span>
                <span>🌿 Réel: {realTime}</span>
                <span>💥 Crashes: {crashCount}</span>
              </div>
            </div>

            {/* Dopamine gauge */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-pink-400 flex items-center gap-1">
                  ⚡ Dopamine
                </span>
                <span className="text-sm font-mono text-pink-300">{Math.round(dopamine)}%</span>
              </div>
              <div className="w-full h-5 bg-slate-700 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-300 relative"
                  style={{
                    width: `${dopamine}%`,
                    background: dopamine > 80
                      ? "linear-gradient(90deg, #f472b6, #ef4444)"
                      : dopamine > 40
                      ? "linear-gradient(90deg, #ec4899, #f472b6)"
                      : dopamine > 20
                      ? "linear-gradient(90deg, #9ca3af, #ec4899)"
                      : "linear-gradient(90deg, #4b5563, #6b7280)",
                  }}
                >
                  {dopamine > 80 && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  )}
                </div>
                {/* Danger zones */}
                <div className="absolute top-0 left-[18%] w-[2px] h-full bg-red-500/40" />
                <div className="absolute top-0 left-[82%] w-[2px] h-full bg-red-500/40" />
                <span className="absolute top-0 left-[1%] text-[8px] text-red-400/60 leading-5">Sevrage</span>
                <span className="absolute top-0 right-[1%] text-[8px] text-red-400/60 leading-5">Crash</span>
              </div>
            </div>

            {/* Wellbeing gauge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  💚 Bien-être
                </span>
                <span className="text-sm font-mono text-emerald-300">{Math.round(wellbeing)}%</span>
              </div>
              <div className="w-full h-5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${wellbeing}%`,
                    background: wellbeing > 60
                      ? "linear-gradient(90deg, #10b981, #34d399)"
                      : wellbeing > 30
                      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                      : "linear-gradient(90deg, #ef4444, #f87171)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tip banner */}
          <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-xl px-4 py-2 text-center transition-all duration-500">
            <p className="text-indigo-300 text-sm">{GAMEPLAY_TIPS[currentTip]}</p>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Screen activities */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-pink-400 flex items-center gap-2">
                📱 Activités Écran
                <span className="text-xs text-slate-500 font-normal">(1 clic, dopamine rapide)</span>
              </h3>
              {SCREEN_ACTIVITIES.map(activity => {
                const onCooldown = (cooldowns[activity.id] || 0) > 0;
                const cd = cooldowns[activity.id] || 0;
                return (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    disabled={onCooldown}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                      onCooldown
                        ? "bg-slate-800/40 border-slate-700 opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-pink-900/40 to-rose-900/40 border-pink-500/30 hover:border-pink-400 hover:bg-pink-900/50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{activity.emoji}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{activity.name}</h4>
                          <p className="text-xs text-slate-400">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        {onCooldown ? (
                          <span className="text-slate-500 text-sm font-mono">{cd}s</span>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="text-xs text-pink-400">⚡ +{activity.dopamineEffect}</div>
                            <div className="text-xs text-red-400">💚 {activity.wellbeingEffect}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Real activities */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                🌿 Activités Réelles
                <span className="text-xs text-slate-500 font-normal">(plusieurs clics, bien-être durable)</span>
              </h3>
              {REAL_ACTIVITIES.map(activity => {
                const onCooldown = (cooldowns[activity.id] || 0) > 0;
                const cd = cooldowns[activity.id] || 0;
                const progress = clickProgress[activity.id] || 0;
                const progressPct = (progress / activity.clicks) * 100;
                return (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityClick(activity)}
                    disabled={onCooldown}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] relative overflow-hidden ${
                      onCooldown
                        ? "bg-slate-800/40 border-slate-700 opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/50 cursor-pointer"
                    }`}
                  >
                    {/* Click progress bar */}
                    {progress > 0 && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-emerald-400 rounded-full transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{activity.emoji}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{activity.name}</h4>
                          <p className="text-xs text-slate-400">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        {onCooldown ? (
                          <span className="text-slate-500 text-sm font-mono">{cd}s</span>
                        ) : progress > 0 ? (
                          <span className="text-emerald-400 text-xs font-bold">{progress}/{activity.clicks} clics</span>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="text-xs text-pink-300">⚡ +{activity.dopamineEffect}</div>
                            <div className="text-xs text-emerald-400">💚 +{activity.wellbeingEffect}</div>
                            <div className="text-xs text-slate-500">🖱️ {activity.clicks} clics</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brain visualization */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-300">🧠 État du cerveau</span>
              <span className="text-xs text-slate-500">
                {dopamine > 80 ? "⚡ Surchargé, crash imminent !" :
                 dopamine > 60 ? "😄 Stimulé" :
                 dopamine > 40 ? "😌 Normal" :
                 dopamine > 20 ? "😐 En baisse..." :
                 "😶 Sevrage, monde gris"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-5xl transition-all duration-500" style={{
                filter: `grayscale(${Math.max(0, 100 - dopamine * 2)}%)`,
              }}>
                {dopamine > 80 ? "🤯" :
                 dopamine > 60 ? "😄" :
                 dopamine > 40 ? "🙂" :
                 dopamine > 20 ? "😐" :
                 "😶"}
              </div>
              <div className="flex-1">
                <div className="flex gap-1 h-8">
                  {/* Mini bar chart of recent dopamine spikes */}
                  {dopamineHistory.slice(-12).map((val, i) => (
                    <div key={i} className="flex-1 bg-slate-700 rounded-t-sm self-end" style={{ height: `${val}%` }}>
                      <div className="w-full h-full bg-pink-500/60 rounded-t-sm" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Historique dopamine</p>
              </div>
              <div className="flex-1">
                <div className="flex gap-1 h-8">
                  {wellbeingHistory.slice(-12).map((val, i) => (
                    <div key={i} className="flex-1 bg-slate-700 rounded-t-sm self-end" style={{ height: `${val}%` }}>
                      <div className="w-full h-full bg-emerald-500/60 rounded-t-sm" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Historique bien-être</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {stage === "results" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Outcome */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">{getOutcome().emoji}</div>
            <h3 className={`text-2xl font-bold ${getOutcome().color} mb-4`}>{getOutcome().label}</h3>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-pink-900/20 border border-pink-500/20 rounded-xl p-4">
                <h4 className="text-pink-400 text-sm font-bold mb-1">⚡ Dopamine finale</h4>
                <p className="text-3xl font-bold text-white">{Math.round(dopamine)}%</p>
                <p className="text-xs text-slate-400 mt-1">Pic : {Math.round(peakDopamine)}%</p>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                <h4 className="text-emerald-400 text-sm font-bold mb-1">💚 Bien-être final</h4>
                <p className="text-3xl font-bold text-white">{Math.round(wellbeing)}%</p>
                <p className="text-xs text-slate-400 mt-1">Minimum : {Math.round(lowestWellbeing)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">{screenTime}</p>
                <p className="text-xs text-slate-400">📱 Activités écran</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">{realTime}</p>
                <p className="text-xs text-slate-400">🌿 Activités réelles</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-400">{crashCount}</p>
                <p className="text-xs text-slate-400">💥 Crashes dopamine</p>
              </div>
            </div>
          </div>

          {/* Educational content */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-6">
            <h4 className="text-purple-400 text-lg font-bold mb-3">🧠 La dopamine et les écrans</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              La <strong>dopamine</strong> est un neurotransmetteur associé au plaisir et à la motivation. Les applications
              mobiles sont conçues pour exploiter ce système : chaque <em>like</em>, chaque notification, chaque scroll
              déclenche un petit pic de dopamine, exactement comme les machines à sous.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Problème : votre cerveau développe une <strong>tolérance</strong>. Il en faut toujours plus pour le même effet.
              Et quand la stimulation s'arrête, c'est le <strong>crash</strong> : anxiété, ennui, dépendance.
              C'est le <strong>sevrage numérique</strong>, illustré par l'écran qui devenait gris.
            </p>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-6">
            <h4 className="text-emerald-400 text-lg font-bold mb-3">💚 Le bien-être durable</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Les activités « réelles » (sport, amis, lecture, créativité) demandent <strong>plus d'effort</strong> mais
              produisent un bien-être stable et durable. Elles activent d'autres systèmes : <strong>endorphines</strong> (sport),
              <strong>ocytocine</strong> (lien social), <strong>sérotonine</strong> (satisfaction profonde).
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              La clé n'est pas de supprimer les écrans, mais de trouver un <strong>équilibre</strong>.
              Un adolescent passe en moyenne <strong>7h par jour</strong> sur les écrans.
              Les experts recommandent de limiter le temps récréatif à <strong>2h</strong> et de pratiquer
              au moins <strong>60 minutes d'activité physique</strong> quotidienne.
            </p>
          </div>

          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-6">
            <h4 className="text-red-400 text-lg font-bold mb-3">🔔 L'économie de l'attention</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Les géants du numérique emploient des <strong>ingénieurs de l'attention</strong> dont le seul objectif est de
              maximiser votre temps d'écran. Scroll infini, autoplay, streaks, notifications push... Chaque fonctionnalité
              est testée et optimisée pour <strong>capter et retenir votre attention</strong>. Votre temps d'écran est
              leur revenu publicitaire. Comme le dit Tristan Harris (ex-Google) :
              <em className="text-slate-400 block mt-2">
                « Si vous ne payez pas le produit, c'est que vous êtes le produit. »
              </em>
            </p>
          </div>

          <div className="text-center">
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
  );
}
