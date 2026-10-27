import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  History,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
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

function amount(value: number | string | null) {
  if (value === null || value === "") return "Not confirmed";
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(parsed)} ETB`
    : "Not confirmed";
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function issueType(record: VerificationRecord) {
  switch (record.status) {
    case "MISMATCH":
      return {
        label: "Mismatch",
        description: "The settled payment details do not match the order.",
        Icon: XCircle,
        color: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "DUPLICATE_CLAIM":
      return {
        label: "Duplicate claim",
        description: "This receipt image or transaction reference was already claimed.",
        Icon: ShieldAlert,
        color: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "NOT_FOUND":
      return {
        label: "Not found",
        description: "The payment provider did not find this transaction reference.",
        Icon: FileSearch,
        color: "bg-orange-50 text-orange-800 border-orange-200",
      };
    case "PENDING_PROVIDER":
      return {
        label: "Provider pending",
        description: "A definitive result is not available from the payment provider yet.",
        Icon: Clock3,
        color: "bg-sky-50 text-sky-800 border-sky-200",
      };
    default:
      return {
        label: "Review required",
        description: "The receipt could not be fully verified.",
        Icon: AlertCircle,
        color: "bg-orange-50 text-orange-800 border-orange-200",
      };
  }
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [search, setSearch] = useState("");
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
          readError(payload, `Could not load review cases (HTTP ${response.status}).`),
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
            : "Could not load review cases.",
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

  const reviewRecords = useMemo(
    () =>
      records.filter((record) =>
        [
          "MISMATCH",
          "DUPLICATE_CLAIM",
          "NOT_FOUND",
          "REVIEW_REQUIRED",
          "PENDING_PROVIDER",
        ].includes(record.status),
      ),
    [records],
  );
  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviewRecords;
    return reviewRecords.filter((record) =>
      [
        record.orderId,
        record.transactionReference,
        record.providerName,
        record.reason,
        record.status,
      ].some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [reviewRecords, search]);
  const providerPendingCount = reviewRecords.filter(
    (record) => record.status === "PENDING_PROVIDER",
  ).length;

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-3xl border border-[#F1D9BC] bg-gradient-to-br from-[#FFF8ED] via-white to-[#F8F3E9] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F8EDDA] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#865418]">
              <ShieldAlert size={15} />
              PAYMENT EXCEPTIONS
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#3D3528] sm:text-3xl">
              Needs review
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#756B5A] sm:text-base">
              Review payment checks that could not be safely confirmed. These
              records are read-only; verify the payment with your provider before
              deciding whether to fulfill an order.
            </p>
          </div>
          <Link
            to="/dashboard/history"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E8DCC9] bg-white px-4 py-2.5 text-sm font-semibold text-[#57462F] transition hover:bg-[#FFFCF6]"
          >
            View all history <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Review summary">
        {[
          {
            label: "Cases requiring attention",
            value: loading ? "—" : reviewRecords.length,
            Icon: ShieldAlert,
            color: "bg-amber-50 text-amber-800",
          },
          {
            label: "Awaiting provider",
            value: loading ? "—" : providerPendingCount,
            Icon: Clock3,
            color: "bg-sky-50 text-sky-800",
          },
          {
            label: "Verified records",
            value: loading ? "—" : records.filter((record) => record.status === "VERIFIED").length,
            Icon: CheckCircle2,
            color: "bg-[#EAF2EC] text-[#174D38]",
          },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-[#E5E9E2] bg-white p-4 shadow-sm">
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

      <section className="rounded-3xl border border-[#E5E9E2] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#EDF0EB] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <h2 className="font-semibold text-[#20372D]">Recent cases</h2>
            <p className="mt-1 text-sm text-[#829087]">
              {loading
                ? "Loading recent verification records…"
                : `${visibleRecords.length} cases from your latest verification records`}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search review cases</span>
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97A199]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order or reference"
                className="w-full rounded-xl border border-[#E2E7DF] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                void loadRecords();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E7DF] px-3.5 py-2.5 text-sm font-semibold text-[#526057] transition hover:bg-[#F6F8F5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div role="alert" className="m-5 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:m-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-red-800">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Review cases could not be loaded</p>
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
          <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
            <LoaderCircle size={26} className="animate-spin text-[#174D38]" />
            <p className="mt-3 text-sm font-medium text-[#526057]">Loading review cases</p>
          </div>
        ) : reviewRecords.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2EC] text-[#174D38]">
              <CheckCircle2 size={26} />
            </span>
            <h3 className="mt-4 font-semibold text-[#20372D]">You’re all caught up</h3>
            <p className="mt-1 max-w-md text-sm leading-5 text-[#829087]">
              No exceptions were found in your latest verification records. New
              payment checks will appear here if they need attention.
            </p>
            <Link
              to="/dashboard/upload"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#174D38] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#103C2B]"
            >
              Verify a receipt <ArrowRight size={16} />
            </Link>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center p-8 text-center">
            <Search size={23} className="text-[#829087]" />
            <h3 className="mt-3 font-semibold text-[#20372D]">No cases match that search</h3>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-2 text-sm font-semibold text-[#174D38] underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#EDF0EB]">
            {visibleRecords.map((record) => {
              const { label, description, Icon, color } = issueType(record);
              return (
                <li key={record.id} className="p-5 sm:p-6">
                  <article className="space-y-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${color}`}>
                          <Icon size={19} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#20372D]">{record.orderId}</h3>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>
                              {label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-5 text-[#718077]">
                            {record.reason || description}
                          </p>
                        </div>
                      </div>
                      <time className="shrink-0 text-xs text-[#829087]">{dateLabel(record.createdAt)}</time>
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-[#FAFBF9] p-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-[#829087]">Transaction reference</p>
                        <p className="mt-1 break-all font-mono text-sm font-medium text-[#34483A]">
                          {record.transactionReference || "Not detected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#829087]">Expected / settled</p>
                        <p className="mt-1 text-sm font-medium text-[#34483A]">
                          {amount(record.expectedAmount)}
                          <span className="mx-1.5 text-[#A0AAA2]">/</span>
                          {amount(record.settledAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#829087]">Expected receiver</p>
                        <p className="mt-1 break-all font-mono text-sm font-medium text-[#34483A]">
                          {record.expectedReceiver || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#829087]">Provider</p>
                        <p className="mt-1 text-sm font-medium text-[#34483A]">
                          {record.providerName || "Not identified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-[#F1E8D9] bg-[#FFFCF6] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2.5 text-sm text-[#725B38]">
                        <AlertCircle size={17} className="mt-0.5 shrink-0" />
                        <p className="leading-5">{description} Do not release based on a receipt image alone.</p>
                      </div>
                      <Link
                        to="/dashboard/history"
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#174D38] hover:underline"
                      >
                        View audit record <History size={15} />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
