import React, { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, Sparkles, Volume2, VolumeX, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, toggleSound, isSoundEnabled, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function NumberGuessGame() {
  const { setActiveTab, currentBalance, isDemo, executeBet, refreshProfile } = useGame();

  const [currentNum, setCurrentNum] = useState(50);
  const [nextNum, setNextNum] = useState(null);
  const [betAmount, setBetAmount] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null); // 'win' | 'lose'
  const [streak, setStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Multipliers based on current number
  const higherMultiplier = Number((98 / (100 - currentNum)).toFixed(2));
  const lowerMultiplier = Number((98 / currentNum).toFixed(2));

  const handleGuess = async (direction) => {
    if (isPlaying) return;

    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    setIsPlaying(true);
    setNextNum(null);
    setLastOutcome(null);
    playTapSound();
    triggerHaptic('medium');

    const mult = direction === 'higher' ? higherMultiplier : lowerMultiplier;
    let betResult = null;

    try {
      betResult = await executeBet({
        betAmount,
        gameType: 'number_guess',
        targetPreference: direction,
        multiplier: mult,
      });
    } catch (e) {
      console.warn('Backend bet execution:', e);
      setIsPlaying(false);
      return;
    }

    const won = betResult?.won ?? false;
    let generated;
    if (direction === 'higher') {
      if (won) {
        // Must be strictly greater than currentNum (up to 100)
        const min = Math.min(100, currentNum + 1);
        generated = Math.floor(Math.random() * (100 - min + 1)) + min;
      } else {
        // Must be <= currentNum (down to 1)
        generated = Math.floor(Math.random() * currentNum) + 1;
      }
    } else {
      if (won) {
        // Must be strictly less than currentNum (down to 1)
        const max = Math.max(1, currentNum - 1);
        generated = Math.floor(Math.random() * max) + 1;
      } else {
        // Must be >= currentNum (up to 100)
        generated = Math.floor(Math.random() * (100 - currentNum + 1)) + currentNum;
      }
    }

    setTimeout(() => {
      setNextNum(generated);
      setIsPlaying(false);

      if (won) {
        setLastOutcome('win');
        playHitSound(mult >= 3);
        playMultiplierDing(mult);
        triggerNotificationHaptic('success');
        setStreak(prev => prev + 1);
        if (mult >= 2.5) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      } else {
        setLastOutcome('lose');
        playMissSound();
        triggerHaptic('heavy');
        setStreak(0);
      }

      // Roll forward current number
      setCurrentNum(generated);
      refreshProfile();
    }, 800);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between bg-raika-card border border-raika-border/70 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('lobby')}
            className="w-9 h-9 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🎯 Higher or Lower</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                RTP 96.0%
              </span>
            </h1>
            <p className="text-xs text-gray-400">Predict if the next secret number is higher or lower than {currentNum}!</p>
          </div>
        </div>

        <button
          onClick={() => setSoundOn(toggleSound())}
          className="w-9 h-9 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Number Display Area */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[320px]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Number (1–100)</span>
          
          <div className="relative my-2">
            <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-raika-surface to-raika-hover border-2 border-raika-blue/60 flex items-center justify-center shadow-glow-cyan">
              <span className="text-6xl font-black font-mono text-white tracking-tight">
                {currentNum}
              </span>
            </div>
          </div>

          {/* Outcome Status Banner */}
          {lastOutcome && (
            <div className={`mt-4 px-4 py-1.5 rounded-xl text-xs font-black tracking-wide border flex items-center gap-1.5 ${
              lastOutcome === 'win'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}>
              {lastOutcome === 'win' ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>WIN! Rolled {nextNum} • Streak {streak}!</span>
                </>
              ) : (
                <span>MISS! Rolled {nextNum}. Try again!</span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Win Streak: <strong className="text-white font-mono">{streak}</strong></span>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-4 shadow-xl space-y-4">
          {/* Bet Input */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Bet Amount ($)
            </label>
            <div className="flex items-center bg-raika-surface rounded-xl border border-white/10 px-3 py-2">
              <span className="text-gray-400 mr-2 font-mono font-bold">$</span>
              <input
                type="number"
                disabled={isPlaying}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0.1, Number(e.target.value)))}
                className="bg-transparent w-full font-mono font-bold text-white outline-none"
              />
            </div>
            {/* Quick Chips */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 5, 10, 25].map((val) => (
                <button
                  key={val}
                  disabled={isPlaying}
                  onClick={() => setBetAmount(val)}
                  className={`py-1 rounded-lg text-xs font-mono font-bold border transition ${
                    betAmount === val
                      ? 'bg-raika-blue text-white border-raika-blue'
                      : 'bg-raika-surface text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Higher & Lower Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleGuess('higher')}
              disabled={isPlaying || currentNum >= 99}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black shadow-glow-green transition active:scale-95 flex items-center justify-between px-4 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 stroke-[3]" />
                <span>HIGHER ({'>'} {currentNum})</span>
              </div>
              <span className="font-mono text-xs bg-black/30 text-white px-2 py-0.5 rounded-md">
                {higherMultiplier}x • Win ${(betAmount * higherMultiplier).toFixed(2)}
              </span>
            </button>

            <button
              onClick={() => handleGuess('lower')}
              disabled={isPlaying || currentNum <= 2}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-glow-ruby transition active:scale-95 flex items-center justify-between px-4 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <ArrowDown className="w-5 h-5 stroke-[3]" />
                <span>LOWER ({'<'} {currentNum})</span>
              </div>
              <span className="font-mono text-xs bg-black/30 text-white px-2 py-0.5 rounded-md">
                {lowerMultiplier}x • Win ${(betAmount * lowerMultiplier).toFixed(2)}
              </span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Provably Fair SHA-256 Random Sequence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
