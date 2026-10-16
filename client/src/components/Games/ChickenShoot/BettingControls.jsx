import React, { useState, useRef } from 'react';
import { Minus, Plus, Settings2, Play, Square, Crosshair, Sparkles } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { playTapSound } from '../../../utils/audio';
import { triggerHaptic } from '../../../utils/telegram';

export default function BettingControls({
  betAmount,
  onChangeBet,
  onShoot,
  isShooting,
  isAutoplayRunning,
  onStopAutoplay,
  onOpenAutoplayModal,
  targetPreference,
  onSelectTargetPreference,
}) {
  const { currentBalance, openModal } = useGame();
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);

  const presets = [1, 5, 10, 25, 50, 100];

  const handleAdjust = (factor) => {
    playTapSound();
    triggerHaptic('light');
    if (factor === 0.5) {
      onChangeBet(Math.max(1, parseFloat((betAmount * 0.5).toFixed(2))));
    } else if (factor === 2) {
      onChangeBet(parseFloat((betAmount * 2).toFixed(2)));
    } else if (factor === 'max') {
      onChangeBet(Math.floor(currentBalance) || 100);
    }
  };

  const handleIncrement = (delta) => {
    playTapSound();
    triggerHaptic('light');
    onChangeBet(Math.max(1, parseFloat((betAmount + delta).toFixed(2))));
  };

  // Hold-to-Autoplay logic
  const startHold = () => {
    if (isAutoplayRunning || isShooting) return;
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 1000; // 1 second hold to trigger autoplay modal

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdTimerRef.current);
        triggerHaptic('heavy');
        setHoldProgress(0);
        openModal('autoplay');
      }
    }, 25);
  };

  const endHold = (triggeredByClick = false) => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (holdProgress < 95 && triggeredByClick && !isAutoplayRunning && !isShooting) {
      // Normal single shot
      onShoot();
    }
    setHoldProgress(0);
  };

  return (
    <div className="w-full bg-raika-surface/90 border border-raika-border rounded-2xl p-3.5 space-y-3 shadow-xl select-none">
      {/* Target Preference Chips */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          Target Filter:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'auto', label: 'All Targets' },
            { id: 'green', label: 'x1.2 Farm' },
            { id: 'blue', label: 'x3 Hunter' },
            { id: 'purple', label: 'x12 Cyber' },
            { id: 'red', label: 'x24 Mech' },
            { id: 'gold', label: 'x100 Gold' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playTapSound();
                onSelectTargetPreference(item.id);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                targetPreference === item.id
                  ? 'bg-cyan-500 text-black font-extrabold shadow-glow-cyan'
                  : 'bg-raika-dark text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bet Amount Controls Row */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Decrement / Increment */}
        <div className="col-span-8 flex items-center bg-raika-dark rounded-xl border border-raika-border p-1">
          <button
            onClick={() => handleIncrement(-1)}
            disabled={isShooting || isAutoplayRunning}
            className="w-8 h-8 rounded-lg bg-raika-surface hover:bg-raika-hover text-gray-300 flex items-center justify-center transition active:scale-90 disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 text-center px-2">
            <span className="text-[9px] text-gray-400 uppercase font-bold block leading-none">Bet Amount</span>
            <div className="text-base font-extrabold text-white font-mono flex items-center justify-center gap-0.5 mt-0.5">
              <span className="text-emerald-400">$</span>
              <span>{betAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => handleIncrement(1)}
            disabled={isShooting || isAutoplayRunning}
            className="w-8 h-8 rounded-lg bg-raika-surface hover:bg-raika-hover text-gray-300 flex items-center justify-center transition active:scale-90 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Multipliers: 1/2, 2X */}
        <div className="col-span-4 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleAdjust(0.5)}
            disabled={isShooting || isAutoplayRunning}
            className="py-2.5 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 text-gray-300 font-bold text-xs transition active:scale-90 disabled:opacity-40"
          >
            ½
          </button>
          <button
            onClick={() => handleAdjust(2)}
            disabled={isShooting || isAutoplayRunning}
            className="py-2.5 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 text-emerald-400 font-bold text-xs transition active:scale-90 disabled:opacity-40"
          >
            2X
          </button>
        </div>
      </div>

      {/* Preset Amount Chips */}
      <div className="grid grid-cols-6 gap-1.5">
        {presets.map((val) => (
          <button
            key={val}
            onClick={() => {
              playTapSound();
              onChangeBet(val);
            }}
            disabled={isShooting || isAutoplayRunning}
            className={`py-1 rounded-lg text-xs font-mono font-bold transition active:scale-95 ${
              betAmount === val
                ? 'bg-emerald-500 text-black font-extrabold shadow-glow-green'
                : 'bg-raika-dark/60 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            ${val}
          </button>
        ))}
      </div>

      {/* Main Action Bar: Shoot / Hold to Autoplay & Autoplay Settings */}
      <div className="flex items-center gap-2 pt-1">
        {/* Autoplay Modal Trigger */}
        <button
          onClick={onOpenAutoplayModal}
          disabled={isShooting || isAutoplayRunning}
          className="w-12 h-12 rounded-2xl bg-raika-surface hover:bg-raika-hover border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-90"
          title="Autoplay Settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        {/* Central Primary Action Button */}
        {isAutoplayRunning ? (
          <button
            onClick={onStopAutoplay}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm uppercase tracking-wider shadow-glow-ruby flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Square className="w-4 h-4 fill-white" />
            Stop Autoplay
          </button>
        ) : (
          <div className="relative flex-1">
            {/* Hold progress ring overlay */}
            <button
              id="chicken-shoot-action-btn"
              onPointerDown={startHold}
              onPointerUp={() => endHold(true)}
              onPointerLeave={() => endHold(false)}
              disabled={isShooting}
              className="relative w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider shadow-glow-green flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-60 overflow-hidden"
            >
              {/* Radial fill background on hold */}
              <div
                className="absolute inset-0 bg-emerald-600/40 pointer-events-none transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />

              <Crosshair className={`w-5 h-5 stroke-[2.5] ${isShooting ? 'animate-spin' : ''}`} />
              <div className="flex flex-col items-center leading-none">
                <span className="text-sm font-black tracking-wide">
                  {isShooting ? 'SHOOTING...' : 'SHOOT / BET'}
                </span>
                <span className="text-[9px] font-bold opacity-80 mt-0.5 tracking-tight">
                  {holdProgress > 0 ? `HOLDING: ${Math.round(holdProgress)}%` : 'HOLD TO AUTOPLAY'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
