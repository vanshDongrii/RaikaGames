import React from 'react';
import { Star, Play, Flame } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function GameCard({ game }) {
  const { setActiveTab, setActiveGameId, favorites, toggleFavorite } = useGame();
  const isFavorite = favorites.includes(game.id);

  const handlePlay = () => {
    playTapSound();
    triggerHaptic('medium');
    setActiveGameId(game.id);
    setActiveTab('game');
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    playTapSound();
    triggerHaptic('light');
    toggleFavorite(game.id);
  };

  return (
    <div
      onClick={handlePlay}
      className="group relative rounded-2xl bg-raika-card border border-raika-border/70 hover:border-emerald-500/40 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md select-none flex flex-col justify-between"
    >
      {/* Thumbnail Container */}
      <div className={`relative w-full aspect-[4/3] bg-gradient-to-br ${game.gradient || 'from-gray-800 to-gray-900'} p-3 flex flex-col justify-between overflow-hidden`}>
        {/* Decorative Graphic / Icon */}
        <div className="absolute right-1 -bottom-2 text-6xl opacity-30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 pointer-events-none">
          {game.icon || '🎰'}
        </div>

        {/* Top Badges: Favorite Star & Provider/Hot Tag */}
        <div className="flex items-center justify-between z-10">
          {game.badge ? (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
              game.badge === 'HOT'
                ? 'bg-rose-500 text-white'
                : game.badge === 'ORIGINAL'
                ? 'bg-emerald-500 text-black'
                : 'bg-cyan-500 text-black'
            }`}>
              {game.badge}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 font-semibold">{game.provider}</span>
          )}

          <button
            onClick={handleFavorite}
            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-amber-400 transition"
            title="Toggle Favorite"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-20">
          <div className="w-11 h-11 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-glow-green scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* RTP Badge at bottom of art */}
        <div className="z-10 flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-emerald-400 backdrop-blur-sm border border-white/5">
            RTP {game.rtp}
          </span>
          {game.maxMult && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {game.maxMult}
            </span>
          )}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-2.5 bg-raika-surface/40 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate max-w-[120px]">
            {game.title}
          </h3>
          <span className="text-[10px] text-gray-400 block font-medium">
            {game.provider}
          </span>
        </div>
        <div className="w-6 h-6 rounded-lg bg-raika-hover group-hover:bg-emerald-500 group-hover:text-black flex items-center justify-center text-gray-400 transition">
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </div>
      </div>
    </div>
  );
}
