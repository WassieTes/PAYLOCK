import { ShieldCheck, FileCheck2, Timer, Code2 } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Verification-first",
    description: "Check payment evidence before releasing orders.",
  },
  {
    icon: FileCheck2,
    title: "Receipt intelligence",
    description: "Extract and analyze receipt details.",
  },
  {
    icon: Timer,
    title: "Faster workflows",
    description: "Reduce manual payment-checking work.",
  },
  {
    icon: Code2,
    title: "Developer-ready",
    description: "Integrate verification into your store.",
  },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d6dfd2] bg-white text-[#183b2b]">
                <Icon size={22} strokeWidth={2} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-ink">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
