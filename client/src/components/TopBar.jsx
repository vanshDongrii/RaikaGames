import React from 'react';
import { X, Plus, Wallet, ShieldCheck, ChevronDown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { closeTelegramApp, triggerHaptic } from '../utils/telegram';
import { playTapSound } from '../utils/audio';

export default function TopBar() {
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

  const handleTopUp = (e) => {
    e.stopPropagation();
    playTapSound();
    triggerHaptic('medium');
    openModal('deposit');
  };

  const handleProfileClick = () => {
    playTapSound();
    triggerHaptic('light');
    openModal('profile');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2.5 bg-raika-dark/90 backdrop-blur-md border-b border-raika-border/60 flex items-center justify-between select-none">
      {/* Left: Close / Back Button */}
      <button
        id="topbar-close-btn"
        onClick={handleClose}
        className="w-9 h-9 rounded-xl bg-raika-surface/80 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-raika-hover transition active:scale-95"
        title="Close or Return"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Center: Balance Capsule with Real/Demo toggle and Quick Deposit (+) */}
      <div className="flex items-center gap-1.5">
        <div
          onClick={() => {
            playTapSound();
            triggerHaptic('light');
            setIsDemo(!isDemo);
          }}
          className="flex items-center bg-raika-surface/90 hover:bg-raika-hover border border-white/10 rounded-xl px-2.5 py-1.5 cursor-pointer transition shadow-inner group"
          title="Click to toggle Real / Demo balance"
        >
          <div className="flex flex-col text-right mr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider leading-none flex items-center justify-end gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
              <span className={isDemo ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {isDemo ? 'DEMO' : 'REAL'}
              </span>
            </span>
            <span className="text-sm font-extrabold text-white font-mono tracking-tight group-hover:text-emerald-300 transition">
              ${Number(currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Quick Top-up (+) Button */}
          <button
            id="topbar-deposit-btn"
            onClick={handleTopUp}
            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-glow-green transition active:scale-90 font-black"
            title="Deposit Funds"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Right: User Profile Avatar with VIP Level Badge */}
      <button
        id="topbar-profile-btn"
        onClick={handleProfileClick}
        className="flex items-center gap-2 group active:scale-95 transition"
      >
        <div className="relative">
          <img
            src={userProfile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=raika_vip'}
            alt="User avatar"
            className="w-9 h-9 rounded-xl border border-emerald-500/40 object-cover bg-raika-surface p-0.5 shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-amber-500 to-amber-600 rounded text-[9px] font-black text-black uppercase tracking-tighter leading-none shadow">
            {userProfile.vip?.tier?.split(' ')[0] || 'VIP'}
          </div>
        </div>
      </button>
    </header>
  );
}
