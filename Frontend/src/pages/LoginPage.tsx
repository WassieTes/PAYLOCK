import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

type LoginResponse = {
  accessToken?: string;
  access_token?: string;
  message?: string | string[];
  error?: string;
};

type LoginLocationState = {
  email?: string;
  registrationSuccess?: boolean;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;

  const [email, setEmail] = useState(locationState?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message || data.error;

        throw new Error(message || "Invalid email or password.");
      }

      const token = data.accessToken ?? data.access_token;

      if (!token) {
        throw new Error(
          "No access token was returned. Please check your backend login response.",
        );
      }

      localStorage.setItem("paylock_access_token", token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to PAYLOCK. Check that the backend is running and try again.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5ee] px-4 py-5 text-[#173f30] sm:px-6 sm:py-8 lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto grid min-h-[680px] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#e7ebe2] bg-white shadow-lg lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left branding panel — same structure as registration */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#143b2d] p-10 text-white lg:flex xl:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-36 h-64 w-64 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-[#c1d8b7]/10 blur-3xl"
          />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
            <img
              src="/paylock_logo.jpg"
              alt=""
              className="h-11 w-11 rounded-2xl object-cover"
            />
            <span className="text-2xl font-bold tracking-tight">PAYLOCK</span>
          </Link>

          <div className="relative z-10 max-w-xl py-12">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-xs font-semibold tracking-wide text-[#d8e8d1]">
              <Fingerprint size={16} />
              PAYMENT VERIFICATION WORKSPACE
            </span>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Welcome back.
              <span className="mt-2 block text-[#c1d8b7]">
                Keep every payment accountable.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/65">
              Sign in to review payment verification results, manage your
              merchant account, and connect PAYLOCK to your store.
            </p>

            <div className="mt-10 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c1d8b7]/15 text-[#c1d8b7]">
                <LockKeyhole size={21} />
              </span>
              <div>
                <p className="font-medium text-white">
                  Verification before fulfillment
                </p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  Make payment verification part of your order workflow. Keep
                  your business protected from unverified payments.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-white/45">
            PAYLOCK · No verified payment. No released order.
          </p>
        </section>

        {/* Right form panel — same structure and spacing as registration */}
        <section className="flex min-h-[680px] flex-col bg-white">
          <header className="flex min-h-[76px] items-center justify-between gap-3 border-b border-[#edf0eb] px-4 py-4 sm:px-8 lg:px-10">
            <Link
              to="/"
              aria-label="Back to home"
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-[#dce4d9] bg-white px-3 text-xs font-semibold text-[#557064] transition hover:border-[#b9cbb5] hover:bg-[#f7f9f5] hover:text-[#173f30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#557f60] sm:px-4 sm:text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden min-[360px]:inline">Back to home</span>
              <span className="min-[360px]:hidden">Home</span>
            </Link>

            <Link
              to="/register"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#245b37] px-2.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#173f30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#557f60] min-[360px]:gap-2 min-[360px]:px-3 sm:px-4 sm:text-sm"
            >
              Create account
              <ArrowRight size={15} />
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:px-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e4ebdf] bg-[#f5f8f1] p-1.5 shadow-sm">
                  <img
                    src="/paylock_logo.jpg"
                    alt="PAYLOCK"
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#66816d]">
                  MERCHANT PORTAL
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-[#173f30] sm:text-[2.6rem]">
                  Welcome back
                </h2>

                <p className="mt-3 leading-6 text-[#6c7c70]">
                  Sign in to continue to your PAYLOCK account.
                </p>
              </div>

              {locationState?.registrationSuccess && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-[#c9dec2] bg-[#edf5e9] px-4 py-3 text-sm leading-6 text-[#285840]"
                >
                  Your account was created successfully. Sign in to continue.
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email — matches LoginMerchantDto */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#294a38]"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#829587]"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@yourbusiness.com"
                      className="w-full rounded-xl border border-[#dce4d9] bg-[#fcfdfb] py-3.5 pl-11 pr-4 text-sm text-[#173f30] outline-none transition placeholder:text-[#a0ada2] hover:border-[#b9cbb5] focus:border-[#557f60] focus:bg-white focus:ring-4 focus:ring-[#557f60]/10"
                    />
                  </div>
                </div>

                {/* Password — matches LoginMerchantDto */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#294a38]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#829587]"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      minLength={8}
                      maxLength={72}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#dce4d9] bg-[#fcfdfb] py-3.5 pl-11 pr-12 text-sm text-[#173f30] outline-none transition placeholder:text-[#a0ada2] hover:border-[#b9cbb5] focus:border-[#557f60] focus:bg-white focus:ring-4 focus:ring-[#557f60]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#829587] transition hover:bg-[#f1f4ed] hover:text-[#285840]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#245b37] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#173f30] focus:outline-none focus:ring-4 focus:ring-[#557f60]/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to PAYLOCK
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-[#718074]">
                New to PAYLOCK?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#285840] hover:text-[#173f30]"
                >
                  Create your merchant account
                </Link>
              </p>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#819084]">
                <ShieldCheck size={15} />
                Secure access to your merchant account
              </div>
            </div>
          </div>

          <footer className="px-5 py-5 text-center text-xs text-[#91a095] sm:px-10">
            © {new Date().getFullYear()} PAYLOCK. No verified payment. No
            released order.
          </footer>
        </section>
      </div>
    </main>
  );
}
