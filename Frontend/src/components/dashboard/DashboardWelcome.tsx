import { ArrowRight, ShieldCheck, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  businessName?: string;
  onUpload: () => void;
}

export default function DashboardWelcome({
  businessName,
  onUpload,
}: Props) {
  return (
    <section className="relative mb-7 overflow-hidden rounded-3xl border border-[#DDE9DF] bg-gradient-to-br from-[#F3F8F3] via-white to-[#EDF4EE] p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#DDEBDD]/50 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#174D38] shadow-sm ring-1 ring-[#DDE9DF]">
            <ShieldCheck size={15} />
            PAYMENT SECURITY OVERVIEW
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-[#20372D] sm:text-3xl">
            {businessName ? `Welcome back, ${businessName}` : "Welcome back"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#718077] sm:text-base">
            Here’s what’s happening with your payment checks. Review anything
            that needs attention and verify new receipts as they arrive.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D38] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103C2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174D38]"
          >
            <UploadCloud size={17} />
            Verify a payment
          </button>
          <Link
            to="/dashboard/history"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5DC] bg-white px-4 py-3 text-sm font-semibold text-[#174D38] transition hover:bg-[#F6F8F5]"
          >
            View history <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
