import {
  ShieldCheck,
  FileSearch,
  LayoutDashboard,
  Code2,
  Bell,
  KeyRound,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Intelligent receipt analysis",
    description:
      "Extract transaction references, amounts, dates, and recipient details from uploaded payment receipts.",
    tag: "Receipt analysis",
    style: "large",
  },
  {
    icon: ShieldCheck,
    title: "Payment verification",
    description:
      "Compare receipt details with an authoritative payment record when a supported provider is connected.",
    tag: "Verification-first",
    style: "large",
  },
  {
    icon: LayoutDashboard,
    title: "One merchant dashboard",
    description:
      "Review submitted receipts, inspect verification results, and manage payment checks from one workspace.",
    tag: "Merchant tools",
    style: "small",
  },
  {
    icon: Code2,
    title: "Developer API",
    description:
      "Connect your own ecommerce backend to PAYLOCK using an API and verification status updates.",
    tag: "Built for integration",
    style: "small",
  },
  {
    icon: Bell,
    title: "Actionable status updates",
    description:
      "Keep order workflows aligned with verification states such as pending, verified, rejected, or requiring review.",
    tag: "Workflow-ready",
    style: "small",
  },
  {
    icon: KeyRound,
    title: "Merchant-scoped access",
    description:
      "Keep merchant operations separated and protect API credentials and account-specific payment records.",
    tag: "Access control",
    style: "small",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-surface px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-brand">
              Built for safer commerce
            </span>

            <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              More confidence.
              <span className="block text-[#557A49]">
                Fewer payment doubts.
              </span>
            </h2>
          </div>

          <p className="max-w-lg text-base leading-7 text-ink-muted">
            Bring receipt analysis, payment verification, and order workflows
            together in one merchant-focused platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group flex min-h-[270px] flex-col rounded-3xl border border-border bg-canvas p-7 transition duration-200 hover:-translate-y-1 hover:border-[#cbdcc3] hover:bg-surface hover:shadow-md sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d6dfd2] bg-white text-[#183b2b] transition-colors group-hover:border-[#183b2b] group-hover:bg-[#183b2b] group-hover:text-[#f5f6f1]">
                    <Icon size={22} strokeWidth={2} />
                  </div>

                  <ArrowUpRight
                    size={20}
                    className="text-[#7B887F] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand"
                  />
                </div>

                <h3 className="mt-7 text-xl font-semibold text-ink">
                  {feature.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-ink-muted sm:text-base">
                  {feature.description}
                </p>

                <div className="mt-6">
                  <span className="inline-flex rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand">
                    {feature.tag}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-[#244D37] bg-[#183B2B] p-7 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#bcd7ae]">
              The PAYLOCK principle
            </p>

            <h3 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
              A convincing screenshot is not proof of a completed payment.
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#d0ddce] sm:text-base">
              Receipt analysis can flag suspicious evidence. A verified payment
              decision must rely on an authoritative source or a clearly defined
              verification process.
            </p>
          </div>

          <div className="mt-7 shrink-0 lg:mt-0">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
              <img
                src="/paylock_logo.jpg"
                alt=""
                className="size-8 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold">Verify before release</p>
                <p className="mt-1 text-xs text-[#d0ddce]">
                  Designed around payment evidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
