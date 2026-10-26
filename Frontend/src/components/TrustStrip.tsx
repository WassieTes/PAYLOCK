import { ShieldCheck, FileCheck2, Zap, Code2 } from "lucide-react";

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
    icon: Zap,
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
    <section className="border-y border-[#e8e4d9] bg-white px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#245b37]">
                <Icon size={23} strokeWidth={1.8} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#183b26]">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#73786f]">
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
