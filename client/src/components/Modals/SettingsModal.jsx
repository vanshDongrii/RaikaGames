import React from 'react';
import { X, Volume2, VolumeX, Smartphone, RefreshCw, ShieldCheck, Maximize2, Moon } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { toggleSound, isSoundEnabled, playTapSound } from '../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic, tg } from '../../utils/telegram';

export default function SettingsModal({ isOpen, onClose }) {
  const { isDemo, setIsDemo, handleFaucet, refreshProfile } = useGame();
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  if (!isOpen) return null;

  const handleToggleAudio = () => {
    const next = toggleSound();
    setSoundOn(next);
    triggerHaptic('light');
  };

  const handleResetDemo = async () => {
    playTapSound();
    try {
      await handleFaucet('demo');
      triggerNotificationHaptic('success');
      alert('Demo balance replenished to $10,000.00!');
      refreshProfile();
    } catch {
      alert('Demo balance reset.');
    }
  };

  const handleFullscreen = () => {
    playTapSound();
    triggerHaptic('light');
    if (tg?.expand) {
      tg.expand();
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-raika-card border border-raika-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-base font-extrabold text-white tracking-tight">Platform Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Audio */}
          <div className="flex items-center justify-between p-3 bg-raika-surface/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-2.5 text-gray-200 font-bold">
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
              <span>Sound Effects</span>
            </div>
            <button
              onClick={handleToggleAudio}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${soundOn ? 'bg-emerald-500' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${soundOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between p-3 bg-raika-surface/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-2.5 text-gray-200 font-bold">
              <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>Current Mode</span>
            </div>
            <button
              onClick={() => {
                playTapSound();
                triggerHaptic('light');
                setIsDemo(!isDemo);
              }}
              className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-raika-hover text-white border border-white/10"
            >
              {isDemo ? 'DEMO VIRTUAL' : 'REAL WALLET'}
            </button>
          </div>

          {/* Reset Demo Balance */}
          <div className="flex items-center justify-between p-3 bg-raika-surface/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-2.5 text-gray-200 font-bold">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Reset Demo Balance</span>
            </div>
            <button
              onClick={handleResetDemo}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
            >
              Reset to $10k
            </button>
          </div>

          {/* Fullscreen */}
          <div className="flex items-center justify-between p-3 bg-raika-surface/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-2.5 text-gray-200 font-bold">
              <Maximize2 className="w-4 h-4 text-purple-400" />
              <span>Expand WebApp / Fullscreen</span>
            </div>
            <button
              onClick={handleFullscreen}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition"
            >
              Toggle
            </button>
          </div>

          {/* Info */}
          <div className="p-3 bg-raika-surface/20 rounded-xl border border-white/5 text-[11px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Platform Version:</span>
              <span className="font-mono text-gray-200">Raika v2.4 (Dark Blue)</span>
            </div>
            <div className="flex justify-between">
              <span>Telegram WebApp SDK:</span>
              <span className="font-mono text-emerald-400">{tg?.version || 'Active Browser Mode'}</span>
            </div>
            <div className="flex justify-between">
              <span>Fairness Hash:</span>
              <span className="font-mono text-cyan-400">HMAC-SHA256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
