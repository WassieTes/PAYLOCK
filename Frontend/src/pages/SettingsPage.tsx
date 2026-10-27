import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

type BusinessType = "individual" | "sole_proprietorship" | "company" | "other";

interface MerchantProfile {
  id: string;
  businessName: string;
  email: string;
  businessType: BusinessType;
  industry: string | null;
  phone: string | null;
  websiteUrl: string | null;
  accountStatus: string;
  createdAt: string;
}

interface ProfileForm {
  businessName: string;
  businessType: BusinessType;
  industry: string;
  phone: string;
  websiteUrl: string;
}

function toForm(profile: MerchantProfile): ProfileForm {
  return {
    businessName: profile.businessName ?? "",
    businessType: profile.businessType ?? "individual",
    industry: profile.industry ?? "",
    phone: profile.phone ?? "",
    websiteUrl: profile.websiteUrl ?? "",
  };
}

function readError(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload
  ) {
    const message = payload.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

function businessTypeLabel(value: BusinessType) {
  return {
    individual: "Individual merchant",
    sole_proprietorship: "Sole proprietorship",
    company: "Private limited company (PLC)",
    other: "Other",
  }[value];
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    businessName: "",
    businessType: "individual",
    industry: "",
    phone: "",
    websiteUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("paylock_access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/merchants/profile`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("paylock_access_token");
        navigate("/login", { replace: true });
        return;
      }

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          readError(payload, `Could not load your profile (HTTP ${response.status}).`),
        );
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("businessName" in payload) ||
        !("email" in payload)
      ) {
        throw new Error("The profile service returned an unexpected response.");
      }

      const merchant = payload as MerchantProfile;
      setProfile(merchant);
      setForm(toForm(merchant));
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to PAYLOCK. Check that the backend is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "Could not load your merchant profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // State updates happen after the request resolves, not during the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  const isDirty =
    profile !== null && JSON.stringify(form) !== JSON.stringify(toForm(profile));

  function updateField<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !isDirty) return;

    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("paylock_access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/merchants/profile`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          businessType: form.businessType,
          industry: form.industry.trim() || null,
          phone: form.phone.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("paylock_access_token");
        navigate("/login", { replace: true });
        return;
      }

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          readError(payload, `Could not save your profile (HTTP ${response.status}).`),
        );
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("merchant" in payload) ||
        typeof payload.merchant !== "object" ||
        payload.merchant === null
      ) {
        throw new Error("The profile service returned an unexpected save response.");
      }

      const updatedProfile = payload.merchant as MerchantProfile;
      setProfile(updatedProfile);
      setForm(toForm(updatedProfile));
      setSuccess("Your business profile has been saved.");
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to PAYLOCK. Your changes have not been saved."
          : requestError instanceof Error
            ? requestError.message
            : "Your profile could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="overflow-hidden rounded-3xl bg-[#174D38] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#DCEBE0]">
              <Building2 size={15} />
              MERCHANT ACCOUNT
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Business profile
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
              Keep your merchant contact and business information up to date.
              Changes are saved to your PAYLOCK account.
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">Account status</p>
                <p className="mt-0.5 text-xs capitalize text-white/75">
                  {profile.accountStatus || "Active"}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Profile summary">
        {[
          {
            label: "Business",
            value: loading ? "Loading…" : profile?.businessName || "Not set",
            Icon: Building2,
          },
          {
            label: "Business type",
            value: loading
              ? "Loading…"
              : profile
                ? businessTypeLabel(profile.businessType)
                : "—",
            Icon: UserRound,
          },
          {
            label: "Account email",
            value: loading ? "Loading…" : profile?.email || "Not set",
            Icon: Mail,
          },
        ].map(({ label, value, Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#E5E9E2] bg-white p-4 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] text-[#174D38]">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-[#829087]">{label}</p>
              <p className="mt-1 truncate text-sm font-semibold text-[#34483A]">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">There was a problem</p>
            <p className="mt-1 leading-5">{error}</p>
          </div>
          {!profile && (
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                void loadProfile();
              }}
              className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-red-100"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {success && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-[#CBE0CF] bg-[#F0F7F1] p-4 text-sm text-[#174D38]">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {loading && !profile ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-[#E5E9E2] bg-white p-8 text-center">
          <LoaderCircle size={26} className="animate-spin text-[#174D38]" />
          <p className="mt-3 text-sm font-medium text-[#526057]">Loading your business profile</p>
        </div>
      ) : profile ? (
        <form onSubmit={handleSave} className="space-y-5">
          <section className="rounded-3xl border border-[#E5E9E2] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="font-semibold text-[#20372D]">Business details</h2>
              <p className="mt-1 text-sm leading-5 text-[#829087]">
                These details help identify your merchant account.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-[#34483A]">
                  Registered business name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  required
                  maxLength={150}
                  value={form.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  disabled={saving}
                  autoComplete="organization"
                  className="w-full rounded-xl border border-[#E1E7E0] px-3.5 py-3 text-sm outline-none transition focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10 disabled:bg-[#F6F8F5]"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="mb-1.5 block text-sm font-medium text-[#34483A]">
                  Business type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={form.businessType}
                  onChange={(event) => updateField("businessType", event.target.value as BusinessType)}
                  disabled={saving}
                  className="w-full rounded-xl border border-[#E1E7E0] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10 disabled:bg-[#F6F8F5]"
                >
                  <option value="individual">Individual merchant</option>
                  <option value="sole_proprietorship">Sole proprietorship</option>
                  <option value="company">Private limited company (PLC)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-[#34483A]">
                  Industry <span className="font-normal text-[#829087]">(optional)</span>
                </label>
                <input
                  id="industry"
                  name="industry"
                  maxLength={100}
                  value={form.industry}
                  onChange={(event) => updateField("industry", event.target.value)}
                  disabled={saving}
                  placeholder="e.g. Retail, hospitality"
                  className="w-full rounded-xl border border-[#E1E7E0] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10 disabled:bg-[#F6F8F5]"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#34483A]">
                  Account email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97A199]" />
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    aria-describedby="email-hint"
                    className="w-full rounded-xl border border-[#E1E7E0] bg-[#F6F8F5] py-3 pl-10 pr-3.5 text-sm text-[#718077]"
                  />
                </div>
                <p id="email-hint" className="mt-1.5 text-xs text-[#829087]">
                  Account email changes aren’t available here.
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#34483A]">
                  Contact phone <span className="font-normal text-[#829087]">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97A199]" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength={30}
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    disabled={saving}
                    autoComplete="tel"
                    placeholder="+251…"
                    className="w-full rounded-xl border border-[#E1E7E0] py-3 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10 disabled:bg-[#F6F8F5]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="websiteUrl" className="mb-1.5 block text-sm font-medium text-[#34483A]">
                  Business website <span className="font-normal text-[#829087]">(optional)</span>
                </label>
                <div className="relative">
                  <Globe2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97A199]" />
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    maxLength={255}
                    value={form.websiteUrl}
                    onChange={(event) => updateField("websiteUrl", event.target.value)}
                    disabled={saving}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-[#E1E7E0] py-3 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-[#A0AAA2] focus:border-[#6C967A] focus:ring-4 focus:ring-[#174D38]/10 disabled:bg-[#F6F8F5]"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-[#E5E9E2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-[#718077]" aria-live="polite">
              {isDirty ? "You have unsaved changes." : "Your profile is up to date."}
            </p>
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D38] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#103C2B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174D38] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving profile…" : "Save profile"}
            </button>
          </section>
        </form>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E9E2] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F6F2] text-[#527960]">
            <ShieldCheck size={20} />
          </div>
          <h2 className="mt-4 font-semibold text-[#20372D]">Payment accounts</h2>
          <p className="mt-1 text-sm leading-5 text-[#829087]">
            Receiving accounts aren’t managed in this profile yet. Confirm the
            beneficiary on the provider’s transaction record for each payment.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E9E2] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F6F2] text-[#527960]">
            <CircleHelp size={20} />
          </div>
          <h2 className="mt-4 font-semibold text-[#20372D]">Integrations &amp; alerts</h2>
          <p className="mt-1 text-sm leading-5 text-[#829087]">
            Manage API credentials and activity in the developer workspace. Webhook
            and notification preferences are not available in settings yet.
          </p>
          <Link
            to="/developer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#174D38] hover:underline"
          >
            Open developer workspace <ExternalLink size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
