import React, { useState } from 'react';
import { Trophy, Flame, Clock, Radio, Check } from 'lucide-react';
import { playTapSound } from '../../../utils/audio';
import { triggerHaptic } from '../../../utils/telegram';

export default function SportsView() {
  const [selectedOdd, setSelectedOdd] = useState(null);

  const matches = [
    {
      id: 1,
      league: 'UEFA Champions League',
      home: 'Real Madrid',
      away: 'Manchester City',
      time: '68\'',
      score: '2 - 1',
      isLive: true,
      odds: { home: 2.15, draw: 3.40, away: 3.10 },
    },
    {
      id: 2,
      league: 'English Premier League',
      home: 'Arsenal',
      away: 'Liverpool',
      time: 'Today 20:45',
      score: 'vs',
      isLive: false,
      odds: { home: 2.45, draw: 3.25, away: 2.70 },
    },
    {
      id: 3,
      league: 'NBA Basketball',
      home: 'LA Lakers',
      away: 'Golden State Warriors',
      time: 'Q3 04:12',
      score: '84 - 82',
      isLive: true,
      odds: { home: 1.85, draw: null, away: 1.95 },
    },
    {
      id: 4,
      league: 'CS2 Major Championship',
      home: 'Natus Vincere',
      away: 'FaZe Clan',
      time: 'Map 2',
      score: '1 - 0',
      isLive: true,
      odds: { home: 1.65, draw: null, away: 2.20 },
    },
  ];

  const handlePickOdd = (matchId, pick, value) => {
    playTapSound();
    triggerHaptic('light');
    setSelectedOdd({ matchId, pick, value });
  };

  return (
    <div className="w-full space-y-3 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-extrabold text-white">Sportsbook & Live Arena</h2>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase">
          <Radio className="w-3 h-3 animate-pulse" />
          Live Odds
        </span>
      </div>

      {/* Match Cards */}
      <div className="space-y-2.5">
        {matches.map((m) => (
          <div
            key={m.id}
            className="bg-raika-surface/90 border border-raika-border rounded-2xl p-3.5 space-y-2.5 shadow-md"
          >
            {/* League & Time */}
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">{m.league}</span>
              <span className={`font-mono font-bold flex items-center gap-1 ${m.isLive ? 'text-rose-400' : 'text-gray-400'}`}>
                {m.isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                {m.time}
              </span>
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-between text-sm font-bold text-white">
              <div className="flex-1 truncate">{m.home}</div>
              <div className="px-3 font-mono text-emerald-400 font-extrabold">{m.score}</div>
              <div className="flex-1 text-right truncate">{m.away}</div>
            </div>

            {/* Odds Buttons */}
            <div className={`grid gap-1.5 ${m.odds.draw ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <button
                onClick={() => handlePickOdd(m.id, '1', m.odds.home)}
                className={`py-1.5 rounded-xl border text-xs font-mono font-bold flex flex-col items-center transition active:scale-95 ${
                  selectedOdd?.matchId === m.id && selectedOdd?.pick === '1'
                    ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-glow-green'
                    : 'bg-raika-dark/80 border-white/5 text-gray-300 hover:bg-raika-hover'
                }`}
              >
                <span className="text-[10px] opacity-75">1 (Home)</span>
                <span>{m.odds.home.toFixed(2)}</span>
              </button>

              {m.odds.draw && (
                <button
                  onClick={() => handlePickOdd(m.id, 'X', m.odds.draw)}
                  className={`py-1.5 rounded-xl border text-xs font-mono font-bold flex flex-col items-center transition active:scale-95 ${
                    selectedOdd?.matchId === m.id && selectedOdd?.pick === 'X'
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-glow-green'
                      : 'bg-raika-dark/80 border-white/5 text-gray-300 hover:bg-raika-hover'
                  }`}
                >
                  <span className="text-[10px] opacity-75">X (Draw)</span>
                  <span>{m.odds.draw.toFixed(2)}</span>
                </button>
              )}

              <button
                onClick={() => handlePickOdd(m.id, '2', m.odds.away)}
                className={`py-1.5 rounded-xl border text-xs font-mono font-bold flex flex-col items-center transition active:scale-95 ${
                  selectedOdd?.matchId === m.id && selectedOdd?.pick === '2'
                    ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-glow-green'
                    : 'bg-raika-dark/80 border-white/5 text-gray-300 hover:bg-raika-hover'
                }`}
              >
                <span className="text-[10px] opacity-75">2 (Away)</span>
                <span>{m.odds.away.toFixed(2)}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Betting Slip if an odd is picked */}
      {selectedOdd && (
        <div className="fixed bottom-16 left-4 right-4 z-30 max-w-md mx-auto p-3 bg-raika-card border border-emerald-500/50 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce">
          <div>
            <div className="text-xs font-bold text-white">Bet Slip: Pick #{selectedOdd.pick}</div>
            <div className="text-[11px] text-emerald-400 font-mono font-extrabold">
              Total Odds: {selectedOdd.value.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('heavy');
              alert(`Bet placed on odd ${selectedOdd.value}! Good luck.`);
              setSelectedOdd(null);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-glow-green active:scale-95 transition"
          >
            Place Wager
          </button>
        </div>
      )}
    </div>
  );
}
