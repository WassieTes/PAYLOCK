import { AlertTriangle, FileImage, Search } from "lucide-react";

interface Props {
  type: "loading" | "error" | "empty" | "no-results";
  message?: string;
}

export default function DashboardEmptyState({ type, message }: Props) {
  if (type === "loading") {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-16 text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#DCE7DD] border-t-[#174D38]" />
          <p className="text-sm font-medium text-[#52655A]">
            Loading your verification records…
          </p>
        </td>
      </tr>
    );
  }

  if (type === "error") {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-16 text-center">
          <AlertTriangle size={26} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-[#304439]">
            Records are unavailable
          </p>
          <p className="mt-1 text-sm text-[#87938B]">
            {message || "Fix the API connection and refresh the dashboard."}
          </p>
        </td>
      </tr>
    );
  }

  const noResults = type === "no-results";

  return (
    <tr>
      <td colSpan={5} className="px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F0] text-[#62806A]">
          {noResults ? <Search size={25} /> : <FileImage size={25} />}
        </div>

        <p className="text-sm font-semibold text-[#304439]">
          {noResults ? "No matching records" : "No verification records yet"}
        </p>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#87938B]">
          {message ||
            (noResults
              ? "Try changing your search or status filter."
              : "When your backend stores verification records for your account, they will appear here.")}
        </p>
      </td>
    </tr>
  );
}
