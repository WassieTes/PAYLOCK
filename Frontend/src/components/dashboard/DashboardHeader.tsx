import { useState } from "react";
import {
  Activity,
  ChevronDown,
  House,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { MerchantProfile } from "../../types/verification";

interface Props {
  merchant: MerchantProfile | null;
  profileLoading: boolean;
  profileError: string;
  onMenuClick: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export default function DashboardHeader({
  merchant,
  profileLoading,
  profileError,
  onMenuClick,
  onRefresh,
  onSignOut,
}: Props) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E7EBE4] bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="text-sm text-[#87938B]">Merchant workspace</p>
          <h1 className="text-base font-semibold sm:text-lg">Overview</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/"
          aria-label="Go to PAYLOCK homepage"
          title="Go to homepage"
          className="inline-flex items-center gap-2 rounded-xl border border-[#E6EAE4] px-3 py-2.5 text-sm font-semibold text-[#526057] transition hover:bg-[#F6F8F5] hover:text-[#174D38]"
        >
          <House size={17} />
          <span className="hidden md:inline">Homepage</span>
        </Link>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh verification records"
          aria-label="Refresh verification records"
          className="rounded-xl border border-[#E6EAE4] p-2.5 text-[#64736A] transition hover:bg-[#F6F8F5]"
        >
          <Activity size={18} />
        </button>

        <div className="hidden h-8 w-px bg-[#E7EBE4] sm:block" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[#F6F8F5] sm:gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3ECE4] text-[#174D38]">
              <UserRound size={19} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-40 truncate text-sm font-semibold">
                {profileLoading
                  ? "Loading profile…"
                  : merchant?.businessName || "Your business"}
              </p>
              <p className="text-xs text-[#87938B]">Merchant account</p>
            </div>

            <ChevronDown size={15} className="hidden text-[#87938B] sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-[#E7EBE4] bg-white p-3 shadow-lg">
              <p className="truncate px-2 py-1 text-sm font-semibold">
                {merchant?.businessName || "Your business"}
              </p>

              {merchant?.email && (
                <p className="break-all px-2 pb-2 text-xs text-[#87938B]">
                  {merchant.email}
                </p>
              )}

              {profileError && (
                <p className="px-2 pb-2 text-xs text-red-600">
                  Profile unavailable
                </p>
              )}

              <button
                type="button"
                onClick={onSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
