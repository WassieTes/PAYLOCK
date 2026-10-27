import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Key,
  Terminal,
  Activity,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Home,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import {
  developerApi,
  type ApiKeyItem,
  type ApiLogItem,
  type VerificationTestResult,
} from '../utils/developerApi';

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'docs' | 'logs'>('keys');

  // Keys State
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Playground / Docs State
  const [langTab, setLangTab] = useState<'curl' | 'node'>('curl');
  const [testAmount, setTestAmount] = useState('850');
  const [testReceiver, setTestReceiver] = useState('1000123456789');
  const [testRef, setTestRef] = useState('ABCD1234EF');
  const [testReceiptUrl, setTestReceiptUrl] = useState('');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [playgroundOutput, setPlaygroundOutput] =
    useState<VerificationTestResult | null>(null);
  const [playgroundError, setPlaygroundError] = useState('');

  // Logs State
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab]);

  const loadKeys = async () => {
    setLoadingKeys(true);
    const data = await developerApi.getKeys();
    setKeys(data);
    setLoadingKeys(false);
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    const data = await developerApi.getLogs();
    setLogs(data);
    setLoadingLogs(false);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await developerApi.createKey(keyNameInput);
    setNewlyCreatedKey(created.rawKey);
    setKeys((prev) => [
      {
        id: created.id,
        name: created.name,
        keyPrefix: created.keyPrefix,
        isActive: true,
        lastUsedAt: 'Never',
        createdAt: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? External systems using it will lose access immediately.')) return;
    await developerApi.revokeKey(id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copySecretKey = () => {
    if (!newlyCreatedKey) return;
    navigator.clipboard.writeText(newlyCreatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const runPlayground = async () => {
    setIsSubmittingTest(true);
    setPlaygroundOutput(null);
    setPlaygroundError('');
    try {
      const result = await developerApi.testVerify({
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        expectedAmount: parseFloat(testAmount),
        expectedReceiver: testReceiver,
        reference: testRef,
        receiptUrl: testReceiptUrl.trim() || undefined,
      });
      setPlaygroundOutput(result);
    } catch (requestError) {
      setPlaygroundError(
        requestError instanceof Error
          ? requestError.message
          : 'The verification request could not be completed.',
      );
    } finally {
      setIsSubmittingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#20372D]">
      <header className="sticky top-0 z-40 border-b border-[#E7EBE4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-9">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="PAYLOCK home">
            <span className="grid size-10 place-items-center rounded-xl bg-[#174D38] text-white">
              <ShieldCheck size={22} />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight tracking-tight text-[#174D38]">
                PAYLOCK
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.12em] text-[#7A887F]">
                DEVELOPER CONSOLE
              </span>
            </span>
          </Link>

          <nav aria-label="Page navigation" className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#526057] transition hover:bg-[#F5F7F2] hover:text-[#174D38]"
            >
              <LayoutDashboard size={17} />
              <span className="hidden sm:inline">Back to dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE4] px-3 py-2 text-sm font-semibold text-[#174D38] transition hover:bg-[#F5F7F2]"
            >
              <Home size={17} />
              <span>Home</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 border border-[#EEF0EB] md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#174D38]">
            <Code2 size={16} /> Developer Platform & Integration
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#174D38]">
            Developer API & Webhooks
          </h1>
          <p className="mt-1 text-sm text-[#718077]">
            Connect your custom e-commerce checkout to PAYLOCK's real-time payment reconciliation engine[cite: 2].
          </p>
        </div>

        <button
          onClick={() => {
            setShowKeyModal(true);
            setNewlyCreatedKey(null);
            setKeyNameInput('');
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#174D38] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#123e2d] transition"
        >
          <Plus size={16} /> Create API Key[cite: 2]
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EEF0EB] pb-3">
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'keys'
              ? 'bg-[#174D38] text-white'
              : 'text-[#64736A] hover:bg-[#F5F7F2]'
          }`}
        >
          <Key size={16} /> API Keys[cite: 2]
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'docs'
              ? 'bg-[#174D38] text-white'
              : 'text-[#64736A] hover:bg-[#F5F7F2]'
          }`}
        >
          <Terminal size={16} /> Docs & Playground[cite: 2]
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'logs'
              ? 'bg-[#174D38] text-white'
              : 'text-[#64736A] hover:bg-[#F5F7F2]'
          }`}
        >
          <Activity size={16} /> Request Logs[cite: 2]
        </button>
      </div>

      {/* TAB 1: API KEYS */}
      {activeTab === 'keys' && (
        <div className="rounded-2xl border border-[#EEF0EB] bg-white overflow-hidden shadow-sm">
          {loadingKeys ? (
            <div className="p-8 text-center text-sm text-[#718077]">Loading API credentials...</div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center">
              <Key size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-800">No API Keys Generated Yet[cite: 2]</p>
              <p className="text-xs text-gray-500 mt-1">Generate a key to connect your custom storefront.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[#3E4A42]">
              <thead className="bg-[#FAFBF9] border-b border-[#EEF0EB] text-[11px] font-bold uppercase tracking-wider text-[#7A887F]">
                <tr>
                  <th className="px-6 py-3.5">Label</th>
                  <th className="px-6 py-3.5">Token Prefix</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5">Last Active</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0EB]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#FAFBF9] transition">
                    <td className="px-6 py-4 font-semibold text-[#174D38] flex items-center gap-2">
                      <Key size={15} className="text-[#7A887F]" />
                      {k.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#526057]">{k.keyPrefix}</td>
                    <td className="px-6 py-4 text-xs text-[#718077]">
                      {typeof k.createdAt === 'string' && k.createdAt.includes('T')
                        ? new Date(k.createdAt).toLocaleDateString()
                        : k.createdAt}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#718077]">
                      {k.lastUsedAt && k.lastUsedAt.includes('T')
                        ? new Date(k.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : k.lastUsedAt || 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2EC] px-2.5 py-0.5 text-xs font-semibold text-[#174D38]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#174D38]"></span>
                        Active[cite: 2]
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Revoke Key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE DOCS & PLAYGROUND */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Documentation & Code Tabs */}
          <div className="rounded-2xl border border-[#EEF0EB] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF0EB] pb-3">
              <span className="font-mono text-xs font-bold text-[#174D38] flex items-center gap-1.5">
                <Terminal size={15} /> POST /api/v1/verify[cite: 2]
              </span>
              <div className="flex rounded-lg bg-[#F5F7F2] p-1 text-xs font-semibold">
                <button
                  onClick={() => setLangTab('curl')}
                  className={`rounded-md px-3 py-1 transition ${
                    langTab === 'curl' ? 'bg-white shadow text-[#174D38]' : 'text-[#7A887F]'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setLangTab('node')}
                  className={`rounded-md px-3 py-1 transition ${
                    langTab === 'node' ? 'bg-white shadow text-[#174D38]' : 'text-[#7A887F]'
                  }`}
                >
                  JavaScript
                </button>
              </div>
            </div>

            <pre className="overflow-x-auto rounded-xl bg-[#0F231A] p-4 font-mono text-xs leading-relaxed text-[#A9D8BE]">
              {langTab === 'curl'
                ? `curl -X POST https://api.paylock.et/api/v1/verify \\
  -H "Authorization: Bearer YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "ORD-9418",
    "expectedAmount": 850.00,
    "expectedReceiver": "1000123456789",
    "receiptUrl": "https://transactioninfo.ethiotelecom.et/receipt/ABCD1234EF"
  }'`
                : `const response = await fetch('https://api.paylock.et/api/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: 'ORD-9418',
    expectedAmount: 850.00,
    expectedReceiver: '1000123456789',
    receiptUrl: 'https://transactioninfo.ethiotelecom.et/receipt/ABCD1234EF'
  })
});
const data = await response.json();
if (data.result.canReleaseOrder) {
  // Release order and confirm dispatch!
}`}
            </pre>

            <div className="rounded-xl bg-[#F5F7F2] p-4 text-xs text-[#526057] space-y-1">
              <p className="font-semibold text-[#174D38]">Verification Principle:</p>
              <p>
                A screenshot is only an untrusted claim. Orders should only transition to <code>READY</code> when <code>canReleaseOrder: true</code>[cite: 2].
              </p>
              <p>
                Reference-only lookup is for Telebirr. For CBE and other banks, send the full HTTPS bank receipt link as <code>receiptUrl</code>.
              </p>
            </div>
          </div>

          {/* Provider-backed verification test */}
          <div className="rounded-2xl border border-[#EEF0EB] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#174D38] flex items-center gap-2">
              <Play size={15} /> Provider Verification Test
            </h3>
            <p className="text-xs leading-5 text-[#718077]">
              Uses your signed-in merchant session and the configured provider connection. This test is not simulated and does not use a browser-held API key.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A887F] mb-1">
                    Expected Amount (ETB)[cite: 2]
                  </label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    className="w-full rounded-xl border border-[#E7EBE4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#174D38]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A887F] mb-1">
                    Receiver Account[cite: 2]
                  </label>
                  <input
                    type="text"
                    value={testReceiver}
                    onChange={(e) => setTestReceiver(e.target.value)}
                    className="w-full rounded-xl border border-[#E7EBE4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#174D38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A887F] mb-1">
                  Transaction Ref / Receipt String[cite: 2]
                </label>
                <input
                  type="text"
                  value={testRef}
                  onChange={(e) => setTestRef(e.target.value)}
                  placeholder="e.g. ABCD1234EF (Telebirr)"
                  className="w-full rounded-xl border border-[#E7EBE4] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#174D38]"
                />
                <p className="mt-1 text-[11px] leading-4 text-[#829087]">
                  Reference-only lookup supports Telebirr. Use a full receipt URL for CBE and other banks.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A887F] mb-1">
                  Bank receipt URL (optional)
                </label>
                <input
                  type="url"
                  value={testReceiptUrl}
                  onChange={(e) => setTestReceiptUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-[#E7EBE4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#174D38]"
                />
              </div>

              <button
                onClick={runPlayground}
                disabled={isSubmittingTest}
                className="w-full rounded-xl bg-[#174D38] py-2.5 text-sm font-semibold text-white hover:bg-[#123e2d] transition disabled:opacity-50"
              >
                {isSubmittingTest ? 'Reconciling Ledger...' : 'Verify Payment'}
              </button>
            </div>

            {playgroundError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800"
              >
                {playgroundError}
              </p>
            )}

            {playgroundOutput && (
              <div className="mt-4 space-y-2 border-t border-[#EEF0EB] pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#7A887F]">Response:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      playgroundOutput.canReleaseOrder
                        ? 'bg-[#EAF2EC] text-[#174D38]'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {playgroundOutput.canReleaseOrder ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <XCircle size={13} />
                    )}
                    {playgroundOutput.status}
                  </span>
                </div>
                <pre className="max-h-48 overflow-y-auto rounded-xl bg-[#FAFBF9] p-3 font-mono text-[11px] text-[#3E4A42] border border-[#EEF0EB]">
                  {JSON.stringify(playgroundOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REQUEST AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-[#EEF0EB] bg-white overflow-hidden shadow-sm">
          {loadingLogs ? (
            <div className="p-8 text-center text-sm text-[#718077]">Loading audit logs...</div>
          ) : (
            <table className="w-full text-left text-sm text-[#3E4A42]">
              <thead className="bg-[#FAFBF9] border-b border-[#EEF0EB] text-[11px] font-bold uppercase tracking-wider text-[#7A887F]">
                <tr>
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">Method & Route</th>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Outcome</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0EB]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFBF9] transition">
                    <td className="px-6 py-4 text-xs font-mono text-[#718077]">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-[#174D38]">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{log.orderId || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                          log.outcome === 'VERIFIED'
                            ? 'bg-[#EAF2EC] text-[#174D38]'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-[#526057]">
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-[#718077]">
                      {log.latencyMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#EEF0EB] space-y-4">
            <h3 className="text-lg font-bold text-[#174D38]">
              {newlyCreatedKey ? 'Secret Key Generated[cite: 2]' : 'Create Merchant API Key[cite: 2]'}
            </h3>

            {!newlyCreatedKey ? (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A887F] mb-1">
                    Integration Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js Sneaker Store"
                    value={keyNameInput}
                    onChange={(e) => setKeyNameInput(e.target.value)}
                    className="w-full rounded-xl border border-[#E7EBE4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#174D38]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="rounded-xl border border-[#E7EBE4] px-4 py-2 text-xs font-semibold text-[#526057] hover:bg-[#F5F7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#174D38] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123e2d]"
                  >
                    Generate Key[cite: 2]
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Copy this key immediately. We do not store the plain token and it will never be displayed again.
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#EEF0EB] bg-[#FAFBF9] p-3">
                  <span className="w-full font-mono text-xs text-[#174D38] truncate select-all">
                    {newlyCreatedKey}
                  </span>
                  <button
                    onClick={copySecretKey}
                    className="shrink-0 rounded-lg border border-[#E7EBE4] bg-white p-1.5 text-[#526057] hover:bg-[#F5F7F2]"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check size={16} className="text-[#174D38]" /> : <Copy size={16} />}
                  </button>
                </div>

                <button
                  onClick={() => setShowKeyModal(false)}
                  className="w-full rounded-xl bg-[#174D38] py-2.5 text-xs font-semibold text-white hover:bg-[#123e2d]"
                >
                  I have copied my secret key
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      </main>
    </div>
  );
}