import React, { useEffect, useState } from 'react';
import { Users, Flame, Trophy } from 'lucide-react';
import { useGame } from '../../../context/GameContext';

export default function WinTicker() {
  const { onlinePlayers, recentWins } = useGame();
  const [tickerWins, setTickerWins] = useState([]);

  useEffect(() => {
    if (recentWins && recentWins.length > 0) {
      setTickerWins(recentWins);
    } else {
      // Default initial mock stream
      setTickerWins([
        { user: 'Player****42', multiplier: 24.0, payout: 240.00 },
        { user: 'Gamer****99', multiplier: 3.5, payout: 35.00 },
        { user: 'Sniper****07', multiplier: 48.0, payout: 480.00 },
        { user: 'Lucky****13', multiplier: 12.0, payout: 120.00 },
        { user: 'Crypto****88', multiplier: 100.0, payout: 1000.00 },
        { user: 'Hunter****21', multiplier: 2.4, payout: 24.00 },
      ]);
    }
  }, [recentWins]);

  return (
    <div className="w-full bg-raika-surface/90 border-y border-raika-border/60 py-1.5 px-3 flex items-center gap-3 overflow-hidden select-none">
      {/* Online Counter Badge */}
      <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-mono">Online: {Number(onlinePlayers || 7988).toLocaleString()}</span>
      </div>

      {/* Vertical divider */}
      <div className="h-4 w-px bg-white/10 shrink-0"></div>

      {/* Live Win Scrolling Feed */}
      <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap">
        <div className="inline-flex items-center gap-4 text-[11px] text-gray-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            Recent Hits:
          </span>
          {tickerWins.map((win, idx) => (
            <div key={idx} className="inline-flex items-center gap-1.5 bg-raika-dark/60 px-2 py-0.5 rounded-lg border border-white/5">
              <span className="text-gray-400">{win.user}</span>
              <span className="font-mono font-bold text-emerald-400">+${Number(win.payout).toFixed(2)}</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                x{Number(win.multiplier).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
