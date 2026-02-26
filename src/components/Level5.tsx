import { useState, useEffect, useRef, useCallback } from "react";

interface LevelProps {
  onComplete: () => void;
  onNext: () => void;
}

const SPECTRUM = [
  { name: "Ondes radio", range: [0, 15], color: "#ef4444" },
  { name: "Micro-ondes", range: [15, 35], color: "#f97316" },
  { name: "Infrarouge", range: [35, 50], color: "#eab308" },
  { name: "Lumière visible", range: [50, 65], color: "#22c55e" },
  { name: "Ultraviolet", range: [65, 78], color: "#3b82f6" },
  { name: "Rayons X", range: [78, 90], color: "#8b5cf6" },
  { name: "Rayons gamma", range: [90, 100], color: "#a855f7" },
];

export function Level5({ onComplete, onNext }: LevelProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [connected, setConnected] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [attemptResult, setAttemptResult] = useState<"none" | "success" | "fail">("none");
  const [failMessage, setFailMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  // The "correct" zone is micro-ondes: slider value 20-32
  const isCorrectZone = sliderValue >= 20 && sliderValue <= 32;
  const isDangerZone = sliderValue >= 75;
  const frequency = sliderValue / 100;
  const signalBars = isCorrectZone ? 5 : sliderValue >= 15 && sliderValue <= 40 ? 3 : sliderValue >= 10 && sliderValue <= 50 ? 2 : sliderValue > 50 ? 1 : 0;

  // Current spectrum region
  const currentRegion = SPECTRUM.find(s => sliderValue >= s.range[0] && sliderValue < s.range[1]) || SPECTRUM[0];

  // Wave animation
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    timeRef.current += 0.05;
    const t = timeRef.current;

    ctx.clearRect(0, 0, w * 2, h * 2);

    const wavelength = Math.max(5, (1 - frequency) * 80);
    const amplitude = 20 + (isCorrectZone ? 25 : signalBars * 8);
    const speed = 2 + frequency * 6;
    const opacity = isCorrectZone ? 1 : 0.3 + signalBars * 0.15;

    ctx.beginPath();
    ctx.strokeStyle = connected ? `rgba(34, 211, 238, ${opacity})` : `rgba(${isDangerZone ? "239, 68, 68" : "34, 211, 238"}, ${opacity})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = connected ? "#22d3ee" : isDangerZone ? "#ef4444" : "#22d3ee";
    ctx.shadowBlur = 10;

    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin((x / wavelength) * Math.PI * 2 + t * speed) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Secondary wave
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${isDangerZone ? "239, 68, 68" : "59, 130, 246"}, ${opacity * 0.3})`;
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin((x / wavelength) * Math.PI * 2 + t * speed + 0.5) * (amplitude * 0.6);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw particles along wave if connected
    if (connected) {
      for (let i = 0; i < 5; i++) {
        const px = ((t * 50 + i * (w / 5)) % w);
        const py = h / 2 + Math.sin((px / wavelength) * Math.PI * 2 + t * speed) * amplitude;
        ctx.beginPath();
        ctx.fillStyle = "#22d3ee";
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 15;
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    animRef.current = requestAnimationFrame(drawWave);
  }, [frequency, isCorrectZone, signalBars, isDangerZone, connected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(2, 2);
    }
    animRef.current = requestAnimationFrame(drawWave);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawWave]);

  // Call timer
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      setCallTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connected]);

  const handleConfirm = () => {
    if (completed) return;

    if (isCorrectZone) {
      // Success!
      setAttemptResult("success");
      setConnected(true);
      setTimeout(() => {
        setShowEducation(true);
        setCompleted(true);
        onComplete();
      }, 3000);
    } else {
      // Fail
      setAttemptResult("fail");
      if (isDangerZone) {
        setFailMessage("Ces fréquences sont des rayonnements dangereux pour la santé ! Les téléphones n'utilisent pas cette partie du spectre. Essayez une fréquence plus basse.");
      } else if (sliderValue < 15) {
        setFailMessage("Ces ondes radio à basse fréquence n'ont pas assez de bande passante pour transporter les données d'un appel téléphonique. Essayez une fréquence un peu plus élevée.");
      } else if (sliderValue >= 35 && sliderValue < 50) {
        setFailMessage("Les infrarouges sont utilisés pour les télécommandes, pas pour les communications cellulaires. La bonne fréquence se situe dans une autre zone du spectre.");
      } else if (sliderValue >= 50 && sliderValue < 65) {
        setFailMessage("La lumière visible ne traverse pas les murs ! Impossible de l'utiliser pour la téléphonie mobile. Cherchez une fréquence qui traverse les obstacles.");
      } else if (sliderValue >= 65 && sliderValue < 75) {
        setFailMessage("Les ultraviolets sont absorbés par l'atmosphère et dangereux pour la peau. Ce n'est pas adapté aux télécommunications.");
      } else {
        setFailMessage("Cette fréquence n'est pas idéale pour les communications cellulaires. Observez les barres de signal et cherchez la zone où le signal est le plus fort !");
      }
      // Clear fail message after a few seconds
      setTimeout(() => {
        setAttemptResult("none");
        setFailMessage("");
      }, 5000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">📡 Niveau 5 : Le Physicien</h2>
        <p className="text-slate-400 text-lg">Les Ondes et le Signal</p>
        <p className="text-slate-500 text-sm mt-1">Trouvez la bonne fréquence pour établir la communication !</p>
      </div>

      {/* Main display: two phones with wave between */}
      <div className="flex items-center gap-4 mb-6 justify-center">
        {/* Emitter phone */}
        <div className="flex-shrink-0">
          <div className={`w-24 h-48 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
            connected ? "border-green-400 bg-green-900/20 shadow-lg shadow-green-500/20" : "border-slate-600 bg-slate-800"
          }`}>
            <span className="text-3xl mb-1">📱</span>
            <span className="text-xs text-slate-400">Émetteur</span>
            {connected && (
              <div className="mt-2 text-center">
                <div className="text-xs text-green-400 font-bold">📞 Appel</div>
                <div className="text-xs text-green-300 font-mono">{formatTime(callTimer)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Wave visualization */}
        <div className="flex-1 relative max-w-2xl">
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl bg-slate-900/50"
            style={{ height: '192px' }}
          />
          {isDangerZone && !completed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-900/80 text-red-300 px-4 py-2 rounded-xl text-sm font-bold animate-pulse border border-red-500">
                ⚠️ Rayonnements dangereux !
              </div>
            </div>
          )}
        </div>

        {/* Receiver phone */}
        <div className="flex-shrink-0">
          <div className={`w-24 h-48 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
            connected ? "border-green-400 bg-green-900/20 shadow-lg shadow-green-500/20 animate-pulse" : "border-slate-600 bg-slate-800"
          }`}>
            <span className="text-3xl mb-1">📱</span>
            <span className="text-xs text-slate-400">Récepteur</span>
            {/* Signal bars */}
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map(bar => (
                <div
                  key={bar}
                  className={`w-1.5 rounded-sm transition-all ${
                    bar <= signalBars
                      ? connected ? "bg-green-400" : "bg-cyan-400"
                      : "bg-slate-700"
                  }`}
                  style={{ height: `${bar * 4 + 4}px` }}
                />
              ))}
            </div>
            {connected && (
              <div className="mt-1">
                <div className="text-xs text-green-400 font-bold">🔔 Appel</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current spectrum region label */}
      <div className="text-center mb-4">
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium" style={{
          backgroundColor: currentRegion.color + "20",
          color: currentRegion.color,
          borderWidth: 1,
          borderColor: currentRegion.color + "40",
        }}>
          {currentRegion.name}
        </span>
      </div>

      {/* Attempt result feedback */}
      {attemptResult === "fail" && failMessage && (
        <div className="mb-4 bg-red-900/40 border border-red-500/40 rounded-xl p-4 text-center animate-fade-in-up">
          <p className="text-red-300 text-sm font-medium">❌ Connexion échouée !</p>
          <p className="text-red-200/80 text-sm mt-1">{failMessage}</p>
        </div>
      )}

      {attemptResult === "success" && (
        <div className="mb-4 bg-green-900/40 border border-green-500/40 rounded-xl p-4 text-center animate-fade-in-up">
          <p className="text-green-300 text-sm font-medium">✅ Connexion réussie ! Appel en cours...</p>
        </div>
      )}

      {/* Slider + Confirm button */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={e => {
              if (!completed) {
                setSliderValue(Number(e.target.value));
                // Reset fail feedback when slider moves
                if (attemptResult === "fail") {
                  setAttemptResult("none");
                  setFailMessage("");
                }
              }
            }}
            disabled={completed}
            className="w-full h-3 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, 
                #ef4444 0%, #ef4444 15%, 
                #f97316 15%, #f97316 35%, 
                #eab308 35%, #eab308 50%, 
                #22c55e 50%, #22c55e 65%, 
                #3b82f6 65%, #3b82f6 78%,
                #8b5cf6 78%, #8b5cf6 90%, 
                #a855f7 90%, #a855f7 100%
              )`,
            }}
          />
        </div>

        {/* Spectrum labels */}
        <div className="flex justify-between text-xs px-1">
          {SPECTRUM.map(s => (
            <span key={s.name} style={{ color: s.color }} className="font-medium text-center flex-1">
              {s.name.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}
            </span>
          ))}
        </div>

        {/* Mobile telephony indicator: only shown AFTER success */}
        {completed && (
          <div className="relative mt-3 h-6 animate-fade-in-up">
            <div className="absolute rounded-full bg-orange-500/20 border border-orange-500/40 px-2 py-0.5 text-xs text-orange-400 font-medium"
              style={{ left: "15%", width: "20%" }}>
              📱 700 MHz - 2,6 GHz
            </div>
          </div>
        )}

        <div className="flex justify-between text-xs text-slate-500 mt-3">
          <span>← Grande longueur d'onde</span>
          <span>Petite longueur d'onde →</span>
        </div>

        {/* Confirm button */}
        {!completed && (
          <div className="text-center mt-5">
            <button
              onClick={handleConfirm}
              disabled={attemptResult === "success"}
              className="px-10 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl
                hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                shadow-lg shadow-cyan-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📡 Tester la connexion
            </button>
          </div>
        )}
      </div>

      {/* Educational content (after successful connection) */}
      {showEducation && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-2xl p-6">
            <h4 className="text-cyan-400 text-lg font-bold mb-3">📡 Les ondes cellulaires</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Les téléphones cellulaires utilisent des <strong>ondes micro-ondes</strong> entre 700 MHz et 2,6 GHz. 
              Ces fréquences permettent de transporter beaucoup de données à grande vitesse tout en traversant les murs 
              et l'atmosphère. Le Wi-Fi utilise des fréquences similaires (2,4 GHz et 5 GHz).
            </p>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6">
            <h4 className="text-blue-400 text-lg font-bold mb-3">🏗️ La 5G et au-delà</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Plus la fréquence est élevée (5G = jusqu'à 39 GHz), plus le débit est rapide, mais plus la portée est courte. 
              C'est pourquoi la 5G nécessite plus d'antennes rapprochées. Chaque génération de réseau mobile a repoussé les limites 
              de la physique pour offrir des communications toujours plus rapides.
            </p>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl
                hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300
                shadow-lg shadow-cyan-500/30 active:scale-95"
            >
              🏆 Voir les résultats finaux →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
