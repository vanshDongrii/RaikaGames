import React, { useState } from 'react';
import { X, Users, Copy, Check, Share2, Sparkles, Gift, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { playMultiplierDing, playTapSound } from '../../utils/audio';
import { triggerHaptic, triggerNotificationHaptic, tg } from '../../utils/telegram';

export default function InviteFriendsModal({ isOpen, onClose }) {
  const { userProfile } = useGame();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const refCode = userProfile.telegramId || '88997711';
  const refLink = `https://t.me/RaikaGameBot?start=ref_${refCode}`;

  const handleCopy = () => {
    playTapSound();
    triggerHaptic('light');
    navigator.clipboard?.writeText(refLink);
    setCopied(true);
    triggerNotificationHaptic('success');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = () => {
    playTapSound();
    triggerHaptic('medium');
    const shareText = encodeURIComponent('Join me on Raika! Play provably fair mini-games and earn daily rewards 🎮⚡️');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${shareText}`;

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-raika-card border border-raika-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Invite Friends</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Top Banner with Mascot */}
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-900/60 to-cyan-900/40 border border-blue-500/30 p-4 text-center overflow-hidden">
            <div className="text-5xl mb-2">🐱🐾</div>
            <h3 className="text-base font-black text-white">Earn Rewards Together</h3>
            <p className="text-xs text-gray-300 mt-1">
              Invite friends using your Telegram link and receive <strong>$5.00 demo bonus</strong> plus <strong>10% lifetime commission</strong> on all their wagers!
            </p>
          </div>

          {/* Referral Link Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Your Referral Deep Link
            </label>
            <div className="flex items-center gap-2 bg-raika-surface border border-white/10 rounded-xl p-2 pl-3">
              <span className="text-xs text-gray-300 truncate font-mono select-all flex-1">
                {refLink}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-raika-blue hover:bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-glow-cyan flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Share via Telegram
          </button>

          {/* Real Statistics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Friends</span>
              <span className="text-lg font-black text-white font-mono">0</span>
            </div>
            <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Earned</span>
              <span className="text-lg font-black text-emerald-400 font-mono">$0.00</span>
            </div>
            <div className="p-3 bg-raika-surface/40 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">VIP Boost</span>
              <span className="text-lg font-black text-amber-400 font-mono">+0.5%</span>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              How It Works
            </span>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-raika-surface border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">1</span>
                <span>Send your unique invitation link to Telegram contacts or group chats.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-raika-surface border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">2</span>
                <span>When they open the Mini App, they are permanently linked to your profile.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-raika-surface border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">3</span>
                <span>Collect automatic cashback bonuses on every game played by your squad!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
