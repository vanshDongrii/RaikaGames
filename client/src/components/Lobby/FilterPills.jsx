import React from 'react';
import { Building2, Dices, Radio, Zap, Flame } from 'lucide-react';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function FilterPills({ activeFilter, onSelectFilter }) {
  const categories = [
    { id: 'all', label: 'All games', icon: Building2 },
    { id: 'slots', label: 'Slots', icon: Dices },
    { id: 'live', label: 'Live games', icon: Radio },
    { id: 'quick', label: 'Quick games', icon: Zap },
    { id: 'popular', label: 'Popular', icon: Flame },
  ];

  const handleSelect = (id) => {
    playTapSound();
    triggerHaptic('light');
    onSelectFilter(id);
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 select-none">
      <div className="flex items-center gap-2 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeFilter === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition active:scale-95 shadow-sm ${
                isActive
                  ? 'bg-raika-blue text-white shadow-md'
                  : 'bg-raika-surface/90 hover:bg-raika-hover border border-white/5 text-gray-300 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
