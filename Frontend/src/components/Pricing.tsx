import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description: "For small merchants getting started with safer payments.",
    price: "Free",
    period: "to get started",
    features: [
      "Merchant dashboard",
      "Receipt uploads",
      "Basic receipt analysis",
      "Verification history",
      "Manual review workflow",
    ],
    button: "Create free account",
    featured: false,
  },
  {
    name: "Growth",
    description: "For growing online stores handling more orders.",
    price: "Custom",
    period: "usage-based pricing",
    features: [
      "Everything in Starter",
      "Higher verification limits",
      "Developer API access",
      "Webhook or status polling",
      "Advanced verification workflows",
    ],
    button: "Get started",
    featured: true,
  },
  {
    name: "Business",
    description: "For businesses with custom integration requirements.",
    price: "Let’s talk",
    period: "tailored to your needs",
    features: [
      "Everything in Growth",
      "Custom integration support",
      "Configurable workflows",
      "Merchant-specific API access",
      "Priority support options",
    ],
    button: "Create an account",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-surface px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-brand">
            Simple plans
          </span>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Start small. Grow with
            <span className="text-[#557A49]"> confidence.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-ink-muted sm:text-lg">
            Start with the essentials, then choose the verification capacity and
            integrations your business needs.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 sm:p-8 ${
                plan.featured
                  ? "border-[#245b37] bg-[#183B2B] text-white"
                  : "border-border bg-canvas text-ink"
              }`}
            >
              {plan.featured && (
                <span className="mb-5 inline-flex w-fit rounded-full bg-[#dcebd3] px-3 py-1.5 text-xs font-semibold text-[#183b26]">
                  Recommended
                </span>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>

              <p
                className={`mt-3 text-sm leading-6 ${
                  plan.featured ? "text-[#D5E0D4]" : "text-ink-muted"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-7">
                <p className="text-3xl font-semibold tracking-tight">
                  {plan.price}
                </p>
                <p
                  className={`mt-2 text-sm ${
                    plan.featured ? "text-[#D5E0D4]" : "text-ink-muted"
                  }`}
                >
                  {plan.period}
                </p>
              </div>

              <div
                className={`my-7 border-t ${
                  plan.featured ? "border-white/15" : "border-[#e8e6dc]"
                }`}
              />

              <ul className="flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        plan.featured ? "text-[#c4e0b5]" : "text-[#557A49]"
                      }`}
                    />
                    <span
                      className={`text-sm leading-6 ${
                        plan.featured ? "text-[#F3F5EF]" : "text-[#46544A]"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`mt-9 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-[#dcebd3] text-[#183b26] hover:bg-white"
                    : "bg-[#245b37] text-white hover:bg-[#183b26]"
                }`}
              >
                {plan.button}
                <ArrowRight size={17} />
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-ink-muted">
          Proposed plans for the MVP. Pricing, usage limits, and paid features
          will be confirmed before launch. Payment-provider fees, if any, may be
          separate.
        </p>
      </div>
    </section>
  );
}
