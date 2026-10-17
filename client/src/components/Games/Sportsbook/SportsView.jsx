import React, { useState } from 'react';
import { Trophy, Flame, Clock, Radio, Check, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playTapSound, playMultiplierDing } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function SportsView() {
  const { currentBalance, isDemo, executeBet, refreshProfile } = useGame();
  const [selectedOdd, setSelectedOdd] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [activeSportFilter, setActiveSportFilter] = useState('all');

  const matches = [
    {
      id: 1,
      sport: 'soccer',
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
      sport: 'soccer',
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
      sport: 'basketball',
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
      sport: 'esports',
      league: 'CS2 Major Championship',
      home: 'Natus Vincere',
      away: 'FaZe Clan',
      time: 'Map 2',
      score: '1 - 0',
      isLive: true,
      odds: { home: 1.65, draw: null, away: 2.20 },
    },
    {
      id: 5,
      sport: 'soccer',
      league: 'Spanish La Liga',
      home: 'Barcelona',
      away: 'Atletico Madrid',
      time: 'Tomorrow 21:00',
      score: 'vs',
      isLive: false,
      odds: { home: 1.90, draw: 3.60, away: 3.80 },
    },
  ];

  const filteredMatches = activeSportFilter === 'all'
    ? matches
    : matches.filter(m => m.sport === activeSportFilter);

  const handlePickOdd = (match, pick, value) => {
    playTapSound();
    triggerHaptic('light');
    setSelectedOdd({ match, pick, value });
  };

  const handlePlaceBet = async () => {
    if (!selectedOdd) return;
    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    playTapSound();
    triggerHaptic('heavy');

    try {
      await executeBet({
        betAmount,
        gameType: 'sport',
        multiplier: selectedOdd.value,
        targetPreference: `${selectedOdd.match.id}_${selectedOdd.pick}`,
      });

      playMultiplierDing(selectedOdd.value);
      triggerNotificationHaptic('success');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(`Wager of $${betAmount} placed on ${selectedOdd.match.home} vs ${selectedOdd.match.away} (Odds: ${selectedOdd.value.toFixed(2)})! Potential win: $${(betAmount * selectedOdd.value).toFixed(2)}.`);
      setSelectedOdd(null);
      refreshProfile();
    } catch (err) {
      alert(err.message || 'Bet placement failed');
    }
  };

  return (
    <div className="w-full space-y-4 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow-gold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-white">Sportsbook & Live Matches</h1>
            <span className="text-[10px] text-gray-400 font-semibold">Real-Time Odds • Instant Cashout Settlements</span>
          </div>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider">
          <Radio className="w-3 h-3 animate-pulse" />
          Live Matches Active
        </span>
      </div>

      {/* Sport Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'All Sports', icon: '🏆' },
          { id: 'soccer', label: 'Football / Soccer', icon: '⚽️' },
          { id: 'basketball', label: 'NBA Basketball', icon: '🏀' },
          { id: 'esports', label: 'CS2 Esports', icon: '🎮' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playTapSound();
              setActiveSportFilter(tab.id);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSportFilter === tab.id
                ? 'bg-raika-blue text-white shadow'
                : 'bg-raika-surface/80 hover:bg-raika-hover border border-white/5 text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMatches.map((m) => (
          <div
            key={m.id}
            className="bg-raika-card hover:bg-raika-surface border border-raika-border/70 rounded-3xl p-4 space-y-3 shadow-lg transition"
          >
            {/* League & Time */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1 border-b border-white/5">
              <span className="font-bold text-gray-300">{m.league}</span>
              <span className={`font-mono font-bold flex items-center gap-1 ${m.isLive ? 'text-rose-400' : 'text-gray-400'}`}>
                {m.isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                {m.time}
              </span>
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-between text-sm font-black text-white">
              <div className="flex-1 truncate">{m.home}</div>
              <div className="px-3 py-1 bg-raika-surface/80 rounded-xl font-mono text-emerald-400 font-black border border-white/5">
                {m.score}
              </div>
              <div className="flex-1 text-right truncate">{m.away}</div>
            </div>

            {/* Odds Buttons */}
            <div className={`grid gap-2 ${m.odds.draw ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <button
                onClick={() => handlePickOdd(m, '1', m.odds.home)}
                className={`py-2 rounded-2xl border text-xs font-mono font-bold flex flex-col items-center justify-center transition active:scale-95 ${
                  selectedOdd?.match.id === m.id && selectedOdd?.pick === '1'
                    ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-glow-green'
                    : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-hover'
                }`}
              >
                <span className="text-[10px] opacity-75">1 (Home)</span>
                <span className="font-black text-sm">{m.odds.home.toFixed(2)}</span>
              </button>

              {m.odds.draw && (
                <button
                  onClick={() => handlePickOdd(m, 'X', m.odds.draw)}
                  className={`py-2 rounded-2xl border text-xs font-mono font-bold flex flex-col items-center justify-center transition active:scale-95 ${
                    selectedOdd?.match.id === m.id && selectedOdd?.pick === 'X'
                      ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-glow-green'
                      : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-hover'
                  }`}
                >
                  <span className="text-[10px] opacity-75">X (Draw)</span>
                  <span className="font-black text-sm">{m.odds.draw.toFixed(2)}</span>
                </button>
              )}

              <button
                onClick={() => handlePickOdd(m, '2', m.odds.away)}
                className={`py-2 rounded-2xl border text-xs font-mono font-bold flex flex-col items-center justify-center transition active:scale-95 ${
                  selectedOdd?.match.id === m.id && selectedOdd?.pick === '2'
                    ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-glow-green'
                    : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-hover'
                }`}
              >
                <span className="text-[10px] opacity-75">2 (Away)</span>
                <span className="font-black text-sm">{m.odds.away.toFixed(2)}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Betting Slip Drawer when an odd is picked */}
      {selectedOdd && (
        <div className="fixed bottom-16 lg:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto p-4 bg-raika-card border border-raika-blue/50 rounded-3xl shadow-2xl space-y-3 animate-scaleIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-black text-white">
                Bet Slip: {selectedOdd.match.home} vs {selectedOdd.match.away}
              </div>
            </div>
            <button
              onClick={() => setSelectedOdd(null)}
              className="w-6 h-6 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-semibold">
              Selected Pick: <strong>#{selectedOdd.pick}</strong> (Odds: <strong className="text-emerald-400 font-mono">{selectedOdd.value.toFixed(2)}</strong>)
            </span>
            <span className="text-gray-400">
              Potential Payout: <strong className="text-cyan-300 font-mono font-black">${(betAmount * selectedOdd.value).toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[5, 10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-black border transition ${
                    betAmount === amt
                      ? 'bg-raika-blue text-white border-raika-blue'
                      : 'bg-raika-surface text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              onClick={handlePlaceBet}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-green active:scale-95 transition"
            >
              Place Wager (${betAmount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
