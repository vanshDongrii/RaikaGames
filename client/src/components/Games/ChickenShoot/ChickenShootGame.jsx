import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, Menu, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import ChickenCanvas from './ChickenCanvas';
import BettingControls from './BettingControls';
import WinTicker from './WinTicker';
import AutoplayModal from '../../Modals/AutoplayModal';
import {
  playGunshotSound,
  playHitSound,
  playMultiplierDing,
  playMissSound,
  toggleSound,
  isSoundEnabled,
  playTapSound,
} from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function ChickenShootGame() {
  const {
    setActiveTab,
    isDemo,
    setIsDemo,
    setDrawerOpen,
    openModal,
    executeBet,
    currentBalance,
    autoplayConfig,
    setAutoplayConfig,
  } = useGame();

  const [betAmount, setBetAmount] = useState(5);
  const [targetPreference, setTargetPreference] = useState('auto');
  const [isShooting, setIsShooting] = useState(false);
  const [lastShotOutcome, setLastShotOutcome] = useState(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [lastWinBanner, setLastWinBanner] = useState(null);

  const autoplayTimerRef = useRef(null);

  // Shoot execution handler
  const handleShoot = useCallback(async (clickedTarget = null) => {
    if (isShooting) return;

    if (currentBalance < betAmount) {
      triggerNotificationHaptic('error');
      alert(isDemo ? 'Demo balance too low! Reset it in profile.' : 'Real balance too low! Please deposit.');
      return;
    }

    setIsShooting(true);
    playGunshotSound();

    try {
      const selectedTarget = clickedTarget?.tier || targetPreference;
      const result = await executeBet({
        betAmount,
        gameType: 'chicken_shoot',
        targetPreference: selectedTarget,
      });

      setLastShotOutcome(result);

      if (result.won) {
        // Successful hit
        playHitSound(result.multiplier >= 12);
        playMultiplierDing(result.multiplier);

        if (result.multiplier >= 15) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        setLastWinBanner({
          won: true,
          multiplier: result.multiplier,
          payout: result.payout,
          targetName: result.target?.name || 'Target',
        });
      } else {
        // Miss / Armor ricochet
        playMissSound();
        setLastWinBanner({
          won: false,
          text: 'Deflected / Missed! Try again.',
        });
      }
    } catch (err) {
      console.error('Shoot error:', err);
    } finally {
      setTimeout(() => {
        setIsShooting(false);
      }, 350);
    }
  }, [isShooting, currentBalance, betAmount, isDemo, executeBet, targetPreference]);

  // Autoplay loop runner
  useEffect(() => {
    if (autoplayConfig.isRunning && autoplayConfig.remainingRounds > 0) {
      autoplayTimerRef.current = setTimeout(() => {
        if (currentBalance < betAmount) {
          setAutoplayConfig(prev => ({ ...prev, isRunning: false }));
          return;
        }

        handleShoot();

        setAutoplayConfig(prev => {
          const nextRounds = prev.remainingRounds - 1;
          return {
            ...prev,
            remainingRounds: nextRounds,
            isRunning: nextRounds > 0,
          };
        });
      }, 1200);
    } else if (autoplayConfig.remainingRounds === 0 && autoplayConfig.isRunning) {
      setAutoplayConfig(prev => ({ ...prev, isRunning: false }));
    }

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [autoplayConfig.isRunning, autoplayConfig.remainingRounds, currentBalance, betAmount, handleShoot, setAutoplayConfig]);

  const handleStopAutoplay = () => {
    playTapSound();
    triggerHaptic('medium');
    setAutoplayConfig(prev => ({ ...prev, isRunning: false, remainingRounds: 0 }));
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
    triggerHaptic('light');
  };

  return (
    <div className="w-full flex flex-col space-y-3 pb-20 select-none animate-fadeIn">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between bg-raika-surface/90 border border-raika-border rounded-2xl px-3 py-2 shadow-lg">
        {/* Back Button & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('light');
              setActiveTab('lobby');
            }}
            className="w-8 h-8 rounded-xl bg-raika-dark hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90"
            title="Return to Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white tracking-tight">Chicken Shoot</h2>
              <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded uppercase">
                Original
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Provably Fair • 96.5% RTP</span>
          </div>
        </div>

        {/* Real vs Demo Toggle Pill & Settings */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playTapSound();
              triggerHaptic('light');
              setIsDemo(!isDemo);
            }}
            className="flex items-center bg-raika-dark border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold transition"
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={isDemo ? 'text-amber-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
              {isDemo ? 'DEMO' : 'REAL'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="w-8 h-8 rounded-xl bg-raika-dark hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

          {/* Drawer Menu */}
          <button
            onClick={() => {
              playTapSound();
              setDrawerOpen(true);
            }}
            className="w-8 h-8 rounded-xl bg-raika-dark hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Online Counter & Recent Win Ticker */}
      <WinTicker />

      {/* Interactive HTML5 Canvas Gallery */}
      <div className="relative">
        <ChickenCanvas
          onTargetClick={handleShoot}
          lastShotOutcome={lastShotOutcome}
          isShooting={isShooting}
        />

        {/* Win Banner Overlay */}
        {lastWinBanner && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none transition-all duration-300 animate-fadeIn ${
              lastWinBanner.won
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-glow-green'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-black tracking-wide font-mono">
              {lastWinBanner.won
                ? `WIN: +$${lastWinBanner.payout.toFixed(2)} (${lastWinBanner.multiplier}x ${lastWinBanner.targetName})`
                : lastWinBanner.text}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Betting Controls */}
      <BettingControls
        betAmount={betAmount}
        onChangeBet={setBetAmount}
        onShoot={() => handleShoot()}
        isShooting={isShooting}
        isAutoplayRunning={autoplayConfig.isRunning}
        onStopAutoplay={handleStopAutoplay}
        onOpenAutoplayModal={() => openModal('autoplay')}
        targetPreference={targetPreference}
        onSelectTargetPreference={setTargetPreference}
      />

      {/* Autoplay Settings Modal */}
      <AutoplayModal onStartAutoplay={() => {}} />
    </div>
  );
}
