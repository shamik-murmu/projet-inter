import { useState, useEffect, useCallback } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Level1 } from "./components/Level1";
import { Level2 } from "./components/Level2";
import { Level3 } from "./components/Level3";
import { Level4 } from "./components/Level4";
import { Level5 } from "./components/Level5";
import { FinalScreen } from "./components/FinalScreen";

const LEVEL_INFO = [
  { icon: "📜", title: "L'Historien", subtitle: "L'Évolution du Téléphone" },
  { icon: "🧪", title: "Le Chimiste", subtitle: "Le Cycle de Vie de la Matière" },
  { icon: "🧠", title: "Le Psychologue", subtitle: "L'Algorithme contre le Cerveau" },
  { icon: "🔧", title: "L'Ingénieur", subtitle: "Assemble le Smartphone" },
  { icon: "📡", title: "Le Physicien", subtitle: "Les Ondes et le Signal" },
];

export function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(0); // 0 = welcome
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [showFinal, setShowFinal] = useState(false);
  const [level3Scores, setLevel3Scores] = useState<{ without: number; with: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("phoneGameProgress");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.completedLevels) setCompletedLevels(new Set(data.completedLevels));
        if (data.currentLevel) setCurrentLevel(data.currentLevel);
        if (data.level3Scores) setLevel3Scores(data.level3Scores);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("phoneGameProgress", JSON.stringify({
      completedLevels: Array.from(completedLevels),
      currentLevel,
      level3Scores,
    }));
  }, [completedLevels, currentLevel, level3Scores]);

  const completeLevel = useCallback((level: number) => {
    setCompletedLevels(prev => new Set([...prev, level]));
  }, []);

  const goToNextLevel = useCallback((current: number) => {
    if (current < 5) {
      setCurrentLevel(current + 1);
    } else {
      setShowFinal(true);
    }
  }, []);

  const navigateToLevel = useCallback((level: number) => {
    setShowFinal(false);
    setCurrentLevel(level);
  }, []);

  if (currentLevel === 0 && !showFinal) {
    return <WelcomeScreen onStart={() => setCurrentLevel(1)} />;
  }

  if (showFinal) {
    return <FinalScreen
      level3Scores={level3Scores}
      onRestart={() => { setCurrentLevel(0); setShowFinal(false); setCompletedLevels(new Set()); setLevel3Scores(null); localStorage.removeItem("phoneGameProgress"); }}
    />;
  }

  // All levels are accessible

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <h1 className="text-lg font-bold text-cyan-400 mr-4 whitespace-nowrap">📱 Les Secrets du Téléphone</h1>
        <div className="flex gap-2 flex-1 justify-center">
          {LEVEL_INFO.map((info, i) => {
            const lvl = i + 1;
            const isCompleted = completedLevels.has(lvl);
            const isCurrent = currentLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => navigateToLevel(lvl)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                  isCurrent ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30" :
                  isCompleted ? "bg-green-600/30 text-green-300 hover:bg-green-600/50" :
                  "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <span>{info.icon}</span>
                <span className="hidden lg:inline">{info.title}</span>
                {isCompleted && <span className="text-green-400">✓</span>}
              </button>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm text-slate-400">Niveau {currentLevel}/5</span>
          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedLevels.size / 5) * 100}%` }} />
          </div>
        </div>
      </nav>

      {/* Level Content */}
      <div className="flex-1 overflow-auto">
        {currentLevel === 1 && <Level1 onComplete={() => completeLevel(1)} onNext={() => goToNextLevel(1)} />}
        {currentLevel === 2 && <Level2 onComplete={() => completeLevel(2)} onNext={() => goToNextLevel(2)} />}
        {currentLevel === 3 && <Level3 onComplete={() => completeLevel(3)} onNext={() => goToNextLevel(3)} onScores={(s: { without: number; with: number }) => setLevel3Scores(s)} />}
        {currentLevel === 4 && <Level4 onComplete={() => completeLevel(4)} onNext={() => goToNextLevel(4)} />}
        {currentLevel === 5 && <Level5 onComplete={() => completeLevel(5)} onNext={() => goToNextLevel(5)} />}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-4 text-center">
        <p className="text-slate-500 text-sm">Projet interdisciplinaire par Shamik Shikhar Murmu, Mael Teddy Kamani, Andy Wang, Timofey Ivanov, Nishan Demircioglu, Ali Shenan</p>
      </footer>
    </div>
  );
}
