import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Flame, ShieldAlert, ChevronRight, ChevronLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function HeroCarousel() {
  const { setActiveTab, setActiveGameId } = useGame();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'chicken_shoot',
      title: 'CHICKEN SHOOT',
      subtitle: 'Raika Original Arcade',
      description: 'Lock, load and blast target birds for up to 100x instant multipliers!',
      badge: 'HOT ORIGINAL',
      rtp: '96.50%',
      gradient: 'from-emerald-900/80 via-emerald-950/60 to-raika-card',
      accentColor: 'border-emerald-500/30 text-emerald-400',
      btnColor: 'from-emerald-500 to-emerald-400 text-black shadow-glow-green',
      icon: '🐔',
      online: '3,420 Active',
    },
    {
      id: 'turbo_crash',
      title: 'TURBO CRASH',
      subtitle: 'High Multiplier Flight',
      description: 'Cash out before the cyber jet detonates! Multipliers scaling past 1,000x.',
      badge: 'TOP MULTIPLIER',
      rtp: '97.00%',
      gradient: 'from-cyan-900/80 via-blue-950/60 to-raika-card',
      accentColor: 'border-cyan-500/30 text-cyan-400',
      btnColor: 'from-cyan-500 to-blue-500 text-black shadow-glow-cyan',
      icon: '🚀',
      online: '2,180 Active',
    },
    {
      id: 'plinko',
      title: 'PLINKO ROYALE',
      subtitle: 'Infinite Drop Arcade',
      description: '16 rows of high stakes pins. Hit the outer golden bins for 1,000x payout!',
      badge: 'COMMUNITY FAVORITE',
      rtp: '98.00%',
      gradient: 'from-amber-900/80 via-amber-950/60 to-raika-card',
      accentColor: 'border-amber-500/30 text-amber-400',
      btnColor: 'from-amber-500 to-amber-400 text-black shadow-glow-gold',
      icon: '🪙',
      online: '1,890 Active',
    },
    {
      id: 'mines',
      title: 'RAIKA MINES',
      subtitle: 'Provably Fair Grid',
      description: 'Choose your mine density and uncover diamonds. Cash out anytime!',
      badge: 'EXCLUSIVE',
      rtp: '97.20%',
      gradient: 'from-purple-900/80 via-purple-950/60 to-raika-card',
      accentColor: 'border-purple-500/30 text-purple-400',
      btnColor: 'from-purple-500 to-indigo-500 text-white shadow-glow-ruby',
      icon: '💣',
      online: '1,240 Active',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePlay = (gameId) => {
    playTapSound();
    triggerHaptic('medium');
    setActiveGameId(gameId);
    setActiveTab('game');
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden select-none mb-4">
      {/* Slide Container */}
      <div
        className={`relative rounded-3xl p-5 border bg-gradient-to-br ${slide.gradient} ${slide.accentColor} transition-all duration-500 shadow-2xl min-h-[190px] flex flex-col justify-between`}
      >
        {/* Background glow decoration */}
        <div className="absolute -right-6 -bottom-6 text-8xl opacity-20 pointer-events-none filter blur-[1px]">
          {slide.icon}
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/10 backdrop-blur-md uppercase text-white border border-white/10 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {slide.badge}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/40 text-emerald-400 border border-white/5">
              RTP {slide.rtp}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {slide.online}
          </span>
        </div>

        {/* Middle Content */}
        <div className="my-2 z-10 max-w-[260px]">
          <h2 className="text-2xl font-black tracking-tight text-white font-display leading-tight">
            {slide.title}
          </h2>
          <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Bottom Action Row */}
        <div className="flex items-center justify-between z-10 pt-1">
          <button
            id={`hero-play-btn-${slide.id}`}
            onClick={() => handlePlay(slide.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r ${slide.btnColor} flex items-center gap-2 transition active:scale-95`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Play Now
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playTapSound();
                  setCurrentSlide(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
