import React, { useState } from 'react';
import { X, Gift, Sparkles, Copy, Check, Users, Flame, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { triggerNotificationHaptic } from '../../utils/telegram';
import { playMultiplierDing, playTapSound } from '../../utils/audio';

export default function BonusesModal() {
  const { modalState, closeModal, handleDailyClaim, userProfile } = useGame();
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null);

  if (!modalState.bonuses) return null;

  const refLink = `https://t.me/RaikaGameBot?start=ref_${userProfile.telegramId || '88997711'}`;

  const onCopyRef = () => {
    playTapSound();
    navigator.clipboard?.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onClaimDaily = async () => {
    setClaiming(true);
    setClaimStatus(null);
    try {
      const res = await handleDailyClaim();
      playMultiplierDing(15);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setClaimStatus({ success: true, message: res.message || 'Reward claimed!' });
    } catch (err) {
      setClaimStatus({ success: false, message: err.message });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-raika-card border border-raika-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <h2 className="text-base font-extrabold text-white tracking-tight">Rewards & Bonuses</h2>
          </div>
          <button
            onClick={() => closeModal('bonuses')}
            className="w-8 h-8 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Daily Giveaway Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-600/10 to-raika-surface border border-pink-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Daily Free Drop
                </span>
                <h3 className="text-base font-black text-white mt-0.5">Instant Cash Giveaway</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Claim $5.00 to $25.00 daily real gift. No wager required!
                </p>
              </div>
              <div className="text-3xl">🎉</div>
            </div>

            {claimStatus && (
              <div className={`mt-3 p-2 rounded-xl text-xs font-bold text-center ${
                claimStatus.success
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {claimStatus.message}
              </div>
            )}

            <button
              onClick={onClaimDaily}
              disabled={claiming}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xs shadow-glow-ruby transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              {claiming ? 'Verifying Drop...' : 'Claim Today\'s Gift'}
            </button>
          </div>

          {/* Referral Program */}
          <div className="bg-raika-surface/60 p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-extrabold text-white">Invite & Earn 15% RevShare</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Share your referral link with friends in Telegram and earn a lifelong 15% cut of all platform house revenue.
            </p>
            <div className="flex items-center justify-between bg-raika-dark px-2.5 py-1.5 rounded-lg border border-white/5">
              <span className="font-mono text-[10px] text-gray-400 truncate max-w-[200px]">
                {refLink}
              </span>
              <button
                onClick={onCopyRef}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* VIP Cashback Tiers */}
          <div className="bg-raika-surface/60 p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                VIP Cashback Program
              </span>
              <span className="text-amber-400 text-[11px]">Up to 15%</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
              <div className="p-1.5 rounded bg-raika-dark/80 border border-white/5">
                <div className="text-gray-400 font-bold">Bronze</div>
                <div className="text-emerald-400 font-extrabold mt-0.5">3%</div>
              </div>
              <div className="p-1.5 rounded bg-raika-dark/80 border border-white/5">
                <div className="text-gray-400 font-bold">Silver</div>
                <div className="text-emerald-400 font-extrabold mt-0.5">5%</div>
              </div>
              <div className="p-1.5 rounded bg-raika-dark/80 border border-white/5">
                <div className="text-gray-400 font-bold">Gold</div>
                <div className="text-emerald-400 font-extrabold mt-0.5">7%</div>
              </div>
              <div className="p-1.5 rounded bg-raika-dark/80 border border-white/5">
                <div className="text-gray-400 font-bold">Plat</div>
                <div className="text-emerald-400 font-extrabold mt-0.5">10%</div>
              </div>
              <div className="p-1.5 rounded bg-raika-dark/80 border border-amber-500/30">
                <div className="text-amber-400 font-bold">Dia</div>
                <div className="text-amber-300 font-extrabold mt-0.5">15%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
