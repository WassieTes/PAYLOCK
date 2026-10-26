import {
  Upload,
  ScanSearch,
  ShieldCheck,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Submit the receipt",
    description:
      "Upload the payment screenshot from your customer through the PAYLOCK dashboard or your integrated store.",
    label: "Receipt submitted",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Analyze payment evidence",
    description:
      "PAYLOCK extracts key details such as transaction reference, amount, date, and recipient, then checks for inconsistencies.",
    label: "Evidence analyzed",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Verify before releasing",
    description:
      "Use an authoritative payment confirmation when available. Release the order only after the payment is verified.",
    label: "Verification decision",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#f8f7f2] px-6 py-24 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-[#dce7d7] bg-white px-4 py-2 text-sm font-medium text-[#356744]">
            Simple by design
          </span>

          <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-[#183b26] sm:text-4xl lg:text-5xl">
            From payment receipt to
            <span className="text-[#638b54]"> trusted decisions.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-[#73786f] sm:text-lg">
            A straightforward workflow that helps merchants check payment
            evidence before fulfilling an order.
          </p>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative flex flex-col rounded-3xl border border-[#e8e6dc] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#183b26]/5 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#245b37]">
                    <Icon size={26} strokeWidth={1.8} />
                  </div>

                  <span className="text-4xl font-semibold tracking-tight text-[#e6e9df]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-semibold text-[#183b26]">
                  {step.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-[#73786f] sm:text-base">
                  {step.description}
                </p>

                <div className="mt-7 flex items-center gap-2 border-t border-[#efeee7] pt-5">
                  <span className="h-2 w-2 rounded-full bg-[#739d61]" />
                  <span className="text-sm font-medium text-[#356744]">
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -bottom-5 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#e8e6dc] bg-white text-[#638b54] md:-right-5 md:bottom-auto md:left-auto md:top-1/2 md:translate-x-1/2 md:-translate-y-1/2">
                    <ArrowDown size={18} className="md:hidden" />
                    <ArrowRight size={18} className="hidden md:block" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-[#85877e]">
          Receipt analysis helps detect suspicious evidence; it does not, by
          itself, prove that money was transferred.
        </p>
      </div>
    </section>
  );
}
