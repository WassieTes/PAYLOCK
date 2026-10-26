import { useRef } from "react";
import { Activity, UploadCloud } from "lucide-react";

interface Props {
  businessName: string;
  onFileSelected: (file: File) => void;
  onRefresh: () => void;
}

export default function DashboardWelcome({
  businessName,
  onFileSelected,
  onRefresh,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D8C81]">
          Your payment security
        </p>

        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome, {businessName}
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#7B887F]">
          Monitor your payment verification activity and review transactions
          that need your attention.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE4DB] bg-white px-4 py-3 text-sm font-semibold text-[#294738] transition hover:bg-[#F5F7F2]"
        >
          <Activity size={17} />
          Refresh
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D38] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103C2B]"
        >
          <UploadCloud size={17} />
          Upload receipt
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onFileSelected(file);
            }

            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
