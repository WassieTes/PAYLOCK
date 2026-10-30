import { Link } from "react-router-dom";
import { ArrowRight, Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import TrustStrip from "../components/TrustStrip";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import DeveloperSection from "../components/DeveloperSection";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <Header />

      {/* Hero section */}
      <section
        id="home"
        className="paylock-mesh relative isolate overflow-hidden"
      >
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-24">
        {/* Left side: Main heading and buttons */}
        <div className="relative z-10">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold tracking-[0.12em] text-brand sm:text-sm">
            <span className="size-2.5 rounded-full bg-[#638b54]" />
            BUILT FOR ETHIOPIAN COMMERCE
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl xl:text-6xl">
            No verified payment.
            <span className="mt-2 block text-[#557A49]">
              No released order.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
            PAYLOCK helps merchants check customer payment receipts against
            available transaction evidence before an order leaves their hands.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 rounded-xl bg-brand px-6 py-4 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#183b26]"
            >
              Start verifying
              <ArrowRight size={19} />
            </Link>

            <a
              href="#developer"
              className="inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-6 py-4 font-semibold text-brand transition hover:border-[#9dbb91] hover:bg-white"
            >
              Explore developer API
            </a>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-ink-muted">
            <ShieldCheck size={19} className="shrink-0 text-[#557A49]" />
            Designed to protect every order, from checkout to handoff.
          </div>
        </div>

        {/* Right side: Payment verification illustration */}
        <div className="relative mx-auto w-full max-w-2xl py-10 sm:py-14 lg:max-w-none">
          {/* Decorative circles */}
          {/* Dashboard preview */}
          <div className="relative grid min-h-[360px] grid-cols-[65px_1fr] overflow-hidden rounded-3xl border border-border bg-surface-muted shadow-lg sm:min-h-[440px] sm:grid-cols-[95px_1fr] xl:grid-cols-[110px_1fr]">
            {/* Dashboard sidebar */}
            <aside className="flex flex-col items-center bg-[#183b26] px-3 py-5 text-white sm:px-4 sm:py-6">
              <img
                src="/paylock_logo.jpg"
                alt="PAYLOCK"
                className="size-8 rounded-lg object-cover sm:size-10"
              />

              <div className="mt-12 w-full space-y-4">
                <div className="h-2.5 rounded-full bg-[#8eaa7a]" />
                <div className="h-2.5 w-4/5 rounded-full bg-white/15" />
                <div className="h-2.5 w-3/4 rounded-full bg-white/15" />
                <div className="h-2.5 w-4/5 rounded-full bg-white/15" />
              </div>

              <span className="mt-auto text-xs font-bold">PAYLOCK</span>
            </aside>

            {/* Dashboard main content */}
            <div className="min-w-0 p-3 sm:p-6 xl:p-8">
              <p className="text-xs text-ink-muted sm:text-sm">
                Verification request
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold sm:text-2xl">ORD-1048</h2>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold text-brand">
                  SAMPLE
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">
                {/* Receipt preview */}
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border bg-[#E9EFE5] p-3 sm:min-h-[270px] sm:p-5">
                  <div className="flex h-[155px] w-[115px] flex-col justify-between bg-white p-4 shadow-lg sm:h-[190px] sm:w-[145px] sm:p-5">
                    <div>
                      <p className="text-xs font-black text-[#5c2749]">
                        telebirr
                      </p>
                      <div className="mt-5 h-1.5 rounded bg-[#dce7d7]" />
                      <div className="mt-2 h-1.5 w-4/5 rounded bg-[#dce7d7]" />
                      <div className="mt-2 h-1.5 w-3/5 rounded bg-[#dce7d7]" />
                    </div>

                    <p className="text-[10px] font-black sm:text-xs">
                      ETB 4,850.00
                    </p>
                  </div>

                  <p className="mt-3 text-[10px] text-ink-muted">
                    Sample receipt
                  </p>
                </div>

                {/* Verification status */}
                <div className="rounded-2xl border border-border bg-surface p-3 sm:p-5">
                  <div className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand">
                    <Clock3 size={24} />
                  </div>

                  <span className="mt-3 inline-block rounded-full bg-[#F7F0DF] px-2.5 py-1 text-[10px] font-bold text-[#70521C]">
                    WAITING FOR PROVIDER
                  </span>

                  <h3 className="mt-3 text-base font-semibold sm:text-lg">
                    Awaiting confirmation
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-ink-muted sm:text-sm">
                    Receipt details extracted. Awaiting confirmation against
                    available transaction evidence.
                  </p>

                  <div className="mt-4 space-y-3 border-t border-border pt-3 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-ink-muted">Amount</span>
                      <strong>ETB 4,850.00</strong>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="text-ink-muted">Order</span>
                      <strong>ORD-1048</strong>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[10px] leading-4 text-ink-muted">
                Illustrative interface — not a live payment confirmation.
              </p>
            </div>
          </div>

          {/* Floating card: protection */}
          <div className="absolute -right-1 top-1 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-md sm:-right-3 sm:top-5 sm:p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <ShieldCheck size={23} />
            </span>

            <div>
              <p className="text-[10px] text-ink-muted sm:text-xs">
                Protection workflow
              </p>
              <p className="text-xs font-bold sm:text-sm">
                Check before release
              </p>
            </div>
          </div>

          {/* Floating card: receipt analysis */}
          <div className="absolute -bottom-1 left-0 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-md sm:-left-3 sm:bottom-2 sm:p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <FileCheck2 size={22} />
            </span>

            <div>
              <p className="text-[10px] text-ink-muted sm:text-xs">
                Receipt analysis
              </p>
              <p className="text-xs font-bold sm:text-sm">
                Extract and compare
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <TrustStrip />
      <HowItWorks />
      <Features />
      <DeveloperSection />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
