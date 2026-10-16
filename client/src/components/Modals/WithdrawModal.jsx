import React, { useState } from 'react';
import { X, ArrowDownToLine, AlertCircle, ShieldCheck } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { triggerHaptic } from '../../utils/telegram';
import { playTapSound } from '../../utils/audio';

export default function WithdrawModal() {
  const { modalState, closeModal, userProfile, handleWithdraw } = useGame();
  const [amount, setAmount] = useState('20');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('TON');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!modalState.withdraw) return null;

  const handleConfirm = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 10) {
      setErrorMsg('Minimum withdrawal amount is $10.00');
      return;
    }
    if (!address || address.length < 8) {
      setErrorMsg('Please enter a valid wallet address');
      return;
    }
    if (num > userProfile.balance) {
      setErrorMsg('Insufficient real balance. Play or deposit first.');
      return;
    }

    playTapSound();
    triggerHaptic('medium');
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await handleWithdraw(num, address, currency);
      setSuccessMsg(res.message || 'Withdrawal initiated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        closeModal('withdraw');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-raika-card border border-raika-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <h2 className="text-base font-extrabold text-white tracking-tight">Withdraw Funds</h2>
          </div>
          <button
            onClick={() => closeModal('withdraw')}
            className="w-8 h-8 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Balance Preview */}
          <div className="bg-raika-dark/70 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-400">Available Real Balance:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              ${userProfile.balance.toFixed(2)} USD
            </span>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Payout Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['TON', 'USDT'].map((cur) => (
                <button
                  key={cur}
                  onClick={() => {
                    playTapSound();
                    setCurrency(cur);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    currency === cur
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-glow-cyan'
                      : 'bg-raika-surface/60 border-white/5 text-gray-400 hover:bg-raika-surface'
                  }`}
                >
                  <span>{cur === 'TON' ? '💎' : '💵'}</span>
                  <span>{cur} {cur === 'TON' ? '(Toncoin)' : '(TRC20)'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Withdraw Amount
              </label>
              <button
                onClick={() => setAmount(String(Math.floor(userProfile.balance)))}
                className="text-[11px] font-bold text-cyan-400 hover:underline"
              >
                Max
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min 10.00"
                className="w-full bg-raika-dark border border-raika-border rounded-xl pl-7 pr-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Destination Address */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Destination Wallet Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter your ${currency} wallet address`}
              className="w-full bg-raika-dark border border-raika-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-sm shadow-glow-cyan flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            <ArrowDownToLine className="w-4 h-4" />
            {loading ? 'Processing Payout...' : 'Confirm Cashout'}
          </button>

          <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Zero network withdrawal fee for VIP members
          </div>
        </div>
      </div>
    </div>
  );
}
