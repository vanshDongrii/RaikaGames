import React, { useState } from 'react';
import { X, Play, ShieldAlert, Sparkles, Star, ExternalLink, Info, CheckCircle2, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function ProviderGameModal({ game, onClose }) {
  const { isDemo, favorites, toggleFavorite } = useGame();
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'specs'
  const [demoSpinning, setDemoSpinning] = useState(false);
  const [demoCredits, setDemoCredits] = useState(1000);
  const [demoBet, setDemoBet] = useState(2);
  const [demoReels, setDemoReels] = useState([
    ['🍒', '7️⃣', '💎'],
    ['🔔', '💎', '🍒'],
    ['7️⃣', '7️⃣', '7️⃣'],
  ]);
  const [demoWin, setDemoWin] = useState(null);

  if (!game) return null;

  const isFavorite = favorites.includes(game.id);

  const handleSpinDemo = () => {
    if (demoSpinning) return;
    if (demoCredits < demoBet) {
      alert('Resetting demo balance to 1,000 virtual credits.');
      setDemoCredits(1000);
      return;
    }

    setDemoSpinning(true);
    setDemoWin(null);
    setDemoCredits(c => c - demoBet);
    playTapSound();
    triggerHaptic('medium');

    const SYMBOLS = ['🍒', '🍋', '🔔', '🍇', '💎', '7️⃣'];

    setTimeout(() => {
      const r1 = [SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]];
      const r2 = [SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]];
      const r3 = [SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]];
      
      setDemoReels([r1, r2, r3]);
      setDemoSpinning(false);

      // Check center row
      if (r1[1] === r2[1] && r2[1] === r3[1]) {
        const symbol = r1[1];
        const mult = symbol === '7️⃣' ? 25 : symbol === '💎' ? 15 : 5;
        const winAmount = demoBet * mult;
        setDemoCredits(c => c + winAmount);
        setDemoWin({ mult, winAmount });
        playHitSound(true);
        playMultiplierDing(mult);
        triggerNotificationHaptic('success');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } else {
        playMissSound();
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-raika-card border border-raika-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{game.icon || '🎰'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">{game.title}</h2>
                <button
                  onClick={() => toggleFavorite(game.id)}
                  className="text-gray-400 hover:text-amber-400 transition"
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
              <span className="text-xs text-gray-400">{game.provider}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Simulator Demo vs Provider Specs */}
        <div className="flex border-b border-raika-border/60 bg-raika-surface/20">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'demo'
                ? 'border-raika-blue text-white bg-raika-blue/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            🎰 Interactive Demo Simulator
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'specs'
                ? 'border-raika-blue text-white bg-raika-blue/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            📋 Verified Specs & Provider API
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'demo' && (
            <div className="space-y-4">
              {/* Demo Notice */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Demo Mode Simulation:</strong> Experience the mechanics with virtual demo credits. Real-money play requires an authorized direct provider session.
                </div>
              </div>

              {/* Mini Reel Simulator */}
              <div className="bg-raika-surface border border-white/10 rounded-2xl p-4 text-center">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-3 px-2">
                  <span>Demo Credits: <strong className="text-emerald-400 font-mono">${demoCredits}</strong></span>
                  <span>Bet: <strong className="text-white font-mono">${demoBet}</strong></span>
                </div>

                {/* 3x3 Reels Container */}
                <div className="grid grid-cols-3 gap-2 bg-raika-dark/80 p-3 rounded-xl border border-white/5 my-2">
                  {demoReels.map((reel, cIdx) => (
                    <div key={cIdx} className="space-y-2">
                      {reel.map((sym, rIdx) => (
                        <div
                          key={rIdx}
                          className={`h-14 rounded-lg bg-raika-card flex items-center justify-center text-3xl border ${
                            rIdx === 1 ? 'border-amber-500/50 shadow-glow-gold' : 'border-white/5'
                          } ${demoSpinning ? 'animate-pulse blur-[1px]' : ''}`}
                        >
                          {demoSpinning ? '💫' : sym}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Outcome */}
                {demoWin && (
                  <div className="my-2 py-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-bounce">
                    🎉 Match 3 Payline! Won +${demoWin.winAmount} ({demoWin.mult}x)!
                  </div>
                )}

                {/* Spin Controls */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex gap-1">
                    {[1, 2, 5, 10].map((b) => (
                      <button
                        key={b}
                        disabled={demoSpinning}
                        onClick={() => setDemoBet(b)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                          demoBet === b ? 'bg-raika-blue text-white border-raika-blue' : 'bg-raika-card text-gray-400 border-white/5'
                        }`}
                      >
                        ${b}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSpinDemo}
                    disabled={demoSpinning}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-glow-green transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${demoSpinning ? 'animate-spin' : ''}`} />
                    {demoSpinning ? 'Spinning...' : 'Demo Spin'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              {/* Specs Table */}
              <div className="bg-raika-surface/40 border border-white/5 rounded-2xl p-4 divide-y divide-white/5 text-xs">
                <div className="flex justify-between py-2 text-gray-300">
                  <span className="text-gray-400">Title:</span>
                  <span className="font-bold text-white">{game.title}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-300">
                  <span className="text-gray-400">Official Provider:</span>
                  <span className="font-bold text-white">{game.provider}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-300">
                  <span className="text-gray-400">Verified Return To Player (RTP):</span>
                  <span className="font-mono font-bold text-emerald-400">{game.rtp}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-300">
                  <span className="text-gray-400">Max Multiplier Win:</span>
                  <span className="font-mono font-bold text-amber-400">{game.maxMult || '10,000x'}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-300">
                  <span className="text-gray-400">Category:</span>
                  <span className="capitalize font-bold text-cyan-400">{game.category}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-300">
                  <span className="text-gray-400">Availability:</span>
                  <span className="font-bold text-blue-400">Demo Simulator Active / Provider Gateway</span>
                </div>
              </div>

              {/* Provider Integration Disclosure */}
              <div className="p-3.5 bg-raika-surface/40 border border-white/5 rounded-xl text-xs text-gray-400 space-y-1.5">
                <div className="font-bold text-gray-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Provider Integration Architecture Notice
                </div>
                <p>
                  This catalogue entry reflects verified game parameters from {game.provider}. For live casino games and commercial slot machines, operator API credentials or aggregator gateway keys are configured via your backend environment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
