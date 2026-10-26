import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const productLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQs", href: "#faq" },
];

const platformLinks = [
  { label: "Merchant dashboard", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "Developer API", href: "#developer" },
  { label: "Documentation", href: "#developer" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#102f25] text-white">
      {/* Ambient background details */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 -top-44 h-[30rem] w-[30rem] rounded-full border border-[#c1d8b7]/[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-[22rem] w-[22rem] rounded-full border border-[#c1d8b7]/[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#527c54]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Brand statement */}
        <div className="grid gap-10 border-b border-white/10 py-14 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c1d8b7]/20 bg-[#c1d8b7]/10 text-[#c1d8b7] transition-colors group-hover:bg-[#c1d8b7]/20">
                <ShieldCheck size={26} strokeWidth={1.8} />
              </span>

              <span className="text-2xl font-bold tracking-[-0.06em]">
                PAYLOCK<span className="text-[#a9c99b]">.</span>
              </span>
            </Link>

            <h2 className="mt-7 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.8rem]">
              Build trust into
              <span className="block text-[#b8d3a9]">
                every transaction.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#c0cec3]/75 sm:text-base">
              Smarter receipt analysis and safer payment-verification
              workflows for the next generation of Ethiopian digital commerce.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#c1d8b7] px-5 py-3.5 text-sm font-semibold text-[#163c2c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4e6ca]"
            >
              Get started with PAYLOCK
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#developer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-medium text-white/85 transition-colors hover:border-[#b8d3a9]/40 hover:bg-white/5 hover:text-white"
            >
              <Code2 size={17} />
              Explore developer tools
            </a>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr] lg:gap-12 lg:py-14">
          {/* Short brand summary */}
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9c99b]">
              Payment confidence
            </p>

            <p className="mt-4 text-sm leading-7 text-[#c0cec3]/70">
              Helping merchants examine receipt evidence, identify suspicious
              activity, and make more informed payment decisions.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#c0cec3]/80">
              <span className="h-2 w-2 rounded-full bg-[#a9c99b]" />
              Evidence first. Decisions second.
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold text-white">Explore</h3>

            <ul className="mt-5 space-y-4">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-[#c0cec3]/70 transition-colors hover:text-[#c1d8b7]"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold text-white">Platform</h3>

            <ul className="mt-5 space-y-4">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href.startsWith("#") ? link.href : undefined}
                    className="group inline-flex items-center gap-1.5 text-sm text-[#c0cec3]/70 transition-colors hover:text-[#c1d8b7]"
                  >
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        className="transition-colors hover:text-[#c1d8b7]"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      link.label
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Core principle */}
          <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c1d8b7]/10 text-[#c1d8b7]">
              <ShieldCheck size={22} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              A receipt is not proof.
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#c0cec3]/70">
              Image analysis can flag suspicious evidence. Payment
              confirmation requires reliable transaction records where
              supported.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-7">
          <p className="text-xs leading-6 text-[#c0cec3]/55">
            © {currentYear} PAYLOCK. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="#home"
              className="text-xs text-[#c0cec3]/65 transition-colors hover:text-white"
            >
              Back to top ↑
            </a>

            <span className="hidden h-4 w-px bg-white/15 sm:block" />

            <p className="text-xs text-[#c0cec3]/55">
              Built for safer digital commerce.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

