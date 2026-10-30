import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "#home", section: "home" },
  { label: "How it works", href: "#how-it-works", section: "how-it-works" },
  { label: "Features", href: "#features", section: "features" },
  { label: "Pricing", href: "#pricing", section: "pricing" },
  { label: "Developer API", href: "#developer", section: "developer" },
  { label: "Documentation", href: "#api-reference", section: "api-reference" },
  { label: "FAQ", href: "#faq", section: "faq" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const isAuthenticated = Boolean(
    localStorage.getItem("paylock_access_token"),
  );

  useEffect(() => {
    const updateActiveSection = () => {
      const currentSection = [...links]
        .reverse()
        .find(({ section }) => {
          const element = document.getElementById(section);
          return element && element.getBoundingClientRect().top <= 120;
        });

      setActiveSection(currentSection?.section ?? "home");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("hashchange", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <a
          href="#home"
          className="flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          aria-label="PAYLOCK home"
        >
          <img
            src="/paylock_logo.jpg"
            alt=""
            className="size-11 shrink-0 rounded-xl object-cover"
          />
          <span className="text-2xl font-black tracking-tight text-[#183b26] sm:text-3xl">
            PAYLOCK
          </span>
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 text-sm font-medium text-ink-muted xl:flex 2xl:gap-7"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={activeSection === link.section ? "location" : undefined}
              className={`inline-flex min-h-10 items-center whitespace-nowrap border-b-2 transition-colors hover:text-brand ${
                activeSection === link.section
                  ? "border-[#557A49] text-ink"
                  : "border-transparent"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className={
              isAuthenticated
                ? "inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#245b37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#183b26]"
                : "inline-flex min-h-10 items-center whitespace-nowrap px-2 text-sm font-semibold text-ink-muted transition-colors hover:text-brand"
            }
          >
            {isAuthenticated ? (
              <>
                Dashboard <ArrowRight size={16} />
              </>
            ) : (
              "Sign in"
            )}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#245b37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#183b26]"
            >
              Get started <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="grid size-11 place-items-center rounded-xl border border-border text-brand transition hover:bg-surface-muted xl:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border bg-surface px-5 py-4 xl:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={activeSection === link.section ? "location" : undefined}
                className={`rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-surface-muted hover:text-brand ${
                  activeSection === link.section
                    ? "bg-surface-muted text-ink"
                    : "text-ink-muted"
                }`}
              >
                {link.label}
              </a>
            ))}

            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => setMenuOpen(false)}
              className={
                isAuthenticated
                  ? "mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#245b37] px-4 py-3 text-base font-semibold text-white"
                  : "rounded-xl px-4 py-3 text-base font-semibold text-ink-muted hover:bg-surface-muted"
              }
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
              {isAuthenticated && <ArrowRight size={17} />}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#245b37] px-4 py-3 text-base font-semibold text-white"
              >
                Get started <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
