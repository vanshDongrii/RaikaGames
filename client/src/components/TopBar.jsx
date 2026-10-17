import React from 'react';
import { Menu, MoreVertical, X, Sparkles, Disc3, ArrowLeft, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { closeTelegramApp, triggerHaptic } from '../utils/telegram';
import { playTapSound } from '../utils/audio';

export default function TopBar({ onToggleSidebar, onOpenSettings }) {
  const {
    userProfile,
    currentBalance,
    isDemo,
    setIsDemo,
    openModal,
    activeTab,
    setActiveTab,
  } = useGame();

  const handleClose = () => {
    playTapSound();
    triggerHaptic('light');
    if (activeTab !== 'lobby') {
      setActiveTab('lobby');
    } else {
      closeTelegramApp();
    }
  };

  const handleWheelClick = () => {
    playTapSound();
    triggerHaptic('medium');
    setActiveTab('wheel');
  };

  const handleProfileClick = () => {
    playTapSound();
    triggerHaptic('light');
    openModal('profile');
  };

  const handleDepositClick = (e) => {
    e.stopPropagation();
    playTapSound();
    triggerHaptic('medium');
    openModal('deposit');
  };

  const handleToggleDemo = () => {
    playTapSound();
    triggerHaptic('light');
    setIsDemo(!isDemo);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2 bg-raika-dark/95 backdrop-blur-md border-b border-raika-border/60 flex items-center justify-between select-none">
      {/* Left Area: Hamburger + Tabs + Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu Button */}
        <button
          id="topbar-menu-toggle"
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-xl bg-raika-surface/80 hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-95"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Casino / Sport Switcher Pills */}
        <div className="flex items-center bg-raika-surface/90 p-0.5 rounded-xl border border-white/5">
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('light');
              setActiveTab('lobby');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition ${
              activeTab !== 'sport'
                ? 'bg-raika-blue text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Casino
          </button>
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('light');
              setActiveTab('sport');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition ${
              activeTab === 'sport'
                ? 'bg-raika-blue text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sport
          </button>
        </div>

        {/* Brand / Logo */}
        <div
          onClick={() => {
            playTapSound();
            setActiveTab('lobby');
          }}
          className="flex items-center gap-2 cursor-pointer ml-1 sm:ml-2 group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/50 bg-amber-500/10 flex items-center justify-center shadow-glow-gold">
            <img
              src="/assets/raika_mascot.jpg"
              alt="Raika Mascot"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '🐱';
              }}
            />
          </div>
          <span className="text-lg font-black tracking-tight text-white font-display hidden sm:inline">
            Raika
          </span>
        </div>
      </div>

      {/* Middle: Interactive Lucky Wheel Shortcut Capsule with Reward Badge */}
      <div className="hidden md:flex items-center">
        <button
          onClick={handleWheelClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-raika-surface/90 hover:bg-raika-hover border border-white/10 hover:border-raika-blue/50 transition shadow-inner group active:scale-95"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-white text-[10px] animate-spin-slow">
            🎡
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-amber-300 transition">
            Lucky Wheel
          </span>
          <span className="text-[10px] font-black bg-amber-400 text-black px-1.5 py-0.2 rounded-full uppercase leading-none shadow-sm">
            x2
          </span>
          <span className="text-[10px] font-black bg-raika-blue text-white px-1.5 py-0.2 rounded-full leading-none shadow-sm">
            1
          </span>
        </button>
      </div>

      {/* Right Area: Balance (with Add Funds button) + Profile Avatar + Settings + Close */}
      <div className="flex items-center gap-2">
        {/* User Balance Display with Add Funds Button */}
        <div
          onClick={handleToggleDemo}
          className="flex items-center bg-raika-surface/90 hover:bg-raika-hover border border-white/10 rounded-xl px-2.5 py-1 cursor-pointer transition shadow-inner group active:scale-95"
          title="Click to toggle Real/Demo, or click (+) to Deposit"
        >
          <div className="flex flex-col text-right mr-2">
            <span className="text-[9px] uppercase font-bold tracking-wider leading-none flex items-center justify-end gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className={isDemo ? 'text-amber-400' : 'text-emerald-400'}>
                {isDemo ? 'DEMO' : 'REAL'}
              </span>
            </span>
            <span className="text-xs sm:text-sm font-mono font-black text-white group-hover:text-blue-300 transition">
              ${Number(currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Quick Add Funds (+) Button */}
          <button
            id="topbar-deposit-btn"
            onClick={handleDepositClick}
            className="px-2 py-1 rounded-lg bg-raika-blue hover:bg-blue-500 text-white flex items-center gap-1 shadow transition active:scale-90 font-bold text-xs"
            title="Add Funds / Deposit"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline font-extrabold text-[11px]">Deposit</span>
          </button>
        </div>

        {/* Telegram Profile Avatar */}
        <button
          id="topbar-profile-btn"
          onClick={handleProfileClick}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/50 hover:border-emerald-400 transition relative p-0.5 bg-raika-surface shrink-0 active:scale-95"
          title="Profile & VIP Club"
        >
          <img
            src={userProfile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=raika_vip'}
            alt="User avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </button>

        {/* Settings Button (...) */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-raika-surface/80 hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95"
          title="Settings & Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Close / Return Button */}
        <button
          id="topbar-close-btn"
          onClick={handleClose}
          className="w-9 h-9 rounded-xl bg-raika-surface/80 hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-95"
          title={activeTab !== 'lobby' ? 'Return to Lobby' : 'Close App'}
        >
          {activeTab !== 'lobby' ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
