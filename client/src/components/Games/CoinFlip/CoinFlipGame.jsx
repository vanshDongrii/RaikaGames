import React, { useState } from 'react';
import { ArrowLeft, Coins, Sparkles, Volume2, VolumeX, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, toggleSound, isSoundEnabled, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function CoinFlipGame() {
  const { setActiveTab, currentBalance, isDemo, executeBet, refreshProfile } = useGame();

  const [betAmount, setBetAmount] = useState(5);
  const [chosenSide, setChosenSide] = useState('heads'); // 'heads' | 'tails'
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null); // 'heads' | 'tails'
  const [history, setHistory] = useState(['heads', 'tails', 'heads', 'heads']);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleFlip = async () => {
    if (isFlipping) return;

    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    setIsFlipping(true);
    setResult(null);
    playTapSound();
    triggerHaptic('medium');

    let betResult = null;
    try {
      betResult = await executeBet({
        betAmount,
        gameType: 'coin_flip',
        targetPreference: chosenSide,
      });
    } catch (e) {
      console.warn('Backend bet execution:', e);
      setIsFlipping(false);
      return;
    }

    // Determine outcome strictly based on server-verified bet result
    const outcome = betResult?.won ? chosenSide : (chosenSide === 'heads' ? 'tails' : 'heads');

    setTimeout(() => {
      setResult(outcome);
      setIsFlipping(false);
      setHistory(prev => [outcome, ...prev.slice(0, 9)]);

      const won = outcome === chosenSide;
      if (won) {
        playHitSound(true);
        playMultiplierDing(1.96);
        triggerNotificationHaptic('success');
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);

        if (nextStreak >= 3) {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
          });
        }
      } else {
        playMissSound();
        triggerHaptic('heavy');
        setStreak(0);
      }
      refreshProfile();
    }, 1200);
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
              <span>🪙 Raika Coin Flip</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                1.96x Payout
              </span>
            </h1>
            <p className="text-xs text-gray-400">Pick Heads or Tails, flip the golden medallion!</p>
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
        {/* Coin Display Area */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[340px]">
          {/* History Pill Row */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">History:</span>
            <div className="flex gap-1.5">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                    h === 'heads'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-blue-500/20 text-cyan-400 border-blue-500/40'
                  }`}
                >
                  {h === 'heads' ? 'H' : 'T'}
                </span>
              ))}
            </div>
          </div>

          {/* 3D Animated Coin */}
          <div className="relative my-4">
            <div
              className={`w-36 h-36 rounded-full border-4 flex items-center justify-center shadow-2xl transition-transform duration-700 ${
                isFlipping
                  ? 'animate-spin border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-300'
                  : result === 'heads' || (!result && chosenSide === 'heads')
                  ? 'border-amber-400 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-glow-gold'
                  : 'border-blue-400 bg-gradient-to-tr from-blue-700 via-cyan-400 to-blue-300 shadow-glow-cyan'
              }`}
            >
              <div className="text-center text-black font-black">
                {isFlipping ? (
                  <span className="text-4xl">💫</span>
                ) : result ? (
                  result === 'heads' ? (
                    <div>
                      <div className="text-4xl">🐱</div>
                      <div className="text-xs uppercase font-extrabold tracking-wider mt-1">HEADS</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl">🐾</div>
                      <div className="text-xs uppercase font-extrabold tracking-wider mt-1">TAILS</div>
                    </div>
                  )
                ) : (
                  <div>
                    <div className="text-4xl">{chosenSide === 'heads' ? '🐱' : '🐾'}</div>
                    <div className="text-xs uppercase font-extrabold tracking-wider mt-1">{chosenSide}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outcome Status */}
          {result && !isFlipping && (
            <div className={`mt-4 px-4 py-1.5 rounded-xl text-xs font-black tracking-wide border flex items-center gap-1.5 ${
              result === chosenSide
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}>
              {result === chosenSide ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>WIN! +${(betAmount * 1.96).toFixed(2)} (Streak: {streak})</span>
                </>
              ) : (
                <span>MISS! Try again.</span>
              )}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-4 shadow-xl space-y-4">
          {/* Side Pick Buttons */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Select Side
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isFlipping}
                onClick={() => {
                  playTapSound();
                  setChosenSide('heads');
                }}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  chosenSide === 'heads'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-gold'
                    : 'bg-raika-surface border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-2xl">🐱</span>
                <span className="text-xs font-black uppercase">Heads (Raika)</span>
              </button>

              <button
                disabled={isFlipping}
                onClick={() => {
                  playTapSound();
                  setChosenSide('tails');
                }}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  chosenSide === 'tails'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-glow-cyan'
                    : 'bg-raika-surface border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-2xl">🐾</span>
                <span className="text-xs font-black uppercase">Tails (Paw)</span>
              </button>
            </div>
          </div>

          {/* Bet Amount */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Bet Amount ($)
            </label>
            <div className="flex items-center bg-raika-surface rounded-xl border border-white/10 px-3 py-2">
              <span className="text-gray-400 mr-2 font-mono font-bold">$</span>
              <input
                type="number"
                disabled={isFlipping}
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
                  disabled={isFlipping}
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

          {/* Flip Action Button */}
          <button
            onClick={handleFlip}
            disabled={isFlipping}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
              isFlipping
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-raika-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white active:scale-95'
            }`}
          >
            <Coins className="w-4 h-4 fill-current" />
            {isFlipping ? 'Flipping Medallion...' : `Flip Coin • Win $${(betAmount * 1.96).toFixed(2)}`}
          </button>

          {/* Stats Bar */}
          <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Current Streak: <strong className="text-white font-mono">{streak}</strong>
            </span>
            <span className="text-gray-400">
              Best: <strong className="text-emerald-400 font-mono">{maxStreak}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
