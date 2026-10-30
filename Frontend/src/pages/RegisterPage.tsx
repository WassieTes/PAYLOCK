import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Fingerprint,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

const businessTypes = [
  { value: "individual", label: "Individual" },
  { value: "sole_proprietorship", label: "Sole proprietorship" },
  { value: "company", label: "Company" },
  { value: "other", label: "Other" },
] as const;

type RegisterForm = {
  businessName: string;
  email: string;
  password: string;
  businessType: string;
  industry: string;
  phone: string;
};

const benefits = [
  "Review receipts from one merchant dashboard",
  "Access developer tools from the same account",
  "Build safer payment-verification workflows",
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    businessName: "",
    email: "",
    password: "",
    businessType: "",
    industry: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const businessName = form.businessName.trim();
    const email = form.email.trim();
    const industry = form.industry.trim();
    const phone = form.phone.trim();

    if (!businessName || businessName.length > 150) {
      setError("Enter a business name with no more than 150 characters.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("Your password must contain between 8 and 72 characters.");
      return;
    }

    if (industry.length > 100) {
      setError("Industry must be 100 characters or fewer.");
      return;
    }

    if (phone.length > 30) {
      setError("Phone number must be 30 characters or fewer.");
      return;
    }

    const validBusinessType = businessTypes.some(
      (type) => type.value === form.businessType,
    );

    if (form.businessType && !validBusinessType) {
      setError("Please select a valid business type.");
      return;
    }

    setLoading(true);

    const payload = {
      businessName,
      email,
      password: form.password,
      ...(form.businessType && { businessType: form.businessType }),
      ...(industry && { industry }),
      ...(phone && { phone }),
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message;

        setError(
          Array.isArray(message)
            ? message.join(" ")
            : typeof message === "string"
              ? message
              : "We couldn't create your account. Please check your details and try again.",
        );
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
          email,
        },
      });
    } catch {
      setError(
        "Unable to connect to PAYLOCK. Check that the backend is running and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#dfe5da] bg-[#fbfcf8] px-4 py-3.5 text-sm text-[#173c2d] outline-none transition placeholder:text-[#9aa69a] hover:border-[#b9cbb5] focus:border-[#315e43] focus:bg-white focus:ring-4 focus:ring-[#315e43]/10";

  const labelClass = "text-sm font-semibold text-[#294c37]";

  return (
    <main className="min-h-screen bg-[#f4f5ee] text-[#173c2d]">
      <header className="border-b border-[#e5e9df] bg-[#fafbf7]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="group inline-flex items-center gap-3">
            <img
              src="/paylock_logo.jpg"
              alt=""
              className="h-10 w-10 rounded-xl object-cover transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold tracking-[-0.06em]">
              PAYLOCK<span className="text-[#70936a]">.</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#66776a] transition hover:text-[#173f30]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16 lg:py-16">
        {/* Brand panel */}
        <aside className="relative overflow-hidden rounded-3xl bg-[#143b2d] p-7 text-white shadow-lg sm:p-10 lg:sticky lg:top-8 lg:min-h-[660px] lg:p-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/[0.08]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 top-0 h-48 w-48 rounded-full border border-white/[0.08]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#a8c99a]/10 blur-3xl"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium tracking-wide text-[#d1e4c6]">
              <Fingerprint size={15} />
              YOUR BUSINESS, BETTER PROTECTED
            </div>

            <h1 className="mt-8 max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              Trust every payment decision.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#d0ddd2]/75 sm:text-base sm:leading-8">
              Bring receipt analysis and payment-verification workflows together
              in one place, built for a safer digital commerce experience.
            </p>

            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c1d8b7]/10 text-[#c1d8b7]">
                    <ShieldCheck size={23} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Payment review
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      A more informed workflow
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-[#c1d8b7]/20 bg-[#c1d8b7]/10 px-3 py-1.5 text-xs font-medium text-[#c1d8b7]">
                  Evidence first
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Receipt details extracted",
                  "Order information compared",
                  "Payment status reviewed",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c1d8b7]/20 bg-[#c1d8b7]/10 text-[#c1d8b7]">
                      <Check size={14} />
                    </span>
                    <span className="text-sm text-white/80">{item}</span>
                    <span className="ml-auto text-xs text-white/35">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs leading-6 text-white/50">
                  Illustrative workflow, not a live payment verification.
                  Receipt analysis alone does not prove that funds arrived.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <Check size={17} className="mt-0.5 shrink-0 text-[#c1d8b7]" />
                  <p className="text-sm leading-6 text-white/75">{benefit}</p>
                </div>
              ))}
            </div>

            <p className="mt-9 border-t border-white/10 pt-5 text-xs leading-6 text-white/40">
              No verified payment. No released order.
            </p>
          </div>
        </aside>

        {/* Registration form */}
        <section className="min-w-0 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm sm:p-9 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6c8b61]">
              Merchant registration
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#173c2d] sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#788378]">
              Tell us about your business and set up your secure login.
            </p>

            <p className="mt-4 text-sm text-[#788378]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#28583d] underline decoration-[#b7cbb0] underline-offset-4 transition hover:text-[#66885b]"
              >
                Log in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Business information */}
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3e8] text-[#315e43]">
                  <Store size={17} />
                </span>
                <h3 className="text-sm font-bold text-[#234832]">
                  Business information
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="businessName" className={labelClass}>
                    Business name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    autoComplete="organization"
                    required
                    maxLength={150}
                    value={form.businessName}
                    onChange={(e) =>
                      updateField("businessName", e.target.value)
                    }
                    placeholder="e.g. Addis Market"
                    className={inputClass}
                  />
                </div>

                {/* Business type dropdown */}
                <div>
                  <label htmlFor="businessType" className={labelClass}>
                    Business type
                  </label>

                  <div className="relative">
                    <select
                      id="businessType"
                      name="businessType"
                      value={form.businessType}
                      onChange={(e) =>
                        updateField("businessType", e.target.value)
                      }
                      className={`${inputClass} appearance-none pr-11`}
                    >
                      <option value="">
                        Select your business type (optional)
                      </option>
                      {businessTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64816a]"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#8a958a]">
                    Choose the option that best describes your business.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="industry" className={labelClass}>
                      Industry
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      type="text"
                      maxLength={100}
                      value={form.industry}
                      onChange={(e) => updateField("industry", e.target.value)}
                      placeholder="e.g. Fashion, retail"
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs text-[#9aa49a]">Optional</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={30}
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+251 ..."
                      className={inputClass}
                    />
                    <p className="mt-2 text-xs text-[#9aa49a]">Optional</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#e9ede5]" />

            {/* Credentials */}
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3e8] text-[#315e43]">
                  <LockKeyhole size={17} />
                </span>
                <h3 className="text-sm font-bold text-[#234832]">
                  Account credentials
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Business email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#849586]"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@yourbusiness.com"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#849586]"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={72}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="At least 8 characters"
                      className={`${inputClass} pl-11 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#849586] transition hover:bg-[#edf3e8] hover:text-[#28583d] focus:outline-none focus:ring-2 focus:ring-[#315e43]/30"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#8a958a]">
                    Use between 8 and 72 characters.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#173f30] px-5 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#24543e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating your account...
                </>
              ) : (
                <>
                  Create merchant account
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            <p className="text-center text-xs leading-6 text-[#899389]">
              Please provide accurate business information and use your account
              responsibly.
            </p>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#e3eadd] bg-[#f5f7f0] p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#426c4b]" />
            <p className="text-xs leading-6 text-[#718071]">
              <span className="font-semibold text-[#31543a]">
                One account, two ways to work.
              </span>{" "}
              Your merchant account is designed to connect the dashboard and
              developer tools. API access depends on the features available in
              the backend.
            </p>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#e1e6dc] bg-[#eef1e8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-center text-xs text-[#849084] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
          <Link
            to="/"
            className="font-bold tracking-tight text-[#31543a] transition hover:text-[#63875b]"
          >
            PAYLOCK<span className="text-[#78996d]">.</span>
          </Link>
          <p>Payment confidence for digital commerce.</p>
        </div>
      </footer>
    </main>
  );
}
