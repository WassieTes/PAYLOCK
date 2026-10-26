import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck, FileCheck2, ShieldCheck } from "lucide-react";
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
    <main className="min-h-screen bg-white text-[#102f1b]">
      <Header />

      {/* Hero section */}
      <section
        id="home"
        className="mx-auto grid max-w-[1800px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:px-12 lg:py-24 2xl:px-16"
      >
        {/* Left side: Main heading and buttons */}
        <div className="relative z-10">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#104c27]/10 px-4 py-2 text-sm font-bold tracking-wider text-[#104c27]">
            <span className="size-2.5 rounded-full bg-[#477d48]" />
            BUILT FOR ETHIOPIAN COMMERCE
          </p>

          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl 2xl:text-8xl">
            No verified payment.
            <span className="mt-2 block text-[#104c27]">
              No released order.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-[#604c34] sm:text-xl">
            PAYLOCK helps merchants check customer payment receipts against
            available transaction evidence before an order leaves their hands.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 rounded-xl bg-[#104c27] px-6 py-4 font-bold text-[#f2c68e] shadow-lg transition hover:-translate-y-1 hover:bg-[#0b3b1e]"
            >
              Start verifying
              <ArrowRight size={19} />
            </Link>

            <a
              href="#developer"
              className="inline-flex items-center gap-3 rounded-xl border border-[#104c27]/20 px-6 py-4 font-semibold transition hover:bg-[#104c27]/5"
            >
              Explore developer API
            </a>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-[#604c34]">
            <ShieldCheck size={19} className="shrink-0 text-[#104c27]" />
            Designed to protect every order, from checkout to handoff.
          </div>
        </div>

        {/* Right side: Payment verification illustration */}
        <div className="relative mx-auto w-full max-w-2xl py-10 sm:py-14 lg:max-w-none">
          {/* Decorative circles */}
          <div className="absolute left-1/2 top-1/2 aspect-square w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#104c27]/15" />
          <div className="absolute left-1/2 top-1/2 aspect-square w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#104c27]/15" />

          {/* Dashboard preview */}
          <div className="relative grid min-h-[360px] grid-cols-[65px_1fr] overflow-hidden rounded-2xl border border-[#104c27]/10 bg-[#f5e5d0] shadow-2xl shadow-[#604c34]/15 sm:min-h-[440px] sm:grid-cols-[95px_1fr] xl:grid-cols-[110px_1fr]">
            {/* Dashboard sidebar */}
            <aside className="flex flex-col items-center bg-[#0d351d] px-3 py-5 text-[#e5bd83] sm:px-4 sm:py-6">
              <ShieldCheck size={26} />

              <div className="mt-12 w-full space-y-4">
                <div className="h-2.5 rounded-full bg-[#84a86b]" />
                <div className="h-2.5 w-4/5 rounded-full bg-white/15" />
                <div className="h-2.5 w-3/4 rounded-full bg-white/15" />
                <div className="h-2.5 w-4/5 rounded-full bg-white/15" />
              </div>

              <span className="mt-auto text-xs font-bold">PAYLOCK</span>
            </aside>

            {/* Dashboard main content */}
            <div className="min-w-0 p-3 sm:p-6 xl:p-8">
              <p className="text-xs text-[#604c34] sm:text-sm">
                Verification request
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold sm:text-2xl">ORD-1048</h2>
                <span className="rounded-full bg-[#104c27]/10 px-3 py-1 text-[10px] font-bold text-[#104c27]">
                  SAMPLE
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">
                {/* Receipt preview */}
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#104c27]/10 bg-[#e5bd8d]/40 p-3 sm:min-h-[270px] sm:p-5">
                  <div className="flex h-[155px] w-[115px] flex-col justify-between bg-white p-4 shadow-lg sm:h-[190px] sm:w-[145px] sm:p-5">
                    <div>
                      <p className="text-xs font-black text-[#5c2749]">
                        telebirr
                      </p>
                      <div className="mt-5 h-1.5 rounded bg-[#e5bd8d]" />
                      <div className="mt-2 h-1.5 w-4/5 rounded bg-[#e5bd8d]" />
                      <div className="mt-2 h-1.5 w-3/5 rounded bg-[#e5bd8d]" />
                    </div>

                    <p className="text-[10px] font-black sm:text-xs">
                      ETB 4,850.00
                    </p>
                  </div>

                  <p className="mt-3 text-[10px] text-[#604c34]">
                    Sample receipt
                  </p>
                </div>

                {/* Verification status */}
                <div className="rounded-xl border border-[#104c27]/10 bg-white/70 p-3 sm:p-5">
                  <div className="grid size-10 place-items-center rounded-full bg-[#104c27]/10 text-[#104c27]">
                    <CircleCheck size={26} />
                  </div>

                  <span className="mt-3 inline-block rounded-full bg-[#e5bd8d]/40 px-2.5 py-1 text-[10px] font-bold text-[#104c27]">
                    Example result
                  </span>

                  <h3 className="mt-3 text-base font-semibold sm:text-lg">
                    Ready for review
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#604c34] sm:text-sm">
                    Receipt details extracted. Awaiting confirmation against
                    available transaction evidence.
                  </p>

                  <div className="mt-4 space-y-3 border-t border-[#104c27]/10 pt-3 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-[#604c34]">Amount</span>
                      <strong>ETB 4,850.00</strong>
                    </div>

                    <div className="flex justify-between gap-2">
                      <span className="text-[#604c34]">Order</span>
                      <strong>ORD-1048</strong>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[10px] leading-4 text-[#604c34]">
                Illustrative interface — not a live payment confirmation.
              </p>
            </div>
          </div>

          {/* Floating card: protection */}
          <div className="absolute -right-1 top-1 flex items-center gap-3 rounded-xl border border-[#104c27]/10 bg-white p-3 shadow-xl sm:-right-3 sm:top-5 sm:p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-[#104c27]/10 text-[#104c27]">
              <ShieldCheck size={23} />
            </span>

            <div>
              <p className="text-[10px] text-[#604c34] sm:text-xs">
                Protection workflow
              </p>
              <p className="text-xs font-bold sm:text-sm">
                Check before release
              </p>
            </div>
          </div>

          {/* Floating card: receipt analysis */}
          <div className="absolute -bottom-1 left-0 flex items-center gap-3 rounded-xl border border-[#104c27]/10 bg-white p-3 shadow-xl sm:-left-3 sm:bottom-2 sm:p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-[#104c27]/10 text-[#104c27]">
              <FileCheck2 size={22} />
            </span>

            <div>
              <p className="text-[10px] text-[#604c34] sm:text-xs">
                Receipt analysis
              </p>
              <p className="text-xs font-bold sm:text-sm">
                Extract and compare
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder for the developer section we'll add later */}
      <section id="developer" className="px-5 py-12 text-center sm:px-8">
        <h2 className="text-2xl font-bold">Built for developers, too.</h2>
        <p className="mt-3 text-[#604c34]">
          Integrate payment verification into your ecommerce workflow.
        </p>
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
