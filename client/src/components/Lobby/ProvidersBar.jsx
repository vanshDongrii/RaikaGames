import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X, Check } from 'lucide-react';
import { PROVIDERS } from '../../data/gamesCatalog';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function ProvidersBar({
  searchQuery,
  onSearchChange,
  selectedProvider,
  onSelectProvider,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProviderClick = (providerId) => {
    playTapSound();
    triggerHaptic('light');
    onSelectProvider(providerId);
    setDropdownOpen(false);
  };

  const handleClear = () => {
    playTapSound();
    onSearchChange('');
    onSelectProvider('all');
  };

  const hasFilter = searchQuery.trim().length > 0 || selectedProvider !== 'all';

  return (
    <div className="w-full flex items-center gap-2.5 my-3 select-none">
      {/* Search Bar */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-raika-surface/90 border border-white/10 text-white placeholder-gray-400 text-xs font-semibold focus:outline-none focus:border-raika-blue/60 transition shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Providers Dropdown Pill */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            playTapSound();
            setDropdownOpen(!dropdownOpen);
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition active:scale-95 shadow-sm ${
            selectedProvider !== 'all'
              ? 'bg-raika-blue/20 border-raika-blue text-blue-300'
              : 'bg-raika-surface/90 hover:bg-raika-hover border-white/10 text-gray-300 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate max-w-[110px]">
            {selectedProvider === 'all' ? 'Providers' : selectedProvider}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu Popover */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-raika-card border border-raika-border rounded-2xl shadow-2xl p-1.5 z-40 animate-fadeIn divide-y divide-white/5">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1.5">
              Select Provider
            </div>
            <div className="space-y-0.5 max-h-56 overflow-y-auto pt-1">
              {PROVIDERS.map((p) => {
                const isSelected = selectedProvider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleProviderClick(p.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition text-left ${
                      isSelected
                        ? 'bg-raika-blue text-white'
                        : 'text-gray-300 hover:bg-raika-surface hover:text-white'
                    }`}
                  >
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clear All Filters Button */}
      {hasFilter && (
        <button
          onClick={handleClear}
          className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition active:scale-90"
          title="Clear Search & Filters"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
