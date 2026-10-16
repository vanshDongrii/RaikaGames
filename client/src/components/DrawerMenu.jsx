import React from 'react';
import {
  X, Home, Flame, Star, Sparkles, Dices, Trophy,
  CircleDollarSign, ShieldCheck, Gift, Volume2, VolumeX,
  CreditCard, ArrowDownToLine, User, ShoppingBag, Radio
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { toggleSound, isSoundEnabled, playTapSound } from '../utils/audio';
import { triggerHaptic } from '../utils/telegram';

export default function DrawerMenu() {
  const {
    drawerOpen,
    setDrawerOpen,
    setActiveTab,
    setActiveGameId,
    openModal,
    userProfile,
  } = useGame();

  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  if (!drawerOpen) return null;

  const handleNav = (tab, gameId = null) => {
    playTapSound();
    triggerHaptic('light');
    setDrawerOpen(false);
    if (gameId) {
      setActiveGameId(gameId);
      setActiveTab('game');
    } else {
      setActiveTab(tab);
    }
  };

  const handleAction = (modalName) => {
    playTapSound();
    triggerHaptic('light');
    setDrawerOpen(false);
    openModal(modalName);
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
    triggerHaptic('light');
  };

  return (
    <div className="fixed inset-0 z-50 flex select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-raika-card border-r border-raika-border h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-3">
            <img
              src={userProfile.avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-xl border border-emerald-500/30 object-cover"
            />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>@{userProfile.username}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {userProfile.vip?.tier}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Wagered: ${userProfile.totalWagered?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Wallet Actions */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-raika-border/40">
          <button
            onClick={() => handleAction('deposit')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs shadow-glow-green transition active:scale-95"
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            Deposit
          </button>
          <button
            onClick={() => handleAction('withdraw')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/10 text-white font-bold text-xs transition active:scale-95"
          >
            <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
            Withdraw
          </button>
        </div>

        {/* Navigation Deep Links */}
        <div className="p-3 space-y-1 flex-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
            Casino & Games
          </div>

          <button
            onClick={() => handleNav('lobby')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Home Lobby</span>
          </button>

          <button
            onClick={() => handleNav('game', 'chicken_shoot')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold transition"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Chicken Shoot</span>
            </div>
            <span className="text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.5 rounded uppercase">Hot</span>
          </button>

          <button
            onClick={() => handleNav('lobby')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Raika Originals</span>
          </button>

          <button
            onClick={() => handleNav('lobby')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <Dices className="w-4 h-4 text-purple-400" />
            <span>Slots & Jackpots</span>
          </button>

          <button
            onClick={() => handleNav('sport')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Sportsbook & Live</span>
          </button>

          <button
            onClick={() => handleNav('lobby')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <ShoppingBag className="w-4 h-4 text-rose-400" />
            <span>Bonus Buy</span>
          </button>

          <div className="pt-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
            Rewards & Profile
          </div>

          <button
            onClick={() => handleAction('bonuses')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <Gift className="w-4 h-4 text-pink-400" />
            <span>Daily Giveaway & Bonuses</span>
          </button>

          <button
            onClick={() => handleNav('wheel')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <CircleDollarSign className="w-4 h-4 text-yellow-400" />
            <span>Lucky Wheel Spin</span>
          </button>

          <button
            onClick={() => handleAction('profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-raika-surface text-gray-300 hover:text-white text-sm font-semibold transition"
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>Profile & VIP Club</span>
          </button>
        </div>

        {/* Footer Settings */}
        <div className="p-4 border-t border-raika-border/60 bg-raika-surface/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Provably Fair 96.5% RTP
            </span>
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg bg-raika-surface hover:text-white transition"
              title="Toggle Audio"
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          <div className="text-[10px] text-gray-400 text-center">
            Raika Game v1.0.0 • Verified Telegram WebApp
          </div>
        </div>
      </div>
    </div>
  );
}
