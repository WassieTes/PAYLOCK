import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, ShieldCheck, X } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Developer API", href: "#developer" },
  { label: "Documentation", href: "#developer" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = Boolean(
    localStorage.getItem("paylock_access_token"),
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#104c27]/10 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[130px] max-w-[1800px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12 2xl:px-16">
        <a href="#home" className="flex shrink-0 items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-[#104c27] text-[#e5bd83]">
            <ShieldCheck size={27} />
          </span>
          <span className="text-3xl font-black tracking-tight text-[#102f1b]">
            PAYLOCK
          </span>
        </a>

        <nav className=" items-center space-x-10 text-sm font-medium text-[#514a3e] 2xl:gap-6 xl:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-block whitespace-nowrap transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 hover:text-[#104c27] hover:drop-shadow-[0_0_8px_rgba(16,76,39,0.45)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className={
              isAuthenticated
                ? "inline-flex items-center gap-3 whitespace-nowrap rounded-xl bg-[#104c27] px-6 py-4 text-lg font-bold text-[#f2c68e] transition hover:bg-[#0b3b1e]"
                : "inline-block whitespace-nowrap transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 hover:text-[#104c27] hover:drop-shadow-[0_0_8px_rgba(16,76,39,0.45)]"
            }
          >
            {isAuthenticated ? (
              <>
                Go to dashboard <ArrowRight size={18} />
              </>
            ) : (
              "Sign in"
            )}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center gap-3 whitespace-nowrap rounded-xl bg-[#104c27] px-6 py-4 text-lg font-bold text-[#f2c68e] transition hover:bg-[#0b3b1e]"
            >
              Create account <ArrowRight size={18} />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid size-11 place-items-center rounded-xl border border-[#104c27]/15 text-[#104c27] lg:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-[#104c27]/10 bg-white px-5 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium hover:bg-[#104c27]/5"
              >
                {link.label}
              </a>
            ))}

            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => setMenuOpen(false)}
              className={
                isAuthenticated
                  ? "mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#104c27] px-4 py-3 text-base font-bold text-[#f2c68e]"
                  : "rounded-lg px-4 py-3 text-base font-semibold hover:bg-[#104c27]/5"
              }
            >
              {isAuthenticated ? "Go to dashboard" : "Sign in"}
              {isAuthenticated && <ArrowRight size={17} />}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#104c27] px-4 py-3 text-base font-bold text-[#f2c68e]"
              >
                Create account <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
