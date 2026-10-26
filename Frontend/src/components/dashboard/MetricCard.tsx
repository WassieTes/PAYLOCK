import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[#E5E9E2] bg-white p-5 transition hover:border-[#D5DED3] hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#7B887F]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20372D]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#929C94]">{description}</p>
    </div>
  );
}
