import React from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function ProvidersBar({
  searchQuery,
  onSearchChange,
  selectedProvider,
  onSelectProvider,
}) {
  const providers = [
    { id: 'all', name: 'All Providers', badge: '64' },
    { id: 'Raika Originals', name: 'Raika Originals', badge: 'NEW' },
    { id: 'Pragmatic Play', name: 'Pragmatic Play', badge: 'HOT' },
    { id: 'InOut', name: 'InOut', badge: '12' },
    { id: 'Hacksaw', name: 'Hacksaw Gaming', badge: '28' },
    { id: 'Nolimit City', name: 'Nolimit City', badge: '19' },
    { id: 'Spribe', name: 'Spribe', badge: '8' },
  ];

  const handleProviderClick = (id) => {
    playTapSound();
    triggerHaptic('light');
    onSelectProvider(id);
  };

  return (
    <div className="space-y-2.5 mb-4 select-none">
      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search games (e.g. Chicken Shoot, Slots, Mines)..."
          className="w-full bg-raika-surface/90 border border-raika-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition shadow-inner font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Providers Horizontal Row */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 px-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Providers:</span>
          </div>

          {providers.map((p) => {
            const isSelected = selectedProvider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleProviderClick(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition active:scale-95 ${
                  isSelected
                    ? 'bg-raika-surface border-cyan-500 text-cyan-300 shadow-glow-cyan'
                    : 'bg-raika-dark/60 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-raika-surface'
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-gray-500'
                }`}>
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
