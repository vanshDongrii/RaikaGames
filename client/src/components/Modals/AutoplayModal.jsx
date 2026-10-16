import React, { useState } from 'react';
import { X, Play, RotateCw, Target, ShieldAlert, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function AutoplayModal({ onStartAutoplay }) {
  const { modalState, closeModal, autoplayConfig, setAutoplayConfig } = useGame();

  const [rounds, setRounds] = useState(autoplayConfig.rounds || 25);
  const [stopProfit, setStopProfit] = useState(autoplayConfig.stopOnProfit || 100);
  const [stopLoss, setStopLoss] = useState(autoplayConfig.stopOnLoss || 50);
  const [targetTier, setTargetTier] = useState(autoplayConfig.targetTier || 'auto');

  if (!modalState.autoplay) return null;

  const roundOptions = [10, 25, 50, 100, 500, 1000];

  const targets = [
    { id: 'auto', label: 'All Targets (Auto)', mult: 'Any x1.2 - x100' },
    { id: 'green', label: 'Green Farm Chicken', mult: 'x1.20 - x1.50' },
    { id: 'blue', label: 'Blue Hunter Chicken', mult: 'x2.00 - x3.50' },
    { id: 'purple', label: 'Purple Cyborg', mult: 'x5.00 - x12.00' },
    { id: 'red', label: 'Red Mech Chicken', mult: 'x15.00 - x35.00' },
    { id: 'gold', label: 'Golden Phoenix', mult: 'x50.00 - x100.00' },
  ];

  const handleStart = () => {
    playTapSound();
    triggerHaptic('heavy');
    setAutoplayConfig(prev => ({
      ...prev,
      rounds: Number(rounds),
      stopOnProfit: Number(stopProfit),
      stopOnLoss: Number(stopLoss),
      targetTier,
      isRunning: true,
      remainingRounds: Number(rounds),
      totalProfit: 0,
    }));
    closeModal('autoplay');
    if (onStartAutoplay) {
      onStartAutoplay({
        rounds: Number(rounds),
        stopProfit: Number(stopProfit),
        stopLoss: Number(stopLoss),
        targetTier,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-raika-card border border-raika-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Autoplay Settings</h2>
          </div>
          <button
            onClick={() => closeModal('autoplay')}
            className="w-8 h-8 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Rounds Selection */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Number of Rounds (10 - 1000)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roundOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    playTapSound();
                    setRounds(opt);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    rounds === opt
                      ? 'bg-emerald-500 text-black font-extrabold shadow-glow-green'
                      : 'bg-raika-surface hover:bg-raika-hover text-gray-300 border border-white/5'
                  }`}
                >
                  {opt} Spins
                </button>
              ))}
            </div>
          </div>

          {/* Target Multiplier Preference */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Target Selection / Gift Filter
            </label>
            <div className="space-y-1.5">
              {targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    playTapSound();
                    setTargetTier(t.id);
                  }}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs transition ${
                    targetTier === t.id
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-glow-cyan'
                      : 'bg-raika-surface/40 border-white/5 text-gray-400 hover:bg-raika-surface'
                  }`}
                >
                  <span className="font-semibold">{t.label}</span>
                  <span className="font-mono text-[11px] text-cyan-300 font-bold">{t.mult}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profit / Loss Limits */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Stop on Profit ($)
              </label>
              <input
                type="number"
                value={stopProfit}
                onChange={(e) => setStopProfit(e.target.value)}
                className="w-full bg-raika-dark border border-raika-border rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                Stop on Loss ($)
              </label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-raika-dark border border-raika-border rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Start Autoplay Button */}
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-sm shadow-glow-green flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-black" />
            Start Autoplay ({rounds} Rounds)
          </button>
        </div>
      </div>
    </div>
  );
}
