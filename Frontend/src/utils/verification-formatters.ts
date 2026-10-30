import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
} from "lucide-react";

export function getStatus(status: string) {
  const normalized = status.toLowerCase();

  if (["verified", "approved", "success", "confirmed"].includes(normalized)) {
    return {
      label: "Verified",
      className: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (["pending", "processing", "queued"].includes(normalized)) {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700",
      icon: Clock3,
    };
  }

  if (normalized === "pending_provider") {
    return {
      label: "Waiting for provider",
      className: "bg-sky-50 text-sky-800",
      icon: Clock3,
    };
  }

  if (
    ["needs_review", "review", "flagged", "suspicious", "review_required"].includes(normalized)
  ) {
    return {
      label: "Needs review",
      className: "bg-orange-50 text-orange-700",
      icon: AlertTriangle,
    };
  }

  if (normalized === "mismatch") {
    return {
      label: "Mismatch",
      className: "bg-rose-50 text-rose-700",
      icon: AlertTriangle,
    };
  }

  if (normalized === "duplicate_claim") {
    return {
      label: "Duplicate claim",
      className: "bg-amber-50 text-amber-800",
      icon: ShieldAlert,
    };
  }

  if (normalized === "not_found") {
    return {
      label: "Not found",
      className: "bg-orange-50 text-orange-700",
      icon: AlertTriangle,
    };
  }

  if (["rejected", "failed", "fraudulent"].includes(normalized)) {
    return {
      label: normalized === "rejected" ? "Rejected" : "Failed",
      className: "bg-red-50 text-red-700",
      icon: ShieldAlert,
    };
  }

  return {
    label: status.replaceAll("_", " "),
    className: "bg-slate-100 text-slate-700",
    icon: Activity,
  };
}

export function formatAmount(
  amount: number | string | null | undefined,
  currency?: string | null,
) {
  if (amount === null || amount === undefined || amount === "") {
    return "—";
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return String(amount);
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "ETB",
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toLocaleString()} ${currency || "ETB"}`;
  }
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
