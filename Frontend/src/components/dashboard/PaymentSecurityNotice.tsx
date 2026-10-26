import { ShieldCheck } from "lucide-react";

export default function PaymentSecurityNotice() {
  return (
    <div className="mb-7 flex items-start gap-3 rounded-2xl border border-[#DCE9DD] bg-[#EEF5EE] p-4 sm:p-5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#246243]">
        <ShieldCheck size={20} />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#214B34]">
          Payment verification matters
        </p>

        <p className="mt-1 text-sm leading-6 text-[#5F7665]">
          Use receipt analysis to identify suspicious details, but release
          orders only after payment has been confirmed through a trusted payment
          source.
        </p>
      </div>
    </div>
  );
}
