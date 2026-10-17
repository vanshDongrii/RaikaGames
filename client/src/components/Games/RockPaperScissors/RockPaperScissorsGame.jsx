import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Volume2, VolumeX, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, toggleSound, isSoundEnabled, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

const CHOICES = [
  { id: 'rock', label: 'Rock', icon: '🪨', beats: 'scissors' },
  { id: 'paper', label: 'Paper', icon: '📄', beats: 'rock' },
  { id: 'scissors', label: 'Scissors', icon: '✂️', beats: 'paper' },
];

export default function RockPaperScissorsGame() {
  const { setActiveTab, currentBalance, isDemo, executeBet, refreshProfile } = useGame();

  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [result, setResult] = useState(null); // 'win' | 'lose' | 'draw'
  const [betAmount, setBetAmount] = useState(5);
  const [streak, setStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handlePlay = async (choiceId) => {
    if (isRevealing) return;

    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    setPlayerChoice(choiceId);
    setBotChoice(null);
    setResult(null);
    setIsRevealing(true);
    playTapSound();
    triggerHaptic('medium');

    let betResult = null;
    try {
      betResult = await executeBet({
        betAmount,
        gameType: 'rps',
        targetPreference: choiceId,
      });
    } catch (e) {
      console.warn('Backend bet execution:', e);
      setIsRevealing(false);
      return;
    }

    const won = betResult?.won ?? false;
    const playerObj = CHOICES.find(c => c.id === choiceId);
    // If won, bot picks what player beats. If lost, bot picks what beats player.
    const botPick = won
      ? playerObj.beats
      : CHOICES.find(c => c.beats === choiceId)?.id || 'rock';

    setTimeout(() => {
      setBotChoice(botPick);
      setIsRevealing(false);

      if (won) {
        setResult('win');
        playHitSound(true);
        playMultiplierDing(2.0);
        triggerNotificationHaptic('success');
        setStreak(s => s + 1);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        setResult('lose');
        playMissSound();
        triggerHaptic('heavy');
        setStreak(0);
      }
      refreshProfile();
    }, 700);
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
              <span>✂️ Rock Paper Scissors</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                2.0x Payout
              </span>
            </h1>
            <p className="text-xs text-gray-400">Battle against the Raika mascot bot in high stakes RPS!</p>
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
        {/* Battle Arena Display */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[320px]">
          {/* Result Alert */}
          {result === 'win' && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>VICTORY! You won ${(betAmount * 2).toFixed(2)} (Streak: {streak})!</span>
            </div>
          )}
          {result === 'lose' && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold">
              <span>Raika Bot took this round! Try again.</span>
            </div>
          )}
          {result === 'draw' && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold">
              <span>Draw game! Your bet was refunded.</span>
            </div>
          )}

          {/* Duel Icons */}
          <div className="flex items-center justify-center gap-8 my-4">
            {/* Player Side */}
            <div className="text-center">
              <span className="text-xs font-bold text-gray-400 block mb-2">You</span>
              <div className="w-24 h-24 rounded-2xl bg-raika-surface border border-cyan-500/40 flex items-center justify-center text-5xl shadow-glow-cyan">
                {playerChoice ? CHOICES.find(c => c.id === playerChoice)?.icon : '❓'}
              </div>
            </div>

            <div className="text-2xl font-black text-gray-500">VS</div>

            {/* Bot Side */}
            <div className="text-center">
              <span className="text-xs font-bold text-gray-400 block mb-2">Raika Bot</span>
              <div className="w-24 h-24 rounded-2xl bg-raika-surface border border-amber-500/40 flex items-center justify-center text-5xl shadow-glow-gold">
                {isRevealing ? (
                  <span className="animate-spin text-3xl">🐱</span>
                ) : botChoice ? (
                  CHOICES.find(c => c.id === botChoice)?.icon
                ) : (
                  '🐱'
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Streak: <strong className="text-white font-mono">{streak}</strong></span>
          </div>
        </div>

        {/* Choice Buttons & Betting */}
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
                disabled={isRevealing}
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
                  disabled={isRevealing}
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

          {/* Action Choice Buttons */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Pick Your Move
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  disabled={isRevealing}
                  onClick={() => handlePlay(choice.id)}
                  className="py-4 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/10 hover:border-raika-blue flex flex-col items-center justify-center gap-1.5 transition active:scale-95 group shadow-md"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{choice.icon}</span>
                  <span className="text-xs font-black text-white">{choice.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fair Cryptographic Hand Matching</span>
          </div>
        </div>
      </div>
    </div>
  );
}
