import React, { useState } from 'react';
import { X, Copy, Check, ArrowRight, ShieldCheck, Zap, CreditCard, QrCode, Smartphone, Building, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { triggerHaptic, triggerNotificationHaptic, tg } from '../../utils/telegram';
import { playMultiplierDing, playTapSound } from '../../utils/audio';

export default function DepositModal() {
  const { modalState, closeModal, handleDeposit, refreshProfile } = useGame();

  // Payment rails: 'ton' | 'crypto' | 'card' | 'fiat'
  const [activeRail, setActiveRail] = useState('ton');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT-TON');
  const [amount, setAmount] = useState('50');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState(1); // 1: Select & Amount, 2: Payment Details & Confirm

  // Card fields for Card rail
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!modalState.deposit) return null;

  const paymentRails = [
    { id: 'ton', label: 'TON Wallet', icon: '💎', sub: 'Instant via Telegram' },
    { id: 'crypto', label: 'Crypto Rail', icon: '⚡️', sub: 'USDT, BTC, ETH' },
    { id: 'card', label: 'Bank Card', icon: '💳', sub: 'Visa & Mastercard' },
    { id: 'fiat', label: 'Local Fiat', icon: '🏦', sub: 'Bank & Instant Pay' },
  ];

  const cryptoCurrencies = [
    { id: 'USDT-TON', name: 'USDT (TON)', icon: '💵', network: 'TON Network', address: 'EQB0_RaikaGameDepositTonWalletAddress778899XxYyZz' },
    { id: 'TON', name: 'Toncoin', icon: '💎', network: 'The Open Network', address: 'EQB0_RaikaGameDepositTonWalletAddress778899XxYyZz' },
    { id: 'USDT-TRC20', name: 'USDT (TRC20)', icon: '₮', network: 'TRON TRC-20', address: 'TJRaikaGameDepositTrc20UsdtOfficialPool8899Zz' },
    { id: 'BTC', name: 'Bitcoin', icon: '₿', network: 'Bitcoin Lightning', address: 'bc1qraikagamecasinobitcoindepositvault7788' },
    { id: 'ETH', name: 'Ethereum', icon: 'Ξ', network: 'Ethereum / Arbitrum', address: '0x71C...RaikaVault' },
  ];

  const presets = ['10', '25', '50', '100', '250', '500'];

  const selectedCrypto = cryptoCurrencies.find(c => c.id === selectedCurrency) || cryptoCurrencies[0];

  const handleCopy = () => {
    triggerHaptic('light');
    playTapSound();
    navigator.clipboard?.writeText(selectedCrypto.address);
    setCopied(true);
    triggerNotificationHaptic('success');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleConfirmDeposit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    playTapSound();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await handleDeposit(num, selectedCurrency);
      setSuccessMsg(res.message || `Successfully credited $${num.toFixed(2)} to real balance!`);
      playMultiplierDing(10);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      refreshProfile();

      setTimeout(() => {
        setSuccessMsg('');
        setStep(1);
        closeModal('deposit');
      }, 1600);
    } catch (err) {
      alert(err.message || 'Deposit confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-raika-card border border-raika-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-raika-border/60 flex items-center justify-between bg-raika-surface/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-raika-blue/20 border border-raika-blue/40 flex items-center justify-center text-raika-blue shadow-glow-cyan">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Deposit Gateway</h2>
              <span className="text-[10px] text-gray-400 font-semibold">Instant Automated Credit • 0% Fees</span>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              setStep(1);
              closeModal('deposit');
            }}
            className="w-8 h-8 rounded-xl bg-raika-surface hover:bg-raika-hover border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold text-center animate-bounce flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <>
              {/* 1. Payment Rails Selector */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentRails.map((rail) => (
                    <button
                      key={rail.id}
                      onClick={() => {
                        playTapSound();
                        setActiveRail(rail.id);
                        if (rail.id === 'ton') setSelectedCurrency('USDT-TON');
                        else if (rail.id === 'crypto') setSelectedCurrency('USDT-TRC20');
                        else if (rail.id === 'card') setSelectedCurrency('CARD-USD');
                        else setSelectedCurrency('FIAT-BANK');
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        activeRail === rail.id
                          ? 'bg-raika-blue/15 border-raika-blue text-white shadow-glow-cyan'
                          : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-surface'
                      }`}
                    >
                      <span className="text-2xl">{rail.icon}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-black truncate">{rail.label}</div>
                        <div className="text-[10px] text-gray-400 truncate">{rail.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Specific Currency Sub-selector for Crypto */}
              {(activeRail === 'ton' || activeRail === 'crypto') && (
                <div>
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                    Currency Network
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(activeRail === 'ton'
                      ? cryptoCurrencies.filter(c => c.id.includes('TON'))
                      : cryptoCurrencies
                    ).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          playTapSound();
                          setSelectedCurrency(c.id);
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-center transition ${
                          selectedCurrency === c.id
                            ? 'bg-raika-blue text-white border-raika-blue shadow-sm'
                            : 'bg-raika-surface/60 border-white/5 text-gray-300 hover:bg-raika-surface'
                        }`}
                      >
                        <div className="text-xs font-black leading-tight">{c.id}</div>
                        <div className="text-[9px] text-gray-400 truncate mt-0.5">{c.network.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Preset Amounts & Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Deposit Amount (USD)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-400">
                    +10% Welcome Bonus Active
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1 mb-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        playTapSound();
                        setAmount(p);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-mono font-black transition ${
                        amount === p
                          ? 'bg-raika-blue text-white shadow'
                          : 'bg-raika-surface/80 hover:bg-raika-hover text-gray-300 border border-white/5'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom deposit"
                    className="w-full bg-raika-surface/90 border border-white/10 rounded-2xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-raika-blue"
                  />
                </div>
              </div>

              {/* Continue to Details Button */}
              <button
                onClick={() => {
                  playTapSound();
                  setStep(2);
                }}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-3.5 rounded-2xl bg-raika-blue hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>Continue to Payment (${parseFloat(amount || 0).toFixed(2)})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* STEP 2: Address Display / Gateway Details */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                <span className="text-gray-400">Selected Method:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{activeRail === 'ton' ? '💎' : activeRail === 'card' ? '💳' : '⚡️'}</span>
                  <span>{selectedCurrency}</span>
                </span>
              </div>

              {/* Crypto / TON Address Box with QR Preview */}
              {(activeRail === 'ton' || activeRail === 'crypto') && (
                <div className="bg-raika-dark/90 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Deposit Address ({selectedCrypto.network})
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      Automated 1-Block Confirm
                    </span>
                  </div>

                  {/* QR Simulation Box */}
                  <div className="flex items-center gap-3 bg-raika-surface/60 p-3 rounded-xl border border-white/5">
                    <div className="w-16 h-16 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                      <QrCode className="w-14 h-14 text-black" />
                    </div>
                    <div className="overflow-hidden space-y-1">
                      <div className="text-[10px] text-gray-400 font-semibold">Send exact amount to this wallet:</div>
                      <div className="font-mono text-xs text-white truncate select-all font-bold">
                        {selectedCrypto.address}
                      </div>
                      <button
                        onClick={handleCopy}
                        className="text-[11px] font-bold text-raika-blue hover:text-blue-300 flex items-center gap-1 mt-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied to Clipboard!' : 'Copy Wallet Address'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Gateway Fields */}
              {activeRail === 'card' && (
                <div className="bg-raika-dark/90 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>Card Checkout Simulator</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Card Number (4532 •••• •••• 8899)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-raika-surface border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-raika-blue"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-raika-surface border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-raika-blue"
                    />
                    <input
                      type="password"
                      placeholder="CVV (•••)"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-raika-surface border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-raika-blue"
                    />
                  </div>
                </div>
              )}

              {/* Fiat Gateway info */}
              {activeRail === 'fiat' && (
                <div className="bg-raika-dark/90 p-4 rounded-2xl border border-white/10 space-y-2 text-xs text-gray-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>Instant Local Bank Gateway</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Your payment invoice will be verified instantly upon submitting confirmation.
                  </p>
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playTapSound();
                    setStep(1);
                  }}
                  className="px-4 py-3 rounded-2xl bg-raika-surface hover:bg-raika-hover text-gray-300 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-wider shadow-glow-green flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  {loading ? 'Verifying on Ledger...' : `Confirm Deposit $${parseFloat(amount || 0).toFixed(2)}`}
                </button>
              </div>
            </div>
          )}

          <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted Transaction Gateway • Regulated Web3 Vault</span>
          </div>
        </div>
      </div>
    </div>
  );
}
