import React, { useState } from 'react';
import { X, Copy, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { triggerHaptic, triggerNotificationHaptic } from '../../utils/telegram';
import { playTapSound } from '../../utils/audio';

export default function DepositModal() {
  const { modalState, closeModal, handleDeposit } = useGame();
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [amount, setAmount] = useState('25');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!modalState.deposit) return null;

  const currencies = [
    { id: 'TON', name: 'Toncoin', icon: '💎', network: 'TON Network' },
    { id: 'USDT', name: 'Tether USDT', icon: '💵', network: 'TRC-20 / TON' },
    { id: 'STARS', name: 'Telegram Stars', icon: '⭐️', network: 'Telegram In-App' },
    { id: 'BTC', name: 'Bitcoin', icon: '₿', network: 'BTC Lightning' },
  ];

  const presets = ['10', '25', '50', '100', '250'];
  const mockAddress = 'EQB0_RaikaGameDepositTonWalletAddress778899XxYyZz';

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard?.writeText(mockAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    playTapSound();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await handleDeposit(num, selectedCurrency);
      setSuccessMsg(res.message || `Successfully added $${num.toFixed(2)}!`);
      setTimeout(() => {
        setSuccessMsg('');
        closeModal('deposit');
      }, 1400);
    } catch (err) {
      alert(err.message);
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
            <span className="text-xl">💳</span>
            <h2 className="text-base font-extrabold text-white tracking-tight">Deposit Funds</h2>
          </div>
          <button
            onClick={() => closeModal('deposit')}
            className="w-8 h-8 rounded-lg bg-raika-surface flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center animate-bounce">
              {successMsg}
            </div>
          )}

          {/* Currency Selector */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    playTapSound();
                    setSelectedCurrency(c.id);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition ${
                    selectedCurrency === c.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-glow-green'
                      : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-surface'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <div className="text-xs font-bold leading-none">{c.id}</div>
                    <div className="text-[10px] text-gray-400">{c.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Deposit Amount ($ USD)
            </label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    playTapSound();
                    setAmount(p);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    amount === p
                      ? 'bg-emerald-500 text-black font-extrabold'
                      : 'bg-raika-surface hover:bg-raika-hover text-gray-300'
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full bg-raika-dark border border-raika-border rounded-xl pl-7 pr-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Deposit Address Box */}
          <div className="bg-raika-dark/80 p-3 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Your {selectedCurrency} Address:</span>
              <span className="text-emerald-400 font-bold">Instant Credit</span>
            </div>
            <div className="flex items-center justify-between bg-raika-surface px-2.5 py-2 rounded-lg border border-white/5">
              <span className="font-mono text-[11px] text-gray-300 truncate max-w-[200px]">
                {mockAddress}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleConfirmDeposit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-sm shadow-glow-green flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-black" />
            {loading ? 'Processing...' : `Confirm Deposit $${parseFloat(amount || 0).toFixed(2)}`}
          </button>

          <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Secure • Instant Automated Verification
          </div>
        </div>
      </div>
    </div>
  );
}
