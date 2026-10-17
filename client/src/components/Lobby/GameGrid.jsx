import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Star, Flame, Trophy, Layers, RotateCcw } from 'lucide-react';
import GameCard from './GameCard';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';
import { useGame } from '../../context/GameContext';

export default function GameGrid({
  categoryFilter,
  searchQuery,
  providerFilter,
  discoveryFilter,
  onSelectGame,
  onViewAllCategory,
  onResetFilters,
}) {
  const { favorites } = useGame();
  const [displayCount, setDisplayCount] = useState(24);

  const popularRowRef = useRef(null);

  const scrollRow = (direction) => {
    playTapSound();
    triggerHaptic('light');
    if (popularRowRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      popularRowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // 1. Filtered Game List
  const filteredGames = GAMES_CATALOG.filter((game) => {
    // Search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchProvider = game.provider.toLowerCase().includes(q);
      if (!matchTitle && !matchProvider) return false;
    }

    // Provider filter
    if (providerFilter && providerFilter !== 'all') {
      if (game.provider !== providerFilter) return false;
    }

    // Discovery filter (from sidebar)
    if (discoveryFilter && discoveryFilter !== 'all') {
      if (discoveryFilter === 'popular' && !game.tags.includes('popular')) return false;
      if (discoveryFilter === 'favorites' && !favorites.includes(game.id)) return false;
      if (discoveryFilter === 'new' && !game.tags.includes('new') && game.badge !== 'NEW') return false;
      if (discoveryFilter === 'recommended' && !game.tags.includes('recommended')) return false;
      if (discoveryFilter === 'bonus_buy' && !game.tags.includes('bonus_buy')) return false;
      if (discoveryFilter === 'le_series' && !game.tags.includes('le_series')) return false;
      if (discoveryFilter === 'blackjack' && !game.tags.includes('blackjack')) return false;
      if (discoveryFilter === 'roulette' && !game.tags.includes('roulette')) return false;
      if (discoveryFilter === 'baccarat' && !game.tags.includes('baccarat')) return false;
    }

    // Category filter (from horizontal pills)
    if (categoryFilter && categoryFilter !== 'all') {
      if (categoryFilter === 'popular') {
        return game.tags.includes('popular');
      }
      if (categoryFilter === 'slots' && game.category !== 'slots') return false;
      if (categoryFilter === 'live' && game.category !== 'live') return false;
      if (categoryFilter === 'quick' && game.category !== 'quick') return false;
      if (categoryFilter === 'originals' && game.category !== 'originals') return false;
    }

    return true;
  });

  const popularGames = GAMES_CATALOG.filter(g => g.tags.includes('popular'));
  const originalGames = GAMES_CATALOG.filter(g => g.category === 'originals' || g.category === 'quick');

  const isBrowsingAll = categoryFilter === 'all' && discoveryFilter === 'all' && !searchQuery && providerFilter === 'all';

  return (
    <div className="space-y-6 select-none pb-12">
      {/* If browsing default All Games, display Raika-style Popular Section first */}
      {isBrowsingAll && (
        <section className="space-y-3">
          {/* Section Header with Blue Vertical Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 bg-raika-blue rounded-full shadow-glow-cyan" />
              <h2 className="text-base sm:text-lg font-black text-white font-display tracking-tight flex items-center gap-2">
                <span>Popular</span>
              </h2>
            </div>

            {/* Navigation Controls: < > All */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollRow('left')}
                className="w-7 h-7 rounded-xl bg-raika-surface/90 hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollRow('right')}
                className="w-7 h-7 rounded-xl bg-raika-surface/90 hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewAllCategory('popular')}
                className="px-3 py-1 rounded-xl bg-raika-surface/90 hover:bg-raika-hover border border-white/5 text-xs font-bold text-gray-300 hover:text-white transition active:scale-95"
              >
                All
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Row (Matching Screenshot 1 & 2) */}
          <div
            ref={popularRowRef}
            className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {popularGames.map((game) => (
              <div key={game.id} className="w-28 sm:w-32 md:w-36 shrink-0">
                <GameCard game={game} onSelectGame={onSelectGame} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raika Originals Showcase Section when on Default All view */}
      {isBrowsingAll && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-glow-green" />
              <h2 className="text-base sm:text-lg font-black text-white font-display tracking-tight">
                Originals & Quick Games
              </h2>
            </div>
            <button
              onClick={() => onViewAllCategory('quick')}
              className="px-3 py-1 rounded-xl bg-raika-surface/90 hover:bg-raika-hover border border-white/5 text-xs font-bold text-gray-300 hover:text-white transition active:scale-95"
            >
              All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
            {originalGames.map((game) => (
              <GameCard key={game.id} game={game} onSelectGame={onSelectGame} />
            ))}
          </div>
        </section>
      )}

      {/* Main Game Catalogue Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-5 bg-raika-blue rounded-full shadow-glow-cyan" />
            <h2 className="text-base sm:text-lg font-black text-white font-display tracking-tight flex items-center gap-2">
              <span>
                {discoveryFilter !== 'all'
                  ? `${discoveryFilter.replace('_', ' ').toUpperCase()} GAMES`
                  : categoryFilter !== 'all'
                  ? `${categoryFilter.toUpperCase()} GAMES`
                  : 'All Games'}
              </span>
              <span className="text-xs font-mono font-bold text-raika-blue bg-raika-blue/10 px-2 py-0.5 rounded-full border border-raika-blue/20">
                {filteredGames.length}
              </span>
            </h2>
          </div>

          <span className="text-xs text-gray-400 font-semibold">
            {filteredGames.length} Available
          </span>
        </div>

        {/* Clean Empty State with Custom Mascot Illustration and Helper Text */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-16 bg-raika-card border border-raika-border/70 rounded-3xl p-8 shadow-xl max-w-md mx-auto my-6 animate-fadeIn">
            {/* Mascot Illustration */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-raika-blue/40 bg-raika-surface p-1 shadow-glow-cyan">
              <img
                src="/assets/raika_mascot.jpg"
                alt="Raika Mascot"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '🐱';
                }}
              />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight font-display mb-1.5">
              Nothing found
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto mb-5">
              Try changing your search or selecting another provider.
            </p>
            {onResetFilters && (
              <button
                onClick={onResetFilters}
                className="px-5 py-2.5 rounded-xl bg-raika-blue hover:bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 mx-auto shadow-lg transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Responsive Grid: 2-3 mobile, 3-5 tablet, 6-9 desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5">
              {filteredGames.slice(0, displayCount).map((game) => (
                <GameCard key={game.id} game={game} onSelectGame={onSelectGame} />
              ))}
            </div>

            {/* Load More Button */}
            {filteredGames.length > displayCount && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => {
                    playTapSound();
                    setDisplayCount(c => c + 16);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-raika-surface hover:bg-raika-hover border border-white/10 text-white font-bold text-xs tracking-wider uppercase transition active:scale-95 shadow"
                >
                  Show More Games ({filteredGames.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
