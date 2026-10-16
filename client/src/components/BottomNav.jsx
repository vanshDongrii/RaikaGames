import React from 'react';
import { Menu, Gamepad2, Trophy, Disc3 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { triggerHaptic } from '../utils/telegram';
import { playTapSound } from '../utils/audio';

export default function BottomNav() {
  const { activeTab, setActiveTab, setDrawerOpen } = useGame();

  const handleTabClick = (tabId) => {
    playTapSound();
    triggerHaptic('light');

    if (tabId === 'menu') {
      setDrawerOpen(prev => !prev);
    } else {
      setActiveTab(tabId);
    }
  };

  const navItems = [
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'lobby', label: 'Games', icon: Gamepad2 },
    { id: 'sport', label: 'Sport', icon: Trophy },
    { id: 'wheel', label: 'Wheel', icon: Disc3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-raika-dark/95 backdrop-blur-lg border-t border-raika-border/70 py-1.5 px-4 pb-safe select-none">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = (item.id === 'lobby' && (activeTab === 'lobby' || activeTab === 'game')) || activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-gray-400 hover:text-gray-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : ''}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
