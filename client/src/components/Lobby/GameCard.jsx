import React from 'react';
import { Star, Play } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function GameCard({ game, onSelectGame }) {
  const { favorites, toggleFavorite } = useGame();
  const isFavorite = favorites.includes(game.id);

  const handleClick = () => {
    playTapSound();
    triggerHaptic('medium');
    onSelectGame(game);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    playTapSound();
    triggerHaptic('light');
    toggleFavorite(game.id);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl bg-raika-card border border-raika-border/70 hover:border-raika-blue/60 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-md select-none flex flex-col justify-between"
    >
      {/* Thumbnail Container */}
      <div
        className={`relative w-full aspect-[3/4] bg-gradient-to-br ${game.gradient || 'from-gray-800 to-gray-900'} p-2.5 flex flex-col justify-between overflow-hidden`}
      >
        {/* Ambient Glow */}
        <div
          className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-30 blur-xl pointer-events-none"
          style={{ background: game.accent || '#007aff' }}
        />

        {/* Top Badges Bar */}
        <div className="flex items-center justify-between z-10">
          {/* Verified RTP Badge */}
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-emerald-400 backdrop-blur-sm border border-white/5">
            RTP {game.rtp}
          </span>

          {/* Favorite Star Button */}
          <button
            onClick={handleFavoriteClick}
            className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-amber-400 transition"
            title="Toggle Favorite"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Center Artwork / Mascot / Graphic */}
        <div className="my-auto flex flex-col items-center justify-center z-10 py-2">
          <div className="text-5xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 drop-shadow-lg">
            {game.icon || '🎰'}
          </div>
          {game.badge && (
            <span className={`mt-2 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
              game.badge === 'HOT'
                ? 'bg-rose-600 text-white shadow-glow-ruby'
                : game.badge === 'NEW'
                ? 'bg-cyan-500 text-black shadow-glow-cyan'
                : game.badge === 'ORIGINAL'
                ? 'bg-emerald-500 text-black shadow-glow-green'
                : 'bg-raika-surface text-gray-300 border border-white/10'
            }`}>
              {game.badge}
            </span>
          )}
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-20">
          <div className="w-10 h-10 rounded-full bg-raika-blue text-white flex items-center justify-center shadow-lg scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Title on Card */}
        <div className="z-10 text-center pb-0.5">
          <h3 className="text-xs font-black text-white group-hover:text-blue-300 transition truncate px-1 drop-shadow-sm font-display tracking-tight">
            {game.title}
          </h3>
          <span className="text-[9px] text-gray-400 block font-semibold truncate">
            {game.provider}
          </span>
        </div>
      </div>
    </div>
  );
}
