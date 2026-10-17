import React from 'react';
import { X, ShieldCheck, HelpCircle, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { playTapSound } from '../../utils/audio';

export default function PlatformInfoModal({ type, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-raika-card border border-raika-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2.5">
            {type === 'about' && <HelpCircle className="w-5 h-5 text-raika-blue" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-amber-400" />}
            {type === 'privacy' && <Lock className="w-5 h-5 text-emerald-400" />}
            <h2 className="text-base font-extrabold text-white tracking-tight">
              {type === 'about' && 'About Raika Platform'}
              {type === 'terms' && 'Terms of Use'}
              {type === 'privacy' && 'Privacy & Provable Fairness'}
            </h2>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-gray-300 leading-relaxed">
          {type === 'about' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-raika-surface/40 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-400">
                  <img src="/assets/raika_mascot.jpg" alt="Raika" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Raika Gaming Platform</h3>
                  <p className="text-[11px] text-gray-400">Next-Generation Telegram Mini App</p>
                </div>
              </div>
              <p>
                Raika is an entertainment gaming platform built specifically for Telegram Mini Apps, delivering instant-play arcade originals, provably fair mini-games, and a live sports match center.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Client & Server Provably Fair Engine</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Telegram SDK Identity Validation</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero-lag HTML5 Vector Audio & Canvas Graphics</span>
                </div>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-2.5">
              <p>
                1. <strong>Virtual & Entertainment Play:</strong> All default gameplay utilizes virtual demo points or entertainment credits. Users may test all games risk-free.
              </p>
              <p>
                2. <strong>Age Requirement:</strong> Users must be of legal age under their respective jurisdictions to participate in interactive gaming platforms.
              </p>
              <p>
                3. <strong>Fair Play:</strong> Automated exploitation, reverse-engineering of RNG seeds, or bot abuse is strictly prohibited and subject to account suspension.
              </p>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-2.5">
              <p>
                1. <strong>HMAC-SHA256 Cryptographic Verification:</strong> All mini-game outcomes are computed using a combined server seed, user client seed, and sequential nonce. Outcomes cannot be manipulated post-wager.
              </p>
              <p>
                2. <strong>Telegram Data Privacy:</strong> User identity is authenticated strictly via Telegram’s cryptographically signed initialization hash. No sensitive passwords or tokens are stored on device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
