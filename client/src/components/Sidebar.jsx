import React from 'react';
import {
  Home, Building2, Dices, Gem, Zap, Trophy, Radio,
  Flame, Star, Sparkles, Award, ShoppingBag, Layers,
  Maximize2, X, ChevronRight, CreditCard, ArrowDownToLine,
  Volume2, VolumeX, ShieldCheck, HelpCircle, FileText, Lock, MessageCircle
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { playTapSound, toggleSound, isSoundEnabled } from '../utils/audio';
import { triggerHaptic, tg } from '../utils/telegram';

export default function Sidebar({
  isOpen,
  onClose,
  activeFilter,
  onSelectFilter,
  selectedCategory,
  onSelectCategory,
  onOpenInfoModal,
}) {
  const { setActiveTab, activeTab, userProfile, openModal, favorites } = useGame();
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleNav = (type, value) => {
    playTapSound();
    triggerHaptic('light');

    if (type === 'tab') {
      setActiveTab(value);
      if (onClose) onClose();
    } else if (type === 'category') {
      setActiveTab('lobby');
      onSelectCategory(value);
      onSelectFilter('all');
      if (onClose) onClose();
    } else if (type === 'discovery') {
      setActiveTab('lobby');
      onSelectFilter(value);
      if (onClose) onClose();
    }
  };

  const handleFullscreen = () => {
    playTapSound();
    triggerHaptic('light');
    if (tg?.expand) tg.expand();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleToggleSound = () => {
    const s = toggleSound();
    setSoundOn(s);
  };

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home, type: 'category', value: 'all' },
    { id: 'casino', label: 'Casino', icon: Building2, type: 'category', value: 'all' },
    { id: 'slots', label: 'Slots', icon: Dices, type: 'category', value: 'slots' },
    { id: 'originals', label: 'Originals', icon: Gem, type: 'category', value: 'originals' },
    { id: 'quick', label: 'Quick games', icon: Zap, type: 'category', value: 'quick' },
    { id: 'sport', label: 'Sport', icon: Trophy, type: 'tab', value: 'sport' },
    { id: 'live', label: 'Live', icon: Radio, type: 'category', value: 'live' },
  ];

  const discoveryNav = [
    { id: 'popular', label: 'Popular', icon: Flame, type: 'discovery', value: 'popular' },
    { id: 'favorites', label: 'Favorite games', icon: Star, type: 'discovery', value: 'favorites', count: favorites.length },
    { id: 'new', label: 'New games', icon: Sparkles, type: 'discovery', value: 'new' },
    { id: 'recommended', label: 'Recommended', icon: Award, type: 'discovery', value: 'recommended' },
    { id: 'bonus_buy', label: 'Bonus Buy', icon: ShoppingBag, type: 'discovery', value: 'bonus_buy' },
    { id: 'le_series', label: 'Le Series', icon: Layers, type: 'discovery', value: 'le_series' },
  ];

  const liveCasinoNav = [
    { id: 'live_all', label: 'Live games', icon: Radio, type: 'category', value: 'live' },
    { id: 'live_blackjack', label: 'Blackjack', icon: Dices, type: 'discovery', value: 'blackjack' },
    { id: 'live_roulette', label: 'Roulette', icon: Sparkles, type: 'discovery', value: 'roulette' },
    { id: 'live_baccarat', label: 'Baccarat', icon: Gem, type: 'discovery', value: 'baccarat' },
  ];

  const navigationList = (
    <div className="space-y-4 overflow-y-auto px-3 flex-1 no-scrollbar">
      {/* Top Toggle Tabs (Casino / Sport) inside sidebar */}
      <div className="flex items-center bg-raika-surface/90 p-1 rounded-xl border border-white/5 mb-2">
        <button
          onClick={() => handleNav('category', 'all')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
            activeTab !== 'sport' ? 'bg-raika-blue text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Casino
        </button>
        <button
          onClick={() => handleNav('tab', 'sport')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
            activeTab === 'sport' ? 'bg-raika-blue text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Sport
        </button>
      </div>

      {/* Wallet & Cashier Card */}
      <div className="bg-raika-surface/60 p-2.5 rounded-2xl border border-white/5 space-y-2 mb-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            WALLET & CASHIER
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400">
            ${Number(userProfile?.balance || 0).toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('light');
              openModal('deposit');
              if (onClose) onClose();
            }}
            className="py-2 px-2 rounded-xl bg-raika-blue hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('light');
              openModal('withdraw');
              if (onClose) onClose();
            }}
            className="py-2 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Section */}
      <div>
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-1.5">
          MAIN
        </div>
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = (item.type === 'category' && selectedCategory === item.value && activeFilter === 'all' && activeTab === 'lobby') ||
              (item.type === 'tab' && activeTab === item.value);

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.type, item.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-raika-surface text-raika-blue font-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-raika-surface/60 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-raika-blue' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'casino' && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Games Section */}
      <div>
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-1.5">
          GAMES
        </div>
        <div className="space-y-0.5">
          {discoveryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.value;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.type, item.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-raika-surface text-raika-blue font-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-raika-surface/60 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-raika-blue' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] bg-raika-surface px-1.5 py-0.2 rounded-md font-mono text-amber-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Casino Section */}
      <div>
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-1.5">
          LIVE CASINO
        </div>
        <div className="space-y-0.5">
          {liveCasinoNav.map((item) => {
            const Icon = item.icon;
            const isActive = (item.type === 'category' && selectedCategory === item.value) || activeFilter === item.value;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.type, item.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-raika-surface text-raika-blue font-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-raika-surface/60 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-raika-blue' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info Links */}
      <div className="pt-2 border-t border-raika-border/40 space-y-1">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-1">
          PLATFORM & HELP
        </div>
        <button
          onClick={() => {
            playTapSound();
            if (onOpenInfoModal) onOpenInfoModal('about');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-raika-surface/50 text-[11px]"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Platform Info</span>
        </button>
        <button
          onClick={() => {
            playTapSound();
            if (onOpenInfoModal) onOpenInfoModal('terms');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-raika-surface/50 text-[11px]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Use</span>
        </button>
        <button
          onClick={() => {
            playTapSound();
            if (onOpenInfoModal) onOpenInfoModal('privacy');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-raika-surface/50 text-[11px]"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy & Fairness</span>
        </button>
        <a
          href="https://t.me/raika"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-[11px] font-bold"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Telegram Community</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-12 bottom-0 left-0 z-30 w-60 bg-raika-dark border-r border-raika-border/70 overflow-hidden py-3 select-none text-xs">
        {navigationList}

        {/* Bottom Bar: Fullscreen / Live Casino */}
        <div className="px-3 pt-3 border-t border-raika-border/50">
          <button
            onClick={handleFullscreen}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-raika-surface/40 hover:bg-raika-surface text-gray-400 hover:text-white transition"
          >
            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-wider">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>LIVE CASINO</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex select-none animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Panel */}
          <div className="relative w-72 max-w-xs bg-raika-card border-r border-raika-border h-full shadow-2xl flex flex-col z-10 text-xs">
            {/* Mobile Header with User info */}
            <div className="p-3.5 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
              <div className="flex items-center gap-2.5">
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border border-emerald-500/40 object-cover"
                />
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>@{userProfile.username}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold">
                      {userProfile.vip?.tier}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Balance: ${Number(userProfile.balance || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions (Deposit / Withdraw) */}
            <div className="p-3 grid grid-cols-2 gap-2 border-b border-raika-border/40">
              <button
                onClick={() => {
                  onClose();
                  openModal('deposit');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-raika-blue hover:bg-blue-600 text-white font-extrabold text-xs shadow transition active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Deposit
              </button>
              <button
                onClick={() => {
                  onClose();
                  openModal('withdraw');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/10 text-white font-bold text-xs transition active:scale-95"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-cyan-400" />
                Withdraw
              </button>
            </div>

            {navigationList}

            {/* Mobile Footer */}
            <div className="p-3 border-t border-raika-border/60 bg-raika-surface/30 flex items-center justify-between">
              <button
                onClick={handleToggleSound}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white"
              >
                {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                <span className="text-[11px] font-bold">Sound</span>
              </button>
              <button
                onClick={handleFullscreen}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
