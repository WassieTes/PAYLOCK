import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  FileCode2,
  LifeBuoy,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const faqs = [
  {
    question: "Why isn’t a receipt screenshot enough to verify a payment?",
    answer:
      "An image is evidence supplied by the customer, not proof that funds settled. PAYLOCK checks a transaction reference against payment-provider data when that integration is configured. Do not release an order based on a screenshot alone.",
  },
  {
    question: "What does “Provider pending” mean?",
    answer:
      "PAYLOCK could not get a definitive result from the payment provider. This can happen when provider access is not configured or the service is temporarily unavailable. The payment remains unverified; check your provider’s records and retry when access is available.",
  },
  {
    question: "What should I do with a mismatch or duplicate claim?",
    answer:
      "Keep the order on hold and compare the transaction reference, settled amount, and beneficiary in your provider’s own records. A mismatch means payment details differ from the order; a duplicate means the reference or receipt has already been claimed.",
  },
  {
    question: "How do I connect a checkout to PAYLOCK?",
    answer:
      "Open the developer workspace for API keys, request details, and integration guidance. Keep API keys private and configure them only in your server environment, never in browser code.",
  },
];

export default function HelpSupportPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="overflow-hidden rounded-3xl bg-[#174D38] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#DCEBE0]">
              <LifeBuoy size={15} />
              MERCHANT RESOURCES
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Help &amp; support
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
              Find guidance for payment checks, review cases, and connecting
              your store to PAYLOCK.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#174D38] transition hover:bg-[#EFF5EF]"
            >
              Verify a receipt <ArrowRight size={16} />
            </Link>
            <Link
              to="/developer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <FileCode2 size={16} /> Developer workspace
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <section className="overflow-hidden rounded-3xl border border-[#E5E9E2] bg-white shadow-sm">
          <div className="border-b border-[#EDF0EB] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#174D38]">
                <CircleHelp size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-[#20372D]">Frequently asked questions</h2>
                <p className="mt-1 text-sm text-[#829087]">
                  Quick answers to common payment-verification questions.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#EDF0EB] px-5 sm:px-6">
            {faqs.map((faq, index) => {
              const isOpen = openQuestion === index;
              const answerId = `help-answer-${index}`;
              return (
                <article key={faq.question} className="py-1">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenQuestion(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-5 py-4 text-left text-sm font-semibold leading-6 text-[#34483A] transition hover:text-[#174D38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C967A]"
                    >
                      {faq.question}
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#718077] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <p
                      id={answerId}
                      className="max-w-3xl pb-5 pr-8 text-sm leading-6 text-[#718077]"
                    >
                      {faq.answer}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#E5E9E2] bg-white p-5 shadow-sm sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#174D38]">
              <Mail size={20} />
            </span>
            <h2 className="mt-4 font-semibold text-[#20372D]">Contact merchant support</h2>
            <p className="mt-1 text-sm leading-5 text-[#829087]">
              Need help with an account or a verification issue? Send us a message.
            </p>
            <a
              href="mailto:support@paylock.et"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#DDE5DC] px-3.5 py-2.5 text-sm font-semibold text-[#174D38] transition hover:bg-[#F6F8F5]"
            >
              <Mail size={15} />
              Email support
              <ExternalLink size={14} className="text-[#829087]" />
            </a>
          </section>

          <section className="rounded-3xl border border-[#E5E9E2] bg-white p-5 shadow-sm sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F6F2] text-[#527960]">
              <MessageCircle size={20} />
            </span>
            <h2 className="mt-4 font-semibold text-[#20372D]">Community updates</h2>
            <p className="mt-1 text-sm leading-5 text-[#829087]">
              Follow the PAYLOCK Telegram channel for platform announcements and community discussion.
            </p>
            <a
              href="https://t.me/paylock_et"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#174D38] hover:underline"
            >
              Visit @paylock_et <ExternalLink size={14} />
            </a>
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-[#DCE9DD] bg-[#EEF5EE] p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#246243]" />
            <p className="text-sm leading-5 text-[#526B58]">
              <span className="font-semibold text-[#214B34]">Keep orders safe.</span>{" "}
              If a result is pending or needs review, confirm the transfer with
              your payment provider before fulfilling the order.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
