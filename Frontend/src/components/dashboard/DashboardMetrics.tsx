import { CheckCircle2, Clock3, FileCheck2, ShieldAlert } from "lucide-react";
import type { Verification } from "../../types/verification";
import MetricCard from "./MetricCard";

interface Props {
  verifications: Verification[];
  loading: boolean;
}

export default function DashboardMetrics({ verifications, loading }: Props) {
  const statuses = verifications.map((item) => item.status.toLowerCase());

  const total = verifications.length;
  const verified = statuses.filter((status) =>
    ["verified", "approved", "success", "confirmed"].includes(status),
  ).length;
  const pending = statuses.filter((status) =>
    ["pending", "processing", "queued", "pending_provider"].includes(status),
  ).length;
  const review = statuses.filter((status) =>
    [
      "needs_review",
      "review",
      "flagged",
      "suspicious",
      "review_required",
      "mismatch",
      "duplicate_claim",
      "not_found",
    ].includes(status),
  ).length;

  const metrics = [
    {
      label: "Total verifications",
      value: total,
      description: "Payment checks in your account",
      icon: FileCheck2,
      iconClass: "bg-[#EAF2EC] text-[#245C3E]",
    },
    {
      label: "Verified",
      value: verified,
      description: "Confirmed by a payment provider",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending",
      value: pending,
      description: "Waiting for a provider response",
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Needs review",
      value: review,
      description: "Need a closer look",
      icon: ShieldAlert,
      iconClass: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <section aria-label="Payment verification summary" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={loading ? "…" : String(metric.value)}
          description={metric.description}
          icon={metric.icon}
          iconClass={metric.iconClass}
        />
      ))}
    </section>
  );
}
