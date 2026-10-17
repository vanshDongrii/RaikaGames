import React, { useState, useEffect } from 'react';
import { X, ArrowDownToLine, AlertCircle, ShieldCheck, History, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { triggerHaptic, triggerNotificationHaptic } from '../../utils/telegram';
import { playTapSound, playMultiplierDing } from '../../utils/audio';

export default function WithdrawModal() {
  const { modalState, closeModal, userProfile, handleWithdraw, refreshProfile } = useGame();

  const [activeTab, setActiveTab] = useState('withdraw'); // 'withdraw' | 'history'
  const [currency, setCurrency] = useState('TON');
  const [amount, setAmount] = useState('25');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter === 'ALL') return true;
    return (tx.status || 'COMPLETED').toUpperCase() === statusFilter;
  });

  // Fetch transaction history
  const fetchTxHistory = () => {
    fetch('/api/wallet/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.transactions) {
          setTransactions(data.transactions);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (modalState.withdraw) {
      fetchTxHistory();
    }
  }, [modalState.withdraw]);

  if (!modalState.withdraw) return null;

  const payoutRails = [
    { id: 'TON', label: 'TON Wallet', icon: '💎', fee: '0% VIP Fee', min: 10 },
    { id: 'USDT', label: 'USDT (TRC20)', icon: '💵', fee: '0% VIP Fee', min: 15 },
    { id: 'BTC', label: 'Bitcoin', icon: '₿', fee: '0.5% Network Fee', min: 25 },
    { id: 'CARD', label: 'Bank Card', icon: '💳', fee: '1% Gateway Fee', min: 20 },
  ];

  const handleConfirm = async () => {
    const num = parseFloat(amount);
    const selectedRail = payoutRails.find(r => r.id === currency) || payoutRails[0];

    if (isNaN(num) || num < selectedRail.min) {
      setErrorMsg(`Minimum withdrawal for ${currency} is $${selectedRail.min}.00`);
      return;
    }
    if (!address || address.length < 8) {
      setErrorMsg(`Please enter a valid ${currency} destination address or card number`);
      return;
    }
    if (num > userProfile.balance) {
      setErrorMsg('Insufficient real balance. Play games or deposit to top up.');
      return;
    }

    playTapSound();
    triggerHaptic('medium');
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await handleWithdraw(num, address, currency);
      setSuccessMsg(res.message || `Cashout of $${num.toFixed(2)} submitted successfully!`);
      playMultiplierDing(5);
      triggerNotificationHaptic('success');
      refreshProfile();
      fetchTxHistory();

      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('history');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Withdrawal submission failed');
      triggerNotificationHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-raika-card border border-raika-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Withdrawal Vault</h2>
              <span className="text-[10px] text-gray-400 font-semibold">Fast Automated Blockchain & Card Payouts</span>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              closeModal('withdraw');
            }}
            className="w-8 h-8 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Cashout Request vs Transaction Log */}
        <div className="flex border-b border-raika-border/60 bg-raika-surface/20">
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'withdraw'
                ? 'border-cyan-500 text-white bg-cyan-500/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            💸 Request Payout
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-cyan-500 text-white bg-cyan-500/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Logs</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {activeTab === 'withdraw' ? (
            <div className="space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Real Balance Capsule */}
              <div className="bg-raika-surface/70 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                    Available Withdrawable Balance
                  </span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ${Number(userProfile.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                  Verified Ready
                </div>
              </div>

              {/* Payout Rail Selection */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  Payout Rail
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {payoutRails.map((rail) => (
                    <button
                      key={rail.id}
                      onClick={() => {
                        playTapSound();
                        setCurrency(rail.id);
                        setErrorMsg('');
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        currency === rail.id
                          ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-glow-cyan'
                          : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-surface'
                      }`}
                    >
                      <span className="text-2xl">{rail.icon}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black truncate">{rail.label}</div>
                        <div className="text-[10px] text-emerald-400 truncate font-semibold">{rail.fee}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input with Max Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Withdrawal Amount ($ USD)
                  </label>
                  <button
                    onClick={() => {
                      playTapSound();
                      setAmount(String(Math.floor(userProfile.balance || 0)));
                    }}
                    className="text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:underline"
                  >
                    Max (${Math.floor(userProfile.balance || 0)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min 10.00"
                    className="w-full bg-raika-surface/90 border border-white/10 rounded-2xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Destination Address */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Destination {currency} Wallet Address or Account
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    currency === 'TON'
                      ? 'Enter your TON address (e.g. UQ... or EQ...)'
                      : currency === 'CARD'
                      ? 'Enter 16-digit card number'
                      : `Enter your ${currency} wallet address`
                  }
                  className="w-full bg-raika-surface/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={loading || userProfile.balance <= 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-xs uppercase tracking-wider shadow-glow-cyan flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4" />
                {loading ? 'Processing Payout Request...' : `Confirm Cashout of $${parseFloat(amount || 0).toFixed(2)}`}
              </button>

              <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Automated 24/7 Processing • No KYC on Standard Amounts</span>
              </div>
            </div>
          ) : (
            /* TRANSACTION LOGS TAB */
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400 pb-1">
                <span>Recent Ledger Transactions</span>
                <span className="font-mono">{transactions.length} records</span>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 pb-1 overflow-x-auto no-scrollbar">
                {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      playTapSound();
                      setStatusFilter(st);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      statusFilter === st
                        ? 'bg-cyan-500 text-black shadow-sm'
                        : 'bg-raika-surface/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-raika-surface/30 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-2xl mb-1">📜</div>
                  <div className="text-xs font-bold text-white">No Transactions Recorded</div>
                  <div className="text-[10px]">No records found matching status filter "{statusFilter}".</div>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS' || tx.type === 'DAILY_CLAIM';
                    const st = (tx.status || 'COMPLETED').toUpperCase();

                    const badgeClass =
                      st === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : st === 'PROCESSING'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-2xl bg-raika-surface/60 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-extrabold text-white flex items-center gap-1.5">
                            <span className="capitalize">{tx.type.toLowerCase().replace('_', ' ')}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase border ${badgeClass}`}>
                              {st}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-mono font-black text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCredit ? '+' : '-'}${Number(tx.amount || 0).toFixed(2)}
                          </div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {tx.currency}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
