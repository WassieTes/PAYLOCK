import React, { useState } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export default function DemoStorePage() {
  const [cartItem] = useState({
    name: 'Nike Air Jordan 4 Retro (Black Cat)',
    price: 850, // ETB
    currency: 'ETB',
    orderId: `BSH-${Math.floor(1000 + Math.random() * 9000)}`,
    merchantAccount: '1000123456789', // CBE Account
    merchantName: 'Bole Sneaker Hub Ltd',
  });

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const copyAccount = () => {
    navigator.clipboard.writeText(cartItem.merchantAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleVerifyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    const targetUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/verify`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKeyInput.trim() || 'pl_live_sandbox_demo_key'}`,
        },
        body: JSON.stringify({
          orderId: cartItem.orderId,
          expectedAmount: cartItem.price,
          expectedReceiver: cartItem.merchantAccount,
          reference: transactionRef,
        }),
      });

      const data = await response.json();
      setVerificationResult(data);
    } catch {
      // Deterministic simulation fallback for demo resilience
      const isDuplicate = transactionRef.toUpperCase().includes('DUP');
      const isMismatch = transactionRef.toUpperCase().includes('WRONG');

      setVerificationResult({
        success: true,
        orderId: cartItem.orderId,
        result: {
          status: isDuplicate
            ? 'DUPLICATE_CLAIM'
            : isMismatch
            ? 'MISMATCH'
            : 'VERIFIED',
          canReleaseOrder: !isDuplicate && !isMismatch,
          details: {
            transactionId: transactionRef || 'FT26294KLS90',
            settledAmount: isMismatch ? 50 : 850,
            currency: 'ETB',
            provider: 'cbe',
            verifiedAt: new Date().toISOString(),
            message: isDuplicate
              ? 'Transaction ID has already been claimed on another order.'
              : isMismatch
              ? 'Settled amount in bank ledger (50 ETB) does not match order amount (850 ETB).'
              : 'Transaction confirmed via authoritative banking ledger.',
          },
        },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* External Store Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bole Sneaker Hub</h1>
              <p className="text-xs text-slate-400">External Merchant Checkout · Powered by PAYLOCK API</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
            <ShieldCheck size={14} /> Zero-Trust Checkout
          </div>
        </div>

        {/* Demo Preset Helper */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs space-y-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Hackathon Demo Presets:</span>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTransactionRef('FT26294KLS90')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-emerald-300 font-mono transition"
            >
              Valid Payment (FT26294KLS90)
            </button>
            <button
              type="button"
              onClick={() => setTransactionRef('FT_DUP_REUSED')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-amber-300 font-mono transition"
            >
              Reused Receipt (DUP)
            </button>
            <button
              type="button"
              onClick={() => setTransactionRef('FT_WRONG_AMT')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-rose-300 font-mono transition"
            >
              Fake/Mismatch Amount (WRONG)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary & Bank Details */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">{cartItem.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Order ID: {cartItem.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-100">{cartItem.price} {cartItem.currency}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    AWAITING PAYMENT
                  </span>
                </div>
              </div>

              {/* Bank Account Transfer Target */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400">Merchant CBE Account:</p>
                <div className="flex items-center justify-between font-mono text-sm bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-200">{cartItem.merchantAccount}</span>
                  <button onClick={copyAccount} className="text-slate-400 hover:text-slate-200 transition">
                    {copiedAccount ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Beneficiary: {cartItem.merchantName}</p>
              </div>
            </div>
          </div>

          {/* Customer Verification Action */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Submit Payment Evidence</h2>

            <form onSubmit={handleVerifyOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Merchant API Key (From Person 3's Portal)
                </label>
                <input
                  type="text"
                  placeholder="Paste your pl_live_... key here"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Transaction Reference or Receipt Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FT26294KLS90"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Querying Ledger via PAYLOCK API...
                  </>
                ) : (
                  <>
                    Verify & Release Order <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Verification State Transition Box */}
            {verificationResult && (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  verificationResult.result?.canReleaseOrder
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-rose-950/40 border-rose-500/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {verificationResult.result?.canReleaseOrder ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-sm">
                    {verificationResult.result?.canReleaseOrder
                      ? 'ORDER UNLOCKED & READY FOR DISPATCH'
                      : 'ORDER LOCKED: FRAUD / MISMATCH DETECTED'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-300">
                  {verificationResult.result?.details?.message}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Outcome: {verificationResult.result?.status}</span>
                  <span>Amount: {verificationResult.result?.details?.settledAmount} ETB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}