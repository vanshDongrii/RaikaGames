import React from 'react';
import GameCard from './GameCard';

export const ALL_GAMES = [
  {
    id: 'chicken_shoot',
    title: 'Chicken Shoot',
    provider: 'Raika Originals',
    category: 'originals',
    rtp: '96.50%',
    maxMult: '100x',
    badge: 'HOT',
    icon: '🐔',
    gradient: 'from-emerald-900 to-green-950',
  },
  {
    id: 'turbo_crash',
    title: 'Turbo Crash',
    provider: 'Raika Originals',
    category: 'originals',
    rtp: '97.00%',
    maxMult: '10,000x',
    badge: 'ORIGINAL',
    icon: '🚀',
    gradient: 'from-cyan-900 to-blue-950',
  },
  {
    id: 'plinko',
    title: 'Plinko Royale',
    provider: 'Raika Originals',
    category: 'originals',
    rtp: '98.00%',
    maxMult: '1,000x',
    badge: 'TOP',
    icon: '🪙',
    gradient: 'from-amber-900 to-yellow-950',
  },
  {
    id: 'mines',
    title: 'Raika Mines',
    provider: 'Raika Originals',
    category: 'originals',
    rtp: '97.20%',
    maxMult: '4,900x',
    badge: 'POPULAR',
    icon: '💣',
    gradient: 'from-purple-900 to-violet-950',
  },
  {
    id: 'gates_olympus',
    title: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    category: 'slots',
    rtp: '96.50%',
    maxMult: '5,000x',
    badge: 'HOT',
    icon: '⚡️',
    gradient: 'from-indigo-900 to-blue-950',
  },
  {
    id: 'sweet_bonanza',
    title: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    category: 'slots',
    rtp: '96.48%',
    maxMult: '21,100x',
    icon: '🍭',
    gradient: 'from-pink-900 to-rose-950',
  },
  {
    id: 'sugar_rush',
    title: 'Sugar Rush 1000',
    provider: 'Pragmatic Play',
    category: 'slots',
    rtp: '96.53%',
    maxMult: '25,000x',
    badge: 'NEW',
    icon: '🍬',
    gradient: 'from-fuchsia-900 to-pink-950',
  },
  {
    id: 'chaos_crew',
    title: 'Chaos Crew 2',
    provider: 'Hacksaw',
    category: 'slots',
    rtp: '96.27%',
    maxMult: '20,000x',
    icon: '💀',
    gradient: 'from-gray-900 to-zinc-950',
  },
  {
    id: 'wanted_dead',
    title: 'Wanted Dead or a Wild',
    provider: 'Hacksaw',
    category: 'slots',
    rtp: '96.38%',
    maxMult: '12,500x',
    badge: 'HOT',
    icon: '🤠',
    gradient: 'from-amber-950 to-orange-950',
  },
  {
    id: 'mental',
    title: 'Mental x999',
    provider: 'Nolimit City',
    category: 'slots',
    rtp: '96.08%',
    maxMult: '66,666x',
    icon: '🧠',
    gradient: 'from-red-950 to-zinc-950',
  },
  {
    id: 'aviator',
    title: 'Aviator',
    provider: 'Spribe',
    category: 'originals',
    rtp: '97.00%',
    maxMult: '100x',
    icon: '✈️',
    gradient: 'from-red-900 to-rose-950',
  },
  {
    id: 'roulette_vip',
    title: 'Lightning Roulette',
    provider: 'InOut',
    category: 'live',
    rtp: '97.30%',
    maxMult: '500x',
    badge: 'LIVE',
    icon: '🎡',
    gradient: 'from-emerald-950 to-teal-950',
  },
  {
    id: 'blackjack_pro',
    title: 'Speed Blackjack',
    provider: 'InOut',
    category: 'live',
    rtp: '99.28%',
    maxMult: '3:2',
    badge: 'LIVE',
    icon: '🃏',
    gradient: 'from-blue-950 to-cyan-950',
  },
  {
    id: 'lucky_wheel_mini',
    title: 'Fortune Wheel',
    provider: 'Raika Originals',
    category: 'originals',
    rtp: '96.80%',
    maxMult: '250x',
    icon: '🎪',
    gradient: 'from-violet-950 to-purple-950',
  },
];

export default function GameGrid({ categoryFilter, searchQuery, providerFilter }) {
  // Filter logic
  const filtered = ALL_GAMES.filter((game) => {
    // 1. Category
    if (categoryFilter && categoryFilter !== 'all') {
      if (categoryFilter === 'promos') return game.badge === 'HOT' || game.badge === 'NEW';
      if (categoryFilter === 'sport') return false; // Sport has dedicated tab
      if (game.category !== categoryFilter) return false;
    }

    // 2. Provider
    if (providerFilter && providerFilter !== 'all') {
      if (game.provider !== providerFilter) return false;
    }

    // 3. Search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchProvider = game.provider.toLowerCase().includes(q);
      if (!matchTitle && !matchProvider) return false;
    }

    return true;
  });

  return (
    <div className="space-y-3 select-none pb-12">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <span>🎮 Available Games</span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {filtered.length}
          </span>
        </h3>
        <span className="text-[11px] text-gray-400 font-medium">Sorted by Popularity</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-raika-surface/40 rounded-2xl border border-white/5 p-6">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm font-bold text-gray-300">No matching games found</p>
          <p className="text-xs text-gray-500 mt-1">Try another search keyword or reset provider filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
