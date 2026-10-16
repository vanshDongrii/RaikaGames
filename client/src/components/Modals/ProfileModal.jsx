import React, { useEffect, useState } from 'react';
import { X, Award, TrendingUp, DollarSign, RefreshCw, Gift, Shield } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { playTapSound } from '../../utils/audio';
import { triggerHaptic } from '../../utils/telegram';

export default function ProfileModal() {
  const { modalState, closeModal, userProfile, handleFaucet } = useGame();
  const [transactions, setTransactions] = useState([]);
  const [faucetLoading, setFaucetLoading] = useState(false);

  useEffect(() => {
    if (modalState.profile) {
      fetch('/api/wallet/transactions')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.transactions) {
            setTransactions(data.transactions);
          }
        })
        .catch(() => {});
    }
  }, [modalState.profile]);

  if (!modalState.profile) return null;

  const vip = userProfile.vip || { tier: 'Bronze I', nextTier: 'Silver I', progress: 0, cashback: '3%' };

  const onReloadDemo = async () => {
    playTapSound();
    triggerHaptic('medium');
    setFaucetLoading(true);
    try {
      await handleFaucet('demo');
    } finally {
      setFaucetLoading(false);
    }
  };

  const onClaimStarter = async () => {
    playTapSound();
    triggerHaptic('heavy');
    setFaucetLoading(true);
    try {
      await handleFaucet('real');
    } finally {
      setFaucetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-raika-card border border-raika-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <h2 className="text-base font-extrabold text-white tracking-tight">Player Profile</h2>
          </div>
          <button
            onClick={() => closeModal('profile')}
            className="w-8 h-8 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* User Header */}
          <div className="flex items-center gap-3 bg-raika-surface/50 p-3 rounded-xl border border-white/5">
            <img
              src={userProfile.avatarUrl}
              alt="Avatar"
              className="w-14 h-14 rounded-2xl border-2 border-emerald-500/40 object-cover shadow-glow-green"
            />
            <div>
              <div className="text-base font-extrabold text-white">@{userProfile.username}</div>
              <div className="text-xs text-gray-400">TG ID: {userProfile.telegramId}</div>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded text-[10px] font-black text-black uppercase">
                <Award className="w-3 h-3" />
                {vip.tier}
              </div>
            </div>
          </div>

          {/* VIP Progress Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-raika-surface/50 to-raika-card p-3.5 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-300">VIP Tier: {vip.tier}</span>
              <span className="text-gray-400 text-[11px]">Next: {vip.nextTier}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-raika-dark h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, vip.progress))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5">
              <span>Weekly Cashback: <b className="text-emerald-400">{vip.cashback}</b></span>
              <span>{Math.round(vip.progress)}% completed</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-raika-surface/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Real Balance</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                ${userProfile.balance.toFixed(2)}
              </span>
            </div>
            <div className="bg-raika-surface/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Demo Balance</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">
                ${userProfile.demoBalance.toFixed(2)}
              </span>
            </div>
            <div className="bg-raika-surface/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Wagered</span>
              <span className="text-sm font-extrabold text-white font-mono">
                ${userProfile.totalWagered.toFixed(2)}
              </span>
            </div>
            <div className="bg-raika-surface/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Won</span>
              <span className="text-sm font-extrabold text-cyan-400 font-mono">
                ${userProfile.totalWon.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Test Balance Faucet Buttons */}
          <div className="bg-raika-dark/70 p-3 rounded-xl border border-white/5 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Developer & Testing Faucets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClaimStarter}
                disabled={faucetLoading}
                className="py-2 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Gift className="w-3.5 h-3.5" />
                Claim +$50 Real
              </button>
              <button
                onClick={onReloadDemo}
                disabled={faucetLoading}
                className="py-2 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo $10k
              </button>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Recent Transactions
            </span>
            <div className="space-y-1.5">
              {transactions.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4 bg-raika-surface/30 rounded-xl">
                  No transactions yet. Play or deposit to see history!
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-raika-surface/40 border border-white/5 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white capitalize">{tx.type.toLowerCase()}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`font-mono font-bold ${
                      tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS' || tx.type === 'DAILY_CLAIM'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS' || tx.type === 'DAILY_CLAIM' ? '+' : '-'}
                      ${tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
