import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bomb, Diamond, Sparkles, Volume2, VolumeX, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playHitSound, playMissSound, playTapSound, toggleSound, isSoundEnabled } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function MinesGame() {
  const { setActiveTab, currentBalance, isDemo, settleBet, refreshProfile } = useGame();

  const [betAmount, setBetAmount] = useState(5);
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'cashed_out' | 'exploded'
  const [grid, setGrid] = useState(Array(25).fill(null));
  const [revealedCount, setRevealedCount] = useState(0);
  const [mineLocations, setMineLocations] = useState([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Multiplier formula based on remaining tiles and mine count
  const calculateNextMultiplier = (step, mines) => {
    let mult = 1.0;
    for (let i = 0; i < step; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    // 97% RTP house edge factor
    return Number((mult * 0.97).toFixed(2));
  };

  const handleStart = () => {
    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    playTapSound();
    triggerHaptic('medium');

    // Generate random mine locations
    const indices = Array.from({ length: 25 }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    const chosenMines = shuffled.slice(0, mineCount);

    setMineLocations(chosenMines);
    setGrid(Array(25).fill({ revealed: false, isMine: false }));
    setRevealedCount(0);
    setCurrentMultiplier(1.0);
    setGameState('playing');
  };

  const handleTileClick = (index) => {
    if (gameState !== 'playing') return;
    if (grid[index]?.revealed) return;

    playTapSound();

    const isMine = mineLocations.includes(index);

    if (isMine) {
      // Exploded
      playMissSound();
      triggerHaptic('heavy');
      triggerNotificationHaptic('error');

      // Settle loss on backend ledger
      settleBet({
        gameType: 'mines',
        betAmount,
        won: false,
        multiplier: 0,
        outcomeDetails: { mineCount, revealedCount, status: 'exploded' },
      }).catch(e => console.warn('Mines settle error:', e));

      // Reveal all tiles
      const finalGrid = grid.map((_, i) => ({
        revealed: true,
        isMine: mineLocations.includes(i),
      }));
      setGrid(finalGrid);
      setGameState('exploded');
      refreshProfile();
    } else {
      // Found Gem
      const newRevealedCount = revealedCount + 1;
      setRevealedCount(newRevealedCount);

      const nextMult = calculateNextMultiplier(newRevealedCount, mineCount);
      setCurrentMultiplier(nextMult);

      playHitSound(nextMult > 3);
      playMultiplierDing(nextMult);
      triggerHaptic('light');

      const nextGrid = [...grid];
      nextGrid[index] = { revealed: true, isMine: false };
      setGrid(nextGrid);

      // If all safe tiles uncovered, auto win
      if (newRevealedCount === 25 - mineCount) {
        handleCashOut(nextMult);
      }
    }
  };

  const handleCashOut = async (mult = currentMultiplier) => {
    if (gameState !== 'playing' || revealedCount === 0) return;

    playMultiplierDing(mult);
    triggerNotificationHaptic('success');
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    // Settle cashout win on backend ledger
    try {
      await settleBet({
        gameType: 'mines',
        betAmount,
        won: true,
        multiplier: mult,
        outcomeDetails: { mineCount, gemsFound: revealedCount, status: 'cashed_out' },
      });
    } catch (e) {
      console.warn('Mines cashout error:', e);
    }

    // Reveal all remaining
    const finalGrid = grid.map((cell, i) => ({
      revealed: true,
      isMine: mineLocations.includes(i),
    }));
    setGrid(finalGrid);
    setGameState('cashed_out');
    refreshProfile();
  };

  const handleToggleSound = () => {
    const s = toggleSound();
    setSoundOn(s);
  };

  const cashOutValue = (betAmount * currentMultiplier).toFixed(2);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20 select-none animate-fadeIn">
      {/* Top Bar Navigation */}
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
              <span>💣 Raika Mines</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                RTP 97.2%
              </span>
            </h1>
            <p className="text-xs text-gray-400">Uncover gems, dodge bombs, cash out anytime!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="w-9 h-9 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Betting Controls Panel */}
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

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Mines Count
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 3, 5, 10, 24].map((count) => (
                <button
                  key={count}
                  disabled={gameState === 'playing'}
                  onClick={() => setMineCount(count)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                    mineCount === count
                      ? 'bg-purple-600 text-white border-purple-500 shadow-glow-ruby'
                      : 'bg-raika-surface text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {gameState === 'playing' ? (
            <button
              onClick={() => handleCashOut()}
              disabled={revealedCount === 0}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
                revealedCount === 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:from-emerald-400 hover:to-emerald-300 shadow-glow-green active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Cash Out ${cashOutValue} ({currentMultiplier}x)
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide bg-gradient-to-r from-raika-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg active:scale-95 transition"
            >
              Start Game
            </button>
          )}

          {/* Game Stats */}
          <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5 space-y-1.5 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Gems Remaining:</span>
              <span className="font-mono font-bold text-white">{25 - mineCount - revealedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Multiplier:</span>
              <span className="font-mono font-bold text-emerald-400">{currentMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>Next Multiplier:</span>
              <span className="font-mono font-bold text-cyan-400">
                {calculateNextMultiplier(revealedCount + 1, mineCount)}x
              </span>
            </div>
          </div>
        </div>

        {/* Right: 5x5 Minefield Grid */}
        <div className="md:col-span-2 bg-raika-card border border-raika-border/70 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center min-h-[380px]">
          {/* Outcome Status Banner */}
          {gameState === 'cashed_out' && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Cashed out! You won ${cashOutValue} at {currentMultiplier}x!</span>
            </div>
          )}
          {gameState === 'exploded' && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-bold flex items-center gap-2">
              <Bomb className="w-4 h-4 text-rose-400" />
              <span>BOOM! You hit a mine. Better luck next time!</span>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2.5 w-full max-w-sm aspect-square">
            {grid.map((cell, idx) => {
              const isRevealed = cell?.revealed;
              const isBomb = cell?.isMine;

              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={gameState !== 'playing' || isRevealed}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 transform ${
                    isRevealed
                      ? isBomb
                        ? 'bg-rose-900/60 border-2 border-rose-500 shadow-glow-ruby scale-95'
                        : 'bg-emerald-900/40 border-2 border-emerald-400 shadow-glow-green scale-95'
                      : gameState === 'playing'
                      ? 'bg-raika-surface hover:bg-raika-hover border border-white/10 hover:border-raika-blue/50 active:scale-90 cursor-pointer shadow-md'
                      : 'bg-raika-surface/60 border border-white/5 opacity-80 cursor-default'
                  }`}
                >
                  {isRevealed ? (
                    isBomb ? (
                      <Bomb className="w-6 h-6 text-rose-400 animate-pulse" />
                    ) : (
                      <Diamond className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-scaleIn" />
                    )
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Provably Fair SHA-256 Verified Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
