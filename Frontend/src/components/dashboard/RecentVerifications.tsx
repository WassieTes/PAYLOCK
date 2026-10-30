import { useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import type { Verification } from "../../types/verification";
import {
  formatAmount,
  formatDate,
  getStatus,
} from "../../utils/verification-formatters";
import DashboardEmptyState from "./DashboardEmptyState";

interface Props {
  verifications: Verification[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onUpload: () => void;
}

export default function RecentVerifications({
  verifications,
  loading,
  error,
  onRetry,
  onUpload,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVerifications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return verifications.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.orderId,
          item.transactionReference,
          item.customerName,
          item.id,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const status = item.status.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" &&
          ["verified", "approved", "success", "confirmed"].includes(status)) ||
        (statusFilter === "pending" &&
          ["pending", "processing", "queued", "pending_provider"].includes(status)) ||
        (statusFilter === "review" &&
          [
            "needs_review",
            "review",
            "flagged",
            "suspicious",
            "review_required",
            "mismatch",
            "duplicate_claim",
            "not_found",
          ].includes(status)) ||
        (statusFilter === "failed" &&
          ["rejected", "failed", "fraudulent"].includes(status));

      return matchesSearch && matchesStatus;
    });
  }, [verifications, searchTerm, statusFilter]);

  let emptyType: "loading" | "error" | "empty" | "no-results" | null = null;

  if (loading) {
    emptyType = "loading";
  } else if (error) {
    emptyType = "error";
  } else if (filteredVerifications.length === 0) {
    emptyType = searchTerm || statusFilter !== "all" ? "no-results" : "empty";
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E9E2] bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-[#EDF0EB] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h3 className="text-base font-semibold">Recent verifications</h3>
          <p className="mt-1 text-sm text-[#87938B]">
            A quick look at your latest payment checks
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#97A199]"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search records…"
              className="w-full rounded-xl border border-[#E2E7DF] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] sm:w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[#E2E7DF] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10"
            aria-label="Filter by verification status"
          >
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="review">Needs review</option>
            <option value="failed">Failed / rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 border-b border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Could not load verification records
              </p>
              <p className="mt-1 text-sm leading-5 text-red-700">{error}</p>
              <p className="mt-2 text-xs text-red-700">
                Check that GET /api/v1/verifications is implemented.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 sm:self-center"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="bg-[#FAFBF9] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8B978E]">
              <th className="px-6 py-4">Transaction / order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F0F2EE]">
            {emptyType ? (
              <DashboardEmptyState
                type={emptyType}
                message={
                  emptyType === "error"
                    ? "Fix the API connection and refresh the dashboard."
                    : undefined
                }
              />
            ) : (
              filteredVerifications.map((item) => {
                const status = getStatus(item.status);
                const StatusIcon = status.icon;

                return (
                  <tr key={item.id} className="transition hover:bg-[#FCFDFB]">
                    <td className="px-6 py-4">
                      <p className="max-w-56 truncate text-sm font-semibold text-[#304439]">
                        {item.orderId || item.transactionReference || item.id}
                      </p>
                      <p className="mt-1 max-w-56 truncate text-xs text-[#97A199]">
                        ID: {item.id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#5F7065]">
                      {item.customerName || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-[#304439]">
                      {formatAmount(item.amount, item.currency)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#738078]">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-2 border-t border-[#EDF0EB] px-5 py-4 text-xs text-[#87938B] sm:flex-row sm:items-center sm:px-6">
        <p>
          {loading
          ? "Loading your payment checks…"
            : error
            ? "Your records are unavailable right now"
            : `${filteredVerifications.length} of ${verifications.length} payment checks`}
        </p>
        {!loading && !error && verifications.length === 0 && (
          <button
            type="button"
            onClick={onUpload}
            className="font-semibold text-[#174D38] hover:underline"
          >
            Choose a receipt
          </button>
        )}
        <p>Payment confirmations come from your configured provider.</p>
      </div>
    </section>
  );
}
