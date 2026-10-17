import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Volume2, VolumeX, ShieldCheck, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playMultiplierDing, playTapSound, toggleSound, isSoundEnabled, playHitSound, playMissSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function TicTacToeGame() {
  const { setActiveTab, currentBalance, isDemo, settleBet, refreshProfile } = useGame();

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'win' | 'lose' | 'draw'
  const [betAmount, setBetAmount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [winningLine, setWinningLine] = useState(null);

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (squares) => {
    for (let combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: combo };
      }
    }
    if (squares.every(sq => sq !== null)) {
      return { winner: 'draw', line: null };
    }
    return null;
  };

  const handleStartGame = () => {
    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    playTapSound();
    triggerHaptic('medium');

    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinningLine(null);
    setGameState('playing');
  };

  const botMove = (currentBoard) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptyIndices.length === 0) return;

    let chosenIdx = null;

    // Hard/Medium logic: check if bot can win immediately
    if (difficulty !== 'easy') {
      for (let idx of emptyIndices) {
        const copy = [...currentBoard];
        copy[idx] = 'O';
        if (checkWinner(copy)?.winner === 'O') {
          chosenIdx = idx;
          break;
        }
      }
      // Block player win
      if (chosenIdx === null) {
        for (let idx of emptyIndices) {
          const copy = [...currentBoard];
          copy[idx] = 'X';
          if (checkWinner(copy)?.winner === 'X') {
            chosenIdx = idx;
            break;
          }
        }
      }
    }

    // Fallback or random
    if (chosenIdx === null) {
      chosenIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    const nextBoard = [...currentBoard];
    nextBoard[chosenIdx] = 'O';
    setBoard(nextBoard);

    const winCheck = checkWinner(nextBoard);
    if (winCheck) {
      if (winCheck.winner === 'O') {
        setGameState('lose');
        setWinningLine(winCheck.line);
        playMissSound();
        triggerHaptic('heavy');
        settleBet({
          gameType: 'tictactoe',
          betAmount,
          won: false,
          multiplier: 0,
          outcomeDetails: { difficulty, winner: 'bot' },
        }).catch(e => console.warn('TTT settle error:', e));
      } else if (winCheck.winner === 'draw') {
        setGameState('draw');
        playTapSound();
        settleBet({
          gameType: 'tictactoe',
          betAmount,
          won: true,
          multiplier: 1.0,
          outcomeDetails: { difficulty, winner: 'draw' },
        }).catch(e => console.warn('TTT settle error:', e));
      }
      refreshProfile();
    } else {
      setIsPlayerTurn(true);
    }
  };

  const handleSquareClick = (index) => {
    if (gameState !== 'playing' || !isPlayerTurn || board[index] !== null) return;

    playTapSound();
    triggerHaptic('light');

    const nextBoard = [...board];
    nextBoard[index] = 'X';
    setBoard(nextBoard);
    setIsPlayerTurn(false);

    const winCheck = checkWinner(nextBoard);
    if (winCheck) {
      if (winCheck.winner === 'X') {
        setGameState('win');
        setWinningLine(winCheck.line);
        playHitSound(true);
        playMultiplierDing(2.0);
        triggerNotificationHaptic('success');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        settleBet({
          gameType: 'tictactoe',
          betAmount,
          won: true,
          multiplier: 2.0,
          outcomeDetails: { difficulty, winner: 'player' },
        }).catch(e => console.warn('TTT settle error:', e));
      } else if (winCheck.winner === 'draw') {
        setGameState('draw');
        settleBet({
          gameType: 'tictactoe',
          betAmount,
          won: true,
          multiplier: 1.0,
          outcomeDetails: { difficulty, winner: 'draw' },
        }).catch(e => console.warn('TTT settle error:', e));
      }
      refreshProfile();
    } else {
      // Bot's turn with small realistic reaction delay
      setTimeout(() => {
        botMove(nextBoard);
      }, 450);
    }
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
              <span>⭕️ Tic-Tac-Toe vs Raika</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                2.0x Win Payout
              </span>
            </h1>
            <p className="text-xs text-gray-400">Match 3 in a line to beat the Raika AI bot!</p>
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
        {/* Board Container */}
        <div className="bg-raika-card border border-raika-border/70 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[340px]">
          {/* Outcome Alert */}
          {gameState === 'win' && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>VICTORY! You won ${(betAmount * 2).toFixed(2)} (2.0x)!</span>
            </div>
          )}
          {gameState === 'lose' && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold">
              <span>Raika Bot won this round! Try again.</span>
            </div>
          )}
          {gameState === 'draw' && (
            <div className="mb-4 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold">
              <span>Draw game! Your bet was refunded.</span>
            </div>
          )}

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-2.5 w-64 h-64">
            {board.map((cell, idx) => {
              const isWinSquare = winningLine?.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={gameState !== 'playing' || !isPlayerTurn || cell !== null}
                  onClick={() => handleSquareClick(idx)}
                  className={`rounded-2xl flex items-center justify-center text-3xl font-black transition transform ${
                    cell === 'X'
                      ? isWinSquare
                        ? 'bg-cyan-500/40 border-2 border-cyan-400 text-cyan-300 shadow-glow-cyan scale-95'
                        : 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-400'
                      : cell === 'O'
                      ? isWinSquare
                        ? 'bg-amber-500/40 border-2 border-amber-400 text-amber-300 shadow-glow-gold scale-95'
                        : 'bg-amber-950/40 border border-amber-500/40 text-amber-400'
                      : gameState === 'playing' && isPlayerTurn
                      ? 'bg-raika-surface hover:bg-raika-hover border border-white/10 active:scale-95 cursor-pointer'
                      : 'bg-raika-surface/40 border border-white/5'
                  }`}
                >
                  {cell === 'X' ? '✕' : cell === 'O' ? '🐱' : ''}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs font-bold">
            <span className="text-cyan-400 flex items-center gap-1">✕ You (Player)</span>
            <span className="text-amber-400 flex items-center gap-1">🐱 Raika Bot</span>
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

          {/* Difficulty selector */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Bot AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'easy', label: 'Casual' },
                { id: 'medium', label: 'Challenger' },
                { id: 'hard', label: 'Grandmaster' },
              ].map((d) => (
                <button
                  key={d.id}
                  disabled={gameState === 'playing'}
                  onClick={() => setDifficulty(d.id)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                    difficulty === d.id
                      ? 'bg-raika-blue text-white border-raika-blue shadow-md'
                      : 'bg-raika-surface text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start / Restart Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-raika-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
          >
            {gameState === 'playing' ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Restart Round</span>
              </>
            ) : (
              <span>Start Match • Win ${(betAmount * 2).toFixed(2)}</span>
            )}
          </button>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fair Match Engine • Instant Settlement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
