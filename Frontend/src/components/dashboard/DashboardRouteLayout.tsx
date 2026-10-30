import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

interface Props {
  children: ReactNode;
}

export default function DashboardRouteLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#20372D] lg:pl-64">
      <DashboardSidebar
        open={sidebarOpen}
        reviewCount={0}
        onClose={() => setSidebarOpen(false)}
      />

      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-[#E7EBE4] bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-[#526057] hover:bg-[#F6F8F5]"
          aria-label="Open navigation"
          aria-expanded={sidebarOpen}
        >
          <Menu size={21} />
        </button>
        <span className="text-sm font-semibold text-[#174D38]">
          PAYLOCK Merchant Console
        </span>
      </header>

      {children}
    </div>
  );
}
