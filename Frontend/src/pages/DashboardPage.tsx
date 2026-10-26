import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import PaymentSecurityNotice from "../components/dashboard/PaymentSecurityNotice";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import RecentVerifications from "../components/dashboard/RecentVerifications";

import type { MerchantProfile, Verification } from "../types/verification";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

type VerificationResponse =
  | Verification[]
  | {
      data?: Verification[];
      items?: Verification[];
      verifications?: Verification[];
    };

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong while loading your data.";
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const signOut = useCallback(() => {
    localStorage.removeItem("paylock_access_token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadVerifications = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("paylock_access_token");

    if (!token) {
      signOut();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verifications`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        signOut();
        return;
      }

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "The verification-list API endpoint has not been implemented yet."
            : `Could not load verification records (HTTP ${response.status}).`,
        );
      }

      const result: VerificationResponse = await response.json();

      const records = Array.isArray(result)
        ? result
        : (result.data ?? result.items ?? result.verifications);

      if (!Array.isArray(records)) {
        throw new Error(
          "Unexpected API response. Expected a list of verification records.",
        );
      }

      setVerifications(records);
    } catch (err) {
      setVerifications([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");

    const token = localStorage.getItem("paylock_access_token");

    if (!token) {
      signOut();
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
        signOut();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load merchant profile (HTTP ${response.status}).`,
        );
      }

      const result = await response.json();
      setMerchant(result.data ?? result.merchant ?? result);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    void loadVerifications();
    void loadProfile();
  }, [loadVerifications, loadProfile]);

  function handleFileSelected(file: File) {
    navigate("/dashboard/upload", {
      state: { selectedFileName: file.name },
    });
  }

  const reviewCount = verifications.filter((item) =>
    ["needs_review", "review", "flagged", "suspicious"].includes(
      item.status.toLowerCase(),
    ),
  ).length;

  const businessName = profileLoading
    ? "merchant"
    : merchant?.businessName || "merchant";

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#20372D]">
      <DashboardSidebar
        open={sidebarOpen}
        reviewCount={reviewCount}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <DashboardHeader
          merchant={merchant}
          profileLoading={profileLoading}
          profileError={profileError}
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={() => void loadVerifications()}
          onSignOut={signOut}
        />

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9">
          <DashboardWelcome
            businessName={businessName}
            onFileSelected={handleFileSelected}
            onRefresh={() => void loadVerifications()}
          />

          <PaymentSecurityNotice />

          {error && (
            <div
              role="alert"
              className="mb-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <p className="font-semibold">
                Could not load verification records
              </p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <DashboardMetrics verifications={verifications} loading={loading} />

          <RecentVerifications
            verifications={verifications}
            loading={loading}
            error={error}
            onRetry={() => void loadVerifications()}
            onUpload={() => navigate("/dashboard/upload")}
          />

          <footer className="mt-7 flex flex-col justify-between gap-2 pb-5 text-xs text-[#98A199] sm:flex-row">
            <p>PAYLOCK · Payment verification and fraud prevention</p>
            <p>Protect every order with verified payment information.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
