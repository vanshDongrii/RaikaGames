import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Sparkles, Volume2, VolumeX, ShieldCheck, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, toggleSound, isSoundEnabled, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

const ICONS = ['🐱', '💎', '🪙', '🍗', '🚀', '💣', '🍭', '⚡️'];

export default function MemoryMatchGame() {
  const { setActiveTab, currentBalance, isDemo, settleBet, refreshProfile } = useGame();

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'won'
  const [betAmount, setBetAmount] = useState(5);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    let interval = null;
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const initGame = () => {
    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    playTapSound();
    triggerHaptic('medium');

    const pairDeck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon }));

    setCards(pairDeck);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMoves(0);
    setTimer(0);
    setGameState('playing');
  };

  const handleCardClick = (index) => {
    if (gameState !== 'playing') return;
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index) || matchedIndices.includes(index)) return;

    playTapSound();
    triggerHaptic('light');

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      const [idx1, idx2] = nextFlipped;

      if (cards[idx1].icon === cards[idx2].icon) {
        // Matched!
        playHitSound(true);
        triggerHaptic('medium');
        const nextMatched = [...matchedIndices, idx1, idx2];
        setMatchedIndices(nextMatched);
        setFlippedIndices([]);

        if (nextMatched.length === cards.length) {
          // Game Completed
          setGameState('won');
          playMultiplierDing(2.5);
          triggerNotificationHaptic('success');
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          settleBet({
            gameType: 'memory_match',
            betAmount,
            won: true,
            multiplier: 2.5,
            outcomeDetails: { moves: moves + 1, timeSeconds: timer },
          }).catch(e => console.warn('Memory settle error:', e));
          refreshProfile();
        }
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  const winPayout = (betAmount * 2.5).toFixed(2);

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
              <span>🃏 Raika Memory Match</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                2.5x Payout
              </span>
            </h1>
            <p className="text-xs text-gray-400">Match all 8 pairs of Raika cards as fast as you can!</p>
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
        {/* Controls and Stats */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-4 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Bet Amount ($)
            </label>
            <div className="flex items-center bg-raika-surface rounded-xl border border-white/10 px-3 py-2">
              <span className="text-gray-400 mr-2 font-mono font-bold">$</span>
              <input
                type="number"
                disabled={gameState === 'playing'}
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
                  disabled={gameState === 'playing'}
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

          <button
            onClick={initGame}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-raika-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg active:scale-95 transition"
          >
            {gameState === 'playing' ? 'Restart Puzzle' : `Start Puzzle • Win $${winPayout}`}
          </button>

          {/* Stats */}
          <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Time:
              </span>
              <span className="font-mono font-bold text-white">{timer}s</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Moves:</span>
              <span className="font-mono font-bold text-white">{moves}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Pairs Matched:</span>
              <span className="font-mono font-bold text-emerald-400">
                {matchedIndices.length / 2} / 8
              </span>
            </div>
          </div>
        </div>

        {/* 4x4 Grid Container */}
        <div className="md:col-span-2 bg-raika-card border border-raika-border/70 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center min-h-[380px]">
          {gameState === 'won' && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Puzzle Solved in {timer}s! You won ${winPayout}!</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm aspect-square">
            {(cards.length > 0 ? cards : Array(16).fill({ icon: '❓' })).map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedIndices.includes(idx);
              const isMatched = matchedIndices.includes(idx);

              return (
                <button
                  key={idx}
                  disabled={gameState !== 'playing' || isMatched}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 transform ${
                    isFlipped
                      ? isMatched
                        ? 'bg-emerald-950/40 border-2 border-emerald-400 text-white shadow-glow-green scale-95'
                        : 'bg-raika-surface border-2 border-raika-blue text-white shadow-md rotate-y-180'
                      : gameState === 'playing'
                      ? 'bg-raika-surface hover:bg-raika-hover border border-white/10 active:scale-95 cursor-pointer shadow'
                      : 'bg-raika-surface/40 border border-white/5 opacity-70 cursor-default'
                  }`}
                >
                  {isFlipped ? card.icon : '🐾'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
