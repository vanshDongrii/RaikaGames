import React, { useState, useRef } from 'react';
import { ArrowLeft, Zap, Sparkles, Volume2, VolumeX, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, toggleSound, isSoundEnabled, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function ReactionTestGame() {
  const { setActiveTab, currentBalance, isDemo, settleBet, refreshProfile } = useGame();

  const [state, setState] = useState('idle'); // 'idle' | 'waiting' | 'ready' | 'result' | 'early'
  const [reactionTime, setReactionTime] = useState(null);
  const [betAmount, setBetAmount] = useState(5);
  const [rank, setRank] = useState(null);
  const [payoutMult, setPayoutMult] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    return Number(localStorage.getItem('raika_best_reaction')) || null;
  });
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const startTest = () => {
    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    playTapSound();
    triggerHaptic('medium');

    setState('waiting');
    setReactionTime(null);
    setRank(null);

    // Random delay between 1.5s and 4.5s
    const delay = Math.floor(Math.random() * 3000) + 1500;
    timerRef.current = setTimeout(() => {
      setState('ready');
      startTimeRef.current = performance.now();
      triggerHaptic('heavy');
    }, delay);
  };

  const handleClickArea = async () => {
    if (state === 'idle' || state === 'result' || state === 'early') {
      startTest();
      return;
    }

    if (state === 'waiting') {
      // Clicked too early!
      clearTimeout(timerRef.current);
      setState('early');
      playMissSound();
      triggerHaptic('heavy');

      // Settle loss on backend
      settleBet({
        gameType: 'reaction_test',
        betAmount,
        won: false,
        multiplier: 0,
        outcomeDetails: { early: true },
      }).catch(e => console.warn('Reaction settle error:', e));
      refreshProfile();
      return;
    }

    if (state === 'ready') {
      // Valid reaction!
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(elapsed);

      let mult = 0;
      let r = '';

      if (elapsed < 210) {
        mult = 3.0;
        r = '⚡️ Godlike Reflexes!';
      } else if (elapsed <= 270) {
        mult = 2.0;
        r = '🐆 Cheetah Speed!';
      } else if (elapsed <= 340) {
        mult = 1.4;
        r = '🦊 Quick Fox!';
      } else {
        mult = 0.5;
        r = '🐢 Sloth Pace!';
      }

      setRank(r);
      setPayoutMult(mult);
      setState('result');

      if (!bestTime || elapsed < bestTime) {
        setBestTime(elapsed);
        localStorage.setItem('raika_best_reaction', elapsed);
      }

      // Settle accurate payout on backend
      try {
        await settleBet({
          gameType: 'reaction_test',
          betAmount,
          won: mult >= 1.0,
          multiplier: mult,
          outcomeDetails: { elapsed, rank: r },
        });
      } catch (e) {
        console.warn('Reaction settle error:', e);
      }

      if (mult >= 1.4) {
        playHitSound(true);
        playMultiplierDing(mult);
        triggerNotificationHaptic('success');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        playMissSound();
      }

      refreshProfile();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between bg-raika-card border border-raika-border/70 rounded-2xl p-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setActiveTab('lobby');
            }}
            className="w-9 h-9 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>⚡️ Reaction Speed Test</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Up to 3.0x
              </span>
            </h1>
            <p className="text-xs text-gray-400">Wait for the screen to turn green, then tap as fast as humanly possible!</p>
          </div>
        </div>

        <button
          onClick={() => setSoundOn(toggleSound())}
          className="w-9 h-9 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Reaction Pad */}
        <div
          onClick={handleClickArea}
          className={`md:col-span-2 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[380px] cursor-pointer transition-all duration-150 shadow-2xl ${
            state === 'waiting'
              ? 'bg-rose-950 border-4 border-rose-600 animate-pulse'
              : state === 'ready'
              ? 'bg-emerald-600 border-4 border-emerald-300 shadow-glow-green scale-102'
              : state === 'early'
              ? 'bg-amber-950 border-2 border-amber-500'
              : 'bg-raika-card border border-raika-border/70 hover:border-raika-blue/50'
          }`}
        >
          {state === 'idle' && (
            <div className="text-center space-y-2">
              <Zap className="w-16 h-16 text-cyan-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-black text-white">Click To Start Test</h2>
              <p className="text-xs text-gray-400 max-w-xs">
                When the box turns green, tap anywhere instantly. Sub-210ms pays 3.0x!
              </p>
            </div>
          )}

          {state === 'waiting' && (
            <div className="text-center space-y-2">
              <div className="text-6xl animate-spin">⏳</div>
              <h2 className="text-2xl font-black text-rose-300">Wait for green...</h2>
              <p className="text-xs text-rose-400">Do not tap yet!</p>
            </div>
          )}

          {state === 'ready' && (
            <div className="text-center space-y-2">
              <div className="text-6xl animate-bounce">⚡️</div>
              <h2 className="text-4xl font-black text-black uppercase tracking-wider">TAP NOW!</h2>
            </div>
          )}

          {state === 'early' && (
            <div className="text-center space-y-2">
              <div className="text-6xl">⚠️</div>
              <h2 className="text-2xl font-black text-amber-300">Too Early!</h2>
              <p className="text-xs text-amber-400">You tapped before the screen turned green. Tap to retry.</p>
            </div>
          )}

          {state === 'result' && (
            <div className="text-center space-y-2 animate-scaleIn">
              <span className="text-5xl font-black font-mono text-emerald-400">{reactionTime} ms</span>
              <h3 className="text-xl font-black text-white mt-2">{rank}</h3>
              <p className="text-xs font-mono text-gray-300">
                Payout: {payoutMult}x • ${ (betAmount * payoutMult).toFixed(2) }
              </p>
              <div className="pt-4">
                <span className="px-4 py-2 rounded-xl bg-raika-blue text-white text-xs font-black uppercase tracking-wider shadow">
                  Tap to play again
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls and Benchmark Ranks */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-4 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Bet Amount ($)
            </label>
            <div className="flex items-center bg-raika-surface rounded-xl border border-white/10 px-3 py-2">
              <span className="text-gray-400 mr-2 font-mono font-bold">$</span>
              <input
                type="number"
                disabled={state === 'waiting' || state === 'ready'}
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
                  disabled={state === 'waiting' || state === 'ready'}
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

          {/* Benchmark Ranks Table */}
          <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Speed Multipliers
            </span>
            <div className="flex justify-between items-center text-gray-300">
              <span>{'<'} 210 ms (Godlike)</span>
              <span className="font-mono font-bold text-amber-400">3.0x</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span>210–270 ms (Cheetah)</span>
              <span className="font-mono font-bold text-emerald-400">2.0x</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span>270–340 ms (Fox)</span>
              <span className="font-mono font-bold text-cyan-400">1.4x</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>{'>'} 340 ms (Sloth)</span>
              <span className="font-mono font-bold text-gray-500">0.5x</span>
            </div>
          </div>

          {bestTime && (
            <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/20 text-xs flex justify-between items-center">
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Flame className="w-4 h-4 text-cyan-400" />
                Personal Record:
              </span>
              <span className="font-mono font-black text-white">{bestTime} ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
