import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  History,
  LoaderCircle,
  Search,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

interface VerificationRecord {
  id: string;
  orderId: string;
  transactionReference: string | null;
  expectedAmount: number | string;
  settledAmount: number | string | null;
  expectedReceiver: string;
  settledReceiver: string | null;
  status: string;
  providerName: string | null;
  reason: string | null;
  createdAt: string;
}

const statusOptions = [
  { value: "ALL", label: "All outcomes" },
  { value: "VERIFIED", label: "Verified" },
  { value: "MISMATCH", label: "Mismatch" },
  { value: "DUPLICATE_CLAIM", label: "Duplicate" },
  { value: "NOT_FOUND", label: "Not found" },
  { value: "REVIEW_REQUIRED", label: "Review required" },
  { value: "PENDING_PROVIDER", label: "Provider pending" },
];

function amount(value: number | string | null) {
  if (value === null || value === "") return "—";
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(parsed)} ETB`
    : "—";
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusStyle(status: string) {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Verified",
        className: "bg-[#EAF2EC] text-[#174D38]",
        Icon: CheckCircle2,
      };
    case "MISMATCH":
      return {
        label: "Mismatch",
        className: "bg-rose-50 text-rose-700",
        Icon: XCircle,
      };
    case "DUPLICATE_CLAIM":
      return {
        label: "Duplicate claim",
        className: "bg-amber-50 text-amber-800",
        Icon: ShieldAlert,
      };
    case "REVIEW_REQUIRED":
      return {
        label: "Review required",
        className: "bg-orange-50 text-orange-800",
        Icon: AlertCircle,
      };
    case "PENDING_PROVIDER":
      return {
        label: "Provider pending",
        className: "bg-sky-50 text-sky-800",
        Icon: Clock3,
      };
    default:
      return {
        label: status.replaceAll("_", " ").toLowerCase(),
        className: "bg-slate-100 text-slate-700",
        Icon: FileSearch,
      };
  }
}

function readError(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload
  ) {
    const message = payload.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] =
    useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = useCallback(async () => {
    const token = localStorage.getItem("paylock_access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verifications`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("paylock_access_token");
        navigate("/login", { replace: true });
        return;
      }

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          readError(payload, `Could not load verification history (HTTP ${response.status}).`),
        );
      }
      if (!Array.isArray(payload)) {
        throw new Error("The verification service returned an unexpected response.");
      }
      setRecords(payload as VerificationRecord[]);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to PAYLOCK. Check that the backend is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "Could not load verification history.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // State updates happen after the request resolves, not during the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecords();
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !query ||
        [record.orderId, record.transactionReference, record.providerName, record.id]
          .some((value) => String(value ?? "").toLowerCase().includes(query));
      return (
        matchesSearch &&
        (statusFilter === "ALL" || record.status === statusFilter)
      );
    });
  }, [records, search, statusFilter]);

  const verifiedCount = records.filter((item) => item.status === "VERIFIED").length;
  const attentionCount = records.filter((item) =>
    ["MISMATCH", "DUPLICATE_CLAIM", "NOT_FOUND", "REVIEW_REQUIRED"].includes(
      item.status,
    ),
  ).length;

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-3xl bg-[#174D38] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#DCEBE0]">
              <History size={15} />
              PAYMENT AUDIT
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Verification history
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
              Review payment checks and their recorded outcomes. Results below
              come from your PAYLOCK account.
            </p>
          </div>
          <Link
            to="/dashboard/upload"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#174D38] transition hover:bg-[#EFF5EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Verify a receipt <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section aria-label="History summary" className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Records loaded",
            value: loading ? "—" : records.length,
            Icon: History,
            color: "bg-[#EAF2EC] text-[#174D38]",
          },
          {
            label: "Verified",
            value: loading ? "—" : verifiedCount,
            Icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Needs attention",
            value: loading ? "—" : attentionCount,
            Icon: ShieldAlert,
            color: "bg-amber-50 text-amber-800",
          },
        ].map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-[#E5E9E2] bg-white p-4 shadow-sm"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm text-[#7B887F]">{label}</p>
              <p className="mt-0.5 text-xl font-semibold text-[#20372D]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#E5E9E2] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#EDF0EB] p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-semibold text-[#20372D]">Payment checks</h2>
            <p className="mt-1 text-sm text-[#829087]">
              {loading ? "Loading your records…" : `${filteredRecords.length} of ${records.length} records`}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_190px] lg:w-[520px]">
            <label className="relative block">
              <span className="sr-only">Search history</span>
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97A199]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order or reference"
                className="w-full rounded-xl border border-[#E2E7DF] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
              />
            </label>
            <label>
              <span className="sr-only">Filter by outcome</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-[#E2E7DF] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div role="alert" className="m-5 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:m-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-red-800">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">History could not be loaded</p>
                <p className="mt-1 text-sm leading-5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                void loadRecords();
              }}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <LoaderCircle size={26} className="animate-spin text-[#174D38]" />
            <p className="mt-3 text-sm font-medium text-[#526057]">Loading verification history</p>
            <p className="mt-1 text-xs text-[#829087]">Fetching your latest payment checks</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F6F2] text-[#527960]">
              <ArrowDownToLine size={24} />
            </span>
            <h3 className="mt-4 font-semibold text-[#20372D]">No verification records yet</h3>
            <p className="mt-1 max-w-sm text-sm leading-5 text-[#829087]">
              When you verify a receipt, its outcome and payment details will appear here.
            </p>
            <Link
              to="/dashboard/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#174D38] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#103C2B]"
            >
              Verify a receipt <ArrowRight size={16} />
            </Link>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <Search size={23} className="text-[#829087]" />
            <h3 className="mt-3 font-semibold text-[#20372D]">No matching records</h3>
            <p className="mt-1 text-sm text-[#829087]">Adjust your search or outcome filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="mt-3 text-sm font-semibold text-[#174D38] underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-[#FAFBF9] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#87938B]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Order / reference</th>
                    <th scope="col" className="px-6 py-3.5">Provider</th>
                    <th scope="col" className="px-6 py-3.5">Expected / settled</th>
                    <th scope="col" className="px-6 py-3.5">Outcome</th>
                    <th scope="col" className="px-6 py-3.5">Checked</th>
                    <th scope="col" className="px-4 py-3.5"><span className="sr-only">Details</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2EE]">
                  {filteredRecords.map((record) => {
                    const { label, className, Icon } = statusStyle(record.status);
                    return (
                      <tr
                        key={record.id}
                        tabIndex={0}
                        onClick={() => setSelectedRecord(record)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedRecord(record);
                          }
                        }}
                        className="cursor-pointer transition hover:bg-[#FAFBF9] focus-visible:bg-[#FAFBF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C967A]"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#174D38]">{record.orderId}</p>
                          <p className="mt-1 font-mono text-xs text-[#829087]">{record.transactionReference || "No reference"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#526057]">{record.providerName || "—"}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#34483A]">{amount(record.expectedAmount)}</p>
                          <p className="mt-1 text-xs text-[#829087]">Settled: {amount(record.settledAmount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
                            <Icon size={14} /> {label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#718077]">{dateLabel(record.createdAt)}</td>
                        <td className="px-4 py-4 text-right text-[#97A199]"><ChevronRight size={17} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-[#EDF0EB] md:hidden">
              {filteredRecords.map((record) => {
                const { label, className, Icon } = statusStyle(record.status);
                return (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className="w-full p-4 text-left transition hover:bg-[#FAFBF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C967A]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#174D38]">{record.orderId}</p>
                          <p className="mt-1 truncate font-mono text-xs text-[#829087]">{record.transactionReference || "No reference"}</p>
                        </div>
                        <ChevronRight size={17} className="mt-1 shrink-0 text-[#97A199]" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
                          <Icon size={14} /> {label}
                        </span>
                        <span className="text-xs text-[#718077]">{dateLabel(record.createdAt)}</span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-[#34483A]">
                        Expected {amount(record.expectedAmount)}
                        <span className="ml-2 text-xs font-normal text-[#829087]">Settled {amount(record.settledAmount)}</span>
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#12251B]/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRecord(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-dialog-title"
            className="my-auto w-full max-w-xl rounded-3xl border border-[#E5E9E2] bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#EDF0EB] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#829087]">Verification details</p>
                <h2 id="record-dialog-title" className="mt-1 text-xl font-semibold text-[#174D38]">{selectedRecord.orderId}</h2>
                <p className="mt-1 break-all font-mono text-xs text-[#829087]">Record ID: {selectedRecord.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close verification details"
                className="rounded-xl p-2 text-[#718077] hover:bg-[#F3F6F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#174D38]"
              >
                <X size={19} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Outcome", selectedRecord.status.replaceAll("_", " ")],
                ["Checked", dateLabel(selectedRecord.createdAt)],
                ["Transaction reference", selectedRecord.transactionReference || "Not detected"],
                ["Provider", selectedRecord.providerName || "Not identified"],
                ["Expected amount", amount(selectedRecord.expectedAmount)],
                ["Settled amount", amount(selectedRecord.settledAmount)],
                ["Expected receiver", selectedRecord.expectedReceiver || "—"],
                ["Settled receiver", selectedRecord.settledReceiver || "Not confirmed"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#EDF0EB] bg-[#FAFBF9] p-3.5">
                  <p className="text-xs text-[#829087]">{label}</p>
                  <p className="mt-1 break-all text-sm font-medium text-[#34483A]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-[#EDF0EB] bg-[#FAFBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#829087]">Reconciliation details</p>
              <p className="mt-1.5 text-sm leading-6 text-[#526057]">{selectedRecord.reason || "No additional details were provided."}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="mt-5 w-full rounded-xl bg-[#174D38] py-3 text-sm font-semibold text-white transition hover:bg-[#103C2B]"
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
