import React, { useState, useRef, useEffect } from 'react';
import { Disc3, Sparkles, Gift, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../../context/GameContext';
import { playWheelClick, playMultiplierDing, playTapSound } from '../../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic } from '../../../utils/telegram';

export default function LuckyWheelGame() {
  const { refreshProfile, isDemo } = useGame();
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [rotation, setRotation] = useState(0);

  const slices = [
    { label: '$5.00 CASH', color: '#10b981', value: 5.0, type: 'cash' },
    { label: 'x1.5 MULTI', color: '#3b82f6', value: 1.5, type: 'bonus' },
    { label: '$10.00 CASH', color: '#f59e0b', value: 10.0, type: 'cash' },
    { label: 'TRY AGAIN', color: '#374151', value: 0, type: 'zero' },
    { label: '$25.00 CASH', color: '#8b5cf6', value: 25.0, type: 'cash' },
    { label: 'x2.0 MULTI', color: '#ec4899', value: 2.0, type: 'bonus' },
    { label: '$50.00 MEGA', color: '#ef4444', value: 50.0, type: 'cash' },
    { label: '1000 DEMO', color: '#06b6d4', value: 1000.0, type: 'demo' },
  ];

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const sliceAngle = (Math.PI * 2) / slices.length;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    // Outer wheel border ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#181e2e';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    // Slices
    slices.forEach((slice, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Text labels
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.label, radius - 16, 4);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0d14';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.restore();
  }, [rotation, slices]);

  const handleSpin = async () => {
    if (spinning) return;
    playTapSound();
    triggerHaptic('medium');
    setSpinning(true);
    setPrize(null);

    try {
      const res = await fetch('/api/game/wheel-spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const targetIndex = data.sliceIndex || Math.floor(Math.random() * slices.length);

      // Calculate target rotation angle so pointer (at top, -Math.PI/2) aligns with slice
      const sliceAngle = (Math.PI * 2) / slices.length;
      const extraSpins = 5 + Math.floor(Math.random() * 3);
      // Pointer is at top (-PI/2)
      const targetAngle = extraSpins * Math.PI * 2 + (slices.length - targetIndex - 0.5) * sliceAngle - Math.PI / 2;

      const startRot = rotation % (Math.PI * 2);
      const startTime = performance.now();
      const spinDuration = 4000;

      let lastTickAngle = startRot;

      const animateSpin = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / spinDuration);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentRot = startRot + (targetAngle - startRot) * ease;
        setRotation(currentRot);

        if (Math.abs(currentRot - lastTickAngle) > sliceAngle * 0.8) {
          playWheelClick();
          lastTickAngle = currentRot;
        }

        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          setSpinning(false);
          setPrize(slices[targetIndex]);
          playMultiplierDing(20);
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
          });
          refreshProfile();
        }
      };

      requestAnimationFrame(animateSpin);
    } catch {
      setSpinning(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Raika Daily Lucky Wheel
        </div>
        <h2 className="text-2xl font-black text-white font-display">Spin & Win Free Cash</h2>
        <p className="text-xs text-gray-400">1 Free Spin Every 24 Hours • Win up to $50.00 instant bankroll!</p>
      </div>

      {/* Wheel Canvas & Indicator Pin */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Top Pointer Indicator */}
        <div className="absolute -top-1.5 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_2px_6px_rgba(251,191,36,0.8)]" />

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-full block"
        />
      </div>

      {/* Prize Announcement */}
      {prize && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-1 animate-bounce">
          <span className="text-xs font-bold text-gray-300">Congratulations! You won:</span>
          <div className="text-xl font-black text-emerald-400 font-mono">{prize.label}</div>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-black font-black text-sm uppercase tracking-wider shadow-glow-gold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
      >
        <Disc3 className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
        {spinning ? 'SPINNING WHEEL...' : 'SPIN THE WHEEL'}
      </button>
    </div>
  );
}
