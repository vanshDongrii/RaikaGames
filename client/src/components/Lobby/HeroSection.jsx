import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, ArrowRight, Sparkles, Gift, Trophy, Radio, Users } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function HeroSection({ onOpenBonuses, onOpenInvite, onSelectCategory }) {
  const { setActiveTab, setActiveGameId } = useGame();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'slide_flagship',
      tagline: 'Flagship platform',
      title: 'RAIKA',
      subtitle: 'Play without limits. Choose the best.',
      btnText: 'Play',
      btnAction: () => {
        playTapSound();
        triggerHaptic('medium');
        setActiveGameId('chicken_shoot');
        setActiveTab('game');
      },
      stats: [
        { label: 'games', val: '1000+' },
        { label: 'support', val: '24/7' },
        { label: 'every day', val: 'Bonuses' },
      ],
      showCatFace: true,
      bgGradient: 'from-[#0d3478] via-[#092252] to-[#0a152d]',
    },
    {
      id: 'slide_slots',
      tagline: '',
      title: 'Best slots',
      subtitle: 'Big selections, quick launch and favorite providers',
      btnText: 'All games',
      btnAction: () => {
        playTapSound();
        triggerHaptic('light');
        onSelectCategory('slots');
      },
      showSlotMascot: true,
      bgGradient: 'from-[#0b3887] via-[#0a2760] to-[#081735]',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    playTapSound();
    triggerHaptic('light');
    setCurrentSlide(s => (s + 1) % slides.length);
  };

  const prevSlide = () => {
    playTapSound();
    triggerHaptic('light');
    setCurrentSlide(s => (s - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4 select-none">
      {/* Left Area: Hero Banner (7 cols on desktop) */}
      <div className="lg:col-span-7 xl:col-span-8 relative rounded-3xl overflow-hidden p-6 sm:p-7 bg-gradient-to-br border border-blue-500/30 shadow-2xl flex flex-col justify-between min-h-[220px] sm:min-h-[240px]"
        style={{
          background: 'linear-gradient(135deg, #093278 0%, #061c47 50%, #081226 100%)',
        }}
      >
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Slide Content */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="max-w-md space-y-2">
            {slide.tagline && (
              <span className="text-xs font-bold text-blue-200 tracking-wide block">
                {slide.tagline}
              </span>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
                {slide.title}
              </h1>
              {slide.showCatFace && (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400 shadow-glow-gold bg-amber-500/20">
                  <img src="/assets/raika_mascot.jpg" alt="Raika Cat" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-200/90 font-medium max-w-xs sm:max-w-sm leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Primary Action Button */}
            <div className="pt-3">
              <button
                onClick={slide.btnAction}
                className="px-6 py-2.5 rounded-full bg-raika-blue hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition active:scale-95 group"
              >
                <span>{slide.btnText}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right side of banner: Stats pills or Mascot */}
          {slide.stats && (
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              {slide.stats.map((st, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-right min-w-[100px]"
                >
                  <span className="text-sm font-black text-white block font-mono">{st.val}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{st.label}</span>
                </div>
              ))}
            </div>
          )}

          {slide.showSlotMascot && (
            <div className="hidden sm:flex shrink-0 items-center justify-center pr-4">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-blue-400/40 shadow-glow-cyan">
                <img src="/assets/raika_mascot.jpg" alt="Raika Slots" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Arrows */}
        <div className="relative z-10 flex items-center gap-2 pt-4">
          <button
            onClick={prevSlide}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition active:scale-90"
            title="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition active:scale-90"
            title="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Area: 4 Promotional Cards (2x2 grid, 5 cols on desktop) */}
      <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-2 gap-2.5">
        {/* 1. Bonuses Card */}
        <div
          onClick={onOpenBonuses}
          className="group relative rounded-2xl p-3 bg-raika-card hover:bg-raika-surface border border-raika-border/70 hover:border-purple-500/40 cursor-pointer transition shadow-lg flex flex-col justify-between overflow-hidden active:scale-95"
        >
          <div className="z-10">
            <h3 className="text-sm font-extrabold text-white group-hover:text-purple-300 transition">
              Bonuses
            </h3>
            <span className="text-[11px] text-gray-400 block font-medium">Daily gifts</span>
          </div>
          <div className="flex justify-end mt-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/assets/raika_bonuses.jpg"
                alt="Bonuses Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '🎁';
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. Sport Card */}
        <div
          onClick={() => {
            playTapSound();
            triggerHaptic('light');
            setActiveTab('sport');
          }}
          className="group relative rounded-2xl p-3 bg-raika-card hover:bg-raika-surface border border-raika-border/70 hover:border-blue-500/40 cursor-pointer transition shadow-lg flex flex-col justify-between overflow-hidden active:scale-95"
        >
          <div className="z-10">
            <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition">
              Sport
            </h3>
            <span className="text-[11px] text-gray-400 block font-medium">Live matches</span>
          </div>
          <div className="flex justify-end mt-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/assets/raika_sport.jpg"
                alt="Sport Mascot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '⚽️';
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Live Games Card */}
        <div
          onClick={() => {
            playTapSound();
            triggerHaptic('light');
            onSelectCategory('live');
          }}
          className="group relative rounded-2xl p-3 bg-raika-card hover:bg-raika-surface border border-raika-border/70 hover:border-pink-500/40 cursor-pointer transition shadow-lg flex flex-col justify-between overflow-hidden active:scale-95"
        >
          <div className="z-10">
            <h3 className="text-sm font-extrabold text-white group-hover:text-pink-300 transition flex items-center gap-1.5">
              <span>Live Games</span>
              <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded uppercase animate-pulse">
                Live
              </span>
            </h3>
            <span className="text-[11px] text-gray-400 block font-medium">Play with dealers</span>
          </div>
          <div className="flex justify-end mt-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-glow-ruby">
              📺
            </div>
          </div>
        </div>

        {/* 4. Invite Friends Card */}
        <div
          onClick={onOpenInvite}
          className="group relative rounded-2xl p-3 bg-raika-card hover:bg-raika-surface border border-raika-border/70 hover:border-amber-500/40 cursor-pointer transition shadow-lg flex flex-col justify-between overflow-hidden active:scale-95"
        >
          <div className="z-10">
            <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition">
              Invite friends
            </h3>
            <span className="text-[11px] text-gray-400 block font-medium">Earn rewards</span>
          </div>
          <div className="flex justify-end mt-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-glow-gold">
              🐾
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
