import React from 'react';
import { Flame, Sparkles, Gamepad2, Trophy, Gift, Dices, Layers } from 'lucide-react';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function FilterPills({ activeFilter, onSelectFilter }) {
  const categories = [
    { id: 'all', label: 'All Games', icon: Layers },
    { id: 'originals', label: 'Originals', icon: Flame },
    { id: 'slots', label: 'Slots', icon: Dices },
    { id: 'live', label: 'Live Games', icon: Sparkles },
    { id: 'promos', label: 'Promos', icon: Gift },
    { id: 'sport', label: 'Sport', icon: Trophy },
  ];

  const handleSelect = (id) => {
    playTapSound();
    triggerHaptic('light');
    onSelectFilter(id);
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 mb-3 select-none">
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeFilter === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-glow-green font-extrabold'
                  : 'bg-raika-surface/70 hover:bg-raika-surface text-gray-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'text-gray-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
