import { Link, NavLink } from "react-router-dom";
import {
  CircleHelp,
  Code2,
  History,
  LayoutDashboard,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  reviewCount: number;
  onClose: () => void;
}

const navigation = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload receipt", icon: UploadCloud, path: "/dashboard/upload" },
  { label: "History", icon: History, path: "/dashboard/history" },
  { label: "Needs review", icon: ShieldAlert, path: "/dashboard/review" },
  { label: "API & webhooks", icon: Code2, path: "/developer" },
  { label: "Settings", icon: Settings2, path: "/dashboard/settings" },
  { label: "Help & support", icon: CircleHelp, path: "/dashboard/help" },
];

export default function DashboardSidebar({
  open,
  reviewCount,
  onClose,
}: Props) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E7EBE4] bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-[#EEF0EB] px-6">
          <Link
            to="/"
            aria-label="PAYLOCK home"
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#174D38]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#174D38] text-white">
              <ShieldCheck size={23} />
            </div>

            <span>
              <span className="block text-xl font-bold tracking-tight text-[#174D38]">
                PAYLOCK
              </span>
              <span className="block text-[11px] tracking-wide text-[#7A887F]">
                MERCHANT CONSOLE
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#97A199]">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon, path }) => {
              return (
                <NavLink
                  key={label}
                  to={path}
                  end={path === "/dashboard" || path === "/developer"}
                  onClick={onClose}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#EAF2EC] text-[#174D38]"
                      : "text-[#64736A] hover:bg-[#F6F8F5] hover:text-[#174D38]"
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{label}</span>

                      {label === "Needs review" && reviewCount > 0 && (
                        <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                          {reviewCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-[#F5F7F2] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#174D38]">
              <ShieldCheck size={19} />
            </div>
            <p className="text-sm font-semibold">Verify before releasing</p>
            <p className="mt-1 text-xs leading-5 text-[#718077]">
              A receipt screenshot alone does not confirm that money arrived.
            </p>
            <Link
              to="/developer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#174D38]"
            >
              Explore the API <Code2 size={13} />
            </Link>
          </div>

          <p className="mt-5 px-2 text-[11px] text-[#9AA49D]">
            PAYLOCK · Merchant workspace
          </p>
        </div>
      </aside>
    </>
  );
}
