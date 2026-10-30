import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  ShieldCheck,
} from "lucide-react";

const faqs = [
  {
    question: "What is PAYLOCK?",
    answer:
      "PAYLOCK helps ecommerce merchants analyze payment receipts and manage payment verification before fulfilling orders. Its goal is to reduce fraud risks associated with relying on screenshots alone.",
  },
  {
    question: "Can AI tell whether a payment screenshot is fake?",
    answer:
      "AI can extract receipt details and flag suspicious patterns or inconsistencies. However, image analysis alone cannot prove that money was transferred. A verified payment decision should rely on an authoritative payment record when a supported integration is available.",
  },
  {
    question: "How does PAYLOCK verify a payment?",
    answer:
      "PAYLOCK can analyze the receipt, extract details such as the transaction reference and amount, and compare them with the order information. Confirmation against an authoritative payment source depends on the payment provider and integration supported by PAYLOCK.",
  },
  {
    question: "Can I use PAYLOCK without integrating an API?",
    answer:
      "Yes. The planned merchant dashboard lets merchants submit receipts and review the resulting analysis. Payment confirmation still depends on the verification methods available for the transaction.",
  },
  {
    question: "Can I integrate PAYLOCK into my own ecommerce website?",
    answer:
      "PAYLOCK is designed to support developer API integration. Your server can submit verification requests and use the returned status in your order workflow once the relevant API endpoints are implemented.",
  },
  {
    question: "Do I need separate accounts for the dashboard and API?",
    answer:
      "No. The intended design uses one merchant account for the dashboard and developer tools. API credentials should be managed securely and used from your backend, not exposed in frontend code.",
  },
  {
    question: "What happens when a payment cannot be verified?",
    answer:
      "The order should remain pending or be sent for manual review rather than being automatically marked as paid. Merchants can decide what to do after reviewing the available evidence.",
  },
  {
    question: "Does PAYLOCK support every Ethiopian payment provider?",
    answer:
      "Provider coverage depends on available integrations and access to authoritative transaction records. Support for a particular provider should be confirmed before relying on automatic payment verification.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-canvas px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          {/* Left introduction */}
          <div className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-brand">
              <CircleHelp size={16} strokeWidth={2.2} />
              Frequently asked questions
            </div>

            <h2 className="mt-7 max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
              Good questions.
              <span className="mt-1 block text-[#557A49]">
                Clear answers.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-ink-muted sm:text-lg">
              Understand how PAYLOCK approaches receipt analysis, payment
              verification, and safer ecommerce workflows.
            </p>

            {/* Trust principle card */}
            <div className="mt-9 overflow-hidden rounded-3xl border border-[#244D37] bg-[#183B2B] p-6 text-white sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <img
                    src="/paylock_logo.jpg"
                    alt=""
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                </div>

                <span className="rounded-full border border-[#a8c6a0]/25 bg-[#a8c6a0]/10 px-3 py-1 text-xs font-medium text-[#d4e7ce]">
                  Our principle
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-semibold leading-snug tracking-tight sm:text-[1.7rem]">
                No verified payment.
                <span className="block text-[#c2ddb5]">
                  No released order.
                </span>
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/70">
                A receipt is evidence to examine, not proof that funds have
                arrived. Keep orders pending until the available verification
                process supports a payment decision.
              </p>

              <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-sm font-medium text-[#d4e7ce]">
                <Check size={17} />
                Evidence first. Decisions second.
              </div>
            </div>

            <a
              href="#how-it-works"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-[#557A49]"
            >
              Explore how PAYLOCK works
              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>

          {/* Right accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${index}`;

              return (
                <div
                  key={faq.question}
                  className={`group overflow-hidden rounded-2xl border transition-all duration-200 ease-out ${
                    isOpen
                      ? "border-[#244D37] bg-[#183B2B]"
                      : "border-border bg-surface hover:border-[#a8bda2] hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors duration-300 ${
                        isOpen
                          ? "bg-white/10 text-[#c2ddb5]"
                          : "bg-[#edf2e8] text-[#426a48] group-hover:bg-[#e3ecdd]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`flex-1 text-sm font-semibold leading-6 transition-colors duration-300 sm:text-base ${
                        isOpen
                          ? "text-white"
                          : "text-[#153f30]"
                      }`}
                    >
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 bg-white/10 text-[#c2ddb5]"
                          : "bg-[#f2f4ed] text-[#426a48] group-hover:bg-[#e5ecdf]"
                      }`}
                    >
                      <ChevronDown size={18} strokeWidth={2} />
                    </span>
                  </button>

                  {/* Animated answer */}
                  <div
                    id={answerId}
                    aria-hidden={!isOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mx-5 border-t border-white/15 pb-6 pt-4 sm:mx-6 sm:pb-7 sm:pt-5">
                        <p className="pl-0 text-sm leading-7 text-white/75 sm:text-[0.94rem] sm:leading-8">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom note */}
            <div className="flex items-start gap-3 rounded-2xl border border-[#dce4d6] bg-[#edf1e7]/80 p-4 sm:p-5">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#426a48]"
              />
              <p className="text-sm leading-6 text-ink-muted">
                <span className="font-semibold text-[#214e39]">
                  Built around responsible verification.
                </span>{" "}
                Automatic payment confirmation depends on supported payment
                integrations and access to authoritative transaction records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
